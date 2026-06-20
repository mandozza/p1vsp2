# Future Plan: Database Migration to Postgres and Drizzle

## Feature Overview
This plan outlines the migration of the **ProProject** (`p1vsp2`) database and database strategy away from MongoDB and Mongoose to PostgreSQL and Drizzle ORM. This migration aligns the project's data architecture with the architecture validated in **clawdaddy**.

By transitioning to Postgres and Drizzle, we will:
1. Eliminate connection pool leaks in development hot-reloads via cached pooling.
2. Establish clean, type-safe SQL relational schemas.
3. Migrate the Server-Sent Events (SSE) stream logic from MongoDB Change Streams (`.watch()`) to PostgreSQL `LISTEN/NOTIFY` channels powered by database triggers.
4. Minimize import path churn by structuring `src/models/*.ts` wrappers to re-export Drizzle tables while maintaining backward-compatible interfaces.

---

## Requirements
*   **Functional Requirements**:
    *   [ ] Remove `mongoose` from dependencies and install Drizzle and Postgres clients (`drizzle-orm`, `drizzle-zod`, `pg`, `drizzle-kit`, `@types/pg`).
    *   [ ] Configure Drizzle configuration file `drizzle.config.ts` targeting PostgreSQL.
    *   [ ] Initialize the database connection factory in `src/lib/db.ts` utilizing `pg.Pool` cached globally.
    *   [ ] Implement a unified Drizzle schema definition in `src/models/schema.ts` defining all 13 tables, indexes, and relations.
    *   [ ] Refactor wrapper files under `src/models/` to re-export Drizzle schema objects, maintain backward-compatible type aliases (e.g. mapping `id` and `_id`), and provide input validation via `drizzle-zod` or native `zod` schemas.
    *   [ ] Migrate all Server Actions (`src/actions/*.ts`) from Mongoose calls (`find`, `findOne`, `create`, `findOneAndUpdate`, `.save()`, Mongoose transactions) to Drizzle equivalents (`db.select()`, `db.insert()`, `db.update()`, `db.transaction()`).
    *   [ ] Update Route Handlers (APIs) and NextAuth authentication options in `src/lib/auth.ts` to utilize Drizzle queries.
    *   [ ] Re-implement SSE streaming listeners (`activity-stream.ts`, `chat-stream.ts`, `queue-stream.ts`, `api/notifications/stream`) utilizing a PostgreSQL notification client listening to SQL-generated channel events.
    *   [ ] Rewrite the seeding script `scripts/seed.ts` to flush and populate tables, as well as install the required PL/pgSQL database triggers for real-time notification broadcasting.
*   **Non-Functional & Styling Requirements**:
    *   [ ] System must maintain identical API boundaries and frontend behaviors (e.g., matching the beta invite-only access checks, ELO updates, real-time arcade narrations).
    *   [ ] Ensure database transactions are correctly implemented for multi-document/multi-table writes (such as match results verification and credit purchases ledger entries).
    *   [ ] Keep UI components presentation-only, conforming to Layered Architecture (no direct database imports inside component layers).

---

## Database & Data Models
All 13 Mongoose models will be unified into Postgres tables inside `src/models/schema.ts` using the following schema layouts:

### 1. `users` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `name`: `text` (Not Null)
    *   `username`: `text` (Not Null, Unique)
    *   `email`: `text` (Not Null, Unique)
    *   `bio`: `text`
    *   `passwordHash`: `text` (Maps to `password_hash`)
    *   `image`: `text`
    *   `role`: `text` (`'admin' | 'member'`, Default `'member'`, Not Null)
    *   `creditBalance`: `integer` (Default `1000`, Not Null)
    *   `eloRating`: `integer` (Default `1000`, Not Null)
    *   `stats`: `jsonb` (Default `{ wins: 0, losses: 0, draws: 0, dnfs: 0 }`, Not Null)
    *   `avatarUrl`: `text`
    *   `bannerUrl`: `text`
    *   `linkedAccounts`: `jsonb` (Default `{}`, Not Null)
    *   `friends`: `uuid[]` (Array of user IDs to maintain easy query mappings)
    *   `gamerTag`: `text`
    *   `tagPlatform`: `text` (`'PSN' | 'XBOX' | 'STEAM'`)
    *   `verificationStatus`: `text` (`'unverified' | 'pending' | 'verified'`, Default `'unverified'`, Not Null)
    *   `verificationCode`: `text`
    *   `pushSubscription`: `jsonb`
    *   `gameStats`: `jsonb` (Array of game ELOs, default `[]`, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)

