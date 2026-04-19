import { getDb } from './server/db.ts';
import { orders } from './drizzle/schema.ts';

const db = await getDb();
if (!db) {
  console.error('Database not available');
  process.exit(1);
}

// 查詢第一個訂單的進度
const result = await db.select({
  id: orders.id,
  orderNumber: orders.orderNumber,
  progress: orders.progress,
}).from(orders).limit(1);

console.log('First order progress:', result);

// 嘗試更新進度
try {
  const updateResult = await db.update(orders).set({
    progress: 'received',
  }).where(orders.id === result[0]?.id);
  console.log('Update result:', updateResult);
} catch (error) {
  console.error('Update error:', error.message);
}
