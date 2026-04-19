import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL!);

const result = await db.execute(`DESCRIBE orders`);
console.log("Orders table structure:");
console.log(JSON.stringify(result[0], null, 2));
process.exit(0);
