# 快速开始：多语博客主页

## 1. 初始化项目

```bash
npm install
npm run dev
```

本地开发完成后，使用以下命令验证：

```bash
astro check
npm run build
```

## 2. 创建个人简介内容

在 `src/content/profile/` 下创建：

```text
bio.zh.md
bio.en.md
bio.ja.md
```

示例：

```md
---
id: "profile"
locale: "zh"
sourceLocale: "zh"
translationKey: "profile"
name: "Ryukirin"
headline: "写博客，也做技术分享"
summary: "这里是一段简短的个人介绍。"
localizationStatus: "source"
updatedAt: "2026-04-22"
---
```

## 3. 创建博客文章目录

为每篇文章建立独立目录：

```text
src/content/blog/
└── my-first-post/
    ├── index.zh.md
    ├── index.en.md
    └── index.ja.md
```

同时在仓库内放置图片：

```text
public/assets/posts/
└── my-first-post/
    ├── cover.jpg
    └── demo.png
```

## 4. 编写 Markdown frontmatter

中文原文示例：

```md
---
title: "我的第一篇博客"
slug: "my-first-post"
locale: "zh"
sourceLocale: "zh"
translationKey: "my-first-post"
date: "2026-04-22"
summary: "这是一篇用于验证博客结构的示例文章。"
tags:
  - "blog"
  - "math"
cover: "/assets/posts/my-first-post/cover.jpg"
coverAlt: "封面图说明"
localizationStatus: "source"
math: true
draft: false
---

这里是正文。

行内公式：$E = mc^2$

块级公式：

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

英文或日文版本将 `locale` 改为 `en` 或 `ja`，并把 `localizationStatus` 改为
`translated`。如果对应目标语言版本尚未完成，则可以先不创建该文件，页面会按契约回退到中文。

## 5. 验证关键体验

- 首页必须展示姓名/称呼、一句式介绍和 1 至 3 句的个人简介摘要。
- 语言切换入口必须出现在 `header`。
- 中文、英文、日文首访语言匹配要符合浏览器语言规则。
- 博客列表必须能进入文章详情页。
- 文章中的本地图像必须加载正常。
- Markdown 代码块、引用、列表和 LaTeX 公式必须保持可读。

## 6. 发布前检查

- 运行构建命令并确认无错误。
- 手工检查移动端和桌面端宽度。
- 检查图片路径、文章链接、语言切换和回退说明。
- 确认缺失目标语言版本时的回退状态文案清晰可见。
