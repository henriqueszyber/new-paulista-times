import newsController from '../controllers/newsController.js';
import authController from '../controllers/authController.js';

export default async function newsRoutes(app) {
  app.get('/', newsController.list);
  app.get('/manage', { preHandler: authController.requireLogin }, newsController.manage);
  app.get('/manage/:id', { preHandler: authController.requireLogin }, newsController.findForEdit);
  app.get('/:id', newsController.find);
  app.post('/', { preHandler: authController.requireLogin }, newsController.create);
  app.put('/:id', { preHandler: authController.requireLogin }, newsController.update);
}
