import { getIntegrityFlags, resetIntegrityFlags } from '../client/integrityTracker';
import {
  webhookPayloadSchema,
  type WebhookPayload,
  type IntegrityFlags,
} from '../types/webhookPayload';

export type { WebhookPayload, IntegrityFlags };

export interface DispatchWebhookOptions extends RequestInit {
  secret?: string;
  customHeaders?: Record<string, string>;
}

export interface QueuedWebhookItem {
  id: string;
  url: string;
  payload: Record<string, any>;
  options?: DispatchWebhookOptions;
  createdAt: number;
}

let offlineWebhookQueue: QueuedWebhookItem[] = [];

/**
 * Check whether the client environment is currently offline.
 */
export function isOffline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return !navigator.onLine;
  }
  return false;
}

/**
 * Get a copy of currently queued offline webhooks.
 */
export function getWebhookQueue(): QueuedWebhookItem[] {
  return [...offlineWebhookQueue];
}

/**
 * Clear the offline webhook queue.
 */
export function clearWebhookQueue(): void {
  offlineWebhookQueue = [];
}

/**
 * Synchronous HMAC-SHA256 signature generator.
 * Uses Node crypto when running in Node.js environments.
 */
export function generateHmacSignature(
  payload: string | Record<string, any>,
  secret: string
): string {
  if (!secret) return '';
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  try {
    const req =
      (globalThis as any).require ||
      (typeof window === 'undefined' ? (globalThis as any).process?.mainModule?.require : null);
    const nodeCrypto = req ? req('crypto') : null;
    if (nodeCrypto?.createHmac) {
      return nodeCrypto.createHmac('sha256', secret).update(bodyString).digest('hex');
    }
  } catch {
    // browser environment
  }
  return '';
}

/**
 * Asynchronous HMAC-SHA256 signature generator using Web Crypto API.
 * Works natively in both modern browsers and modern Node.js runtimes.
 */
export async function computeHmacSignature(
  payload: string | Record<string, any>,
  secret: string
): Promise<string> {
  if (!secret) return '';
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    try {
      const enc = new TextEncoder();
      const key = await globalThis.crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(bodyString));
      return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // fallback
    }
  }

  return generateHmacSignature(bodyString, secret);
}

/**
 * Verify HMAC-SHA256 signature with timing-safe comparison.
 */
