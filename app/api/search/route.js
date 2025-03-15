// app/api/search/route.js
import { searchPosts } from "@/lib/search-sqlite";
import { NextResponse } from "next/server";

const SAFE_SEARCH_REGEX = /[\p{L}\p{N}\s'\-_]/gu;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get("q") || "";

    console.log("API 接收到的查询:", query); // 调试日志

    query = query.match(SAFE_SEARCH_REGEX)?.join("") || "";
    query = query.slice(0, 100).trim();

    if (!query) {
      console.log("查询为空，返回 400");
      return NextResponse.json(
        { error: "请输入有效的搜索词" },
        { status: 400 }
      );
    }

    const results = await searchPosts(query);
    console.log("API 搜索结果:", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("搜索 API 错误:", error);
    return NextResponse.json(
      { error: "服务器处理搜索请求时出错" },
      { status: 500 }
    );
  }
}