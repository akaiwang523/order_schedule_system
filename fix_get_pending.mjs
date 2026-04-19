import fs from 'fs';

const file = './server/db.ts';
let content = fs.readFileSync(file, 'utf-8');

// 修復 getPending 添加 progress 和 orderNumber
const oldCode = `    .select({
      id: orders.id,
      customerId: orders.customerId,
      customerName: users.name,
      customerEmail: users.email,
      bagCount: orders.bagCount,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      notes: orders.notes,
      orderStatus: orders.orderStatus,
      createdAt: orders.createdAt,
    })`;

const newCode = `    .select({
      id: orders.id,
      customerId: orders.customerId,
      customerName: users.name,
      customerEmail: users.email,
      bagCount: orders.bagCount,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      notes: orders.notes,
      orderStatus: orders.orderStatus,
      progress: orders.progress,
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
    })`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(file, content);
console.log('✅ getPending 已修復');
