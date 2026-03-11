import { z } from 'zod';

// Validate MongoDB ObjectId format (24 hex characters)
export const objectIdSchema = z
  .string({ error: 'ID is required' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Validate route params like /api/prompts/:id
export const paramIdSchema = z.object({
  id: objectIdSchema,
});

export type ParamIdInput = z.infer<typeof paramIdSchema>;