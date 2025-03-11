"use client" 

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, User, Archive, Tag, Github, Twitter } from "lucide-react"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-header-bg shadow-md py-2" : "bg-header-bg py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* 第一行：标题居中，社交链接靠右（移动端） / 标题靠左（桌面端） */}
          <div className="flex justify-between items-center w-full">
            {/* 移动端左侧留空，桌面端不需要 */}
            <div className="w-12 md:hidden"></div>
            
            {/* 标题：移动端居中，桌面端靠左 */}
            <div className="flex-1 flex justify-center md:justify-start">
              <Link href="/" className="text-xl md:text-xl font-bold text-gray-800 hover:text-primary transition-colors">
                Garhlz's Blog
              </Link>
            </div>
            
            {/* 社交链接在移动端显示，桌面端隐藏 */}
            <div className="flex items-center space-x-4 md:hidden w-12 justify-end">
              <a
                href="https://github.com/garhlz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 第二行（移动端导航平均分布占满整行，按钮放大） / 导航+社交链接靠右（桌面端） */}
          <div className="flex justify-between items-center mt-4 md:mt-0 w-full md:w-auto md:ml-auto">
            {/* 导航选项 */}
            <nav className="flex w-full md:w-auto items-center md:space-x-6 whitespace-nowrap">
              {/* 移动端：均匀分布，添加页边距 */}
              <div className="flex justify-between w-full px-4 md:hidden">
                <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
                  <Home className="h-6 w-6" />
                  <span className="mt-1 text-sm">首页</span>
                </Link>
                <Link
                  href="/categories"
                  className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <Tag className="h-6 w-6" />
                  <span className="mt-1 text-sm">分类</span>
                </Link>
                <Link
                  href="/archives"
                  className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <Archive className="h-6 w-6" />
                  <span className="mt-1 text-sm">归档</span>
                </Link>
                <Link
                  href="/questions"
                  className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="mt-1 text-sm">题库</span>
                </Link>
              </div>
              
              {/* 桌面端：水平排列 */}
              <div className="hidden md:flex md:space-x-6">
                <Link href="/" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                  <Home className="h-4 w-4" />
                  <span>首页</span>
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <Tag className="h-4 w-4" />
                  <span>分类</span>
                </Link>
                <Link
                  href="/archives"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  <span>归档</span>
                </Link>
                <Link
                  href="/questions"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>题库</span>
                </Link>
              </div>
            </nav>

            {/* 社交链接仅在桌面端显示，紧随导航 */}
            <div className="hidden md:flex items-center space-x-4 ml-6">
              <a
                href="https://github.com/garhlz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}