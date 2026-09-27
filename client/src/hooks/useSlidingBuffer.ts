import { useState, useCallback, useRef } from 'react';
import api from '../api/client';

export interface BufferedQuestion {
  id: string;
  subject: string;
  chapter: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
  options?: { id: string; text: string }[];
  marks: number;
}

export const INITIAL_BUFFER_QUESTIONS: BufferedQuestion[] = [
  {
    id: 'q-math-01',
    subject: 'Mathematics',
    chapter: 'Definite Integration',
    text: 'Evaluate the definite integral: $$\\int_0^{\\pi/2} \\sin^2(x) \\cos^2(x) \\, dx$$',
    type: 'SINGLE_CHOICE',
    options: [
      { id: 'A', text: '$\\frac{\\pi}{16}$' },
      { id: 'B', text: '$\\frac{\\pi}{8}$' },
      { id: 'C', text: '$\\frac{\\pi}{32}$' },
      { id: 'D', text: '$\\frac{\\pi}{4}$' },
    ],
    marks: 4,
  },
  {
    id: 'q-phys-02',
    subject: 'Physics',
    chapter: 'Modern Physics',
    text: 'According to Heisenberg uncertainty principle: $$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$$ Calculate minimum momentum uncertainty for electron localized to $10^{-10}\\,\\text{m}$.',
    type: 'SINGLE_CHOICE',
    options: [
      { id: 'A', text: '$5.27 \\times 10^{-25}\\,\\text{kg}\\cdot\\text{m/s}$' },
      { id: 'B', text: '$1.05 \\times 10^{-24}\\,\\text{kg}\\cdot\\text{m/s}$' },
      { id: 'C', text: '$2.64 \\times 10^{-25}\\,\\text{kg}\\cdot\\text{m/s}$' },
      { id: 'D', text: '$8.31 \\times 10^{-25}\\,\\text{kg}\\cdot\\text{m/s}$' },
    ],
    marks: 4,
  },
  {
    id: 'q-chem-03',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    text: 'For an isothermal reversible expansion of an ideal gas: $$W = -nRT \\ln\\left(\\frac{V_2}{V_1}\\right)$$ What is $\\Delta U$ for this transformation?',
    type: 'SINGLE_CHOICE',
    options: [
      { id: 'A', text: '$\\Delta U = 0$' },
      { id: 'B', text: '$\\Delta U = q$' },
      { id: 'C', text: '$\\Delta U = -W$' },
      { id: 'D', text: '$\\Delta U = nC_v \\Delta T$' },
    ],
    marks: 4,
  },
  {
    id: 'q-math-04',
    subject: 'Mathematics',
    chapter: 'Linear Algebra',
    text: 'Compute the determinant: $$\\det\\begin{pmatrix} 2 & -1 \\\\ 3 & 5 \\end{pmatrix}$$',
    type: 'NUMERICAL',
    marks: 4,
  },
];

export function useSlidingBuffer(initialQuestions: BufferedQuestion[] = INITIAL_BUFFER_QUESTIONS) {
  const [buffer, setBuffer] = useState<BufferedQuestion[]>(initialQuestions);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [dbRequestsCount, setDbRequestsCount] = useState(0);
  const [lastPrefetchStatus, setLastPrefetchStatus] = useState<string>(
    initialQuestions.length >= 4
      ? 'Optimal buffer staged (>= 4 questions). Zero DB queries needed.'
      : 'Buffer below threshold.'
  );

  const bufferRef = useRef(buffer);
  bufferRef.current = buffer;

  const prefetchQuestions = useCallback(async (count = 4) => {
    // CRITICAL REQUIREMENT: Avoid redundant Neon DB calls if buffer already contains >= 4 items
    if (bufferRef.current.length >= 4) {
      const skippedMsg = `[SLIDING_BUFFER] Staging verified: Buffer holds ${bufferRef.current.length} items (>= 4). Neon DB query avoided.`;
      setLastPrefetchStatus(skippedMsg);
      return { skipped: true, count: bufferRef.current.length };
    }

    setIsPrefetching(true);
    try {
      setDbRequestsCount((prev) => prev + 1);
      const res = await api.get(`/questions?limit=${count}`);
      const incoming = (res.data?.questions || res.data || []).slice(0, count);
      setBuffer((prev) => [...prev, ...incoming]);
      setLastPrefetchStatus(`Fetched ${incoming.length} items from Neon DB.`);
      return { skipped: false, count: incoming.length };
    } catch {
      // Fallback: refill buffer locally if offline/mock
      setBuffer((prev) => (prev.length < 4 ? INITIAL_BUFFER_QUESTIONS : prev));
      setLastPrefetchStatus('Fetched fallback buffer questions.');
      return { skipped: false, count: 4 };
    } finally {
      setIsPrefetching(false);
    }
  }, []);

  const consumeNextQuestion = useCallback((): BufferedQuestion | null => {
    if (bufferRef.current.length === 0) return null;
    const [next, ...rest] = bufferRef.current;
    setBuffer(rest);

    // If consuming dropped below 4, trigger background prefetch
    if (rest.length < 4) {
      prefetchQuestions(4);
    }
    return next;
  }, [prefetchQuestions]);

  return {
    buffer,
    bufferCount: buffer.length,
    hasSufficientBuffer: buffer.length >= 4,
    isPrefetching,
    dbRequestsCount,
    lastPrefetchStatus,
    prefetchQuestions,
    consumeNextQuestion,
  };
}

export default useSlidingBuffer;
