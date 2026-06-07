import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
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
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  linkedAccounts: z.object({
    psn: z.string().optional(),
    xbox: z.string().optional(),
    discord: z.string().optional(),
  }).default({}),
  friends: z.array(z.string()).default([]),
  gamerTag: z.string().optional(),
  tagPlatform: z.enum(['PSN', 'XBOX', 'STEAM']).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified']).default('unverified'),
  verificationCode: z.string().optional(),
  pushSubscription: z.any().optional(),
  gameStats: z.array(z.object({
    gameId: z.string(),
    eloRating: z.number().int().nonnegative().default(1000),
    stats: z.object({
      wins: z.number().int().nonnegative().default(0),
      losses: z.number().int().nonnegative().default(0),
      draws: z.number().int().nonnegative().default(0),
      dnfs: z.number().int().nonnegative().default(0),
    }).default({}),
  })).default([]),
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
    bio: { type: String, maxlength: 160 },
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
    avatarUrl: { type: String },
    bannerUrl: { type: String },
    linkedAccounts: {
      psn: { type: String },
      xbox: { type: String },
      discord: { type: String },
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    gamerTag: { type: String },
    tagPlatform: { type: String, enum: ['PSN', 'XBOX', 'STEAM'] },
    verificationStatus: { 
      type: String, 
      enum: ['unverified', 'pending', 'verified'], 
      default: 'unverified' 
    },
    verificationCode: { type: String },
    pushSubscription: { type: Schema.Types.Mixed },
    gameStats: [
      {
        gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
        eloRating: { type: Number, required: true, default: 1000 },
        stats: {
          wins: { type: Number, required: true, default: 0 },
          losses: { type: Number, required: true, default: 0 },
          draws: { type: Number, required: true, default: 0 },
          dnfs: { type: Number, required: true, default: 0 },
        },
      }
    ],
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserMongooseSchema);
