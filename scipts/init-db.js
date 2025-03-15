// scripts/init-db.js
const { generateSQLiteDatabase } = require('../lib/generate-sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'blog.db');

async function setup() {
  try {
    // 确保db目录存在
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log(`创建数据库目录: ${DB_DIR}`);
    }

    // 检查已有数据库文件
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.statSync(DB_PATH);
      console.log(`数据库已存在，大小: ${(stats.size / 1024).toFixed(2)} KB`);
      return;
    }

    // 生成数据库
    console.log('开始生成数据库...');
    await generateSQLiteDatabase();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

setup();