import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL!);

// 執行原始 SQL 查詢以檢查 orders 表的結構
const result = await db.execute(`DESCRIBE orders`);
console.log("Orders table schema:");
console.log(JSON.stringify(result, null, 2));
process.exit(0);
