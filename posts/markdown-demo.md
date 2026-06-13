---
title: "Markdown 显示测试"
description: "一篇用于检查标题、列表、引用、代码块和链接样式的示例文章。"
date: "2026-06-12"
tags: ["Markdown", "Design"]
---

## 二级标题

这是一段普通正文。正文行宽会被限制在适合阅读的范围内，桌面端不会铺得太宽，手机端也不会横向溢出。

### 列表

- 支持无序列表。
- 支持 **粗体** 和 `行内代码`。
- 支持 [链接](https://github.com/ryukirin)。

1. 也支持有序列表。
2. 样式尽量克制。
3. 阅读优先。

> 引用块用于记录补充说明。它应该明显但不喧宾夺主。

### 代码块

```js
const site = {
  framework: "none",
  hosting: "GitHub Pages",
  content: "Markdown"
};

console.log(site);
```

### Mermaid 流程图

```mermaid
flowchart LR
  idea[写下想法] --> draft[整理成 Markdown]
  draft --> preview[本地预览]
  preview --> publish[发布到 GitHub Pages]
```

### 数学公式

行内公式可以写成 `$E = mc^2$`。

块级公式可以写成：

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$

## 下一步

等首页、列表和文章页确认满意后，再加 RSS、GitHub Discussions 评论和更完整的文章元信息。
