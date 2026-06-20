import { z } from 'zod';
import { notifications } from './schema';

export type NotificationType = 'CHALLENGE_RECEIVED' | 'MATCH_RESOLVED' | 'ACHIEVEMENT_UNLOCKED' | 'SYSTEM';

export const NotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(['CHALLENGE_RECEIVED', 'MATCH_RESOLVED', 'ACHIEVEMENT_UNLOCKED', 'SYSTEM']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().url().optional(),
  isRead: z.boolean().default(false),
});

export type INotification = z.infer<typeof NotificationSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const Notification = notifications;
export default notifications;
