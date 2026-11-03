import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

test('página de São Paulo renderiza notícias e mapa sem erro de execução', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    configFile: false,
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    appType: 'custom',
  });
  try {
    const { default: SaoPaulo } = await server.ssrLoadModule('/src/pages/SaoPaulo.jsx');
    const html = renderToString(React.createElement(MemoryRouter, null, React.createElement(SaoPaulo)));
    assert.match(html, /Carregando notícias/);
    assert.match(html, /Explore São Paulo/);
    assert.match(html, /Locais de interesse/);
    assert.match(html, /<button[^>]*aria-controls="sp-place-form"[^>]*>Adicionar novo local<\/button>/);
    assert.doesNotMatch(html, /href="\/login"[^>]*>Adicionar novo local/);
    assert.doesNotMatch(html, /Lugares para descobrir a cidade/);
  } finally {
    await server.close();
  }
});
