import { z } from 'zod';
import { userAchievements } from './schema';

export const UserAchievementSchema = z.object({
  userId: z.string(),
  achievementId: z.string(),
  unlockedAt: z.date().default(() => new Date()),
});

export type IUserAchievement = z.infer<typeof UserAchievementSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const UserAchievement = userAchievements;
export default userAchievements;
