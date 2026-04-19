import fs from 'fs';

const file = './server/routers.ts';
let content = fs.readFileSync(file, 'utf-8');

// 修復 updateProgress 使用正確的 Drizzle API
const oldCode = `        // 更新訂單進度
        await db.execute(\`
          UPDATE orders 
          SET progress = ?, updatedAt = NOW()
          WHERE id = ?
        \`, [input.progress, input.orderId]);`;

const newCode = `        // 使用 Drizzle query builder 更新訂單進度
        await db.update(orders).set({
          progress: input.progress,
          updatedAt: new Date(),
        }).where(eq(orders.id, input.orderId));`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(file, content);
console.log('✅ updateProgress 已修復');
