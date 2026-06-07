import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRivalry extends Document {
  player1Id: mongoose.Types.ObjectId;
  player2Id: mongoose.Types.ObjectId;
  stats: {
    player1Wins: number;
    player2Wins: number;
    draws: number;
  };
  totalMatches: number;
  beltHolderId?: mongoose.Types.ObjectId;
  lastMatchId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RivalrySchema = new Schema<IRivalry>(
  {
    player1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    player2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stats: {
      player1Wins: { type: Number, default: 0 },
      player2Wins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },
    totalMatches: { type: Number, default: 0 },
    beltHolderId: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  },
  { timestamps: true }
);

// Ensure only one rivalry record exists between any two users
// Lexicographical sorting of IDs should be handled in the action layer
RivalrySchema.index({ player1Id: 1, player2Id: 1 }, { unique: true });

export const Rivalry: Model<IRivalry> =
  mongoose.models.Rivalry || mongoose.model<IRivalry>('Rivalry', RivalrySchema);
