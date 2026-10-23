export function plainTextDocument(text = '') {
  return {
    type: 'doc',
    blocks: text.split(/\n\n+/).map(paragraph => ({
      type: 'paragraph',
      spans: [{ text: paragraph }],
    })),
  };
}

const blockTypes = new Set(['paragraph', 'heading2', 'heading3', 'bulletItem', 'orderedItem']);

export function normalizeDocument(input) {
  if (!input || input.type !== 'doc' || !Array.isArray(input.blocks) || input.blocks.length < 1 || input.blocks.length > 300) return null;

  const blocks = [];
  let length = 0;
  for (const block of input.blocks) {
    if (!block || !blockTypes.has(block.type) || !Array.isArray(block.spans) || block.spans.length > 500) return null;
    const spans = [];
    for (const span of block.spans) {
      if (!span || typeof span.text !== 'string') return null;
      length += span.text.length;
      if (length > 20000) return null;
      const clean = { text: span.text };
      if (span.bold === true) clean.bold = true;
      if (span.italic === true) clean.italic = true;
      if (span.href !== undefined) {
        if (typeof span.href !== 'string' || span.href.length > 2048) return null;
        try {
          const url = new URL(span.href);
          if (!['http:', 'https:'].includes(url.protocol)) return null;
          clean.href = url.href;
        } catch {
          return null;
        }
      }
      spans.push(clean);
    }
    blocks.push({ type: block.type, spans });
  }
  return { type: 'doc', blocks };
}

export function documentHasText(document) {
  return document.blocks.some(block => block.spans.some(span => span.text.trim()));
}
