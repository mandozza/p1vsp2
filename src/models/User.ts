import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  image: z.string().url().optional(),
  role: z.enum(['admin', 'member']).default('member'),
  creditBalance: z.number().int().nonnegative().default(1000), // Starting credits
  totalWins: z.number().int().nonnegative().default(0),
});

export type IUser = z.infer<typeof UserSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserMongooseSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, select: false },
    image: { type: String },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    creditBalance: { type: Number, required: true, default: 1000 },
    totalWins: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserMongooseSchema);
