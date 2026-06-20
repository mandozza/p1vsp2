import { pgTable, text, timestamp, integer, boolean, uuid, numeric, jsonb } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { index, unique } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
  passwordHash: text('password_hash'),
  image: text('image'),
  role: text('role').$type<'admin' | 'member'>().default('member').notNull(),
  creditBalance: integer('credit_balance').default(1000).notNull(),
  eloRating: integer('elo_rating').default(1000).notNull(),
  stats: jsonb('stats').$type<{
    wins: number;
    losses: number;
    draws: number;
    dnfs: number;
  }>().default({ wins: 0, losses: 0, draws: 0, dnfs: 0 }).notNull(),
  avatarUrl: text('avatar_url'),
  bannerUrl: text('banner_url'),
  linkedAccounts: jsonb('linked_accounts').$type<{
    psn?: string;
    xbox?: string;
    discord?: string;
  }>().default({}).notNull(),
  friends: uuid('friends').array().notNull().default(sql`'{}'::uuid[]`),
  gamerTag: text('gamer_tag'),
  tagPlatform: text('tag_platform').$type<'PSN' | 'XBOX' | 'STEAM'>(),
  verificationStatus: text('verification_status').$type<'unverified' | 'pending' | 'verified'>().default('unverified').notNull(),
  verificationCode: text('verification_code'),
  pushSubscription: jsonb('push_subscription'),
  gameStats: jsonb('game_stats').$type<{
    gameId: string;
    eloRating: number;
    stats: {
      wins: number;
      losses: number;
      draws: number;
      dnfs: number;
    };
  }[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Games Table
export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  active: boolean('active').default(true).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  aiPrompt: text('ai_prompt'),
  gameType: text('game_type').$type<'FIGHTING' | 'SPORTS' | 'RACING' | 'SHOOTER'>().default('FIGHTING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Tournaments Table
export const tournaments = pgTable('tournaments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').$type<'registration' | 'in_progress' | 'completed'>().default('registration').notNull(),
  participants: uuid('participants').array().notNull().default(sql`'{}'::uuid[]`),
  rounds: jsonb('rounds').$type<{
    roundNumber: number;
    matches: string[];
  }[]>().default([]).notNull(),
  championId: uuid('champion_id').references(() => users.id, { onDelete: 'set null' }),
  entryFee: integer('entry_fee').default(0).notNull(),
  prizePool: integer('prize_pool').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Matches Table
export const matches = pgTable('matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  challengerId: uuid('challenger_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  defenderId: uuid('defender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').$type<'pending' | 'accepted' | 'awaiting_results' | 'verifying' | 'completed' | 'disputed' | 'cancelled'>().default('pending').notNull(),
  results: jsonb('results').$type<{
    userId: string;
    screenshotUrl: string;
    videoUrl?: string;
    aiExtractedData?: {
      winnerTag?: string;
      loserTag?: string;
      method?: string;
      round?: number;
      time?: string;
      opponentQuit?: boolean;
    };
    submittedAt: string;
  }[]>().default([]).notNull(),
  finalOutcome: jsonb('final_outcome').$type<{
    winnerId?: string;
    method?: string;
    round?: number;
    time?: string;
    isDNF: boolean;
    commentary?: string;
    resolvedAt?: string;
    resolvedBy?: 'ai' | 'admin' | 'community';
  }>(),
  votes: jsonb('votes').$type<{
    userId: string;
    votedForId: string;
    createdAt: string;
  }[]>().default([]).notNull(),
  tournamentId: uuid('tournament_id').references(() => tournaments.id, { onDelete: 'set null' }),
  tournamentRound: integer('tournament_round'),
  wagerAmount: integer('wager_amount').default(0).notNull(),
  prediction: jsonb('prediction').$type<{
    predictedWinnerId?: string;
    confidence?: number;
    analysis?: string;
    odds?: {
      challenger: number;
      defender: number;
    };
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('matches_challenger_status_idx').on(t.challengerId, t.status),
  index('matches_defender_status_idx').on(t.defenderId, t.status),
  index('matches_status_idx').on(t.status),
]);

// 5. Rivalries Table
export const rivalries = pgTable('rivalries', {
  id: uuid('id').defaultRandom().primaryKey(),
  player1Id: uuid('player1_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  player2Id: uuid('player2_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stats: jsonb('stats').$type<{
    player1Wins: number;
    player2Wins: number;
    draws: number;
  }>().default({ player1Wins: 0, player2Wins: 0, draws: 0 }).notNull(),
  totalMatches: integer('total_matches').default(0).notNull(),
  beltHolderId: uuid('belt_holder_id').references(() => users.id, { onDelete: 'set null' }),
  lastMatchId: uuid('last_match_id').references(() => matches.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  unique('rivalries_players_uniq').on(t.player1Id, t.player2Id),
  index('rivalries_player1_idx').on(t.player1Id),
  index('rivalries_player2_idx').on(t.player2Id),
]);

// 6. Bets Table
export const bets = pgTable('bets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  votedForId: uuid('voted_for_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  odds: numeric('odds', { precision: 4, scale: 2 }).default('2.00').notNull(),
  status: text('status').$type<'pending' | 'won' | 'lost' | 'refunded'>().default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('bets_match_status_idx').on(t.matchId, t.status),
  index('bets_user_created_idx').on(t.userId, t.createdAt),
]);

// 7. Credit Ledger Table
export const creditLedger = pgTable('credit_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  type: text('type').$type<'WAGER_WIN' | 'WAGER_LOSS' | 'WAGER_ESCROW' | 'WAGER_REFUND' | 'TRIBUNAL_REWARD' | 'TOURNAMENT_FEE' | 'TOURNAMENT_WIN' | 'SYSTEM_GRANT'>().notNull(),
  referenceId: uuid('reference_id'),
  balanceAfter: integer('balance_after').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('credit_ledger_user_created_idx').on(t.userId, t.createdAt),
]);

// 8. Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').$type<'CHALLENGE_RECEIVED' | 'MATCH_RESOLVED' | 'ACHIEVEMENT_UNLOCKED' | 'SYSTEM'>().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('notifications_user_created_idx').on(t.userId, t.createdAt),
  index('notifications_user_read_idx').on(t.userId, t.isRead),
]);

