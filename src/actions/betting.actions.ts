'use server';

import { db } from '@/lib/db';
import { Bet } from '@/models/Bet';
import { Match } from '@/models/Match';
import { User } from '@/models/User';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { transferCredits } from '@/lib/economy';
import { ActionResult } from './credit.actions';
import { predictMatchOutcome } from '@/lib/oracle-predictions';
import { eq, and } from 'drizzle-orm';

/**
 * Places a side-bet on a match.
 */
export async function placeSideBet(data: {
  matchId: string;
  votedForId: string;
  amount: number;
}): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const [match] = await db.select().from(Match).where(eq(Match.id, data.matchId));
    if (!match || (match.status !== 'accepted' && match.status !== 'awaiting_results')) {
      return { success: false, error: 'Match not open for betting' };
    }

    // 1. Escrow Credits
    const escrow = await transferCredits({
      userId: session.user.id,
      amount: -data.amount,
      type: 'WAGER_ESCROW', // Reusing wager escrow for bets
      referenceId: match.id,
    });

    if (!escrow.success) return { success: false, error: escrow.error };

    // 2. Determine Odds from Oracle Prediction
    let odds = 2.0;
    if (match.prediction?.odds) {
      odds = data.votedForId === match.challengerId.toString() 
        ? match.prediction.odds.challenger 
        : match.prediction.odds.defender;
    }

    // 3. Create Bet
    await db.insert(Bet)
      .values({
        userId: session.user.id,
        matchId: data.matchId,
        votedForId: data.votedForId,
        amount: data.amount,
        odds: odds.toFixed(2),
        status: 'pending',
      });

    revalidatePath(`/matches/${data.matchId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Internal function to generate and save the Oracle's prediction.
 */
export async function generateMatchPrediction(matchId: string) {
  try {
    const [match] = await db.select().from(Match).where(eq(Match.id, matchId));
    if (!match) return;

    const [challenger] = await db.select().from(User).where(eq(User.id, match.challengerId));
    const [defender] = await db.select().from(User).where(eq(User.id, match.defenderId));
    const [game] = await db.select().from(Game).where(eq(Game.id, match.gameId));

    if (!challenger || !defender || !game) return;

    const prediction = await predictMatchOutcome({
      challenger: {
        username: challenger.username,
        elo: challenger.eloRating,
        stats: challenger.stats,
      },
      defender: {
        username: defender.username,
        elo: defender.eloRating,
        stats: defender.stats,
      },
      gameTitle: game.title,
    });

    if (prediction) {
      await db.update(Match)
        .set({
          prediction: {
            predictedWinnerId: prediction.predictedWinner === 'challenger' ? challenger.id : defender.id,
            confidence: prediction.confidence,
            analysis: prediction.analysis,
            odds: {
              challenger: prediction.challengerOdds,
              defender: prediction.defenderOdds,
            },
          },
          updatedAt: new Date()
        })
        .where(eq(Match.id, matchId));
      revalidatePath(`/matches/${matchId}`);
    }
  } catch (error) {
    console.error('Failed to generate prediction:', error);
  }
}

/**
 * Resolves all bets for a specific match.
 */
export async function resolveMatchBets(matchId: string, winnerId: string) {
  try {
    const betsList = await db.select().from(Bet).where(and(eq(Bet.matchId, matchId), eq(Bet.status, 'pending')));

    for (const bet of betsList) {
      const isWinner = bet.votedForId.toString() === winnerId.toString();

      if (isWinner) {
        const oddsNum = Number(bet.odds || 2.0);
        const payout = Math.round(bet.amount * oddsNum);
        await transferCredits({
          userId: bet.userId,
          amount: payout,
          type: 'WAGER_WIN',
          referenceId: bet.id,
        });
        await db.update(Bet)
          .set({ status: 'won', updatedAt: new Date() })
          .where(eq(Bet.id, bet.id));
      } else {
        await db.update(Bet)
          .set({ status: 'lost', updatedAt: new Date() })
          .where(eq(Bet.id, bet.id));
      }
    }
  } catch (error) {
    console.error('Failed to resolve match bets:', error);
  }
}

