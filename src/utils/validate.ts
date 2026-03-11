import type { ZodSchema } from 'zod';
import { AppError } from '../plugins/errorHandler.ts';

// Validate data against a Zod schema — throws AppError if invalid
export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    throw new AppError(errors.join(', '), 400);
  }

  return result.data;
};