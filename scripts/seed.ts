import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import getDb from '../src/lib/db';
import {
  users,
  games,
  tournaments,
  matches,
  rivalries,
  bets,
  creditLedger,
  notifications,
  userAchievements,
  appSettings,
  betaCodes,
  betaPageViews,
  chatMessages
} from '../src/models/schema';
import { sql } from 'drizzle-orm';

const GAMES = [
  {
    title: 'UFC 6',
    slug: 'ufc-6',
    gameType: 'FIGHTING' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/ufc6/800/400',
    aiPrompt: 'Analyze this UFC 6 end-of-game screenshot. Identify the winner and loser by their gamer tags. Determine the method of victory (KO, TKO, SUB, DEC), the round, and the time. Check if the screen indicates a disconnection, forfeit, or "Connection Lost" state.',
  },
  {
    title: 'Street Fighter 6',
    slug: 'street-fighter-6',
    gameType: 'FIGHTING' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/sf6/800/400',
    aiPrompt: 'Analyze this Street Fighter 6 victory screen. Identify the winning character and player. Extract the number of rounds won by each player and check for "PERFECT" or "DOUBLE PERFECT" indicators. Identify the method of finish (Critical Art, Special Move, etc).',
  },
  {
    title: 'Madden 26',
    slug: 'madden-26',
    gameType: 'SPORTS' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/madden26/800/400',
    aiPrompt: 'Analyze this Madden 26 end-game screen. Identify the "Winner" based on the final score. Extract the "Home Team Score" and "Away Team Score". Check if the game ended via "Concede" or disconnection.',
  },
  {
    title: 'FC 26',
    slug: 'fc-26',
    gameType: 'SPORTS' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/fc26/800/400',
    aiPrompt: 'Analyze this FC 26 (FIFA) final result screen. Extract the score for both teams and identify the winner. Identify individual goal scorers if visible. Check if the match was decided in "Extra Time" or "Penalties".',
  },
  {
    title: 'NBA 2K26',
    slug: 'nba-2k26',
    gameType: 'SPORTS' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/nba2k26/800/400',
    aiPrompt: 'Analyze this NBA 2K26 end-game screen. Identify the winning team and final score. Extract key player stats if visible (Points, Rebounds, Assists). Check for "Quit" indicators or early forfeits.',
  },
  {
    title: 'Tekken 8',
    slug: 'tekken-8',
    gameType: 'FIGHTING' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/tekken8/800/400',
    aiPrompt: 'Analyze this Tekken 8 victory screen. Identify the winning character and player tag. Extract the number of rounds won (e.g., 3-1) and check for "PERFECT" or "GREAT" victory indicators.',
  },
  {
    title: 'Call of Duty: Black Ops 6',
    slug: 'cod-bo6',
    gameType: 'SHOOTER' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/codbo6/800/400',
    aiPrompt: 'Analyze this Call of Duty: Black Ops 6 post-match scoreboard. Identify the winning team or player. Extract Kills, Deaths, and Score for the top players. Identify the match type (TDM, Domination, etc).',
  },
  {
    title: 'Gran Turismo 7',
    slug: 'gt7',
    gameType: 'RACING' as const,
    active: true,
    thumbnailUrl: 'https://picsum.photos/seed/gt7/800/400',
    aiPrompt: 'Analyze this Gran Turismo 7 race result screen. Identify the winner (P1) and their total race time. Extract podium positions (P2, P3) and the time gap between them. Identify the track and car used if visible.',
  },
];

