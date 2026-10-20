import { EventEmitter } from 'events';

// Global symbol to ensure singleton EventEmitter across Next.js API routes in development and production
const GLOBAL_AUDIT_EMITTER_KEY = Symbol.for('nexora.audit.emitter');

type GlobalWithAuditEmitter = typeof globalThis & {
  [GLOBAL_AUDIT_EMITTER_KEY]?: EventEmitter;
};

const globalObj = globalThis as GlobalWithAuditEmitter;

if (!globalObj[GLOBAL_AUDIT_EMITTER_KEY]) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(500);
  globalObj[GLOBAL_AUDIT_EMITTER_KEY] = emitter;
}

export const auditEmitter = globalObj[GLOBAL_AUDIT_EMITTER_KEY]!;

export function broadcastAuditEvent(eventType: string, payload: any) {
  try {
    auditEmitter.emit('audit_event', {
      eventType,
      payload,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[AuditSSE] Failed to broadcast audit event:', err);
  }
}
