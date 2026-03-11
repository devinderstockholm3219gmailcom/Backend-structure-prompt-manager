import { CollectionModel } from '../models/Collection.ts';
import type { ICollection } from '../types/collection.types.ts';

// Create a new collection
export const create = async (data: {
  name: string;
  userId: string;
  description?: string;
}) => {
  return CollectionModel.create(data);
};

// Find one collection by filter
export const findOne = async (filter: Record<string, any>) => {
  return CollectionModel.findOne(filter);
};

// Find all collections for a user
export const findMany = async (filter: Record<string, any>) => {
  return CollectionModel.find(filter).sort({ createdAt: -1 });
};

// Update a collection by ID (only if it belongs to the user)
export const updateById = async (
  id: string,
  userId: string,
  data: Partial<Pick<ICollection, 'name' | 'description'>>,
) => {
  return CollectionModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true },
  );
};

// Delete a collection by ID (only if it belongs to the user)
export const deleteById = async (id: string, userId: string) => {
  return CollectionModel.findOneAndDelete({ _id: id, userId });
};