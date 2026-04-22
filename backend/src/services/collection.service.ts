import * as collectionRepo from '../repositories/collection.repository.ts';
import type { ICollection } from '../types/collection.types.ts';
import type { IPrompt } from '../types/prompt.types.ts';
import { PromptModel } from '../models/Prompt.ts';
import { AppError } from '../plugins/errorHandler.ts';

// Create a new collection
export const createCollection = async (
  userId: string,
  data: { name: string; description?: string },
): Promise<ICollection> => {
  return collectionRepo.create({ ...data, userId });
};

// Get all collections for a user
export const getCollections = async (userId: string): Promise<ICollection[]> => {
  return collectionRepo.findMany({ userId });
};

// Get a single collection by ID (with its prompts)
export const getCollectionById = async (
  userId: string,
  collectionId: string,
): Promise<{ collection: ICollection; prompts: IPrompt[] }> => {
  const collection = await collectionRepo.findOne({ _id: collectionId, userId });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Fetch prompts that belong to this collection
  const prompts = await PromptModel.find({ collectionId, userId }).sort({ createdAt: -1 });

  return { collection, prompts };
};

// Update a collection
export const updateCollection = async (
  userId: string,
  collectionId: string,
  data: { name?: string; description?: string },
): Promise<ICollection> => {
  const collection = await collectionRepo.updateById(collectionId, userId, data);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  return collection;
};

// Delete a collection (also unlinks prompts from it)
export const deleteCollection = async (
  userId: string,
  collectionId: string,
): Promise<ICollection> => {
  const collection = await collectionRepo.deleteById(collectionId, userId);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Unlink all prompts that belonged to this collection (set collectionId to null)
  await PromptModel.updateMany(
    { collectionId, userId },
    { $set: { collectionId: null } },
  );

  return collection;
};