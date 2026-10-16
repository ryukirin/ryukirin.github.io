# Kylin Blog

Kylin 的个人博客，站点地址 https://ryukirin.github.io/

纯静态站点，不使用框架，没有构建步骤。仓库里的 HTML、CSS、JavaScript、Markdown 和图片文件由 GitHub Pages 直接发布。

## 功能

- 中文、英文、日文三种语言，页面上切换
- 文章列表页按关键词和标签筛选。点击文章上的标签，跳转到按该标签筛选的列表
- Markdown 支持 GFM 表格、Mermaid 图表、KaTeX 公式和代码高亮
- 文章详情页自动生成目录，显示上一篇、下一篇
- 手机宽度下导航收起为语言按钮和菜单按钮，文章详情页不显示目录
- 评论使用 Giscus，数据保存在本仓库的 GitHub Discussions

## 本地预览

需要 Python 3。在仓库根目录运行：

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

装有 Node.js 时也可以运行 `npm run serve`，执行的是同一条命令。

浏览器打开 http://127.0.0.1:8000/ 。文章详情页通过 `fetch()` 加载 Markdown，直接双击打开 HTML 文件时正文无法加载。

## 写文章

每篇文章用一个 slug 标识，slug 同时用于文件名、URL 和评论映射。一篇文章涉及的文件如下。

| 文件 | 内容 |
| --- | --- |
| `posts/<slug>.md` | 中文正文 |
| `posts/en/<slug>.md` | 英文正文 |
| `posts/ja/<slug>.md` | 日文正文 |
| `assets/posts/<slug>/` | 文章图片 |
| `assets/js/posts.js` | 文章元信息 |

### 步骤

1. 在 `posts/` 下新建 `<slug>.md`，写中文正文。
2. 把英文和日文译文分别放到 `posts/en/<slug>.md` 和 `posts/ja/<slug>.md`。
3. 图片放到 `assets/posts/<slug>/`，正文中用绝对路径引用，例如 `![说明](/assets/posts/<slug>/image-01.png)`。
4. 在 `assets/js/posts.js` 的数组中添加文章元信息：

   ```json
   {
     "slug": "my-new-post",
     "title": "文章标题",
     "description": "一句话摘要",
     "date": "2026-10-14T20:00:00+09:00",
     "tags": ["Note"],
     "translations": {
       "en": { "title": "Post title", "description": "One-line summary", "tags": ["Note"] },
       "ja": { "title": "記事タイトル", "description": "一行の概要", "tags": ["Note"] }
     }
   }
   ```

5. 更新 `index.html`、`blog/index.html`、`blog/post.html` 中 `posts.js?v=` 的版本号，格式为当天日期加序号，例如 `20261014-1`。

文章详情页的地址是 `/blog/post.html?slug=<slug>`，英文版和日文版在后面加 `&lang=en` 或 `&lang=ja`。

### 注意事项

- 标题、摘要、日期、标签都从文章元信息读取。正文开头的 `# 标题` 和 frontmatter 不会显示在文章详情页上。
- 文章元信息里没有 `translations.en` 或 `translations.ja` 时，这篇文章不出现在对应语言的文章列表中。
- `posts.js` 中的数组要保持合法 JSON，键名加双引号，不留尾逗号。
- 文章发布后修改 slug，原有评论不再显示。

### Markdown 扩展语法

除 GFM 外，文章还支持下面几种写法：

- Mermaid：语言标记为 `mermaid` 的代码块
- KaTeX：行内公式用 `$...$` 或 `\(...\)`，块级公式用 `$$...$$` 或 `\[...\]`
- 代码高亮：代码块按语言标记高亮，例如 ` ```python `。没有语言标记的代码块按文章标签推断语言（对应关系见 `assets/js/post.js` 的 `CODE_LANGUAGE_HINTS`），标签对应不到语言时，在常见语言中自动识别，识别把握度不够时不高亮。写新文章时建议加上语言标记。新增的标签需要对应某种语言时，在 `CODE_LANGUAGE_HINTS` 中添加

````markdown
```mermaid
flowchart LR
  A[想法] --> B[整理] --> C[发布]
```

行内公式 $E = mc^2$

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$
````

## 发布

GitHub Pages 的发布源是 `main` 分支的根目录，改动推送到 `main` 后自动发布。

HTML 用 `?v=` 版本号引用 CSS 和 JS。修改这些文件后要同时更新版本号，否则浏览器可能继续使用缓存。

根目录的 `.nojekyll` 用于关闭 Jekyll 处理，需要保留。

## 目录结构

```text
index.html             个人主页
blog/index.html        文章列表页
blog/post.html         文章详情页
posts/                 中文正文，en/ 和 ja/ 下为译文
assets/posts/<slug>/   文章图片
assets/js/posts.js     文章元信息
assets/js/i18n.js      三种语言的界面文案、语言切换、手机端导航、标签链接
assets/js/post.js      文章详情页的正文渲染、目录和代码高亮
assets/js/giscus.js    Giscus 评论配置
assets/css/site.css    全站样式
assets/icons/          头像、站点图标和社交图标
tools/                 博客园旧文的导入脚本
```

导入脚本的用法和注意事项见 [tools/README.md](tools/README.md)。
