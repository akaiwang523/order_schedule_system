import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL!);

const result = await db.execute(`DESCRIBE orders`);
const fields = (result[0] as any[]).map((f: any) => f.Field);

console.log("✅ Orders table fields after migration:");
console.log(JSON.stringify(fields, null, 2));

// 檢查關鍵欄位
const hasEstimatedCompletion = fields.includes('estimatedCompletion');
const hasStatus = fields.includes('status');

console.log("\n✅ 遷移驗證結果：");
console.log(`- estimatedCompletion 欄位: ${hasEstimatedCompletion ? '✅ 存在' : '❌ 缺失'}`);
console.log(`- status 欄位: ${hasStatus ? '❌ 仍然存在（應該刪除）' : '✅ 已刪除'}`);

process.exit(0);
