import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const BetaPageViewSchema = z.object({
  sessionId: z.string(),
  path: z.string(),
  userId: z.string().optional(),
});

export type IBetaPageView = z.infer<typeof BetaPageViewSchema> & {
  _id: string;
  createdAt: Date;
};

export interface IBetaPageViewDocument extends Omit<IBetaPageView, '_id'>, Document {}

const BetaPageViewMongooseSchema = new Schema<IBetaPageViewDocument>(
  {
    sessionId: { type: String, required: true },
    path: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Optimize for analytics
BetaPageViewMongooseSchema.index({ createdAt: -1 });
BetaPageViewMongooseSchema.index({ sessionId: 1 });

export const BetaPageView: Model<IBetaPageViewDocument> =
  mongoose.models.BetaPageView || mongoose.model<IBetaPageViewDocument>('BetaPageView', BetaPageViewMongooseSchema);
