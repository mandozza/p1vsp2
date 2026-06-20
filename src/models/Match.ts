import { z } from 'zod';
import { matches } from './schema';

export const MatchResultSchema = z.object({
  userId: z.string(),
  screenshotUrl: z.string().url(),
  videoUrl: z.string().url().optional(),
  aiExtractedData: z.object({
    winnerTag: z.string().optional(),
    loserTag: z.string().optional(),
    method: z.string().optional(),
    round: z.number().optional(),
    time: z.string().optional(),
    opponentQuit: z.boolean().optional(),
  }).optional(),
  submittedAt: z.date().default(() => new Date()),
});

export const MatchSchema = z.object({
  gameId: z.string(),
  challengerId: z.string(),
  defenderId: z.string(),
  status: z.enum([
    'pending', 
    'accepted', 
    'awaiting_results', 
    'verifying', 
    'completed', 
    'disputed', 
    'cancelled'
  ]).default('pending'),
  results: z.array(MatchResultSchema).default([]),
  finalOutcome: z.object({
    winnerId: z.string().optional(),
    method: z.string().optional(),
    round: z.number().optional(),
    time: z.string().optional(),
    isDNF: z.boolean().default(false),
    commentary: z.string().optional(),
    resolvedAt: z.date().optional(),
    resolvedBy: z.enum(['ai', 'admin', 'community']).optional(),
  }).optional(),
  votes: z.array(z.object({
    userId: z.string(),
    votedForId: z.string(),
    createdAt: z.date().default(() => new Date()),
  })).default([]),
  tournamentId: z.string().optional(),
  tournamentRound: z.number().optional(),
  wagerAmount: z.number().int().nonnegative().default(0),
  prediction: z.object({
    predictedWinnerId: z.string().optional(),
    confidence: z.number().optional(), // 0-1
    analysis: z.string().optional(),
    odds: z.object({
      challenger: z.number().default(2.0),
      defender: z.number().default(2.0),
    }).optional(),
  }).optional(),
});

export type IMatch = z.infer<typeof MatchSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Match = matches;
export default matches;
