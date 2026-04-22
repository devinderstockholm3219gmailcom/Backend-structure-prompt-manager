import type { Document, Types } from 'mongoose';

// What a Prompt looks like in our database
export interface IPrompt extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;  // ← was required, should be optional (not all prompts have descriptions)
  content: string;
  tags: string[];
  isFavorite: boolean;
  userId: Types.ObjectId;
  collectionId?: Types.ObjectId | null;  // ← added null (set to null when removed from collection)
  createdAt: Date;
  updatedAt: Date;
}

// What we need to create a new prompt
export interface ICreatePrompt {
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  isFavorite?: boolean;
  collectionId?: string;
}

// What we need to update a prompt
export interface IUpdatePrompt {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
  collectionId?: string | null;  // ← string = move to collection, null = remove from collection
}

// Query filters for searching prompts
export interface IPromptQuery {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  isFavorite?: boolean;
  collectionId?: string;
}