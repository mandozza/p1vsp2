import { db } from '@/lib/db';
import { User } from '@/models/User';
import { CreditLedger, CreditTransactionType } from '@/models/CreditLedger';
import { eq } from 'drizzle-orm';

/**
 * Atomically transfers credits and logs the transaction using Drizzle transactions.
 */
export async function transferCredits(data: {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  referenceId?: string;
}) {
  try {
    return await db.transaction(async (tx: any) => {
      // 1. Get user to verify balance and existence, locking the row for updates
      const [user] = await tx
        .select()
        .from(User)
        .where(eq(User.id, data.userId))
        .for('update');

      if (!user) throw new Error('User not found');

      const newBalance = user.creditBalance + data.amount;
      if (newBalance < 0) throw new Error('Insufficient credits');

      // 2. Update user balance
      await tx
        .update(User)
        .set({ creditBalance: newBalance })
        .where(eq(User.id, data.userId));

      // 3. Log to Ledger
      await tx.insert(CreditLedger).values({
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        referenceId: data.referenceId,
        balanceAfter: newBalance,
      });

      return { success: true, balance: newBalance };
    });
  } catch (error: any) {
    console.error('Credit Transfer Failed:', error);
    return { success: false, error: error.message };
  }
}
