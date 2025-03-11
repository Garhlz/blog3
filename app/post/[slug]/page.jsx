import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
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

// 提取标题的插件（与客户端一致）
function extractHeadings() {
  return (tree, file) => {
    const headings = [];
    const idCounts = new Map();
    visit(tree, "heading", (node) => {
      const text = node.children
        .filter((n) => n.type === "text")
        .map((n) => n.value)
        .join("");
      let id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      if (idCounts.has(id)) {
        const count = idCounts.get(id) + 1;
        idCounts.set(id, count);
        id = `${id}-${count}`;
      } else {
        idCounts.set(id, 0);
      }
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.id = id;
      headings.push({ depth: node.depth, text, id });
    });
    file.data.headings = headings;
  };
}

export async function generateStaticParams() { // 这里渲染了静态页面
  const { getMarkdownFiles } = require("@/lib/markdown");
  const filenames = await getMarkdownFiles();
  return filenames.map((filename) => ({
    slug: filename.replace(".md", ""),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  let postData;

  try {
    postData = await getPostData(slug);
    return {
      title: `${postData.title} - Garhlz's blog`,
      description: postData.excerpt || `探索${postData.title}的深度解析`,
    };
  } catch (error) {
    return {
      title: "文章未找到 - Garhlz's blog",
    };
  }
}

export default async function Post({ params }) {
  const { slug } = params;
  let postData;

  try {
    postData = await getPostData(slug);

    // 服务端解析 Markdown
    const vfile = await unified()
      .use(remarkParse)
      .use(extractHeadings)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypePrism, { showLineNumbers: true, ignoreMissing: true })
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(postData.content);

    const htmlContent = String(vfile);
    const headings = vfile.data.headings || [];

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-primary mb-6 group transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">返回文章列表</span>
          </Link>

          {/* 文章头部 */}
          <header className="mb-8 space-y-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              {postData.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <time>{postData.date}</time>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{postData.readingTime} 分钟阅读</span>
              </div>
            </div>

            {/* 分类标签 */}
            {postData.categories?.length > 0 && (
              <div className="flex items-start gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex flex-wrap gap-2">
                  {postData.categories.map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category}`}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      #{category}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* 内容区域 */}
          <article className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 sm:p-8 md:p-10 mb-8">
            <MarkdownRenderer htmlContent={htmlContent} headings={headings} />
          </article>

          {/* 底部导航 */}
          <div className="border-t border-gray-100 pt-8">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">浏览更多文章</span>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="bg-red-50/90 backdrop-blur-sm border-2 border-red-100 rounded-xl p-6 max-w-md text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-3">🚨 文章加载失败</h1>
          <p className="text-red-500 mb-4">{error.message}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    );
  }
}