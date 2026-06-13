# Kylin Blog

一个纯静态个人博客，不依赖框架和构建步骤，直接部署到 GitHub Pages。

## 结构

- `index.html`：个人主页
- `blog/index.html`：博客列表
- `blog/post.html`：文章详情页
- `posts/`：Markdown 文章
- `assets/js/posts.js`：文章元信息
- `assets/posts/`：文章图片
- `assets/icons/`：站点头像和图标
- `assets/css/site.css`：全站样式
- `tools/import-cnblogs.mjs`：博客园文章导入脚本

## 写新文章

在 `posts/` 新增 Markdown 文件，例如：

```text
posts/my-new-post.md
```

然后在 `assets/js/posts.js` 添加同名 `slug`：

```js
{
  slug: "my-new-post",
  title: "文章标题",
  description: "一句话摘要",
  date: "2026-06-13T20:00:00+09:00",
  tags: ["Note"]
}
```

访问路径：

```text
/blog/post.html?slug=my-new-post
```

## Markdown 支持

文章详情页使用 `marked` 渲染 Markdown，并支持：

- GFM 表格
- 代码块
- 图片
- Mermaid 图表
- KaTeX 数学公式
- 自动生成目录
- 上一篇 / 下一篇

Mermaid 写法：

```markdown
```mermaid
flowchart LR
  A[想法] --> B[整理] --> C[发布]
```
```

数学公式写法：

```markdown
行内公式：$E = mc^2$

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$
```

## 博客园导入

部分内容整理自博客园旧文。重新导入时运行：

```powershell
node tools/import-cnblogs.mjs
```

导入脚本会处理：

- 标题
- 发布时间
- 分类和标签
- 正文 Markdown
- 本地图片保存
- HTML 表格转换
- 代码块清洗

导入脚本不会抓取评论，也不会在正文里加入博客园原文链接。

## 计划

- 接入 GitHub Discussions / Giscus 评论
- 文章数量继续增加后，再考虑标签页或搜索
