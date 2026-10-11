import authController from '../controllers/authController.js';

export default async function authRoutes(app) {
  app.post('/login', authController.login);
  app.get('/me', { preHandler: authController.requireLogin }, authController.me);
  app.post('/logout', { preHandler: authController.requireLogin }, authController.logout);
}
