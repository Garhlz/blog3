---
title: Markdown 与 LaTeX 语法速查  
date: 2025-03-10  
categories: [Markdown,LaTeX ]  
excerpt: Markdown 与 LaTeX 语法简介
---

# Markdown 与 LaTeX 语法速查

## 目录
1. [Markdown 基础语法](#markdown-基础语法)
2. [LaTeX 基础语法](#latex-基础语法)
3. [组合使用场景](#组合使用场景)

---

## Markdown 基础语法

### 1. 标题
```markdown
# H1 标题
## H2 标题
### H3 标题
#### H4 标题
```

### 2. 文本样式

```markdown
*斜体* 或 _斜体_
**粗体** 或 __粗体__
***粗斜体*** 或 ___粗斜体__
~~删除线~~
```

### 3. 列表

```markdown
- 无序列表项
* 另一种无序列表
1. 有序列表项
```

### 4. 链接与图片

```markdown
[链接文字](https://example.com)
![图片描述](image.jpg)
```

### 5. 代码

```
行内代码
代码块
```

### 6. 表格

```markdown
| 左对齐 | 居中对齐 | 右对齐 |
| :----- | :------: | -----: |
| 内容1  |  内容2   |   内容3|
```

### 7. 其他

```markdown
> 引用文本
---
***（水平分割线）
\* 转义符号
```

------

## LaTeX 基础语法

### 1. 文档结构

```latex
\documentclass{article}
\usepackage{amsmath} % 引入宏包
\begin{document}
% 正文内容
\end{document}
```

### 2. 数学公式

#### 行内公式

`$E=mc^2$` → *E*=*m**c*2

#### 行间公式

```latex
$$
\int_{a}^{b} f(x)dx
$$
```

$$
\int_{a}^{b} f(x)dx
$$

### 3. 常用符号

```latex
\alpha \beta \gamma   → α β γ
\sum \prod \lim       → ∑ ∏ lim
\rightarrow \geq      → → ≥
```

$$\alpha \beta \gamma 
\sum \prod \lim
\rightarrow \geq $$

### 4. 复杂公式示例

```latex
\begin{equation}
\frac{\partial u}{\partial t} = \nabla^2 u
\end{equation}
```

$$\begin{equation}
\frac{\partial u}{\partial t} = \nabla^2 u
\end{equation}$$

### 5. 列表与章节

```latex
\section{章节标题}
\begin{itemize}
    \item 无序列表
\end{itemize}

\begin{enumerate}
    \item 有序列表
\end{enumerate}
```

### 6. 交叉引用

latex

```latex
\label{eq:1}
参见公式\eqref{eq:1}
```

------

## 组合使用场景

### 在Markdown中嵌入LaTeX

当需要显示公式时：
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

或者行内公式：$\sum_{i=1}^n i = \frac{n(n+1)}{2}$
