import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import imageRoutes from './routes/imageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import newsRepository from './repositories/newsRepository.js';

// Cada grupo de rotas recebe um prefixo, como nos exercícios de backend.
export function createApp() {
  const app = Fastify({ bodyLimit: 256 * 1024 });

  app.addHook('onReady', async () => { await newsRepository.init(); });
  app.addHook('onClose', async () => { await newsRepository.close(); });

  app.register(multipart);
  app.register(imageRoutes, { prefix: '/api/images' });
  app.register(healthRoutes, { prefix: '/api/health' });
  app.register(newsRoutes, { prefix: '/api/news' });
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });

  app.setNotFoundHandler(async (_req, reply) => {
    return reply.code(404).send({ message: 'Rota não encontrada.' });
  });

  app.setErrorHandler(async (error, _req, reply) => {
    let status = 500;
    let message = 'Erro interno do servidor.';

    if (error.statusCode === 400 || error.statusCode === 413) {
      status = error.statusCode;
      message = 'JSON inválido ou conteúdo muito grande.';
    } else if (error.statusCode === 415) {
      status = 415;
      message = 'Formato de conteúdo não aceito. Envie os dados como JSON.';
    }

    return reply.code(status).send({ message });
  });

  return app;
}
