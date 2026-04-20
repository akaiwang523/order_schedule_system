import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laundry',
});

// 查詢 orders 表的結構
const [columns] = await connection.query('DESCRIBE orders');
console.log('Orders table columns:');
columns.forEach(col => {
  if (col.Field === 'progress') {
    console.log(`  ${col.Field}: ${col.Type} (Key: ${col.Key}, Null: ${col.Null}, Default: ${col.Default})`);
  }
});

// 查詢第一個訂單的進度
const [rows] = await connection.query('SELECT id, progress FROM orders LIMIT 1');
console.log('\nFirst order progress:', rows[0]);

connection.end();