### 2. `games` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `title`: `text` (Not Null)
    *   `slug`: `text` (Not Null, Unique)
    *   `active`: `boolean` (Default `true`, Not Null)
    *   `thumbnailUrl`: `text`
    *   `aiPrompt`: `text`
    *   `gameType`: `text` (`'FIGHTING' | 'SPORTS' | 'RACING' | 'SHOOTER'`, Default `'FIGHTING'`, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)

### 3. `matches` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `gameId`: `uuid` (References `games.id`, onDelete cascade, Not Null)
    *   `challengerId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `defenderId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `status`: `text` (`'pending' | 'accepted' | 'awaiting_results' | 'verifying' | 'completed' | 'disputed' | 'cancelled'`, Default `'pending'`, Not Null)
    *   `results`: `jsonb` (Stores submissions; Array of objects with `userId`, `screenshotUrl`, `videoUrl`, `aiExtractedData`, and `submittedAt`)
    *   `finalOutcome`: `jsonb` (Stores winner, resolution, commentary, and timestamps)
    *   `votes`: `jsonb` (Array of user votes)
    *   `tournamentId`: `uuid` (References `tournaments.id`, onDelete set null)
    *   `tournamentRound`: `integer`
    *   `wagerAmount`: `integer` (Default `0`, Not Null)
    *   `prediction`: `jsonb` (Confidence analysis and game odds)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `challengerId` + `status`
    *   Index on `defenderId` + `status`
    *   Index on `status`

### 4. `tournaments` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `name`: `text` (Not Null)
    *   `gameId`: `uuid` (References `games.id`, onDelete cascade, Not Null)
    *   `status`: `text` (`'registration' | 'in_progress' | 'completed'`, Default `'registration'`, Not Null)
    *   `participants`: `uuid[]` (Array of user IDs participating)
    *   `rounds`: `jsonb` (Array of rounds with match UUID lists)
    *   `championId`: `uuid` (References `users.id`, onDelete set null)
    *   `entryFee`: `integer` (Default `0`, Not Null)
    *   `prizePool`: `integer` (Default `0`, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)

### 5. `rivalries` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `player1Id`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `player2Id`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `stats`: `jsonb` (Default `{ player1Wins: 0, player2Wins: 0, draws: 0 }`, Not Null)
    *   `totalMatches`: `integer` (Default `0`, Not Null)
    *   `beltHolderId`: `uuid` (References `users.id`, onDelete set null)
    *   `lastMatchId`: `uuid` (References `matches.id`, onDelete set null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)
*   **Constraints**:
    *   Unique constraint on `(player1Id, player2Id)`

### 6. `bets` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `userId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `matchId`: `uuid` (References `matches.id`, onDelete cascade, Not Null)
    *   `votedForId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `amount`: `integer` (Not Null)
    *   `odds`: `numeric(4, 2)` (Default `2.00`, Not Null)
    *   `status`: `text` (`'pending' | 'won' | 'lost' | 'refunded'`, Default `'pending'`, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `matchId` + `status`
    *   Index on `userId` + `createdAt` desc

### 7. `credit_ledger` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `userId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `amount`: `integer` (Not Null)
    *   `type`: `text` (`'WAGER_WIN' | 'WAGER_LOSS' | 'WAGER_ESCROW' | 'WAGER_REFUND' | 'TRIBUNAL_REWARD' | 'TOURNAMENT_FEE' | 'TOURNAMENT_WIN' | 'SYSTEM_GRANT'`, Not Null)
    *   `referenceId`: `uuid`
    *   `balanceAfter`: `integer` (Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `userId` + `createdAt` desc

### 8. `notifications` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `userId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `type`: `text` (`'CHALLENGE_RECEIVED' | 'MATCH_RESOLVED' | 'ACHIEVEMENT_UNLOCKED' | 'SYSTEM'`, Not Null)
    *   `title`: `text` (Not Null)
    *   `message`: `text` (Not Null)
    *   `link`: `text`
    *   `isRead`: `boolean` (Default `false`, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `userId` + `createdAt` desc
    *   Index on `userId` + `isRead`

### 9. `user_achievements` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `userId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `achievementId`: `text` (Not Null)
    *   `unlockedAt`: `timestamp` (Default now, Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)
*   **Constraints**:
    *   Unique constraint on `(userId, achievementId)`

### 10. `app_settings` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `key`: `text` (Not Null, Unique)
    *   `value`: `jsonb` (Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)

### 11. `beta_codes` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `code`: `text` (Not Null, Unique)
    *   `note`: `text`
    *   `usedAt`: `timestamp`
    *   `createdAt`: `timestamp` (Default now, Not Null)
    *   `updatedAt`: `timestamp` (Default now, Not Null)

### 12. `beta_page_views` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `sessionId`: `text` (Not Null)
    *   `path`: `text` (Not Null)
    *   `userId`: `uuid` (References `users.id`, onDelete set null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `createdAt` desc
    *   Index on `sessionId`

### 13. `chat_messages` Table
*   **Columns**:
    *   `id`: `uuid` (Primary Key, default random)
    *   `userId`: `uuid` (References `users.id`, onDelete cascade, Not Null)
    *   `message`: `text` (Not Null)
    *   `createdAt`: `timestamp` (Default now, Not Null)
*   **Indexes**:
    *   Index on `createdAt`

---

## Backend & API Boundaries (Server Actions / Route Handlers)

### 1. Database Connection (`src/lib/db.ts`)
Creates a Next.js safe cached Postgres client Pool and drizzle ORM instance:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/models/schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proproject';

let cached = (global as any).drizzle;
if (!cached) {
  cached = (global as any).drizzle = { conn: null, pool: null };
}

export function getDb() {
  if (cached.conn) return cached.conn;

  console.log('📡 Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 15,
    idleTimeoutMillis: 30000,
  });

  cached.pool = pool;
  cached.conn = drizzle(pool, { schema });
  return cached.conn;
}

export const db = getDb();
export default getDb;
```

### 2. Model Wrappers Design (Example: `src/models/User.ts`)
To prevent large-scale import statement updates across the UI, model wrapper files will expose variables and aliases targeting Drizzle tables:
```typescript
import { z } from 'zod';
import { users } from './schema';

export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  passwordHash: z.string().optional(),
  image: z.string().url().optional(),
  role: z.enum(['admin', 'member']).default('member'),
  creditBalance: z.number().int().nonnegative().default(1000),
  eloRating: z.number().int().nonnegative().default(1000),
  // other properties...
});

