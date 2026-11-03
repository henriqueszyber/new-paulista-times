import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import economyRoutes from '../src/routes/economyRoutes.js';
import { createMarketService } from '../src/services/market.js';

const NOW = Date.parse('2026-11-02T18:00:00Z');
const response = (data) => ({ ok: true, json: async () => data });
const stock = (symbol, change, volume = 100, close = 10) => ({ stock: symbol, type: 'stock', name: symbol, close, change, volume });
const usd = { USDBRL: { code: 'USD', codein: 'BRL', bid: '5.1234', ask: '5.125', pctChange: '-0.3', timestamp: NOW / 1000 } };

test('ranking exclui fracionário, quedas e ativos sem volume; ordena e limita a três', async () => {
  const service = createMarketService({ fetcher: async () => response({ stocks: [stock('TEST3F', 90), stock('AAAA3', 5), stock('BBBB4', 8), stock('CCCC3', -2), stock('DDDD3', 99, 0), stock('EEEE3', 7), stock('FFFF4', 3)] }) });
  assert.deepEqual((await service.stocks()).items.map((item) => item.symbol), ['BBBB4', 'EEEE3', 'AAAA3']);
});

test('não publica ranking parcial quando o provedor indica outra página', async () => {
  const service = createMarketService({ fetcher: async () => response({ stocks: [stock('AAAA3', 3)], hasNextPage: true }) });
  await assert.rejects(service.stocks(), /temporariamente indisponíveis/);
});

test('compartilha consulta concorrente, respeita cache e guarda a chave no header', async () => {
  let calls = 0;
  let now = NOW;
  let captured;
  const service = createMarketService({ awesomeKey: 'private-key', now: () => now, fetcher: async (url, options) => {
    calls++;
    captured = { url, options };
    return response(usd);
  } });
  const [a, b] = await Promise.all([service.dollar(), service.dollar()]);
  assert.deepEqual(a, b);
  assert.equal(a.bid, 5.1234);
  assert.equal(captured.options.headers['x-api-key'], 'private-key');
  assert.ok(!captured.url.includes('private-key'));
  assert.ok(!JSON.stringify(a).includes('private-key'));
  await service.dollar();
  assert.equal(calls, 1);
  now += 5 * 60000;
  await service.dollar();
  assert.equal(calls, 2);
});

test('histórico ordena, deduplica em Brasília e reutiliza uma consulta entre períodos', async () => {
  let calls = 0;
  const rows = [
    { bid: '5.1', timestamp: NOW / 1000 },
    { bid: '5.0', timestamp: Date.parse('2026-11-02T01:00:00Z') }, // 01/11 Brasília, em ms
    { bid: '4.9', timestamp: Date.parse('2026-11-01T20:00:00Z') / 1000 },
    { bid: '4.8', timestamp: Date.parse('2026-09-01T18:00:00Z') / 1000 },
  ];
  const service = createMarketService({ now: () => NOW, fetcher: async () => { calls++; return response(rows); } });
  const short = await service.history(30);
  assert.deepEqual(short.points.map((p) => p.date), ['2026-11-01', '2026-11-02']);
  assert.equal(short.points[0].value, 5.0);
  assert.equal((await service.history(90)).points.length, 3);
  assert.equal((await service.history(180)).points.length, 3);
  assert.equal(calls, 1);
});

test('criptos são consultadas juntas em USD, preservam variação ausente e usam cache de dez minutos', async () => {
  let calls = 0;
  let now = NOW;
  let captured;
  const data = Object.fromEntries(['bitcoin', 'ethereum', 'solana'].map((id) => [id, { usd: 123.4, usd_24h_change: null, last_updated_at: NOW / 1000 }]));
  const service = createMarketService({ coinGeckoKey: 'private-key', now: () => now, fetcher: async (url, options) => {
    calls++; captured = { url, options }; return response(data);
  } });
  assert.equal((await service.crypto()).items.length, 3);
  assert.equal((await service.crypto()).items[0].changePercent, null);
  assert.match(captured.url, /ids=bitcoin,ethereum,solana&vs_currencies=usd/);
  assert.equal(captured.options.headers['x-cg-demo-api-key'], 'private-key');
  now += 9 * 60000;
  await service.crypto();
  assert.equal(calls, 1);
  now += 60000;
  await service.crypto();
  assert.equal(calls, 2);
});

for (const kind of ['rate-limit', 'timeout', 'json', 'invalid-price']) {
  test(`falha ${kind}: mensagem segura, cooldown e recuperação`, async () => {
    let calls = 0;
    let now = NOW;
    const service = createMarketService({ now: () => now, fetcher: async () => {
      calls++;
      if (calls > 1) return response(usd);
      if (kind === 'timeout') throw new Error('private-key');
      if (kind === 'rate-limit') return { ok: false, status: 429 };
      if (kind === 'json') return { ok: true, json: async () => { throw new Error('private-key'); } };
      return response({ USDBRL: { ...usd.USDBRL, bid: null } });
    } });
    await assert.rejects(service.dollar(), /temporariamente indisponível/);
    await assert.rejects(service.dollar(), /temporariamente indisponível/);
    assert.equal(calls, 1);
    now += 60000;
    assert.equal((await service.dollar()).bid, 5.1234);
  });
}

test('rotas validam período e isolam cripto sem chave dos outros blocos', async (t) => {
  let calls = 0;
  const app = Fastify();
  t.after(() => app.close());
  app.register(economyRoutes, { prefix: '/api/economy', marketOptions: { coinGeckoKey: '', now: () => NOW, fetcher: async () => { calls++; return response(usd); } } });
  assert.equal((await app.inject('/api/economy/dolar/historico?days=999')).statusCode, 400);
  assert.equal((await app.inject('/api/economy/criptos')).statusCode, 503);
  assert.equal(calls, 0);
  assert.equal((await app.inject('/api/economy/dolar')).statusCode, 200);
  assert.equal(calls, 1);
});
