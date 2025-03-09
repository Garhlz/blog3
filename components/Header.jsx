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
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-primary transition-colors">
            Garhlz's Blog
          </Link>
          
          <div className="flex items-center">
            <nav className="flex items-center space-x-6 mr-6">
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
                href="/about"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                <span>关于</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
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

