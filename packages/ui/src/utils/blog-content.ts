export type BlogSectionBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "unordered-list" | "ordered-list";
      items: string[];
    };

function extractListItems(paragraph: string, type: "unordered" | "ordered"): string[] {
  const normalized = type === "unordered"
    ? paragraph
        .replace(/([.!?])\s*(?=[-*]\s+)/g, "$1\n")
        .replace(/(\S)\s+(?=[-*]\s+[A-Z0-9])/g, "$1\n")
    : paragraph
        .replace(/([.!?])\s*(?=\d+\.\s+)/g, "$1\n")
        .replace(/(\S)\s+(?=\d+\.\s+[A-Z0-9])/g, "$1\n");

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pattern = type === "unordered" ? /^[-*]\s+(.+)$/ : /^\d+\.\s+(.+)$/;
  if (lines.length === 0 || !pattern.test(lines[0])) {
    return [];
  }

  const items = lines
    .map((line) => line.match(pattern)?.[1]?.trim() ?? null);

  if (!items.every((item): item is string => Boolean(item))) {
    return [];
  }

  return items;
}

export function parseBlogSectionBlock(paragraph: string): BlogSectionBlock {
  if (!paragraph.trim()) {
    return {
      type: "paragraph",
      content: paragraph
    };
  }

  const unorderedItems = extractListItems(paragraph, "unordered");

  if (unorderedItems.length > 0) {
    return {
      type: "unordered-list",
      items: unorderedItems
    };
  }

  const orderedItems = extractListItems(paragraph, "ordered");

  if (orderedItems.length > 0) {
    return {
      type: "ordered-list",
      items: orderedItems
    };
  }

  return {
    type: "paragraph",
    content: paragraph
  };
}

export function getBlogSectionParagraphsFromContent(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) {
    return [];
  }

  if (!trimmed.includes("<")) {
    return trimmed
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "text/html");
  const paragraphs: string[] = [];

  const blockElements = Array.from(doc.body.children);
  if (blockElements.length === 0) {
    const text = (doc.body.textContent ?? "").trim();
    return text ? [text] : [];
  }

  blockElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "ul" || tagName === "ol") {
      const items = Array.from(element.querySelectorAll("li"))
        .map((item, index) => {
          const itemText = (item.textContent ?? "").trim();
          if (!itemText) {
            return "";
          }

          if (tagName === "ol") {
            return `${index + 1}. ${itemText}`;
          }

          return `- ${itemText}`;
        })
        .filter(Boolean)
        .join("\n");

      if (items) {
        paragraphs.push(items);
      }
      return;
    }

    const text = (element.textContent ?? "").trim();
    if (text) {
      paragraphs.push(text);
    }
  });

  return paragraphs;
}
