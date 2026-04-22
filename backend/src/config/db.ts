import mongoose from 'mongoose';
import { env } from './env.ts';

export const connectDB = async (): Promise<void> => {

  // Step 1: Set up event listeners BEFORE connecting
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });

  // Step 2: Try to connect
  try {
    await mongoose.connect(env.DATABASE_URL);
  } catch (error) {
    console.error('❌ MongoDB initial connection failed:');
    console.error(error);
    process.exit(1);
  }
};

