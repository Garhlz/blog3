import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostData } from "@/lib/markdown";

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
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
        <article className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">
          <MarkdownRenderer 
            content={postData.content} 
            className="prose prose-sm sm:prose-base max-w-none 
              prose-headings:font-semibold
              prose-a:text-primary hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50
              prose-code:before:content-none prose-code:after:content-none
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded"
          />
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
}