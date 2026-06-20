import { z } from 'zod';
import { rivalries } from './schema';

export const RivalrySchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  stats: z.object({
    player1Wins: z.number().int().nonnegative().default(0),
    player2Wins: z.number().int().nonnegative().default(0),
    draws: z.number().int().nonnegative().default(0),
  }).default({ player1Wins: 0, player2Wins: 0, draws: 0 }),
  totalMatches: z.number().int().nonnegative().default(0),
  beltHolderId: z.string().optional(),
  lastMatchId: z.string().optional(),
});

export type IRivalry = z.infer<typeof RivalrySchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Rivalry = rivalries;
export default rivalries;
