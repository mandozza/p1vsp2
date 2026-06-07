import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export interface QueueEvent {
  machineId: string;
  type: 'UPDATE' | 'REFRESH';
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

    const collection = db.collection('queuesessions');
    
    // Watch for any changes to the queue sessions
    const stream = collection.watch(
      [{ $match: { operationType: { $in: ['insert', 'update', 'replace', 'delete'] } } }],
      { fullDocument: 'updateLookup' }
    );

    stream.on('change', (change: any) => {
      const doc = change.fullDocument;
      if (doc && doc.machineId) {
        const event: QueueEvent = {
          machineId: String(doc.machineId),
          type: 'UPDATE'
        };
        emitter.emit('queue_change', event);
      } else if (change.operationType === 'delete') {
        // For deletes, we don't always have the fullDocument depending on config
        // So we broadcast a general refresh for that machine if possible, 
        // or just emit a global refresh if we can't determine the machineId.
        emitter.emit('queue_change', { type: 'REFRESH' });
      }
    });

    stream.on('error', () => {
      changeStreamInitialized = false;
      // Re-init after delay
      setTimeout(initChangeStream, 5000);
    });

  } catch (error) {
    console.error('Failed to init MongoDB Change Stream:', error);
    changeStreamInitialized = false;
  }
}

/**
 * Subscribes to queue changes.
 * Returns an unsubscribe function.
 */
export function onQueueChange(callback: (event: QueueEvent) => void): () => void {
  initChangeStream();
  emitter.on('queue_change', callback);
  return () => emitter.off('queue_change', callback);
}
