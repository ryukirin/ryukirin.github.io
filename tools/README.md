# tools

## import-cnblogs.mjs

从博客园 https://www.cnblogs.com/wakarimasu 抓取 `posts/` 中还没有的文章，导入本仓库：

- 文章链接带或不带 `.html` 都能识别
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

- `posts/cnblogs-<文章 ID>.md` 已存在的文章跳过，正文和 `assets/js/posts.js` 中的元信息都不修改。重新导入某篇文章时，先删除对应的 `.md`，并从 `posts.js` 中删除该条目
- 新文章的元信息只追加到 `posts.js`，不带 `translations`。日文和英文版需要另外添加
- 所有文章导入完成后才写入 `posts.js`。中途失败时，已经写出的 `.md` 没有对应条目，重新运行前先删除这些 `.md`
- 代码块中只有一个非空的 `<script>` 时，只保留其中的 JS 代码
- 引用块中的表格、分段和分隔线会合并成一行文字，段落中的 `<br>` 转成换行后在页面上显示为一段。导入后需要对照原文检查这几处

脚本按 JSON 解析 `assets/js/posts.js`。解析失败时，已有文章元信息按空列表处理，写回后只剩本次导入的文章。
