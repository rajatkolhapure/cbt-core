import { getIntegrityFlags, resetIntegrityFlags } from '../client/integrityTracker';
import {
  webhookPayloadSchema,
  type WebhookPayload,
  type IntegrityFlags,
} from '../types/webhookPayload';

export type { WebhookPayload, IntegrityFlags };

export interface QueuedWebhookItem {
  id: string;
  url: string;
  payload: Record<string, any>;
  options?: RequestInit;
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
 * Automatically queues payloads when offline and resets flags upon successful transmission.
 */
export async function dispatchWebhook(
  url: string,
  payload: Record<string, any> = {},
  options?: RequestInit
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

  try {
    const response = await fetch(url, {
      method: options?.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(augmentedPayload),
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
      const res = await fetch(item.url, {
        method: item.options?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(item.options?.headers || {}),
        },
        body: JSON.stringify(augmentedPayload),
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
