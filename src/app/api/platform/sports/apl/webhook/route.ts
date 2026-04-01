import { NextResponse } from 'next/server';
import { aplEmitter } from '@/lib/sse/apl-emitter';

export async function POST(request: Request) {
  try {
    // Verify Bearer token for security (required in production)
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;

    if (expectedToken && (!authHeader || !authHeader.startsWith('Bearer '))) {
      console.warn('[APL Webhook] Missing or invalid Authorization header');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (expectedToken) {
      const token = authHeader!.slice(7); // Remove "Bearer " prefix
      if (token !== expectedToken) {
        console.warn('[APL Webhook] Invalid Bearer token');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

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
