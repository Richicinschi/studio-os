// Event-stream helpers that poll for a condition instead of sleeping.
// Each helper re-reads the thread's events on every pass, resolves as soon
// as the condition holds, and rejects with a descriptive message at the deadline.

import type { ThreadManager } from '~/threads/thread-manager';
import type { LaceEvent, LaceEventType } from '~/threads/types';

const POLL_INTERVAL_MS = 10;

/**
 * Generic poller. `probe` returns a value when ready, or undefined to keep waiting.
 * `onTimeout` builds the error text, so each caller can say what it was awaiting.
 */
function pollUntil<T>(
  probe: () => T | undefined,
  onTimeout: () => string,
  timeoutMs: number
): Promise<T> {
  const deadline = Date.now() + timeoutMs;

  return new Promise<T>((resolve, reject) => {
    const tick = (): void => {
      const found = probe();
      if (found !== undefined) {
        resolve(found);
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(onTimeout()));
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    tick();
  });
}

/**
 * Resolve with the first event of the given type found on the thread.
 *
 *   await waitForEvent(threadManager, workerThreadId, 'TOOL_RESULT');
 */
export function waitForEvent(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return pollUntil(
    () => threadManager.getEvents(threadId).find((ev) => ev.type === eventType),
    () => `Timeout waiting for ${eventType} event after ${timeoutMs}ms`,
    timeoutMs
  );
}

/**
 * Resolve with every event of the given type once at least `count` exist.
 *
 *   // Two replies expected: the first answer and its follow-up.
 *   await waitForEventCount(threadManager, workerThreadId, 'AGENT_MESSAGE', 2);
 */
export function waitForEventCount(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  count: number,
  timeoutMs = 5000
): Promise<LaceEvent[]> {
  let seen = 0;
  return pollUntil(
    () => {
      const matches = threadManager
        .getEvents(threadId)
        .filter((ev) => ev.type === eventType);
      seen = matches.length;
      return seen >= count ? matches : undefined;
    },
    () =>
      `Timeout waiting for ${count} ${eventType} events after ${timeoutMs}ms (got ${seen})`,
    timeoutMs
  );
}

/**
 * Resolve with the first event for which `predicate` returns true. Use it when
 * the payload matters and the type alone is not enough. `description` is used
 * in the timeout message.
 *
 *   await waitForEventMatch(
 *     threadManager,
 *     workerThreadId,
 *     (ev) => ev.type === 'TOOL_RESULT' && ev.data.id === 'call_42',
 *     'TOOL_RESULT with id=call_42'
 *   );
 */
export function waitForEventMatch(
  threadManager: ThreadManager,
  threadId: string,
  predicate: (event: LaceEvent) => boolean,
  description: string,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return pollUntil(
    () => threadManager.getEvents(threadId).find(predicate),
    () => `Timeout waiting for ${description} after ${timeoutMs}ms`,
    timeoutMs
  );
}

// Typical rewrite of a flaky test:
//
//   Before: sleeps and hopes
//     const reply = worker.send('run the batch');
//     await new Promise((r) => setTimeout(r, 250));   // hope 3 jobs started
//     worker.cancel();
//     await reply;
//     await new Promise((r) => setTimeout(r, 40));    // hope results landed
//     expect(results.length).toBe(3);                 // fails now and then
//
//   After: waits for what it needs
//     const reply = worker.send('run the batch');
//     await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 3);
//     worker.cancel();
//     await reply;
//     await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 3);
//     expect(results.length).toBe(3);                 // stable
