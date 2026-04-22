import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  createPromptSchema,
  updatePromptSchema,
  promptQuerySchema,
} from '../schemas/prompt.schema.ts';
import { paramIdSchema } from '../schemas/common.schema.ts';
import { validate } from '../utils/validate.ts';
import * as promptService from '../services/prompt.service.ts';

// POST /api/prompts
export const createPromptController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(createPromptSchema, request.body);
  const prompt = await promptService.createPrompt(request.userId, body);

  return reply.status(201).send({
    success: true,
    message: 'Prompt created successfully',
    data: { prompt },
  });
};

// GET /api/prompts
export const getPromptsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = validate(promptQuerySchema, request.query);
  const data = await promptService.getPrompts(request.userId, query);

  return reply.status(200).send({
    success: true,
    data: { prompts: data.prompts, pagination: data.pagination },
  });
};

// GET /api/prompts/:id
export const getPromptByIdController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  const prompt = await promptService.getPromptById(request.userId, id);

  return reply.status(200).send({
    success: true,
    data: { prompt },
  });
};

// PATCH /api/prompts/:id
export const updatePromptController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  const body = validate(updatePromptSchema, request.body);
  const prompt = await promptService.updatePrompt(request.userId, id, body);

  return reply.status(200).send({
    success: true,
    message: 'Prompt updated successfully',
    data: { prompt },
  });
};

// DELETE /api/prompts/:id
export const deletePromptController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  await promptService.deletePrompt(request.userId, id);

  return reply.status(200).send({
    success: true,
    message: 'Prompt deleted successfully',
  });
};