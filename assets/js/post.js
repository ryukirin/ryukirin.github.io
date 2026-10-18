(async function () {
  const params = new URLSearchParams(window.location.search);
  const lang = window.BLOG_I18N.getCurrentLang();
  const language = window.BLOG_I18N.languages[lang];
  const ui = language.ui;
  const localizedPosts = window.BLOG_I18N
    .getLocalizedPosts(window.BLOG_POSTS, lang)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const slug = params.get("slug") || localizedPosts[0]?.slug;
  const meta = localizedPosts.find((post) => post.slug === slug);

  window.BLOG_I18N.setDocumentLanguage(lang);
  window.BLOG_I18N.renderLanguageSwitcher(lang);
  applyUiText(ui, lang);

  if (!meta) {
    renderMissingPost(ui);
    return;
  }

  document.title = `${meta.title} | Kylin`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  document.querySelector("#post-title").textContent = meta.title;
  document.querySelector("#post-date").textContent = formatDate(meta.date);
  document.querySelector("#post-tags").innerHTML = window.BLOG_I18N.renderTagLinks(meta.tags, lang);
  renderPostNavigation(meta);

  try {
    const response = await fetch(language.postPath(slug));
    if (!response.ok) throw new Error(`Failed to load ${slug}.md`);
    const markdown = await response.text();
    document.querySelector("#post-body").innerHTML = window.renderMarkdown(
      stripLeadingTitle(stripFrontmatter(markdown))
    );
    buildTableOfContents(ui);
    const sourceTags = window.BLOG_POSTS.find((post) => post.slug === slug)?.tags || [];
    await renderEnhancements(codeLanguagesForTags(sourceTags));
    scrollToHash();
  } catch (error) {
    document.querySelector("#post-body").innerHTML = `
      <p>${escapeHtml(ui.loadingError)}</p>
    `;
    document.querySelector("#post-toc").innerHTML = "";
  }
})();

