import { createDatabaseClient } from '../src/repositories/database.js';

try {
  const db = createDatabaseClient();
  const result = await db`SELECT 1 AS ok`;
  if (result[0]?.ok !== 1) throw new Error('Resposta inesperada.');
  console.log('Neon: conexão HTTPS e SELECT 1 concluídos com sucesso. Nenhuma tabela ou dado alterado.');
} catch (error) {
  // Não exibir a mensagem completa do driver, que pode conter a conexão.
  const code = /^[A-Z0-9_]+$/.test(error.code ?? '') ? error.code : 'CONNECTION_ERROR';
  console.error(`Falha no teste do Neon (${code}). Confira DATABASE_URL e o acesso à rede.`);
  process.exitCode = 1;
}
