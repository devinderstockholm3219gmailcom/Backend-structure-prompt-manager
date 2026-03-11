import type { FastifyInstance } from 'fastify';
import {
  registerController,
  loginController,
  refreshController,
  profileController,
  
} from '../controllers/auth.controller.ts';

const authRoutes = async (fastify: FastifyInstance) => {
  // Public routes (no auth needed)
  fastify.post('/register', registerController);
  fastify.post('/login', loginController);
  fastify.post('/refresh', refreshController);

  // Protected routes (auth required)
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
  }, profileController);
};

export default authRoutes;