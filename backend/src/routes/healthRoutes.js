import healthController from '../controllers/healthController.js';

export default async function healthRoutes(app) {
  app.get('/', healthController.check);
}
