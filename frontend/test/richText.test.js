import { test } from 'node:test';
import assert from 'node:assert/strict';
import { documentToHtml, safeUrl } from '../src/richText.js';

test('editor escapa texto, ignora links inseguros e mantém listas', () => {
  const html = documentToHtml({ type: 'doc', blocks: [
    { type: 'paragraph', spans: [{ text: '<script>alert(1)</script>', href: 'javascript:alert(1)' }] },
    { type: 'orderedItem', spans: [{ text: 'Um' }] },
    { type: 'orderedItem', spans: [{ text: 'Dois' }] },
  ] });
  assert.equal(html, '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p><ol><li>Um</li><li>Dois</li></ol>');
  assert.equal(safeUrl('https://example.com/'), 'https://example.com/');
  assert.equal(safeUrl('javascript:alert(1)'), null);
});
