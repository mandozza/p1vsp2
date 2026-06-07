import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

export const GameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  active: z.boolean().default(true),
  thumbnailUrl: z.string().url().optional(),
});

export type IGame = z.infer<typeof GameSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IGameDocument extends Omit<IGame, '_id'>, Document {}

const GameMongooseSchema = new Schema<IGameDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, required: true, default: true },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

export const Game: Model<IGameDocument> =
  mongoose.models.Game || mongoose.model<IGameDocument>('Game', GameMongooseSchema);
