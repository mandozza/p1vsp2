import { z } from 'zod';
import { betaPageViews } from './schema';

export const BetaPageViewSchema = z.object({
  sessionId: z.string(),
  path: z.string(),
  userId: z.string().optional(),
});

export type IBetaPageView = z.infer<typeof BetaPageViewSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
};

export const BetaPageView = betaPageViews;
export default betaPageViews;
