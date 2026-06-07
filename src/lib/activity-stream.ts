import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  machineId: string;
  machineName: string;
  type: 'WIN';
  timestamp: Date;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(500);

let changeStreamInitialized = false;

async function initChangeStream() {
  if (changeStreamInitialized) return;
  
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) return;

    changeStreamInitialized = true;

    const collection = db.collection('prizeclaims');
    
    // Watch for new wins
    const stream = collection.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    stream.on('change', async (change: any) => {
      if (change.operationType === 'insert' && change.fullDocument) {
        const doc = change.fullDocument;
        
        // Resolve names for the ticker
        // We do this here once to avoid every connected client doing it
        const [user, product, machine] = await Promise.all([
          mongoose.model('User').findById(doc.userId).select('name').lean(),
          mongoose.model('Product').findById(doc.productId).select('name').lean(),
          mongoose.model('Machine').findById(doc.machineId).select('name').lean(),
        ]);

        const event: ActivityEvent = {
          id: String(doc._id),
          userId: String(doc.userId),
          userName: user?.name || 'A player',
          productId: String(doc.productId),
          productName: product?.name || 'a prize',
          machineId: String(doc.machineId),
          machineName: machine?.name || 'a machine',
          type: 'WIN',
          timestamp: doc.wonAt || new Date(),
        };
        
        emitter.emit('activity', event);
      }
    });

    stream.on('error', () => {
      changeStreamInitialized = false;
      setTimeout(initChangeStream, 5000);
    });

  } catch (error) {
    console.error('Failed to init Activity Change Stream:', error);
    changeStreamInitialized = false;
  }
}

export function onActivity(callback: (event: ActivityEvent) => void): () => void {
  initChangeStream();
  emitter.on('activity', callback);
  return () => emitter.off('activity', callback);
}
