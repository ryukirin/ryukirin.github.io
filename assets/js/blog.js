(function () {
  const root = document.querySelector("#blog-list");
  if (!root) return;

  const posts = [...window.BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  root.innerHTML = posts.map(renderPostCard).join("");
})();

function renderPostCard(post) {
  const tags = post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  return `
    <a class="post-card" href="/blog/post.html?slug=${encodeURIComponent(post.slug)}">
      <div class="post-meta">${formatDate(post.date)}</div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.description)}</p>
      <div class="tag-row">${tags}</div>
    </a>
  `;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
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
