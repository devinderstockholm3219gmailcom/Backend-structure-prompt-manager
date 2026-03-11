import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import type { IJwtPayload } from '../types/user.types.ts';

// Extend Fastify's types
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// The authenticate function — checks if user is logged in
const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      message: 'Access token is required',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return reply.status(401).send({
      success: false,
      message: 'Access token is required',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
    request.userId = decoded.userId;
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

// Wrap it as a Fastify plugin
const authenticatePlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', authenticate);
};

export default fp(authenticatePlugin, {
  name: 'authenticate',
});