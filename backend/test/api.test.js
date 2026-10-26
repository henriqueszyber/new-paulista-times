import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app.js';

test('editorial: rascunhos, publicação, permissões e persistência em SQLite', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'paulista-news-test-'));
  const databasePath = join(directory, 'news.sqlite');
  process.env.NEWS_DB_PATH = databasePath;
  const app = createApp();

  async function request(path, method = 'GET', body, token) {
    const response = await app.inject({
      method, url: '/api' + path,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      ...(body === undefined ? {} : { payload: body }),
    });
    return { status: response.statusCode, data: response.statusCode === 204 ? null : response.json() };
  }

  const content = { type: 'doc', blocks: [
    { type: 'heading2', spans: [{ text: 'Um título' }] },
    { type: 'paragraph', spans: [{ text: 'Texto ', bold: true }, { text: 'com link', href: 'https://example.com/' }] },
    { type: 'bulletItem', spans: [{ text: 'Um item' }] },
  ] };
  try {
    assert.equal((await request('/health')).data.status, 'ok');
    assert.equal((await request('/news')).data.length, 3);
    assert.equal((await request('/news/manage')).status, 401);
    assert.equal((await request('/news/1')).status, 200);
    assert.equal((await request('/news/inexistente')).status, 404);

    const writer = await request('/auth/login', 'POST', { email: 'writer@jynx.local', password: 'demo123' });
    const admin = await request('/auth/login', 'POST', { email: 'admin@jynx.local', password: 'demo123' });
    assert.equal(writer.status, 200);
    assert.equal(admin.status, 200);
    const writerToken = writer.data.token;
    const adminToken = admin.data.token;
    const draft = { title: 'Texto em andamento', summary: '', category: 'Cidade', content, status: 'draft' };
    assert.equal((await request('/news', 'POST', draft)).status, 401);
    const created = await request('/news', 'POST', { ...draft, authorId: '1' }, writerToken);
    assert.equal(created.status, 201);
    assert.equal(created.data.authorId, writer.data.user.id);
    assert.deepEqual(created.data.content, content);
    assert.equal((await request('/news/' + created.data.id)).status, 404);
    assert.equal((await request('/news/manage', 'GET', undefined, writerToken)).data[0].id, created.data.id);
    assert.equal((await request('/news/manage/' + created.data.id, 'GET', undefined, adminToken)).status, 200);

    const published = { ...draft, summary: 'Resumo', status: 'published' };
    assert.equal((await request('/news/' + created.data.id, 'PUT', published)).status, 401);
    assert.equal((await request('/news/' + created.data.id, 'PUT', { ...published, content: { type: 'doc', blocks: [{ type: 'paragraph', spans: [{ text: 'x', href: 'javascript:alert(1)' }] }] } }, writerToken)).status, 400);
    assert.equal((await request('/news/' + created.data.id, 'PUT', published, writerToken)).status, 200);
    assert.equal((await request('/news/' + created.data.id)).status, 200);
    assert.equal((await request('/news')).data.length, 4);

    const other = await request('/news', 'POST', { ...draft, title: 'Outro rascunho' }, adminToken);
    assert.equal((await request('/news/manage', 'GET', undefined, writerToken)).data.some(item => item.id === other.data.id), false);
    assert.equal((await request('/news/manage/' + other.data.id, 'GET', undefined, writerToken)).status, 403);
    assert.equal((await request('/news/' + other.data.id, 'PUT', published, writerToken)).status, 403);
    assert.equal((await request('/news/' + created.data.id, 'PUT', { ...draft, title: 'Alterado' }, adminToken)).status, 200);
    assert.equal((await request('/news/' + created.data.id)).status, 404);

    const disk = new DatabaseSync(databasePath);
    assert.equal(disk.prepare('SELECT title FROM news WHERE id = ?').get(created.data.id).title, 'Alterado');
    disk.close();

    assert.equal((await request('/auth/logout', 'POST', undefined, writerToken)).status, 204);
    assert.equal((await request('/news/manage', 'GET', undefined, writerToken)).status, 401);
  } finally {
    await app.close();
    assert.ok(directory.startsWith(join(tmpdir(), 'paulista-news-test-')));
    rmSync(directory, { recursive: true, force: true });
    delete process.env.NEWS_DB_PATH;
  }
});
