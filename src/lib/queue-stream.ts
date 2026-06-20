import { EventEmitter } from 'events';
import { Client } from 'pg';

export interface QueueEvent {
  machineId?: string;
  type: 'UPDATE' | 'REFRESH';
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
    console.log('📡 Connected to PG for Queue stream notifications');

    await pgClient.query('LISTEN queue_sessions_change');

    pgClient.on('notification', (msg) => {
      if (msg.channel === 'queue_sessions_change' && msg.payload) {
        try {
          const change = JSON.parse(msg.payload);
          const doc = change.fullDocument;
          if (doc && doc.machine_id) {
            const event: QueueEvent = {
              machineId: String(doc.machine_id),
              type: 'UPDATE'
            };
            emitter.emit('queue_change', event);
          } else if (change.operationType === 'delete') {
            emitter.emit('queue_change', { type: 'REFRESH' });
          }
        } catch (e) {
          console.error('Failed to parse queue notification:', e);
        }
      }
    });

    pgClient.on('error', (err) => {
      console.error('PG Client Queue Stream error:', err);
      pgClientInitialized = false;
      setTimeout(initPgClient, 5000);
    });

  } catch (error) {
    console.error('Failed to init Queue PG Client:', error);
    pgClientInitialized = false;
    setTimeout(initPgClient, 5000);
  }
}

/**
 * Subscribes to queue changes.
 * Returns an unsubscribe function.
 */
export function onQueueChange(callback: (event: QueueEvent) => void): () => void {
  initPgClient();
  emitter.on('queue_change', callback);
  return () => emitter.off('queue_change', callback);
}
