/**
 * Global in-memory event emitter for APL SSE broadcasting.
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
  __aplSSE?: EventEmitter;
};

if (!globalForSSE.__aplSSE) {
  globalForSSE.__aplSSE = new EventEmitter();
  globalForSSE.__aplSSE.setMaxListeners(1000); // support many concurrent viewers
}

export const aplEmitter = globalForSSE.__aplSSE;
