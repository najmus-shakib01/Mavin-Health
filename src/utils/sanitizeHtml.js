const DISALLOWED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
]);

const ALLOWED_TAGS = new Set([
  "a",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "span",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
]);

const ALLOWED_ATTRS = new Set([
  "href",
  "target",
  "rel",
  "class",
  "style",
  "colspan",
  "rowspan",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "white-space",
]);

const escapeHtml = (str) =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isSafeHref = (href) => {
  if (!href) return false;
  const v = href.trim();

  if (v.startsWith("#")) return true;

  if (v.startsWith("mailto:") || v.startsWith("tel:")) return true;

  if (v.startsWith("http://") || v.startsWith("https://")) return true;

  return false;
};

const sanitizeStyle = (styleText) => {
  if (!styleText) return "";

  const lower = styleText.toLowerCase();
  if (lower.includes("expression(") || lower.includes("url(") || lower.includes("javascript:")) {
    return "";
  }

  const declarations = styleText
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);

  const safe = [];

  for (const decl of declarations) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;

    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();

    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;

    if (val.includes("<") || val.includes(">")) continue;

    safe.push(`${prop}: ${val}`);
  }

  return safe.join("; ");
};

const unwrapElement = (el) => {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
};

const sanitizeNodeTree = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);

  const toProcess = [];
  let node = walker.currentNode;

  while (node) {
    toProcess.push(node);
    node = walker.nextNode();
  }

  for (const el of toProcess) {
    const tag = el.tagName?.toLowerCase?.() || "";

    if (DISALLOWED_TAGS.has(tag)) {
      el.remove();
      continue;
    }

    if (tag && !ALLOWED_TAGS.has(tag)) {
      unwrapElement(el);
      continue;
    }

    const attrs = Array.from(el.attributes || []);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (!ALLOWED_ATTRS.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === "href") {
        if (!isSafeHref(value)) {
          el.removeAttribute("href");
        }
      }

      if (name === "target") {
        if (value !== "_blank" && value !== "_self") {
          el.setAttribute("target", "_self");
        }
      }

      if (name === "rel") {
        // we will enforce rel below for links
      }

      if (name === "style") {
        const safeStyle = sanitizeStyle(value);
        if (safeStyle) el.setAttribute("style", safeStyle);
        else el.removeAttribute("style");
      }
    }

    if (tag === "a") {
      const target = el.getAttribute("target");
      if (target === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        if (!el.getAttribute("rel")) el.setAttribute("rel", "noreferrer");
      }
    }
  }
};

export default function sanitizeHtml(input) {
  if (input == null) return "";

  const html = typeof input === "string" ? input : String(input);

  if (typeof window === "undefined" || typeof document === "undefined") {
    return escapeHtml(html);
  }

  try {
    const template = document.createElement("template");
    template.innerHTML = html;

    sanitizeNodeTree(template.content);

    return template.innerHTML || "";
  } catch (e) {
    console.error(e);
    return escapeHtml(html);
  }
}
