'use server';

import { db } from '@/lib/db';
import { Match } from '@/models/Match';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';
import { resolveMatch } from './match.actions';
import { evaluateTribunalAchievements } from './achievement.actions';
import { transferCredits } from '@/lib/economy';
import { eq } from 'drizzle-orm';

/**
 * Casts a vote for a disputed match.
 */
export async function castTribunalVote(
  matchId: string, 
  votedForId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const [match] = await db.select().from(Match).where(eq(Match.id, matchId));
    if (!match || match.status !== 'disputed') return { success: false, error: 'Dispute not found' };

    // Prevent participants from voting
    if (match.challengerId.toString() === session.user.id || 
        match.defenderId.toString() === session.user.id) {
      return { success: false, error: 'Participants cannot vote in their own disputes' };
    }

    // Check if already voted
    const existingVote = match.votes.find((v: any) => v.userId.toString() === session.user.id);
    if (existingVote) return { success: false, error: 'You have already voted' };

    const updatedVotes = [
      ...match.votes,
      {
        userId: session.user.id,
        votedForId,
        createdAt: new Date().toISOString(),
      }
    ];

    await db.update(Match)
      .set({
        votes: updatedVotes,
        updatedAt: new Date()
      })
      .where(eq(Match.id, matchId));

    // Update local reference for the remaining logic
    match.votes = updatedVotes;

    // Reward the voter
    await transferCredits({
      userId: session.user.id,
      amount: 50,
      type: 'TRIBUNAL_REWARD',
      referenceId: match.id,
    });

    // Evaluate Achievements
    await evaluateTribunalAchievements(session.user.id);

    // AUTO-RESOLUTION: If we hit a threshold (e.g., 5 votes), resolve based on majority
    const VOTE_THRESHOLD = 5;
    if (match.votes.length >= VOTE_THRESHOLD) {
      const challengerVotes = match.votes.filter((v: any) => v.votedForId.toString() === match.challengerId.toString()).length;
      const defenderVotes = match.votes.filter((v: any) => v.votedForId.toString() === match.defenderId.toString()).length;
      
      const winnerId = challengerVotes > defenderVotes ? match.challengerId : match.defenderId;
      
      // We take the AI extraction data from the "winner's" submission as the truth for the outcome details
      const winnerSubmission = match.results.find((r: any) => r.userId.toString() === winnerId.toString());
      
      await resolveMatch(
        matchId, 
        { 
          winnerTag: winnerSubmission?.aiExtractedData?.winnerTag,
          method: winnerSubmission?.aiExtractedData?.method,
          round: winnerSubmission?.aiExtractedData?.round,
          time: winnerSubmission?.aiExtractedData?.time,
          isDNF: winnerSubmission?.aiExtractedData?.opponentQuit,
        }, 
        'community'
      );
    }

    revalidatePath(`/tribunal/${matchId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

