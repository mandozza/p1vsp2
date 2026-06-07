'use server';

import dbConnect from '@/lib/db';
import { Match } from '@/models/Match';
import { Game } from '@/models/Game';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';
import { nanoid } from 'nanoid';
import { getUploadUrl, getPublicUrl } from '@/lib/s3';
import { extractMatchData, verifyConsensus } from '@/lib/ai-verifier';
import { calculateElo } from '@/lib/elo';
import { generateCommentary } from '@/lib/narrator';
import { evaluateMatchAchievements } from './achievement.actions';
import { createNotification } from './notification.actions';
import { checkTournamentProgression } from './tournament.actions';
import { updateRivalry } from './rivalry.actions';
import { transferCredits } from '@/lib/economy';
import { sendDiscordNotification } from '@/lib/discord';

/**
 * Creates a new match challenge.
 */
export async function createChallenge(defenderId: string, gameId: string, wagerAmount = 0): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const challengerId = session.user.id;
    if (challengerId === defenderId) return { success: false, error: 'You cannot challenge yourself' };

    // 1. Escrow Challenger Credits
    if (wagerAmount > 0) {
      const escrow = await transferCredits({
        userId: challengerId,
        amount: -wagerAmount,
        type: 'WAGER_ESCROW',
      });
      if (!escrow.success) return { success: false, error: `Escrow failed: ${escrow.error}` };
    }

    const match = await Match.create({
      gameId,
      challengerId,
      defenderId,
      status: 'pending',
      wagerAmount,
    });

    // Notify Defender
    await createNotification({
      userId: defenderId,
      type: 'CHALLENGE_RECEIVED',
      title: 'New Challenge!',
      message: `${session.user.name} challenged you to a match! ${wagerAmount > 0 ? `Wager: ${wagerAmount} Credits` : ''}`,
      link: `/matches`,
    });

    revalidatePath('/matches');
    return { success: true, data: match._id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Accepts a match challenge.
 */
export async function acceptChallenge(matchId: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const match = await Match.findById(matchId);
    if (!match) return { success: false, error: 'Match not found' };
    if (match.defenderId.toString() !== session.user.id) return { success: false, error: 'Unauthorized' };
    if (match.status !== 'pending') return { success: false, error: 'Challenge is no longer pending' };

    // 1. Escrow Defender Credits
    if (match.wagerAmount > 0) {
      const escrow = await transferCredits({
        userId: session.user.id,
        amount: -match.wagerAmount,
        type: 'WAGER_ESCROW',
        referenceId: match._id,
      });
      if (!escrow.success) return { success: false, error: `Escrow failed: ${escrow.error}` };
    }

    match.status = 'accepted';
    await match.save();

    revalidatePath('/matches');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancels a match challenge and refunds the challenger.
 */
export async function cancelChallenge(matchId: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const match = await Match.findById(matchId);
    if (!match) return { success: false, error: 'Match not found' };
    if (match.challengerId.toString() !== session.user.id) return { success: false, error: 'Unauthorized' };
    if (match.status !== 'pending') return { success: false, error: 'Cannot cancel active match' };

    // 1. Refund Challenger
    if (match.wagerAmount > 0) {
      await transferCredits({
        userId: match.challengerId.toString(),
        amount: match.wagerAmount,
        type: 'WAGER_REFUND',
        referenceId: match._id,
      });
    }

    match.status = 'cancelled';
    await match.save();

    revalidatePath('/matches');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Initiates the result submission process by providing an upload URL.
 */
export async function getResultUploadUrl(matchId: string, contentType: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const match = await Match.findById(matchId);
    if (!match) return { success: false, error: 'Match not found' };

    const isParticipant = match.challengerId.toString() === session.user.id || 
                          match.defenderId.toString() === session.user.id;
    
    if (!isParticipant) return { success: false, error: 'Unauthorized' };

    const filename = `matches/${matchId}/${session.user.id}-${nanoid(6)}`;
    const uploadUrl = await getUploadUrl(filename, contentType);
    const publicUrl = getPublicUrl(filename);

    return { success: true, data: { uploadUrl, publicUrl } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Submits a match result with a screenshot URL.
 */
export async function submitMatchResult(matchId: string, screenshotUrl: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const match = await Match.findById(matchId);
    if (!match) return { success: false, error: 'Match not found' };

    const isParticipant = match.challengerId.toString() === session.user.id || 
                          match.defenderId.toString() === session.user.id;
    
    if (!isParticipant) return { success: false, error: 'Unauthorized' };

    // Check if user already submitted
    const existingResult = match.results.find(r => r.userId.toString() === session.user.id);
    if (existingResult) return { success: false, error: 'You have already submitted a result' };

    match.results.push({
      userId: session.user.id,
      screenshotUrl,
      submittedAt: new Date(),
    });

    // Update status to awaiting_results if both haven't submitted, or verifying if both have
    if (match.results.length === 2) {
      match.status = 'verifying';
      await match.save();
      // Trigger AI verification
      processMatchVerification(matchId);
    } else {
      match.status = 'awaiting_results';
      await match.save();
    }

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Internal function to handle the AI verification loop.
 */
async function processMatchVerification(matchId: string) {
  try {
    await dbConnect();
    const match = await Match.findById(matchId).populate('gameId');
    if (!match || match.results.length !== 2) return;

    const game = match.gameId as any;

    // 1. Extract data from both screenshots using dynamic prompts
    const extractions = await Promise.all(
      match.results.map(r => extractMatchData(r.screenshotUrl, game.aiPrompt, game.gameType))
    );

    // Save extractions to match record
    match.results[0].aiExtractedData = extractions[0];
    match.results[1].aiExtractedData = extractions[1];

    // 2. Check for consensus
    const { consensus, data } = verifyConsensus(extractions[0], extractions[1]);

    if (consensus) {
      // 3. Resolve Match Automatically
      await resolveMatch(matchId, data, 'ai');
    } else {
      // 4. Flag as Disputed for Community Resolution
      match.status = 'disputed';
      await match.save();
      revalidatePath(`/matches/${matchId}`);
    }
  } catch (error) {
    console.error('Verification Loop Failed:', error);
  }
}

/**
 * Finalizes a match, updates ELO ratings and player statistics.
 */
export async function resolveMatch(
  matchId: string, 
  outcome: any, 
  resolvedBy: 'ai' | 'admin' | 'community'
): Promise<ActionResult> {
  try {
    await dbConnect();
    const match = await Match.findById(matchId).populate('challengerId defenderId');
    if (!match) return { success: false, error: 'Match not found' };

    // Identify Winner and Loser
    const challenger = match.challengerId as any;
    const defender = match.defenderId as any;
    
    // Fuzzy match winnerTag with usernames
    const winnerTag = outcome.winnerTag.toLowerCase();
    const isChallengerWinner = challenger.username.toLowerCase() === winnerTag || 
                               winnerTag.includes(challenger.username.toLowerCase());
    
    const winner = isChallengerWinner ? challenger : defender;
    const loser = isChallengerWinner ? defender : challenger;

    // Calculate ELO
    const { winnerNewElo, loserNewElo } = calculateElo(winner.eloRating, loser.eloRating);

    // Update Winner Stats
    winner.eloRating = winnerNewElo;
    winner.stats.wins += 1;
    await winner.save();

    // Update Loser Stats
    loser.eloRating = loserNewElo;
    loser.stats.losses += 1;
    if (outcome.isDNF) loser.stats.dnfs += 1;
    await loser.save();

    // 1. Resolve Wager
    if (match.wagerAmount > 0) {
      const potSize = match.wagerAmount * 2;
      await transferCredits({
        userId: winner._id.toString(),
        amount: potSize,
        type: 'WAGER_WIN',
        referenceId: match._id,
      });

      // Broadcast high-stakes victories to Discord
      if (potSize >= 500) {
        await sendDiscordNotification({
          title: 'High-Stakes Victory!',
          description: `**${winner.username}** has defeated **${loser.username}** in a major wager match!`,
          color: 0x22c55e, // Green
          fields: [
            { name: 'Pot Won', value: `${potSize} Credits`, inline: true },
            { name: 'Method', value: outcome.method, inline: true },
          ]
        });
      }
    }

    // Generate Narrator Commentary
    const commentary = await generateCommentary({
      winnerName: winner.username,
      loserName: loser.username,
      method: outcome.method,
      round: outcome.round,
      time: outcome.time,
      isDNF: outcome.isDNF,
    });

    // Finalize Match Record
    match.status = 'completed';
    match.finalOutcome = {
      winnerId: winner._id,
      method: outcome.method,
      round: outcome.round,
      time: outcome.time,
      isDNF: outcome.isDNF,
      commentary,
      resolvedAt: new Date(),
      resolvedBy,
    };
    await match.save();

    revalidatePath(`/matches/${matchId}`);
    revalidatePath('/players');

    // Notify both players
    await Promise.all([
      createNotification({
        userId: winner._id.toString(),
        type: 'MATCH_RESOLVED',
        title: 'Victory Verified!',
        message: `Your match against ${loser.username} was resolved. You won${match.wagerAmount > 0 ? ` the pot of ${match.wagerAmount * 2} credits!` : '!'}`,
        link: `/matches/${matchId}`,
      }),
      createNotification({
        userId: loser._id.toString(),
        type: 'MATCH_RESOLVED',
        title: 'Match Resolved',
        message: `Your match against ${winner.username} was resolved. Outcome: Defeat.`,
        link: `/matches/${matchId}`,
      }),
    ]);

    // Evaluate Achievements
    await Promise.all([
      evaluateMatchAchievements(winner._id.toString()),
      evaluateMatchAchievements(loser._id.toString()),
    ]);

    // Tournament Progression
    if (match.tournamentId) {
      await checkTournamentProgression(match.tournamentId.toString());
    }

    // Update Rivalry Stats
    await updateRivalry({
      matchId,
      winnerId: winner._id.toString(),
      playerAId: challenger._id.toString(),
      playerBId: defender._id.toString(),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
