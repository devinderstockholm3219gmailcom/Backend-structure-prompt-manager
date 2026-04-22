import type { Document, Types } from 'mongoose';

// What a Collection looks like in our database
export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// What we need to create a new collection
export interface ICreateCollection {
  name: string;
  description?: string;
}

// What we need to update a collection
export interface IUpdateCollection {
  name?: string;
  description?: string;
}


