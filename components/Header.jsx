"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Archive,
  Tag,
  Github,
  Twitter,
  BookOpen,
  Menu,
  X,
  Search,
} from "lucide-react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (menuOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen, mobileSearchOpen]);

  const NavLinks = ({ mobile = false, onClick = () => {} }) => (
    <>
      <Link
        href="/"
        className={`flex items-center space-x-2 text-[#5D534B] hover:text-[#A67C52] transition-all duration-200 ${
          mobile 
            ? "text-lg w-full justify-center py-4 hover:bg-[#F0EBE4]" 
            : "px-3 py-2 rounded-md hover:bg-[#F9F7F4]"
        }`}
        onClick={onClick}
      >
        <Home className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span>首页</span>
      </Link>
      <Link
        href="/categories"
        className={`flex items-center space-x-2 text-[#5D534B] hover:text-[#A67C52] transition-all duration-200 ${
          mobile 
            ? "text-lg w-full justify-center py-4 hover:bg-[#F0EBE4]" 
            : "px-3 py-2 rounded-md hover:bg-[#F9F7F4]"
        }`}
        onClick={onClick}
      >
        <Tag className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span>分类</span>
      </Link>
      <Link
        href="/archives"
        className={`flex items-center space-x-2 text-[#5D534B] hover:text-[#A67C52] transition-all duration-200 ${
          mobile 
            ? "text-lg w-full justify-center py-4 hover:bg-[#F0EBE4]" 
            : "px-3 py-2 rounded-md hover:bg-[#F9F7F4]"
        }`}
        onClick={onClick}
      >
        <Archive className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span>归档</span>
      </Link>
      <Link
        href="/questions"
        className={`flex items-center space-x-2 text-[#5D534B] hover:text-[#A67C52] transition-all duration-200 ${
          mobile 
            ? "text-lg w-full justify-center py-4 hover:bg-[#F0EBE4]" 
            : "px-3 py-2 rounded-md hover:bg-[#F9F7F4]"
        }`}
        onClick={onClick}
      >
        <BookOpen className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span>题库</span>
      </Link>
    </>
  );

  const SocialLinks = ({ mobile = false }) => (
    <div
      className={`flex items-center ${
        mobile ? "space-x-8 mt-6" : "space-x-4"
      }`}
    >
      <a
        href="https://github.com/garhlz"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8A7B6D] hover:text-[#A67C52] transition-colors"
        aria-label="GitHub"
      >
        <Github className={mobile ? "h-6 w-6" : "h-5 w-5"} />
      </a>
      <a
        href="https://twitter.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8A7B6D] hover:text-[#A67C52] transition-colors"
        aria-label="Twitter"
      >
        <Twitter className={mobile ? "h-6 w-6" : "h-5 w-5"} />
      </a>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#F9F7F4]/95 backdrop-blur-sm shadow-sm py-2" 
          : "bg-[#F9F7F4] py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 标题 */}
          <div className="flex-none md:flex-1">
            <Link
              href="/"
              className="text-xl font-serif font-medium text-[#5D534B] hover:text-[#A67C52] transition-colors"
            >
              Garhlz's Blog
            </Link>
          </div>

          {/* 桌面端：搜索栏 */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* 桌面端：导航和社交链接 */}
          <nav className="hidden md:flex items-center space-x-4 flex-1 justify-end">
            <NavLinks />
            <div className="h-6 w-px bg-[#E5DDD3] mx-2" />
            <SocialLinks />
          </nav>

          {/* 移动端：搜索按钮和汉堡菜单 */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 text-[#8A7B6D] hover:text-[#A67C52] hover:bg-[#F0EBE4] rounded-full transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#8A7B6D] hover:text-[#A67C52] hover:bg-[#F0EBE4] rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 移动端：搜索栏 */}
        {mobileSearchOpen && (
          <div 
            ref={searchRef} 
            className="md:hidden py-3 border-t border-[#E5DDD3] animate-fadeDown"
          >
            <SearchBar autoFocus={true} onSearch={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* 移动端：折叠导航菜单 */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={menuRef}
            className="relative h-full w-3/5 max-w-xs bg-[#F9F7F4] shadow-xl animate-slideIn ml-auto flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#E5DDD3]">
              <Link 
                href="/" 
                className="text-xl font-serif font-medium text-[#5D534B]" 
                onClick={() => setMenuOpen(false)}
              >
                Garhlz's Blog
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-[#8A7B6D] hover:text-[#A67C52] hover:bg-[#F0EBE4] rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col items-center py-4 divide-y divide-[#E5DDD3] w-full bg-[#F9F7F4] flex-grow">
              <NavLinks mobile={true} onClick={() => setMenuOpen(false)} />
            </nav>
            <div className="border-t border-[#E5DDD3] p-6 flex justify-center bg-[#F9F7F4] mt-auto">
              <SocialLinks mobile={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
