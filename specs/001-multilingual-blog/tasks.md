# 任务：多语博客主页

**输入**：来自 `/specs/001-multilingual-blog/` 的设计文档  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`

**测试说明**：本功能规格未强制要求自动化测试，因此本任务清单优先安排可执行的实现与验证任务。
但所有影响布局、导航、文章渲染、图片和本地化回退的改动，都必须包含响应式、无障碍、
链接/资源完整性和构建验证。

**组织方式**：任务按用户故事分组，保证首页、多语博客阅读、手动维护目标语言版本都能独立完成和验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可以并行执行（不同文件、无直接依赖）
- **[Story]**：对应的用户故事编号（`US1`、`US2`、`US3`）
- 每个任务都包含明确文件路径，便于直接执行

## 路径约定

- 源码：`src/`
- 内容：`src/content/`
- 样式：`src/styles/`
- 本地图像：`public/assets/posts/`
- 验证记录：`qa/`

## Phase 1：准备阶段（共享基础）

**目的**：完成静态站点项目初始化、目录搭建和开发约束落地

- [ ] T001 初始化 Astro 项目依赖与构建脚本，在 `package.json`、`astro.config.mjs`、`tsconfig.json` 中建立基础配置
- [ ] T002 建立计划定义的目录骨架，在 `src/components/`、`src/layouts/`、`src/pages/`、`src/content/`、`src/styles/`、`src/utils/`、`public/assets/posts/`、`qa/` 下创建初始结构
- [ ] T003 [P] 配置全站设计令牌与基础样式入口，在 `src/styles/tokens.css`、`src/styles/base.css` 中定义颜色、排版、间距和基础元素样式
- [ ] T004 [P] 配置开发与校验命令，在 `package.json` 中补齐 `dev`、`build`、`check` 等脚本，并确保 `astro check` 可运行

---

## Phase 2：基础能力（阻塞项）

**目的**：完成所有用户故事共享的内容模型、布局、路由和 Markdown 渲染基础

**⚠️ 关键**：本阶段完成前，不得开始任何用户故事开发

- [ ] T005 在 `src/content/config.ts` 中定义个人简介与博客文章的 Content Collections schema，并落实 frontmatter 校验规则
- [ ] T006 [P] 在 `src/utils/i18n.ts`、`src/utils/routes.ts` 中实现中/英/日语言枚举、浏览器语言匹配和路由映射规则
- [ ] T007 [P] 在 `src/layouts/BaseLayout.astro`、`src/components/Header.astro`、`src/components/LanguageSwitcher.astro` 中实现共享布局和 header 语言切换入口
- [ ] T008 [P] 在 `src/layouts/PostLayout.astro`、`src/components/MarkdownContent.astro`、`src/styles/markdown.css` 中建立 Markdown、代码块、图片和 LaTeX 公式渲染基础
- [ ] T009 在 `src/utils/content.ts` 中实现个人简介与博客内容查询、语言版本解析和中文回退逻辑
- [ ] T010 [P] 在 `src/components/LocalizationNotice.astro`、`src/pages/404.astro` 中建立本地化状态提示、缺失内容说明和基础错误页

**检查点**：基础内容模型、共享布局和多语言路由能力已就绪，用户故事可以开始独立推进

---

## Phase 3：用户故事 1 - 浏览多语主页（优先级：P1）🎯 MVP

**目标**：让首次访客在首页快速看到受篇幅约束的个人简介，并通过 header 直接切换语言

**独立验证方式**：打开 `/`、`/en/`、`/ja/` 后，访客能够看到各语言首页；首访按浏览器语言匹配，
且 header 语言切换后保持导航结构与页面核心内容一致

### 用户故事 1 的实现任务

- [ ] T011 [US1] 在 `src/content/profile/bio.zh.md`、`src/content/profile/bio.en.md`、`src/content/profile/bio.ja.md` 中创建个人简介内容文件，落实约定的 frontmatter 和摘要篇幅限制
- [ ] T012 [P] [US1] 在 `src/components/ProfileHero.astro` 中实现首页个人简介主区域，包括名称、一句式介绍和简短摘要
- [ ] T013 [P] [US1] 在 `src/pages/index.astro`、`src/pages/en/index.astro`、`src/pages/ja/index.astro` 中实现多语言首页，并接入 `ProfileHero.astro`
- [ ] T014 [US1] 在 `src/layouts/BaseLayout.astro`、`src/components/LanguageSwitcher.astro` 中接入首访语言匹配与 header 语言切换后的当前路径保持逻辑
- [ ] T015 [US1] 在 `src/pages/index.astro`、`src/pages/en/index.astro`、`src/pages/ja/index.astro`、`src/components/LocalizationNotice.astro` 中补齐个人简介缺失目标语言版本时的中文回退与状态提示
- [ ] T016 [US1] 在 `qa/responsive/homepage.md`、`qa/accessibility/homepage.md` 中记录首页的移动端/桌面端、键盘可访问性和语言切换验证结果

**检查点**：首页已具备个人简介、首访语言匹配和 header 语言切换能力，可作为首个可演示增量

---

## Phase 4：用户故事 2 - 阅读 Markdown 博客（优先级：P2）

**目标**：让访客浏览博客列表并进入支持图片与 LaTeX 的 Markdown 文章详情页

**独立验证方式**：进入博客列表后，访客可以打开任意文章并阅读标题、摘要、图片、代码块与公式；
页面在中/英/日路由下都能正常显示或回退

### 用户故事 2 的实现任务

- [ ] T017 [P] [US2] 在 `src/content/blog/hello-world/index.zh.md`、`src/content/blog/hello-world/index.en.md`、`src/content/blog/hello-world/index.ja.md` 中创建示例多语文章，并在 `public/assets/posts/hello-world/cover.jpg`、`public/assets/posts/hello-world/demo.png` 中放置本地图像资源
- [ ] T018 [P] [US2] 在 `src/components/PostCard.astro` 中实现博客卡片组件，用于列表页展示标题、摘要、日期和封面
- [ ] T019 [US2] 在 `src/pages/blog/index.astro`、`src/pages/en/blog/index.astro`、`src/pages/ja/blog/index.astro` 中实现多语言博客列表页
- [ ] T020 [US2] 在 `src/pages/blog/[slug].astro`、`src/pages/en/blog/[slug].astro`、`src/pages/ja/blog/[slug].astro` 中实现文章详情页，接入 Markdown、KaTeX、本地图像与回退能力
- [ ] T021 [US2] 在 `src/layouts/PostLayout.astro`、`src/components/LocalizationNotice.astro` 中补充文章元数据、语言状态提示和原文入口
- [ ] T022 [US2] 在 `qa/responsive/blog.md`、`qa/accessibility/blog.md`、`qa/links/blog.md` 中记录博客列表与文章详情的阅读、图片、公式和链接验证结果

**检查点**：博客列表和文章详情已可独立工作，Markdown、本地图像和 LaTeX 公式都能稳定展示

---

## Phase 5：用户故事 3 - 维护多语文章内容（优先级：P3）

**目标**：让维护者按文章目录结构与 frontmatter 规范手动维护中/英/日内容，并在缺失目标语言版本时稳定回退

**独立验证方式**：维护者新增一篇中文文章后，可以选择补充英文/日文文件；缺失目标语言版本时，
对应语言路由仍可访问并回退到中文，同时明确显示本地化状态

### 用户故事 3 的实现任务

- [ ] T023 [P] [US3] 在 `src/content/blog/fallback-demo/index.zh.md` 中创建仅含中文原文的示例文章，用于验证缺失目标语言版本时的回退路径
- [ ] T024 [US3] 在 `src/utils/content.ts`、`src/components/LocalizationNotice.astro` 中实现 `source`、`translated`、`fallback` 三种本地化状态解析与展示逻辑
- [ ] T025 [US3] 在 `src/pages/en/index.astro`、`src/pages/ja/index.astro`、`src/pages/en/blog/[slug].astro`、`src/pages/ja/blog/[slug].astro` 中补齐手动维护目标语言版本缺失时的中文回退展示
- [ ] T026 [US3] 在 `README.md`、`specs/001-multilingual-blog/quickstart.md` 中补充博客编写流程、文章目录结构和 Markdown frontmatter 使用说明
- [ ] T027 [US3] 在 `qa/links/localization.md`、`qa/responsive/localization.md` 中记录手动维护目标语言版本、中文回退和原文入口的验证结果

**检查点**：维护者已能按规范新增多语内容，缺失目标语言版本时的回退行为稳定且对访客可解释

---

## 最终阶段：打磨与跨故事事项

**目的**：统一收口界面细节、内容质量和发布前检查

- [ ] T028 [P] 在 `src/layouts/BaseLayout.astro`、`src/utils/routes.ts` 中补齐基础 SEO 元数据与多语言 canonical/alternate 链接信息
- [ ] T029 [P] 在 `src/styles/base.css`、`src/styles/markdown.css` 中统一首页与博客的排版、留白、对比度和阅读节奏
- [ ] T030 在 `qa/responsive/final-check.md` 中汇总首页、博客列表、文章详情在目标移动端与桌面端宽度下的最终响应式检查
- [ ] T031 在 `qa/accessibility/final-check.md` 中汇总 header 语言切换、语义结构、键盘流和对比度检查
- [ ] T032 在 `qa/links/final-check.md` 中汇总语言路由、图片路径、文章链接和回退状态说明的最终检查
- [ ] T033 在 `README.md`、`specs/001-multilingual-blog/quickstart.md` 中完成最终对齐，并按 quickstart 运行完整构建与人工验证流程

---

## 依赖与执行顺序

### Phase 依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础能力（Phase 2）**：依赖准备阶段完成，阻塞所有用户故事
- **用户故事阶段（Phase 3+）**：依赖基础能力完成
- **最终阶段**：依赖所有目标用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：基础能力完成后即可开始，是 MVP
- **用户故事 2（P2）**：基础能力完成后即可开始，但更适合在 US1 之后推进，以复用首页和 header 交互
- **用户故事 3（P3）**：依赖 US2 的博客内容结构与路由，但可以在 US2 完成基础后独立收尾

### 单个用户故事内部顺序

- 先内容/数据文件，再组件，再页面，再验证
- 先共享解析逻辑，再接入具体路由
- 当前故事验证完成后，再进入下一个优先级故事

### 并行机会

- `T003` 与 `T004` 可并行
- `T006`、`T007`、`T008`、`T010` 可并行
- `T012` 与 `T013` 可并行
- `T017` 与 `T018` 可并行
- `T023` 与 `T024` 可并行
- 最终阶段中的 `T028` 与 `T029` 可并行

---

## 用户故事 1 的并行示例

```bash
任务："在 src/components/ProfileHero.astro 中实现首页个人简介主区域"
任务："在 src/pages/index.astro、src/pages/en/index.astro、src/pages/ja/index.astro 中实现多语言首页"
```

## 用户故事 2 的并行示例

```bash
任务："在 src/content/blog/hello-world/index.zh.md、index.en.md、index.ja.md 中创建示例多语文章"
任务："在 src/components/PostCard.astro 中实现博客卡片组件"
```

## 用户故事 3 的并行示例

```bash
任务："在 src/content/blog/fallback-demo/index.zh.md 中创建仅含中文原文的示例文章"
任务："在 src/utils/content.ts、src/components/LocalizationNotice.astro 中实现本地化状态解析与展示逻辑"
```

---

## 实施策略

### 先做 MVP（只完成用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础能力
3. 完成 Phase 3：用户故事 1
4. 停止并验证首页、多语言首访匹配和 header 语言切换
5. 如体验达标，可先演示首页版本

### 增量交付

1. 完成准备阶段与基础能力
2. 交付用户故事 1：多语首页 + 简短个人简介
3. 交付用户故事 2：Markdown 博客列表与详情页
4. 交付用户故事 3：手动维护目标语言版本与回退机制
5. 完成最终阶段打磨并准备发布

### 多人并行策略

1. 一名开发者负责内容模型与路由基础（Phase 1-2）
2. 首页体验、博客阅读体验和内容维护体验可在基础阶段完成后按故事并行推进
3. 最终由一人统一完成样式收口和发布前检查

---

## 备注

- 所有任务均遵循 `- [ ] Txxx ...` 的严格格式
- 用户故事阶段的任务全部带有 `[USx]` 标签
- 每个任务都包含明确文件路径，便于直接执行
- MVP 建议范围是 **用户故事 1**
- 发布前必须完成构建验证、响应式检查、无障碍检查和链接/资源完整性检查
