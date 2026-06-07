import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  unlockedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user can only unlock an achievement once
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievement: Model<IUserAchievement> =
  mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
