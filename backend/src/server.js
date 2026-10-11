import { createApp } from './app.js';

const app = createApp();
const port = Number(process.env.PORT) || 3001;

try {
  await app.listen({ port, host: '127.0.0.1' });
  console.log(`API New Paulista Times: http://127.0.0.1:${port}/api/health`);
} catch {
  console.error('Não foi possível iniciar a API. Confira se a porta está disponível.');
  process.exitCode = 1;
}
