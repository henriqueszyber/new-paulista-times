import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import sportsRoutes from '../src/routes/sportsRoutes.js';
import { createStandingsService } from '../src/services/standings.js';

const payload = { season: { startDate: '2026-01-28' }, standings: [{ type: 'TOTAL', table: [{ team: { id: 1, name: 'Clube de teste' }, position: 1, playedGames: 1, won: 1, draw: 0, lost: 0, points: 3, goalsFor: 2, goalsAgainst: 0, goalDifference: 2 }] }] };

test('consulta BSA com token no servidor, compartilha chamadas e expira cache', async () => {
  let calls = 0;
  let clock = 0;
  const get = createStandingsService({ token: 'secret', now: () => clock, fetcher: async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.football-data.org/v4/competitions/BSA/standings');
    assert.equal(options.headers['X-Auth-Token'], 'secret');
    return { ok: true, json: async () => payload };
  } });
  const results = await Promise.all([get(), get()]);
  assert.deepEqual(results[0], results[1]);
  assert.equal(results[0].teams[0].points, 3);
  assert.equal(results[0].season, '2026');
  await get();
  assert.equal(calls, 1);
  clock = 15 * 60 * 1000;
  await get();
  assert.equal(calls, 2);
});

test('sem token retorna 503 e não consulta o provedor', async (t) => {
  const app = Fastify();
  t.after(() => app.close());
  app.register(sportsRoutes, { prefix: '/api/sports', standingsOptions: { token: '', fetcher: () => assert.fail('Não deve consultar') } });
  const response = await app.inject('/api/sports/brasileirao');
  assert.equal(response.statusCode, 503);
  assert.match(response.json().message, /disponível em breve/);
});

for (const failure of ['rate-limit', 'invalid-json', 'invalid-table', 'timeout']) {
  test(`trata ${failure} e aguarda antes de repetir a chamada`, async () => {
    let calls = 0;
    let clock = 0;
    const get = createStandingsService({ token: 'secret', now: () => clock, fetcher: async () => {
      calls++;
      if (failure === 'timeout') throw new Error('secret provider details');
      return { ok: failure !== 'rate-limit', json: async () => {
        if (failure === 'invalid-json') throw new Error('Invalid JSON');
        return {};
      } };
    } });
    await assert.rejects(get(), /temporariamente indisponível/);
    await assert.rejects(get(), /temporariamente indisponível/);
    assert.equal(calls, 1);
    clock = 60000;
    await assert.rejects(get(), /temporariamente indisponível/);
    assert.equal(calls, 2);
  });
}
