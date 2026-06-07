'use server';

import dbConnect from '@/lib/db';
import { Rivalry } from '@/models/Rivalry';
import mongoose from 'mongoose';

/**
 * Updates or creates a rivalry record between two players after a match.
 */
export async function updateRivalry(data: {
  matchId: string;
  winnerId?: string;
  playerAId: string;
  playerBId: string;
  isDraw?: boolean;
}) {
  try {
    await dbConnect();

    // 1. Sort IDs lexicographically to ensure consistent player1/player2 mapping
    const ids = [data.playerAId, data.playerBId].sort();
    const p1Id = ids[0];
    const p2Id = ids[1];

    const isP1Winner = data.winnerId === p1Id;
    const isP2Winner = data.winnerId === p2Id;

    // 2. Find or Create Rivalry
    let rivalry = await Rivalry.findOne({ player1Id: p1Id, player2Id: p2Id });

    if (!rivalry) {
      rivalry = new Rivalry({
        player1Id: p1Id,
        player2Id: p2Id,
        stats: { player1Wins: 0, player2Wins: 0, draws: 0 },
        totalMatches: 0,
      });
    }

    // 3. Update Stats
    rivalry.totalMatches += 1;
    rivalry.lastMatchId = data.matchId as any;

    if (data.isDraw) {
      rivalry.stats.draws += 1;
    } else if (isP1Winner) {
      rivalry.stats.player1Wins += 1;
      rivalry.beltHolderId = p1Id as any;
    } else if (isP2Winner) {
      rivalry.stats.player2Wins += 1;
      rivalry.beltHolderId = p2Id as any;
    }

    await rivalry.save();
    console.log(`🔥 Rivalry Updated: ${p1Id} vs ${p2Id}`);

  } catch (error) {
    console.error('Failed to update rivalry:', error);
  }
}

/**
 * Fetches the top rivalries for a specific user.
 */
export async function getUserRivalries(userId: string, limit = 3) {
  try {
    await dbConnect();
    return await Rivalry.find({
      $or: [{ player1Id: userId }, { player2Id: userId }]
    })
    .populate('player1Id player2Id', 'username stats eloRating')
    .sort({ totalMatches: -1 })
    .limit(limit)
    .lean();
  } catch (error) {
    console.error('Failed to fetch user rivalries:', error);
    return [];
  }
}
