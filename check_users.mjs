import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(users);
console.log("Users in database:", JSON.stringify(result, null, 2));
