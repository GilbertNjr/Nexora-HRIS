import { auditEmitter } from '@/lib/auditSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial handshake event so the client knows it is connected
      const connectPayload = JSON.stringify({ status: 'connected', time: Date.now() });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${connectPayload}\n\n`));

      // 2. Event listener for audit logs
      const onEvent = ({ eventType, payload, timestamp }: any) => {
        try {
          const message = `event: ${eventType}\ndata: ${JSON.stringify({ payload, timestamp })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          // If controller is closed, listener will be removed on abort
        }
      };

      auditEmitter.on('audit_event', onEvent);

      // 3. Heartbeat ping every 15 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Clean up listener when client disconnects
      request.signal.addEventListener('abort', () => {
        auditEmitter.off('audit_event', onEvent);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
