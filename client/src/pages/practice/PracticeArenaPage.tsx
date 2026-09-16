import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';
import {
  aiPracticeApi,
  type PracticeSession,
  type PracticeQuestion,
  type ScorecardResult,
} from '../../api/ai-practice';
import MathRenderer from '../../components/common/MathRenderer';

export const PracticeArenaPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Session & Questions Buffer
  const [session, setSession] = useState<PracticeSession | null>(
    (location.state as any)?.initialSession || null
  );
  const [questions, setQuestions] = useState<PracticeQuestion[]>(
    (location.state as any)?.initialQuestions || []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Interaction State
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    solutionText: string;
    addedXp: number;
  } | null>(null);

  // Scorecard State (When session finishes)
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<ScorecardResult | null>(null);

  // Prefetching Guard
  const isPrefetchingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(questions.length === 0);

  // Timed Sprint Countdown
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Load session & initial questions if not in state
  useEffect(() => {
    if (!sessionId) return;

    const initialize = async () => {
      try {
        if (!session) {
          const s = await aiPracticeApi.getSession(sessionId);
          setSession(s);
          if (s.isCompleted) {
            const sc = await aiPracticeApi.finishSession(sessionId);
            setScorecard(sc);
            setIsCompleted(true);
            return;
          }
          if (s.durationType === 'TIMED' && s.targetDuration) {
            setSecondsLeft(s.targetDuration * 60);
          }
        } else if (session.durationType === 'TIMED' && session.targetDuration) {
          setSecondsLeft(session.targetDuration * 60);
        }

        if (questions.length === 0) {
          const initial = await aiPracticeApi.prefetchNextBatch(sessionId, 5);
          setQuestions(initial);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [sessionId]);

  // Timed Sprint interval countdown
  useEffect(() => {
    if (secondsLeft === null || isCompleted) return;

    if (secondsLeft <= 0) {
      handleFinishSession();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isCompleted]);

  // SLIDING PREFETCH BUFFER: Fetch next batch when remaining questions <= 2
  useEffect(() => {
    if (!sessionId || isCompleted || questions.length === 0) return;

    const remaining = questions.length - (currentIndex + 1);

    if (remaining <= 2 && !isPrefetchingRef.current) {
      const runPrefetch = async () => {
        isPrefetchingRef.current = true;
        try {
          const nextBatch = await aiPracticeApi.prefetchNextBatch(sessionId, 5);
          if (nextBatch && nextBatch.length > 0) {
            setQuestions((prev) => [...prev, ...nextBatch]);
          }
        } catch (err) {
          console.warn('Background prefetch error:', err);
        } finally {
          isPrefetchingRef.current = false;
        }
      };

      runPrefetch();
    }
  }, [currentIndex, questions.length, sessionId, isCompleted]);

  const currentQuestion = questions[currentIndex];

  // Handle Option Click in Arcade Mode (Immediate Evaluation)
  const handleSelectOptionArcade = async (key: 'A' | 'B' | 'C' | 'D') => {
    if (isEvaluated || !sessionId || !currentQuestion) return;

    setSelectedOption(key);
    setIsEvaluated(true);

    try {
      const res = await aiPracticeApi.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        selectedOption: key,
        correctOption: currentQuestion.correctOption,
        solutionText: currentQuestion.solutionText,
      });

      setEvaluationResult({
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        solutionText: res.solutionText,
        addedXp: res.addedXp,
      });

      setSession(res.updatedSession);

      if (res.isCompleted) {
        setTimeout(() => {
          handleFinishSession();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  // Handle Option Click in Test Mode (Silent Selection until next)
  const handleSelectOptionTest = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isEvaluated) return;
    setSelectedOption(key);
  };

  // Advance to next question in buffer (0ms lag)
  const handleNextQuestion = async () => {
    if (!sessionId || !currentQuestion) return;

    // If in Test Mode, submit the selected answer now before advancing
    if (session?.mode === 'TEST' && selectedOption) {
      try {
        const res = await aiPracticeApi.submitAnswer(sessionId, {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          selectedOption,
          correctOption: currentQuestion.correctOption,
          solutionText: currentQuestion.solutionText,
        });

        setSession(res.updatedSession);

        if (res.isCompleted) {
          handleFinishSession();
          return;
        }
      } catch (err) {
        console.error('Failed to record test answer:', err);
      }
    }

    // Reset interaction state and advance buffer pointer
    setSelectedOption(null);
    setIsEvaluated(false);
    setEvaluationResult(null);
    setCurrentIndex((prev) => prev + 1);
  };

  // Conclude Session & Retrieve Scorecard
  const handleFinishSession = async () => {
    if (!sessionId) return;
    try {
      const sc = await aiPracticeApi.finishSession(sessionId);
      setScorecard(sc);
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to finish session:', err);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono text-xs text-[#575A65]">
        <div className="w-8 h-8 border-3 border-[#1A2B4C] border-t-transparent rounded-full animate-spin mb-3" />
        <span>Initializing Zero-Latency Practice Arena...</span>
      </div>
    );
  }

  // =========================================================
  // END-OF-SESSION SCORECARD VIEW
  // =========================================================
  if (isCompleted && scorecard) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 font-sans select-none space-y-6">
        {/* Scorecard Header */}
        <div className="bg-[#1A2B4C] text-[#FBF9F5] p-6 border border-[#1C1D21] shadow-tactile text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121F38] border border-[#2E323B] font-mono text-[11px] text-[#C88A2D] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#C88A2D]" />
            <span>Practice Session Completed</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Performance Scorecard</h1>
          <p className="font-mono text-xs text-stone-300 mt-1">
            {session.mode === 'ARCADE' ? 'Arcade Run Summary' : 'Test Simulation Results'} · {session.selectedTopics.subject} - {session.selectedTopics.chapter}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-[#1C1D21] shadow-tactile text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#575A65]">Total Score</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2B4C] mt-1">
              {scorecard.summary.score}
            </p>
          </div>
          <div className="bg-white p-4 border border-[#1C1D21] shadow-tactile text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#575A65]">Accuracy</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#236B47] mt-1">
              {scorecard.summary.accuracy}%
            </p>
          </div>
          <div className="bg-white p-4 border border-[#1C1D21] shadow-tactile text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#575A65]">XP Earned</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#C88A2D] mt-1">
              +{scorecard.summary.xpEarned}
            </p>
          </div>
          <div className="bg-white p-4 border border-[#1C1D21] shadow-tactile text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#575A65]">Max Streak</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#D97706] mt-1 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-[#D97706]" />
              <span>{scorecard.summary.highestStreak}</span>
            </p>
          </div>
        </div>

        {/* Detailed Solutions Accordion */}
        <div className="bg-white border border-[#1C1D21] shadow-tactile p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1C1D21] border-b border-[#DCD6CD] pb-2">
            Detailed Derivations &amp; Review ({scorecard.answers.length} Questions)
          </h2>

          <div className="space-y-4">
            {scorecard.answers.map((ans, idx) => (
              <div
                key={idx}
                className={`p-4 border text-xs font-sans space-y-2.5 ${
                  ans.isCorrect ? 'bg-[#F4FAF6] border-[#236B47]/40' : 'bg-[#FDF6F6] border-[#A83232]/40'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-[#1C1D21]">Question #{idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 font-bold uppercase ${
                      ans.isCorrect ? 'bg-[#236B47] text-white' : 'bg-[#A83232] text-white'
                    }`}
                  >
                    {ans.isCorrect ? '✓ Correct (+4)' : `✗ Your Choice: ${ans.selectedOption} | Correct: ${ans.correctOption}`}
                  </span>
                </div>

                <div className="text-sm font-medium text-[#1C1D21]">
                  <MathRenderer content={ans.questionText} />
                </div>

                <div className="bg-white p-3 border border-[#DCD6CD] space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#575A65]">
                    Step-by-Step KaTeX Derivation:
                  </span>
                  <div className="text-xs text-[#1C1D21] font-mono leading-relaxed overflow-x-auto">
                    <MathRenderer content={ans.solutionText} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/student/practice/new')}
            className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#C88A2D]" />
            <span>Start Another Practice Run</span>
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-white hover:bg-[#F4EFEA] text-[#1C1D21] border border-[#1C1D21] font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // LIVE QUESTION ARENA VIEW
  // =========================================================
  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 font-sans select-none space-y-5">
      {/* Top Gaming HUD Bar */}
      <div className="bg-[#1A2B4C] text-[#FBF9F5] px-5 py-3.5 border border-[#1C1D21] shadow-tactile flex items-center justify-between">
        {/* Left: Mode Badge & Syllabus Title */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
              session.mode === 'ARCADE' ? 'bg-[#C88A2D] text-[#1C1D21]' : 'bg-[#236B47] text-white'
            }`}
          >
            {session.mode}
          </span>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-sm text-white">{session.selectedTopics.subject}</span>
            <span className="font-mono text-xs text-stone-300 ml-1.5">/ {session.selectedTopics.chapter}</span>
          </div>
        </div>

        {/* Center: Arcade Streak or Countdown Clock */}
        <div className="flex items-center gap-4 font-mono">
          {session.mode === 'ARCADE' ? (
            <div className="flex items-center gap-1.5 bg-[#121F38] px-3 py-1 border border-[#2E323B]">
              <Flame
                className={`w-4 h-4 ${
                  session.streak > 0 ? 'text-[#D97706] animate-bounce' : 'text-stone-500'
                }`}
              />
              <span className="font-bold text-xs text-[#FBF9F5]">
                {session.streak} Streak
              </span>
              <span className="text-[10px] text-[#C88A2D]">
                ({(1.0 + Math.min(session.streak * 0.2, 2.0)).toFixed(1)}x)
              </span>
            </div>
          ) : (
            secondsLeft !== null && (
              <div className="flex items-center gap-1.5 bg-[#121F38] px-3 py-1 border border-[#2E323B] text-xs font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-[#C88A2D]" />
                <span>{formatTime(secondsLeft)}</span>
              </div>
            )
          )}

          {/* XP or Score Counter */}
          <div className="flex items-center gap-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C88A2D]" />
            <span className="font-bold text-[#FBF9F5]">{session.xpEarned} XP</span>
          </div>
        </div>

        {/* Right: Exit / Finish Action */}
        <button
          onClick={handleFinishSession}
          className="text-xs font-mono px-2.5 py-1 bg-[#121F38] hover:bg-[#A83232] text-white border border-[#2E323B] transition btn-tactile cursor-pointer"
        >
          {session.mode === 'TEST' ? 'Finish Test' : 'Exit Arena'}
        </button>
      </div>

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white border-2 border-[#1C1D21] shadow-tactile p-6 sm:p-8 space-y-6">
          {/* Question Index & Topic Header */}
          <div className="flex items-center justify-between border-b border-[#DCD6CD] pb-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#1A2B4C] text-white font-bold">
                Q {currentIndex + 1}
                {session.targetCount ? ` / ${session.targetCount}` : ''}
              </span>
              <span className="text-[#575A65]">{currentQuestion.subtopic}</span>
            </div>
            <span className="text-[11px] font-bold text-[#C88A2D] bg-[#FFF7ED] px-2 py-0.5 border border-[#C88A2D]/40">
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Statement with KaTeX */}
          <div className="text-base sm:text-lg font-medium text-[#1C1D21] leading-relaxed">
            <MathRenderer content={currentQuestion.text} />
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOpt = evaluationResult?.correctOption === opt.key;
              const isWrongSelection = isSelected && !evaluationResult?.isCorrect;

              let optionStyle =
                'bg-[#FBF9F5] border-[#1C1D21] text-[#1C1D21] hover:bg-[#F4EFEA] hover:shadow-tactile';

              if (session.mode === 'ARCADE' && isEvaluated) {
                if (isCorrectOpt) {
                  optionStyle = 'bg-[#EBF5F0] border-[#236B47] text-[#236B47] shadow-tactile-emerald font-bold';
                } else if (isWrongSelection) {
                  optionStyle = 'bg-[#FDF0F0] border-[#A83232] text-[#A83232] shadow-tactile-crimson font-bold';
                } else {
                  optionStyle = 'bg-[#FBF9F5] border-[#DCD6CD] text-[#8E929E] opacity-50';
                }
              } else if (isSelected) {
                optionStyle = 'bg-[#1A2B4C] border-[#1C1D21] text-white shadow-tactile font-bold';
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isEvaluated && session.mode === 'ARCADE'}
                  onClick={() =>
                    session.mode === 'ARCADE'
                      ? handleSelectOptionArcade(opt.key)
                      : handleSelectOptionTest(opt.key)
                  }
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                      isSelected && session.mode === 'TEST'
                        ? 'bg-white text-[#1C1D21] border-[#1C1D21]'
                        : isCorrectOpt && isEvaluated
                        ? 'bg-[#236B47] text-white border-[#236B47]'
                        : isWrongSelection
                        ? 'bg-[#A83232] text-white border-[#A83232]'
                        : 'bg-white text-[#1C1D21] border-[#1C1D21]'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <div className="text-sm font-medium leading-normal pt-0.5 overflow-x-auto">
                    <MathRenderer content={opt.text} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arcade Mode: Immediate Solution Expansion */}
          {session.mode === 'ARCADE' && isEvaluated && evaluationResult && (
            <div
              className={`p-5 border-2 text-xs font-sans space-y-3 animate-in fade-in duration-200 ${
                evaluationResult.isCorrect
                  ? 'bg-[#F4FAF6] border-[#236B47]'
                  : 'bg-[#FDF6F6] border-[#A83232]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evaluationResult.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#236B47]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#A83232]" />
                  )}
                  <span
                    className={`font-serif font-bold text-sm ${
                      evaluationResult.isCorrect ? 'text-[#236B47]' : 'text-[#A83232]'
                    }`}
                  >
                    {evaluationResult.isCorrect
                      ? `Brilliant! +${evaluationResult.addedXp} XP Earned`
                      : `Incorrect. Correct Option is (${evaluationResult.correctOption})`}
                  </span>
                </div>
              </div>

              {/* Step-by-Step KaTeX Derivation */}
              <div className="bg-white p-4 border border-[#DCD6CD] space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#575A65]">
                  Step-by-Step Analytical Derivation:
                </span>
                <div className="text-xs text-[#1C1D21] font-mono leading-relaxed overflow-x-auto">
                  <MathRenderer content={evaluationResult.solutionText} />
                </div>
              </div>

              {/* Next Challenge Snappy Advance Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center gap-2 cursor-pointer shadow-tactile"
                >
                  <span>Next Challenge ➔</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Mode: Next / Submit Button */}
          {session.mode === 'TEST' && (
            <div className="flex justify-end pt-4 border-t border-[#DCD6CD]">
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Submit &amp; Next Question ➔</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 border border-[#1C1D21] text-center font-mono text-xs text-[#575A65] space-y-3">
          <div className="w-8 h-8 border-3 border-[#1A2B4C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Prefetching Next Batch from Gemini Engine...</p>
        </div>
      )}
    </div>
  );
};

export default PracticeArenaPage;
