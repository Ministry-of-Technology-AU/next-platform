import { aplEmitter } from '@/lib/sse/apl-emitter';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial heartbeat so the client knows the connection is alive
      controller.enqueue(encoder.encode(': heartbeat\n\n'));

      const onUpdate = (data: Record<string, unknown>) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Client disconnected, clean up
          aplEmitter.off('apl-update', onUpdate);
        }
      };

      // Keep-alive: send a comment every 15s to prevent proxy/browser timeouts
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15_000);

      aplEmitter.on('apl-update', onUpdate);

      // Cleanup when the client disconnects (stream is cancelled)
      // Note: This is called by the runtime when the response is aborted
      const cleanup = () => {
        aplEmitter.off('apl-update', onUpdate);
        clearInterval(keepAlive);
      };

      // Using the cancel callback of ReadableStream
      // We store cleanup so cancel() can call it
      (controller as any).__cleanup = cleanup;
    },
    cancel(controller: any) {
      controller?.__cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering if behind a reverse proxy
    },
  });
}
