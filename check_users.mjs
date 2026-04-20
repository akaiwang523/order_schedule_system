import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.log('Database connection failed');
  process.exit(1);
}

const result = await db.execute(sql`DESCRIBE users`);
console.log('Users table structure:');
console.log(result);
