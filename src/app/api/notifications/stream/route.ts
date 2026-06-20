import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Client } from 'pg';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const userId = session.user.id;
  const encoder = new TextEncoder();
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/p1vsp2';

  const pgClient = new Client({ connectionString });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await pgClient.connect();
        
        // 1. Initial success message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

        // 2. Watch for new notifications for this specific user
        await pgClient.query('LISTEN notifications_change');

        pgClient.on('notification', (msg) => {
          if (msg.channel === 'notifications_change' && msg.payload) {
            try {
              const change = JSON.parse(msg.payload);
              if (change.operationType === 'insert' && change.fullDocument) {
                const doc = change.fullDocument;
                
                // Only send to the correct user
                if (String(doc.user_id) === String(userId)) {
                  // Map database fields to the expected frontend contract
                  const payloadData = {
                    _id: String(doc.id),
                    id: String(doc.id),
                    userId: String(doc.user_id),
                    type: doc.type,
                    title: doc.title,
                    message: doc.message,
                    link: doc.link || undefined,
                    isRead: doc.is_read,
                    createdAt: doc.created_at,
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payloadData)}\n\n`));
                }
              }
            } catch (e) {
              console.error('Failed to parse notifications change:', e);
            }
          }
        });

      } catch (error) {
        console.error('Failed to connect PG notifier client:', error);
        controller.close();
      }

      // 3. Heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          // Stream might be closed already
        }
      }, 25000);

      // 4. Cleanup
      return () => {
        pgClient.end().catch((err) => console.error('Error closing notifications stream pgClient:', err));
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
