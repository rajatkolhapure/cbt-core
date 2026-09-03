import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import type { Exam } from '../../types';
import {
  FileSpreadsheet,
  Clock,
  Award,
  Layers,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      console.error('Failed to load assigned exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const availableExams = exams.filter(
    (exam) => !exam.attempts || exam.attempts.length === 0 || exam.attempts[0].state === 'IN_PROGRESS' || exam.attempts[0].state === 'NOT_STARTED'
  );

  const completedExams = exams.filter(
    (exam) => exam.attempts && exam.attempts.length > 0 && (exam.attempts[0].state === 'SUBMITTED' || exam.attempts[0].state === 'EVALUATED')
  );

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResult = (attemptId: string) => {
    navigate(`/student/results/${attemptId}`);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Academic Masthead Banner */}
      <div className="bg-[#1A2B4C] text-[#FBF9F5] p-6 border border-[#1C1D21] shadow-tactile flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono">
            <span className="bg-[#C88A2D] text-[#1C1D21] text-[10px] font-bold px-2 py-0.5 uppercase">
              OFFICIAL CBT CONSOLE
            </span>
            <span className="text-[#8E929E] text-xs">• AUTHORIZED CANDIDATE SESSION</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Assigned Examination Papers
          </h1>
          <p className="font-sans text-xs text-[#EAE3D9] mt-1.5 max-w-xl leading-relaxed">
            Select your assigned testing docket below. Ensure you are ready in a distraction-free environment before launching fullscreen lock.
          </p>
        </div>

        <div className="flex gap-2 font-mono">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-xs font-bold uppercase transition btn-tactile ${
              activeTab === 'available'
                ? 'bg-[#C88A2D] text-[#1C1D21] border-[#1C1D21]'
                : 'bg-[#121F38] text-white border-[#2E323B] hover:bg-[#1A2B4C]'
            }`}
          >
            AVAILABLE ({availableExams.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-bold uppercase transition btn-tactile ${
              activeTab === 'completed'
                ? 'bg-[#C88A2D] text-[#1C1D21] border-[#1C1D21]'
                : 'bg-[#121F38] text-white border-[#2E323B] hover:bg-[#1A2B4C]'
            }`}
          >
            COMPLETED ({completedExams.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Test List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-white border border-[#1C1D21] shadow-tactile p-12 text-center font-mono text-xs text-[#1C1D21]">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1C1D21] border-t-transparent animate-spin" />
                <span>&gt; FETCHING ASSIGNED EXAMINATION DOCKETS...</span>
              </div>
            </div>
          ) : activeTab === 'available' ? (
            availableExams.length === 0 ? (
              <div className="bg-white border border-[#1C1D21] shadow-tactile p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#236B47] mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-[#1C1D21]">All Assigned Papers Completed</h3>
                <p className="text-xs text-[#575A65] mt-1 font-sans">
                  You have completed all tests currently assigned to your docket. Check back when new exams are published.
                </p>
              </div>
            ) : (
              availableExams.map((exam) => {
                const activeAttempt = exam.attempts?.find((a) => a.state === 'IN_PROGRESS');
                const totalQuestions =
                  exam.sections?.reduce(
                    (sum, sec) => sum + (sec.questionCount || sec.questions?.length || 0),
                    0
                  ) || 0;

                return (
                  <div
                    key={exam.id}
                    className="bg-white border border-[#1C1D21] shadow-tactile p-5 transition hover:shadow-tactile-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-[#F4EFEA] border border-[#1C1D21] px-2 py-0.5 text-[#1C1D21]">
                            {exam.examEnvironment === 'FULLSCREEN_BROWSER' ? 'FULLSCREEN SECURED' : 'STANDARD PRACTICE'}
                          </span>
                          {activeAttempt && (
                            <span className="font-mono text-[10px] font-bold bg-[#FEF8ED] border border-[#C88A2D] px-2 py-0.5 text-[#C88A2D] animate-pulse">
                              SESSION IN PROGRESS
                            </span>
                          )}
                        </div>
                        <h2 className="font-serif text-lg font-bold text-[#1C1D21]">{exam.title}</h2>
                        {exam.description && (
                          <p className="text-xs text-[#575A65] line-clamp-2 leading-relaxed">{exam.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleStartExam(exam.id)}
                        className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider shrink-0 btn-tactile flex items-center justify-center gap-2 ${
                          activeAttempt
                            ? 'bg-[#C88A2D] hover:bg-[#B37923] text-[#1C1D21]'
                            : 'bg-[#1A2B4C] hover:bg-[#121F38] text-white'
                        }`}
                      >
                        {activeAttempt ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resume Test</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Launch Test</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata Strip */}
                    <div className="mt-4 pt-3 border-t border-[#DCD6CD] flex flex-wrap items-center gap-4 text-xs font-mono text-[#575A65]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1C1D21]" />
                        <span>{exam.duration} MINUTES</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#1C1D21]" />
                        <span>{exam.totalMarks} MARKS</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#1C1D21]" />
                        <span>{exam.sections?.length || 1} SECTIONS ({totalQuestions} QS)</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : completedExams.length === 0 ? (
            <div className="bg-white border border-[#1C1D21] shadow-tactile p-12 text-center font-sans">
              <FileSpreadsheet className="w-12 h-12 text-[#8E929E] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#1C1D21]">No Completed Tests Yet</h3>
              <p className="text-xs text-[#575A65] mt-1">Completed tests and detailed scorecards will appear here.</p>
            </div>
          ) : (
            completedExams.map((exam) => {
              const attempt = exam.attempts?.[0];
              if (!attempt) return null;

              return (
                <div
                  key={exam.id}
                  className="bg-white border border-[#1C1D21] shadow-tactile p-5 transition hover:shadow-tactile-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-[#EBF5F0] border border-[#236B47] text-[#236B47] px-2 py-0.5">
                          EVALUATED &amp; RECORDED
                        </span>
                        <span className="text-[11px] font-mono text-[#575A65]">
                          {new Date((attempt as any).submittedAt || (attempt as any).createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="font-serif text-lg font-bold text-[#1C1D21]">{exam.title}</h2>
                    </div>

                    <button
                      onClick={() => handleViewResult(attempt.id)}
                      className="px-4 py-2 font-mono text-xs font-bold uppercase bg-white hover:bg-[#EBF5F0] hover:text-[#236B47] text-[#1C1D21] border border-[#236B47] btn-tactile flex items-center gap-1.5"
                    >
                      <span>Scorecard &amp; Solutions</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C88A2D]" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCD6CD] flex flex-wrap items-center gap-6 font-mono text-xs">
                    <div>
                      <span className="text-[#575A65] text-[10px] uppercase">SCORE: </span>
                      <span className="font-bold text-[#1C1D21]">{attempt.marksObtained} / {exam.totalMarks}</span>
                    </div>
                    <div>
                      <span className="text-[#575A65] text-[10px] uppercase">PERCENTAGE: </span>
                      <span className="font-bold text-[#236B47]">{attempt.percentage?.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[#575A65] text-[10px] uppercase">ACCURACY: </span>
                      <span className="font-bold text-[#C88A2D]">{(attempt as any).accuracy?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Rules & Security Telemetry (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-[#1C1D21] shadow-tactile p-5">
            <h3 className="font-serif text-base font-bold text-[#1C1D21] mb-2 pb-1 border-b border-[#1C1D21]/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C88A2D]" />
              Examination Guidelines
            </h3>
            <ul className="space-y-2 text-xs text-[#575A65] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#C88A2D] font-bold">01.</span>
                <span>Mandatory strict fullscreen lock during test delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#C88A2D] font-bold">02.</span>
                <span>Leaving window triggers a 5-minute auto-submit countdown.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#C88A2D] font-bold">03.</span>
                <span>Real-time answer state syncing with offline resilience.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
