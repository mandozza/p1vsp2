import { z } from 'zod';
import { tournaments } from './schema';

export const TournamentSchema = z.object({
  name: z.string().min(1),
  gameId: z.string(),
  status: z.enum(['registration', 'in_progress', 'completed']).default('registration'),
  participants: z.array(z.string()).default([]),
  rounds: z.array(
    z.object({
      roundNumber: z.number(),
      matches: z.array(z.string()),
    })
  ).default([]),
  championId: z.string().optional(),
  entryFee: z.number().int().nonnegative().default(0),
  prizePool: z.number().int().nonnegative().default(0),
});

export type ITournament = z.infer<typeof TournamentSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Tournament = tournaments;
export default tournaments;
