import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const BLOG_HOME = "https://www.cnblogs.com/wakarimasu";
const POSTS_DIR = new URL("../posts/", import.meta.url);
const POST_ASSETS_DIR = new URL("../assets/posts/", import.meta.url);
const POSTS_INDEX = new URL("../assets/js/posts.js", import.meta.url);
const DELAY_MS = 900;

async function main() {
  await mkdir(POSTS_DIR, { recursive: true });
  await mkdir(POST_ASSETS_DIR, { recursive: true });

  const urls = await collectArticleUrls();
  const posts = [];

  for (const [index, url] of urls.entries()) {
    console.log(`[${index + 1}/${urls.length}] ${url}`);
    const post = await importArticle(url);
    posts.push(post.meta);
    await writeFile(new URL(`${post.meta.slug}.md`, POSTS_DIR), post.markdown, "utf8");
    await delay(DELAY_MS);
  }

  const existing = await readExistingPosts();
  const merged = mergePosts(existing, posts);
  await writePostsIndex(merged);

  console.log(`Imported ${posts.length} posts.`);
}

async function collectArticleUrls() {
  const urls = [];
  const seen = new Set();

  for (let page = 1; page <= 50; page += 1) {
    const url = page === 1 ? BLOG_HOME : `${BLOG_HOME}?page=${page}`;
    const html = await fetchText(url);
    const pageUrls = [...html.matchAll(/https:\/\/www\.cnblogs\.com\/wakarimasu\/p\/\d+\.html/g)]
      .map((match) => match[0])
      .filter((articleUrl) => {
        if (seen.has(articleUrl)) return false;
        seen.add(articleUrl);
        return true;
      });

    urls.push(...pageUrls);

    if (!html.includes(`${BLOG_HOME}?page=${page + 1}`)) {
      break;
    }

    await delay(DELAY_MS);
  }

  return urls;
}

async function importArticle(url) {
  const html = await fetchText(url);
  const title = extractScriptString(html, "cb_postTitle") || textContent(extractByClass(html, "postTitle2")) || "Untitled";
  const dateText = extractScriptString(html, "cb_entryCreatedDate") || textContent(extractById(html, "post-date"));
  const date = normalizeDateTime(dateText);
  const postId = url.match(/\/p\/(\d+)\.html/)?.[1];
  const slug = `cnblogs-${postId}`;
  const rawBody = await localizeImages(extractPostBody(html), slug);
  const description = makeDescription(rawBody);
  const tags = await fetchPostTags(postId);
  const body = htmlToMarkdown(rawBody).trim();

  const markdown = `---\n${yaml({
    title,
    description,
    date,
    tags
  })}---\n\n${body}\n`;

  return {
    meta: {
      slug,
      title,
      description,
      date,
      tags
    },
    markdown
  };
}

async function fetchPostTags(postId) {
  if (!postId) return ["cnblogs"];

  try {
    const html = await fetchText(`${BLOG_HOME}/ajax/CategoriesTags.aspx?blogApp=wakarimasu&postId=${postId}`);
    const tags = new Set();
    const categoryBlock = html.match(/<div id="BlogPostCategory"[\s\S]*?<\/div>/i)?.[0] ?? "";
    const tagBlock = html.match(/<div id="EntryTag"[\s\S]*?免责声明/i)?.[0] ?? "";

    for (const block of [categoryBlock, tagBlock]) {
      for (const match of block.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
        const tag = textContent(match[1]);
        if (tag) tags.add(tag);
      }
    }

    return tags.size ? [...tags] : ["cnblogs"];
  } catch {
    return ["cnblogs"];
  }
}

