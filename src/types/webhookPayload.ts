import { z } from 'zod';

export interface IntegrityFlags {
  screenExited: boolean;
  fullscreenExited: boolean;
  cheatingFlags?: Record<string, boolean>;
  deviceType: string;
}

export interface WebhookPayload {
  event?: string;
  eventType?: string;
  timestamp?: string | number;
  data?: Record<string, any>;
  attemptId?: string;
  userId?: string;
  integrityFlags?: IntegrityFlags;
  [key: string]: any;
}

export const integrityFlagsSchema = z.object({
  screenExited: z.boolean(),
  fullscreenExited: z.boolean(),
  cheatingFlags: z.record(z.string(), z.boolean()).optional(),
  deviceType: z.string().min(1, 'deviceType must be a non-empty string'),
});

export const webhookPayloadSchema = z.object({
  event: z.string().optional(),
  eventType: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
  data: z.record(z.string(), z.any()).optional(),
  attemptId: z.string().optional(),
  userId: z.string().optional(),
  integrityFlags: integrityFlagsSchema.optional(),
}).passthrough();

export type WebhookPayloadInput = z.infer<typeof webhookPayloadSchema>;
export type IntegrityFlagsInput = z.infer<typeof integrityFlagsSchema>;
