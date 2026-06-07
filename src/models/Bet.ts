import mongoose, { Schema, Document, Model } from 'mongoose';

export type BetStatus = 'pending' | 'won' | 'lost' | 'refunded';

export interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  votedForId: mongoose.Types.ObjectId;
  amount: number;
  odds: number; // Potential payout multiplier (e.g. 1.5, 2.0)
  status: BetStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema = new Schema<IBet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    votedForId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    odds: { type: Number, default: 2.0 },
    status: { 
      type: String, 
      enum: ['pending', 'won', 'lost', 'refunded'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

BetSchema.index({ matchId: 1, status: 1 });
BetSchema.index({ userId: 1, createdAt: -1 });

export const Bet: Model<IBet> =
  mongoose.models.Bet || mongoose.model<IBet>('Bet', BetSchema);
