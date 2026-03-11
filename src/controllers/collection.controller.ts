import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  createCollectionSchema,
  updateCollectionSchema,
} from '../schemas/collection.schema.ts';
import { paramIdSchema } from '../schemas/common.schema.ts';
import { validate } from '../utils/validate.ts';
import * as collectionService from '../services/collection.service.ts';

// POST /api/collections
export const createCollectionController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(createCollectionSchema, request.body);
  const collection = await collectionService.createCollection(request.userId, body);

  return reply.status(201).send({
    success: true,
    message: 'Collection created successfully',
    data: { collection },
  });
};

// GET /api/collections
export const getCollectionsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const collections = await collectionService.getCollections(request.userId);

  return reply.status(200).send({
    success: true,
    data: { collections },
  });
};

// GET /api/collections/:id
export const getCollectionByIdController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  const data = await collectionService.getCollectionById(request.userId, id);

  return reply.status(200).send({
    success: true,
    data,
  });
};

// PATCH /api/collections/:id
export const updateCollectionController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  const body = validate(updateCollectionSchema, request.body);
  const collection = await collectionService.updateCollection(request.userId, id, body);

  return reply.status(200).send({
    success: true,
    message: 'Collection updated successfully',
    data: { collection },
  });
};

// DELETE /api/collections/:id
export const deleteCollectionController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = validate(paramIdSchema, request.params);
  await collectionService.deleteCollection(request.userId, id);

  return reply.status(200).send({
    success: true,
    message: 'Collection deleted successfully',
  });
};