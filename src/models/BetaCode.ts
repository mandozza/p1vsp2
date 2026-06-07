import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const BetaCodeSchema = z.object({
  code: z.string().min(6).max(20).transform(v => v.toUpperCase()),
  usedAt: z.date().optional(),
  note: z.string().optional(),
});

export type IBetaCode = z.infer<typeof BetaCodeSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IBetaCodeDocument extends Omit<IBetaCode, '_id'>, Document {}

const BetaCodeMongooseSchema = new Schema<IBetaCodeDocument>(
  {
    code: { type: String, required: true, unique: true },
    usedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

export const BetaCode: Model<IBetaCodeDocument> =
  mongoose.models.BetaCode || mongoose.model<IBetaCodeDocument>('BetaCode', BetaCodeMongooseSchema);