function renderMissingPost(ui) {
  const lang = window.BLOG_I18N.getCurrentLang();
  document.title = `${ui.missingPostTitle} | Kylin`;
  document.querySelector("#post-title").textContent = ui.missingPostTitle;
  document.querySelector("#post-date").textContent = "";
  document.querySelector("#post-tags").innerHTML = "";
  document.querySelector("#post-body").innerHTML = `
    <p>${escapeHtml(ui.missingPostBody)}</p>
    <p><a href="${escapeHtml(window.BLOG_I18N.withLang("/blog/", lang))}">${escapeHtml(
      ui.missingPostLink
    )}</a></p>
  `;
  document.querySelector("#post-toc").innerHTML = "";
  document.querySelector(".post-nav")?.remove();
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function stripLeadingTitle(markdown) {
  return markdown.replace(/^\s*#[ \t]+[^\r\n]*(?:\r?\n|$)/, "");
}

function buildTableOfContents(ui) {
  const body = document.querySelector("#post-body");
  const toc = document.querySelector("#post-toc");
  const headings = [...body.querySelectorAll("h2, h3, h4")];

  if (!headings.length) {
    toc.innerHTML = `<span class="text-muted">${escapeHtml(ui.tocEmpty)}</span>`;
    return;
  }

  const usedIds = new Set();

  toc.innerHTML = headings
    .map((heading, index) => {
      const baseId = slugify(heading.textContent) || `section-${index + 1}`;
      const id = uniqueId(baseId, usedIds);
      heading.id = id;

      return `<a href="#${id}" data-level="${heading.tagName.slice(1)}">${escapeHtml(
        heading.textContent
      )}</a>`;
    })
    .join("");
}

function scrollToHash() {
  let id;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }
  const target = id && document.getElementById(id);
  if (!target) return;

  target.scrollIntoView();
  const scrolledTo = window.scrollY;
  const pendingImages = [...document.querySelectorAll("#post-body img")].filter((img) => !img.complete);
  if (!pendingImages.length) return;

  Promise.all(pendingImages.map(waitForImage)).then(() => {
    if (Math.abs(window.scrollY - scrolledTo) < 2) target.scrollIntoView();
  });
}

function waitForImage(img) {
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(baseId, usedIds) {
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

function renderPostNavigation(currentPost) {
  const lang = window.BLOG_I18N.getCurrentLang();
  const posts = window.BLOG_I18N
    .getLocalizedPosts(window.BLOG_POSTS, lang)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const index = posts.findIndex((post) => post.slug === currentPost.slug);
  const prevPost = posts[index - 1];
  const nextPost = posts[index + 1];

  setPostNavItem(document.querySelector("#prev-post"), prevPost);
  setPostNavItem(document.querySelector("#next-post"), nextPost);
}

function setPostNavItem(element, post) {
  if (!element) return;

  if (!post) {
    element.classList.add("is-disabled");
    element.removeAttribute("href");
    element.querySelector("strong").textContent =
      window.BLOG_I18N.languages[window.BLOG_I18N.getCurrentLang()].ui.noMore;
    return;
  }

  element.href = window.BLOG_I18N.withLang(
    `/blog/post.html?slug=${encodeURIComponent(post.slug)}`,
    post.lang
  );
  element.querySelector("strong").textContent = post.title;
}

function applyUiText(ui, lang) {
  const backLink = document.querySelector(".back-link");
  if (backLink) {
    backLink.href = window.BLOG_I18N.withLang("/blog/", lang);
    backLink.textContent = ui.backToBlog;
  }

  const tocTitle = document.querySelector(".article-toc__title");
  if (tocTitle && lang !== "zh") tocTitle.textContent = "Contents";

  const prevLabel = document.querySelector("#prev-post span");
  const nextLabel = document.querySelector("#next-post span");
  if (prevLabel) prevLabel.textContent = ui.prevPost;
  if (nextLabel) nextLabel.textContent = ui.nextPost;

  const commentsTitle = document.querySelector("#comments-title");
  const commentsNote = document.querySelector(".comments-section__note");
  if (commentsTitle) commentsTitle.textContent = ui.commentsTitle;
  if (commentsNote) commentsNote.textContent = ui.commentsNote;

  window.BLOG_I18N.syncLanguageLinks(lang);
}

const CODE_LANGUAGE_HINTS = {
  python: ["python"],
  "python学习笔记": ["python"],
  pytorch: ["python"],
  LLM: ["python"],
  LangChain: ["python"],
  ChatGPT: ["python"],
  Colaboratory: ["python"],
  Leetcode: ["python"],
  Miro: ["python"],
  Neo4j: ["python"],
  "西瓜书": ["python"],
  "Deep Agents实战|Datawhale-10月": ["python"],
  Java: ["java"],
  "前端": ["javascript", "xml", "css"],
  JS: ["javascript", "xml"],
  CSS: ["css", "xml"],
  HTML: ["xml", "css", "javascript"],
  "Linux组队学习": ["bash"]
};

const AUTO_DETECT_LANGUAGES = ["python", "java", "javascript", "xml", "css", "bash", "sql", "json", "cpp", "c", "yaml"];

function codeLanguagesForTags(tags) {
  return [...new Set(tags.flatMap((tag) => CODE_LANGUAGE_HINTS[tag] || []))];
}

function highlightCode(root, hintLanguages) {
  if (!window.hljs) return;

  root.querySelectorAll("pre code").forEach((code) => {
    const declared = [...code.classList].find((name) => name.startsWith("language-"))?.slice("language-".length);
    if (declared) {
      if (window.hljs.getLanguage(declared)) window.hljs.highlightElement(code);
      return;
    }

    const candidates = hintLanguages.length ? hintLanguages : AUTO_DETECT_LANGUAGES;
    const result = window.hljs.highlightAuto(code.textContent, candidates);
    if (!result.language || (!hintLanguages.length && result.relevance < 10)) return;

    code.innerHTML = result.value;
    code.classList.add("hljs", `language-${result.language}`);
  });
}

async function renderEnhancements(hintLanguages) {
  const body = document.querySelector("#post-body");

  body.querySelectorAll("pre code.language-mermaid").forEach((code) => {
    const pre = code.closest("pre");
    pre.className = "mermaid";
    pre.textContent = code.textContent;
  });

  highlightCode(body, hintLanguages);

  if (window.renderMathInElement) {
    window.renderMathInElement(body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
    fitDisplayMath(body);
    window.addEventListener("resize", debounce(() => fitDisplayMath(body), 120));
  }

  if (window.mermaid && body.querySelector(".mermaid")) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "strict"
    });
    await window.mermaid.run({
      nodes: body.querySelectorAll(".mermaid")
    });
  }
}

function fitDisplayMath(root) {
  root.querySelectorAll(".katex-display").forEach((display) => {
    const math = display.querySelector(":scope > .katex");
    if (!math) return;

    display.style.fontSize = "";
    display.classList.remove("is-scaled");

    const availableWidth = display.clientWidth;
    const formulaWidth = math.scrollWidth;
    if (!availableWidth || formulaWidth <= availableWidth) return;

    const scale = availableWidth / formulaWidth;
    display.style.fontSize = `${scale * 100}%`;
    display.classList.add("is-scaled");
  });
}

function debounce(callback, wait) {
  let timer = 0;

  return function debouncedCallback() {
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, wait);
  };
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
