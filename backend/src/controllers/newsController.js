import newsRepository from '../repositories/newsRepository.js';
import { normalizeDocument, documentHasText } from '../content.js';

function canEdit(user, item) {
  return user && (user.id === item.authorId || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
}

function readValues(body) {
  const values = {};
  for (const [field, limit] of Object.entries({ title: 160, summary: 300, category: 50 })) {
    const value = body?.[field];
    if (typeof value !== 'string' || value.trim().length > limit) return { error: `${field} deve ter no máximo ${limit} caracteres.` };
    values[field] = value.trim();
  }
  if (!values.title || !values.category) return { error: 'Preencha título e categoria.' };
  if (!['draft', 'published'].includes(body?.status)) return { error: 'Status inválido.' };
  values.status = body.status;
  values.content = normalizeDocument(body.content);
  if (!values.content) return { error: 'O conteúdo da notícia é inválido ou muito longo.' };
  if (values.status === 'published' && (!values.summary || !documentHasText(values.content))) {
    return { error: 'Para publicar, preencha resumo e conteúdo.' };
  }
  return { values };
}

const newsController = {
  async list() { return newsRepository.findAll(false); },
  async manage(req) {
    const news = await newsRepository.findAll(true);
    return req.user.role === 'WRITER'
      ? news.filter(item => item.status === 'published' || item.authorId === req.user.id)
      : news;
  },

  async find(req, reply) {
    const item = await newsRepository.findById(req.params.id);
    if (!item || item.status !== 'published') return reply.code(404).send({ message: 'Notícia não encontrada.' });
    return item;
  },

  async findForEdit(req, reply) {
    const item = await newsRepository.findById(req.params.id);
    if (!item) return reply.code(404).send({ message: 'Notícia não encontrada.' });
    if (!canEdit(req.user, item)) return reply.code(403).send({ message: 'Você não pode editar esta notícia.' });
    return item;
  },

  async create(req, reply) {
    const { values, error } = readValues(req.body);
    if (error) return reply.code(400).send({ message: error });
    values.authorId = req.user.id;
    values.author = req.user.name;
    return reply.code(201).send(await newsRepository.create(values));
  },

  async update(req, reply) {
    const item = await newsRepository.findById(req.params.id);
    if (!item) return reply.code(404).send({ message: 'Notícia não encontrada.' });
    if (!canEdit(req.user, item)) return reply.code(403).send({ message: 'Você não pode editar esta notícia.' });
    const { values, error } = readValues(req.body);
    if (error) return reply.code(400).send({ message: error });
    return newsRepository.update(item.id, values);
  },
};

export default newsController;
