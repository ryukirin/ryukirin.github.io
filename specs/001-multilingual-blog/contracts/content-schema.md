# 内容契约：目录结构与 Frontmatter

## 1. 目录契约

### 个人简介

```text
src/content/profile/
├── bio.zh.md
├── bio.en.md
└── bio.ja.md
```

### 博客文章

```text
src/content/blog/
└── <post-slug>/
    ├── index.zh.md
    ├── index.en.md
    └── index.ja.md
```

### 本地图像

```text
public/assets/posts/
└── <post-slug>/
    ├── cover.jpg
    └── other-images.png
```

## 2. Frontmatter 契约

### 博客文章字段

| 字段 | 必填 | 类型 | 约束 |
|------|------|------|------|
| `title` | 是 | string | 当前语言标题 |
| `slug` | 是 | string | 与文章目录保持一致 |
| `locale` | 是 | string | `zh` / `en` / `ja` |
| `sourceLocale` | 是 | string | v1 固定为 `zh` |
| `translationKey` | 是 | string | 多语言共享标识，通常与 `slug` 一致 |
| `date` | 是 | string | ISO 日期 |
| `summary` | 是 | string | 列表摘要 |
| `tags` | 否 | string[] | 标签数组 |
| `cover` | 否 | string | 站内本地图像路径 |
| `coverAlt` | 否 | string | 图像替代文本 |
| `localizationStatus` | 是 | string | `source` / `translated` / `fallback` |
| `math` | 否 | boolean | 是否启用数学公式渲染 |
| `draft` | 否 | boolean | 是否草稿 |

### 个人简介字段

| 字段 | 必填 | 类型 | 约束 |
|------|------|------|------|
| `id` | 是 | string | 固定为 `profile` |
| `locale` | 是 | string | `zh` / `en` / `ja` |
| `sourceLocale` | 是 | string | v1 固定为 `zh` |
| `translationKey` | 是 | string | 固定为 `profile` |
| `name` | 是 | string | 展示名称 |
| `headline` | 是 | string | 一句式介绍 |
| `summary` | 是 | string | 简短介绍正文，控制为 1 至 3 句、中文约 40 至 120 字 |
| `localizationStatus` | 是 | string | `source` / `translated` / `fallback` |
| `updatedAt` | 否 | string | ISO 日期 |

## 3. 示例

```yaml
---
title: "多语博客示例"
slug: "multilingual-blog-demo"
locale: "zh"
sourceLocale: "zh"
translationKey: "multilingual-blog-demo"
date: "2026-04-22"
summary: "演示文章目录结构与 frontmatter 规范。"
tags:
  - "astro"
  - "i18n"
cover: "/assets/posts/multilingual-blog-demo/cover.jpg"
coverAlt: "示例封面"
localizationStatus: "source"
math: true
draft: false
---
```
