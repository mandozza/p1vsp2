import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      await dbConnect();
      const db = mongoose.connection.db;
      if (!db) {
        controller.close();
        return;
      }

      // 1. Initial success message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

      // 2. Watch for new notifications for this specific user
      const collection = db.collection('notifications');
      const changeStream = collection.watch([
        { 
          $match: { 
            operationType: 'insert',
            'fullDocument.userId': new mongoose.Types.ObjectId(userId)
          } 
        }
      ], { fullDocument: 'updateLookup' });

      changeStream.on('change', (change: any) => {
        if (change.fullDocument) {
          const data = JSON.stringify(change.fullDocument);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      });

      // 3. Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 25000);

      // 4. Cleanup
      return () => {
        changeStream.close();
        clearInterval(heartbeat);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
