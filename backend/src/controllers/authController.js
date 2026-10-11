import userRepository from '../repositories/userRepository.js';
import sessionRepository from '../repositories/sessionRepository.js';

const authController = {
  async login(req, reply) {
    const { email, password } = req.body ?? {};
    const user = await userRepository.findByEmail(String(email).trim().toLowerCase());

    // Senha pública de demonstração: não há cadastro nem senhas reais neste protótipo.
    if (!user || password !== 'demo123') {
      return reply.code(401).send({ message: 'E-mail ou senha inválidos.' });
    }

    const token = await sessionRepository.create(user);
    return { token, user };
  },

  async me(req) {
    return req.user;
  },

  async logout(req, reply) {
    await sessionRepository.deleteByToken(req.token);
    return reply.code(204).send();
  },

  // preHandler do Fastify: executado antes das rotas que exigem login.
  async requireLogin(req, reply) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    const session = await sessionRepository.findByToken(token);

    if (!session) {
      return reply.code(401).send({ message: 'Entre novamente para continuar.' });
    }

    req.user = session.user;
    req.token = token;
  },
};

export default authController;
