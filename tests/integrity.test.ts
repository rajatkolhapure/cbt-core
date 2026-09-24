import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getIntegrityFlags,
  resetIntegrityFlags,
  recordCheatingFlag,
  detectDeviceType,
  initDeviceType,
  handleVisibilityChange,
  handleFullscreenChange,
  setupIntegrityListeners,
  removeIntegrityListeners,
} from '../src/client/integrityTracker';
import {
  buildWebhookPayload,
  dispatchWebhook,
  flushWebhookQueue,
  clearWebhookQueue,
  getWebhookQueue,
} from '../src/server/webhooks';
import {
  integrityFlagsSchema,
  webhookPayloadSchema,
} from '../src/types/webhookPayload';

// Setup mock DOM environment on global if not present
interface MockDocument {
  hidden: boolean;
  fullscreenElement: any;
  listeners: Record<string, Function[]>;
  addEventListener(event: string, fn: Function): void;
  removeEventListener(event: string, fn: Function): void;
  dispatchEvent(event: { type: string }): void;
}

const originalGlobal = {
  document: (globalThis as any).document,
  navigator: (globalThis as any).navigator,
  window: (globalThis as any).window,
  fetch: (globalThis as any).fetch,
};

function setupMockDOM() {
  const listeners: Record<string, Function[]> = {};

  const mockDoc = {
    hidden: false,
    fullscreenElement: {},
    listeners,
    addEventListener(event: string, fn: Function) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener(event: string, fn: Function) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((f) => f !== fn);
      }
    },
    dispatchEvent(event: { type: string }) {
      if (listeners[event.type]) {
        listeners[event.type].forEach((fn) => fn(event));
      }
    },
  };

  const mockNav = {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    onLine: true,
  };

  const mockWin = {
    addEventListener: mockDoc.addEventListener,
    removeEventListener: mockDoc.removeEventListener,
    dispatchEvent: mockDoc.dispatchEvent,
  };

  Object.defineProperty(globalThis, 'document', {
    value: mockDoc,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, 'navigator', {
    value: mockNav,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, 'window', {
    value: mockWin,
    configurable: true,
    writable: true,
  });
}

function restoreDOM() {
  if (originalGlobal.document !== undefined) {
    Object.defineProperty(globalThis, 'document', {
      value: originalGlobal.document,
      configurable: true,
      writable: true,
    });
  } else {
    delete (globalThis as any).document;
  }

  if (originalGlobal.navigator !== undefined) {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalGlobal.navigator,
      configurable: true,
      writable: true,
    });
  }

  if (originalGlobal.window !== undefined) {
    Object.defineProperty(globalThis, 'window', {
      value: originalGlobal.window,
      configurable: true,
      writable: true,
    });
  } else {
    delete (globalThis as any).window;
  }

  (globalThis as any).fetch = originalGlobal.fetch;
}

