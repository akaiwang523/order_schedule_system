import { getDb } from './server/db';
import mysql from 'mysql2/promise';

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    const [columns] = await conn.execute('DESCRIBE orders');
    const columnNames = (columns as any[]).map(c => c.Field);
    console.log('Current columns:', columnNames.join(', '));
    
    if (!columnNames.includes('status')) {
      await conn.execute('ALTER TABLE orders ADD COLUMN status ENUM("pending","completed") NOT NULL DEFAULT "pending"');
      console.log('✓ Added status column');
    }
    
    if (!columnNames.includes('completedAt')) {
      await conn.execute('ALTER TABLE orders ADD COLUMN completedAt TIMESTAMP NULL');
      console.log('✓ Added completedAt column');
    }
    
    console.log('Database fixed successfully!');
  } catch (error) {
    console.error('Error:', (error as any).message);
  } finally {
    await conn.end();
  }
}

main().then(() => process.exit(0));
