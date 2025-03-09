import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../../../lib/markdown";

async function getPostsByCategory(category) {
  try {
    const filenames = await getMarkdownFiles();
    const posts = await Promise.all(
      filenames.map(async (filename) => {
        try {
          return await getPostMetadata(filename);
        } catch (error) {
          console.error(`Error parsing ${filename}:`, error);
          return null;
        }
      })
    );

    const validPosts = posts.filter((post) => post !== null && post.categories.includes(category));
    return validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error(`Error fetching posts for category ${category}:`, error);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = params;
  const decodedCategory = decodeURIComponent(slug);
  const posts = await getPostsByCategory(decodedCategory);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Link
        href="/categories"
        className="inline-flex items-center text-gray-600 hover:text-[rgb(var(--primary-color))] mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回所有分类
      </Link>

      <div className="flex items-center mb-8">
        <Tag className="h-6 w-6 mr-2 text-[rgb(var(--primary-color))]" />
        <h1 className="text-3xl font-bold text-gray-900">分类: {decodedCategory}</h1>
        <span className="ml-2 text-gray-500">({posts.length})</span>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">该分类下暂无文章</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link href={`/post/${post.slug}`} className="block h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
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
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 text-[rgb(var(--primary-color))] font-medium">阅读更多 →</div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}