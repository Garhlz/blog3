import Link from "next/link";
import { Tag } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../../lib/markdown";

async function getCategoriesWithPosts() {
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

    const validPosts = posts.filter((post) => post !== null);
    const categoriesMap = {};

    validPosts.forEach((post) => {
      post.categories.forEach((category) => {
        if (!categoriesMap[category]) {
          categoriesMap[category] = [];
        }
        categoriesMap[category].push({
          slug: post.slug,
          title: post.title,
          date: post.date,
        });
      });
    });

    return Object.keys(categoriesMap)
      .map((category) => ({
        name: category,
        count: categoriesMap[category].length,
        posts: categoriesMap[category].sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function generateMetadata() {
  return {
    title: "分类导航 - Garhlz's blog",
    description: "探索博客文章的专题分类，发现更多深度内容"
  };
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <header className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight sm:text-4xl">
        文章分类
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          共有 {categories.length} 个分类
        </p>
      </header>

      {/* 内容主体 */}
      <div className="max-w-5xl mx-auto">
        {categories.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">分类目录待完善</h2>
            <p className="text-gray-600">
              请在文章frontmatter中添加 <code className="bg-gray-100 px-2 py-1 rounded">categories</code> 字段
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8">
            {categories.map((category) => (
              <section 
                key={category.name}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                {/* 分类标题 */}
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3 bg-gradient-to-r from-primary/5 to-transparent">
                  <Tag className="h-6 w-6 text-primary" />
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    <span className="text-primary font-medium">{category.count}篇</span>
                  </div>
                </div>

                {/* 文章列表 */}
                <ul className="divide-y divide-gray-100/50">
                  {category.posts.map((post) => (
                    <li 
                      key={post.slug}
                      className="group hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <Link
                        href={`/post/${post.slug}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6"
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </div>
                        <time className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-4 sm:w-28 sm:text-right">
                          {post.date}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}