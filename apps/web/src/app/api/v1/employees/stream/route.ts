import { employeesEmitter } from '@/lib/employeesSSE';
import { approvalsEmitter } from '@/lib/approvalsSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial handshake event so the client knows it is connected
      const connectPayload = JSON.stringify({ status: 'connected', time: Date.now() });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${connectPayload}\n\n`));

      // 2. Event listener for employee, company, and approval events
      const onEvent = ({ eventType, payload, timestamp }: any) => {
        try {
          const message = `event: ${eventType}\ndata: ${JSON.stringify({ payload, timestamp })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          // If controller is closed, listener will be removed on abort
        }
      };

      employeesEmitter.on('employee_event', onEvent);
      approvalsEmitter.on('approval_event', onEvent);

      // 3. Heartbeat ping every 25 seconds to keep connection alive across proxies/firewalls
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      // 4. Clean up listener when client disconnects
      request.signal.addEventListener('abort', () => {
        employeesEmitter.off('employee_event', onEvent);
        approvalsEmitter.off('approval_event', onEvent);
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
