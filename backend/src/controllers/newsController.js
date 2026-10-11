import newsRepository from '../repositories/newsRepository.js';

// Controller: recebe a requisição, valida os campos e escolhe a resposta HTTP.
const newsController = {
  async list() {
    return await newsRepository.findAll();
  },

  async find(req, reply) {
    const item = await newsRepository.findById(req.params.id);
    if (!item) return reply.code(404).send({ message: 'Notícia não encontrada.' });
    return item;
  },

  async create(req, reply) {
    const limits = { title: 160, summary: 300, category: 50, content: 20000 };
    const values = {};

    for (const field in limits) {
      const value = req.body?.[field];
      if (typeof value !== 'string' || !value.trim() || value.trim().length > limits[field]) {
        return reply.code(400).send({ message: `Preencha ${field} (máximo de ${limits[field]} caracteres).` });
      }
      values[field] = value.trim();
    }

    // O autor vem da sessão; o cliente não pode escolher outro usuário.
    values.authorId = req.user.id;
    values.author = req.user.name;
    const item = await newsRepository.create(values);
    return reply.code(201).send(item);
  },
};

export default newsController;

