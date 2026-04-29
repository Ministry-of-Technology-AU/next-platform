import { NextResponse } from 'next/server';
import { abaEmitter } from '@/lib/sse/event-emitter';

export async function POST(request: Request) {
  try {
    // Verify Bearer token for security (required in production)
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;

    if (expectedToken && (!authHeader || !authHeader.startsWith('Bearer '))) {
      console.warn('[ABA Webhook] Missing or invalid Authorization header');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (expectedToken) {
      const token = authHeader!.slice(7); // Remove "Bearer " prefix
      if (token !== expectedToken) {
        console.warn('[ABA Webhook] Invalid Bearer token');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

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
