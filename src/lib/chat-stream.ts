import { EventEmitter } from 'events';
import { Client } from 'pg';
import { db } from '@/lib/db';
import { User } from '@/models/User';
import { eq } from 'drizzle-orm';

export interface ChatEvent {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

const chatEmitter = new EventEmitter();
chatEmitter.setMaxListeners(500);

let pgClientInitialized = false;
let pgClient: Client | null = null;

async function initChatPgClient() {
  if (pgClientInitialized) return;
  
  try {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/p1vsp2';
    pgClient = new Client({ connectionString });
    await pgClient.connect();
    
    pgClientInitialized = true;
    console.log('📡 Connected to PG for Chat stream notifications');

    await pgClient.query('LISTEN chat_messages_change');

    pgClient.on('notification', async (msg) => {
      if (msg.channel === 'chat_messages_change' && msg.payload) {
        try {
          const change = JSON.parse(msg.payload);
          if (change.operationType === 'insert' && change.fullDocument) {
            const doc = change.fullDocument;
            
            // Resolve username using Drizzle
            const [user] = await db.select({ username: User.username }).from(User).where(eq(User.id, doc.user_id));

            const event: ChatEvent = {
              id: String(doc.id),
              userId: String(doc.user_id),
              username: user?.username || 'Unknown',
              message: doc.message,
              timestamp: doc.created_at ? new Date(doc.created_at) : new Date(),
            };
            
            chatEmitter.emit('message', event);
          }
        } catch (e) {
          console.error('Failed to parse chat notification:', e);
        }
      }
    });

    pgClient.on('error', (err) => {
      console.error('PG Client Chat Stream error:', err);
      pgClientInitialized = false;
      setTimeout(initChatPgClient, 5000);
    });

  } catch (error) {
    console.error('Failed to init Chat PG Client:', error);
    pgClientInitialized = false;
    setTimeout(initChatPgClient, 5000);
  }
}

export function onChatMessage(callback: (event: ChatEvent) => void): () => void {
  initChatPgClient();
  chatEmitter.on('message', callback);
  return () => chatEmitter.off('message', callback);
}
