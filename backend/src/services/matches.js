const DAY = 86400000;
const dateOnly = (date) => date.toISOString().slice(0, 10);
const localDate = (value) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));

export function weekRange(timestamp) {
  const today = new Date(localDate(timestamp) + 'T12:00:00Z');
  const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * DAY);
  return { start: dateOnly(monday), end: dateOnly(new Date(monday.getTime() + 6 * DAY)), next: dateOnly(new Date(monday.getTime() + 7 * DAY)) };
}

export function createMatchesService({ token = process.env.FOOTBALL_DATA_API_TOKEN, fetcher = fetch, now = Date.now, upcoming = false } = {}) {
  let cache;
  let expires = 0;
  let pending;
  let retryAfter = 0;
  return async function matches() {
    if (!token?.trim()) throw new Error('Os jogos estarão disponíveis em breve.');
    const week = weekRange(now());
    if (cache?.week.start === week.start && now() < expires) return cache;
    if (now() < retryAfter) throw new Error('Jogos temporariamente indisponíveis. Tente novamente em um minuto.');
    if (!pending) {
      pending = (async () => {
        try {
          // Inclui a segunda seguinte em UTC para preservar jogos de domingo à noite em Brasília.
          const url = upcoming ? 'https://api.football-data.org/v4/competitions/BSA/matches' : `https://api.football-data.org/v4/competitions/BSA/matches?dateFrom=${week.start}&dateTo=${week.next}`;
          const response = await fetcher(url, { headers: { 'X-Auth-Token': token }, signal: AbortSignal.timeout(10000) });
          if (!response.ok) throw new Error('Provider unavailable');
          const data = await response.json();
          if (!Array.isArray(data.matches)) throw new Error('Invalid matches');
          const team = (value) => ({ name: value.shortName || value.name, crest: typeof value.crest === 'string' && value.crest.startsWith('https://') ? value.crest : null });
          const matches = data.matches.map((match) => {
            if (!Number.isInteger(match.id) || !Number.isFinite(Date.parse(match.utcDate)) || !match.homeTeam?.name || !match.awayTeam?.name) throw new Error('Invalid match');
            return { id: match.id, utcDate: match.utcDate, date: localDate(match.utcDate), status: match.status, matchday: match.matchday, homeTeam: team(match.homeTeam), awayTeam: team(match.awayTeam), score: { home: match.score?.fullTime?.home ?? null, away: match.score?.fullTime?.away ?? null } };
          }).filter((match) => upcoming ? ['SCHEDULED', 'TIMED'].includes(match.status) : match.date >= week.start && match.date <= week.end).sort((a, b) => Date.parse(a.utcDate) - Date.parse(b.utcDate));
          cache = { week: { start: week.start, end: week.end }, updatedAt: new Date(now()).toISOString(), matches };
          expires = now() + 15 * 60000;
          return cache;
        } catch {
          retryAfter = now() + 60000;
          throw new Error('Jogos temporariamente indisponíveis. Tente novamente em um minuto.');
        } finally { pending = undefined; }
      })();
    }
    return pending;
  };
}
