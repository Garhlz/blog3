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
    title: "Categories - Garhlz's blog",
  };
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPosts();

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">文章分类</h1>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">暂无分类</p>
          <p className="text-gray-500 mt-2">请在文章的 frontmatter 中添加 categories 字段</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Tag className="h-5 w-5 mr-2 text-[rgb(var(--primary-color))]" />
                <h2 className="text-2xl font-semibold text-gray-900">{category.name}</h2>
                <span className="ml-2 text-gray-500">({category.count})</span>
              </div>
              <ul className="space-y-2 pl-7">
                {category.posts.map((post) => (
                  <li key={post.slug} className="flex items-baseline">
                    <span className="text-gray-500 text-sm w-24 flex-shrink-0">{post.date}</span>
                    <Link
                      href={`/post/${post.slug}`}
                      className="text-[rgb(var(--primary-color))] hover:text-[rgb(var(--primary-hover))] hover:underline"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}