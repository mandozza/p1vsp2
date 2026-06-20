'use server';

import { db } from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { Match } from '@/models/Match';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';
import { createNotification } from './notification.actions';
import { transferCredits } from '@/lib/economy';
import { sendDiscordNotification } from '@/lib/discord';
import { eq, inArray } from 'drizzle-orm';

/**
 * Creates a new tournament.
 */
export async function createTournament(data: { name: string; gameId: string; entryFee?: number }): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  const [tournament] = await db.insert(Tournament)
    .values({
      name: data.name,
      gameId: data.gameId,
      status: 'registration',
      participants: [],
      rounds: [],
      entryFee: data.entryFee || 0,
      prizePool: 0,
    })
    .returning();

  await sendDiscordNotification({
    title: 'Tournament Initiated!',
    description: `**${tournament.name}** is now open for registration! Sector operators, prepare for combat.`,
    color: 0x00ffff, // Cyan
    fields: [
      { name: 'Entry Fee', value: `${tournament.entryFee} Credits`, inline: true },
    ]
  });

  revalidatePath('/admin/tournaments');
  revalidatePath('/tournaments');
  return { success: true, data: tournament.id };
}

/**
 * Registers the current user for a tournament and collects the entry fee.
 */
export async function registerForTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  const [tournament] = await db.select().from(Tournament).where(eq(Tournament.id, tournamentId));
  if (!tournament) return { success: false, error: 'Tournament not found' };
  if (tournament.status !== 'registration') return { success: false, error: 'Registration is closed' };

  if (tournament.participants.includes(session.user.id)) {
    return { success: false, error: 'Already registered' };
  }

  let finalPrizePool = tournament.prizePool;

  // 1. Collect Entry Fee
  if (tournament.entryFee > 0) {
    const fee = await transferCredits({
      userId: session.user.id,
      amount: -tournament.entryFee,
      type: 'TOURNAMENT_FEE',
      referenceId: tournament.id,
    });
    if (!fee.success) return { success: false, error: `Fee collection failed: ${fee.error}` };
    
    // Update Prize Pool
    finalPrizePool += tournament.entryFee;
  }

  await db.update(Tournament)
    .set({
      participants: [...tournament.participants, session.user.id],
      prizePool: finalPrizePool,
      updatedAt: new Date()
    })
    .where(eq(Tournament.id, tournamentId));

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

/**
 * Starts the tournament and generates the first round bracket.
 */
export async function startTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  const [tournament] = await db.select().from(Tournament).where(eq(Tournament.id, tournamentId));
  if (!tournament) return { success: false, error: 'Tournament not found' };
  if (tournament.participants.length < 2) return { success: false, error: 'Not enough participants' };

  // 1. Shuffle participants
  const players = [...tournament.participants].sort(() => Math.random() - 0.5);
  
  // 2. Generate Round 1 Matches
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
    if (players[i+1]) {
      const [match] = await db.insert(Match)
        .values({
          gameId: tournament.gameId,
          challengerId: players[i],
          defenderId: players[i+1],
          status: 'accepted', // Auto-accept tournament matches
          tournamentId: tournament.id,
          tournamentRound: 1,
        })
        .returning();
      matches.push(match.id);

      // Notify players
      await Promise.all([
        createNotification({
          userId: players[i],
          type: 'SYSTEM',
          title: 'Tournament Match Live!',
          message: `Your match in ${tournament.name} is ready. Go to the arena!`,
          link: `/matches/${match.id}`,
        }),
        createNotification({
          userId: players[i+1],
          type: 'SYSTEM',
          title: 'Tournament Match Live!',
          message: `Your match in ${tournament.name} is ready. Go to the arena!`,
          link: `/matches/${match.id}`,
        })
      ]);
    }
  }

  await db.update(Tournament)
    .set({
      status: 'in_progress',
      rounds: [{ roundNumber: 1, matches }],
      updatedAt: new Date()
    })
    .where(eq(Tournament.id, tournamentId));

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

/**
 * Checks if a round is complete and advances the winners.
 */
export async function checkTournamentProgression(tournamentId: string) {
  try {
    const [tournament] = await db.select().from(Tournament).where(eq(Tournament.id, tournamentId));
    if (!tournament || tournament.status !== 'in_progress') return;

    const currentRoundIndex = tournament.rounds.length - 1;
    const currentRound = tournament.rounds[currentRoundIndex];

    // Check if all matches in current round are completed
    if (currentRound.matches.length === 0) return;
    const allMatches = await db.select().from(Match).where(
      inArray(Match.id, currentRound.matches)
    );
    const allFinished = allMatches.every((m: any) => m.status === 'completed');

    if (!allFinished) return;

    // Get winners
    const winners = allMatches.map((m: any) => m.finalOutcome?.winnerId).filter(Boolean) as string[];

    if (winners.length === 1) {
      // TOURNAMENT COMPLETE
      await db.update(Tournament)
        .set({
          status: 'completed',
          championId: winners[0],
          updatedAt: new Date()
        })
        .where(eq(Tournament.id, tournamentId));
      
      // Award Prize Pool
      if (tournament.prizePool > 0) {
        await transferCredits({
          userId: winners[0],
          amount: tournament.prizePool,
          type: 'TOURNAMENT_WIN',
          referenceId: tournament.id,
        });
      }

      const [winner] = await db.select().from(User).where(eq(User.id, winners[0]));

      await sendDiscordNotification({
        title: 'GRAND CHAMPION CROWNED!',
        description: `**${winner?.username}** has conquered the **${tournament.name}** sector!`,
        color: 0xeab308, // Gold
        fields: [
          { name: 'Prize Pool', value: `${tournament.prizePool} Credits`, inline: true },
        ]
      });

      await createNotification({
        userId: winners[0],
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'TOURNAMENT CHAMPION!',
        message: `You won ${tournament.name}${tournament.prizePool > 0 ? ` and the prize pool of ${tournament.prizePool} credits!` : '!'}`,
        link: `/profile/${winner?.username}`,
      });
      
    } else if (winners.length > 1) {
      // GENERATE NEXT ROUND
      const nextRoundNumber = currentRound.roundNumber + 1;
      const nextMatches = [];
      
      for (let i = 0; i < winners.length; i += 2) {
        if (winners[i+1]) {
           const [match] = await db.insert(Match)
             .values({
               gameId: tournament.gameId,
               challengerId: winners[i],
               defenderId: winners[i+1],
               status: 'accepted',
               tournamentId: tournament.id,
               tournamentRound: nextRoundNumber,
             })
             .returning();
           nextMatches.push(match.id);
        }
      }

      await db.update(Tournament)
        .set({
          rounds: [...tournament.rounds, { roundNumber: nextRoundNumber, matches: nextMatches }],
          updatedAt: new Date()
        })
        .where(eq(Tournament.id, tournamentId));
    }
  } catch (error) {
    console.error('Tournament Progression Error:', error);
  }
}

