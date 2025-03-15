const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jieba = require("nodejieba");
const fs = require("fs");

const DB_PATH = path.resolve(process.cwd(), "db/blog.db");
let dbInstance = null;

const escapeFTS5Query = (term) => {
  return term
    .replace(/['"]/g, (match) => `\\${match}`)
    .replace(/\\/g, "")
    .replace(/[@#%^&+={}[\]|<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

function getDatabase() {
  if (!dbInstance) {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`数据库文件不存在: ${DB_PATH}`);
    }
    dbInstance = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) throw new Error(`数据库连接失败: ${err.message}`);
    });
  }
  return dbInstance;
}

async function searchPosts(query) {
  if (typeof query !== "string" || query.trim().length < 1) {
    return [];
  }

  query = query.replace(/\\/g, "");
  const db = getDatabase();
  const terms = jieba.cut(query);
  const safeQuery = terms
    .map(t => `${escapeFTS5Query(t)}*`)
    .filter(t => t.length > 0)
    .join(" ");

  console.log("Terms:", terms);
  console.log("Safe Query:", safeQuery);

  if (!safeQuery) return [];

  try {
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          p.slug,
          p.title AS post_title,
          p.excerpt,
          p.date,
          p.content,
          p.categories,
          p.problems,
          snippet(posts_fts, 1, '<mark>', '</mark>', '...', 30) AS snippet,
          bm25(posts_fts) AS score
        FROM posts_fts
        INNER JOIN posts p ON posts_fts.rowid = p.rowid
        WHERE posts_fts MATCH ?
        ORDER BY score
        LIMIT 20`,
        [safeQuery],
        (err, rows) => {
          if (err) {
            console.error("SQL 查询失败:", err.message);
            return reject(err);
          }
          const results = rows.map(row => {
            const contentLines = row.content.split('\n');
            const queryLower = query.toLowerCase();
            const matches = [];
            contentLines.forEach((line, index) => {
              if (line.toLowerCase().includes(queryLower)) {
                let nearestHeading = null;
                for (let i = index; i >= 0; i--) {
                  if (contentLines[i].startsWith('## ')) {
                    nearestHeading = contentLines[i].replace('## ', '').trim();
                    break;
                  }
                }
                const start = Math.max(0, index - 2);
                const end = Math.min(contentLines.length, index + 3);
                const context = contentLines.slice(start, end).join(' ');
                const highlightedContext = context.replace(
                  new RegExp(query, 'gi'),
                  match => `<mark>${match}</mark>`
                );
                matches.push({
                  content: highlightedContext,
                  nearest_heading: nearestHeading,
                  heading_id: nearestHeading?.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "")
                });
              }
            });
            const problems = row.problems ? JSON.parse(row.problems) : [];
            const relatedProblems = problems
              .filter(problem => 
                problem.name.toLowerCase().includes(queryLower) ||
                problem.tags.some(tag => tag.toLowerCase().includes(queryLower))
              )
              .map(problem => {
                let problemContext = null;
                const problemIndex = contentLines.findIndex(line => 
                  line.toLowerCase().includes(problem.name.toLowerCase())
                );
                if (problemIndex !== -1) {
                  const start = Math.max(0, problemIndex - 2);
                  const end = Math.min(contentLines.length, problemIndex + 3);
                  problemContext = contentLines.slice(start, end).join(' ')
                    .replace(
                      new RegExp(query, 'gi'),
                      match => `<mark>${match}</mark>`
                    );
                }
                return { ...problem, context: problemContext };
              });
            return {
              slug: row.slug,
              title: row.post_title,
              excerpt: row.excerpt,
              date: row.date,
              matches: matches.length > 0 ? matches : [{
                content: row.snippet.replace(/\s+/g, " ").replace(/\\'/g, "'"),
                nearest_heading: null,
                heading_id: null
              }],
              categories: row.categories ? JSON.parse(row.categories) : [],
              problems: relatedProblems
            };
          });
          resolve(results.filter(result => result.matches.length > 0));
        }
      );
    });
  } catch (error) {
    console.error("搜索处理失败:", {
      message: error.message,
      stack: error.stack,
      query: query
    });
    return [];
  }
}

module.exports = { searchPosts };