export type IUser = z.infer<typeof UserSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility for mongo references
  createdAt: Date;
  updatedAt: Date;
};

export const User = users;
export default users;
```

### 3. Transitioning SSE Channels
In place of `.watch()`, the streams will utilize Postgres triggers inside the database to publish events via SQL `NOTIFY channel, payload`.
A dedicated `pg.Client` connection inside Node will execute `LISTEN matches_change`, `LISTEN user_achievements_change`, etc., and relay the triggers:
*   **Triggers Setup (PL/pgSQL)**:
    ```sql
    CREATE OR REPLACE FUNCTION notify_table_change()
    RETURNS TRIGGER AS $$
    DECLARE
      payload TEXT;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        payload := json_build_object('operationType', 'delete', 'id', OLD.id)::text;
      ELSE
        payload := json_build_object('operationType', lower(TG_OP), 'id', NEW.id, 'fullDocument', row_to_json(NEW))::text;
      END IF;
      EXECUTE format('NOTIFY %I, %L', TG_TABLE_NAME || '_change', payload);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    ```

---

## Frontend Components (Shadcn + Storybook)
*   No modifications are required for presentation components or Storybook stories (`*.stories.tsx`) as the database migration occurs strictly within the server boundaries (Server Actions, route handlers, streams, and database configuration).
*   Any page templates utilizing asynchronous fetch operations will call Drizzle `db` query methods directly.

---

## Verification Checklist
*   [ ] Install packages and verify no dependency conflicts with `npm install`.
*   [ ] Configure Drizzle configuration file and run code generation (`npx drizzle-kit generate`).
*   [ ] Run Drizzle migration runner to initialize PostgreSQL tables (`npx drizzle-kit migrate`).
*   [ ] Seed local Postgres database and initialize triggers with `npm run db:seed`.
*   [ ] Run TypeScript compile verification check (`npm run build`).
*   [ ] Run ESLint correctness check (`npm run lint`).
*   [ ] Verify the E2E suites and local test suite run successfully (`npm run test` and `npm run test:e2e`).
*   [ ] Validate real-time victory announcements, chat, queue updates, and narrator notifications in dev mode.

---

## Open Questions / Clarifications
1. **Database Schema Normalization**:
   *   *Option A (Hybrid JSONB)*: Keep complex nested structures (like Match `results` and `votes`, Tournament `rounds`) as `JSONB` columns in Postgres. This preserves existing logic and makes the migration of queries extremely quick.
   *   *Option B (Fully Normalized)*: Extract nested arrays into standalone tables (e.g. creating `match_results`, `match_votes`, `tournament_rounds`). This is more relational but requires larger changes to our action and utility code.
   *   *Recommendation*: We suggest **Option A** for the initial migration to keep changes focused and maintain stability, moving to normalized structures only if we find performance bottlenecks.
2. **MongoDB Data Migration**:
   *   Since this is currently a prototype/arcade application with seeding scripts, is it sufficient to flush existing data and start fresh using the Postgres seed script (`npm run db:seed`)? Or do we need to write a migration utility to copy records from MongoDB to PostgreSQL?
   *   *Recommendation*: Start with fresh seeding via PostgreSQL trigger installations.
