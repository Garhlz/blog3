"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

const SAFE_CHARS_REGEX = /[^\p{L}\p{N}\s'\-_]/gu;

export default function SearchBar({ autoFocus = false, onSearch = () => {} }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // 搜索逻辑
  useEffect(() => {
    const sanitizedQuery = query.replace(SAFE_CHARS_REGEX, "").trim();
    
    if (!sanitizedQuery) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(sanitizedQuery)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1); // 重置选中项
      } catch (error) {
        console.error("Search error:", error.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  // 处理点击外部
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 处理键盘导航
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < getFlattenedResultsLength() - 1 ? prev + 1 : 0
      );
      ensureSelectedVisible();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : getFlattenedResultsLength() - 1
      );
      ensureSelectedVisible();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        navigateToSelectedResult();
      } else if (results.length > 0) {
        const firstMatch = results[0].matches[0];
        navigateToResult(results[0], firstMatch);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen, selectedIndex, results]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 获取扁平化后的所有可点击结果数量
  const getFlattenedResultsLength = () => {
    return results.reduce((count, item) => {
      let itemCount = 1;
      itemCount += item.matches.length;
      return count + itemCount;
    }, 0);
  };

  // 确保选中的项在视图中可见
  const ensureSelectedVisible = () => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  // 导航到选中的结果
  const navigateToSelectedResult = () => {
    let currentIndex = 0;
    for (const item of results) {
      if (currentIndex === selectedIndex) {
        window.location.href = `/post/${item.slug}`;
        onSearch();
        return;
      }
      currentIndex++;
      for (const match of item.matches) {
        if (currentIndex === selectedIndex) {
          navigateToResult(item, match);
          return;
        }
        currentIndex++;
      }
    }
  };

  // 导航到特定结果
  const navigateToResult = (item, match) => {
    window.location.href = match.nearest_heading 
      ? `/post/${item.slug}#${match.heading_id}` 
      : `/post/${item.slug}`;
    onSearch();
  };

  // 清空搜索
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 执行搜索
  const executeSearch = () => {
    if (query.trim() && results.length > 0) {
      const firstMatch = results[0].matches[0];
      navigateToResult(results[0], firstMatch);
    }
  };

  // 限制上下文显示的字数
  const truncateContext = (context, maxLength = 60) => {
    if (!context) return "";
    const plainText = context.replace(/<mark>|<\/mark>/g, "");
    if (plainText.length <= maxLength) return context;
    
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    const baseText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    
    return context.includes("<mark>") 
      ? context.replace(plainText, baseText + "...")
      : baseText + "...";
  };

  let resultIndex = 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <div className="flex items-center border border-[#E5DDD3] rounded-full bg-[#F9F7F4] shadow-sm focus-within:ring-2 focus-within:ring-[#D2C5B0] transition-all">
        <Search className="h-5 w-5 ml-4 text-[#A89B8C]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className="w-full p-2.5 outline-none rounded-full text-[#5D534B] bg-transparent placeholder-[#BDB2A7]"
          maxLength={50}
          autoFocus={autoFocus}
          onFocus={() => {
            if (query && results.length > 0) {
              setIsOpen(true);
            }
          }}
        />
        {query && (
          <button 
            onClick={clearSearch}
            className="p-1.5 text-[#A89B8C] hover:text-[#5D534B] transition-colors"
            aria-label="清空搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={executeSearch}
          className={`p-2 mr-2 text-white bg-[#D2C5B0] rounded-full hover:bg-[#BEA992] transition-colors ${
            loading || !query || results.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading || !query || results.length === 0}
          aria-label="执行搜索"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-[#F9F7F4] border border-[#E5DDD3] rounded-lg shadow-lg max-h-[80vh] overflow-y-auto z-10"
        >
          {results.length > 0 ? (
            <div className="divide-y divide-[#E5DDD3]">
              {results.map((item) => {
                const titleIndex = resultIndex++;
                
                return (
                  <div key={item.slug} className="p-4">
                    <h3 
                      className={`text-base font-medium hover:text-[#A67C52] transition-colors ${
                        selectedIndex === titleIndex 
                          ? 'bg-[#F0EBE4] text-[#A67C52] p-2 rounded' 
                          : 'text-[#5D534B] p-2'
                      }`}
                      data-index={titleIndex}
                    >
                      <Link href={`/post/${item.slug}`} onClick={onSearch} className="flex items-center">
                        {item.title}
                        <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
                      </Link>
                    </h3>
                    
                    {item.excerpt && (
                      <p className="text-sm text-[#7D7068] ml-2 mb-3 line-clamp-1">{item.excerpt}</p>
                    )}
                    
                    {item.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-2 mb-3">
                        {item.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-2 py-0.5 bg-[#E9E2D8] text-[#8A7B6D] rounded-full"
                          >
                            #{cat}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {item.matches.length > 0 && (
                      <div className="mt-3 space-y-2 bg-[#F0EBE4] p-3 rounded-md">
                        <h4 className="text-xs uppercase tracking-wider text-[#8A7B6D] font-medium mb-2">匹配内容</h4>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                          {item.matches.map((match, index) => {
                            const matchIndex = resultIndex++;
                            
                            return (
                              <div 
                                key={index}
                                className={`p-2 rounded border-l-2 ${
                                  selectedIndex === matchIndex 
                                    ? 'bg-[#E9E2D8] border-[#BEA992]' 
                                    : 'bg-white/50 border-transparent'
                                }`}
                                data-index={matchIndex}
                              >
                                <Link 
                                  href={match.nearest_heading 
                                    ? `/post/${item.slug}#${match.heading_id}` 
                                    : `/post/${item.slug}`}
                                  className="block"
                                  onClick={onSearch}
                                >
                                  <p
                                    className="text-sm text-[#5D534B]"
                                    dangerouslySetInnerHTML={{ 
                                      __html: truncateContext(match.content).replace(
                                        /<mark>/g, 
                                        '<mark class="bg-[#D2C5B0]/30 text-[#5D534B] px-0.5 rounded">'
                                      ) 
                                    }}
                                  />
                                  {match.nearest_heading && (
                                    <p className="text-xs text-[#8A7B6D] mt-1 flex items-center">
                                      <span className="inline-block w-2 h-2 bg-[#BEA992] rounded-full mr-1.5"></span>
                                      {match.nearest_heading}
                                    </p>
                                  )}
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[#8A7B6D]">没有找到匹配的结果</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}