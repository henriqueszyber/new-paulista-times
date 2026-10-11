import { neon } from '@neondatabase/serverless';

// O mesmo driver dos exercícios. A credencial fica apenas no .env local.
// Este módulo é usado somente pelo teste de conexão, nunca pelas notícias.
export function createDatabaseClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada. Preencha backend/.env.');
  }

  return neon(process.env.DATABASE_URL, {
    fetchOptions: { signal: AbortSignal.timeout(15000) },
  });
}
