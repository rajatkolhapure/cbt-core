import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';
import api from '../api/client';
import MathRenderer from './common/MathRenderer';

export interface AssignedTestItem {
  id: string;
  name: string;
  track: string;
  duration: string;
  questionsCount: number;
  format: string;
  formula: string;
  status?: string;
  bookmarked?: boolean;
}

interface AssignedTestsProps {
  /** Pre-loaded list of non-completed assigned tests */
  tests: AssignedTestItem[];
  /** Callback when the list changes (e.g. after marking complete) */
  onListChange?: (updated: AssignedTestItem[]) => void;
  isLoading?: boolean;
}

/**
 * AssignedTests
 *
 * Renders the assigned-test docket cards with a "Resume Test" CTA.
 * - Hides cards for completed tests immediately upon completion.
 * - Calls POST /api/tests/complete when a test submission is detected.
 * - Returns 400 toast "Test already completed" if attempted on a done test.
 */
const AssignedTests: React.FC<AssignedTestsProps> = ({ tests, onListChange, isLoading = false }) => {
  const navigate = useNavigate();
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /**
   * Handles "Resume Test" click:
   * 1. Calls GET /api/tests/resume-check/:examId to verify resumability.
   * 2. If 400 → shows "Test already completed" toast.
   * 3. If OK → navigates to /exam/:examId.
   */
  const handleResumeTest = useCallback(
    async (test: AssignedTestItem) => {
      setResumingId(test.id);
      try {
        await api.get(`/tests/resume-check/${test.id}`);
        navigate(`/exam/${test.id}`);
      } catch (err: any) {
        const status = err?.response?.status;
        const message = err?.response?.data?.error || 'Something went wrong';

        if (status === 400) {
          // Test already completed — update list client-side to hide the card
          showToast('Test already completed', 'error');
          if (onListChange) {
            const updated = tests.filter((t) => t.id !== test.id);
            onListChange(updated);
          }
        } else if (status === 401) {
          showToast('Session expired. Please log in again.', 'error');
        } else {
          showToast(message, 'error');
        }
      } finally {
        setResumingId(null);
      }
    },
    [navigate, tests, onListChange]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-[#263044] bg-[#151C2C] p-5 h-28 flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="h-3 w-32 rounded bg-[#263044]" />
              <div className="h-5 w-56 rounded bg-[#263044]" />
              <div className="h-3 w-44 rounded bg-[#263044]" />
            </div>
            <div className="h-10 w-32 rounded-xl bg-[#263044]" />
          </div>
        ))}
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="rounded-2xl border border-[#263044] bg-[#151C2C] p-12 text-center">
        <FileText size={36} className="mx-auto text-[#8791A5] mb-3" />
        <h3 className="text-lg font-bold text-white">0 Assigned Tests</h3>
        <p className="text-xs text-[#8791A5] mt-1">
          No examination dockets are currently assigned to your candidate profile.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 font-mono text-xs shadow-2xl transition-all ${
            toast.type === 'error'
              ? 'border-[#EF4444]/40 bg-[#1A0A0A] text-[#EF4444]'
              : 'border-[#38BDF8]/40 bg-[#0A1A25] text-[#38BDF8]'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <span>{toast.message}</span>
        </div>
      )}

      {tests.map((test, index) => (
        <article
          key={test.id}
          className={`flex flex-col gap-5 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg ${
            index === 0 ? 'border-l-4 border-l-[#C85A32]' : ''
          }`}
        >
          {/* Test meta info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#C85A32]">
              <span>Paper 0{index + 1}</span>
              <span className="text-[#526078]">/</span>
              <span>{test.track}</span>
              {test.bookmarked && (
                <>
                  <span className="text-[#526078]">/</span>
                  <span className="text-[#D4A373]">Bookmarked</span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#F3F4F6]">{test.name}</h2>
            <div className="text-xs text-[#D4A373] font-mono py-1 overflow-visible break-words">
              <MathRenderer content={test.formula} />
            </div>
            <div className="flex flex-wrap gap-2.5 font-mono text-[9px] uppercase tracking-wider text-[#8791A5]">
              <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                [FORMAT: {test.format}]
              </span>
              <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                [ENCRYPTION: SECURE]
              </span>
              <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                [DURATION: {test.duration}]
              </span>
              <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                [QUESTIONS: {test.questionsCount}]
              </span>
            </div>
          </div>

          {/* Resume Test CTA */}
          <button
            onClick={() => handleResumeTest(test)}
            disabled={resumingId === test.id}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C85A32] hover:bg-[#B54E29] text-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.16em] transition active:translate-y-[1px] shadow-md focus:outline-none focus:ring-2 focus:ring-[#C85A32]/60 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={`Resume test: ${test.name}`}
          >
            {resumingId === test.id ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <span>Resume Test</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </article>
      ))}
    </div>
  );
};

export default AssignedTests;
