import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

export default async function userRoutes(app) {
  app.get('/', { preHandler: authController.requireLogin }, userController.list);
}
