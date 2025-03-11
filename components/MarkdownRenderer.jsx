"use client";

import { useEffect, useState, useRef } from "react";
import "katex/dist/katex.min.css";

const MarkdownRenderer = ({ htmlContent, headings }) => {
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(0);
  const [isTopTocExpanded, setIsTopTocExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const sidebarItemsRef = useRef([]);
  const activeItemRef = useRef(null);
  const progressIndicatorRef = useRef(null);

  // 初始化引用数组
  useEffect(() => {
    sidebarItemsRef.current = sidebarItemsRef.current.slice(0, headings.length);
  }, [headings]);

  // 滚动监听和活动标题高亮
  useEffect(() => {
    const updateActiveHeading = () => {
      const scrollTop = window.scrollY;
      const headerHeight = 64; // 假设顶部导航栏高度

      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean);

      if (headingElements.length === 0) {
        setActiveHeadingIndex(0);
        return;
      }

      let newActiveIndex = 0;
      for (let i = 0; i < headingElements.length; i++) {
        const rect = headingElements[i].getBoundingClientRect();
        if (rect.top + window.scrollY - headerHeight > scrollTop) {
          if (i > 0) newActiveIndex = i - 1;
          break;
        }
        newActiveIndex = i;
      }

      setActiveHeadingIndex(newActiveIndex);
    };

    window.addEventListener("scroll", updateActiveHeading);
    updateActiveHeading();

    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [htmlContent, headings]);

  // 更新侧边栏进度条位置
  useEffect(() => {
    if (activeItemRef.current && progressIndicatorRef.current && sidebarRef.current) {
      const sidebar = sidebarRef.current;
      const activeItem = activeItemRef.current;
      const progressIndicator = progressIndicatorRef.current;

      const activeItemTop = activeItem.offsetTop;
      const activeItemHeight = activeItem.offsetHeight;

      progressIndicator.style.top = `${activeItemTop}px`;
      progressIndicator.style.height = `${activeItemHeight}px`;

      const sidebarHeight = sidebar.clientHeight;
      const activeItemBottom = activeItemTop + activeItemHeight;

      if (activeItemTop < sidebar.scrollTop) {
        sidebar.scrollTop = activeItemTop - 20;
      } else if (activeItemBottom > sidebar.scrollTop + sidebarHeight) {
        sidebar.scrollTop = activeItemBottom - sidebarHeight + 20;
      }
    }
  }, [activeHeadingIndex]);

  const renderTopToc = () => {
    if (headings.length === 0) return null;

    return (
      <div className={`top-toc ${isTopTocExpanded ? "expanded" : "collapsed"}`}>
        <div
          className="top-toc-header"
          onClick={() => setIsTopTocExpanded(!isTopTocExpanded)}
        >
          <h3>目录概览</h3>
          <button className="expand-button">{isTopTocExpanded ? "收起" : "展开"}</button>
        </div>

        {isTopTocExpanded && (
          <div className="top-toc-content">
            <ul className="top-toc-list">
              {headings.map((heading, index) => (
                <li
                  key={heading.id}
                  className={`top-toc-item depth-${heading.depth} ${
                    index === activeHeadingIndex ? "active" : ""
                  }`}
                >
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    if (headings.length === 0) return null;

    return (
      <div className="toc-sidebar lg:w-48" ref={sidebarRef}>
        <div className="toc-sidebar-inner">
          <h3>目录</h3>
          <ul>
            {headings.map((heading, index) => (
              <li
                key={heading.id}
                ref={(el) => {
                  sidebarItemsRef.current[index] = el;
                  if (index === activeHeadingIndex) {
                    activeItemRef.current = el;
                  }
                }}
                className={`toc-level-${Math.min(heading.depth, 4)} ${
                  index === activeHeadingIndex ? "active-heading" : ""
                }`}
              >
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="toc-progress-indicator" ref={progressIndicatorRef} />
      </div>
    );
  };

  return (
    <>
      {renderTopToc()}
      <div className="markdown-container">
        {htmlContent && (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
        {renderSidebar()}
      </div>
    </>
  );
};

export default MarkdownRenderer;