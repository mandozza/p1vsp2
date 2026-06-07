import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export interface ChatEvent {
  id: string;
  machineId?: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  createdAt: Date;
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

    const collection = db.collection('chatmessages');
    
    // Watch for new chat messages
    const stream = collection.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    stream.on('change', (change: any) => {
      if (change.operationType === 'insert' && change.fullDocument) {
        const doc = change.fullDocument;
        const event: ChatEvent = {
          id: String(doc._id),
          machineId: doc.machineId ? String(doc.machineId) : undefined,
          userId: doc.userId,
          userName: doc.userName,
          userColor: doc.userColor,
          text: doc.text,
          createdAt: doc.createdAt || new Date(),
        };
        emitter.emit('chat_message', event);
      }
    });

    stream.on('error', () => {
      changeStreamInitialized = false;
      setTimeout(initChangeStream, 5000);
    });

  } catch (error) {
    console.error('Failed to init Chat Change Stream:', error);
    changeStreamInitialized = false;
  }
}

export function onChatMessage(callback: (event: ChatEvent) => void): () => void {
  initChangeStream();
  emitter.on('chat_message', callback);
  return () => emitter.off('chat_message', callback);
}
