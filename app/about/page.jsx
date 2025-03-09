import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostData } from "@/lib/markdown";

export async function generateMetadata() {
  return {
    title: "About - Garhlz's Blog",
  };
}

export default async function About() {
  let postData;

  try {
    postData = await getPostData("about");
  } catch (error) {
    console.error("Error loading about page:", error);
    postData = {
      content: `
# About Me

This is a default About page. It seems the custom \`about.md\` file could not be loaded. Please check the content directory or update this page.

---

### Basic Info
- **Name**: Garhlz  
- **Bio**: 还没来得及写简介，别急，慢慢来！  

### Contact
- **Email**: [garhlz257@163.com](mailto:garhlz257@163.com)  
- **GitHub**: [github.com/garhlz](https://github.com/garhlz)  
      `,
    };
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      {/* 标题区域 */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 sm:text-5xl tracking-tight">
          About Me
        </h1>
      </header>

      {/* 主内容区域 */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* 头像占位符 */}
        <div className="flex justify-center mb-6">
          <img src="/images/avatar1.jpg" alt="Garhlz's Avatar" className="w-24 h-24 rounded-full object-cover" />
        </div>

        {/* Markdown 内容 */}
        <div className="prose prose-lg max-w-none text-gray-800">
          <MarkdownRenderer content={postData.content} />
        </div>
      </div>

    </div>
  );
}