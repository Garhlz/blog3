// app/api/search/route.js
import { searchPosts } from "@/lib/search-sqlite";
import { NextResponse } from 'next/server';

// 允许的搜索字符正则表达式
const SAFE_SEARCH_REGEX = /[\p{L}\p{N}\s'\-_]/gu;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get("q") || "";

    // 清理危险字符并截断长度
    query = query.match(SAFE_SEARCH_REGEX)?.join("") || "";
    query = query.slice(0, 100).trim();

    if (!query) {
      return NextResponse.json(
        { error: "请输入有效的搜索词" },
        { status: 400 }
      );
    }

    const results = await searchPosts(query);
    return NextResponse.json(results);

  } catch (error) {
    console.error('搜索 API 错误:', error);
    return NextResponse.json(
      { error: "服务器处理搜索请求时出错" },
      { status: 500 }
    );
  }
}