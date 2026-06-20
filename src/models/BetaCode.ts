import { z } from 'zod';
import { betaCodes } from './schema';

export const BetaCodeSchema = z.object({
  code: z.string().min(6).max(20).transform(v => v.toUpperCase()),
  usedAt: z.date().optional(),
  note: z.string().optional(),
});

export type IBetaCode = z.infer<typeof BetaCodeSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const BetaCode = betaCodes;
export default betaCodes;
