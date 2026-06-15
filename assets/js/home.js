(function () {
  const root = document.querySelector("#latest-posts");
  if (!root) return;

  const lang = window.BLOG_I18N.getCurrentLang();
  const language = window.BLOG_I18N.languages[lang];
  const ui = language.ui;

  window.BLOG_I18N.setDocumentLanguage(lang);
  window.BLOG_I18N.renderLanguageSwitcher(lang);
  applyUiText(lang, ui);

  const posts = window.BLOG_I18N
    .getLocalizedPosts(window.BLOG_POSTS, lang)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  root.innerHTML = posts.length
    ? posts.map(renderPostCard).join("")
    : `<p class="empty-state">${escapeHtml(ui.noPosts)}</p>`;
})();

function renderPostCard(post) {
  const tags = post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const lang = window.BLOG_I18N.getCurrentLang();
  const url = window.BLOG_I18N.withLang(
    `/blog/post.html?slug=${encodeURIComponent(post.slug)}`,
    lang
  );
  return `
    <a class="post-card" href="${escapeHtml(url)}">
      <div class="post-meta">${formatDate(post.date)}</div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.description)}</p>
      <div class="tag-row">${tags}</div>
    </a>
  `;
}

function applyUiText(lang, ui) {
  document.title = lang === "zh" ? "Kylin | Personal Blog" : `Kylin | ${ui.latestPosts}`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      "content",
      lang === "zh"
        ? "Kylin 的个人主页与博客，记录项目里的问题、取舍和解决办法。"
        : "Kylin's personal site and blog, recording project notes, tradeoffs, and solutions."
    );

  const latestHeading = document.querySelector(".section-heading h2");
  if (latestHeading) latestHeading.textContent = ui.latestPosts;

  window.BLOG_I18N.syncLanguageLinks(lang);
}

function formatDate(value) {
  const lang = window.BLOG_I18N?.getCurrentLang?.() || "zh";
  const locale = window.BLOG_I18N?.languages?.[lang]?.locale || "zh-CN";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
