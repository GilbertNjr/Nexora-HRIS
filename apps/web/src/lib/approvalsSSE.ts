import { EventEmitter } from 'events';

// Global symbol to ensure singleton EventEmitter across Next.js API routes in development and production
const GLOBAL_APPROVALS_EMITTER_KEY = Symbol.for('nexora.approvals.emitter');

type GlobalWithEmitter = typeof globalThis & {
  [GLOBAL_APPROVALS_EMITTER_KEY]?: EventEmitter;
};

const globalObj = globalThis as GlobalWithEmitter;

if (!globalObj[GLOBAL_APPROVALS_EMITTER_KEY]) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(500);
  globalObj[GLOBAL_APPROVALS_EMITTER_KEY] = emitter;
}

export const approvalsEmitter = globalObj[GLOBAL_APPROVALS_EMITTER_KEY]!;

export function broadcastApprovalEvent(eventType: string, payload: any) {
  try {
    approvalsEmitter.emit('approval_event', {
      eventType,
      payload,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[SSE] Failed to broadcast approval event:', err);
  }
}
