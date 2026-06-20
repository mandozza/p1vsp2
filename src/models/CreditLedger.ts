import { z } from 'zod';
import { creditLedger } from './schema';

export type CreditTransactionType = 
  | 'WAGER_WIN' 
  | 'WAGER_LOSS' 
  | 'WAGER_ESCROW'
  | 'WAGER_REFUND'
  | 'TRIBUNAL_REWARD' 
  | 'TOURNAMENT_FEE' 
  | 'TOURNAMENT_WIN'
  | 'SYSTEM_GRANT';

export const CreditLedgerSchema = z.object({
  userId: z.string(),
  amount: z.number().int(),
  type: z.enum(['WAGER_WIN', 'WAGER_LOSS', 'WAGER_ESCROW', 'WAGER_REFUND', 'TRIBUNAL_REWARD', 'TOURNAMENT_FEE', 'TOURNAMENT_WIN', 'SYSTEM_GRANT']),
  referenceId: z.string().optional(),
  balanceAfter: z.number().int(),
});

export type ICreditLedger = z.infer<typeof CreditLedgerSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
};

export const CreditLedger = creditLedger;
export default creditLedger;
