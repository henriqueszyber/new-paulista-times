import { createMarketService } from '../services/market.js';

export default async function economyRoutes(app, options) {
  const service = createMarketService(options.marketOptions);
  for (const [path, method] of [['/altas', 'stocks'], ['/dolar', 'dollar'], ['/criptos', 'crypto']]) {
    app.get(path, async (_request, reply) => {
      try { return await service[method](); }
      catch (error) { return reply.code(503).send({ message: error.message }); }
    });
  }
  app.get('/dolar/historico', async (request, reply) => {
    const days = request.query.days === undefined ? '30' : request.query.days;
    if (!['30', '90', '180'].includes(days)) return reply.code(400).send({ message: 'Escolha um período de 30, 90 ou 180 dias.' });
    try { return await service.history(Number(days)); }
    catch (error) { return reply.code(503).send({ message: error.message }); }
  });
}
