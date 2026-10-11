import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('fluxo da API: notícias, login, validação, papéis e logout', async () => {
  const app = createApp();
  await app.listen({ port: 0, host: '127.0.0.1' });
  const base = `http://127.0.0.1:${app.server.address().port}/api`;
  async function request(path, method = 'GET', body, token) {
    const response = await fetch(base + path, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, data: response.status === 204 ? null : await response.json() };
  }
  try {
    assert.equal((await request('/health')).data.status, 'ok');
    assert.equal((await request('/news')).data.length, 3);
    assert.equal((await request('/news/1')).status, 200);
    assert.equal((await request('/news/inexistente')).status, 404);
    assert.equal((await request('/news', 'POST', {})).status, 401);
    assert.equal((await request('/users')).status, 401);
    const unsupported = await fetch(base + '/news', { method: 'POST', headers: { 'Content-Type': 'application/xml' }, body: '<news />' });
    assert.equal(unsupported.status, 415);
    assert.equal((await request('/auth/login', 'POST', { email: 'super@jynx.local', password: 'errada' })).status, 401);
    for (const [email, role] of [['super@jynx.local', 'SUPER_ADMIN'], ['admin@jynx.local', 'ADMIN'], ['writer@jynx.local', 'WRITER']]) {
      const login = await request('/auth/login', 'POST', { email, password: 'demo123' });
      assert.equal(login.status, 200);
      const { token } = login.data;
      assert.equal((await request('/auth/me', 'GET', undefined, token)).data.role, role);
      const team = await request('/users', 'GET', undefined, token);
      assert.equal(team.status, role === 'WRITER' ? 403 : 200);
      if (role !== 'WRITER') assert.deepEqual(team.data.map(user => user.role), ['SUPER_ADMIN', 'ADMIN', 'WRITER']);
      assert.equal((await request('/news', 'POST', { title: ' ' }, token)).status, 400);
      const body = { title: `Teste ${role}`, summary: 'Resumo', category: 'Cidade', content: 'Primeiro parágrafo.\n\nSegundo parágrafo.', author: 'Autor forjado' };
      assert.equal((await request('/news', 'POST', { ...body, title: 'a'.repeat(161) }, token)).status, 400);
      const created = await request('/news', 'POST', body, token);
      assert.equal(created.status, 201);
      assert.equal(created.data.author, login.data.user.name);
      assert.equal((await request(`/news/${created.data.id}`)).data.content, body.content);
      assert.equal((await request('/news')).data[0].id, created.data.id);
      assert.equal((await request('/auth/logout', 'POST', undefined, token)).status, 204);
      assert.equal((await request('/auth/me', 'GET', undefined, token)).status, 401);
    }
    const malformed = await fetch(base + '/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
  } finally {
    await app.close();
  }
});