export function verifyHmacSignature(
  payload: string | Record<string, any>,
  signature: string | undefined | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const rawProvided = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  const computed = generateHmacSignature(payload, secret);
  if (!computed || rawProvided.length !== computed.length) return false;

  try {
    const req =
      (globalThis as any).require ||
      (typeof window === 'undefined' ? (globalThis as any).process?.mainModule?.require : null);
    const nodeCrypto = req ? req('crypto') : null;
    const buf = (globalThis as any).Buffer;
    if (nodeCrypto?.timingSafeEqual && buf) {
      return nodeCrypto.timingSafeEqual(
        buf.from(rawProvided, 'hex'),
        buf.from(computed, 'hex')
      );
    }
  } catch {
    // fallback
  }

  let mismatch = 0;
  for (let i = 0; i < rawProvided.length; i++) {
    mismatch |= rawProvided.charCodeAt(i) ^ computed.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Build the augmented webhook payload containing integrityFlags.
 * Validates with Zod schema and omits empty cheatingFlags.
 */
export function buildWebhookPayload<T extends Record<string, any>>(
  payload: T
): T & { integrityFlags: IntegrityFlags } {
  const flags = getIntegrityFlags();

  // Edge cases: ensure deviceType is non-empty string, omit cheatingFlags if empty
  const cleanFlags: IntegrityFlags = {
    screenExited: Boolean(flags.screenExited),
    fullscreenExited: Boolean(flags.fullscreenExited),
    deviceType: flags.deviceType && flags.deviceType.trim() !== '' ? flags.deviceType : 'unknown',
  };

  if (flags.cheatingFlags && Object.keys(flags.cheatingFlags).length > 0) {
    cleanFlags.cheatingFlags = { ...flags.cheatingFlags };
  }

  const extendedPayload = {
    ...payload,
    integrityFlags: cleanFlags,
  };

  // Validate augmented payload against schema
  webhookPayloadSchema.parse(extendedPayload);

  return extendedPayload;
}

/**
 * Dispatch a webhook request to the specified URL with augmented integrity flags.
 * Supports HMAC signing, custom headers, offline queuing, and automatic queue flush upon reconnect.
 */
export async function dispatchWebhook(
  url: string,
  payload: Record<string, any> = {},
  options?: DispatchWebhookOptions
): Promise<Response | { queued: boolean; offline: boolean; id: string }> {
  // If client is offline, queue the webhook and preserve flags
  if (isOffline()) {
    const queueItem: QueuedWebhookItem = {
      id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      url,
      payload,
      options,
      createdAt: Date.now(),
    };
    offlineWebhookQueue.push(queueItem);
    return { queued: true, offline: true, id: queueItem.id };
  }

  const augmentedPayload = buildWebhookPayload(payload);
  const serializedBody = JSON.stringify(augmentedPayload);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.customHeaders || {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (options?.secret) {
    const signatureHex = await computeHmacSignature(serializedBody, options.secret);
    if (signatureHex) {
      requestHeaders['X-Signature-SHA256'] = `sha256=${signatureHex}`;
      requestHeaders['X-Hub-Signature-256'] = `sha256=${signatureHex}`;
      requestHeaders['X-Webhook-Timestamp'] = new Date().toISOString();
    }
  }

  try {
    const response = await fetch(url, {
      method: options?.method || 'POST',
      headers: requestHeaders,
      body: serializedBody,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status} ${response.statusText}`);
    }

    // Reset flags only after successful webhook transmission
    resetIntegrityFlags();

    return response;
  } catch (error) {
    // If a network error occurs while attempting to send, queue the webhook
    const queueItem: QueuedWebhookItem = {
      id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      url,
      payload,
      options,
      createdAt: Date.now(),
    };
    offlineWebhookQueue.push(queueItem);
    throw error;
  }
}

/**
 * Flush and retry sending all queued offline webhooks.
 */
export async function flushWebhookQueue(): Promise<any[]> {
  if (offlineWebhookQueue.length === 0 || isOffline()) {
    return [];
  }

  const itemsToProcess = [...offlineWebhookQueue];
  offlineWebhookQueue = [];
  const results: any[] = [];

  for (const item of itemsToProcess) {
    try {
      const augmentedPayload = buildWebhookPayload(item.payload);
      const serializedBody = JSON.stringify(augmentedPayload);
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(item.options?.customHeaders || {}),
        ...((item.options?.headers as Record<string, string>) || {}),
      };

      if (item.options?.secret) {
        const signatureHex = await computeHmacSignature(serializedBody, item.options.secret);
        if (signatureHex) {
          requestHeaders['X-Signature-SHA256'] = `sha256=${signatureHex}`;
          requestHeaders['X-Hub-Signature-256'] = `sha256=${signatureHex}`;
          requestHeaders['X-Webhook-Timestamp'] = new Date().toISOString();
        }
      }

      const res = await fetch(item.url, {
        method: item.options?.method || 'POST',
        headers: requestHeaders,
        body: serializedBody,
        ...item.options,
      });

      if (!res.ok) {
        // Re-queue if server returned error
        offlineWebhookQueue.push(item);
      } else {
        resetIntegrityFlags();
        results.push(res);
      }
    } catch {
      // Re-queue on network error
      offlineWebhookQueue.push(item);
    }
  }

  return results;
}

// Listen for network coming back online to flush queued requests
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', () => {
    flushWebhookQueue().catch((err) => {
      console.warn('Failed to flush offline webhook queue:', err);
    });
  });
}

export const sendWebhook = dispatchWebhook;
