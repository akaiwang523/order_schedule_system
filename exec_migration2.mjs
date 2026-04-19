import { getDb } from './server/db.ts';

async function runMigration() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    console.log('執行遷移 SQL...');
    
    // 先檢查欄位是否已存在
    const checkOrderNumber = await db.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME='orderNumber'`);
    if ((checkOrderNumber[0] as any[]).length === 0) {
      await db.execute(`ALTER TABLE \`orders\` ADD \`orderNumber\` varchar(20)`);
      console.log('✓ 添加 orderNumber 欄位');
    } else {
      console.log('✓ orderNumber 欄位已存在');
    }
    
    const checkProgress = await db.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME='progress'`);
    if ((checkProgress[0] as any[]).length === 0) {
      await db.execute(`ALTER TABLE \`orders\` ADD \`progress\` enum('pending','received','washing','returning','completed') DEFAULT 'pending' NOT NULL`);
      console.log('✓ 添加 progress 欄位');
    } else {
      console.log('✓ progress 欄位已存在');
    }
    
    console.log('\n✅ 遷移成功完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  }
}

runMigration();
