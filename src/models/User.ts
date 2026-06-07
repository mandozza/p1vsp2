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
  eloRating: z.number().int().nonnegative().default(1000),
  stats: z.object({
    wins: z.number().int().nonnegative().default(0),
    losses: z.number().int().nonnegative().default(0),
    draws: z.number().int().nonnegative().default(0),
    dnfs: z.number().int().nonnegative().default(0),
  }).default({
    wins: 0,
    losses: 0,
    draws: 0,
    dnfs: 0,
  }),
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
    eloRating: { type: Number, required: true, default: 1000 },
    stats: {
      wins: { type: Number, required: true, default: 0 },
      losses: { type: Number, required: true, default: 0 },
      draws: { type: Number, required: true, default: 0 },
      dnfs: { type: Number, required: true, default: 0 },
    },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserMongooseSchema);
