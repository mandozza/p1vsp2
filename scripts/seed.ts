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
    });
    
    await User.create({
      name: 'ArcadeLegend',
      email: 'legend@pro-project.io',
      username: 'arcado',
      role: 'member',
      creditBalance: 2000,
      eloRating: 1800,
      stats: { wins: 28, losses: 5, draws: 0, dnfs: 0 },
    });

    await User.create({
      name: 'LuckyDuck',
      email: 'duck@pro-project.io',
      username: 'quack',
      role: 'member',
      creditBalance: 1500,
      eloRating: 1200,
      stats: { wins: 15, losses: 15, draws: 5, dnfs: 0 },
    });
    console.log('👤 Demo users created.');

    // Create Game
    await Game.create({
      title: 'UFC 6',
      slug: 'ufc-6',
      active: true,
      thumbnailUrl: 'https://picsum.photos/seed/ufc6/800/400',
    });
    console.log('🎮 Game "UFC 6" created.');

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
