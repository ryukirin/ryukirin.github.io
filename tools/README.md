# tools

## import-cnblogs.mjs

从博客园 https://www.cnblogs.com/wakarimasu 抓取全部文章，导入本仓库：

- 正文转换为 Markdown，写入 `posts/cnblogs-<文章 ID>.md`
- 图片下载到 `assets/posts/cnblogs-<文章 ID>/`
- 标题、自动生成的摘要、发布时间、分类标签合并到 `assets/js/posts.js`
- 不抓取评论，正文中不加博客园原文链接

### 运行

需要 Node.js 18 或更高版本。在仓库根目录运行：

```powershell
node tools/import-cnblogs.mjs
```

### 注意事项

重新导入会覆盖已有内容：

- `posts/cnblogs-*.md` 的正文被重写
- `assets/js/posts.js` 中 slug 相同的文章元信息整条替换，手工修改过的摘要和 `translations` 会丢失
- `posts/en/`、`posts/ja/` 下的译文文件不变，但文章元信息中的 `translations` 丢失后，这些文章不再出现在英文和日文的文章列表中

脚本按 JSON 解析 `assets/js/posts.js`。解析失败时，已有文章元信息按空列表处理，写回后只剩本次导入的文章。
