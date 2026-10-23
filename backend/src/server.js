import { createApp } from './app.js';

const app = createApp();
const port = Number(process.env.PORT) || 3001;

try {
  await app.listen({ port, host: '127.0.0.1' });
  console.log(`API New Paulista Times: http://127.0.0.1:${port}/api/health`);
} catch (error) {
  const code = /^[A-Z0-9_]+$/.test(error.code ?? '') ? error.code : 'START_ERROR';
  console.error(`Não foi possível iniciar a API (${code}). Confira a porta e a conexão com o banco.`);
  process.exitCode = 1;
}
