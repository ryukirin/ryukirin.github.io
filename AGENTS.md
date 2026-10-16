# AGENTS.md

This repository is a plain static personal blog.

## Project Shape

- No framework or build step is required.
- Do not reintroduce Astro, Spec Kit, or generated planning directories unless explicitly requested.
- The site is intended to work on GitHub Pages as static files.

## Main Files

- Home page: `index.html`
- Blog list: `blog/index.html`
- Blog detail page: `blog/post.html?slug=<slug>`
- Markdown posts: `posts/*.md`
- Post metadata: `assets/js/posts.js`
- Post images: `assets/posts/<slug>/`
- Site icons: `assets/icons/`
- Shared styles: `assets/css/site.css`
- cnblogs importer: `tools/import-cnblogs.mjs`

## Content Rules

- New posts need both a Markdown file in `posts/` and a matching entry in `assets/js/posts.js`.
- Keep image assets local in the repository; avoid hotlinking remote images.
- Do not add cnblogs source links into imported post bodies.
- Comments are not imported from cnblogs.

## Markdown Rendering

The post page uses `marked` and `DOMPurify` from CDN, with post-processing for:

- Mermaid diagrams
- KaTeX math
- Code highlighting with highlight.js: fenced language first, otherwise the language mapped from the post's Chinese tags in `CODE_LANGUAGE_HINTS` (`assets/js/post.js`), otherwise auto-detection with a relevance threshold
- Table of contents from `h2`, `h3`, and `h4`
- Previous / next post navigation

## Local Preview

Use a local static server because posts are loaded with `fetch()`.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

