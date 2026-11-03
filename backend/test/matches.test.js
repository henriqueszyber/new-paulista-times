import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatchesService, weekRange } from '../src/services/matches.js';

const match = (id, utcDate) => ({ id, utcDate, status: 'TIMED', homeTeam: { name: 'Casa' }, awayTeam: { name: 'Visitante' } });

test('semana usa Brasília e atravessa ano corretamente', () => {
  assert.deepEqual(weekRange(Date.parse('2026-11-02T02:59:00Z')), { start: '2026-10-26', end: '2026-11-01', next: '2026-11-02' });
  assert.deepEqual(weekRange(Date.parse('2026-11-02T03:00:00Z')), { start: '2026-11-02', end: '2026-11-08', next: '2026-11-09' });
  assert.deepEqual(weekRange(Date.parse('2027-01-01T12:00:00Z')), { start: '2026-12-28', end: '2027-01-03', next: '2027-01-04' });
});

test('filtra semana local, ordena, compartilha consultas e invalida cache na virada da semana', async () => {
  let clock = Date.parse('2026-11-09T02:59:00Z');
  let calls = 0;
  const get = createMatchesService({ token: 'test', now: () => clock, fetcher: async (url) => {
    calls++;
    if (calls === 1) assert.match(url, /dateFrom=2026-11-02&dateTo=2026-11-09/);
    return { ok: true, json: async () => ({ matches: [match(2, '2026-11-09T02:00:00Z'), match(3, '2026-11-09T03:00:00Z'), match(1, '2026-11-02T03:00:00Z'), match(4, '2026-11-02T02:00:00Z')] }) };
  } });
  const [result] = await Promise.all([get(), get()]);
  assert.deepEqual(result.matches.map((m) => m.id), [1, 2]);
  assert.equal(result.matches[0].score.home, null);
  await get();
  assert.equal(calls, 1);
  clock += 60000;
  assert.deepEqual((await get()).matches.map((m) => m.id), [3]);
  assert.equal(calls, 2);
});

test('aceita semana vazia e trata falhas sem expor detalhes', async () => {
  const empty = createMatchesService({ token: 'test', fetcher: async () => ({ ok: true, json: async () => ({ matches: [] }) }) });
  assert.deepEqual((await empty()).matches, []);
  let calls = 0;
  const fail = createMatchesService({ token: 'test', fetcher: async () => { calls++; throw new Error('secret'); } });
  await assert.rejects(fail(), /temporariamente indisponíveis/);
  await assert.rejects(fail(), /temporariamente indisponíveis/);
  assert.equal(calls, 1);
  await assert.rejects(createMatchesService({ token: '' })(), /disponíveis em breve/);
});

test('próximo jogo ignora encerrados e partidas passadas, inclusive após cache e fora da semana', async (t) => {
  const { default: Fastify } = await import('fastify');
  const { default: sportsRoutes } = await import('../src/routes/sportsRoutes.js');
  let clock = Date.parse('2026-11-02T12:00:00Z');
  let calls = 0;
  const app = Fastify();
  t.after(() => app.close());
  app.register(sportsRoutes, { prefix: '/api/sports', matchesOptions: {
    token: 'test', now: () => clock, fetcher: async (url) => {
      calls++;
      assert.equal(url, 'https://api.football-data.org/v4/competitions/BSA/matches');
      return { ok: true, json: async () => ({ matches: [
        match(1, '2026-11-01T12:00:00Z'),
        { ...match(2, '2026-11-02T13:00:00Z'), status: 'POSTPONED' },
        match(4, '2026-11-15T12:00:00Z'),
        match(3, '2026-11-02T12:01:00Z'),
      ] }) };
    },
  } });
  const response = await app.inject('/api/sports/brasileirao/proximo-jogo');
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().match.id, 3);
  clock += 120000;
  assert.equal((await app.inject('/api/sports/brasileirao/proximo-jogo')).json().match.id, 4);
  assert.equal(calls, 1);
});
