(function () {
  const languages = {
    zh: {
      label: "中文",
      htmlLang: "zh-CN",
      locale: "zh-CN",
      postPath: (slug) => `/posts/${encodeURIComponent(slug)}.md`,
      ui: {
        navHome: "首页",
        navBlog: "博客",
        searchKeyword: "关键词",
        searchPlaceholder: "标题或摘要",
        tags: "标签",
        tagPlaceholder: "输入或选择标签",
        filter: "筛选",
        clear: "清除",
        noPosts: "没有找到符合条件的文章。",
        noTags: "没有匹配的标签",
        blogIntro: "部分内容整理自博客园旧文，后续继续更新。",
        latestPosts: "最近博客",
        summary: ({ total, page, pageCount, filterText }) =>
          `共 ${total} 篇，当前第 ${page} / ${pageCount} 页${filterText}。`,
        keywordFilter: (query) => `关键词“${query}”`,
        tagFilter: (tags) => `标签“${tags.join("、")}”`,
        previous: "上一页",
        next: "下一页",
        missingPostTitle: "文章不存在",
        missingPostLink: "返回博客列表",
        missingPostBody: "该语言下没有这篇文章。",
        loadingError: "文章 Markdown 加载失败。请确认通过本地静态服务器或 GitHub Pages 访问本站。",
        tocEmpty: "暂无目录",
        noMore: "没有了",
        backToBlog: "← Back to Blog",
        prevPost: "上一篇",
        nextPost: "下一篇"
      }
    },
    ja: {
      label: "日本語",
      htmlLang: "ja",
      locale: "ja-JP",
      postPath: (slug) => `/posts/ja/${encodeURIComponent(slug)}.md`,
      ui: {
        navHome: "ホーム",
        navBlog: "ブログ",
        searchKeyword: "キーワード",
        searchPlaceholder: "タイトルまたは概要",
        tags: "タグ",
        tagPlaceholder: "タグを入力または選択",
        filter: "絞り込み",
        clear: "クリア",
        noPosts: "条件に一致する記事はありません。",
        noTags: "一致するタグはありません",
        blogIntro: "一部の記事は過去の cnblogs 記事を整理したものです。今後も更新していきます。",
        latestPosts: "最新記事",
        summary: ({ total, page, pageCount, filterText }) =>
          `${total} 件、${page} / ${pageCount} ページ${filterText}。`,
        keywordFilter: (query) => `キーワード「${query}」`,
        tagFilter: (tags) => `タグ「${tags.join("、")}」`,
        previous: "前へ",
        next: "次へ",
        missingPostTitle: "記事が見つかりません",
        missingPostLink: "ブログ一覧へ戻る",
        missingPostBody: "この言語ではこの記事は公開されていません。",
        loadingError: "記事の Markdown を読み込めませんでした。ローカル静的サーバーまたは GitHub Pages からアクセスしてください。",
        tocEmpty: "目次はありません",
        noMore: "ありません",
        backToBlog: "← Blogへ戻る",
        prevPost: "前の記事",
        nextPost: "次の記事"
      }
    },
    en: {
      label: "English",
      htmlLang: "en",
      locale: "en-US",
      postPath: (slug) => `/posts/en/${encodeURIComponent(slug)}.md`,
      ui: {
        navHome: "Home",
        navBlog: "Blog",
        searchKeyword: "Keyword",
        searchPlaceholder: "Title or summary",
        tags: "Tags",
        tagPlaceholder: "Type or choose tags",
        filter: "Filter",
        clear: "Clear",
        noPosts: "No posts match your filters.",
        noTags: "No matching tags",
        blogIntro: "Some posts were reorganized from older cnblogs articles, with more updates to come.",
        latestPosts: "Latest Posts",
        summary: ({ total, page, pageCount, filterText }) =>
          `${total} posts, page ${page} of ${pageCount}${filterText}.`,
        keywordFilter: (query) => `keyword "${query}"`,
        tagFilter: (tags) => `tags "${tags.join(", ")}"`,
        previous: "Previous",
        next: "Next",
        missingPostTitle: "Post not found",
        missingPostLink: "Back to blog",
        missingPostBody: "This post is not available in this language.",
        loadingError: "Failed to load the post Markdown. Please access the site through a local static server or GitHub Pages.",
        tocEmpty: "No table of contents",
        noMore: "No more posts",
        backToBlog: "← Back to Blog",
        prevPost: "Previous post",
        nextPost: "Next post"
      }
    }
  };

  const defaultLang = "zh";
  const languageKeys = Object.keys(languages);

  function getCurrentLang() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || defaultLang;
    return languages[lang] ? lang : defaultLang;
  }

  function localizePost(post, lang) {
    if (lang === defaultLang) return { ...post, lang };

    const translation = post.translations?.[lang];
    if (!translation) return null;

    return {
      ...post,
      ...translation,
      slug: post.slug,
      date: translation.date || post.date,
      tags: translation.tags || post.tags,
      lang
    };
  }

  function getLocalizedPosts(posts, lang) {
    return posts.map((post) => localizePost(post, lang)).filter(Boolean);
  }

  function withLang(url, lang) {
    const nextUrl = new URL(url, window.location.origin);
    if (lang === defaultLang) {
      nextUrl.searchParams.delete("lang");
    } else {
      nextUrl.searchParams.set("lang", lang);
    }

    return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  }

  function setDocumentLanguage(lang) {
    document.documentElement.lang = languages[lang].htmlLang;
  }

  function renderLanguageSwitcher(lang) {
    const nav = document.querySelector(".site-header .navbar-nav");
    if (!nav || nav.querySelector(".language-switcher")) return;

    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("aria-label", "Language");
    switcher.innerHTML = languageKeys
      .map((key) => {
        const href = withLang(window.location.href, key);
        const isActive = key === lang;
        return `<a href="${escapeHtml(href)}" class="${isActive ? "is-active" : ""}" ${
          isActive ? 'aria-current="true"' : ""
        }>${escapeHtml(languages[key].label)}</a>`;
      })
      .join("");

    nav.appendChild(switcher);
    applySharedUi(lang);
  }

  function syncLanguageLinks(lang) {
    document.querySelectorAll('a[href="/"], a[href^="/blog/"]').forEach((link) => {
      if (link.closest(".language-switcher")) return;
      link.href = withLang(link.href, lang);
    });
    applySharedUi(lang);
  }

  function applySharedUi(lang) {
    const ui = languages[lang].ui;
    document.querySelectorAll(".site-header .nav-link").forEach((link) => {
      const url = new URL(link.href, window.location.origin);
      if (url.pathname === "/") link.textContent = ui.navHome;
      if (url.pathname.startsWith("/blog/")) link.textContent = ui.navBlog;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.BLOG_I18N = {
    defaultLang,
    languages,
    getCurrentLang,
    getLocalizedPosts,
    localizePost,
    setDocumentLanguage,
    renderLanguageSwitcher,
    syncLanguageLinks,
    applySharedUi,
    withLang
  };
})();
