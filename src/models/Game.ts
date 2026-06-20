import { z } from 'zod';
import { games } from './schema';

export const GameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  active: z.boolean().default(true),
  thumbnailUrl: z.string().url().optional(),
  aiPrompt: z.string().optional(),
  gameType: z.enum(['FIGHTING', 'SPORTS', 'RACING', 'SHOOTER']).default('FIGHTING'),
});

export type IGame = z.infer<typeof GameSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Game = games;
export default games;
