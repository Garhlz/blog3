import Link from "next/link";
import { Calendar, Clock, Tag, BookOpen } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../lib/markdown";

export async function generateMetadata() {
  return {
    title: "Garhlz's blog",
    description: "分享想法、经验和知识的个人博客",
  };
}

export default async function Page() {
  let posts = [];
  try {
    const filenames = await getMarkdownFiles();
    posts = await Promise.all(
      filenames.map(async (filename) => {
        try {
          return await getPostMetadata(filename);
        } catch (error) {
          console.error(`Error parsing ${filename}:`, error);
          return null;
        }
      })
    );
    posts = posts.filter((post) => post !== null);
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error loading posts:", error);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 页面标题区 */}
      <header className="mb-12 text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          文章
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          已沉淀 {posts.length} 篇博文
        </p>
      </header>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border-2 border-dashed border-gray-200">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-pulse" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">知识库等待充盈</h2>
          <p className="text-gray-600">
            在 <code className="bg-gray-100 px-2 py-1 rounded">content</code> 目录中添加新篇章
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* 封面图片 */}
              {post.coverImage && (
                <Link 
                  href={`/post/${post.slug}`} 
                  className="block aspect-video overflow-hidden relative"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5" />
                </Link>
              )}

              {/* 内容区块 */}
              <div className="p-5 md:p-6 flex flex-col flex-1 space-y-4">
                {/* 标题 */}
                <Link href={`/post/${post.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </Link>

                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 opacity-80" />
                    <span>{post.date}</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-200" />
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 opacity-80" />
                    <span>{post.readingTime}min</span>
                  </div>
                </div>

                {/* 分类标签 */}
                {post.categories?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Link
                          key={category}
                          href={`/categories/${category}`}
                          className="px-2.5 py-1 bg-primary/5 text-primary rounded-full text-sm hover:bg-primary/10 transition-colors"
                        >
                          #{category}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 摘要 */}
                <p className="text-gray-600 line-clamp-3 leading-relaxed flex-1">
                  {post.excerpt}
                </p>

                {/* 阅读链接 */}
                <div className="pt-2 mt-auto">
                  <Link
                    href={`/post/${post.slug}`}
                    className="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="border-b border-dotted border-primary/30 hover:border-primary/60">
                      展开阅读
                    </span>
                    <svg 
                      className="w-4 h-4 ml-1.5 -translate-y-px" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 分页控制 */}
      {posts.length > 9 && (
        <div className="mt-12 flex justify-center">
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50/80 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
            加载更多 →
          </button>
        </div>
      )}
    </div>
  );
}