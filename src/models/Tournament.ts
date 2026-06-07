import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  gameId: mongoose.Types.ObjectId;
  status: 'registration' | 'in_progress' | 'completed';
  participants: mongoose.Types.ObjectId[];
  rounds: {
    roundNumber: number;
    matches: mongoose.Types.ObjectId[];
  }[];
  championId?: mongoose.Types.ObjectId;
  entryFee: number;
  prizePool: number;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    status: { 
      type: String, 
      enum: ['registration', 'in_progress', 'completed'], 
      default: 'registration' 
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rounds: [
      {
        roundNumber: { type: Number, required: true },
        matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
      }
    ],
    championId: { type: Schema.Types.ObjectId, ref: 'User' },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);
