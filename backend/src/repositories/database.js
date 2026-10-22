import { neon } from '@neondatabase/serverless';

// A conexão Neon é usada para as notícias quando DATABASE_URL está configurada.
export function createDatabaseClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada. Preencha backend/.env.');
  }

  return neon(process.env.DATABASE_URL, {
    fetchOptions: { signal: AbortSignal.timeout(15000) },
  });
}
