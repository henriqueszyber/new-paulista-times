import imageController from '../controllers/imageController.js';
import authController from '../controllers/authController.js';

export default async function imageRoutes(app) {
  // Autenticação antes de ler o arquivo.
  app.post('/', { onRequest: authController.requireLogin }, imageController.upload);
}
