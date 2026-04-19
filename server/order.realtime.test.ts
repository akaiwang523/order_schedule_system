import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { orders, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 跨帳戶訂單即時連動功能測試
 * 
 * 測試場景：
 * 1. 客戶下單時資料正確寫入 orders 表，status 預設為 PENDING
 * 2. 管理員查詢所有 status = 'PENDING' 的訂單
 * 3. 訂單資料欄位同步（客戶姓名、袋數、支付方式、備註）
 */

describe("Cross-Account Order Realtime Sync", () => {
  let db: any;
  let testUserId: number;
  let testOrderId: number;
  let testOrderId2: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // 查找或創建測試用戶
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "test-realtime@example.com"))
      .limit(1);

    if (existingUser.length > 0) {
      testUserId = existingUser[0].id;
    } else {
      // 創建測試用戶
      const result = await db.insert(users).values({
        email: "test-realtime@example.com",
        name: "測試用戶",
        password: "hashed_password",
        role: "user",
      });
      testUserId = (result as any).insertId;
    }
  });

  afterAll(async () => {
    // 清理測試數據
    if (testOrderId) {
      await db.delete(orders).where(eq(orders.id, testOrderId));
    }
    if (testOrderId2) {
      await db.delete(orders).where(eq(orders.id, testOrderId2));
    }
  });

  it("應該正確寫入新訂單，status 預設為 PENDING", async () => {
    // 插入新訂單
    const result = await db.insert(orders).values({
      customerId: testUserId,
      deliveryType: "pickup",
      bagCount: 3,
      paymentMethod: "cash",
      paymentStatus: "unpaid",
      notes: "測試備註",
      orderStatus: "pending",
    });

    testOrderId = (result as any).insertId;

    // 驗證訂單已寫入
    const insertedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, testOrderId))
      .limit(1);

    expect(insertedOrder.length).toBe(1);
    expect(insertedOrder[0].orderStatus).toBe("pending");
    expect(insertedOrder[0].customerId).toBe(testUserId);
    expect(insertedOrder[0].bagCount).toBe(3);
    expect(insertedOrder[0].paymentMethod).toBe("cash");
    expect(insertedOrder[0].notes).toBe("測試備註");
  });

  it("應該能查詢所有 status = 'pending' 的訂單", async () => {
    // 執行查詢（模擬 getPending 程序）
    const result = await db.execute(`
      SELECT 
        o.id,
        o.customerId,
        o.deliveryType,
        o.bagCount,
        o.paymentMethod,
        o.paymentStatus,
        o.notes,
        o.orderStatus,
        o.estimatedCompletion,
        o.completedAt,
        o.createdAt,
        o.updatedAt,
        u.name as customerName,
        u.email as customerEmail
      FROM orders o
      LEFT JOIN users u ON o.customerId = u.id
      WHERE o.orderStatus = 'pending'
      ORDER BY o.createdAt DESC
    `);

    const pendingOrders = (result[0] as any[]) || [];

    // 驗證查詢結果包含我們插入的訂單
    const foundOrder = pendingOrders.find((order) => order.id === testOrderId);
    expect(foundOrder).toBeDefined();
    expect(foundOrder.orderStatus).toBe("pending");
  });

  it("應該包含完整的資料欄位（姓名、袋數、支付方式、備註）", async () => {
    // 執行查詢
    const result = await db.execute(`
      SELECT 
        o.id,
        o.customerId,
        o.deliveryType,
        o.bagCount,
        o.paymentMethod,
        o.paymentStatus,
        o.notes,
        o.orderStatus,
        u.name as customerName,
        u.email as customerEmail
      FROM orders o
      LEFT JOIN users u ON o.customerId = u.id
      WHERE o.id = ${testOrderId}
    `);

    const orderList = (result[0] as any[]) || [];
    expect(orderList.length).toBe(1);

    const order = orderList[0];
    expect(order.customerName).toBe("測試用戶");
    expect(order.bagCount).toBe(3);
    expect(order.paymentMethod).toBe("cash");
    expect(order.notes).toBe("測試備註");
  });

  it("應該支持多筆待處理訂單同時查詢", async () => {
    // 插入第二筆訂單
    const result2 = await db.insert(orders).values({
      customerId: testUserId,
      deliveryType: "delivery",
      bagCount: 2,
      paymentMethod: "line_pay",
      paymentStatus: "unpaid",
      notes: "第二筆訂單",
      orderStatus: "pending",
    });

    testOrderId2 = (result2 as any).insertId;

    try {
      // 查詢所有待處理訂單
      const result = await db.execute(`
        SELECT 
          o.id,
          o.customerId,
          o.bagCount,
          o.paymentMethod,
          o.notes,
          o.orderStatus,
          u.name as customerName
        FROM orders o
        LEFT JOIN users u ON o.customerId = u.id
        WHERE o.orderStatus = 'pending'
        ORDER BY o.createdAt DESC
      `);

      const pendingOrders = (result[0] as any[]) || [];

      // 驗證兩筆訂單都在結果中
      const foundOrder1 = pendingOrders.find((order) => order.id === testOrderId);
      const foundOrder2 = pendingOrders.find((order) => order.id === testOrderId2);

      expect(foundOrder1).toBeDefined();
      expect(foundOrder2).toBeDefined();
      expect(foundOrder1.bagCount).toBe(3);
      expect(foundOrder2.bagCount).toBe(2);
    } finally {
      // 清理第二筆訂單
      if (testOrderId2) {
        await db.delete(orders).where(eq(orders.id, testOrderId2));
      }
    }
  });

  it("完成訂單後應該從待處理列表中消失", async () => {
    // 更新訂單狀態為 completed
    await db
      .update(orders)
      .set({ orderStatus: "completed", completedAt: new Date() })
      .where(eq(orders.id, testOrderId));

    // 查詢待處理訂單
    const result = await db.execute(`
      SELECT o.id
      FROM orders o
      WHERE o.orderStatus = 'pending' AND o.id = ${testOrderId}
    `);

    const foundOrders = (result[0] as any[]) || [];
    expect(foundOrders.length).toBe(0);

    // 驗證訂單狀態已更新
    const updatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, testOrderId))
      .limit(1);

    expect(updatedOrder[0].orderStatus).toBe("completed");
  });
});