async function seed() {
  try {
    console.log('🌱 Starting SQL seed...');
    const db = getDb();

    // Clean up in dependency order
    await db.delete(chatMessages);
    await db.delete(notifications);
    await db.delete(userAchievements);
    await db.delete(bets);
    await db.delete(rivalries);
    await db.delete(matches);
    await db.delete(tournaments);
    await db.delete(games);
    await db.delete(betaPageViews);
    await db.delete(betaCodes);
    await db.delete(appSettings);
    await db.delete(creditLedger);
    await db.delete(users);

    console.log('🧹 PostgreSQL Database cleaned.');

    // 1. Create Games
    const createdGames = [];
    for (const gameData of GAMES) {
      const [g] = await db.insert(games).values(gameData).returning();
      createdGames.push(g);
      console.log(`🎮 Game "${gameData.title}" created.`);
    }

    const ufcId = createdGames.find(g => g.slug === 'ufc-6')?.id;
    const sfId = createdGames.find(g => g.slug === 'street-fighter-6')?.id;
    const maddenId = createdGames.find(g => g.slug === 'madden-26')?.id;

    // 2. Create Admin User
    const [adminUser] = await db.insert(users).values({
      name: 'Arcade Admin',
      email: 'admin@pro-project.io',
      username: 'admin',
      role: 'admin',
      creditBalance: 1000000,
      eloRating: 2500,
      stats: { wins: 0, losses: 0, draws: 0, dnfs: 0 },
      verificationStatus: 'verified',
      gamerTag: 'ADMIN_OP',
    }).returning();
    console.log('👤 Admin user created.');

    // 3. Create Demo Users
    await db.insert(users).values([
      {
        name: 'ClawMaster',
        email: 'player@pro-project.io',
        username: 'clawmaster',
        role: 'member',
        creditBalance: 5000,
        eloRating: 1500,
        stats: { wins: 42, losses: 10, draws: 2, dnfs: 1 },
        verificationStatus: 'verified',
        gamerTag: 'CLAW_MSTR',
        gameStats: [
          { gameId: String(ufcId), eloRating: 1800, stats: { wins: 30, losses: 5, draws: 0, dnfs: 0 } },
          { gameId: String(sfId), eloRating: 1200, stats: { wins: 12, losses: 5, draws: 2, dnfs: 1 } },
        ]
      },
      {
        name: 'ArcadeLegend',
        email: 'legend@pro-project.io',
        username: 'arcado',
        role: 'member',
        creditBalance: 2000,
        eloRating: 1800,
        stats: { wins: 28, losses: 5, draws: 0, dnfs: 0 },
        verificationStatus: 'verified',
        gamerTag: 'ARC_LEGENDA',
        gameStats: [
          { gameId: String(ufcId), eloRating: 1950, stats: { wins: 25, losses: 2, draws: 0, dnfs: 0 } },
          { gameId: String(maddenId), eloRating: 1400, stats: { wins: 3, losses: 3, draws: 0, dnfs: 0 } },
        ]
      },
      {
        name: 'LuckyDuck',
        email: 'duck@pro-project.io',
        username: 'quack',
        role: 'member',
        creditBalance: 1500,
        eloRating: 1200,
        stats: { wins: 15, losses: 15, draws: 5, dnfs: 0 },
        verificationStatus: 'unverified',
        gameStats: [
          { gameId: String(sfId), eloRating: 1200, stats: { wins: 15, losses: 15, draws: 5, dnfs: 0 } },
        ]
      }
    ]);
    console.log('👤 Demo users created.');

    // 4. Configure database triggers for real-time notify channels
    console.log('⚡ Creating database triggers for real-time notifications...');
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION notify_table_change()
      RETURNS TRIGGER AS $$
      DECLARE
        payload TEXT;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          payload := json_build_object(
            'operationType', 'delete',
            'id', OLD.id
          )::text;
        ELSE
          payload := json_build_object(
            'operationType', lower(TG_OP),
            'id', NEW.id,
            'fullDocument', row_to_json(NEW)
          )::text;
        END IF;
        
        EXECUTE format('NOTIFY %I, %L', TG_TABLE_NAME || '_change', payload);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const triggers = [
      { table: 'chat_messages', trigger: 'trg_chat_messages_change', events: 'INSERT OR UPDATE OR DELETE' },
      { table: 'matches', trigger: 'trg_matches_change', events: 'INSERT OR UPDATE OR DELETE' },
      { table: 'user_achievements', trigger: 'trg_user_achievements_change', events: 'INSERT' },
      { table: 'notifications', trigger: 'trg_notifications_change', events: 'INSERT' }
    ];

    for (const t of triggers) {
      await db.execute(sql.raw(`DROP TRIGGER IF EXISTS ${t.trigger} ON ${t.table};`));
      await db.execute(sql.raw(`
        CREATE TRIGGER ${t.trigger}
        AFTER ${t.events} ON ${t.table}
        FOR EACH ROW EXECUTE FUNCTION notify_table_change();
      `));
    }
    console.log('✅ Database triggers successfully configured.');

    console.log('\n✅ PostgreSQL Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
