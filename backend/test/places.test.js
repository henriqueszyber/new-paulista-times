import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';

 test('locais: cadastro público no beta, três perfis, validação e persistência', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'paulista-places-'));
  process.env.NEWS_DB_PATH = join(directory, 'test.sqlite');
  let app = createApp();
  const local = { name: 'Praça de teste', description: 'Local cadastrado no teste', googlePlaceId: 'ChIJ_test-place', address: 'São Paulo, SP', latitude: -23.55, longitude: -46.63 };
  const create = (payload, token) => app.inject({ method: 'POST', url: '/api/places', payload, headers: token ? { authorization: `Bearer ${token}` } : {} });
  try {
    assert.equal((await app.inject('/api/places')).statusCode, 200);
    assert.equal((await create({ ...local, name: 'visitante' })).statusCode, 201);
    assert.equal((await create({ ...local, name: '' })).statusCode, 400);
    assert.equal((await create(local, 'invalido')).statusCode, 401);
    for (const role of ['super', 'admin', 'writer']) {
      const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: `${role}@jynx.local`, password: 'demo123' } });
      const { token } = login.json();
      assert.ok(token);
      for (const invalid of [{ googlePlaceId: '<script>' }, { googlePlaceId: 123 }, { latitude: 91 }, { longitude: -181 }, { latitude: '' }, { name: ' ' }, { description: 'x'.repeat(501) }]) {
        assert.equal((await create({ ...local, ...invalid }, token)).statusCode, 400);
      }
      const response = await create({ ...local, name: role }, token);
      assert.equal(response.statusCode, 201);
      assert.equal(response.json().name, role);
      assert.equal(response.json().category, 'Outros');
      assert.equal(response.json().googlePlaceId, local.googlePlaceId);
      await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { authorization: `Bearer ${token}` } });
      assert.equal((await create(local, token)).statusCode, 401);
    }
    const before = (await app.inject('/api/places')).json();
    const visitor = before.find(item => item.name === 'visitante');
    const updatedValues = { ...local, name: 'visitante editado', description: 'Descrição atualizada', category: 'Restaurantes', latitude: -23.56, longitude: -46.64, googlePlaceId: 'ChIJ_updated' };
    const update = payload => app.inject({ method: 'PUT', url: `/api/places/${visitor.id}`, payload });
    assert.equal((await update({ ...updatedValues, name: '' })).statusCode, 400);
    assert.equal((await app.inject({ method: 'PUT', url: '/api/places/inexistente', payload: updatedValues })).statusCode, 404);
    const edited = await update(updatedValues);
    assert.equal(edited.statusCode, 200);
    assert.equal(edited.json().id, visitor.id);
    assert.equal(edited.json().createdAt, visitor.createdAt);
    assert.equal((await app.inject('/api/places')).json().length, 4);
    await app.close();
    app = createApp();
    const places = (await app.inject('/api/places')).json();
    assert.equal(places.length, 4);
    assert.deepEqual(places.map(item => item.name).sort(), ['admin', 'super', 'visitante editado', 'writer']);
    const savedEdit = places.find(item => item.id === visitor.id);
    for (const [field, value] of Object.entries(updatedValues)) assert.equal(savedEdit[field], value);
    assert.equal(places.find(item => item.name === 'admin').name, 'admin');
  } finally {
    await app.close();
    delete process.env.NEWS_DB_PATH;
    rmSync(directory, { recursive: true, force: true });
  }
});
