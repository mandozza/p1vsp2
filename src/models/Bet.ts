import { z } from 'zod';
import { bets } from './schema';

export type BetStatus = 'pending' | 'won' | 'lost' | 'refunded';

export const BetSchema = z.object({
  userId: z.string(),
  matchId: z.string(),
  votedForId: z.string(),
  amount: z.number().int().positive(),
  odds: z.number().positive().default(2.0),
  status: z.enum(['pending', 'won', 'lost', 'refunded']).default('pending'),
});

export type IBet = z.infer<typeof BetSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Bet = bets;
export default bets;
