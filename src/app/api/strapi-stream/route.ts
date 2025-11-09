import { registerClient, removeClient } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      
      // Ensure proper SSE message formatting
      const send = (msg: string) => {
        try {
          // If it's a JSON string, verify it's valid
          if (msg !== 'ping' && msg !== 'connected') {
            JSON.parse(msg); // Validate JSON
          }
          // Always format as proper SSE message
          controller.enqueue(enc.encode(`data: ${msg}\n\n`));
        } catch (err) {
          console.error('Invalid message format:', err);
          // Don't send invalid messages
        }
      };

      registerClient(send);
      console.log("👥 SSE client connected");

      send("connected");

      // Keep connection alive with a 30-second heartbeat
      const ping = setInterval(() => {
        controller.enqueue(enc.encode(": heartbeat\n\n")); // Using a comment for heartbeat
      }, 30000);

      request.signal.addEventListener("abort", () => {
        clearInterval(ping);
        removeClient(send);
        console.log("👋 SSE client disconnected");
      });
    },
  });

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Accel-Buffering': 'no' // Disable Nginx buffering
  });

  return new Response(stream, { headers });
}
