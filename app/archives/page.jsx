import Link from "next/link";
import { Calendar, Archive } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../../lib/markdown";

async function getArchives() {
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
    validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const archives = {};
    validPosts.forEach((post) => {
      const [year, month] = post.date.split("-");
      if (!archives[year]) archives[year] = {};
      if (!archives[year][month]) archives[year][month] = [];
      archives[year][month].push(post);
    });

    return Object.keys(archives)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        months: Object.keys(archives[year])
          .sort((a, b) => b - a)
          .map((month) => ({
            month,
            posts: archives[year][month],
          })),
      }));
  } catch (error) {
    console.error("Error fetching archives:", error);
    return [];
  }
}

export async function generateMetadata() {
  return {
    title: "Archives - Garhlz's blog",
  };
}

export default async function ArchivesPage() {
  const archives = await getArchives();

  const totalPosts = archives.reduce(
    (total, yearData) =>
      total + yearData.months.reduce((yearTotal, monthData) => yearTotal + monthData.posts.length, 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center mb-8">
        <Archive className="h-6 w-6 mr-2 text-[rgb(var(--primary-color))]" />
        <h1 className="text-3xl font-bold text-gray-900">文章归档</h1>
        <span className="ml-2 text-gray-500">共 {totalPosts} 篇文章</span>
      </div>

      {archives.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">暂无文章</p>
        </div>
      ) : (
        <div className="space-y-8">
          {archives.map((yearData) => (
            <div key={yearData.year} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{yearData.year}年</h2>
              <div className="space-y-6">
                {yearData.months.map((monthData) => (
                  <div key={`${yearData.year}-${monthData.month}`}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{monthData.month}月</h3>
                    <ul className="space-y-2">
                      {monthData.posts.map((post) => (
                        <li key={post.slug} className="flex items-baseline">
                          <span className="text-gray-500 text-sm w-24 flex-shrink-0">
                            <Calendar className="h-3 w-3 inline-block mr-1" />
                            {post.date.split("-")[2]}日
                          </span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}