async function readExistingPosts() {
  if (!existsSync(POSTS_INDEX)) return [];

  const source = await readFile(POSTS_INDEX, "utf8");
  const match = source.match(/window\.BLOG_POSTS\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (!match) return [];

  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function mergePosts(existing, imported) {
  const bySlug = new Map();

  for (const post of [...existing, ...imported]) {
    bySlug.set(post.slug, post);
  }

  return [...bySlug.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function writePostsIndex(posts) {
  const payload = JSON.stringify(posts, null, 2);
  await writeFile(POSTS_INDEX, `window.BLOG_POSTS = ${payload};\n`, "utf8");
}

async function fetchText(url) {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Kylin static blog importer"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      return response.text();
    } catch (error) {
      if (attempt === 8) {
        throw error;
      }

      await delay(DELAY_MS * attempt * 2);
    }
  }
}

function extractById(html, id) {
  const match = html.match(new RegExp(`<([a-zA-Z0-9]+)([^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*)>([\\s\\S]*?)<\\/\\1>`));
  return match?.[3] ?? "";
}

function extractByClass(html, className) {
  const match = html.match(
    new RegExp(`<([a-zA-Z0-9]+)([^>]*class=["'][^"']*${escapeRegExp(className)}[^"']*["'][^>]*)>([\\s\\S]*?)<\\/\\1>`)
  );
  return match?.[3] ?? "";
}

function extractScriptString(html, name) {
  const match = html.match(new RegExp(`${escapeRegExp(name)}\\s*=\\s*'([\\s\\S]*?)'`));
  return match ? decodeJsString(match[1]) : "";
}

function extractPostBody(html) {
  const match = html.match(/<div id="cnblogs_post_body"[^>]*>([\s\S]*?)<div class="clear"><\/div>/i);
  return match?.[1] ?? extractById(html, "cnblogs_post_body");
}

async function localizeImages(html, slug) {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)];
  if (!imageTags.length) return html;

  let output = html;
  const slugAssetsDir = new URL(`${slug}/`, POST_ASSETS_DIR);
  await mkdir(slugAssetsDir, { recursive: true });

  for (const [index, match] of imageTags.entries()) {
    const tag = match[0];
    const src = getAttribute(tag, "src");
    if (!src || src.startsWith("data:")) continue;

    const sourceUrl = absoluteUrl(src);
    const downloaded = await downloadImage(sourceUrl, slugAssetsDir, index + 1);
    if (!downloaded) continue;

    output = output.replace(tag, tag.replace(src, `/assets/posts/${slug}/${downloaded.fileName}`));
    await delay(150);
  }

  return output;
}

async function downloadImage(sourceUrl, outputDir, index) {
  const candidates = imageUrlCandidates(sourceUrl);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: {
          "user-agent": "Kylin static blog importer"
        }
      });

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/")) continue;

      const ext = imageExtension(candidate, contentType);
      const fileName = `image-${String(index).padStart(2, "0")}${ext}`;
      const bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(new URL(fileName, outputDir), bytes);
      return { fileName };
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function imageUrlCandidates(sourceUrl) {
  const url = new URL(sourceUrl);
  const withoutQuery = new URL(sourceUrl);
  withoutQuery.search = "";
  withoutQuery.hash = "";

  return withoutQuery.href === url.href ? [url.href] : [withoutQuery.href, url.href];
}

function imageExtension(sourceUrl, contentType) {
  const pathname = new URL(sourceUrl).pathname;
  const ext = pathname.match(/\.(png|jpe?g|gif|webp|svg)$/i)?.[0]?.toLowerCase();
  if (ext) return ext === ".jpeg" ? ".jpg" : ext;

  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg")) return ".jpg";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("svg")) return ".svg";
  return ".img";
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`${escapeRegExp(name)}=["']([^"']+)["']`, "i"));
  return match?.[1] ?? "";
}

