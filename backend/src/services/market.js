const MINUTE = 60000;
const DAY = 86400000;
const CRYPTOS = [{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' }, { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' }, { id: 'solana', symbol: 'SOL', name: 'Solana' }];
const localDate = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));

function number(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') throw new Error('Invalid number');
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error('Invalid number');
  return result;
}
function positive(value) {
  const result = number(value);
  if (result <= 0) throw new Error('Invalid price');
  return result;
}
function timestamp(value) {
  const raw = positive(value);
  const date = new Date(raw < 1e12 ? raw * 1000 : raw);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid timestamp');
  return date.toISOString();
}

// Cache por processo e recurso, compartilhado por todos os visitantes.
function cached(loader, ttl, now, message) {
  let value;
  let expires = 0;
  let retryAfter = 0;
  let pending;
  return async () => {
    if (value && now() < expires) return value;
    if (now() < retryAfter) throw new Error(message);
    if (!pending) {
      pending = (async () => {
        try {
          value = await loader();
          expires = now() + ttl;
          return value;
        } catch {
          retryAfter = now() + MINUTE;
          throw new Error(message);
        } finally { pending = undefined; }
      })();
    }
    return pending;
  };
}

export function createMarketService({ fetcher = fetch, now = Date.now, awesomeKey = process.env.AWESOME_API_KEY, coinGeckoKey = process.env.COINGECKO_API_KEY } = {}) {
  const awesomeHeaders = awesomeKey?.trim() ? { 'x-api-key': awesomeKey.trim() } : {};
  const fetchedAt = () => new Date(now()).toISOString();
  async function request(url, headers = {}) {
    const response = await fetcher(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Provider unavailable');
    return response.json();
  }

  const stocks = cached(async () => {
    const data = await request('https://brapi.dev/api/quote/list?type=stock&sortBy=change&sortOrder=desc&limit=2000');
    if (!Array.isArray(data.stocks) || data.hasNextPage === true) throw new Error('Incomplete stock list');
    const candidates = data.stocks.filter((row) => row.type === 'stock' && /^[A-Z]{4}\d{1,2}$/.test(row.stock));
    const seen = new Set();
    const items = candidates.map((row) => ({ symbol: row.stock, name: row.name || row.stock, price: positive(row.close), changePercent: number(row.change), volume: number(row.volume) }))
      .filter((row) => {
        if (row.changePercent <= 0 || row.volume <= 0 || seen.has(row.symbol)) return false;
        seen.add(row.symbol);
        return true;
      }).sort((a, b) => b.changePercent - a.changePercent || b.volume - a.volume).slice(0, 3);
    return { source: 'brapi', fetchedAt: fetchedAt(), items };
  }, 30 * MINUTE, now, 'As altas da bolsa estão temporariamente indisponíveis. Tente novamente em um minuto.');

  const dollar = cached(async () => {
    const data = (await request('https://economia.awesomeapi.com.br/json/last/USD-BRL', awesomeHeaders)).USDBRL;
    if (!data || data.code !== 'USD' || data.codein !== 'BRL') throw new Error('Invalid currency');
    return { source: 'AwesomeAPI', fetchedAt: fetchedAt(), updatedAt: timestamp(data.timestamp), bid: positive(data.bid), ask: positive(data.ask), changePercent: number(data.pctChange) };
  }, 5 * MINUTE, now, 'A cotação do dólar está temporariamente indisponível. Tente novamente em um minuto.');

  // Uma consulta de histórico atende aos três períodos da interface.
  const history = cached(async () => {
    const data = await request('https://economia.awesomeapi.com.br/json/daily/USD-BRL/180', awesomeHeaders);
    if (!Array.isArray(data) || !data.length) throw new Error('Invalid history');
    const byDay = new Map();
    for (const row of data) {
      const at = timestamp(row.timestamp);
      const date = localDate(at);
      const previous = byDay.get(date);
      if (!previous || at > previous.updatedAt) byDay.set(date, { date, value: positive(row.bid), updatedAt: at });
    }
    return { source: 'AwesomeAPI', fetchedAt: fetchedAt(), points: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)) };
  }, 6 * 60 * MINUTE, now, 'O histórico do dólar está temporariamente indisponível. Tente novamente em um minuto.');

  const crypto = cached(async () => {
    if (!coinGeckoKey?.trim()) throw new Error('Missing key');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true';
    const data = await request(url, { 'x-cg-demo-api-key': coinGeckoKey.trim() });
    const items = CRYPTOS.map((coin) => {
      const item = data[coin.id];
      if (!item) throw new Error('Missing coin');
      return { ...coin, price: positive(item.usd), changePercent: item.usd_24h_change == null ? null : number(item.usd_24h_change), updatedAt: timestamp(item.last_updated_at) };
    });
    return { source: 'CoinGecko', fetchedAt: fetchedAt(), items };
  }, 10 * MINUTE, now, 'As cotações de criptomoedas estão temporariamente indisponíveis. Tente novamente em um minuto.');

  return {
    stocks, dollar, crypto,
    async history(days) {
      if (![30, 90, 180].includes(days)) throw new Error('Invalid period');
      const data = await history();
      const end = localDate(now());
      const start = new Date(Date.parse(end + 'T12:00:00Z') - (days - 1) * DAY).toISOString().slice(0, 10);
      return { ...data, days, points: data.points.filter((point) => point.date >= start && point.date <= end) };
    },
  };
}
