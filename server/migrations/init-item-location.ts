/**
 * 一次性初始化遷移腳本
 * 添加 itemLocation 欄位到 orders 表以支持衣物放置地點
 * 在應用啟動時自動執行
 */

import { getDb } from '../db';

export async function initializeItemLocationColumn() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Migration] Database not available, skipping itemLocation initialization');
      return;
    }

    console.log('[Migration] Starting itemLocation column initialization...');
    
    // 檢查欄位是否存在
    try {
      const result = await db.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='orders' AND COLUMN_NAME='itemLocation'
      `);
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log('[Migration] ✅ itemLocation column already exists');
        return;
      }
    } catch (checkError) {
      // 繼續執行添加
    }

    // 添加欄位
    try {
      await db.execute(`
        ALTER TABLE orders 
        ADD COLUMN itemLocation ENUM('lobby', 'door', 'other') DEFAULT NULL 
        AFTER notes
      `);
      console.log('[Migration] ✅ itemLocation column added successfully');
    } catch (addError: any) {
      if (addError.code === 'ER_DUP_FIELDNAME') {
        console.log('[Migration] ✅ itemLocation column already exists');
      } else {
        throw addError;
      }
    }
  } catch (error) {
    console.error('[Migration] Error during itemLocation initialization:', error);
    // 不拋出錯誤，讓應用繼續運行
  }
}
