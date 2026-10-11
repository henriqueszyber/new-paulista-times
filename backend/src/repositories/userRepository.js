import { users } from '../data.js';

const userRepository = {
  async findAll() {
    return users;
  },

  async findByEmail(email) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email) return users[i];
    }
    return null;
  },
};

export default userRepository;
