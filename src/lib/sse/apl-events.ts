import { aplEmitter } from '@/lib/sse/apl-emitter';

export type AplEventPayload = {
  event: string;
  model: string;
  timestamp: string;
  id?: number | string;
};

const MODEL_ALIASES: Record<string, string> = {
  'apl-match': 'apl-matches',
  'apl-matches': 'apl-matches',
  'api::apl-match.apl-match': 'apl-matches',
  'apl-team': 'apl-teams',
  'apl-teams': 'apl-teams',
  'api::apl-team.apl-team': 'apl-teams',
  'apl-participant': 'apl-participants',
  'apl-participants': 'apl-participants',
  'api::apl-participant.apl-participant': 'apl-participants',
};

function normalizeModel(model: unknown): string {
  if (typeof model !== 'string' || model.trim() === '') {
    return 'apl-matches';
  }

  const normalized = model.trim().toLowerCase();
  return MODEL_ALIASES[normalized] || normalized;
}

function normalizeEventName(eventName: unknown): string {
  if (typeof eventName !== 'string' || eventName.trim() === '') {
    return 'update';
  }

  const normalized = eventName.trim().toLowerCase();
  if (normalized === 'create') return 'entry.create';
  if (normalized === 'update') return 'entry.update';
  if (normalized === 'delete') return 'entry.delete';
  return normalized;
}

export function normalizeAplEventPayload(payload: unknown): AplEventPayload {
  const body = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};

  const idCandidate = body.id;
  const id =
    typeof idCandidate === 'string' || typeof idCandidate === 'number'
      ? idCandidate
      : undefined;

  return {
    event: normalizeEventName(body.event),
    model: normalizeModel(body.model),
    timestamp: new Date().toISOString(),
    ...(id !== undefined ? { id } : {}),
  };
}

export function emitAplUpdate(payload: unknown): AplEventPayload {
  const event = normalizeAplEventPayload(payload);
  aplEmitter.emit('apl-update', event);
  return event;
}
