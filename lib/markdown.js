const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

async function getMarkdownFiles() {
  const postsDirectory = path.join(process.cwd(), "content");
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.filter((filename) => filename.endsWith(".md"));
}

async function getPostMetadata(filename) {
  const filePath = path.join(process.cwd(), "content", filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const title = data.title || extractTitleFromContent(content);
  const excerpt = data.excerpt || createExcerpt(content);
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // 确保 categories 始终是数组并去重
  let categories = data.categories || [];
  if (typeof categories === "string") {
    categories = categories.split(",").map((item) => item.trim());
  }
  categories = [...new Set(categories)]; // 去重

  return {
    slug: filename.replace(".md", ""),
    title,
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    excerpt,
    readingTime,
    categories,
  };
}

async function getPostData(slug) {
  const decodedSlug = decodeURIComponent(slug);
  const filePath = path.join(process.cwd(), "content", `${decodedSlug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件未找到: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const title = data.title || extractTitleFromContent(content);
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // 确保 categories 始终是数组并去重
  let categories = data.categories || [];
  if (typeof categories === "string") {
    categories = categories.split(",").map((item) => item.trim());
  }
  categories = [...new Set(categories)]; // 去重

  return {
    slug: decodedSlug,
    title,
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    content,
    excerpt: data.excerpt || createExcerpt(content),
    readingTime,
    categories,
  };
}

function extractTitleFromContent(content) {
  const titleMatch = content.match(/^#\s+(.*)$/m);
  return titleMatch ? titleMatch[1] : "无标题";
}

function createExcerpt(content) {
  return (
    content
      .replace(/^#\s+.*$/m, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150) + "..."
  );
}

module.exports = { getMarkdownFiles, getPostMetadata, getPostData };