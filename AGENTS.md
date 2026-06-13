# Project Notes

This repository is a plain static personal blog.

- No framework or build step is required.
- Entry page: `index.html`
- Blog list: `blog/index.html`
- Blog detail page: `blog/post.html?slug=<slug>`
- Markdown posts live in `posts/`
- Post metadata lives in `assets/js/posts.js`
- Shared styles live in `assets/css/site.css`

Preview locally with:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

