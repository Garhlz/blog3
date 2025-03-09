---
title: 博客使用指南
date: 2023-12-15
categories: [开始]
tags: Markdown, Next.js, 博客
---

# 博客使用指南

欢迎使用这个基于Next.js和Tailwind CSS构建的博客系统！本文将介绍如何使用博客的各项功能，特别是分类和归档系统。

## 文章格式

每篇文章都是一个Markdown文件，存放在`content`目录下。文件名将作为文章的URL slug。例如，`blog-usage-guide.md`的访问地址为`/post/blog-usage-guide`。

### Frontmatter

每篇文章的开头可以包含frontmatter，用三个短横线`---`包围。frontmatter中可以定义以下属性：

