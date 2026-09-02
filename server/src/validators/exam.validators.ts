import { z } from 'zod';

export const examEnvironmentEnum = z.enum(['STANDARD_BROWSER', 'FULLSCREEN_BROWSER', 'KIOSK_CLIENT']);

export const createExamSectionSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
  name: z.string().min(1, 'Section name is required'),
  order: z.number().int().default(0),
  questionCount: z.number().int().min(1, 'Question count must be at least 1'),
  marksPerQuestion: z.number().min(0).default(4),
  negativeMarksPerQuestion: z.number().min(0).default(1),
  allowSectionJump: z.boolean().default(true),
  questionIds: z.array(z.string().uuid()).optional(),
});

export const createExamSchema = z.object({
  title: z.string().min(1, 'Exam title is required'),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(0),
  isPublished: z.boolean().optional().default(false),
  shuffleQuestions: z.boolean().optional().default(false),
  shuffleOptions: z.boolean().optional().default(false),
  allowReview: z.boolean().optional().default(true),
  showResultImmediately: z.boolean().optional().default(true),
  integrityPolicy: z.any().optional().nullable(),
  examEnvironment: examEnvironmentEnum.optional().default('STANDARD_BROWSER'),
  scheduledStart: z.string().datetime().optional().nullable(),
  scheduledEnd: z.string().datetime().optional().nullable(),
  sections: z.array(createExamSectionSchema).optional(),
});

export const updateExamSchema = createExamSchema.partial();

export const assignExamSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1, 'At least one student ID is required'),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type AssignExamInput = z.infer<typeof assignExamSchema>;
