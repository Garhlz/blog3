"use client";

import { useEffect, useState, useRef } from "react";
import "katex/dist/katex.min.css";

const MarkdownRenderer = ({ htmlContent, headings }) => {
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(-1);
  const [isTopTocExpanded, setIsTopTocExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const sidebarItemsRef = useRef([]);
  const activeItemRef = useRef(null);
  const progressIndicatorRef = useRef(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    sidebarItemsRef.current = Array(headings.length).fill(null);
  }, [headings]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        setTimeout(() => {
          isScrollingRef.current = true;
          targetElement.scrollIntoView({ behavior: "smooth" });
          const index = headings.findIndex((h) => h.id === hash);
          if (index !== -1) setActiveHeadingIndex(index);
          setTimeout(() => (isScrollingRef.current = false), 500);
        }, 100);
      }
    }
  }, [headings]);

  useEffect(() => {
    const updateActiveHeading = () => {
      if (isScrollingRef.current) return;

      const scrollTop = window.scrollY;
      const headerHeight = 80;

      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean);

      if (headingElements.length === 0) {
        setActiveHeadingIndex(-1);
        return;
      }

      let newActiveIndex = -1;
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const rect = headingElements[i].getBoundingClientRect();
        if (rect.top + window.scrollY - headerHeight <= scrollTop + 10) {
          newActiveIndex = i;
          break;
        }
      }
      if (newActiveIndex === -1 && scrollTop < headingElements[0].getBoundingClientRect().top + window.scrollY) {
        newActiveIndex = 0;
      }

      if (newActiveIndex !== activeHeadingIndex) {
        setActiveHeadingIndex(newActiveIndex);
        if (newActiveIndex >= 0) {
          const newHash = headings[newActiveIndex].id;
          window.history.replaceState(null, null, `#${newHash}`);
        } else {
          window.history.replaceState(null, null, window.location.pathname);
        }
      }
    };

    window.addEventListener("scroll", updateActiveHeading);
    updateActiveHeading();
    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [headings, activeHeadingIndex]);

  useEffect(() => {
    if (
      activeItemRef.current &&
      progressIndicatorRef.current &&
      sidebarRef.current &&
      activeHeadingIndex >= 0 &&
      !isScrollingRef.current
    ) {
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

  const handleTocClick = (id, index) => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      isScrollingRef.current = true;
      targetElement.scrollIntoView({ behavior: "smooth" });
      setActiveHeadingIndex(index);
      window.history.replaceState(null, null, `#${id}`);
      setTimeout(() => (isScrollingRef.current = false), 500);
    }
  };

  const renderTopToc = () => {
    if (!headings || headings.length === 0) return null;

    return (
      <div className={`top-toc ${isTopTocExpanded ? "expanded" : "collapsed"}`}>
        <div className="top-toc-header" onClick={() => setIsTopTocExpanded(!isTopTocExpanded)}>
          <h3>目录概览</h3>
          <button className="expand-button">{isTopTocExpanded ? "收起" : "展开"}</button>
        </div>
        {isTopTocExpanded && (
          <div className="top-toc-content">
            <ul className="top-toc-list">
              {headings.map((heading, index) => (
                <li
                  key={index} // 使用 index 作为 key
                  className={`top-toc-item depth-${heading.depth} ${
                    index === activeHeadingIndex ? "active" : ""
                  }`}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleTocClick(heading.id, index);
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    if (!headings || headings.length === 0) return null;

    return (
      <div className="toc-sidebar lg:w-48" ref={sidebarRef}>
        <div className="toc-sidebar-inner">
          <h3>目录</h3>
          <ul>
            {headings.map((heading, index) => (
              <li
                key={index} // 使用 index 作为 key
                ref={(el) => {
                  sidebarItemsRef.current[index] = el;
                  if (index === activeHeadingIndex) activeItemRef.current = el;
                }}
                className={`toc-level-${Math.min(heading.depth, 4)} ${
                  index === activeHeadingIndex ? "active-heading" : ""
                }`}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTocClick(heading.id, index);
                  }}
                >
                  {heading.text}
                </a>
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
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        )}
        {renderSidebar()}
      </div>
    </>
  );
};

export default MarkdownRenderer;