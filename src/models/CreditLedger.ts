import mongoose, { Schema, Document, Model } from 'mongoose';

export type CreditTransactionType = 
  | 'WAGER_WIN' 
  | 'WAGER_LOSS' 
  | 'WAGER_ESCROW'
  | 'WAGER_REFUND'
  | 'TRIBUNAL_REWARD' 
  | 'TOURNAMENT_FEE' 
  | 'TOURNAMENT_WIN'
  | 'SYSTEM_GRANT';

export interface ICreditLedger extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: CreditTransactionType;
  referenceId?: mongoose.Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
}

const CreditLedgerSchema = new Schema<ICreditLedger>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['WAGER_WIN', 'WAGER_LOSS', 'WAGER_ESCROW', 'WAGER_REFUND', 'TRIBUNAL_REWARD', 'TOURNAMENT_FEE', 'TOURNAMENT_WIN', 'SYSTEM_GRANT'], 
      required: true 
    },
    referenceId: { type: Schema.Types.ObjectId },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CreditLedgerSchema.index({ userId: 1, createdAt: -1 });

export const CreditLedger: Model<ICreditLedger> =
  mongoose.models.CreditLedger || mongoose.model<ICreditLedger>('CreditLedger', CreditLedgerSchema);
