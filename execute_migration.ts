import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

console.log("🔧 開始執行資料庫遷移...\n");

try {
  // 1. 添加 estimatedCompletion 欄位
  console.log("1️⃣  添加 estimatedCompletion 欄位...");
  await db.execute(sql`ALTER TABLE orders ADD COLUMN estimatedCompletion timestamp NULL`);
  console.log("   ✅ 成功添加 estimatedCompletion 欄位\n");
} catch (error: any) {
  if (error.message?.includes("Duplicate column name")) {
    console.log("   ⚠️  estimatedCompletion 欄位已存在\n");
  } else {
    console.log(`   ❌ 錯誤: ${error.message}\n`);
  }
}

try {
  // 2. 刪除 status 欄位
  console.log("2️⃣  刪除 status 欄位...");
  await db.execute(sql`ALTER TABLE orders DROP COLUMN status`);
  console.log("   ✅ 成功刪除 status 欄位\n");
} catch (error: any) {
  if (error.message?.includes("can't DROP")) {
    console.log("   ⚠️  status 欄位不存在或無法刪除\n");
  } else {
    console.log(`   ❌ 錯誤: ${error.message}\n`);
  }
}

// 3. 驗證遷移結果
console.log("3️⃣  驗證遷移結果...");
const result = await db.execute(sql`DESCRIBE orders`);
const fields = (result[0] as any[]).map((f: any) => f.Field);

console.log("   Orders 表欄位：");
fields.forEach((field: string) => {
  console.log(`   - ${field}`);
});

const hasEstimatedCompletion = fields.includes('estimatedCompletion');
const hasStatus = fields.includes('status');

console.log("\n✅ 遷移驗證結果：");
console.log(`   - estimatedCompletion: ${hasEstimatedCompletion ? '✅ 存在' : '❌ 缺失'}`);
console.log(`   - status: ${hasStatus ? '❌ 仍存在' : '✅ 已刪除'}`);

process.exit(0);
