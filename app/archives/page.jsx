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
    title: "归档 - Garhlz's blog",
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 标题区 */}
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          文章归档
        </h1>
        <p className="text-lg text-gray-600">
          已归档 {totalPosts} 篇文章
        </p>
    </header>

      {/* 内容主体 */}
      {archives.length === 0 ? (
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">时空等待标记</h2>
          <p className="text-gray-600">
            在内容宇宙中留下你的思想坐标
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {archives.map((yearData) => (
            <section 
              key={yearData.year} 
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              {/* 年份标题 */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mr-3">
                    {yearData.year}
                  </span>
                  <span className="text-gray-500">年</span>
                </h2>
              </div>

              {/* 月份列表 */}
              <div className="p-6 space-y-8">
                {yearData.months.map((monthData) => (
                  <article 
                    key={`${yearData.year}-${monthData.month}`}
                    className="relative group"
                  >
                    {/* 月份装饰线 */}
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-gray-200/50 to-transparent" />

                    <div className="pl-12 relative">
                      {/* 月份标题 */}
                      <div className="flex items-center mb-4 -mt-1">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {monthData.month.padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{monthData.month}月</h3>
                      </div>

                      {/* 文章列表 */}
                      <ul className="space-y-4">
                        {monthData.posts.map((post) => (
                          <li 
                            key={post.slug} 
                            className="flex items-start hover:bg-gray-50/50 transition-colors duration-200 p-3 -mx-3 rounded-lg"
                          >
                            <time className="text-sm text-gray-500 w-24 flex-shrink-0 pt-1">
                              <Calendar className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                              {post.date.split('-')[2]}日
                            </time>
                            <Link
                              href={`/post/${post.slug}`}
                              className="text-gray-900 hover:text-primary transition-colors leading-snug flex-1"
                            >
                              {post.title}
                              {post.categories?.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                  {post.categories.map((category) => (
                                    <span 
                                      key={category} 
                                      className="px-2 py-1 bg-primary/5 text-primary rounded-full text-xs font-medium"
                                    >
                                      #{category}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}