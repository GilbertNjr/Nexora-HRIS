'use client';

type SSECallback = (event: MessageEvent) => void;

/**
 * SharedSSEManager:
 * Singleton client-side SSE connection manager to prevent Browser HTTP/1.1 Socket Exhaustion.
 * Chrome & Edge enforce a hard limit of 6 connections per origin.
 * Instead of each component opening a new EventSource, this multiplexes all listeners
 * onto a single EventSource per endpoint per tab.
 */
class SharedSSEManager {
  private sources: Map<string, EventSource> = new Map();
  private listeners: Map<string, Map<string, Set<SSECallback>>> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private refCounts: Map<string, number> = new Map();

  subscribe(url: string, eventType: string, callback: SSECallback): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    // Cancel pending disconnect if existing
    const existingTimer = this.disconnectTimers.get(url);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.disconnectTimers.delete(url);
    }

    // 1. Register listener in memory
    if (!this.listeners.has(url)) {
      this.listeners.set(url, new Map());
    }
    const urlMap = this.listeners.get(url)!;
    if (!urlMap.has(eventType)) {
      urlMap.set(eventType, new Set());
    }
    urlMap.get(eventType)!.add(callback);

    // 2. Increment reference count
    const count = (this.refCounts.get(url) || 0) + 1;
    this.refCounts.set(url, count);

    // 3. Connect EventSource if not already connected
    this.ensureConnection(url);

    // If EventSource already exists, ensure event listener is attached
    const es = this.sources.get(url);
    if (es) {
      this.attachListener(es, url, eventType);
    }

    // 4. Return unsubscribe function
    return () => {
      const currentUrlMap = this.listeners.get(url);
      if (currentUrlMap && currentUrlMap.has(eventType)) {
        currentUrlMap.get(eventType)!.delete(callback);
      }
      const newCount = (this.refCounts.get(url) || 1) - 1;
      this.refCounts.set(url, newCount);

      if (newCount <= 0) {
        // Disconnect after grace period (5 seconds) to prevent reconnect thrashing
        const timer = setTimeout(() => {
          if ((this.refCounts.get(url) || 0) <= 0) {
            this.disconnect(url);
          }
        }, 5000);
        this.disconnectTimers.set(url, timer);
      }
    };
  }

  private ensureConnection(url: string) {
    if (this.sources.has(url)) return;

    try {
      const es = new EventSource(url);
      this.sources.set(url, es);

      es.onmessage = (event) => {
        this.dispatch(url, 'message', event);
      };

      es.onerror = () => {
        // Native EventSource automatically handles backoff and reconnect
      };

      // Attach all currently registered event types
      const urlMap = this.listeners.get(url);
      if (urlMap) {
        urlMap.forEach((_, eventType) => {
          this.attachListener(es, url, eventType);
        });
      }
    } catch (err) {
      console.warn('[SharedSSE] Error establishing connection to', url, err);
    }
  }

  private attachListener(es: EventSource, url: string, eventType: string) {
    if (eventType === 'message') return;
    try {
      es.addEventListener(eventType, (event) => {
        this.dispatch(url, eventType, event);
      });
    } catch {}
  }

  private dispatch(url: string, eventType: string, event: MessageEvent) {
    const urlMap = this.listeners.get(url);
    if (!urlMap) return;
    const callbacks = urlMap.get(eventType);
    if (!callbacks || callbacks.size === 0) return;

    callbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('[SharedSSE] Listener error:', e);
      }
    });
  }

  private disconnect(url: string) {
    const es = this.sources.get(url);
    if (es) {
      try {
        es.close();
      } catch {}
      this.sources.delete(url);
    }
    this.listeners.delete(url);
    this.refCounts.delete(url);
    this.disconnectTimers.delete(url);
  }
}

// Global window key to survive HMR and component remounts
const GLOBAL_SHARED_SSE_KEY = '__nexora_shared_sse_manager__';

function getSharedSSEManager(): SharedSSEManager {
  if (typeof window === 'undefined') {
    return new SharedSSEManager();
  }
  const win = window as any;
  if (!win[GLOBAL_SHARED_SSE_KEY]) {
    win[GLOBAL_SHARED_SSE_KEY] = new SharedSSEManager();
  }
  return win[GLOBAL_SHARED_SSE_KEY];
}

/**
 * Subscribe to a shared SSE endpoint.
 * Multiple callers across the tab for the same URL will reuse a single HTTP connection.
 */
export function subscribeSharedSSE(
  url: string,
  eventType: string,
  callback: (event: MessageEvent) => void
): () => void {
  return getSharedSSEManager().subscribe(url, eventType, callback);
}
