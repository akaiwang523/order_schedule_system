import { getDb } from './server/db.ts';

async function runMigration() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    console.log('執行遷移 SQL...');
    
    // 執行遷移
    await db.execute(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`orders_customerId_customers_id_fk\``);
    console.log('✓ 移除舊的外鍵約束');
    
    await db.execute(`ALTER TABLE \`orders\` ADD \`orderNumber\` varchar(20)`);
    console.log('✓ 添加 orderNumber 欄位');
    
    await db.execute(`ALTER TABLE \`orders\` ADD \`progress\` enum('pending','received','washing','returning','completed') DEFAULT 'pending' NOT NULL`);
    console.log('✓ 添加 progress 欄位');
    
    await db.execute(`ALTER TABLE \`orders\` ADD CONSTRAINT \`orders_customerId_users_id_fk\` FOREIGN KEY (\`customerId\`) REFERENCES \`users\`(\`id\`) ON DELETE no action ON UPDATE no action`);
    console.log('✓ 添加新的外鍵約束');
    
    console.log('\n✅ 遷移成功完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  }
}

runMigration();
