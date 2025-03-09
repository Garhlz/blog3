import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostData } from "@/lib/markdown";

export async function generateMetadata() {
  return {
    title: "About - Garhlz's blog",
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

This is a default About page. It seems the custom about.md file could not be loaded. Please check the content directory or update this page.

- **Name**: Garhlz
- **Bio**: 不好意思还没写
      `,
    };
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <MarkdownRenderer content={postData.content} />
      </div>
    </div>
  );
}