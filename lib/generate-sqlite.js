// lib/generate-sqlite.js
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const matter = require("gray-matter");

let jieba;
try {
  jieba = require("jieba-wasm"); // 直接 require
} catch (error) {
  console.error("加载 jieba-wasm 失败:", error.message);
  throw new Error("无法初始化 jieba-wasm，请检查依赖安装");
}

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DB_DIR = path.join(PROJECT_ROOT, "db");
const DB_PATH = path.join(DB_DIR, "blog.db");
const POSTS_DIR = path.join(PROJECT_ROOT, "content");

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warn: (msg) => console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`),
};

async function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS posts (
        rowid INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        categories TEXT,
        problems TEXT,
        content TEXT,
        date DATE NOT NULL
      )`,
        (err) => {
          if (err) return reject(err);
          log.info("主表 posts 已就绪");
        }
      );

      db.run(
        `CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
        title,
        content,
        tokenize = 'unicode61 remove_diacritics 2'
      )`,
        (err) => {
          if (err) return reject(err);
          log.info("全文搜索表 posts_fts 已就绪");
          resolve();
        }
      );
    });
  });
}

async function processMarkdownFiles(db) {
  let filenames = [];
  try {
    if (!fs.existsSync(POSTS_DIR)) {
      throw new Error(`文章目录不存在: ${POSTS_DIR}`);
    }

    filenames = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .filter((f) => {
        const stats = fs.statSync(path.join(POSTS_DIR, f));
        return stats.isFile() && stats.size > 0;
      });

    if (filenames.length === 0) {
      log.warn(`未找到任何Markdown文件: ${POSTS_DIR}`);
      return [];
    }

    log.info(`发现 ${filenames.length} 篇文章，开始处理...`);

    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => {
        err ? reject(err) : resolve();
      });
    });

    for (const filename of filenames) {
      await new Promise((resolve, reject) => {
        const filePath = path.join(POSTS_DIR, filename);
        const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

        const slug = filename.replace(/\.md$/, "");
        const title =
          data.title || content.match(/^#\s+(.+)$/m)?.[1] || "未命名文章";
        const excerpt =
          data.excerpt || content.slice(0, 150).replace(/\n/g, " ") + "...";
        const date = data.date ? new Date(data.date) : new Date();

        const categories = JSON.stringify(
          Array.isArray(data.categories)
            ? data.categories
            : typeof data.categories === "string"
            ? data.categories.split(",").map((s) => s.trim())
            : []
        );

        const problems = JSON.stringify(
          Array.isArray(data.problems)
            ? data.problems
                .map((p) => ({
                  id: p.id?.toString() || "",
                  name: String(p.name || ""),
                  tags: Array.isArray(p.tags)
                    ? p.tags
                    : typeof p.tags === "string"
                    ? p.tags.split(",").map((t) => t.trim())
                    : [],
                }))
                .filter((p) => p.id)
            : []
        );

        const tokenize = (text) =>
          jieba
            .cut(text, true) // 使用 HMM 模式
            .filter((word) => word.length > 1)
            .join(" ");
        const ftsContent = tokenize(content);

        db.serialize(() => {
          db.run(
            `INSERT OR REPLACE INTO posts 
            (slug, title, excerpt, categories, problems, content, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              slug,
              title,
              excerpt,
              categories,
              problems,
              content,
              date.toISOString().split("T")[0],
            ],
            function (err) {
              if (err) return reject(err);

              db.run(
                `INSERT OR REPLACE INTO posts_fts (rowid, title, content)
                VALUES (?, ?, ?)`,
                [this.lastID, tokenize(title), ftsContent],
                (err) => {
                  if (err) return reject(err);
                  log.info(`[${slug}] 处理完成`);
                  resolve();
                }
              );
            }
          );
        });
      });
    }

    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => {
        err ? reject(err) : resolve();
      });
    });
  } catch (error) {
    await new Promise((resolve) => db.run("ROLLBACK", resolve));
    throw new Error(`文件处理失败: ${error.message}`);
  }
}

async function generateSQLiteDatabase() {
  let db;
  try {
    if (!fs.existsSync(DB_DIR)) {
      log.info(`创建数据库目录: ${DB_DIR}`);
      fs.mkdirSync(DB_DIR, { recursive: true, mode: 0o755 });
    }

    log.info(`正在连接数据库: ${DB_PATH}`);
    db = new sqlite3.Database(DB_PATH);

    await initializeDatabase(db);
    await processMarkdownFiles(db);

    await new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    });

    const stats = fs.statSync(DB_PATH);
    log.success(`数据库生成成功！`);
    log.success(`路径: ${DB_PATH}`);
    log.success(`大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    if (db) {
      await new Promise((resolve) => db.close(resolve));
    }
    log.error(`生成失败: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  generateSQLiteDatabase().catch((err) => {
    log.error(`未捕获的错误: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { generateSQLiteDatabase };