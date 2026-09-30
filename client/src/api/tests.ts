import api from './client';

export interface AssignableTest {
  id: string;
  title: string;
  name: string;
  description?: string | null;
  duration: string;
  durationMinutes: number;
  questionsCount: number;
  totalMarks: number;
  format: string;
  track: string;
  formula: string;
  status: 'PENDING' | 'COMPLETED' | string;
  completedAt?: string | null;
}

/**
 * Fetch assignable tests from /api/tests/assignable
 * Only returns pending tests where completedAt is null and status !== 'COMPLETED'.
 */
export async function getAssignableTests(): Promise<AssignableTest[]> {
  const response = await api.get('/tests/assignable');
  const data = response.data;
  const list: AssignableTest[] = Array.isArray(data)
    ? data
    : data?.tests || data?.assignableTests || [];

  // Client-side safety filter: ensure no completed test slips through
  return list.filter((t) => {
    const isCompleted =
      (t.completedAt !== null && t.completedAt !== undefined) ||
      t.status?.toUpperCase() === 'COMPLETED';
    return !isCompleted;
  });
}

export default {
  getAssignableTests,
};
