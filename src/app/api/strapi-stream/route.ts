import { registerClient, removeClient } from "../../../lib/sse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (msg: string) => controller.enqueue(enc.encode(`data: ${msg}\n\n`));

      registerClient(send);
      console.log("SSE client connected");
      send("connected");

      const ping = setInterval(() => send("ping"), 30000);

      request.signal.addEventListener("abort", () => {
        clearInterval(ping);
        removeClient(send);
        console.log("SSE client disconnected");
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
