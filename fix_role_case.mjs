import fs from 'fs';

const file = './client/src/_core/hooks/useAuth.ts';
let content = fs.readFileSync(file, 'utf-8');

// 移除 role 大寫轉換
content = content.replace(
  `        // 確保 role 是大寫
        if (userData.role) {
          userData.role = userData.role.toUpperCase();
        }`,
  `        // 保持 role 小寫以匹配後端`
);

content = content.replace(
  `            // 確保 role 是大寫
            if (userData.role) {
              userData.role = userData.role.toUpperCase();
            }`,
  `            // 保持 role 小寫以匹配後端`
);

fs.writeFileSync(file, content);
console.log('✅ useAuth.ts role 大小寫已修復');
