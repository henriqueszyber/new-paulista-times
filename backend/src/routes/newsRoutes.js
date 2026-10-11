import newsController from '../controllers/newsController.js';
import authController from '../controllers/authController.js';

export default async function newsRoutes(app) {
  app.get('/', newsController.list);
  app.get('/:id', newsController.find);
  app.post('/', { preHandler: authController.requireLogin }, newsController.create);
}
