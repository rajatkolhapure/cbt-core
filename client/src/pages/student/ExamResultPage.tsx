import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MathRenderer from '../../components/common/MathRenderer';
import OfficialScorecardModal from '../../components/exam/OfficialScorecardModal';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Printer,
  FileCheck,
} from 'lucide-react';

export const ExamResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [resultData, setResultData] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'review'>('scorecard');
  const [solutionFilter, setSolutionFilter] = useState<'ALL' | 'INCORRECT' | 'CORRECT' | 'UNATTEMPTED'>('ALL');
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) return;
      try {
        const res = await api.get(`/attempts/${attemptId}/result`);
        setResultData(res.data);

        // Fetch detailed review if available
        try {
          const revRes = await api.get(`/attempts/${attemptId}/review`);
          setReviewData(revRes.data);
        } catch {
          // Review may not be permitted for this exam
        }
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <h3 className="text-sm font-semibold text-gray-800">Result Not Available</h3>
        <p className="text-xs text-gray-500 mt-1">Unable to retrieve scorecard for this attempt.</p>
        <Link
          to="/student/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const evaluation = resultData.evaluation || {};
  const attempt = resultData.attempt || {};
  const exam = resultData.exam || {};

  return (
    <div className="space-y-6 font-sans">
      {/* Back link & Title */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Tests</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScorecardModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono font-bold text-xs uppercase border border-[#1C1D21] btn-tactile shadow-tactile cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#C88A2D]" />
            <span>Official Score Card (PDF)</span>
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border btn-tactile cursor-pointer ${
              activeTab === 'scorecard'
                ? 'bg-[#1A2B4C] hover:bg-[#121F38] text-white border-[#1C1D21]'
                : 'bg-[#F4EFEA] hover:bg-[#EAE3D9] text-[#1C1D21] border-[#1C1D21]/40'
            }`}
          >
            Detailed Analytics
          </button>
          {reviewData && (
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border btn-tactile cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-[#1A2B4C] hover:bg-[#121F38] text-white border-[#1C1D21]'
                  : 'bg-[#F4EFEA] hover:bg-[#EAE3D9] text-[#1C1D21] border-[#1C1D21]/40'
              }`}
            >
              Paper Solutions & Explanations
            </button>
          )}
        </div>
      </div>

      {activeTab === 'scorecard' ? (
        <div className="space-y-6">
          {/* Header Banner with Main Score */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Examination Evaluated
              </span>
              <h1 className="text-xl font-bold text-slate-900">{exam.title}</h1>
              <p className="text-xs text-slate-500 font-mono">
                Submitted on {new Date(attempt.submittedAt).toLocaleString()}
              </p>
              <div>
                <button
                  onClick={() => setIsScorecardModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline mt-1 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>View Official Scorecard & Estimated Percentile Report (PDF)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-center">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Marks Obtained</span>
                <div className="text-3xl font-bold text-slate-900 font-mono mt-0.5">
                  {evaluation.marksObtained ?? 0}{' '}
                  <span className="text-sm font-normal text-slate-400">/ {evaluation.totalPossibleMarks ?? 0}</span>
                </div>
              </div>

              <div className="w-px h-10 bg-slate-300"></div>

              <div className="text-center">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Percentage</span>
                <div className="text-3xl font-bold text-emerald-600 font-mono mt-0.5">
                  {evaluation.percentage ?? 0}%
                </div>
              </div>

              <div className="w-px h-10 bg-slate-300"></div>

              <div className="text-center">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Accuracy</span>
                <div className="text-3xl font-bold text-blue-600 font-mono mt-0.5">
                  {evaluation.accuracy ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Question Summary Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Correct Answers</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{evaluation.correctCount ?? 0}</div>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Incorrect Answers</span>
                <div className="text-2xl font-bold text-rose-600 mt-1">{evaluation.incorrectCount ?? 0}</div>
              </div>
              <XCircle className="w-7 h-7 text-rose-500" />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Unanswered</span>
                <div className="text-2xl font-bold text-slate-600 mt-1">{evaluation.unansweredCount ?? 0}</div>
              </div>
              <HelpCircle className="w-7 h-7 text-slate-400" />
            </div>
          </div>

          {/* Subject-wise breakdown Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Subject-Wise Performance Breakdown
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Subject / Section</th>
                    <th className="py-3 px-4 text-center">Total Qs</th>
                    <th className="py-3 px-4 text-center">Attempted</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Correct</th>
                    <th className="py-3 px-4 text-center text-rose-700">Incorrect</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Accuracy (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {evaluation.sectionSummaries?.map((sec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {sec.sectionName}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">{sec.totalQuestions}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-800">{sec.attemptedCount}</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-bold">{sec.correctCount}</td>
                      <td className="py-3 px-4 text-center text-rose-600 font-bold">{sec.incorrectCount}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sec.marksObtained} / {sec.totalPossibleMarks}
                      </td>
                      <td className="py-3 px-4 text-center text-blue-600 font-bold">
                        {sec.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Solutions / Review Mode */
        <div className="space-y-6">
          {/* Filter Header Banner */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Paper Solutions & Answer Key
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review verified answer keys, detailed explanations, and performance status for each question
                </p>
              </div>

              {/* Status Pill Filters */}
              {(() => {
                const allQs = reviewData?.sections?.flatMap((s: any) => s.questions || []) || [];
                const totalCount = allQs.length;
                const incorrectCount = allQs.filter((q: any) => q.isAttempted && !q.isCorrect).length;
                const correctCount = allQs.filter((q: any) => q.isCorrect).length;
                const unattemptedCount = allQs.filter((q: any) => !q.isAttempted).length;

                return (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0 font-mono">
                    <button
                      onClick={() => setSolutionFilter('ALL')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase border btn-tactile cursor-pointer ${
                        solutionFilter === 'ALL'
                          ? 'bg-[#1A2B4C] hover:bg-[#121F38] text-white border-[#1C1D21]'
                          : 'bg-[#F4EFEA] hover:bg-[#EAE3D9] text-[#1C1D21] border-[#1C1D21]/40'
                      }`}
                    >
                      All ({totalCount})
                    </button>

                    <button
                      onClick={() => setSolutionFilter('INCORRECT')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase border btn-tactile cursor-pointer flex items-center gap-1.5 ${
                        solutionFilter === 'INCORRECT'
                          ? 'bg-[#A83232] hover:bg-[#8F2929] text-white border-[#1C1D21]'
                          : 'bg-[#FDF0F0] hover:bg-[#FBE4E4] text-[#A83232] hover:text-[#8F2929] border border-[#A83232]'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect ({incorrectCount})</span>
                    </button>

                    <button
                      onClick={() => setSolutionFilter('CORRECT')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase border btn-tactile cursor-pointer flex items-center gap-1.5 ${
                        solutionFilter === 'CORRECT'
                          ? 'bg-[#236B47] hover:bg-[#1C5638] text-white border-[#1C1D21]'
                          : 'bg-[#EBF5F0] hover:bg-[#DEEFE6] text-[#236B47] hover:text-[#1C5638] border border-[#236B47]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct ({correctCount})</span>
                    </button>

                    <button
                      onClick={() => setSolutionFilter('UNATTEMPTED')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase border btn-tactile cursor-pointer flex items-center gap-1.5 ${
                        solutionFilter === 'UNATTEMPTED'
                          ? 'bg-[#575A65] hover:bg-[#434650] text-white border-[#1C1D21]'
                          : 'bg-[#FBF9F5] hover:bg-[#EAE3D9] text-[#575A65] hover:text-[#1C1D21] border border-[#1C1D21]/40'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Unattempted ({unattemptedCount})</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sectional Solution Review */}
          {reviewData?.sections?.map((sec: any, secIdx: number) => {
            const filteredQuestions = (sec.questions || []).filter((q: any) => {
              if (solutionFilter === 'INCORRECT') return q.isAttempted && !q.isCorrect;
              if (solutionFilter === 'CORRECT') return q.isCorrect;
              if (solutionFilter === 'UNATTEMPTED') return !q.isAttempted;
              return true;
            });

            if (filteredQuestions.length === 0 && solutionFilter !== 'ALL') {
              return null;
            }

            return (
              <div key={secIdx} className="space-y-4">
                <div className="flex items-center justify-between bg-slate-200/80 px-3.5 py-2 rounded">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    {sec.sectionName} {sec.subjectName && `(${sec.subjectName})`}
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-slate-600">
                    Showing {filteredQuestions.length} of {sec.questions?.length || 0} Questions
                  </span>
                </div>

                {filteredQuestions.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                    No questions in this section match the selected filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((q: any) => {
                      const originalQIdx = (sec.questions || []).findIndex(
                        (orig: any) => orig.questionId === q.questionId
                      );

                      return (
                        <div
                          key={q.questionId}
                          className={`bg-white rounded-lg border p-5 shadow-2xs space-y-3 ${
                            q.isCorrect
                              ? 'border-emerald-300 bg-emerald-50/20'
                              : q.isAttempted
                              ? 'border-rose-300 bg-rose-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                Question {originalQIdx >= 0 ? originalQIdx + 1 : ''}
                              </span>
                              <span
                                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                                  q.isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : q.isAttempted
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {q.isCorrect ? 'Correct' : q.isAttempted ? 'Incorrect' : 'Not Attempted'}
                              </span>
                            </div>

                            <div className="font-mono font-bold text-xs">
                              {q.marksAwarded > 0 ? (
                                <span className="text-emerald-700">+{q.marksAwarded} pts</span>
                              ) : q.marksAwarded < 0 ? (
                                <span className="text-rose-700">{q.marksAwarded} pts</span>
                              ) : (
                                <span className="text-slate-500">0 pts</span>
                              )}
                            </div>
                          </div>

                          {/* Question text with KaTeX */}
                          <div className="text-sm font-medium text-slate-900 leading-relaxed">
                            <MathRenderer content={q.text} />
                          </div>

                          {/* Options list */}
                          {q.options && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isCorrect =
                                  q.type === 'SINGLE_CHOICE'
                                    ? Number(q.correctAnswer) === optIdx
                                    : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optIdx);

                                const isSelected =
                                  q.userAnswer?.selectedOptions &&
                                  Array.isArray(q.userAnswer.selectedOptions) &&
                                  q.userAnswer.selectedOptions.includes(optIdx);

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded text-xs flex items-start gap-2 border ${
                                      isCorrect
                                        ? 'bg-emerald-100/70 border-emerald-400 font-bold text-emerald-950'
                                        : isSelected
                                        ? 'bg-rose-100/70 border-rose-400 font-bold text-rose-950'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-mono font-bold shrink-0">
                                      ({String.fromCharCode(65 + optIdx)})
                                    </span>
                                    <div className="flex-1">
                                      <MathRenderer content={opt} />
                                    </div>
                                    {isCorrect && (
                                      <span className="text-[10px] text-emerald-800 font-bold uppercase shrink-0">
                                        [Correct]
                                      </span>
                                    )}
                                    {isSelected && !isCorrect && (
                                      <span className="text-[10px] text-rose-800 font-bold uppercase shrink-0">
                                        [Your Answer]
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Numerical value review */}
                          {q.type === 'NUMERICAL' && (
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs flex gap-4">
                              <div>
                                <span className="text-slate-500 font-medium">Your Input:</span>{' '}
                                <span className="font-mono font-bold text-slate-800">
                                  {q.userAnswer?.numericalAnswer ?? 'None'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">Correct Value:</span>{' '}
                                <span className="font-mono font-bold text-emerald-700">
                                  {q.correctAnswer}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Solution Explanation */}
                          {q.explanation && (
                            <div className="mt-2 bg-slate-50 border-l-2 border-blue-500 p-2.5 text-xs text-slate-700">
                              <span className="font-bold text-slate-900">Solution: </span>
                              <MathRenderer content={q.explanation} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Official State CET Printable PDF Scorecard Modal */}
      <OfficialScorecardModal
        isOpen={isScorecardModalOpen}
        onClose={() => setIsScorecardModalOpen(false)}
        resultData={resultData}
      />
    </div>
  );
};

export default ExamResultPage;
