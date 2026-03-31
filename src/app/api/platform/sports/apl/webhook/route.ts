import { aplEmitter } from '@/lib/sse/apl-emitter';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Verify the webhook comes from Strapi (optional: add bearer token validation)
    // For now, we'll just emit the update to all connected clients
    aplEmitter.emit('apl-update', {
      event: payload.event || 'update',
      model: payload.model || 'apl-participants',
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, message: 'Update broadcast to all clients' });
  } catch (error) {
    console.error('[APL Webhook] Error:', error);
    return Response.json({ success: false, error: 'Failed to process webhook' }, { status: 400 });
  }
}
