import { createMatchesService } from '../services/matches.js';
import { createStandingsService } from '../services/standings.js';

export default async function sportsRoutes(app, options) {
  const upcomingMatches = createMatchesService({ ...options.matchesOptions, upcoming: true });
  app.get('/brasileirao/proximo-jogo', async (_request, reply) => {
    try {
      const data = await upcomingMatches();
      const now = options.matchesOptions?.now?.() ?? Date.now();
      return { updatedAt: data.updatedAt, match: data.matches.find((match) => Date.parse(match.utcDate) > now) || null };
    } catch (error) {
      return reply.code(503).send({ message: error.message });
    }
  });
  const matches = createMatchesService(options.matchesOptions);
  app.get('/brasileirao/jogos', async (_request, reply) => {
    try {
      return await matches();
    } catch (error) {
      return reply.code(503).send({ message: error.message });
    }
  });
  const standings = createStandingsService(options.standingsOptions);
  app.get('/brasileirao', async (_request, reply) => {
    try {
      return await standings();
    } catch (error) {
      return reply.code(503).send({ message: error.message });
    }
  });
}
