import crypto from 'crypto';

export interface DispatchChannelResult {
  channel: string;
  url?: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface DispatchReport {
  totalChannels: number;
  successCount: number;
  failureCount: number;
  results: DispatchChannelResult[];
}

export type CustomChannelHandler = (
  payload: any,
  config?: Record<string, any>
) => Promise<DispatchChannelResult>;

export interface WebhookDispatcherConfig {
  discordUrl?: string;
  slackUrl?: string;
  genericUrl?: string;
  secret?: string;
  genericHeaders?: Record<string, string>;
}

/**
 * Generate HMAC-SHA256 signature for a payload.
 * Returns lowercase hex string.
 */
export function generateHmacSignature(payload: string | Record<string, any>, secret: string): string {
  if (!secret) return '';
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature safely with timing-safe equality check.
 * Accepts signature with or without 'sha256=' prefix.
 */
export function verifyHmacSignature(
  payload: string | Record<string, any>,
  signature: string | undefined | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  try {
    const rawProvided = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    const computed = generateHmacSignature(payload, secret);

    const providedBuffer = Buffer.from(rawProvided, 'hex');
    const computedBuffer = Buffer.from(computed, 'hex');

    if (providedBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuffer, computedBuffer);
  } catch {
    return false;
  }
}

/**
 * Helper to extract common alert fields from an integrity payload.
 */
export function extractAlertDetails(payload: any) {
  const { event, attemptId, data, integrityFlags, message, timestamp } = payload || {};

  const isSuspicious = Boolean(
    integrityFlags?.screenExited ||
    integrityFlags?.fullscreenExited ||
    (integrityFlags?.cheatingFlags && Object.keys(integrityFlags.cheatingFlags).length > 0)
  );

  const cheatingList =
    integrityFlags?.cheatingFlags && Object.keys(integrityFlags.cheatingFlags).length > 0
      ? Object.keys(integrityFlags.cheatingFlags).join(', ')
      : 'None';

  return {
    event: event || 'Event Triggered',
    attemptId: attemptId || 'N/A',
    deviceType: integrityFlags?.deviceType || 'unknown',
    screenExited: Boolean(integrityFlags?.screenExited),
    fullscreenExited: Boolean(integrityFlags?.fullscreenExited),
    cheatingList,
    isSuspicious,
    detailsText: message || data?.message || (data ? JSON.stringify(data) : undefined),
    timestamp: timestamp || new Date().toISOString(),
  };
}

/**
 * Format payload for Discord Webhook.
 */
export function formatDiscordPayload(payload: any) {
  const alert = extractAlertDetails(payload);

  const embedFields = [
    { name: 'Attempt ID', value: alert.attemptId !== 'N/A' ? `\`${alert.attemptId}\`` : 'N/A', inline: true },
    { name: 'Device Type', value: alert.deviceType, inline: true },
    { name: 'Screen Exited', value: alert.screenExited ? '⚠️ Yes' : '✅ No', inline: true },
    { name: 'Fullscreen Exited', value: alert.fullscreenExited ? '⚠️ Yes' : '✅ No', inline: true },
    { name: 'Cheating Flags', value: alert.cheatingList, inline: false },
  ];

  if (alert.detailsText) {
    embedFields.push({ name: 'Details', value: String(alert.detailsText), inline: false });
  }

  return {
    username: 'CBT Integrity Monitor',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
    embeds: [
      {
        title: `${alert.isSuspicious ? '🚨' : 'ℹ️'} Integrity Alert: ${alert.event}`,
        color: alert.isSuspicious ? 15158332 : 3447003,
        fields: embedFields,
        timestamp: alert.timestamp,
        footer: { text: 'CBT Anti-Cheat Realtime Proctoring' },
      },
    ],
  };
}

/**
 * Format payload for Slack Webhook (Block Kit).
 */
export function formatSlackPayload(payload: any) {
  const alert = extractAlertDetails(payload);

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${alert.isSuspicious ? '🚨' : 'ℹ️'} Integrity Alert: ${alert.event}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Attempt ID:*\n\`${alert.attemptId}\`` },
        { type: 'mrkdwn', text: `*Device:*\n${alert.deviceType}` },
        { type: 'mrkdwn', text: `*Screen Exited:*\n${alert.screenExited ? '⚠️ Yes' : '✅ No'}` },
        { type: 'mrkdwn', text: `*Fullscreen Exited:*\n${alert.fullscreenExited ? '⚠️ Yes' : '✅ No'}` },
        { type: 'mrkdwn', text: `*Cheating Flags:*\n${alert.cheatingList}` },
      ],
    },
  ];

  if (alert.detailsText) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Details:*\n${alert.detailsText}`,
      },
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `CBT Anti-Cheat Realtime Proctoring | Timestamp: ${alert.timestamp}`,
      },
    ],
  });

  return {
    text: `${alert.isSuspicious ? '🚨' : 'ℹ️'} Integrity Alert: ${alert.event} (Attempt: ${alert.attemptId})`,
    blocks,
  };
}

export class WebhookDispatcherService {
  private customChannels: Map<string, CustomChannelHandler> = new Map();

  /**
   * Register a custom webhook channel handler.
   */
  public registerChannel(name: string, handler: CustomChannelHandler): void {
    this.customChannels.set(name.toLowerCase(), handler);
  }

  /**
   * Unregister a custom webhook channel.
   */
  public unregisterChannel(name: string): boolean {
    return this.customChannels.delete(name.toLowerCase());
  }

  /**
   * List all registered custom channel names.
   */
  public getRegisteredChannels(): string[] {
    return Array.from(this.customChannels.keys());
  }

  /**
   * Load active configuration from env or explicit overrides.
   */
  public getConfig(overrides?: Partial<WebhookDispatcherConfig>): WebhookDispatcherConfig {
    let defaultHeaders: Record<string, string> = {};
    if (process.env.GENERIC_WEBHOOK_HEADERS) {
      try {
        defaultHeaders = JSON.parse(process.env.GENERIC_WEBHOOK_HEADERS);
      } catch (err) {
        console.warn('Failed to parse GENERIC_WEBHOOK_HEADERS env JSON:', err);
      }
    }

    return {
      discordUrl: overrides?.discordUrl ?? process.env.DISCORD_WEBHOOK_URL,
      slackUrl: overrides?.slackUrl ?? process.env.SLACK_WEBHOOK_URL,
      genericUrl: overrides?.genericUrl ?? process.env.GENERIC_WEBHOOK_URL,
      secret: overrides?.secret ?? process.env.WEBHOOK_SECRET,
      genericHeaders: overrides?.genericHeaders ?? defaultHeaders,
    };
  }

  /**
   * Dispatch to Discord webhook URL.
   */
  public async dispatchDiscord(url: string, payload: any): Promise<DispatchChannelResult> {
    const formattedBody = formatDiscordPayload(payload);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedBody),
      });

      if (!res.ok) {
        return {
          channel: 'discord',
          url,
          success: false,
          statusCode: res.status,
          error: `Discord webhook responded with HTTP ${res.status}: ${res.statusText}`,
        };
      }
      return { channel: 'discord', url, success: true, statusCode: res.status };
    } catch (err: any) {
      return {
        channel: 'discord',
        url,
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Dispatch to Slack webhook URL.
   */
  public async dispatchSlack(url: string, payload: any): Promise<DispatchChannelResult> {
    const formattedBody = formatSlackPayload(payload);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedBody),
      });

      if (!res.ok) {
        return {
          channel: 'slack',
          url,
          success: false,
          statusCode: res.status,
          error: `Slack webhook responded with HTTP ${res.status}: ${res.statusText}`,
        };
      }
      return { channel: 'slack', url, success: true, statusCode: res.status };
    } catch (err: any) {
      return {
        channel: 'slack',
        url,
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Dispatch to Generic HTTP endpoint with custom headers & HMAC-SHA256 signing.
   */
  public async dispatchGeneric(
    url: string,
    payload: any,
    secret?: string,
    headers?: Record<string, string>
  ): Promise<DispatchChannelResult> {
    const stringifiedBody = JSON.stringify(payload);
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': String(payload?.event || 'INTEGRITY_EVENT'),
      ...(headers || {}),
    };

    if (secret) {
      const signatureHex = generateHmacSignature(stringifiedBody, secret);
      requestHeaders['X-Signature-SHA256'] = `sha256=${signatureHex}`;
      requestHeaders['X-Hub-Signature-256'] = `sha256=${signatureHex}`;
      requestHeaders['X-Webhook-Timestamp'] = new Date().toISOString();
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: stringifiedBody,
      });

      if (!res.ok) {
        return {
          channel: 'generic',
          url,
          success: false,
          statusCode: res.status,
          error: `Generic webhook responded with HTTP ${res.status}: ${res.statusText}`,
        };
      }
      return { channel: 'generic', url, success: true, statusCode: res.status };
    } catch (err: any) {
      return {
        channel: 'generic',
        url,
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Dispatch payload to all configured channels in parallel with full error isolation.
   */
  public async dispatchAll(
    payload: any,
    configOverrides?: Partial<WebhookDispatcherConfig>
  ): Promise<DispatchReport> {
    const config = this.getConfig(configOverrides);
    const dispatchPromises: Promise<DispatchChannelResult>[] = [];

    if (config.discordUrl) {
      dispatchPromises.push(this.dispatchDiscord(config.discordUrl, payload));
    }

    if (config.slackUrl) {
      dispatchPromises.push(this.dispatchSlack(config.slackUrl, payload));
    }

    if (config.genericUrl) {
      dispatchPromises.push(
        this.dispatchGeneric(config.genericUrl, payload, config.secret, config.genericHeaders)
      );
    }

    for (const [channelName, handler] of this.customChannels.entries()) {
      dispatchPromises.push(
        (async () => {
          try {
            const res = await handler(payload, config);
            return {
              channel: channelName,
              success: res.success,
              statusCode: res.statusCode,
              error: res.error,
            };
          } catch (err: any) {
            return {
              channel: channelName,
              success: false,
              error: err?.message || String(err),
            };
          }
        })()
      );
    }

    if (dispatchPromises.length === 0) {
      return {
        totalChannels: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
      };
    }

    const settledResults = await Promise.allSettled(dispatchPromises);
    const results: DispatchChannelResult[] = settledResults.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        channel: `unknown_${i}`,
        success: false,
        error: r.reason?.message || String(r.reason),
      };
    });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      totalChannels: results.length,
      successCount,
      failureCount,
      results,
    };
  }
}

export const webhookDispatcher = new WebhookDispatcherService();
