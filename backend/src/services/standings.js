const URL = 'https://api.football-data.org/v4/competitions/BSA/standings';
const TTL = 15 * 60 * 1000;

export function createStandingsService({ token = process.env.FOOTBALL_DATA_API_TOKEN, fetcher = fetch, now = Date.now } = {}) {
  let cached;
  let expires = 0;
  let pending;
  let retryAfter = 0;

  return async function standings() {
    if (!token?.trim()) {
      throw new Error('A classificação estará disponível em breve.', { cause: 'NOT_CONFIGURED' });
    }
    if (cached && now() < expires) return cached;
    if (now() < retryAfter) throw new Error('Classificação temporariamente indisponível. Tente novamente em um minuto.');
    if (!pending) {
      pending = (async () => {
        try {
          const response = await fetcher(URL, {
            headers: { 'X-Auth-Token': token },
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error('Provider unavailable');
          const data = await response.json();
          const table = data.standings?.find((standing) => standing.type === 'TOTAL')?.table;
          if (!Array.isArray(table) || !data.season?.startDate) throw new Error('Invalid standings');
          const fields = ['position', 'playedGames', 'won', 'draw', 'lost', 'points', 'goalsFor', 'goalsAgainst', 'goalDifference'];
          const teams = table.map((row) => {
            if (!row.team?.name || !Number.isInteger(row.team.id) || fields.some((field) => !Number.isInteger(row[field]))) {
              throw new Error('Invalid team');
            }
            return {
              id: row.team.id,
              name: row.team.shortName || row.team.name,
              crest: typeof row.team.crest === 'string' && row.team.crest.startsWith('https://') ? row.team.crest : null,
              ...Object.fromEntries(fields.map((field) => [field, row[field]])),
            };
          });
          cached = { season: data.season.startDate.slice(0, 4), updatedAt: new Date(now()).toISOString(), teams };
          expires = now() + TTL;
          return cached;
        } catch {
          retryAfter = now() + 60000;
          throw new Error('Classificação temporariamente indisponível. Tente novamente em um minuto.');
        } finally {
          pending = undefined;
        }
      })();
    }
    return pending;
  };
}
