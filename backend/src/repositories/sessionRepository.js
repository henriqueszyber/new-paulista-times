import { randomUUID } from 'node:crypto';

// Sessões em array. O token aleatório nativo já existia no protótipo;
// ele impede que um visitante adivinhe a sessão de outro usuário.
const sessions = [];

const sessionRepository = {
  async create(user) {
    // Percorrer de trás para frente permite remover itens sem pular posições.
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (sessions[i].expiresAt <= Date.now()) sessions.splice(i, 1);
    }
    const token = randomUUID();
    sessions.push({ token, user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    return token;
  },

  async findByToken(token) {
    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].token === token) {
        if (sessions[i].expiresAt <= Date.now()) {
          sessions.splice(i, 1);
          return null;
        }
        return sessions[i];
      }
    }
    return null;
  },

  async deleteByToken(token) {
    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].token === token) {
        sessions.splice(i, 1);
        return;
      }
    }
  },
};

export default sessionRepository;
