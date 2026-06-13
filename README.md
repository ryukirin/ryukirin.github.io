# Kylin Blog

一个纯静态个人博客，不依赖框架和构建步骤，直接部署到 GitHub Pages。

## 结构

- `index.html`：个人主页
- `blog/index.html`：博客列表
- `blog/post.html`：文章详情页
- `posts/`：Markdown 文章
- `assets/js/posts.js`：文章元信息
- `assets/js/giscus.js`：GitHub Discussions / Giscus 评论配置
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
- GitHub Discussions / Giscus 评论

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

## 评论

文章页已经接入 GitHub Discussions / Giscus。评论配置集中在：

```text
assets/js/giscus.js
```

当前映射方式使用文章 `slug` 生成固定 discussion 标题：

```text
blog:<slug>
```

例如：

```text
blog:cnblogs-17xxxx
```

这种方式不依赖文章标题或页面 URL，后续改标题、改域名或调整详情页路径时，评论仍能稳定对应到同一篇文章。

启用前需要在 GitHub / Giscus 完成：

- 仓库开启 Discussions
- 安装 giscus GitHub App
- 在 giscus.app 选择 `ryukirin/ryukirin.github.io`
- 分类建议选择 `Announcements`
- 映射关系选择 `Discussion 的标题包含特定字符串`
- 勾选 `使用严格的标题匹配`
- 将生成配置里的 `data-category-id` 填入 `assets/js/giscus.js` 的 `categoryId`

`Announcements` 分类可以限制普通用户手动新建 discussion；文章对应的 discussion 创建后，登录 GitHub 的访客仍然可以在文章页评论。

## 计划

- 文章数量继续增加后，再考虑标签页或搜索
