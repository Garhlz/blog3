import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../lib/markdown";

export async function generateMetadata() {
  return {
    title: "Garhlz's blog",
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
    <div className="space-y-8 mt-8">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">文章</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">分享想法、经验和知识</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">暂无文章</p>
          <p className="text-gray-500 mt-2">请在 content 目录中添加 Markdown 文件</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <Link href={`/post/${post.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary">
                    {post.title}
                  </h2>
                </Link>
                <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.readingTime} 分钟阅读</span>
                  </div>
                </div>
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap items-center mb-3">
                    <Tag className="h-4 w-4 mr-1 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Link
                          key={category}
                          href={`/categories/${category}`}
                          className="category-tag inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                <Link href={`/post/${post.slug}`} className="mt-4 text-primary font-medium inline-block">
                  阅读更多 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}