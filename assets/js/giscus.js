(function () {
  const config = {
    repo: "ryukirin/ryukirin.github.io",
    repoId: "R_kgDOLwduoA",
    category: "Announcements",
    categoryId: "DIC_kwDOLwduoM4C_Dxg",
    lang: "zh-CN",
    theme: "preferred_color_scheme"
  };

  const container = document.querySelector("#giscus-comments");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const posts = window.BLOG_POSTS || [];
  const slug = params.get("slug") || posts[0]?.slug;
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    document.querySelector(".comments-section")?.remove();
    return;
  }

  if (!config.categoryId) {
    renderSetupNotice(container, config.category);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  Object.entries({
    repo: config.repo,
    "repo-id": config.repoId,
    category: config.category,
    "category-id": config.categoryId,
    mapping: "specific",
    term: `blog:${slug}`,
    strict: "1",
    "reactions-enabled": "1",
    "emit-metadata": "0",
    "input-position": "bottom",
    theme: config.theme,
    lang: config.lang,
    loading: "lazy"
  }).forEach(([name, value]) => {
    script.setAttribute(`data-${name}`, value);
  });

  container.appendChild(script);

  function renderSetupNotice(target, category) {
    target.innerHTML = `
      <div class="comments-setup" role="note">
        <strong>评论区已接入 Giscus，等待完成 GitHub 分类配置。</strong>
        <span>
          请在 giscus.app 为 <code>ryukirin/ryukirin.github.io</code>
          选择 <code>${escapeHtml(category)}</code> 分类，并把生成的
          <code>data-category-id</code> 填入 <code>assets/js/giscus.js</code>。
        </span>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
