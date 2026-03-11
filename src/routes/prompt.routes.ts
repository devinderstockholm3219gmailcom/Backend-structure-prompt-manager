import type { FastifyInstance } from 'fastify';
import {
  createPromptController,
  getPromptsController,
  getPromptByIdController,
  updatePromptController,
  deletePromptController,
} from '../controllers/prompt.controller.ts';

const promptRoutes = async (fastify: FastifyInstance) => {
  // All prompt routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // CRUD routes
  fastify.post('/', createPromptController);
  fastify.get('/', getPromptsController);
  fastify.get('/:id', getPromptByIdController);
  fastify.patch('/:id', updatePromptController);
  fastify.delete('/:id', deletePromptController);
};

export default promptRoutes;