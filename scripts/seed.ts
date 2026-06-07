import dbConnect from '../src/lib/db';
import { Machine } from '../src/models/Machine';
import { Product } from '../src/models/Product';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import mongoose from 'mongoose';

const MACHINES = [
  {
    name: 'Neon Nebula',
    status: 'online',
    costPerPlay: 100,
    cameraStreamUrl: 'https://example.com/stream1',
  },
  {
    name: 'Cyber Stuffer',
    status: 'online',
    costPerPlay: 150,
    cameraStreamUrl: 'https://example.com/stream2',
  },
  {
    name: 'Retro Roller',
    status: 'online',
    costPerPlay: 80,
    cameraStreamUrl: 'https://example.com/stream3',
  },
  {
    name: 'Glow Grabber',
    status: 'online',
    costPerPlay: 120,
    cameraStreamUrl: 'https://example.com/stream4',
  },
];

const PRIZES = [
  { name: 'Neon Bear', type: 'stuffy', inventoryCount: 5 },
  { name: 'Cyber Cat', type: 'stuffy', inventoryCount: 3 },
  { name: 'Retro Bot', type: 'merch', inventoryCount: 10 },
  { name: 'Galactic Duck', type: 'stuffy', inventoryCount: 7 },
  { name: 'Mystery Box v1', type: 'blind_box', inventoryCount: 15 },
  { name: 'Synth Snail', type: 'stuffy', inventoryCount: 4 },
];

const GAMES = [
  {
    title: 'UFC 6',
    slug: 'ufc-6',
    gameType: 'FIGHTING',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/ufc6/800/400',
    aiPrompt: 'Analyze this UFC 6 end-of-game screenshot. Identify the winner and loser by their gamer tags. Determine the method of victory (KO, TKO, SUB, DEC), the round, and the time. Check if the screen indicates a disconnection, forfeit, or "Connection Lost" state.',
  },
  {
    title: 'Street Fighter 6',
    slug: 'street-fighter-6',
    gameType: 'FIGHTING',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/sf6/800/400',
    aiPrompt: 'Analyze this Street Fighter 6 victory screen. Identify the winning character and player. Extract the number of rounds won by each player and check for "PERFECT" or "DOUBLE PERFECT" indicators. Identify the method of finish (Critical Art, Special Move, etc).',
  },
  {
    title: 'Madden 26',
    slug: 'madden-26',
    gameType: 'SPORTS',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/madden26/800/400',
    aiPrompt: 'Analyze this Madden 26 end-game screen. Identify the "Winner" based on the final score. Extract the "Home Team Score" and "Away Team Score". Check if the game ended via "Concede" or disconnection.',
  },
  {
    title: 'FC 26',
    slug: 'fc-26',
    gameType: 'SPORTS',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/fc26/800/400',
    aiPrompt: 'Analyze this FC 26 (FIFA) final result screen. Extract the score for both teams and identify the winner. Identify individual goal scorers if visible. Check if the match was decided in "Extra Time" or "Penalties".',
  },
  {
    title: 'NBA 2K26',
    slug: 'nba-2k26',
    gameType: 'SPORTS',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/nba2k26/800/400',
    aiPrompt: 'Analyze this NBA 2K26 end-game screen. Identify the winning team and final score. Extract key player stats if visible (Points, Rebounds, Assists). Check for "Quit" indicators or early forfeits.',
  },
  {
    title: 'Tekken 8',
    slug: 'tekken-8',
    gameType: 'FIGHTING',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/tekken8/800/400',
    aiPrompt: 'Analyze this Tekken 8 victory screen. Identify the winning character and player tag. Extract the number of rounds won (e.g., 3-1) and check for "PERFECT" or "GREAT" victory indicators.',
  },
  {
    title: 'Call of Duty: Black Ops 6',
    slug: 'cod-bo6',
    gameType: 'SHOOTER',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/codbo6/800/400',
    aiPrompt: 'Analyze this Call of Duty: Black Ops 6 post-match scoreboard. Identify the winning team or player. Extract Kills, Deaths, and Score for the top players. Identify the match type (TDM, Domination, etc).',
  },
  {
    title: 'Gran Turismo 7',
    slug: 'gt7',
    gameType: 'RACING',
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/gt7/800/400',
    aiPrompt: 'Analyze this Gran Turismo 7 race result screen. Identify the winner (P1) and their total race time. Extract podium positions (P2, P3) and the time gap between them. Identify the track and car used if visible.',
  },
];

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    await dbConnect();

    // Clean up
    await Machine.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Game.deleteMany({});

    console.log('🧹 Database cleaned.');

    // Create Admin User
    const admin = await User.create({
      name: 'Arcade Admin',
      email: 'admin@pro-project.io',
      username: 'admin',
      role: 'admin',
      creditBalance: 1000000,
      eloRating: 2500,
      stats: { wins: 0, losses: 0, draws: 0, dnfs: 0 },
      verificationStatus: 'verified',
      gamerTag: 'ADMIN_OP',
    });
    console.log('👤 Admin user created.');

    // Create Demo Users
    await User.create({
      name: 'ClawMaster',
      email: 'player@pro-project.io',
      username: 'clawmaster',
      role: 'member',
      creditBalance: 5000,
      eloRating: 1500,
      stats: { wins: 42, losses: 10, draws: 2, dnfs: 1 },
      verificationStatus: 'verified',
      gamerTag: 'CLAW_MSTR',
    });
    
    await User.create({
      name: 'ArcadeLegend',
      email: 'legend@pro-project.io',
      username: 'arcado',
      role: 'member',
      creditBalance: 2000,
      eloRating: 1800,
      stats: { wins: 28, losses: 5, draws: 0, dnfs: 0 },
      verificationStatus: 'verified',
      gamerTag: 'ARC_LEGENDA',
    });

    await User.create({
      name: 'LuckyDuck',
      email: 'duck@pro-project.io',
      username: 'quack',
      role: 'member',
      creditBalance: 1500,
      eloRating: 1200,
      stats: { wins: 15, losses: 15, draws: 5, dnfs: 0 },
      verificationStatus: 'unverified',
    });
    console.log('👤 Demo users created.');

    // Create Games
    for (const gameData of GAMES) {
      await Game.create(gameData);
      console.log(`🎮 Game "${gameData.title}" created.`);
    }

    // Create Machines and Prizes
    for (const machineData of MACHINES) {
      const machine = await Machine.create(machineData);
      console.log(`🕹️  Created machine: ${machine.name}`);

      // Randomly assign 3-4 prizes to each machine
      const shuffledPrizes = [...PRIZES].sort(() => 0.5 - Math.random());
      const machinePrizes = shuffledPrizes.slice(0, Math.floor(Math.random() * 2) + 3);

      for (const prize of machinePrizes) {
        await Product.create({
          ...prize,
          description: `A rare ${prize.name} found only in the ${machine.name} machine.`,
          images: [`https://picsum.photos/seed/${prize.name}/400/400`],
          machineId: machine._id,
        });
      }
      console.log(`   🎁 Assigned ${machinePrizes.length} prizes to ${machine.name}`);
    }

    console.log('\n✅ Seeding complete! Enjoy the arcade.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
