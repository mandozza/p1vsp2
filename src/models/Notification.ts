import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'CHALLENGE_RECEIVED' | 'MATCH_RESOLVED' | 'ACHIEVEMENT_UNLOCKED' | 'SYSTEM';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['CHALLENGE_RECEIVED', 'MATCH_RESOLVED', 'ACHIEVEMENT_UNLOCKED', 'SYSTEM'],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
