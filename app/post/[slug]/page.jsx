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
    };
  } catch (error) {
    return {
      title: "Post Not Found - Garhlz's blog",
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
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">文章未找到</h1>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary-hover">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col lg:flex-row gap-8">
      <article className="flex-1 pr-0 lg:pr-6">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回文章列表
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{postData.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{postData.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{postData.readingTime} 分钟阅读</span>
            </div>
          </div>
          {postData.categories && postData.categories.length > 0 && (
            <div className="flex flex-wrap items-center mb-3">
              <Tag className="h-4 w-4 mr-1 text-gray-500" />
              <div className="flex flex-wrap">
                {postData.categories.map((category) => (
                  <Link key={category} href={`/categories/${category}`} className="category-tag">
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <MarkdownRenderer content={postData.content} />
        </div>
      </article>
    </div>
  );
}