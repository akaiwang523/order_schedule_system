import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.log('Database connection failed');
  process.exit(1);
}

try {
  // Check if password column exists
  const result = await db.execute(sql`SHOW COLUMNS FROM users WHERE Field = 'password'`);
  
  if (result.length === 0) {
    console.log('Adding password column to users table...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN password varchar(255) AFTER loginMethod`);
    console.log('✅ Password column added successfully');
  } else {
    console.log('✅ Password column already exists');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
