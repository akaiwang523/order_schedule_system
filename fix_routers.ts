import fs from 'fs';

const filePath = './server/routers.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// 修復 order.create 邏輯
const oldCode = `      .mutation(async ({ ctx, input }) => {
        // 確保 customer 記錄存在，並獲取 customerId
        let customerId: number;
        const existing = await getCustomerByUserId(ctx.user.id);
        if (existing) {
          customerId = existing.id;
        } else {
          // 自動為用戶創建 customer 記錄
          customerId = await upsertCustomer(ctx.user.id, {
            fullName: ctx.user.name || "User",
            phone: "",
            address: "",
          });
        }

        const orderId = await createOrder({
          customerId: customerId,`;

const newCode = `      .mutation(async ({ ctx, input }) => {
        // 確保 customer 記錄存在（用於存儲客戶信息）
        const existing = await getCustomerByUserId(ctx.user.id);
        if (!existing) {
          // 自動為用戶創建 customer 記錄
          await upsertCustomer(ctx.user.id, {
            fullName: ctx.user.name || "User",
            phone: "",
            address: "",
          });
        }

        // 直接使用 userId 作為 customerId（因為外鍵指向 users.id）
        const orderId = await createOrder({
          customerId: ctx.user.id,`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Fixed order.create logic');
