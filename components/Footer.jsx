import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-header-bg border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">© {new Date().getFullYear()} Garhlz All Rights Reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-primary transition-colors">
              分类
            </Link>
            <Link href="/archives" className="text-gray-600 hover:text-primary transition-colors">
              归档
            </Link>
            <Link href="/questions" className="text-gray-600 hover:text-primary transition-colors">
              题库
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

