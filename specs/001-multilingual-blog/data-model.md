# 数据模型：多语博客主页

## 1. 个人简介文档（ProfileEntry）

### 作用

用于驱动首页核心的个人简介区域，并为中文、英文、日文分别提供可发布内容。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 固定为 `profile` |
| `locale` | enum | 是 | `zh` / `en` / `ja` |
| `name` | string | 是 | 对外展示的名称或称呼 |
| `headline` | string | 是 | 一句式自我介绍 |
| `summary` | string | 是 | 简短个人简介，控制为 1 至 3 句、中文约 40 至 120 字 |
| `translationKey` | string | 是 | 多语言版本共享的分组键，固定为 `profile` |
| `sourceLocale` | enum | 是 | v1 固定为 `zh` |
| `localizationStatus` | enum | 是 | `source` / `translated` / `fallback` |
| `updatedAt` | date | 否 | 最近更新时间 |

### 约束

- `zh` 版本必须存在。
- `en` 与 `ja` 可延后补齐，但缺失时页面必须能回退到中文。
- `summary` 需要适配首页短文案场景，不适合长段履历，并应控制在首屏可稳定展示的篇幅内。

## 2. 博客文章（BlogPost）

### 作用

用于描述单篇博客文章在不同语言下的内容、展示元数据和资源引用。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 文章标题 |
| `slug` | string | 是 | 文章唯一标识，用于目录与路由 |
| `locale` | enum | 是 | `zh` / `en` / `ja` |
| `sourceLocale` | enum | 是 | v1 固定为 `zh` |
| `translationKey` | string | 是 | 多语言版本共享分组键，通常等于 `slug` |
| `date` | date | 是 | 文章发布日期 |
| `summary` | string | 是 | 列表页摘要 |
| `tags` | string[] | 否 | 标签列表 |
| `cover` | string | 否 | 封面图路径，指向仓库内本地资源 |
| `coverAlt` | string | 否 | 封面替代文本 |
| `localizationStatus` | enum | 是 | `source` / `translated` / `fallback` |
| `math` | boolean | 否 | 是否包含数学公式 |
| `draft` | boolean | 否 | 是否草稿 |
| `body` | markdown | 是 | Markdown 正文 |

### 约束

- `slug + locale` 必须唯一。
- 中文原文版本必须存在，且 `localizationStatus=source`。
- 非中文文章如果正文缺失，可使用中文回退，但必须在页面中体现状态。
- `math=true` 的文章必须允许行内与块级 LaTeX 公式渲染。
- `cover` 路径若存在，必须落在 `public/assets/posts/<slug>/` 下。

## 3. 本地化内容版本（LocalizedVariant）

### 作用

描述个人简介或博客文章在某个目标语言下的可用状态，用于语言切换和回退判断。

### 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `translationKey` | string | 是 | 内容分组键 |
| `locale` | enum | 是 | 目标语言 |
| `sourceLocale` | enum | 是 | 原始语言，v1 为 `zh` |
| `localizationStatus` | enum | 是 | `source` / `translated` / `fallback` |
| `path` | string | 是 | 对应内容文件路径或路由 |
| `available` | boolean | 是 | 当前语言内容是否真实存在 |

### 状态规则

- `source`：中文原文，真实存在。
- `translated`：英文或日文版本真实存在。
- `fallback`：当前语言内容缺失，页面回退到中文原文展示，并附带状态说明。

## 4. 博客文章目录结构

```text
src/content/blog/
└── my-first-post/
    ├── index.zh.md
    ├── index.en.md
    └── index.ja.md

public/assets/posts/
└── my-first-post/
    ├── cover.jpg
    └── diagram.png
```

## 5. Markdown Frontmatter 规范

### 博客文章 frontmatter

```yaml
---
title: "我的第一篇博客"
slug: "my-first-post"
locale: "zh"
sourceLocale: "zh"
translationKey: "my-first-post"
date: "2026-04-22"
summary: "一篇用于验证多语博客结构的示例文章。"
tags:
  - "blog"
  - "math"
cover: "/assets/posts/my-first-post/cover.jpg"
coverAlt: "文章封面图说明"
localizationStatus: "source"
math: true
draft: false
---
```

### 个人简介 frontmatter

```yaml
---
id: "profile"
locale: "zh"
sourceLocale: "zh"
translationKey: "profile"
name: "Ryukirin"
headline: "写博客，也做技术分享"
summary: "这里放一段简短的个人介绍，不超过首页可承受篇幅。"
localizationStatus: "source"
updatedAt: "2026-04-22"
---
```
