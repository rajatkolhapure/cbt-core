import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import type { Exam } from '../../types';
import MathRenderer from '../../components/common/MathRenderer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Award,
  X,
} from 'lucide-react';

export const ResultsAnalyticsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        setExams(res.data.exams || []);
        if (res.data.exams?.length > 0) {
          setSelectedExamId(res.data.exams[0].id);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    const fetchAttempts = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setAttempts(res.data.recentAttempts || []);
      } catch (err) {
        console.error('Failed to load attempts:', err);
      }
    };
    fetchAttempts();
  }, [selectedExamId]);

  const handleOpenReview = async (attemptId: string) => {
    try {
      const res = await api.get(`/attempts/${attemptId}/review`);
      setSelectedReview(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to load detailed review');
    }
  };

  const chartData = [
    { range: '0-25%', count: 1 },
    { range: '26-50%', count: 3 },
    { range: '51-75%', count: 5 },
    { range: '76-100%', count: 4 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Results & Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate candidate score distributions, subject proficiencies, and question difficulty metrics
          </p>
        </div>

        <div className="w-64">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Score Percentile Distribution</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregate Overview Card */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Assessment Summary</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Median Score</span>
                <div className="text-xl font-bold text-slate-900 mt-1">68.5%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Average Accuracy</span>
                <div className="text-xl font-bold text-slate-900 mt-1">74.2%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Avg Time / Question</span>
                <div className="text-xl font-bold text-slate-900 mt-1">72 sec</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Negative Mark Impact</span>
                <div className="text-xl font-bold text-rose-600 mt-1">-8.4 pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Submissions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Completed Submissions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Exam</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No completed exam attempts found.
                  </td>
                </tr>
              ) : (
                attempts.map((att: any) => (
                  <tr key={att.id} className="hover:bg-blue-50/30 transition-colors duration-100">
                    <td className="py-3 px-4 font-semibold text-slate-900">{att.user?.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{att.user?.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{att.exam?.title}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {att.marksObtained ?? 0} / {att.exam?.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {Math.round((((att.marksObtained ?? 0) / (att.exam?.totalMarks || 1)) * 100) * 10) / 10}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(att.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Inspect Paper
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED QUESTION-BY-QUESTION REVIEW DRAWER */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Paper Inspection: {selectedReview.examTitle}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Score: {selectedReview.summary?.marksObtained} / {selectedReview.summary?.totalPossibleMarks} pts ({selectedReview.summary?.percentage}%) • Accuracy: {selectedReview.summary?.accuracy}%
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {selectedReview.sections?.map((sec: any, secIdx: number) => (
                <div key={secIdx} className="space-y-4">
                  <h3 className="font-bold text-slate-900 bg-slate-100 p-2.5 rounded text-xs uppercase tracking-wider border border-slate-200">
                    {sec.sectionName} ({sec.subjectName})
                  </h3>

                  <div className="space-y-4">
                    {sec.questions?.map((q: any, qIdx: number) => (
                      <div
                        key={q.questionId}
                        className={`p-4 rounded-lg border ${
                          q.isCorrect
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : q.isAttempted
                            ? 'bg-rose-50/40 border-rose-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60">
                          <span className="font-bold text-slate-800">
                            Question {qIdx + 1}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                              q.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.isAttempted
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {q.marksAwarded > 0 ? `+${q.marksAwarded}` : q.marksAwarded} pts
                          </span>
                        </div>

                        <div className="text-slate-900 font-medium leading-relaxed">
                          <MathRenderer content={q.text} />
                        </div>

                        {/* Options */}
                        {q.options && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isCorrectOpt =
                                q.type === 'SINGLE_CHOICE'
                                  ? Number(q.correctAnswer) === optIdx
                                  : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optIdx);

                              const isUserSelected =
                                q.userAnswer?.selectedOptions &&
                                Array.isArray(q.userAnswer.selectedOptions) &&
                                q.userAnswer.selectedOptions.includes(optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded text-[11px] flex items-start gap-1.5 border ${
                                    isCorrectOpt
                                      ? 'bg-emerald-100/70 border-emerald-400 font-bold text-emerald-950'
                                      : isUserSelected
                                      ? 'bg-rose-100/70 border-rose-400 font-bold text-rose-950'
                                      : 'bg-white border-gray-200 text-slate-700'
                                  }`}
                                >
                                  <span className="font-mono">
                                    ({String.fromCharCode(65 + optIdx)})
                                  </span>
                                  <div className="flex-1">
                                    <MathRenderer content={opt} />
                                  </div>
                                  {isCorrectOpt && (
                                    <span className="text-[10px] text-emerald-700 font-bold uppercase shrink-0">
                                      [Correct]
                                    </span>
                                  )}
                                  {isUserSelected && !isCorrectOpt && (
                                    <span className="text-[10px] text-rose-700 font-bold uppercase shrink-0">
                                      [Candidate Choice]
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-3 bg-white p-2.5 rounded border border-gray-200 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900">Explanation: </span>
                            <MathRenderer content={q.explanation} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsAnalyticsPage;