// 9. User Achievements Table
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  unique('user_achievements_user_ach_uniq').on(t.userId, t.achievementId),
]);

// 10. App Settings Table
export const appSettings = pgTable('app_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Beta Codes Table
export const betaCodes = pgTable('beta_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  note: text('note'),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Beta Page Views Table
export const betaPageViews = pgTable('beta_page_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('session_id').notNull(),
  path: text('path').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('beta_page_views_created_idx').on(t.createdAt),
  index('beta_page_views_session_idx').on(t.sessionId),
]);

// 13. Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('chat_messages_created_idx').on(t.createdAt),
]);

// -------------------------------------------------------------
// Relations Definitions
// -------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  matchesAsChallenger: many(matches, { relationName: 'challenger' }),
  matchesAsDefender: many(matches, { relationName: 'defender' }),
  tournaments: many(tournaments),
  rivalriesAsPlayer1: many(rivalries, { relationName: 'player1' }),
  rivalriesAsPlayer2: many(rivalries, { relationName: 'player2' }),
  bets: many(bets),
  creditLedger: many(creditLedger),
  notifications: many(notifications),
  userAchievements: many(userAchievements),
  betaPageViews: many(betaPageViews),
  chatMessages: many(chatMessages),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  matches: many(matches),
  tournaments: many(tournaments),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  game: one(games, {
    fields: [tournaments.gameId],
    references: [games.id],
  }),
  champion: one(users, {
    fields: [tournaments.championId],
    references: [users.id],
  }),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  game: one(games, {
    fields: [matches.gameId],
    references: [games.id],
  }),
  challenger: one(users, {
    fields: [matches.challengerId],
    references: [users.id],
    relationName: 'challenger',
  }),
  defender: one(users, {
    fields: [matches.defenderId],
    references: [users.id],
    relationName: 'defender',
  }),
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  bets: many(bets),
}));

export const rivalriesRelations = relations(rivalries, ({ one }) => ({
  player1: one(users, {
    fields: [rivalries.player1Id],
    references: [users.id],
    relationName: 'player1',
  }),
  player2: one(users, {
    fields: [rivalries.player2Id],
    references: [users.id],
    relationName: 'player2',
  }),
  beltHolder: one(users, {
    fields: [rivalries.beltHolderId],
    references: [users.id],
  }),
  lastMatch: one(matches, {
    fields: [rivalries.lastMatchId],
    references: [matches.id],
  }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [bets.matchId],
    references: [matches.id],
  }),
  votedFor: one(users, {
    fields: [bets.votedForId],
    references: [users.id],
  }),
}));

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  user: one(users, {
    fields: [creditLedger.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const betaPageViewsRelations = relations(betaPageViews, ({ one }) => ({
  user: one(users, {
    fields: [betaPageViews.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));
