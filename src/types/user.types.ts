import type { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

// What a User looks like in our database
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  auth0Id: string | null;
}

// What we send back to the client (no password!)
export interface IUserResponse {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// What we need to create a new user
export interface ICreateUser {
  email: string;
  password: string;
  username: string;
}

// What we need to login
export interface ILoginUser {
  email: string;
  password: string;
}

// What our auth tokens look like
export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

// What's inside a JWT token when we decode it
export interface IJwtPayload {
  userId: string;
  
}