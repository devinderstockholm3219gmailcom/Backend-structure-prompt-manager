import type { FastifyInstance } from 'fastify';
import {
  createCollectionController,
  getCollectionsController,
  getCollectionByIdController,
  updateCollectionController,
  deleteCollectionController,
} from '../controllers/collection.controller.ts';

const collectionRoutes = async (fastify: FastifyInstance) => {
  // All collection routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // CRUD routes
  fastify.post('/', createCollectionController);
  fastify.get('/', getCollectionsController);
  fastify.get('/:id', getCollectionByIdController);
  fastify.patch('/:id', updateCollectionController);
  fastify.delete('/:id', deleteCollectionController);
};

export default collectionRoutes;