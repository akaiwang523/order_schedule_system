import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 查詢所有訂單，按 createdAt 排序
const [rows] = await conn.query(`
  SELECT id, createdAt, customerId 
  FROM orders 
  ORDER BY createdAt ASC, id ASC
`);

// 按日期分組
const dateGroups = {};
rows.forEach(row => {
  const dateStr = row.createdAt.toISOString().split('T')[0];
  if (!dateGroups[dateStr]) {
    dateGroups[dateStr] = [];
  }
  dateGroups[dateStr].push(row);
});

// 生成 SQL 更新語句
let sql = '';
Object.entries(dateGroups).forEach(([date, orders]) => {
  const [year, month, day] = date.split('-');
  const yy = year.slice(-2);
  const datePrefix = `${yy}${month}${day}`;
  
  orders.forEach((order, index) => {
    const orderNumber = `${datePrefix}-${String(index + 1).padStart(2, '0')}`;
    sql += `UPDATE orders SET orderNumber = '${orderNumber}' WHERE id = ${order.id};\n`;
  });
});

console.log(sql);
await conn.end();
