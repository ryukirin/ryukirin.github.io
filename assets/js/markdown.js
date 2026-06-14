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

  const protectedMarkdown = protectMathSegments(markdown);
  const rawHtml = restoreMathSegments(
    window.marked.parse(protectedMarkdown.markdown),
    protectedMarkdown.segments
  );

  if (!window.DOMPurify) {
    return rawHtml;
  }

  return window.DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "loading", "allow", "allowfullscreen", "frameborder"]
  });
};

function protectMathSegments(markdown) {
  const segments = [];
  const chunks = splitMarkdownCodeBlocks(markdown);

  return {
    markdown: chunks
      .map((chunk) => {
        if (chunk.isCode) return chunk.value;

        return chunk.value.replace(
          /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?!\s)[\s\S]+?(?<!\\)\$)/g,
          (match) => {
            const token = `MATHSEGMENT${segments.length}TOKEN`;
            segments.push(match);
            return token;
          }
        );
      })
      .join(""),
    segments
  };
}

function restoreMathSegments(html, segments) {
  return segments.reduce(
    (result, segment, index) =>
      result.replaceAll(`MATHSEGMENT${index}TOKEN`, escapeHtml(segment)),
    html
  );
}

function splitMarkdownCodeBlocks(markdown) {
  const lines = markdown.split(/(\r?\n)/);
  const chunks = [];
  let buffer = "";
  let isCode = false;
  let fence = null;

  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index] || "";
    const newline = lines[index + 1] || "";
    const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/);

    if (fenceMatch) {
      if (!isCode) {
        if (buffer) chunks.push({ value: buffer, isCode: false });
        buffer = line + newline;
        isCode = true;
        fence = fenceMatch[2][0];
        continue;
      }

      if (fenceMatch[2][0] === fence) {
        buffer += line + newline;
        chunks.push({ value: buffer, isCode: true });
        buffer = "";
        isCode = false;
        fence = null;
        continue;
      }
    }

    buffer += line + newline;
  }

  if (buffer) chunks.push({ value: buffer, isCode });
  return chunks;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
