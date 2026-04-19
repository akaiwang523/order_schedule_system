import { drizzle } from "drizzle-orm/mysql2";
import { users, orders } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

console.log("=" .repeat(80));
console.log("📋 任務 1: 查詢 users 表所有資料");
console.log("=" .repeat(80));

const allUsers = await db.select().from(users);
console.log("\n✅ Users 表資料：\n");
allUsers.forEach((user: any, index: number) => {
  console.log(`${index + 1}. ID: ${user.id} | 名稱: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
});

console.log("\n" + "=" .repeat(80));
console.log("📋 任務 2: 查詢 orders 表最近三筆資料");
console.log("=" .repeat(80));

const recentOrders = await db.select().from(orders).orderBy((o) => o.id).limit(3);
console.log("\n✅ Orders 表最近三筆資料：\n");
recentOrders.forEach((order: any, index: number) => {
  console.log(`${index + 1}. 訂單 ID: ${order.id}`);
  console.log(`   客戶 ID: ${order.customerId}`);
  console.log(`   送件方式: ${order.deliveryType}`);
  console.log(`   袋數: ${order.bagCount}`);
  console.log(`   支付方式: ${order.paymentMethod}`);
  console.log(`   支付狀態: ${order.paymentStatus}`);
  console.log(`   訂單狀態: ${order.orderStatus}`);
  console.log(`   備註: ${order.notes || '無'}`);
  console.log(`   建立時間: ${order.createdAt}`);
  console.log("");
});

console.log("=" .repeat(80));
console.log("📋 任務 3: 檢查登入用戶帳號 role");
console.log("=" .repeat(80));

// 假設登入用戶是 ID 1 (Chen)
const currentUser = allUsers.find((u: any) => u.id === 1);
if (currentUser) {
  console.log(`\n✅ 當前用戶: ${currentUser.name}`);
  console.log(`   Email: ${currentUser.email}`);
  console.log(`   Role: ${currentUser.role}`);
  
  if (currentUser.role !== 'admin') {
    console.log(`\n⚠️  Role 不是 admin，需要修改...`);
  } else {
    console.log(`\n✅ Role 已經是 admin，無需修改`);
  }
}

process.exit(0);
