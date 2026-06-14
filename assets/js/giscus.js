(function () {
  const config = {
    repo: "ryukirin/ryukirin.github.io",
    repoId: "R_kgDOLwduoA",
    category: "Announcements",
    categoryId: "DIC_kwDOLwduoM4C_Dxg",
    theme: "preferred_color_scheme"
  };

  const container = document.querySelector("#giscus-comments");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const lang = window.BLOG_I18N?.getCurrentLang?.() || "zh";
  const ui = window.BLOG_I18N?.languages?.[lang]?.ui || window.BLOG_I18N?.languages?.zh?.ui;
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
    lang: ui?.giscusLang || "zh-CN",
    loading: "lazy"
  }).forEach(([name, value]) => {
    script.setAttribute(`data-${name}`, value);
  });

  container.appendChild(script);

  function renderSetupNotice(target, category) {
    target.innerHTML = `
      <div class="comments-setup" role="note">
        <strong>${escapeHtml(ui?.giscusSetupTitle || "评论区已接入 Giscus，等待完成 GitHub 分类配置。")}</strong>
        <span>
          ${escapeHtml(
            ui?.giscusSetupBody?.(category) ||
              `请在 giscus.app 为 ryukirin/ryukirin.github.io 选择 ${category} 分类，并把生成的 data-category-id 填入 assets/js/giscus.js。`
          )}
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
