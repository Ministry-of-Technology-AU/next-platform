/**
 * Global in-memory event emitter for SSE broadcasting.
 * 
 * Architecture:
 *   Strapi Webhook → POST /api/.../webhook → emitter.emit()
 *   Client EventSource → GET /api/.../sse → emitter.on() → stream
 *
 * This singleton survives across API route invocations in the same
 * Node.js process (dev server or production), enabling real-time
 * push from webhook receivers to SSE stream handlers.
 */

import { EventEmitter } from 'events';

// Use a global variable to persist the emitter across hot-reloads in dev
const globalForSSE = globalThis as typeof globalThis & {
  __abaSSE?: EventEmitter;
};

if (!globalForSSE.__abaSSE) {
  globalForSSE.__abaSSE = new EventEmitter();
  globalForSSE.__abaSSE.setMaxListeners(1000); // support many concurrent viewers
}

export const abaEmitter = globalForSSE.__abaSSE;
