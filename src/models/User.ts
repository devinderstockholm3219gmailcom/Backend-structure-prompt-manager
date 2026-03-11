import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser } from '../types/user.types.ts';

// Step 1: Define the schema (rules for how User data is stored)
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username must be less than 30 characters'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

  },

  

  
  {
    timestamps: true,
  }
);

// Step 2: Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Step 3: Remove password when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Step 4: Create and export the model
export const UserModel = mongoose.model<IUser>('User', userSchema);