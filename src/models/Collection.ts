import mongoose, { Schema } from 'mongoose';
import type { ICollection } from '../types/collection.types.ts';

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      minlength: [1, 'Collection name cannot be empty'],
      maxlength: [100, 'Collection name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index: find all collections by user (fast lookup)
collectionSchema.index({ userId: 1 });

// Compound unique index: same user can't have two collections with the same name
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const CollectionModel = mongoose.model<ICollection>('Collection', collectionSchema);