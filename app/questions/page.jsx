import Link from "next/link";
import { ArrowLeft, Tag, BookOpen, Filter } from "lucide-react";
import { getMarkdownFiles, getPostMetadata } from "../../lib/markdown";
import RandomJumpButton from "@/components/RandomJumpButton"; // 新增导入

// 定义颜色相关的难度标签及其对应的样式
const difficultyTagStyles = {
  深黄: "bg-amber-600 text-white hover:bg-amber-700",
  黄: "bg-yellow-500 text-white hover:bg-yellow-600",
  绿: "bg-emerald-500 text-white hover:bg-emerald-600",
  蓝: "bg-blue-500 text-white hover:bg-blue-600",
  紫: "bg-purple-500 text-white hover:bg-purple-600",
  黑: "bg-gray-800 text-white hover:bg-gray-900",
  default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const isNumeric = (str) => /^\d+$/.test(str);

const getDifficultyTagStyle = (tag) => {
  if (difficultyTagStyles[tag]) {
    return difficultyTagStyles[tag];
  }
  return difficultyTagStyles.default;
};

async function getAllProblems(tagFilter = null) {
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

    const validPosts = posts.filter((post) => post !== null && post.problems.length > 0);
    const problems = [];

    validPosts.forEach((post) => {
      post.problems.forEach((problem) => {
        if (!tagFilter || problem.tags.includes(tagFilter)) {
          problems.push({
            slug: post.slug,
            postTitle: post.title,
            problemId: problem.id,
            problemName: problem.name,
            date: post.date,
            tags: problem.tags,
          });
        }
      });
    });

    return problems.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

async function getAllTags() {
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

    const validPosts = posts.filter((post) => post !== null && post.problems.length > 0);
    const tagsSet = new Set();

    validPosts.forEach((post) => {
      post.problems.forEach((problem) => {
        problem.tags.forEach((tag) => tagsSet.add(tag));
      });
    });

    const allTags = Array.from(tagsSet);
    const typeTags = allTags
      .filter((tag) => !isNumeric(tag) && !Object.keys(difficultyTagStyles).includes(tag))
      .sort();
    const difficultyTags = allTags
      .filter((tag) => isNumeric(tag) || Object.keys(difficultyTagStyles).includes(tag))
      .sort((a, b) => {
        if (isNumeric(a) && isNumeric(b)) return Number(a) - Number(b);
        if (isNumeric(a)) return -1;
        if (isNumeric(b)) return 1;
        const colorOrder = ["深黄", "黄", "绿", "蓝", "紫", "黑"];
        return colorOrder.indexOf(a) - colorOrder.indexOf(b);
      });

    return { typeTags, difficultyTags };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return { typeTags: [], difficultyTags: [] };
  }
}

export async function generateMetadata({ searchParams }) {
  const tag = searchParams.tag ? decodeURIComponent(searchParams.tag) : null;
  return {
    title: tag ? `${tag} 题目 - Garhlz's Blog` : "题库 - Garhlz's Blog",
    description: `浏览${tag ? `${tag} 相关的` : "所有"}算法题目`,
  };
}

export default async function QuestionsPage({ searchParams }) {
  const tagFilter = searchParams.tag ? decodeURIComponent(searchParams.tag) : null;
  const problems = await getAllProblems(tagFilter);
  const { typeTags, difficultyTags } = await getAllTags();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-6 group transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-medium">返回首页</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl flex items-center">
          <BookOpen className="h-8 w-8 mr-3 text-secondary" />
          {tagFilter ? `${tagFilter} 题目` : "题库"}
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          共 <span className="font-semibold text-secondary">{problems.length}</span> 道题目
        </p>

        {/* 筛选器 */}
        <div className="mt-8 space-y-6 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-secondary" />
              题型
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/questions"
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  !tagFilter
                    ? "bg-secondary text-white shadow-md shadow-secondary/20 transform scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-secondary/30"
                }`}
              >
                全部
              </Link>
              {typeTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${encodeURIComponent(tag)}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    tagFilter === tag
                      ? "bg-secondary text-white shadow-md shadow-secondary/20 transform scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-secondary/30"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-secondary" />
              难度
            </h2>
            <div className="flex flex-wrap gap-2">
              {difficultyTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${encodeURIComponent(tag)}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    tagFilter === tag ? "transform scale-105 shadow-md" : ""
                  } ${
                    tagFilter === tag
                      ? Object.keys(difficultyTagStyles).includes(tag)
                        ? difficultyTagStyles[tag]
                        : difficultyTagStyles.default
                      : Object.keys(difficultyTagStyles).includes(tag)
                        ? difficultyTagStyles[tag].replace("bg-", "bg-opacity-80 bg-")
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 添加随机跳题按钮 */}
        <div className="mt-6 flex items-center gap-4">
          {tagFilter && (
            <Link
              href="/questions"
              className="inline-flex items-center text-secondary hover:text-secondary/80 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              查看所有题目
            </Link>
          )}
          <RandomJumpButton problems={problems} />
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {problems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">暂无题目</h3>
            <p className="text-gray-600 mt-2">
              {tagFilter ? `当前标签 "${tagFilter}" 下没有相关题目` : "题库为空"}
            </p>
            <Link
              href="/questions"
              className="mt-6 inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              返回所有题目
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {problems.map((problem) => (
              <li
                key={problem.problemId}
                className="group hover:bg-gray-50 transition-colors duration-200 rounded-lg"
              >
                <Link
                  href={`/post/${problem.slug}#${problem.problemName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4"
                >
                  <div className="flex items-center">
                    <span className="font-mono text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-md mr-3">
                      {problem.problemId}
                    </span>
                    <h4 className="text-base font-medium text-gray-900 group-hover:text-secondary transition-colors">
                      {problem.problemName}
                      <span className="text-gray-500 text-sm ml-2 font-normal">
                        from {problem.postTitle}
                      </span>
                    </h4>
                  </div>
                  <time className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 sm:w-28 sm:text-right">
                    {problem.date}
                  </time>
                </Link>
                {problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 px-4 pb-4">
                    {problem.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/questions?tag=${encodeURIComponent(tag)}`}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          Object.keys(difficultyTagStyles).includes(tag)
                            ? difficultyTagStyles[tag].replace("bg-", "bg-opacity-90 bg-")
                            : isNumeric(tag)
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                        }`}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}