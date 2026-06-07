import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

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

let changeStreamInitialized = false;

async function initChangeStreams() {
  if (changeStreamInitialized) return;
  
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) return;

    changeStreamInitialized = true;

    // 1. Watch Matches (Challenges & Victories)
    const matchStream = db.collection('matches').watch(
      [{ $match: { operationType: { $in: ['insert', 'update'] } } }],
      { fullDocument: 'updateLookup' }
    );

    matchStream.on('change', async (change: any) => {
      const doc = change.fullDocument;
      if (!doc) return;

      // New Challenge
      if (change.operationType === 'insert') {
        const [challenger, defender] = await Promise.all([
          mongoose.model('User').findById(doc.challengerId).select('username').lean(),
          mongoose.model('User').findById(doc.defenderId).select('username').lean(),
        ]);

        emitter.emit('activity', {
          id: String(doc._id),
          type: 'CHALLENGE',
          message: `${challenger?.username || 'A player'} challenged ${defender?.username || 'someone'} to a duel!`,
          timestamp: new Date(),
        });
      }

      // Match Victory
      if (change.operationType === 'update' && doc.status === 'completed' && change.updateDescription.updatedFields.status === 'completed') {
        const [winner, loser] = await Promise.all([
          mongoose.model('User').findById(doc.finalOutcome.winnerId).select('username').lean(),
          mongoose.model('User').findById(doc.challengerId.toString() === doc.finalOutcome.winnerId.toString() ? doc.defenderId : doc.challengerId).select('username').lean(),
        ]);

        emitter.emit('activity', {
          id: String(doc._id),
          type: 'VICTORY',
          message: `${winner?.username || 'A player'} CRUSHED ${loser?.username || 'someone'} in the arena!`,
          timestamp: new Date(),
        });
      }
    });

    // 2. Watch Achievements
    const achievementStream = db.collection('userachievements').watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    achievementStream.on('change', async (change: any) => {
      const doc = change.fullDocument;
      if (!doc) return;

      const user = await mongoose.model('User').findById(doc.userId).select('username').lean();
      
      emitter.emit('activity', {
        id: String(doc._id),
        type: 'ACHIEVEMENT',
        message: `${user?.username || 'A player'} just unlocked [${doc.achievementId}]!`,
        timestamp: new Date(),
      });
    });

  } catch (error) {
    console.error('Failed to init Activity Change Streams:', error);
    changeStreamInitialized = false;
  }
}

export function onActivity(callback: (event: ActivityEvent) => void): () => void {
  initChangeStreams();
  emitter.on('activity', callback);
  return () => emitter.off('activity', callback);
}
