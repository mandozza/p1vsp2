import { EventEmitter } from 'events';
import { Client } from 'pg';
import { db } from '@/lib/db';
import { User } from '@/models/User';
import { eq } from 'drizzle-orm';

export type ActivityType = 'WIN' | 'CHALLENGE' | 'VICTORY' | 'ACHIEVEMENT';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  data?: any;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(500);

let pgClientInitialized = false;
let pgClient: Client | null = null;

async function initPgClient() {
  if (pgClientInitialized) return;
  
  try {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/p1vsp2';
    pgClient = new Client({ connectionString });
    await pgClient.connect();
    
    pgClientInitialized = true;
    console.log('📡 Connected to PG for Activity stream notifications');

    await pgClient.query('LISTEN matches_change');
    await pgClient.query('LISTEN user_achievements_change');

    pgClient.on('notification', async (msg) => {
      try {
        if (!msg.payload) return;
        const change = JSON.parse(msg.payload);
        const doc = change.fullDocument;
        if (!doc) return;

        if (msg.channel === 'matches_change') {
          // 1. New Challenge (Insert)
          if (change.operationType === 'insert') {
            const [challenger] = await db.select({ username: User.username }).from(User).where(eq(User.id, doc.challenger_id));
            const [defender] = await db.select({ username: User.username }).from(User).where(eq(User.id, doc.defender_id));

            emitter.emit('activity', {
              id: String(doc.id),
              type: 'CHALLENGE',
              message: `${challenger?.username || 'A player'} challenged ${defender?.username || 'someone'} to a duel!`,
              timestamp: new Date(),
            });
          }

          // 2. Match Victory (Update to completed)
          if (change.operationType === 'update' && doc.status === 'completed') {
            // Note: Since doc was updated, we inspect the finalOutcome fields
            // finalOutcome is a JSONB column in Postgres, which node-pg automatically parses as a JS object.
            const outcome = doc.final_outcome;
            if (outcome && outcome.winnerId) {
              const winnerId = outcome.winnerId;
              const loserId = doc.challenger_id === winnerId ? doc.defender_id : doc.challenger_id;

              const [winner] = await db.select({ username: User.username }).from(User).where(eq(User.id, winnerId));
              const [loser] = await db.select({ username: User.username }).from(User).where(eq(User.id, loserId));

              emitter.emit('activity', {
                id: String(doc.id),
                type: 'VICTORY',
                message: `${winner?.username || 'A player'} CRUSHED ${loser?.username || 'someone'} in the arena!`,
                timestamp: new Date(),
              });
            }
          }
        } else if (msg.channel === 'user_achievements_change') {
          // 3. New Achievement
          if (change.operationType === 'insert') {
            const [user] = await db.select({ username: User.username }).from(User).where(eq(User.id, doc.user_id));
            
            emitter.emit('activity', {
              id: String(doc.id),
              type: 'ACHIEVEMENT',
              message: `${user?.username || 'A player'} just unlocked [${doc.achievement_id}]!`,
              timestamp: new Date(),
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse activity notification:', e);
      }
    });

    pgClient.on('error', (err) => {
      console.error('PG Client Activity Stream error:', err);
      pgClientInitialized = false;
      setTimeout(initPgClient, 5000);
    });

  } catch (error) {
    console.error('Failed to init Activity PG Client:', error);
    pgClientInitialized = false;
    setTimeout(initPgClient, 5000);
  }
}

export function onActivity(callback: (event: ActivityEvent) => void): () => void {
  initPgClient();
  emitter.on('activity', callback);
  return () => emitter.off('activity', callback);
}
