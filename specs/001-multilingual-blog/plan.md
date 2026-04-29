# 实施计划：多语博客主页

**分支**：`001-multilingual-blog` | **日期**：2026-04-22 | **规格**：[spec.md](D:\资料\资料\公司\个人\hp\ryukirin.github.io\specs\001-multilingual-blog\spec.md)
**输入**：来自 `/specs/001-multilingual-blog/spec.md` 的功能规格

**说明**：本计划覆盖多语首页、博客列表、Markdown 文章详情、手动维护目标语言版本、header 语言切换，
以及博客文章目录结构与 Markdown frontmatter 规范。

## 摘要

为 `ryukirin.github.io` 建设一个基于静态站点生成器的多语个人站点与博客系统。v1 以
中文为原始内容来源，支持英文和日文版本，首访按浏览器语言匹配，中英日之外回退到中文。
博客内容使用 Markdown 管理，图片保存在仓库内本地文件，支持 LaTeX 数学公式。前端采用
组件化静态生成方案，优先保证 GitHub Pages 兼容、良好的移动端阅读体验和长期低维护成本。

## 技术上下文

**语言/版本**：HTML5、CSS3、TypeScript 5.x、Node.js 20 LTS  
**主要依赖**：Astro 5、Astro Content Collections、Bootstrap 5（可选样式层）、Markdown、
remark-math、rehype-katex  
**存储方式**：仓库内 Markdown 文件、frontmatter 元数据、本地图片资源、静态配置文件  
**测试/验证**：`npm run build`、`astro check`、手工响应式检查、链接与资源核验  
**目标平台**：GitHub Pages、现代桌面与移动浏览器  
**项目类型**：静态个人站点/博客  
**性能目标**：首页与文章页保持轻量首屏；正文、图片与公式渲染不导致主要内容区横向溢出  
**约束条件**：静态部署、header 语言切换、中文原文优先、v1 不接自动翻译、图片本地存储、
LaTeX 公式可读、中文文档优先  
**规模/范围**：首页、博客列表、文章详情、多语言内容组织、内容契约、基础 SEO 与阅读体验

## 宪章检查

*门禁：在 Phase 0 调研前必须通过；Phase 1 设计后需要再次复核。*

- **内容契合度**：通过首页个人简介和技术博客系统直接强化个人表达、日常写作与技术分享。
- **简洁而有质感**：采用组件化静态页面与统一排版系统，控制 Bootstrap 的使用范围，避免模板感过强。
- **静态优先交付**：全部内容在构建期生成，不引入常驻后端或运行时数据库；符合 GitHub Pages 兼容要求。
- **阅读体验**：明确要求移动端/桌面端阅读、Markdown 样式、数学公式和本地图像都保持可读。
- **可持续维护**：通过统一目录结构、frontmatter 规范和手动多语内容模型降低长期维护成本。
- **中文文档**：计划、研究、数据模型、契约和 quickstart 均以中文撰写。

## 项目结构

### 文档（当前功能）

```text
specs/001-multilingual-blog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-schema.md
│   └── routes.md
└── tasks.md
```

### 源码（仓库根目录）

```text
/
├── astro.config.mjs
├── package.json
├── public/
│   └── assets/
│       └── posts/
│           └── <post-slug>/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── LanguageSwitcher.astro
│   │   ├── PostCard.astro
│   │   └── MarkdownContent.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── profile/
│   │   │   ├── bio.zh.md
│   │   │   ├── bio.en.md
│   │   │   └── bio.ja.md
│   │   └── blog/
│   │       └── <post-slug>/
│   │           ├── index.zh.md
│   │           ├── index.en.md
│   │           └── index.ja.md
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   └── blog/
│   │   └── ja/
│   │       ├── index.astro
│   │       └── blog/
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   └── markdown.css
│   └── utils/
│       ├── i18n.ts
│       ├── content.ts
│       └── routes.ts
└── qa/
    ├── responsive/
    ├── accessibility/
    └── links/
```

**结构决策**：采用 Astro 静态站点生成器 + Content Collections 组织内容。页面、内容、
样式和路由分别放在 `src/pages`、`src/content`、`src/styles` 和 `src/utils`。博客图片统一
进入 `public/assets/posts/<slug>/`，文章目标语言版本与中文原文按同一文章目录归档，便于维护和发布。

## 复杂度记录

> 当前无宪章偏离项，无需额外复杂度豁免。
