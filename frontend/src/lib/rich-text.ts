import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

// Accept existing plain text/Markdown as well as HTML saved by the editor.
export function richTextHtml(value: string = "") {
  return sanitizeHtml(marked.parse(value, { async: false, breaks: true }), {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "pre", "code", "hr", "a"],
    allowedAttributes: { a: ["href", "title", "rel"], ol: ["start"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}

export function richTextPlain(value: string = "") {
  const html = richTextHtml(value).replace(/<\/(?:p|h[2-4]|li|blockquote)>|<br\s*\/?\s*>/gi, " ");
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim();
}

export const richTextStyles = {
  overflowWrap: "anywhere",
  lineHeight: 1.8,
  "& p": { my: 1 },
  "& a": { color: "primary.main", textDecoration: "underline" },
  "& blockquote": { borderLeft: "3px solid", borderColor: "divider", pl: 2, ml: 0 },
  "& pre": { bgcolor: "action.hover", p: 2, overflowX: "auto" },
  "& figure": { m: "24px 0" },
  "& figure img": { display: "block", width: "100%", height: "auto", borderRadius: 2 },
  "& figcaption": { mt: 1, color: "text.secondary", fontSize: 14 },
};
