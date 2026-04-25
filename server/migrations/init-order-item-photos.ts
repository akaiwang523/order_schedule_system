/**
 * 一次性初始化遷移腳本
 * 建立 orderItemPhotos 表以支持多張照片持久化
 * 在應用啟動時自動執行
 */

import { getDb } from '../db';

export async function initializeOrderItemPhotosTable() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Migration] Database not available, skipping orderItemPhotos initialization');
      return;
    }

    console.log('[Migration] Starting orderItemPhotos table initialization...');
    
    // 直接嘗試建立表
    // 使用 IF NOT EXISTS 避免重複建立
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS orderItemPhotos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          itemId INT NOT NULL,
          photoUrl TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          KEY idx_itemId (itemId),
          CONSTRAINT fk_orderItemPhotos_itemId FOREIGN KEY (itemId) REFERENCES orderItems(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('[Migration] ✅ orderItemPhotos table ensured successfully');
    } catch (createError: any) {
      if (createError.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('[Migration] ✅ orderItemPhotos table already exists');
      } else {
        throw createError;
      }
    }
  } catch (error) {
    console.error('[Migration] Error during orderItemPhotos initialization:', error);
    // 不拋出錯誤，讓應用繼續運行
  }
}
