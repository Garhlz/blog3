import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag, BookOpen } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostData } from "@/lib/markdown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

const difficultyTagStyles = {
  "深黄": "bg-amber-600 text-white hover:bg-amber-700",
  "黄": "bg-yellow-500 text-black hover:bg-yellow-600",
  "绿": "bg-emerald-500 text-white hover:bg-emerald-600",
  "蓝": "bg-blue-500 text-white hover:bg-blue-600",
  "紫": "bg-purple-500 text-white hover:bg-purple-600",
  "黑": "bg-gray-800 text-white hover:bg-gray-900",
  "default": "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const isNumeric = (str) => /^\d+$/.test(str);

const getTagStyle = (tag) => {
  if (difficultyTagStyles[tag]) return difficultyTagStyles[tag];
  if (isNumeric(tag)) return difficultyTagStyles.default;
  return "bg-secondary/10 text-secondary hover:bg-secondary/20";
};

function extractHeadings() {
  return (tree, file) => {
    const headings = [];
    visit(tree, "heading", (node) => {
      // 防御性检查
      if (!node || !Array.isArray(node.children)) {
        console.warn("Invalid heading node:", node);
        return;
      }
      const text = node.children
        .filter((n) => n && n.type === "text" && typeof n.value === "string")
        .map((n) => n.value)
        .join("");
      if (!text) return; // 跳过空标题
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""); // 不添加后缀
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.id = id;
      headings.push({ depth: node.depth, text, id });
    });
    file.data.headings = headings;
  };
}

export async function generateStaticParams() {
  const { getMarkdownFiles } = require("@/lib/markdown");
  const filenames = await getMarkdownFiles();
  return filenames.map((filename) => ({
    slug: filename.replace(".md", ""),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const postData = await getPostData(slug);
    return {
      title: `${postData.title} - Garhlz's Blog`,
      description: postData.excerpt || `探索${postData.title}的深度解析`,
    };
  } catch (error) {
    return { title: "文章未找到 - Garhlz's Blog" };
  }
}

export default async function Post({ params }) {
  const { slug } = params;

  try {
    const postData = await getPostData(slug);
    if (!postData || !postData.content) {
      throw new Error("文章内容为空或未找到");
    }

    const vfile = await unified()
      .use(remarkParse)
      .use(extractHeadings)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypePrism, { showLineNumbers: true, ignoreMissing: true })
      .use(rehypeKatex, { strict: false })
      .use(rehypeStringify)
      .process(postData.content);

    let htmlContent = String(vfile);
    const headings = vfile.data.headings || [];

    if (postData.problems && Array.isArray(postData.problems)) {
      postData.problems.forEach((problem) => {
        const headingRegex = new RegExp(`<h2[^>]*>${problem.name}</h2>`, "i");
        const tagsHtml = (problem.tags || [])
          .map(
            (tag) => {
              const tagStyle = getTagStyle(tag);
              return `<a href="/questions?tag=${encodeURIComponent(
                tag
              )}" class="inline-block px-2.5 py-1 ${tagStyle} rounded-full text-xs font-medium transition-colors ml-2">${tag}</a>`;
            }
          )
          .join("");
        const problemIdHtml = problem.id
          ? `<span class="font-mono text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-md ml-3">${problem.id}</span>`
          : "";
        const problemId = problem.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
        htmlContent = htmlContent.replace(
          headingRegex,
          `<h2 id="${problemId}" class="flex items-center flex-wrap gap-2">
            <span>${problem.name}</span>
            ${problemIdHtml}
            <div class="flex flex-wrap gap-1 mt-2 sm:mt-0">${tagsHtml}</div>
          </h2>`
        );
      });
    }

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-primary mb-6 group transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">返回文章列表</span>
          </Link>

          <header className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">
              {postData.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <time>{postData.date}</time>
              </div>
              <div className="hidden sm:block text-gray-300">•</div>
              <div className="flex items-center space-x-1.5">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{postData.readingTime} 分钟阅读</span>
              </div>
              {postData.problems && postData.problems.length > 0 && (
                <>
                  <div className="hidden sm:block text-gray-300">•</div>
                  <div className="flex items-center space-x-1.5">
                    <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{postData.problems.length} 道题目</span>
                  </div>
                </>
              )}
            </div>
            {postData.categories && postData.categories.length > 0 && (
              <div className="flex items-start gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-500 mt-1.5" />
                <div className="flex flex-wrap gap-2">
                  {postData.categories.map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category}`}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors font-medium"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {postData.excerpt && (
              <div className="mt-4 text-gray-600 italic pl-4 py-2 border-l-4 border-secondary/30">
                {postData.excerpt}
              </div>
            )}
          </header>

          <article className="bg-white rounded-xl shadow-sm p-6 sm:p-8 md:p-10 mb-8">
            <MarkdownRenderer htmlContent={htmlContent} headings={headings} />
          </article>

          <div className="border-t border-gray-100 pt-8 pb-16 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">浏览更多文章</span>
            </Link>
            {postData.problems && postData.problems.length > 0 && (
              <Link
                href="/questions"
                className="inline-flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">查看题库</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering post:", error);
    return (
      <div className="container mx-auto p-4 min-h-[80vh] flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-100 rounded-xl p-8 max-w-md text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 文章加载失败</h1>
          <p className="text-red-500 mb-6">{error.message || "未知错误"}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    );
  }
}