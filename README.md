# Kylin Personal Blog

一个无框架静态个人网站，直接由 GitHub Pages 托管。

## 当前范围

- 个人主页：`index.html`
- 博客列表：`blog/index.html`
- 文章详情：`blog/post.html?slug=<post-slug>`
- Markdown 内容：`posts/*.md`
- 文章清单：`assets/js/posts.js`
- 样式：Bootstrap CDN + `assets/css/site.css`

## 写新文章

1. 在 `posts/` 新增 `<slug>.md`。
2. 在 `assets/js/posts.js` 添加同名 `slug` 的元信息。
3. 推送到 GitHub Pages。

## 本地预览

因为文章页会通过 `fetch()` 读取 Markdown 文件，请通过静态服务器访问，而不是直接双击 HTML。

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 后续计划

- v1.1：接入 GitHub Discussions / Giscus 评论。
- v1.2：按标签聚合文章。
- v1.2：按文章数量考虑搜索。
