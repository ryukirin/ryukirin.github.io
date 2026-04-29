# 研究记录：多语博客主页

## 决策 1：采用 Astro 作为静态站点生成器

- **Decision**：使用 Astro 作为站点框架，并以 Content Collections 管理个人简介与博客内容。
- **Rationale**：Astro 天然适合静态部署、内容驱动站点和 Markdown 渲染，能够在不引入
  复杂客户端运行时的前提下完成多语言路由、文章模板、SEO 与 GitHub Pages 发布。
- **Alternatives considered**：
  - 纯 HTML/CSS/JS：起步快，但多语内容管理、frontmatter 校验和文章模板复用能力弱。
  - 以 SPA 为主的前端应用：对个人博客来说过重，不利于静态优先和内容阅读体验。

## 决策 2：v1 不接自动翻译，译文手动维护

- **Decision**：v1 保留多语言内容结构，但不接入自动翻译服务；英文和日文版本由维护者
  手动编写或修订。
- **Rationale**：这样可以避免第三方翻译费用、质量波动和构建链路复杂度，同时仍然保留
  多语扩展能力，符合个人站点低维护优先的目标。
- **Alternatives considered**：
  - Google Cloud Translation API：技术上可行，但会引入费用、凭据管理和翻译质量审核流程。
  - 浏览器实时翻译：控制力弱，无法形成可维护的静态译文页面。

## 决策 3：博客图片采用仓库内本地存储

- **Decision**：文章图片统一存放在仓库内 `public/assets/posts/<slug>/` 目录。
- **Rationale**：本地存储最符合静态站点模型，路径可控、可版本化、可离线构建，也便于在
  frontmatter 中直接引用封面和正文资源。
- **Alternatives considered**：
  - 外部图床：部署简单，但增加外部依赖、链接失效风险和维护成本。
  - Base64 内联：适合极小图标，不适合博客正文图片。

## 决策 4：Markdown 正文支持 LaTeX 数学公式

- **Decision**：使用 Markdown + 数学语法扩展的内容处理链，支持行内与块级 LaTeX 公式。
- **Rationale**：技术分享常涉及公式推导，公式支持应在构建期完成并形成稳定、可读的静态
  页面，避免运行时依赖过重。
- **Alternatives considered**：
  - 不支持公式：会限制技术文章表达能力。
  - 仅截图公式：可读性差、维护成本高、难以响应式适配。

## 决策 5：Bootstrap 仅作为可选样式层，不作为架构核心

- **Decision**：前端架构保持组件化静态站点生成器模式；如需要，可局部使用 Bootstrap 5
  的基础样式或栅格能力，但设计令牌、Markdown 排版和 header 交互由项目自身控制。
- **Rationale**：这样既能获得成熟样式工具的便利，也能避免站点视觉沦为通用模板风格。
- **Alternatives considered**：
  - 全量依赖 Bootstrap 作为视觉基础：速度快，但不利于形成个人站点辨识度。
  - 完全不用任何样式框架：可控性高，但早期排版效率较低。

## 决策 6：博客文章采用“文章目录 + 多语言 Markdown 文件”结构

- **Decision**：每篇文章使用独立目录，并在目录内放置 `index.zh.md`、`index.en.md`、
  `index.ja.md` 等语言版本文件。
- **Rationale**：这种结构最容易把原文、译文与本地图片资源绑定在一起，后续扩展更多
  元数据或附件时也更稳定。
- **Alternatives considered**：
  - 所有文章平铺在一个目录：查找快，但多语言与资源聚合能力弱。
  - 把所有译文拆到独立语言目录：适合大规模内容站点，但对个人博客维护成本偏高。
