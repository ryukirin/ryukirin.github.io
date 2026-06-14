(function () {
  const listRoot = document.querySelector("#blog-list");
  const filterForm = document.querySelector("#blog-filters");
  const searchInput = document.querySelector("#blog-search");
  const tagInput = document.querySelector("#blog-tag-input");
  const tagCombobox = document.querySelector("#blog-tag-combobox");
  const selectedTagsRoot = document.querySelector("#blog-selected-tags");
  const tagSuggestionsRoot = document.querySelector("#blog-tag-suggestions");
  const summaryRoot = document.querySelector("#blog-result-summary");
  const paginationRoot = document.querySelector("#blog-pagination");
  const clearButton = document.querySelector("#blog-clear");

  if (!listRoot) return;

  const posts = [...window.BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const allTags = [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
  const pageSize = 10;
  const state = readStateFromUrl(allTags);

  searchInput.value = state.query;
  renderSelectedTags(state.tags);
  renderSuggestions("");
  render();

  filterForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = searchInput.value.trim();
    state.page = 1;
    render();
  });

  searchInput?.addEventListener("input", () => {
    state.query = searchInput.value.trim();
    state.page = 1;
    render();
  });

  clearButton?.addEventListener("click", () => {
    state.query = "";
    state.tags = [];
    state.page = 1;
    searchInput.value = "";
    tagInput.value = "";
    renderSelectedTags(state.tags);
    renderSuggestions("");
    render();
    searchInput.focus();
  });

  tagCombobox?.addEventListener("click", () => {
    tagInput.focus();
    renderSuggestions(tagInput.value);
    showSuggestions();
  });

  tagInput?.addEventListener("focus", () => {
    renderSuggestions(tagInput.value);
  });

  tagInput?.addEventListener("click", () => {
    renderSuggestions(tagInput.value);
    showSuggestions();
  });

  tagInput?.addEventListener("input", () => {
    renderSuggestions(tagInput.value);
    showSuggestions();
  });

  tagInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const firstOption = tagSuggestionsRoot.querySelector("[data-tag]");
      const value = firstOption?.dataset.tag || tagInput.value.trim();
      addTag(value);
    }

    if (event.key === "Backspace" && !tagInput.value && state.tags.length) {
      state.tags = state.tags.slice(0, -1);
      state.page = 1;
      renderSelectedTags(state.tags);
      renderSuggestions("");
      render();
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  tagSuggestionsRoot?.addEventListener("mousedown", (event) => {
    const option = event.target.closest("[data-tag]");
    if (!option) return;

    event.preventDefault();
    addTag(option.dataset.tag);
  });

  selectedTagsRoot?.addEventListener("mousedown", (event) => {
    const removeButton = event.target.closest("[data-remove-tag]");
    if (!removeButton) return;

    event.preventDefault();
    event.stopPropagation();
  });

  selectedTagsRoot?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-tag]");
    if (!removeButton) return;

    event.stopPropagation();
    removeTag(removeButton.dataset.removeTag);
  });

  document.addEventListener("click", (event) => {
    if (!tagCombobox?.contains(event.target) && !tagSuggestionsRoot?.contains(event.target)) {
      hideSuggestions();
    }
  });

  paginationRoot?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;

    const page = Number(button.dataset.page);
    if (!Number.isFinite(page) || page === state.page) return;

    state.page = page;
    render();
    filterForm?.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  function render() {
    const filteredPosts = filterPosts(posts, state);
    const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
    state.page = Math.min(Math.max(state.page, 1), pageCount);

    const startIndex = (state.page - 1) * pageSize;
    const pagePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

    listRoot.innerHTML = pagePosts.length
      ? pagePosts.map(renderPostCard).join("")
      : '<p class="empty-state">没有找到符合条件的文章。</p>';

    renderSummary(filteredPosts.length, pageCount);
    renderPagination(pageCount);
    updateUrl(state);
  }

  function filterPosts(items, currentState) {
    const query = normalizeText(currentState.query);
    const tags = currentState.tags;

    return items.filter((post) => {
      const matchesQuery =
        !query ||
        normalizeText(`${post.title} ${post.description}`).includes(query);
      const matchesTags = !tags.length || tags.every((tag) => post.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }

  function renderSelectedTags(tags) {
    selectedTagsRoot.innerHTML = tags
      .map(
        (tag) => `
          <span class="selected-tag">
            ${escapeHtml(tag)}
            <button type="button" data-remove-tag="${escapeHtml(tag)}" aria-label="移除 ${escapeHtml(
          tag
        )}">×</button>
          </span>
        `
      )
      .join("");
    tagInput.placeholder = tags.length ? "" : "输入或选择标签";
  }

  function renderSuggestions(value) {
    const query = normalizeText(value);
    const options = allTags
      .filter((tag) => !state.tags.includes(tag))
      .filter((tag) => !query || normalizeText(tag).includes(query))
      .slice(0, 8);

    tagSuggestionsRoot.innerHTML = options.length
      ? options
          .map((tag) => `<button type="button" role="option" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
          .join("")
      : '<span class="blog-tag-suggestions__empty">没有匹配的标签</span>';
  }

  function addTag(tag) {
    const matchedTag = allTags.find((item) => normalizeText(item) === normalizeText(tag));
    if (!matchedTag || state.tags.includes(matchedTag)) return;

    state.tags = [...state.tags, matchedTag];
    state.page = 1;
    tagInput.value = "";
    renderSelectedTags(state.tags);
    renderSuggestions("");
    render();
    showSuggestions();
  }

  function removeTag(tag) {
    state.tags = state.tags.filter((item) => item !== tag);
    state.page = 1;
    renderSelectedTags(state.tags);
    renderSuggestions(tagInput.value);
    render();
    hideSuggestions();
    window.requestAnimationFrame(hideSuggestions);
  }

  function renderSummary(total, pageCount) {
    const filterParts = [];
    if (state.query) filterParts.push(`关键词“${state.query}”`);
    if (state.tags.length) filterParts.push(`标签“${state.tags.join("、")}”`);
    const filterText = filterParts.length ? `，已筛选：${filterParts.join("，")}` : "";

    summaryRoot.textContent = `共 ${total} 篇，当前第 ${state.page} / ${pageCount} 页${filterText}。`;
  }

  function renderPagination(pageCount) {
    if (pageCount <= 1) {
      paginationRoot.innerHTML = "";
      return;
    }

    const pages = getVisiblePages(state.page, pageCount);
    const previousPage = Math.max(1, state.page - 1);
    const nextPage = Math.min(pageCount, state.page + 1);

    paginationRoot.innerHTML = `
      <button type="button" data-page="${previousPage}" ${state.page === 1 ? "disabled" : ""}>上一页</button>
      ${pages
        .map((page) =>
          page === "..."
            ? '<span class="pagination-ellipsis">...</span>'
            : `<button type="button" data-page="${page}" class="${
                page === state.page ? "is-active" : ""
              }" aria-current="${page === state.page ? "page" : "false"}">${page}</button>`
        )
        .join("")}
      <button type="button" data-page="${nextPage}" ${state.page === pageCount ? "disabled" : ""}>下一页</button>
    `;
  }

  function showSuggestions() {
    tagSuggestionsRoot.hidden = false;
    tagInput.setAttribute("aria-expanded", "true");
  }

  function hideSuggestions() {
    tagSuggestionsRoot.hidden = true;
    tagInput.setAttribute("aria-expanded", "false");
  }
})();

function readStateFromUrl(allTags) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const page = Number.parseInt(params.get("page") || "1", 10);
  const tagParams = params.getAll("tag").flatMap((tag) => tag.split(","));
  const tags = tagParams
    .map((tag) => allTags.find((item) => normalizeText(item) === normalizeText(tag)))
    .filter(Boolean);

  return {
    query,
    tags: [...new Set(tags)],
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

function updateUrl(state) {
  const params = new URLSearchParams();

  if (state.query) params.set("q", state.query);
  state.tags.forEach((tag) => params.append("tag", tag));
  if (state.page > 1) params.set("page", String(state.page));

  const nextUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}

function getVisiblePages(currentPage, pageCount) {
  const pages = new Set([1, pageCount, currentPage, currentPage - 1, currentPage + 1]);
  const normalizedPages = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  return normalizedPages.flatMap((page, index) => {
    const previousPage = normalizedPages[index - 1];
    if (index > 0 && page - previousPage > 1) return ["...", page];
    return [page];
  });
}

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

function normalizeText(value) {
  return String(value).trim().toLocaleLowerCase("zh-CN");
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
