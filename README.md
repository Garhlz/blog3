# **Garhlz 的个人博客**  
这是一个基于 **Next.js** 和 **Tailwind CSS** 构建的个人博客，采用 **Markdown** 作为内容源，支持 **文章分类、归档** 和 **动态渲染**。博客主要用于记录 **开发日志、刷题笔记** 以及 **技术分享**。  

---

## **技术栈**  
- **框架**：Next.js 14  
- **样式**：Tailwind CSS + 自定义 CSS  
- **字体**：Geist（Next.js 官方字体）  
- **Markdown 处理**：unified, remark, rehype  
- **图标**：Lucide React  

---

## **功能特性**  
✅ **Markdown 渲染**：支持 GFM、数学公式（KaTeX）、代码高亮（Prism）。  
✅ **动态目录**：包含顶部折叠目录和侧边滚动目录，提升阅读体验。  
✅ **响应式设计**：适配桌面与移动端，提供流畅的访问体验。  
✅ **SEO 优化**：使用 `generateMetadata` 生成动态页面标题，提升搜索引擎可见性。  

---

## **页面概览**  
- **🏠 首页 (`app/page.jsx`)**  
  - 展示所有文章列表，按日期降序排列。  
  - 文章包含 **标题、发布日期、阅读时长、分类、摘要**。  
  - 无文章时提供占位提示。  

- **👤 关于 (`app/about/page.jsx`)**  
  - 显示个人介绍，默认从 `content/about.md` 读取内容。  
  - 若文件缺失，则使用默认介绍文案。  

- **📁 归档 (`app/archives/page.jsx`)**  
  - 文章按 **年月归档**，支持日期排序和跳转。  
  - 显示文章总数，方便回顾历史内容。  

- **📂 分类 (`app/categories/page.jsx`)**  
  - 展示所有分类及其文章数量，可点击进入分类详情。  
  - **子分类页面 (`app/categories/[slug]/page.jsx`)**：列出该分类下的文章。  

- **📝 文章详情 (`app/post/[slug]/page.jsx`)**  
  - 根据 **slug** 动态渲染 Markdown 文章。  
  - 支持 **目录导航、分类标签、阅读进度指示器**，优化阅读体验。  

---

## 项目结构
blog3/
├── README.md              # 项目说明文件
├── components.json        # shadcn/ui 组件配置文件
├── jsconfig.json          # JavaScript 路径别名配置
├── next.config.js         # Next.js 配置文件
├── package.json           # 项目依赖和脚本
├── postcss.config.js      # PostCSS 配置（Tailwind 和 Autoprefixer）
├── tailwind.config.js     # Tailwind CSS 配置文件
├── .eslintrc.json         # ESLint 配置
├── app/                   # Next.js App Router 目录
│   ├── globals.css        # 全局样式（包括 Tailwind 和自定义样式）
│   ├── layout.jsx         # 根布局组件（包含 Header 和 Footer）
│   ├── page.jsx           # 首页（文章列表）
│   ├── about/             # 关于页面
│   │   └── page.jsx
│   ├── archives/          # 归档页面
│   │   └── page.jsx
│   ├── categories/        # 分类页面
│   │   ├── page.jsx       # 所有分类概览
│   │   └── [slug]/        # 特定分类详情
│   │       └── page.jsx
│   ├── fonts/             # 字体文件
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   └── post/              # 文章详情页面
│       └── [slug]/        # 动态路由，按 slug 渲染文章
│           └── page.jsx
├── components/            # 可复用组件
│   ├── Footer.jsx         # 页脚组件
│   ├── Header.jsx         # 页眉组件
│   └── MarkdownRenderer.jsx # Markdown 渲染组件（支持目录和代码高亮）
├── content/               # Markdown 文章内容
├── lib/                   # 工具函数和逻辑
│   ├── markdown.js        # Markdown 文件解析逻辑
│   └── utils.js           # Tailwind 样式合并工具
└── public/                # 静态资源
    └── images/            # 图片文件夹


## 开发日志
[开发日志](/content/博客开发日志.md)