'use server';

import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { UserAchievement } from '@/models/UserAchievement';
import { ACHIEVEMENTS } from '@/lib/achievements.config';
import { createNotification } from './notification.actions';

/**
 * Checks and unlocks match-related achievements for a user.
 */
export async function evaluateMatchAchievements(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return;

    const unlocks = [];

    // 1. FIRST_BLOOD: First verified win
    if (user.stats.wins >= 1) {
      unlocks.push('FIRST_BLOOD');
    }

    // 2. THE_FAIR_FIGHTER: 10 matches without a DNF
    const totalMatches = user.stats.wins + user.stats.losses + user.stats.draws;
    if (totalMatches >= 10 && user.stats.dnfs === 0) {
      unlocks.push('THE_FAIR_FIGHTER');
    }

    // 3. THE_UNBREAKABLE: 1500 ELO
    if (user.eloRating >= 1500) {
      unlocks.push('THE_UNBREAKABLE');
    }

    // 4. ELITE_OPERATOR: 2000 ELO
    if (user.eloRating >= 2000) {
      unlocks.push('ELITE_OPERATOR');
    }

    // Attempt to save each achievement (idempotency handled by unique index)
    for (const achievementId of unlocks) {
      try {
        await UserAchievement.create({
          userId,
          achievementId,
        });

        // Notify the user
        const achievement = ACHIEVEMENTS[achievementId];
        await createNotification({
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Achievement Unlocked!',
          message: `You earned the ${achievement.name} badge: ${achievement.description}`,
          link: `/profile`,
        });

        console.log(`🏅 Achievement Unlocked: ${achievementId} for user ${userId}`);
      } catch (err: any) {
        // If E11000 (duplicate key), user already has it, ignore
        if (err.code !== 11000) console.error(`Failed to unlock ${achievementId}:`, err);
      }
    }
  } catch (error) {
    console.error('Match Achievement Evaluation Error:', error);
  }
}

/**
 * Checks and unlocks tribunal-related achievements for a user.
 */
export async function evaluateTribunalAchievements(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return;

    // To evaluate tribunal judge, we need to count their votes in the Match model.
    // However, it's more efficient to check if they've already hit the milestone.
    const { Match } = await import('@/models/Match');
    const voteCount = await Match.countDocuments({ 'votes.userId': userId });

    if (voteCount >= 10) {
      try {
        await UserAchievement.create({
          userId,
          achievementId: 'TRIBUNAL_JUDGE',
        });

        // Notify the user
        const achievement = ACHIEVEMENTS['TRIBUNAL_JUDGE'];
        await createNotification({
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Achievement Unlocked!',
          message: `You earned the ${achievement.name} badge: ${achievement.description}`,
          link: `/profile`,
        });

        console.log(`🏅 Achievement Unlocked: TRIBUNAL_JUDGE for user ${userId}`);
      } catch (err: any) {
        if (err.code !== 11000) console.error('Failed to unlock TRIBUNAL_JUDGE:', err);
      }
    }
  } catch (error) {
    console.error('Tribunal Achievement Evaluation Error:', error);
  }
}

/**
 * Fetches all unlocked achievements for a user.
 */
export async function getUserAchievements(userId: string) {
  try {
    await dbConnect();
    return await UserAchievement.find({ userId }).lean();
  } catch (error) {
    console.error('Fetch Achievements Error:', error);
    return [];
  }
}
