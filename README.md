# Kylin Blog

这是一个部署在 GitHub Pages 上的纯静态个人博客。仓库不依赖框架，也没有必需的构建步骤；HTML、CSS、JavaScript、Markdown 和本地图片文件就是最终发布内容。

## 项目结构

- `index.html`：个人主页
- `blog/index.html`：博客列表页
- `blog/post.html?slug=<slug>`：文章详情页
- `posts/`：Markdown 文章正文
- `assets/js/posts.js`：文章元信息列表
- `assets/js/markdown.js`：Markdown 渲染和增强逻辑
- `assets/js/giscus.js`：GitHub Discussions / Giscus 评论配置
- `assets/posts/<slug>/`：文章本地图片资源
- `assets/icons/`：头像、站点图标和社交图标
- `assets/css/site.css`：全站共享样式
- `tools/import-cnblogs.mjs`：博客园文章导入脚本

## 本地预览

文章详情页通过 `fetch()` 加载 `posts/*.md`，因此需要用本地静态服务器预览。

```powershell
npm run serve
```

等价于：

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8000/
```

## 写新文章

新增文章需要同时添加 Markdown 文件和文章元信息。

1. 在 `posts/` 下新增 Markdown 文件，例如：

```text
posts/my-new-post.md
```

2. 在 `assets/js/posts.js` 中添加同名 `slug`：

```js
{
  slug: "my-new-post",
  title: "文章标题",
  description: "一句话摘要",
  date: "2026-06-13T20:00:00+09:00",
  tags: ["Note"]
}
```

3. 如有图片，放到对应的本地资源目录：

```text
assets/posts/my-new-post/
```

文章访问路径为：

```text
/blog/post.html?slug=my-new-post
```

## Markdown 支持

文章页使用 CDN 版 `marked` 和 `DOMPurify` 渲染 Markdown，并在渲染后增强这些能力：

- GFM 表格
- 代码块
- 图片
- Mermaid 图表
- KaTeX 数学公式
- 根据 `h2` / `h3` 自动生成目录
- 上一篇 / 下一篇导航
- GitHub Discussions / Giscus 评论

Mermaid 示例：

````markdown
```mermaid
flowchart LR
  A[想法] --> B[整理] --> C[发布]
```
````

数学公式示例：

```markdown
行内公式：$E = mc^2$

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$
```

## 博客园导入

部分文章来自博客园旧文。需要重新导入时运行：

```powershell
node tools/import-cnblogs.mjs
```

导入脚本会处理标题、发布时间、分类标签、正文 Markdown、本地图片保存、HTML 表格转换和代码块清洗。

导入脚本不会抓取评论，也不会在正文里加入博客园原文链接。

## 评论配置

文章页已经接入 GitHub Discussions / Giscus，配置集中在：

```text
assets/js/giscus.js
```

当前映射方式使用文章 `slug` 生成固定 discussion 标题：

```text
blog:<slug>
```

这种方式不依赖文章标题或页面 URL。后续即使改标题、改域名或调整详情页路径，评论仍能稳定对应到同一篇文章。

如果重新配置 Giscus，需要确认：

- 仓库开启 Discussions
- 已安装 giscus GitHub App
- 在 giscus.app 选择 `ryukirin/ryukirin.github.io`
- 分类使用 `Announcements`
- 映射关系选择 `Discussion 的标题包含特定字符串`
- 勾选 `使用严格的标题匹配`
- 将生成配置里的 `data-category-id` 填入 `assets/js/giscus.js` 的 `categoryId`

`Announcements` 分类可以限制普通用户手动新建 discussion；文章对应的 discussion 创建后，登录 GitHub 的访客仍然可以在文章页评论。

## 发布

仓库可以直接通过 GitHub Pages 发布静态文件。更新文章、样式或脚本后提交并推送到 GitHub 即可。

## 维护约定

- 不需要引入 Astro、Spec Kit 或其他构建目录。
- 新文章必须同时更新 `posts/*.md` 和 `assets/js/posts.js`。
- 图片资源保存在仓库内，避免热链接远程图片。
- 从博客园导入内容时，不导入评论，也不在正文追加原文链接。
