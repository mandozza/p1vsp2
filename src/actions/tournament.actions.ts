'use server';

import dbConnect from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { Match } from '@/models/Match';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';
import { createNotification } from './notification.actions';

/**
 * Creates a new tournament.
 */
export async function createTournament(data: { name: string; gameId: string }): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await dbConnect();
  const tournament = await Tournament.create({
    ...data,
    status: 'registration',
    participants: [],
    rounds: [],
  });

  revalidatePath('/admin/tournaments');
  revalidatePath('/tournaments');
  return { success: true, data: tournament._id };
}

/**
 * Registers the current user for a tournament.
 */
export async function registerForTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  await dbConnect();
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return { success: false, error: 'Tournament not found' };
  if (tournament.status !== 'registration') return { success: false, error: 'Registration is closed' };

  if (tournament.participants.includes(session.user.id as any)) {
    return { success: false, error: 'Already registered' };
  }

  tournament.participants.push(session.user.id as any);
  await tournament.save();

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

/**
 * Starts the tournament and generates the first round bracket.
 */
export async function startTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await dbConnect();
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return { success: false, error: 'Tournament not found' };
  if (tournament.participants.length < 2) return { success: false, error: 'Not enough participants' };

  // 1. Shuffle participants
  const players = [...tournament.participants].sort(() => Math.random() - 0.5);
  
  // 2. Generate Round 1 Matches
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
    if (players[i+1]) {
      const match = await Match.create({
        gameId: tournament.gameId,
        challengerId: players[i],
        defenderId: players[i+1],
        status: 'accepted', // Auto-accept tournament matches
        tournamentId: tournament._id,
        tournamentRound: 1,
      });
      matches.push(match._id);

      // Notify players
      await Promise.all([
        createNotification({
          userId: players[i].toString(),
          type: 'SYSTEM',
          title: 'Tournament Match Live!',
          message: `Your match in ${tournament.name} is ready. Go to the arena!`,
          link: `/matches/${match._id}`,
        }),
        createNotification({
          userId: players[i+1].toString(),
          type: 'SYSTEM',
          title: 'Tournament Match Live!',
          message: `Your match in ${tournament.name} is ready. Go to the arena!`,
          link: `/matches/${match._id}`,
        })
      ]);
    } else {
      // Handle BYE: Player automatically advances (we'll implement properly in round logic)
      // For now, we'll assume even numbers for simplicity or just create a placeholder
    }
  }

  tournament.status = 'in_progress';
  tournament.rounds = [{ roundNumber: 1, matches }];
  await tournament.save();

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

/**
 * Checks if a round is complete and advances the winners.
 */
export async function checkTournamentProgression(tournamentId: string) {
  try {
    await dbConnect();
    const tournament = await Tournament.findById(tournamentId).populate('rounds.matches');
    if (!tournament || tournament.status !== 'in_progress') return;

    const currentRoundIndex = tournament.rounds.length - 1;
    const currentRound = tournament.rounds[currentRoundIndex];

    // Check if all matches in current round are completed
    const allMatches = await Match.find({ _id: { $in: currentRound.matches } });
    const allFinished = allMatches.every(m => m.status === 'completed');

    if (!allFinished) return;

    // Get winners
    const winners = allMatches.map(m => m.finalOutcome.winnerId);

    if (winners.length === 1) {
      // TOURNAMENT COMPLETE
      tournament.status = 'completed';
      tournament.championId = winners[0] as any;
      await tournament.save();
      
      const winner = await User.findById(winners[0]);
      await createNotification({
        userId: winners[0]!.toString(),
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'TOURNAMENT CHAMPION!',
        message: `You won ${tournament.name}! THE SECTOR IS YOURS!`,
        link: `/profile/${winner?.username}`,
      });
      
    } else {
      // GENERATE NEXT ROUND
      const nextRoundNumber = currentRound.roundNumber + 1;
      const nextMatches = [];
      
      for (let i = 0; i < winners.length; i += 2) {
        if (winners[i+1]) {
           const match = await Match.create({
             gameId: tournament.gameId,
             challengerId: winners[i],
             defenderId: winners[i+1],
             status: 'accepted',
             tournamentId: tournament._id,
             tournamentRound: nextRoundNumber,
           });
           nextMatches.push(match._id);
        }
      }

      tournament.rounds.push({ roundNumber: nextRoundNumber, matches: nextMatches as any });
      await tournament.save();
    }
  } catch (error) {
    console.error('Tournament Progression Error:', error);
  }
}