describe('IntegrityTracker & Webhook Payload Integration Tests', () => {
  beforeEach(() => {
    setupMockDOM();
    setupIntegrityListeners();
    resetIntegrityFlags();
    clearWebhookQueue();
    initDeviceType();
  });

  afterEach(() => {
    removeIntegrityListeners();
    restoreDOM();
  });

  test('getIntegrityFlags returns initial clean state with deviceType and omitted empty cheatingFlags', () => {
    const flags = getIntegrityFlags();
    assert.equal(flags.screenExited, false);
    assert.equal(flags.fullscreenExited, false);
    assert.equal(flags.deviceType, 'desktop');
    assert.equal('cheatingFlags' in flags, false);
    assert.equal(flags.cheatingFlags, undefined);
  });

  test('visibilitychange mocks: sets screenExited to true when document.hidden is true', () => {
    (globalThis as any).document.hidden = true;
    (globalThis as any).document.dispatchEvent({ type: 'visibilitychange' });

    const flags = getIntegrityFlags();
    assert.equal(flags.screenExited, true);
  });

  test('fullscreenchange mocks: sets fullscreenExited to true when !document.fullscreenElement', () => {
    (globalThis as any).document.fullscreenElement = null;
    (globalThis as any).document.dispatchEvent({ type: 'fullscreenchange' });

    const flags = getIntegrityFlags();
    assert.equal(flags.fullscreenExited, true);
  });

  test('recordCheatingFlag adds arbitrary flags and getIntegrityFlags reflects them', () => {
    recordCheatingFlag('copyPaste');
    recordCheatingFlag('devToolsOpen');

    const flags = getIntegrityFlags();
    assert.ok(flags.cheatingFlags);
    assert.deepEqual(flags.cheatingFlags, {
      copyPaste: true,
      devToolsOpen: true,
    });
  });

  test('detectDeviceType correctly identifies desktop, mobile, tablet, and unknown fallback', () => {
    // Mobile
    const mobileUA =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
    assert.equal(detectDeviceType(mobileUA), 'mobile');

    // Tablet
    const tabletUA =
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
    assert.equal(detectDeviceType(tabletUA), 'tablet');

    // Desktop
    const desktopUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    assert.equal(detectDeviceType(desktopUA), 'desktop');

    // Fallbacks
    assert.equal(detectDeviceType(''), 'unknown');
    assert.equal(detectDeviceType('   '), 'unknown');
    assert.equal(detectDeviceType(undefined), 'desktop'); // Uses navigator.userAgent mock
  });

  test('buildWebhookPayload augments existing payload with integrityFlags and validates schema', () => {
    recordCheatingFlag('unauthorizedTab');
    (globalThis as any).document.hidden = true;
    handleVisibilityChange();

    const originalPayload = {
      event: 'EXAM_SUBMISSION',
      attemptId: 'att_123',
      data: { score: 100 },
    };

    const augmented = buildWebhookPayload(originalPayload);

    assert.equal(augmented.event, 'EXAM_SUBMISSION');
    assert.equal(augmented.attemptId, 'att_123');
    assert.equal(augmented.integrityFlags.screenExited, true);
    assert.equal(augmented.integrityFlags.fullscreenExited, false);
    assert.deepEqual(augmented.integrityFlags.cheatingFlags, {
      unauthorizedTab: true,
    });
    assert.equal(augmented.integrityFlags.deviceType, 'desktop');

    // Validate with Zod schemas
    const parsed = webhookPayloadSchema.parse(augmented);
    assert.ok(parsed);
    const flagsParsed = integrityFlagsSchema.parse(augmented.integrityFlags);
    assert.ok(flagsParsed);
  });

  test('omits cheatingFlags when none have been recorded', () => {
    const originalPayload = { event: 'HEARTBEAT' };
    const augmented = buildWebhookPayload(originalPayload);

    assert.equal('cheatingFlags' in augmented.integrityFlags, false);
    assert.equal(augmented.integrityFlags.cheatingFlags, undefined);

    // Schema validation passes without cheatingFlags
    assert.doesNotThrow(() => webhookPayloadSchema.parse(augmented));
  });

  test('flags reset ONLY after successful webhook dispatch', async () => {
    recordCheatingFlag('copyPaste');
    (globalThis as any).document.fullscreenElement = null;
    handleFullscreenChange();

    let capturedBody: any = null;
    (globalThis as any).fetch = async (_url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ success: true }),
      };
    };

    const response = await dispatchWebhook('https://api.test/webhook', {
      event: 'PROGRESS',
    });
    assert.ok(response);
    assert.ok(capturedBody.integrityFlags.fullscreenExited);
    assert.deepEqual(capturedBody.integrityFlags.cheatingFlags, { copyPaste: true });

    // Flags must be reset after success
    const afterSuccess = getIntegrityFlags();
    assert.equal(afterSuccess.fullscreenExited, false);
    assert.equal(afterSuccess.screenExited, false);
    assert.equal('cheatingFlags' in afterSuccess, false);
  });

  test('flags do NOT reset when webhook transmission fails', async () => {
    recordCheatingFlag('attemptedInspect');

    (globalThis as any).fetch = async () => {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
    };

    await assert.rejects(async () => {
      await dispatchWebhook('https://api.test/webhook', { event: 'PROGRESS' });
    });

    // Flags must NOT be reset
    const afterFailure = getIntegrityFlags();
    assert.ok(afterFailure.cheatingFlags?.attemptedInspect);
  });

  test('offline queuing: queues webhook when offline and sends accumulated flags upon reconnect', async () => {
    // 1. Simulate offline network
    (globalThis as any).navigator.onLine = false;

    // 2. Trigger first integrity flags while offline
    (globalThis as any).document.hidden = true;
    handleVisibilityChange();
    recordCheatingFlag('flagOffline1');

    // 3. Dispatch webhook while offline -> queued
    const dispatchRes = await dispatchWebhook('https://api.test/webhook', {
      event: 'ANSWER_SAVED',
    });

    assert.equal((dispatchRes as any).queued, true);
    assert.equal((dispatchRes as any).offline, true);
    assert.equal(getWebhookQueue().length, 1);

    // Flags must still be accumulated (not reset yet)
    let flags = getIntegrityFlags();
    assert.equal(flags.screenExited, true);
    assert.ok(flags.cheatingFlags?.flagOffline1);

    // 4. Trigger additional cheating flag while offline
    recordCheatingFlag('flagOffline2');

    // 5. Mock successful fetch for flush
    let flushedBodies: any[] = [];
    (globalThis as any).fetch = async (_url: string, init: any) => {
      flushedBodies.push(JSON.parse(init.body));
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
      };
    };

    // 6. Network re-enabled
    (globalThis as any).navigator.onLine = true;

    // 7. Flush queue
    const results = await flushWebhookQueue();
    assert.equal(results.length, 1);
    assert.equal(getWebhookQueue().length, 0);

    // Confirm the webhook was sent with the accumulated flags!
    assert.equal(flushedBodies.length, 1);
    const sentFlags = flushedBodies[0].integrityFlags;
    assert.equal(sentFlags.screenExited, true);
    assert.deepEqual(sentFlags.cheatingFlags, {
      flagOffline1: true,
      flagOffline2: true,
    });

    // Confirm flags are reset after successful flush
    const finalFlags = getIntegrityFlags();
    assert.equal(finalFlags.screenExited, false);
    assert.equal('cheatingFlags' in finalFlags, false);
  });
});
