'use server';

import dbConnect from '@/lib/db';
import { Bet } from '@/models/Bet';
import { Match } from '@/models/Match';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { transferCredits } from '@/lib/economy';
import { ActionResult } from './credit.actions';
import { predictMatchOutcome } from '@/lib/oracle-predictions';

/**
 * Places a side-bet on a match.
 */
export async function placeSideBet(data: {
  matchId: string;
  votedForId: string;
  amount: number;
}): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const match = await Match.findById(data.matchId);
    if (!match || match.status !== 'accepted' && match.status !== 'awaiting_results') {
      return { success: false, error: 'Match not open for betting' };
    }

    // 1. Escrow Credits
    const escrow = await transferCredits({
      userId: session.user.id,
      amount: -data.amount,
      type: 'WAGER_ESCROW', // Reusing wager escrow for bets
      referenceId: match._id,
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
    await Bet.create({
      userId: session.user.id,
      matchId: data.matchId,
      votedForId: data.votedForId,
      amount: data.amount,
      odds,
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
    await dbConnect();
    const match = await Match.findById(matchId)
      .populate('challengerId defenderId gameId')
      .lean();

    if (!match) return;

    const prediction = await predictMatchOutcome({
      challenger: {
        username: (match.challengerId as any).username,
        elo: (match.challengerId as any).eloRating,
        stats: (match.challengerId as any).stats,
      },
      defender: {
        username: (match.defenderId as any).username,
        elo: (match.defenderId as any).eloRating,
        stats: (match.defenderId as any).stats,
      },
      gameTitle: (match.gameId as any).title,
    });

    if (prediction) {
      await Match.findByIdAndUpdate(matchId, {
        prediction: {
          predictedWinnerId: prediction.predictedWinner === 'challenger' ? match.challengerId : match.defenderId,
          confidence: prediction.confidence,
          analysis: prediction.analysis,
          odds: {
            challenger: prediction.challengerOdds,
            defender: prediction.defenderOdds,
          },
        },
      });
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
    await dbConnect();
    const bets = await Bet.find({ matchId, status: 'pending' });

    for (const bet of bets) {
      const isWinner = bet.votedForId.toString() === winnerId.toString();

      if (isWinner) {
        const payout = Math.round(bet.amount * bet.odds);
        await transferCredits({
          userId: bet.userId.toString(),
          amount: payout,
          type: 'WAGER_WIN',
          referenceId: bet._id,
        });
        bet.status = 'won';
      } else {
        bet.status = 'lost';
      }
      await bet.save();
    }
  } catch (error) {
    console.error('Failed to resolve match bets:', error);
  }
}
