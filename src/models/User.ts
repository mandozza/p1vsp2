import { z } from 'zod';
import { users } from './schema';

export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  passwordHash: z.string().optional(),
  image: z.string().url().optional(),
  role: z.enum(['admin', 'member']).default('member'),
  creditBalance: z.number().int().nonnegative().default(1000),
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
    }).default({ wins: 0, losses: 0, draws: 0, dnfs: 0 }),
  })).default([]),
});

export type IUser = z.infer<typeof UserSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const User = users;
export default users;
