import { drizzle } from "drizzle-orm/mysql2";
import { orders, users } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

console.log("=" .repeat(80));
console.log("📋 查詢 orders 表最近三筆資料");
console.log("=" .repeat(80));

const recentOrders = await db.select().from(orders).orderBy((o) => o.id).limit(3);

if (recentOrders.length === 0) {
  console.log("\n❌ Orders 表中沒有資料\n");
} else {
  console.log(`\n✅ 找到 ${recentOrders.length} 筆訂單資料：\n`);
  
  for (const order of recentOrders) {
    // 查詢客戶信息
    const customer = await db.select().from(users).where(eq(users.id, order.customerId)).limit(1);
    const customerName = customer.length > 0 ? customer[0].name : '未知';
    
    console.log(`訂單 #${order.id}`);
    console.log(`  客戶 ID: ${order.customerId} (${customerName})`);
    console.log(`  送件方式: ${order.deliveryType}`);
    console.log(`  袋數: ${order.bagCount}`);
    console.log(`  支付方式: ${order.paymentMethod}`);
    console.log(`  支付狀態: ${order.paymentStatus}`);
    console.log(`  訂單狀態: ${order.orderStatus}`);
    console.log(`  備註: ${order.notes || '無'}`);
    console.log(`  預計完成: ${order.estimatedCompletion || '未設定'}`);
    console.log(`  建立時間: ${order.createdAt}`);
    console.log("");
  }
}

process.exit(0);
