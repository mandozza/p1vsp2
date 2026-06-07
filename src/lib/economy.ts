import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { CreditLedger, CreditTransactionType } from '@/models/CreditLedger';
import mongoose from 'mongoose';

/**
 * Atomically transfers credits and logs the transaction.
 */
export async function transferCredits(data: {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  referenceId?: string;
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();

    // 1. Update user balance atomically
    const user = await User.findOneAndUpdate(
      { _id: data.userId },
      { $inc: { creditBalance: data.amount } },
      { new: true, session }
    );

    if (!user) throw new Error('User not found');
    if (user.creditBalance < 0) throw new Error('Insufficient credits');

    // 2. Log to Ledger
    await CreditLedger.create([{
      userId: data.userId,
      amount: data.amount,
      type: data.type,
      referenceId: data.referenceId,
      balanceAfter: user.creditBalance,
    }], { session });

    await session.commitTransaction();
    return { success: true, balance: user.creditBalance };
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Credit Transfer Failed:', error);
    return { success: false, error: error.message };
  } finally {
    session.endSession();
  }
}
