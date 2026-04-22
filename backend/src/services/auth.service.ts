import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.ts';
import * as authRepo from '../repositories/auth.repository.ts';
import { AppError } from '../plugins/errorHandler.ts';
import type { IUser, IUserResponse, ITokens, IJwtPayload } from '../types/user.types.ts';

// Helper: generate access + refresh tokens
export const generateTokens = (userId: string): ITokens => {
  const accessToken = jwt.sign(
    { userId } as IJwtPayload,
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId } as IJwtPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

// Helper: format user for response (remove sensitive data)
// Uses IUser directly — no more inline type with wrong field names
const formatUserResponse = (user: IUser): IUserResponse => {
  return {
    id: String(user._id),
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
};

// Register a new user
export const register = async (data: {
  email: string;
  password: string;
  username: string;            // ← was 'name'
}): Promise<{ user: IUserResponse; tokens: ITokens }> => {
  // Check if email already exists
  const existingUser = await authRepo.findByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  // Create user (password hashed by pre-save hook)
  const user = await authRepo.create(data);

  // Generate tokens
  const tokens = generateTokens(String(user._id));

  return {
    user: formatUserResponse(user),
    tokens,
  };
};

// Login an existing user
export const login = async (data: {
  email: string;
  password: string;
}): Promise<{ user: IUserResponse; tokens: ITokens }> => {
  // Find user by email
  const user = await authRepo.findByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokens(String(user._id));

  return {
    user: formatUserResponse(user),
    tokens,
  };
};

// Refresh access token
export const refresh = async (refreshToken: string): Promise<ITokens> => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as IJwtPayload;

    // Check if user still exists
    const user = await authRepo.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new tokens
    return generateTokens(String(user._id));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

// Get user profile
export const getProfile = async (userId: string): Promise<IUserResponse> => {
  const user = await authRepo.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return formatUserResponse(user);
};