import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export interface ChatEvent {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

const chatEmitter = new EventEmitter();
chatEmitter.setMaxListeners(500);

let chatChangeStreamInitialized = false;

async function initChatChangeStream() {
  if (chatChangeStreamInitialized) return;
  
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) return;

    chatChangeStreamInitialized = true;

    const collection = db.collection('chatmessages');
    const stream = collection.watch([{ $match: { operationType: 'insert' } }], { fullDocument: 'updateLookup' });

    stream.on('change', async (change: any) => {
      if (change.fullDocument) {
        const doc = change.fullDocument;
        const user = await mongoose.model('User').findById(doc.userId).select('username').lean();

        const event: ChatEvent = {
          id: String(doc._id),
          userId: String(doc.userId),
          username: user?.username || 'Unknown',
          message: doc.message,
          timestamp: doc.createdAt,
        };
        
        chatEmitter.emit('message', event);
      }
    });

    stream.on('error', () => {
      chatChangeStreamInitialized = false;
      setTimeout(initChatChangeStream, 5000);
    });

  } catch (error) {
    console.error('Failed to init Chat Change Stream:', error);
    chatChangeStreamInitialized = false;
  }
}

export function onChatMessage(callback: (event: ChatEvent) => void): () => void {
  initChatChangeStream();
  chatEmitter.on('message', callback);
  return () => chatEmitter.off('message', callback);
}
