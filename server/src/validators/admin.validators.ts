import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const bulkImportStudentsSchema = z.object({
  students: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      name: z.string().min(1, 'Name is required'),
      password: z.string().min(6).optional().default('student123'),
    })
  ).min(1, 'At least one student is required'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type BulkImportStudentsInput = z.infer<typeof bulkImportStudentsSchema>;
