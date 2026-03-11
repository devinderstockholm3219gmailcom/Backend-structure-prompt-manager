import { UserModel } from '../models/User.ts';
import type { IUser } from '../types/user.types.ts';

// Find a user by email
export const findByEmail = async (email: string): Promise<IUser | null> => {
  return UserModel.findOne({ email });
};

// Find a user by ID
export const findById = async (id: string): Promise<IUser | null> => {
  return UserModel.findById(id);
};

// Create a new user
export const create = async (data: {
  email: string;
  password: string;
  username: string;
}): Promise<IUser> => {
  return UserModel.create(data);
};