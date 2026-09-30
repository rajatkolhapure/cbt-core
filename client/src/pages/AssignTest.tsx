import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Search,
  RotateCcw,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import api from '../api/client';
import MathRenderer from '../components/common/MathRenderer';

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

export const AssignTest: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<AssignableTest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchAssignableTests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/tests/assignable');
      const data = res.data;
      const list: AssignableTest[] = Array.isArray(data)
        ? data
        : data?.tests || data?.assignableTests || [];

      // Filter out any completed records that might have slipped through
      const pendingList = list.filter((t) => {
        const isCompleted =
          (t.completedAt !== null && t.completedAt !== undefined) ||
          t.status?.toUpperCase() === 'COMPLETED';
        return !isCompleted;
      });

      setTests(pendingList);
    } catch (err: any) {
      console.error('[AssignTest] Error fetching assignable tests:', err);
      setError(
        err?.response?.data?.error ||
          'Failed to load assignable examination dockets from server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignableTests();
  }, [fetchAssignableTests]);

  const handleSelectTest = (test: AssignableTest) => {
    // Graceful fallback guard: prevent navigation if completed
    const isCompleted =
      (test.completedAt !== null && test.completedAt !== undefined) ||
      test.status?.toUpperCase() === 'COMPLETED';

    if (isCompleted) {
      return;
    }

    navigate(`/exam/${test.id}`);
  };

  const filteredTests = tests.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.name || t.title || '').toLowerCase().includes(term) ||
      (t.track || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F3F4F6] selection:bg-[#C85A32]/30 selection:text-white px-4 py-8 sm:px-6 lg:px-12">
      {/* Soft ambient cockpit glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#C85A32]/10 via-[#38BDF8]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header section */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#263044]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C85A32]/30 bg-[#C85A32]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[.16em] text-[#E59876] mb-3">
              <span className="size-1.5 rounded-full bg-[#C85A32] inline-block animate-pulse" />
              COCKPIT DISPATCH TELEMETRY
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6]">
              Assign Examination Test
            </h1>
            <p className="text-xs text-[#8791A5] font-mono mt-1">
              Select an active pending examination docket. Completed tests are strictly filtered from selection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl border border-[#263044] bg-[#151C2C] font-mono text-xs text-[#D4A373]">
              Active Pending: <strong className="text-white">{filteredTests.length}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8791A5]" />
            <input
              type="text"
              placeholder="Search pending test by name or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#263044] bg-[#151C2C] text-xs font-mono text-[#F3F4F6] placeholder-[#64748B] focus:outline-none focus:border-[#C85A32]"
            />
          </div>
          <button
            onClick={fetchAssignableTests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#263044] bg-[#151C2C] hover:bg-[#1C263B] font-mono text-[11px] text-[#AEB6C5] transition active:translate-y-[1px]"
          >
            <RotateCcw size={13} />
            <span>Refresh Dockets</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto space-y-4">
        {/* Error notification banner */}
        {error && (
          <div className="rounded-2xl border border-[#EF4444]/40 bg-[#151C2C] p-4 text-[#EF4444] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              <span className="font-mono text-xs">{error}</span>
            </div>
            <button
              onClick={fetchAssignableTests}
              className="px-3 py-1.5 rounded-lg border border-[#EF4444]/50 font-mono text-[10px] uppercase text-white hover:bg-[#EF4444]/20"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-[#263044] bg-[#151C2C] p-5 h-36 flex flex-col justify-between"
              >
                <div className="h-4 w-40 rounded bg-[#263044]" />
                <div className="h-6 w-80 rounded bg-[#263044]" />
                <div className="h-4 w-60 rounded bg-[#263044]" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredTests.length === 0 && (
          <div className="rounded-2xl border border-[#263044] bg-[#151C2C] p-12 text-center">
            <FileText size={38} className="mx-auto text-[#8791A5] mb-3" />
            <h3 className="text-lg font-bold text-white">0 Pending Tests Available</h3>
            <p className="text-xs text-[#8791A5] mt-1 font-mono">
              All assigned examinations have been completed or no pending tests meet the criteria.
            </p>
          </div>
        )}

        {/* Test Cards List */}
        {!isLoading &&
          filteredTests.map((test, index) => {
            const isCompleted =
              (test.completedAt !== null && test.completedAt !== undefined) ||
              test.status?.toUpperCase() === 'COMPLETED';

            return (
              <article
                key={test.id}
                className={`flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg transition-all ${
                  isCompleted
                    ? 'border-[#263044]/50 bg-[#151C2C] opacity-50 cursor-not-allowed'
                    : 'border-[#263044] bg-[#151C2C] hover:border-[#38BDF8]/40 border-l-4 border-l-[#C85A32]'
                }`}
              >
                {/* Meta details */}
                <div className="space-y-2 max-w-2xl flex-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#C85A32]">
                    <span>Paper 0{index + 1}</span>
                    <span className="text-[#526078]">/</span>
                    <span className="text-[#D4A373]">{test.track || 'Standard Track'}</span>
                    {isCompleted ? (
                      <>
                        <span className="text-[#526078]">/</span>
                        <span className="inline-flex items-center gap-1 text-[#EF4444]">
                          <Lock size={10} /> COMPLETED
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#526078]">/</span>
                        <span className="text-[#10B981]">PENDING</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-[#F3F4F6]">
                    {test.name || test.title}
                  </h2>

                  {/* Scientific formula with responsive KaTeX container */}
                  {test.formula && (
                    <div className="max-w-full overflow-x-auto py-1 font-mono text-xs text-[#D4A373] break-words whitespace-normal">
                      <MathRenderer content={test.formula} />
                    </div>
                  )}

                  {/* Metadata pills */}
                  <div className="flex flex-wrap gap-2.5 font-mono text-[9px] uppercase tracking-wider text-[#8791A5]">
                    <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                      [FORMAT: {test.format || 'STANDARD'}]
                    </span>
                    <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                      [DURATION: {test.duration || '180M'}]
                    </span>
                    <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                      [QUESTIONS: {test.questionsCount || 25}]
                    </span>
                    <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded text-[#D4A373]">
                      [TOTAL MARKS: {test.totalMarks || 100}]
                    </span>
                  </div>
                </div>

                {/* CTA Action button */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <button
                      disabled
                      aria-disabled="true"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#263044] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#64748B] cursor-not-allowed opacity-60"
                    >
                      <Lock size={14} />
                      <span>Test Completed</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectTest(test)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#C85A32] hover:bg-[#B54E29] text-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.16em] transition active:translate-y-[1px] shadow-md focus:outline-none focus:ring-2 focus:ring-[#C85A32]/60"
                    >
                      <span>Assign Test</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
      </main>
    </div>
  );
};

export default AssignTest;
