window.renderMarkdown = function renderMarkdown(markdown) {
  if (!window.marked) {
    return `<p class="render-error">Markdown 渲染器加载失败，请刷新页面或检查网络。</p>`;
  }

  window.marked.setOptions({
    breaks: false,
    gfm: true,
    headerIds: false,
    mangle: false
  });

  const rawHtml = window.marked.parse(markdown);

  if (!window.DOMPurify) {
    return rawHtml;
  }

  return window.DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "loading", "allow", "allowfullscreen", "frameborder"]
  });
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
