"use client";

import { useEffect, useState, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import "katex/dist/katex.min.css";

function extractHeadings() {
  return (tree, file) => {
    const headings = [];
    const idCounts = new Map();
    visit(tree, "heading", (node) => {
      const text = node.children
        .filter((n) => n.type === "text")
        .map((n) => n.value)
        .join("");
      let id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      if (idCounts.has(id)) {
        const count = idCounts.get(id) + 1;
        idCounts.set(id, count);
        id = `${id}-${count}`;
      } else {
        idCounts.set(id, 0);
      }
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.id = id;
      headings.push({ depth: node.depth, text, id });
    });
    file.data.headings = headings;
  };
}

const MarkdownRenderer = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [headings, setHeadings] = useState([]);
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

  useEffect(() => {
    const processContent = async () => {
      try {
        const vfile = await unified()
          .use(remarkParse)
          .use(extractHeadings)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypePrism, { showLineNumbers: true, ignoreMissing: true })
          .use(rehypeKatex)
          .use(rehypeStringify)
          .process(content);
        setHtmlContent(String(vfile));
        setHeadings(vfile.data.headings || []);
      } catch (error) {
        console.error("Error rendering Markdown:", error);
        setHtmlContent("<p>渲染文章时出错，请检查 Markdown 格式。</p>");
      }
    };
    processContent();
  }, [content]);

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

  // 在活动标题变化时更新进度条位置
  useEffect(() => {
    if (activeItemRef.current && progressIndicatorRef.current && sidebarRef.current) {
      const sidebar = sidebarRef.current;
      const activeItem = activeItemRef.current;
      const progressIndicator = progressIndicatorRef.current;
      
      // 计算活动项相对于侧边栏的位置
      const activeItemTop = activeItem.offsetTop;
      const activeItemHeight = activeItem.offsetHeight;
      
      // 更新进度指示器位置，使其对齐到活动项目
      progressIndicator.style.top = `${activeItemTop}px`;
      progressIndicator.style.height = `${activeItemHeight}px`;
      
      // 自动滚动侧边栏，使活动项目可见
      const sidebarHeight = sidebar.clientHeight;
      const activeItemBottom = activeItemTop + activeItemHeight;
      
      if (activeItemTop < sidebar.scrollTop) {
        sidebar.scrollTop = activeItemTop - 20; // 添加一些上部空间
      } else if (activeItemBottom > sidebar.scrollTop + sidebarHeight) {
        sidebar.scrollTop = activeItemBottom - sidebarHeight + 20; // 添加一些下部空间
      }
    }
  }, [activeHeadingIndex]);

  const renderTopToc = () => {
    if (headings.length === 0) return null;
    
    return (
      <div className={`top-toc ${isTopTocExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="top-toc-header" onClick={() => setIsTopTocExpanded(!isTopTocExpanded)}>
          <h3>目录概览</h3>
          <button className="expand-button">
            {isTopTocExpanded ? '收起' : '展开'}
          </button>
        </div>
        
        {isTopTocExpanded && (
          <div className="top-toc-content">
            <ul className="top-toc-list">
              {headings.map((heading, index) => (
                <li 
                  key={heading.id}
                  className={`top-toc-item depth-${heading.depth} ${index === activeHeadingIndex ? 'active' : ''}`}
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
        <div
          className="toc-progress-indicator"
          ref={progressIndicatorRef}
        />
      </div>
    );
  };

  return (
    <>
      {renderTopToc()}
      <div className="markdown-container">
        {htmlContent && <div className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        {renderSidebar()}
      </div>
    </>
  );
};

export default MarkdownRenderer;