import mongoose, { Schema } from 'mongoose';
import type { IPrompt } from '../types/prompt.types.ts';

const promptSchema = new Schema<IPrompt>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title must be less than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Prompt content is required'],
      minlength: [1, 'Content cannot be empty'],
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching
promptSchema.index({ userId: 1 });
promptSchema.index({ userId: 1, isFavorite: 1 });
promptSchema.index({ userId: 1, tags: 1 });
promptSchema.index({ title: 'text', description: 'text', content: 'text' });

export const PromptModel = mongoose.model<IPrompt>('Prompt', promptSchema);