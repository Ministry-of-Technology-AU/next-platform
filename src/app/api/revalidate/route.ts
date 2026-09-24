import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { STRAPI_MODEL_TAGS } from '@/lib/cache/tags';

/**
 * Strapi webhook → drop the L2 entries for the collection that changed.
 * See .agents/blueprints/caching.md (L2, invalidation).
 *
 * Strapi setup: Settings → Webhooks → URL `<site>/api/revalidate`, header
 * `Authorization: Bearer <WEBHOOK_SECRET_TOKEN>`, events entry.create/update/delete/publish/unpublish.
 *
 * Fails closed: with no token configured, every call is rejected.
 */

function tokenMatches(header: string | null, expected: string): boolean {
  if (!header?.startsWith('Bearer ')) return false;
  const given = Buffer.from(header.slice(7));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function POST(request: Request) {
  const expected = process.env.WEBHOOK_SECRET_TOKEN;
  if (!expected || !tokenMatches(request.headers.get('Authorization'), expected)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let model: unknown;
  try {
    const payload: unknown = await request.json();
    model = payload && typeof payload === 'object' ? (payload as { model?: unknown }).model : undefined;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof model !== 'string' || model === '') {
    return NextResponse.json({ success: false, error: 'Missing model' }, { status: 400 });
  }

  const tags = STRAPI_MODEL_TAGS[model] ?? [];
  for (const tag of tags) {
    revalidateTag(tag);
  }

  platform.log(`[revalidate] ${model} → ${tags.length ? tags.join(', ') : 'no tags'}`);
  return NextResponse.json({ success: true, data: { model, tags } });
}