function htmlToMarkdown(html) {
  let output = html;
  const codeBlocks = [];

  output = output.replace(/<!--[\s\S]*?-->/g, "");
  output = output.replace(/<script[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<style[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    return stashCodeBlock(codeBlocks, code);
  });
  output = output.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    return stashCodeBlock(codeBlocks, code);
  });
  output = output.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, (_, src) => {
    return `\n\n![](${src.startsWith("/assets/posts/") ? src : absoluteUrl(src)})\n\n`;
  });
  output = output.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => {
    return `\n\n${"#".repeat(Number(level))} ${textContent(content)}\n\n`;
  });
  output = output.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `\n\n${inlineHtml(content)}\n\n`);
  output = output.replace(/<br\s*\/?>/gi, "\n");
  output = output.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    return `\n\n${textContent(content)
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")}\n\n`;
  });
  output = output.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => listMarkdown(content, "-"));
  output = output.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 0;
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `${++index}. ${inlineHtml(item).trim()}\n`);
  });
  output = output.replace(/<table[\s\S]*?<\/table>/gi, (table) => `\n\n${tableToMarkdown(table)}\n\n`);
  output = inlineHtml(output);

  output = output
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  for (const [index, code] of codeBlocks.entries()) {
    output = output.replace(`@@CODE_BLOCK_${index}@@`, code);
  }

  return output;
}

function stashCodeBlock(codeBlocks, code) {
  const cleaned = simplifyCodeBlock(decodeHtml(stripTags(code)).trim());
  const placeholder = `@@CODE_BLOCK_${codeBlocks.length}@@`;
  codeBlocks.push(`\`\`\`\n${cleaned}\n\`\`\``);
  return `\n\n${placeholder}\n\n`;
}

function simplifyCodeBlock(code) {
  const script = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (script) {
    return dedent(script[1]).trim();
  }

  return code;
}

function dedent(value) {
  const lines = String(value).replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.filter((line) => line.trim());
  const minIndent = Math.min(
    ...nonEmpty.map((line) => line.match(/^\s*/)?.[0].length ?? 0)
  );

  return lines.map((line) => line.slice(minIndent)).join("\n");
}

function listMarkdown(content, marker) {
  return `\n\n${content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `${marker} ${inlineHtml(item).trim()}\n`)}\n`;
}

function tableToMarkdown(table) {
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => {
      return [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
        inlineHtml(cell[1]).replace(/\|/g, "\\|").trim()
      );
    })
    .filter((row) => row.length);

  if (!rows.length) {
    return textContent(table);
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => {
    const normalized = [...row];
    while (normalized.length < columnCount) normalized.push("");
    return normalized;
  });
  const [header, ...body] = normalizedRows;

  return [
    markdownTableRow(header),
    markdownTableRow(Array.from({ length: columnCount }, () => "---")),
    ...body.map(markdownTableRow)
  ].join("\n");
}

function markdownTableRow(row) {
  return `| ${row.join(" | ")} |`;
}

function inlineHtml(html) {
  let output = html;

  output = output.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
    return `[${textContent(content)}](${absoluteUrl(href)})`;
  });
  output = output.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `**${textContent(content)}**`);
  output = output.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `*${textContent(content)}*`);
  output = output.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, content) => `\`${decodeHtml(stripTags(content))}\``);
  output = stripTags(output);

  return decodeHtml(output).trim();
}

function textContent(html) {
  return decodeHtml(stripTags(html)).replace(/\s+/g, " ").trim();
}

function stripTags(html) {
  return String(html).replace(/<\/?[a-zA-Z][^>]*>/g, "");
}

function makeDescription(html) {
  return textContent(html).slice(0, 120) || "Imported from cnblogs.";
}

function normalizeDateTime(value) {
  const match = String(value).match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?:\D+(\d{1,2}):(\d{1,2}))?/);
  if (!match) return new Date().toISOString();

  const [, year, month, day, hour = "00", minute = "00"] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(
    2,
    "0"
  )}:${minute.padStart(2, "0")}:00+08:00`;
}

function yaml(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map((item) => `"${escapeYaml(item)}"`).join(", ")}]\n`;
      }

      return `${key}: "${escapeYaml(value)}"\n`;
    })
    .join("");
}

function absoluteUrl(url) {
  try {
    return new URL(url, BLOG_HOME).href;
  } catch {
    return url;
  }
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function decodeJsString(value) {
  return String(value)
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function escapeYaml(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
