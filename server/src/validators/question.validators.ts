import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').toUpperCase(),
  order: z.number().int().optional().default(0),
});

export const createChapterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subjectId: z.string().uuid('Invalid subject ID'),
});

export const questionTypeEnum = z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERICAL']);
export const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const createQuestionSchema = z.object({
  type: questionTypeEnum,
  text: z.string().min(1, 'Question text is required'),
  options: z.any().optional(), // array of strings or objects [{id, text}]
  correctAnswer: z.any(), // number for single, number[] for multiple, number for numerical
  marks: z.number().min(0).default(4),
  negativeMarks: z.number().min(0).default(1),
  difficulty: difficultyEnum.default('MEDIUM'),
  explanation: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  subjectId: z.string().uuid('Invalid subject ID'),
  chapterId: z.string().uuid('Invalid chapter ID').optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const bulkImportQuestionItemSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().optional(),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERICAL', 'single_choice', 'multiple_choice', 'numerical']),
  question: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any(),
  marks: z.number().optional().default(4),
  negativeMarks: z.number().optional().default(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'easy', 'medium', 'hard']).optional().default('MEDIUM'),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const bulkImportQuestionsSchema = z.object({
  questions: z.array(bulkImportQuestionItemSchema).min(1, 'At least one question is required'),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type BulkImportQuestionsInput = z.infer<typeof bulkImportQuestionsSchema>;
