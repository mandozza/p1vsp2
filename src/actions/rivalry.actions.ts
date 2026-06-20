import { db } from '@/lib/db';
import { Rivalry } from '@/models/Rivalry';
import { eq, and, or, desc } from 'drizzle-orm';

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
    // 1. Sort IDs lexicographically to ensure consistent player1/player2 mapping
    const ids = [data.playerAId, data.playerBId].sort();
    const p1Id = ids[0];
    const p2Id = ids[1];

    const isP1Winner = data.winnerId === p1Id;
    const isP2Winner = data.winnerId === p2Id;

    // 2. Find Rivalry
    const [rivalry] = await db
      .select()
      .from(Rivalry)
      .where(and(eq(Rivalry.player1Id, p1Id), eq(Rivalry.player2Id, p2Id)));

    if (!rivalry) {
      // Create new Rivalry
      const stats = { player1Wins: 0, player2Wins: 0, draws: 0 };
      let beltHolderId = null;

      if (data.isDraw) {
        stats.draws = 1;
      } else if (isP1Winner) {
        stats.player1Wins = 1;
        beltHolderId = p1Id;
      } else if (isP2Winner) {
        stats.player2Wins = 1;
        beltHolderId = p2Id;
      }

      await db.insert(Rivalry).values({
        player1Id: p1Id,
        player2Id: p2Id,
        stats,
        totalMatches: 1,
        beltHolderId,
        lastMatchId: data.matchId,
      });
    } else {
      // Update stats on existing Rivalry
      const stats = { ...rivalry.stats };
      let beltHolderId = rivalry.beltHolderId;

      if (data.isDraw) {
        stats.draws += 1;
      } else if (isP1Winner) {
        stats.player1Wins += 1;
        beltHolderId = p1Id;
      } else if (isP2Winner) {
        stats.player2Wins += 1;
        beltHolderId = p2Id;
      }

      await db
        .update(Rivalry)
        .set({
          stats,
          totalMatches: rivalry.totalMatches + 1,
          beltHolderId,
          lastMatchId: data.matchId,
          updatedAt: new Date(),
        })
        .where(eq(Rivalry.id, rivalry.id));
    }

    console.log(`🔥 Rivalry Updated: ${p1Id} vs ${p2Id}`);
  } catch (error) {
    console.error('Failed to update rivalry:', error);
  }
}

/**
 * Fetches the top rivalries for a specific user.
 * Maps relational Drizzle outputs to mimic Mongoose's populated player1Id/player2Id shape.
 */
export async function getUserRivalries(userId: string, limit = 3) {
  try {
    const rawRivalries = await db.query.rivalries.findMany({
      where: or(eq(Rivalry.player1Id, userId), eq(Rivalry.player2Id, userId)),
      limit,
      orderBy: [desc(Rivalry.totalMatches)],
      with: {
        player1: {
          columns: {
            id: true,
            username: true,
            stats: true,
            eloRating: true,
          }
        },
        player2: {
          columns: {
            id: true,
            username: true,
            stats: true,
            eloRating: true,
          }
        }
      }
    });

    return rawRivalries.map((r: any) => ({
      _id: r.id,
      id: r.id,
      player1Id: r.player1 ? { ...r.player1, _id: r.player1.id } : null,
      player2Id: r.player2 ? { ...r.player2, _id: r.player2.id } : null,
      stats: r.stats,
      totalMatches: r.totalMatches,
      beltHolderId: r.beltHolderId,
      lastMatchId: r.lastMatchId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch user rivalries:', error);
    return [];
  }
}
