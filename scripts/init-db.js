const { generateSQLiteDatabase } = require('../lib/generate-sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'blog.db');

async function setup() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log(`创建数据库目录: ${DB_DIR}`);
    }

    // 删除现有数据库（可选）
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`已删除旧数据库: ${DB_PATH}`);
    }

    console.log('开始生成数据库...');
    await generateSQLiteDatabase();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

setup();