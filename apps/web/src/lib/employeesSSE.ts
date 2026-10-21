import { EventEmitter } from 'events';

// Global symbol to ensure singleton EventEmitter across Next.js API routes in development and production
const GLOBAL_EMPLOYEES_EMITTER_KEY = Symbol.for('nexora.employees.emitter');

type GlobalWithEmployeesEmitter = typeof globalThis & {
  [GLOBAL_EMPLOYEES_EMITTER_KEY]?: EventEmitter;
};

const globalObj = globalThis as GlobalWithEmployeesEmitter;

if (!globalObj[GLOBAL_EMPLOYEES_EMITTER_KEY]) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(500);
  globalObj[GLOBAL_EMPLOYEES_EMITTER_KEY] = emitter;
}

export const employeesEmitter = globalObj[GLOBAL_EMPLOYEES_EMITTER_KEY]!;

export type EmployeeEventType =
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_DELETED'
  | 'COMPANY_UPDATED'
  | 'ATTENDANCE_RECORDED'
  | 'ANNOUNCEMENT_PUBLISHED';

export function broadcastEmployeeEvent(eventType: EmployeeEventType, payload: any) {
  try {
    employeesEmitter.emit('employee_event', {
      eventType,
      payload,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[EmployeeSSE] Failed to broadcast employee event:', err);
  }
}
