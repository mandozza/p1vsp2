import { onActivity } from '@/lib/activity-stream';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connection success message
      const connectedMsg = JSON.stringify({ type: 'CONNECTED', timestamp: new Date() });
      controller.enqueue(encoder.encode(`data: ${connectedMsg}\n\n`));

      // 2. Subscribe to the activity emitter
      const unsubscribe = onActivity((event) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // 3. Keep-alive heartbeat (every 25s)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 25000);

      // 4. Cleanup on close
      return () => {
        unsubscribe();
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
