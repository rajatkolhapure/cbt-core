import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  webhookDispatcher,
  generateHmacSignature,
  verifyHmacSignature,
  formatDiscordPayload,
  formatSlackPayload,
} from '../server/src/services/webhookDispatcher.service';
import {
  dispatchWebhook,
  flushWebhookQueue,
  clearWebhookQueue,
  getWebhookQueue,
} from '../src/server/webhooks';
import { resetIntegrityFlags } from '../src/client/integrityTracker';

describe('WebhookDispatcher & Multi-Channel Customization Tests', () => {
  const originalFetch = (globalThis as any).fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    clearWebhookQueue();
    resetIntegrityFlags();
  });

  afterEach(() => {
    process.env = originalEnv;
    (globalThis as any).fetch = originalFetch;
    for (const ch of webhookDispatcher.getRegisteredChannels()) {
      webhookDispatcher.unregisterChannel(ch);
    }
  });

  test('HMAC-SHA256 generates signature and verifies matching and tampered payloads', () => {
    const payload = { event: 'FULLSCREEN_EXIT', attemptId: 'att_999', data: { strikes: 2 } };
    const secret = 'super-proctor-secret';

    const sig = generateHmacSignature(payload, secret);
    assert.ok(sig);
    assert.equal(typeof sig, 'string');
    assert.equal(sig.length, 64); // 256 bits = 64 hex characters

    // Verification with raw hex
    assert.equal(verifyHmacSignature(payload, sig, secret), true);

    // Verification with sha256= prefix
    assert.equal(verifyHmacSignature(payload, `sha256=${sig}`, secret), true);

    // Rejection on tampered payload
    const tamperedPayload = { ...payload, attemptId: 'att_different' };
    assert.equal(verifyHmacSignature(tamperedPayload, sig, secret), false);

    // Rejection on wrong secret
    assert.equal(verifyHmacSignature(payload, sig, 'wrong-secret'), false);

    // Rejection on missing/empty signature or secret
    assert.equal(verifyHmacSignature(payload, '', secret), false);
    assert.equal(verifyHmacSignature(payload, sig, ''), false);
  });

  test('formatDiscordPayload produces properly styled alert embed with fields and colors', () => {
    // 1. Suspicious payload (red embed)
    const suspiciousPayload = {
      event: 'FULLSCREEN_EXIT',
      attemptId: 'att_123',
      integrityFlags: {
        screenExited: true,
        fullscreenExited: true,
        deviceType: 'desktop',
        cheatingFlags: { devToolsOpen: true },
      },
      message: 'Candidate opened dev tools while outside fullscreen',
    };

    const discordSuspicious = formatDiscordPayload(suspiciousPayload);
    assert.ok(discordSuspicious.embeds?.[0]);
    assert.equal(discordSuspicious.embeds[0].color, 15158332); // Red
    assert.ok(discordSuspicious.embeds[0].title.includes('🚨'));
    assert.ok(discordSuspicious.embeds[0].fields.some((f) => f.name === 'Screen Exited' && f.value === '⚠️ Yes'));
    assert.ok(discordSuspicious.embeds[0].fields.some((f) => f.name === 'Fullscreen Exited' && f.value === '⚠️ Yes'));
    assert.ok(discordSuspicious.embeds[0].fields.some((f) => f.name === 'Cheating Flags' && f.value === 'devToolsOpen'));

    // 2. Normal payload (blue embed)
    const normalPayload = {
      event: 'EXAM_STARTED',
      attemptId: 'att_456',
      integrityFlags: {
        screenExited: false,
        fullscreenExited: false,
        deviceType: 'desktop',
      },
    };
    const discordNormal = formatDiscordPayload(normalPayload);
    assert.equal(discordNormal.embeds[0].color, 3447003); // Blue
    assert.ok(discordNormal.embeds[0].title.includes('ℹ️'));
  });

  test('formatSlackPayload produces Block Kit blocks with headers, mrkdwn fields, and context', () => {
    const payload = {
      event: 'WINDOW_BLUR',
      attemptId: 'att_789',
      integrityFlags: {
        screenExited: true,
        fullscreenExited: false,
        deviceType: 'desktop',
      },
      message: 'Candidate lost focus',
    };

    const slackPayload = formatSlackPayload(payload);
    assert.ok(slackPayload.blocks);
    assert.ok(slackPayload.blocks.length >= 3);

    const headerBlock = slackPayload.blocks.find((b) => b.type === 'header');
    assert.ok(headerBlock);
    assert.ok(headerBlock.text.text.includes('WINDOW_BLUR'));

    const sectionBlock = slackPayload.blocks.find((b) => b.type === 'section' && b.fields);
    assert.ok(sectionBlock);
    assert.ok(sectionBlock.fields.some((f: any) => f.text.includes('att_789')));

    const contextBlock = slackPayload.blocks.find((b) => b.type === 'context');
    assert.ok(contextBlock);
    assert.ok(contextBlock.elements[0].text.includes('CBT Anti-Cheat Realtime Proctoring'));
  });

  test('dispatchGeneric attaches HMAC-SHA256 headers and custom headers', async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: any = null;

    (globalThis as any).fetch = async (_url: string, init: any) => {
      capturedHeaders = init.headers;
      capturedBody = JSON.parse(init.body);
      return { ok: true, status: 200, statusText: 'OK' };
    };

    const payload = { event: 'INTEGRITY_VIOLATION', attemptId: 'att_101', data: { strike: 1 } };
    const secret = 'secret-test-key';
    const customHeaders = { Authorization: 'Bearer test-token-123' };

    const result = await webhookDispatcher.dispatchGeneric(
      'https://api.external.com/webhook',
      payload,
      secret,
      customHeaders
    );

    assert.equal(result.success, true);
    assert.equal(result.channel, 'generic');
    assert.equal(capturedHeaders['Authorization'], 'Bearer test-token-123');
    assert.equal(capturedHeaders['X-Webhook-Event'], 'INTEGRITY_VIOLATION');
    assert.ok(capturedHeaders['X-Signature-SHA256']);
    assert.ok(capturedHeaders['X-Signature-SHA256'].startsWith('sha256='));
    assert.ok(capturedHeaders['X-Webhook-Timestamp']);

    // Verify the signature on captured body
    const rawSig = capturedHeaders['X-Signature-SHA256'].slice(7);
    assert.equal(verifyHmacSignature(capturedBody, rawSig, secret), true);
  });

  test('custom channel registration allows extending webhook destinations dynamically', async () => {
    let customCalledWith: any = null;

    webhookDispatcher.registerChannel('pagerduty', async (payload) => {
      customCalledWith = payload;
      return { success: true, statusCode: 202 };
    });

    assert.ok(webhookDispatcher.getRegisteredChannels().includes('pagerduty'));

    const report = await webhookDispatcher.dispatchAll({ event: 'CRITICAL_ALERT', attemptId: 'att_911' });
    assert.equal(report.totalChannels, 1);
    assert.equal(report.successCount, 1);
    assert.equal(report.results[0].channel, 'pagerduty');
    assert.equal(report.results[0].success, true);
    assert.equal(customCalledWith.event, 'CRITICAL_ALERT');

    // Unregister channel
    webhookDispatcher.unregisterChannel('pagerduty');
    assert.equal(webhookDispatcher.getRegisteredChannels().includes('pagerduty'), false);
  });

  test('dispatchAll dispatches across multiple channels in parallel with error isolation', async () => {
    (globalThis as any).fetch = async (url: string) => {
      if (url.includes('discord')) {
        return { ok: true, status: 200, statusText: 'OK' };
      }
      if (url.includes('slack')) {
        // Simulate Slack endpoint 500 error
        return { ok: false, status: 500, statusText: 'Internal Error' };
      }
      if (url.includes('generic')) {
        return { ok: true, status: 200, statusText: 'OK' };
      }
      return { ok: true, status: 200 };
    };

    const report = await webhookDispatcher.dispatchAll(
      { event: 'PROGRESS', attemptId: 'att_multi' },
      {
        discordUrl: 'https://discord.com/api/webhooks/mock',
        slackUrl: 'https://hooks.slack.com/services/mock',
        genericUrl: 'https://api.external.com/mock',
        secret: 'hmac-key',
      }
    );

    assert.equal(report.totalChannels, 3);
    assert.equal(report.successCount, 2); // Discord + Generic succeed
    assert.equal(report.failureCount, 1); // Slack failed

    const discordRes = report.results.find((r) => r.channel === 'discord');
    const slackRes = report.results.find((r) => r.channel === 'slack');
    const genericRes = report.results.find((r) => r.channel === 'generic');

    assert.equal(discordRes?.success, true);
    assert.equal(slackRes?.success, false);
    assert.equal(slackRes?.statusCode, 500);
    assert.equal(genericRes?.success, true);
  });

  test('client dispatchWebhook supports secret option and signs outgoing request', async () => {
    let capturedHeaders: Record<string, string> = {};
    (globalThis as any).fetch = async (_url: string, init: any) => {
      capturedHeaders = init.headers;
      return { ok: true, status: 200, statusText: 'OK' };
    };

    await dispatchWebhook(
      'https://cbt.example/api/webhooks',
      { event: 'TAB_SWITCH' },
      { secret: 'client-signing-secret' }
    );

    assert.ok(capturedHeaders['X-Signature-SHA256']);
    assert.ok(capturedHeaders['X-Signature-SHA256'].startsWith('sha256='));
    assert.ok(capturedHeaders['X-Webhook-Timestamp']);
  });
});
