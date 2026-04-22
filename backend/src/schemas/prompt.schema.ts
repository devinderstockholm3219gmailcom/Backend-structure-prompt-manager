import { z } from 'zod';

export const createPromptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .trim(),
  tags: z
    .array(z.string().trim())
    .optional(),
  isFavorite: z
    .boolean()
    .optional(),
  collectionId: z
    .string()
    .optional(),
});

export const updatePromptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .trim()
    .optional(),
  tags: z
    .array(z.string().trim())
    .optional(),
  isFavorite: z
    .boolean()
    .optional(),
  collectionId: z
    .string()
    .nullish(),
});

export const promptQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  search: z
    .string()
    .trim()
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(',').map((tag) => tag.trim()))
    .optional(),
  isFavorite: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  collectionId: z
    .string()
    .optional(),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type PromptQueryInput = z.infer<typeof promptQuerySchema>;