# 數據庫遷移指南

## 問題
當前資料庫結構與代碼不同步。orders 表缺少 `estimatedCompletion` 欄位，導致新增訂單功能失敗。

## 解決方案
需要執行以下 SQL 遷移語句來同步資料庫結構。

### 執行步驟

1. **進入 Manus 管理界面**
   - 打開 Manus 平台的管理 UI
   - 找到「數據庫」或「SQL 執行」工具

2. **執行以下 SQL 語句**（按順序執行）

```sql
-- 添加主鍵
ALTER TABLE `customers` ADD PRIMARY KEY(`id`);
ALTER TABLE `orders` ADD PRIMARY KEY(`id`);
ALTER TABLE `schedules` ADD PRIMARY KEY(`id`);
ALTER TABLE `users` ADD PRIMARY KEY(`id`);

-- 添加 estimatedCompletion 欄位
ALTER TABLE `orders` ADD `estimatedCompletion` timestamp;

-- 添加外鍵約束
ALTER TABLE `customers` ADD CONSTRAINT `customers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;

-- 添加唯一索引
CREATE INDEX `customers_userId_unique` ON `customers` (`userId`);

-- 移除重複的欄位
ALTER TABLE `orders` DROP COLUMN `status`;
ALTER TABLE `orders` DROP COLUMN `estimatedCompletionDate`;
```

### 驗證遷移是否成功

執行以下查詢檢查 orders 表結構：

```sql
DESCRIBE orders;
```

應該看到以下欄位（不包括舊的 `status` 和 `estimatedCompletionDate`）：
- id
- customerId
- deliveryType
- bagCount
- paymentMethod
- paymentStatus
- notes
- orderStatus
- **estimatedCompletion** ← 新欄位
- createdAt
- updatedAt
- completedAt

### 遷移後

遷移完成後，新增訂單功能應該能正常工作。

## 代碼更改

已更新的代碼文件：
- `server/routers.ts` - order.create 程序使用 ctx.user.id
- `server/db.ts` - 查詢函數使用 estimatedCompletion 欄位
- `client/src/pages/CustomerNewOrder.tsx` - 前端表單邏輯

## 已知問題

1. **localStorage 中的舊 token** - 已通過清除 localStorage 解決
2. **Bearer token 認證** - 系統支持 `Authorization: Bearer token_<userId>` 用於測試
3. **customerId 映射** - 已修改為直接使用 userId（簡化了關係）
