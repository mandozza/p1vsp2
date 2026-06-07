import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const MatchResultSchema = z.object({
  userId: z.string(),
  screenshotUrl: z.string().url(),
  aiExtractedData: z.object({
    winnerTag: z.string().optional(),
    loserTag: z.string().optional(),
    method: z.string().optional(),
    round: z.number().optional(),
    time: z.string().optional(),
    opponentQuit: z.boolean().optional(),
  }).optional(),
  submittedAt: z.date().default(() => new Date()),
});

export const MatchSchema = z.object({
  gameId: z.string(),
  challengerId: z.string(),
  defenderId: z.string(),
  status: z.enum([
    'pending', 
    'accepted', 
    'awaiting_results', 
    'verifying', 
    'completed', 
    'disputed', 
    'cancelled'
  ]).default('pending'),
  results: z.array(MatchResultSchema).default([]),
  finalOutcome: z.object({
    winnerId: z.string().optional(),
    method: z.string().optional(),
    round: z.number().optional(),
    time: z.string().optional(),
    isDNF: z.boolean().default(false),
    resolvedAt: z.date().optional(),
    resolvedBy: z.enum(['ai', 'admin', 'community']).optional(),
  }).optional(),
  votes: z.array(z.object({
    userId: z.string(),
    votedForId: z.string(),
    createdAt: z.date().default(() => new Date()),
  })).default([]),
  tournamentId: z.string().optional(),
  tournamentRound: z.number().optional(),
  wagerAmount: z.number().int().nonnegative().default(0),
  prediction: z.object({
    predictedWinnerId: z.string().optional(),
    confidence: z.number().optional(), // 0-1
    analysis: z.string().optional(),
    odds: z.object({
      challenger: z.number().default(2.0),
      defender: z.number().default(2.0),
    }).optional(),
  }).optional(),
});

export type IMatch = z.infer<typeof MatchSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IMatchDocument extends Omit<IMatch, '_id'>, Document {}

const MatchMongooseSchema = new Schema<IMatchDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    challengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    defenderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'awaiting_results', 'verifying', 'completed', 'disputed', 'cancelled'],
      default: 'pending' 
    },
    results: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        screenshotUrl: { type: String },
        aiExtractedData: {
          winnerTag: String,
          loserTag: String,
          method: String,
          round: Number,
          time: String,
          opponentQuit: Boolean,
        },
        submittedAt: { type: Date, default: Date.now },
      }
    ],
    finalOutcome: {
      winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
      method: String,
      round: Number,
      time: String,
      isDNF: { type: Boolean, default: false },
      commentary: String,
      resolvedAt: Date,
      resolvedBy: { type: String, enum: ['ai', 'admin', 'community'] },
      },
    votes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        votedForId: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    tournamentRound: { type: Number },
    wagerAmount: { type: Number, default: 0 },
    prediction: {
      predictedWinnerId: { type: Schema.Types.ObjectId, ref: 'User' },
      confidence: Number,
      analysis: String,
      odds: {
        challenger: { type: Number, default: 2.0 },
        defender: { type: Number, default: 2.0 },
      },
    },
  },
  { timestamps: true }
);

// Indexes for common queries
MatchMongooseSchema.index({ challengerId: 1, status: 1 });
MatchMongooseSchema.index({ defenderId: 1, status: 1 });
MatchMongooseSchema.index({ status: 1 });

export const Match: Model<IMatchDocument> =
  mongoose.models.Match || mongoose.model<IMatchDocument>('Match', MatchMongooseSchema);
