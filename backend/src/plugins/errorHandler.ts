import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

// Custom error class for our app
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

// The error handler function
const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Log the error for debugging
  request.log.error(error);

  // Case 1: Our custom AppError (we threw it intentionally)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    });
  }

  // Case 2: Mongoose duplicate key error (e.g., email already exists)
  if (error.message?.includes('E11000')) {
    return reply.status(409).send({
      success: false,
      message: 'Resource already exists',
    });
  }

  // Case 3: Mongoose validation error
  if (error.message?.includes('validation failed')) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  // Case 4: Fastify validation error (schema validation)
  if ('validation' in error) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  // Case 5: Unknown error (something unexpected)
  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return reply.status(statusCode).send({
    success: false,
    message,
  });
};

// Wrap it as a Fastify plugin
const errorHandlerPlugin = async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(errorHandler);
};

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
});