import authController from '../controllers/authController.js';
import { createPlacesRepository } from '../repositories/placesRepository.js';

export default async function placesRoutes(app) {
  let repository;
  app.addHook('onReady', async () => { repository = await createPlacesRepository(); });
  app.addHook('onClose', async () => { repository?.close(); });
  app.get('/', async () => repository.list());
  // Durante o beta, visitantes também podem cadastrar pela página pública.
  const options = { preHandler: async (req, reply) => {
    if (req.headers.authorization) return authController.requireLogin(req, reply);
  } };
  const save = async (req, reply) => {
    const values = {};
    const googlePlaceId = req.body?.googlePlaceId ?? '';
    if (typeof googlePlaceId !== 'string' || googlePlaceId.length > 300 || (googlePlaceId && !/^[A-Za-z0-9_-]+$/.test(googlePlaceId))) {
      return reply.code(400).send({ message: 'Local do Google inválido. Selecione novamente na busca.' });
    }
    values.googlePlaceId = googlePlaceId;
    for (const [field, limit] of Object.entries({ name: 120, description: 500, category: 50, address: 250 })) {
      const value = field === 'category' ? (req.body?.category ?? 'Outros') : req.body?.[field];
      if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) {
        return reply.code(400).send({ message: `Preencha ${field} com até ${limit} caracteres.` });
      }
      values[field] = value.trim();
    }
    for (const [field, limit] of [['latitude', 90], ['longitude', 180]]) {
      const value = req.body?.[field];
      if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > limit) {
        return reply.code(400).send({ message: 'Busque e selecione um local válido no Google.' });
      }
      values[field] = value;
    }
    if (req.method === 'PUT') {
      const updated = await repository.update(req.params.id, values);
      if (!updated) return reply.code(404).send({ message: 'Local não encontrado.' });
      return updated;
    }
    return reply.code(201).send(await repository.create(values, req.user?.id || 'visitor'));
  };
  app.post('/', options, save);
  app.put('/:id', options, save);
}
