export const emptyDocument = { type: 'doc', blocks: [{ type: 'paragraph', spans: [{ text: '' }] }] };

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function spansToHtml(spans) {
  return spans.map(span => {
    let html = escapeHtml(span.text).replace(/\n/g, '<br>');
    if (span.bold) html = `<strong>${html}</strong>`;
    if (span.italic) html = `<em>${html}</em>`;
    const href = span.href && safeUrl(span.href);
    if (href) html = `<a href="${escapeHtml(href)}">${html}</a>`;
    return html;
  }).join('') || '<br>';
}

export function documentToHtml(content) {
  const blocks = content?.blocks || emptyDocument.blocks;
  let html = '';
  let list = '';
  for (const block of blocks) {
    const nextList = block.type === 'bulletItem' ? 'ul' : block.type === 'orderedItem' ? 'ol' : '';
    if (list && list !== nextList) html += `</${list}>`;
    if (nextList && list !== nextList) html += `<${nextList}>`;
    list = nextList;
    const inner = spansToHtml(block.spans || []);
    if (nextList) html += `<li>${inner}</li>`;
    else if (block.type === 'heading2') html += `<h2>${inner}</h2>`;
    else if (block.type === 'heading3') html += `<h3>${inner}</h3>`;
    else html += `<p>${inner}</p>`;
  }
  if (list) html += `</${list}>`;
  return html;
}

function appendInline(node, marks, spans) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!node.textContent) return;
    const previous = spans.at(-1);
    const sameMarks = previous && previous.bold === marks.bold && previous.italic === marks.italic && previous.href === marks.href;
    if (sameMarks) previous.text += node.textContent;
    else spans.push({ text: node.textContent, ...marks });
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const tag = node.tagName.toLowerCase();
  if (tag === 'br') {
    spans.push({ text: '\n', ...marks });
    return;
  }
  if (['script', 'style', 'img', 'iframe', 'svg'].includes(tag)) return;
  const next = { ...marks };
  if (tag === 'b' || tag === 'strong' || ['bold', '700', '800', '900'].includes(node.style.fontWeight)) next.bold = true;
  if (tag === 'i' || tag === 'em' || node.style.fontStyle === 'italic') next.italic = true;
  if (tag === 'a') {
    const href = safeUrl(node.getAttribute('href'));
    if (href) next.href = href;
  }
  for (const child of node.childNodes) appendInline(child, next, spans);
}

function readBlock(node, type) {
  const spans = [];
  for (const child of node.childNodes) appendInline(child, {}, spans);
  return { type, spans: spans.length ? spans : [{ text: '' }] };
}

export function readEditorDocument(root) {
  const blocks = [];
  let looseSpans = [];
  function flushLooseText() {
    if (looseSpans.length) blocks.push({ type: 'paragraph', spans: looseSpans });
    looseSpans = [];
  }
  for (const child of root.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      appendInline(child, {}, looseSpans);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = child.tagName.toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      flushLooseText();
      for (const item of child.children) {
        if (item.tagName.toLowerCase() === 'li') blocks.push(readBlock(item, tag === 'ul' ? 'bulletItem' : 'orderedItem'));
      }
    } else if (['h2', 'h3', 'p', 'div', 'h1'].includes(tag)) {
      flushLooseText();
      blocks.push(readBlock(child, tag === 'h2' ? 'heading2' : tag === 'h3' ? 'heading3' : 'paragraph'));
    } else {
      appendInline(child, {}, looseSpans);
    }
  }
  flushLooseText();
  return { type: 'doc', blocks: blocks.length ? blocks : emptyDocument.blocks };
}
