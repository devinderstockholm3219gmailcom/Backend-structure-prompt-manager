import { PromptModel } from '../models/Prompt.ts';
import type { IPrompt } from '../types/prompt.types.ts';

// Create a new prompt
export const create = async (data: {
  title: string;
  content: string;
  userId: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  collectionId?: string;
}): Promise<IPrompt> => {
  return PromptModel.create(data);
};

// Find one prompt by filter
export const findOne = async (
  filter: Record<string, any>
): Promise<IPrompt | null> => {
  return PromptModel.findOne(filter);
};

// Find many prompts with filter, sort, pagination
export const findMany = async (
  filter: Record<string, any>,
  options: {
    page: number;
    limit: number;
    sort?: Record<string, 1 | -1>;
  },
): Promise<{ prompts: IPrompt[]; total: number }> => {
  const skip = (options.page - 1) * options.limit;

  const [prompts, total] = await Promise.all([
    PromptModel.find(filter)
      .sort(options.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(options.limit),
    PromptModel.countDocuments(filter),
  ]);

  return { prompts, total };
};

// Update a prompt
export const updateById = async (
  id: string,
  userId: string,
  data: {
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
    collectionId?: string | null;  // ← fix is here
  },
): Promise<IPrompt | null> => {
  return PromptModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true },
  );
};

// Delete a prompt
export const deleteById = async (
  id: string,
  userId: string
): Promise<IPrompt | null> => {
  return PromptModel.findOneAndDelete({ _id: id, userId });
};

// Count prompts for a user
export const countByUser = async (userId: string): Promise<number> => {
  return PromptModel.countDocuments({ userId });
};