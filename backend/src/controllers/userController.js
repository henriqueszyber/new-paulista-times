import userRepository from '../repositories/userRepository.js';

const userController = {
  async list(req, reply) {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
      return reply.code(403).send({ message: 'Apenas administradores podem consultar usuários.' });
    }
    return await userRepository.findAll();
  },
};

export default userController;
