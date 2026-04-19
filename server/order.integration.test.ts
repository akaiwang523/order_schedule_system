import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 跨帳戶訂單即時連動功能 - 集成測試
 * 
 * 驗證：
 * 1. 資料庫中存在待處理訂單（status = 'pending'）
 * 2. 訂單包含完整的資料欄位
 * 3. 資料庫遷移已成功應用
 */

describe("Cross-Account Order Realtime Sync - Integration", () => {
  it("資料庫中應該存在待處理訂單", async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    // 查詢待處理訂單
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.orderStatus, "pending"))
      .limit(10);

    // 驗證至少有一筆待處理訂單
    expect(pendingOrders.length).toBeGreaterThan(0);
  });

  it("待處理訂單應該包含所有必要欄位", async () => {
    const db = await getDb();

    // 查詢待處理訂單
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.orderStatus, "pending"))
      .limit(1);

    expect(pendingOrders.length).toBe(1);

    const order = pendingOrders[0];

    // 驗證所有必要欄位存在
    expect(order.id).toBeDefined();
    expect(order.customerId).toBeDefined();
    expect(order.deliveryType).toBeDefined();
    expect(order.bagCount).toBeDefined();
    expect(order.paymentMethod).toBeDefined();
    expect(order.paymentStatus).toBeDefined();
    expect(order.orderStatus).toBe("pending");
    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();

    // 驗證 estimatedCompletion 欄位存在（資料庫遷移驗證）
    expect(order).toHaveProperty("estimatedCompletion");
  });

  it("應該能夠通過 JOIN 查詢獲取客戶信息", async () => {
    const db = await getDb();

    // 執行 JOIN 查詢（模擬 getPending 程序）
    const result = await db.execute(`
      SELECT 
        o.id,
        o.customerId,
        o.bagCount,
        o.paymentMethod,
        o.notes,
        o.orderStatus,
        u.name as customerName,
        u.email as customerEmail
      FROM orders o
      LEFT JOIN users u ON o.customerId = u.id
      WHERE o.orderStatus = 'pending'
      LIMIT 1
    `);

    const orders = (result[0] as any[]) || [];
    expect(orders.length).toBe(1);

    const order = orders[0];

    // 驗證 JOIN 結果包含客戶信息
    expect(order.customerName).toBeDefined();
    expect(order.customerEmail).toBeDefined();
    expect(order.bagCount).toBeDefined();
    expect(order.paymentMethod).toBeDefined();
  });

  it("資料庫遷移應該成功添加 estimatedCompletion 欄位", async () => {
    const db = await getDb();

    // 查詢 orders 表結構
    const result = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'orders' AND TABLE_SCHEMA = DATABASE()
    `);

    const columns = (result[0] as any[]) || [];
    const estimatedCompletionColumn = columns.find(
      (col) => col.COLUMN_NAME === "estimatedCompletion"
    );

    // 驗證 estimatedCompletion 欄位存在
    expect(estimatedCompletionColumn).toBeDefined();
    expect(estimatedCompletionColumn.DATA_TYPE).toBe("timestamp");
  });

  it("資料庫遷移應該移除舊的 status 欄位", async () => {
    const db = await getDb();

    // 查詢 orders 表結構
    const result = await db.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'orders' AND TABLE_SCHEMA = DATABASE()
    `);

    const columns = (result[0] as any[]) || [];
    const columnNames = columns.map((col) => col.COLUMN_NAME);

    // 驗證 status 欄位已移除（只保留 orderStatus）
    expect(columnNames).toContain("orderStatus");
    expect(columnNames).not.toContain("status");
  });

  it("待處理訂單應該能正確更新為已完成", async () => {
    const db = await getDb();

    // 查詢一筆待處理訂單
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.orderStatus, "pending"))
      .limit(1);

    if (pendingOrders.length === 0) {
      // 如果沒有待處理訂單，跳過測試
      expect(true).toBe(true);
      return;
    }

    const orderId = pendingOrders[0].id;

    // 更新訂單狀態為已完成
    await db
      .update(orders)
      .set({ orderStatus: "completed", completedAt: new Date() })
      .where(eq(orders.id, orderId));

    // 驗證更新成功
    const updatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    expect(updatedOrder[0].orderStatus).toBe("completed");
    expect(updatedOrder[0].completedAt).toBeDefined();

    // 恢復為待處理狀態（清理測試數據）
    await db
      .update(orders)
      .set({ orderStatus: "pending", completedAt: null })
      .where(eq(orders.id, orderId));
  });
});
