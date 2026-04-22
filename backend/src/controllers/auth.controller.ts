import type { FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema.ts';
import { validate } from '../utils/validate.ts';
import * as authService from '../services/auth.service.ts';



// POST /api/auth/register
export const registerController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(registerSchema, request.body);
  const data = await authService.register(body);

  return reply.status(201).send({
    success: true,
    message: 'User registered successfully',
    data,
  });
};

// POST /api/auth/login
export const loginController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(loginSchema, request.body);
  const data = await authService.login(body);

  return reply.status(200).send({
    success: true,
    message: 'Login successful',
    data,
  });
};

// POST /api/auth/refresh
export const refreshController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(refreshTokenSchema, request.body);
  const tokens = await authService.refresh(body.refreshToken);

  return reply.status(200).send({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { tokens },
  });
};

// GET /api/auth/profile
export const profileController = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await authService.getProfile(request.userId);

  return reply.status(200).send({
    success: true,
    data: { user },
  });
};

