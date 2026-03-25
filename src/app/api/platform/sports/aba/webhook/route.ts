import { NextResponse } from 'next/server';
import { abaEmitter } from '@/lib/sse/event-emitter';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { model, entry, event } = payload;

    console.log(`[SSE Webhook] ${event} on ${model} (ID: ${entry?.id})`);

    // Broadcast to all connected SSE clients
    abaEmitter.emit('aba-update', {
      model,          // e.g. "aba-match", "aba-participant", "aba-team"
      event,          // e.g. "entry.update", "entry.create"
      entryId: entry?.id,
      timestamp: Date.now(),
    });

    return NextResponse.json({ message: 'SSE broadcast sent' });
  } catch (error) {
    console.error('[SSE Webhook] Error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 400 });
  }
}
