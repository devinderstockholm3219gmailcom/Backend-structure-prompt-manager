import * as promptRepo from '../repositories/prompt.repository.ts';
import { AppError } from '../plugins/errorHandler.ts';

import type { IPrompt } from '../types/prompt.types.ts';

// Create a new prompt
export const createPrompt = async (
  userId: string,
  data: {
    title: string;
    content: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
    collectionId?: string;
  },
): Promise<IPrompt> => {
  return promptRepo.create({ ...data, userId });
};

// Get all prompts for a user (with filters + pagination)
export const getPrompts = async (
  userId: string,
  query: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    isFavorite?: boolean;
    collectionId?: string;
  },
): Promise<{
  prompts: IPrompt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  // Build the filter
  const filter: Record<string, any> = { userId };

  // Search in title and content
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Filter by tags
  if (query.tags && query.tags.length > 0) {
    filter.tags = { $in: query.tags };
  }

  // Filter by favorite
  if (query.isFavorite !== undefined) {
    filter.isFavorite = query.isFavorite;
  }

  // Filter by collection
  if (query.collectionId) {
    filter.collectionId = query.collectionId;
  }

  const { prompts, total } = await promptRepo.findMany(filter, { page, limit });

  return {
    prompts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get a single prompt by ID
export const getPromptById = async (userId: string, promptId: string) => {
  const prompt = await promptRepo.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  return prompt;
};

// Update a prompt
export const updatePrompt = async (
  userId: string,
  promptId: string,
  data: {
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
    collectionId?: string | null;
  },
): Promise<IPrompt> => {
  const prompt = await promptRepo.updateById(promptId, userId, data);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  return prompt;
};

// Delete a prompt
export const deletePrompt = async (userId: string, promptId: string) => {
  const prompt = await promptRepo.deleteById(promptId, userId);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  return prompt;
};