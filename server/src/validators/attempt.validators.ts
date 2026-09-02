import { z } from 'zod';
import { examEnvironmentEnum } from './exam.validators';

export const integrityEventTypeEnum = z.enum([
  'EXAM_STARTED',
  'EXAM_SUBMITTED',
  'EXAM_AUTO_SUBMITTED',
  'QUESTION_VIEWED',
  'ANSWER_SAVED',
  'FULLSCREEN_EXIT',
  'FULLSCREEN_ENTER',
  'WINDOW_BLUR',
  'WINDOW_FOCUS',
  'VISIBILITY_HIDDEN',
  'VISIBILITY_VISIBLE',
  'COPY_ATTEMPT',
  'PASTE_ATTEMPT',
  'CUT_ATTEMPT',
  'PRINT_ATTEMPT',
  'CONTEXT_MENU_ATTEMPT',
  'DEVTOOLS_OPEN',
  'SESSION_CONNECTED',
  'SESSION_DISCONNECTED',
  'SESSION_RECONNECTED',
  'TIME_WARNING',
  'TIME_EXPIRED',
]);

export const startAttemptSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  examEnvironment: examEnvironmentEnum.optional().default('STANDARD_BROWSER'),
  userAgent: z.string().optional(),
});

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  examQuestionId: z.string().uuid('Invalid exam question ID'),
  selectedOptions: z.array(z.number()).optional().nullable(),
  numericalAnswer: z.number().optional().nullable(),
  isMarkedForReview: z.boolean().optional().default(false),
  isVisited: z.boolean().optional().default(true),
  timeSpentSeconds: z.number().int().min(0).optional().default(0),
});

export const bulkSaveAnswersSchema = z.object({
  answers: z.array(saveAnswerSchema).min(1, 'At least one answer is required'),
});

export const submitAttemptSchema = z.object({
  isAutoSubmit: z.boolean().optional().default(false),
});

export const integrityEventSchema = z.object({
  eventType: integrityEventTypeEnum,
  details: z.any().optional(),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type BulkSaveAnswersInput = z.infer<typeof bulkSaveAnswersSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type IntegrityEventInput = z.infer<typeof integrityEventSchema>;
