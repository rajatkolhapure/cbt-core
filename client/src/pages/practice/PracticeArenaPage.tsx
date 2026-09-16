import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
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
  type TestSection,
} from '../../api/ai-practice';
import type { ExamSection, Question } from '../../types';
import MathRenderer from '../../components/common/MathRenderer';
import ExamHeader from '../../components/exam/ExamHeader';
import SectionTabs from '../../components/exam/SectionTabs';
import QuestionDisplay from '../../components/exam/QuestionDisplay';
import OptionList from '../../components/exam/OptionList';
import QuestionPalette from '../../components/exam/QuestionPalette';
import ExamNavigation from '../../components/exam/ExamNavigation';
import SubmitConfirmModal from '../../components/exam/SubmitConfirmModal';
import QuestionPaperModal from '../../components/exam/QuestionPaperModal';
import InstructionsModal from '../../components/exam/InstructionsModal';

export const PracticeArenaPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Session & Questions State
  const [session, setSession] = useState<PracticeSession | null>(
    (location.state as any)?.initialSession || null
  );
  const [questions, setQuestions] = useState<PracticeQuestion[]>(
    (location.state as any)?.initialQuestions || []
  );
  const [rawSections] = useState<TestSection[]>(
    (location.state as any)?.initialSections || []
  );

  // Scorecard State
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<ScorecardResult | null>(null);

  // Loading & Timer States
  const [isLoading, setIsLoading] = useState<boolean>(!session && questions.length === 0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // ─────────────────────────────────────────────────────────────
  // TEST MODE STATE (Full NTA Exam Parity)
  // ─────────────────────────────────────────────────────────────
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');

  // Answers Map: questionId -> { questionId, selectedOptions, isMarkedForReview, isVisited }
  const [answersMap, setAnswersMap] = useState<Map<string, any>>(new Map());

  // Test Mode Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // ARCADE MODE STATE (Gamified Rapid Practice)
  // ─────────────────────────────────────────────────────────────
  const [arcadeIndex, setArcadeIndex] = useState<number>(0);
  const [arcadeSelectedOption, setArcadeSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [arcadeIsEvaluated, setArcadeIsEvaluated] = useState<boolean>(false);
  const [arcadeEvaluationResult, setArcadeEvaluationResult] = useState<{
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    solutionText: string;
    addedXp: number;
  } | null>(null);

  const isPrefetchingRef = useRef<boolean>(false);

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

  // ─────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────
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
          } else if (s.mode === 'TEST') {
            // Default 30-minute mock timer if unspecified
            setSecondsLeft(30 * 60);
          }
        } else if (session.durationType === 'TIMED' && session.targetDuration) {
          setSecondsLeft(session.targetDuration * 60);
        } else if (session.mode === 'TEST' && secondsLeft === null) {
          setSecondsLeft(30 * 60);
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

  // Countdown timer
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

  // ─────────────────────────────────────────────────────────────
  // SECTIONS PARSING (TEST MODE)
  // ─────────────────────────────────────────────────────────────
  const examSections: ExamSection[] = useMemo(() => {
    if (rawSections && rawSections.length > 0) {
      return rawSections.map((sec, sIdx) => ({
        id: sec.id,
        examId: sessionId || '',
        subjectId: sec.name,
        name: sec.name,
        order: sec.order || sIdx + 1,
        questionCount: sec.questions.length,
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
        allowSectionJump: true,
        questions: sec.questions.map((qItem, qIdx) => ({
          id: qItem.id || `q-${sIdx}-${qIdx}`,
          order: qItem.order || qIdx + 1,
          question: {
            id: qItem.question.id || `q-${sIdx}-${qIdx}`,
            type: 'SINGLE_CHOICE',
            text: qItem.question.text,
            options: qItem.question.options.map((o) => o.text),
            correctAnswer: qItem.question.correctOption,
            marks: 4,
            negativeMarks: 1,
            difficulty: qItem.question.difficulty,
            tags: [qItem.question.subject, qItem.question.chapter],
            subjectId: qItem.question.subject,
            isActive: true,
            createdAt: new Date().toISOString(),
          } as Question,
        })),
      }));
    }

    // Fallback: group flat questions list by subject
    if (questions.length > 0) {
      const grouped: Record<string, PracticeQuestion[]> = {};
      questions.forEach((q) => {
        const subj = q.subject || 'General';
        if (!grouped[subj]) grouped[subj] = [];
        grouped[subj].push(q);
      });

      return Object.keys(grouped).map((subj, sIdx) => {
        const qList = grouped[subj];
        return {
          id: `sec-${sIdx + 1}`,
          examId: sessionId || '',
          subjectId: subj,
          name: subj,
          order: sIdx + 1,
          questionCount: qList.length,
          marksPerQuestion: 4,
          negativeMarksPerQuestion: 1,
          allowSectionJump: true,
          questions: qList.map((q, qIdx) => ({
            id: q.id || `q-${sIdx}-${qIdx}`,
            order: qIdx + 1,
            question: {
              id: q.id || `q-${sIdx}-${qIdx}`,
              type: 'SINGLE_CHOICE',
              text: q.text,
              options: q.options.map((o) => o.text),
              correctAnswer: q.correctOption,
              marks: 4,
              negativeMarks: 1,
              difficulty: q.difficulty,
              tags: [q.subject, q.chapter],
              subjectId: q.subject,
              isActive: true,
              createdAt: new Date().toISOString(),
            } as Question,
          })),
        };
      });
    }

    return [];
  }, [rawSections, questions, sessionId]);

  const currentSection = examSections[currentSectionIndex] || null;
  const currentExamQuestions = currentSection?.questions || [];
  const currentExamQuestion = currentExamQuestions[currentQuestionIndex] || null;
  const currentQuestion = currentExamQuestion?.question || null;

  // Mark current question visited in Test Mode
  useEffect(() => {
    if (!currentQuestion || session?.mode !== 'TEST') return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id);
      if (!existing) {
        next.set(currentQuestion.id, {
          questionId: currentQuestion.id,
          isVisited: true,
          isMarkedForReview: false,
          selectedOptions: [],
        });
      } else if (!existing.isVisited) {
        next.set(currentQuestion.id, { ...existing, isVisited: true });
      }
      return next;
    });
  }, [currentSectionIndex, currentQuestionIndex, currentQuestion?.id, session?.mode]);

  // ─────────────────────────────────────────────────────────────
  // TEST MODE INTERACTION HANDLERS
  // ─────────────────────────────────────────────────────────────
  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion.id) : null;

  const handleSelectOptionTest = (optIdx: number) => {
    if (!currentQuestion) return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) || {};
      next.set(currentQuestion.id, {
        ...existing,
        selectedOptions: [optIdx],
        isVisited: true,
      });
      return next;
    });
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) || {};
      next.set(currentQuestion.id, {
        ...existing,
        selectedOptions: [],
      });
      return next;
    });
  };

  const handleSaveAndNext = async () => {
    if (!sessionId || !currentQuestion) return;

    const ans = answersMap.get(currentQuestion.id);
    if (ans && ans.selectedOptions && ans.selectedOptions.length > 0) {
      const optLetter = (['A', 'B', 'C', 'D'][ans.selectedOptions[0]] || 'A') as
        | 'A'
        | 'B'
        | 'C'
        | 'D';
      const origQuestion = questions.find((q) => q.id === currentQuestion.id);

      aiPracticeApi
        .submitAnswer(sessionId, {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          selectedOption: optLetter,
          correctOption: (origQuestion?.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
          solutionText: origQuestion?.solutionText || '',
        })
        .catch((e) => console.warn('Answer submit warning:', e));
    }

    if (currentQuestionIndex < currentExamQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < examSections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleMarkForReviewAndNext = async () => {
    if (!currentQuestion) return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) || {};
      next.set(currentQuestion.id, {
        ...existing,
        isMarkedForReview: true,
        isVisited: true,
      });
      return next;
    });

    await handleSaveAndNext();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSectionIndex > 0) {
      const prevSec = currentSectionIndex - 1;
      setCurrentSectionIndex(prevSec);
      setCurrentQuestionIndex((examSections[prevSec]?.questions?.length || 1) - 1);
    }
  };

  const handleDirectJump = (idx: number) => {
    setCurrentQuestionIndex(idx);
  };

  const handleSectionSwitch = (secIdx: number) => {
    setCurrentSectionIndex(secIdx);
    setCurrentQuestionIndex(0);
  };

  const handleJumpFromQuestionPaper = (secIdx: number, qIdx: number) => {
    setCurrentSectionIndex(secIdx);
    setCurrentQuestionIndex(qIdx);
    setIsQuestionPaperOpen(false);
  };

  const handleConfirmSubmit = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      const sc = await aiPracticeApi.finishSession(sessionId);
      setScorecard(sc);
      setIsCompleted(true);
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error('Failed to finish test session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ARCADE MODE HANDLERS & SLIDING BUFFER
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || isCompleted || questions.length === 0 || session?.mode !== 'ARCADE') return;

    const remaining = questions.length - (arcadeIndex + 1);
    if (remaining <= 2 && !isPrefetchingRef.current) {
      const runPrefetch = async () => {
        isPrefetchingRef.current = true;
        try {
          const nextBatch = await aiPracticeApi.prefetchNextBatch(sessionId, 5);
          if (nextBatch && nextBatch.length > 0) {
            setQuestions((prev) => [...prev, ...nextBatch]);
          }
        } catch (err) {
          console.warn('Background buffer prefetch error:', err);
        } finally {
          isPrefetchingRef.current = false;
        }
      };

      runPrefetch();
    }
  }, [arcadeIndex, questions.length, sessionId, isCompleted, session?.mode]);

  const currentArcadeQuestion = questions[arcadeIndex];

  const handleSelectOptionArcade = async (key: 'A' | 'B' | 'C' | 'D') => {
    if (arcadeIsEvaluated || !sessionId || !currentArcadeQuestion) return;

    setArcadeSelectedOption(key);
    setArcadeIsEvaluated(true);

    try {
      const res = await aiPracticeApi.submitAnswer(sessionId, {
        questionId: currentArcadeQuestion.id,
        questionText: currentArcadeQuestion.text,
        selectedOption: key,
        correctOption: currentArcadeQuestion.correctOption,
        solutionText: currentArcadeQuestion.solutionText,
      });

      setArcadeEvaluationResult({
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
      console.error('Failed to submit arcade answer:', err);
    }
  };

  const handleNextArcadeQuestion = () => {
    setArcadeSelectedOption(null);
    setArcadeIsEvaluated(false);
    setArcadeEvaluationResult(null);
    setArcadeIndex((prev) => prev + 1);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formattedRemainingTime = secondsLeft !== null ? formatTime(secondsLeft) : '00:00';
  const isLowTime = secondsLeft !== null && secondsLeft <= 300;
  const isCriticalTime = secondsLeft !== null && secondsLeft <= 60;

  // ─────────────────────────────────────────────────────────────
  // LOADING VIEW
  // ─────────────────────────────────────────────────────────────
  if (isLoading || !session) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center font-mono text-xs text-[#575A65] space-y-3">
        <div className="w-8 h-8 border-3 border-[#1A2B4C] border-t-transparent rounded-full animate-spin" />
        <span>Initializing Zero-Latency AI Examination Station...</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SCORECARD VIEW (POST-SUBMIT)
  // ─────────────────────────────────────────────────────────────
  if (isCompleted && scorecard) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 font-sans select-none space-y-6">
        <div className="bg-[#1A2B4C] text-[#FBF9F5] p-6 border border-[#1C1D21] shadow-tactile text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121F38] border border-[#2E323B] font-mono text-[11px] text-[#C88A2D] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#C88A2D]" />
            <span>AI Practice Examination Concluded</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Performance Scorecard
          </h1>
          <p className="font-mono text-xs text-stone-300 mt-1">
            {session.mode === 'TEST' ? 'Full Standardized Test Simulation' : 'Arcade Sprint'} ·{' '}
            {session.selectedTopics.isFullSyllabus
              ? 'Class 12 Full Syllabus (All 48 Chapters)'
              : session.selectedTopics.subjects?.join(', ') || 'Class 12 STEM'}
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
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#575A65]">Attempted</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1D21] mt-1">
              {scorecard.summary.correctCount} / {scorecard.summary.totalAttempted}
            </p>
          </div>
        </div>

        {/* Question-by-Question Derivations */}
        <div className="bg-white border border-[#1C1D21] shadow-tactile p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1C1D21] border-b border-[#DCD6CD] pb-2">
            Step-by-Step Analytical Derivations &amp; Solutions ({scorecard.answers.length} Questions)
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
                    {ans.isCorrect
                      ? '✓ Correct (+4)'
                      : `✗ Your Choice: ${ans.selectedOption} | Correct: ${ans.correctOption}`}
                  </span>
                </div>

                <div className="text-sm font-medium text-[#1C1D21]">
                  <MathRenderer content={ans.questionText} />
                </div>

                <div className="bg-white p-3 border border-[#DCD6CD] space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#575A65]">
                    KaTeX Proof / Mechanism:
                  </span>
                  <div className="text-xs text-[#1C1D21] font-mono leading-relaxed overflow-x-auto">
                    <MathRenderer content={ans.solutionText} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scorecard Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/student/practice/new')}
            className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#C88A2D]" />
            <span>Launch Another Practice Test</span>
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

  // ─────────────────────────────────────────────────────────────
  // 1. TEST MODE FULL NTA EXAM PARITY VIEW
  // ─────────────────────────────────────────────────────────────
  if (session.mode === 'TEST') {
    return (
      <div className="h-screen max-h-screen flex flex-col bg-[#FBF9F5] overflow-hidden font-sans select-none -m-4 sm:-m-6">
        {/* Exam Header Bar */}
        <ExamHeader
          examTitle={
            session.selectedTopics.isFullSyllabus
              ? 'Class 12 Comprehensive Mock Examination (All 48 Chapters)'
              : `Class 12 Practice Test: ${session.selectedTopics.subjects?.join(', ') || 'STEM'}`
          }
          formattedTime={formattedRemainingTime}
          isLowTime={isLowTime}
          isCriticalTime={isCriticalTime}
          currentSectionName={currentSection?.name}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          onOpenQuestionPaper={() => setIsQuestionPaperOpen(true)}
          onOpenInstructions={() => setIsInstructionsOpen(true)}
          onToggleMobilePalette={() => setIsMobilePaletteOpen((prev) => !prev)}
        />

        {/* Subject Section Switcher Tabs */}
        <SectionTabs
          sections={examSections}
          currentSectionIndex={currentSectionIndex}
          onSelectSection={handleSectionSwitch}
          allowSectionJump={true}
        />

        {/* Main Center Split View */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Question Area */}
          <main className="flex-1 w-full p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-white border-r border-[#1C1D21] shadow-2xs">
            {currentQuestion ? (
              <>
                <QuestionDisplay
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestionsInSection={currentExamQuestions.length}
                  marks={4}
                  negativeMarks={1}
                  fontSize={fontSize}
                />

                <OptionList
                  options={currentQuestion.options || []}
                  type="SINGLE_CHOICE"
                  selectedOptions={currentAnswer?.selectedOptions}
                  onSelectOption={handleSelectOptionTest}
                  fontSize={fontSize}
                />
              </>
            ) : (
              <div className="p-8 text-center font-mono text-xs text-[#575A65]">
                No questions available in this section.
              </div>
            )}
          </main>

          {/* Desktop Sidebar: 5-Status Question Palette Grid */}
          <div className="hidden lg:flex shrink-0">
            <QuestionPalette
              questions={currentExamQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answersMap}
              onSelectQuestion={handleDirectJump}
              sectionName={currentSection?.name || 'Section'}
            />
          </div>

          {/* Mobile Slide-Over Palette Drawer */}
          {isMobilePaletteOpen && (
            <div
              className="fixed inset-0 z-40 lg:hidden flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
              onClick={() => setIsMobilePaletteOpen(false)}
            >
              <div
                className="w-full max-w-xs sm:max-w-sm ml-auto h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <QuestionPalette
                  questions={currentExamQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  answers={answersMap}
                  onSelectQuestion={(idx) => {
                    handleDirectJump(idx);
                    setIsMobilePaletteOpen(false);
                  }}
                  sectionName={currentSection?.name || 'Section'}
                  onCloseMobile={() => setIsMobilePaletteOpen(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Navigation Bar */}
        <ExamNavigation
          onPrevious={handlePrevious}
          onSaveAndNext={handleSaveAndNext}
          onClearResponse={handleClearResponse}
          onMarkForReviewAndNext={handleMarkForReviewAndNext}
          onSubmitExam={() => setIsSubmitModalOpen(true)}
          hasPrevious={currentQuestionIndex > 0 || currentSectionIndex > 0}
          hasNext={
            currentQuestionIndex < currentExamQuestions.length - 1 ||
            currentSectionIndex < examSections.length - 1
          }
        />

        {/* NTA Submit Confirmation Modal */}
        <SubmitConfirmModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onConfirmSubmit={handleConfirmSubmit}
          sections={examSections}
          answers={answersMap}
          formattedTime={formattedRemainingTime}
          isSubmitting={isSubmitting}
        />

        {/* Question Paper Preview Modal */}
        <QuestionPaperModal
          isOpen={isQuestionPaperOpen}
          onClose={() => setIsQuestionPaperOpen(false)}
          sections={examSections}
          answers={answersMap}
          onSelectQuestion={handleJumpFromQuestionPaper}
        />

        {/* Instructions Modal */}
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ARCADE GAMIFIED RAPID PRACTICE VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 font-sans select-none space-y-5">
      {/* Top Gaming HUD Bar */}
      <div className="bg-[#1A2B4C] text-[#FBF9F5] px-5 py-3.5 border border-[#1C1D21] shadow-tactile flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-[#C88A2D] text-[#1C1D21]">
            ARCADE
          </span>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-sm text-white">
              {currentArcadeQuestion?.subject || 'Class 12 STEM'}
            </span>
            <span className="font-mono text-xs text-stone-300 ml-1.5">
              / {currentArcadeQuestion?.chapter || 'Practice Run'}
            </span>
          </div>
        </div>

        {/* Streak & XP Multipliers */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5 bg-[#121F38] px-3 py-1 border border-[#2E323B]">
            <Flame
              className={`w-4 h-4 ${
                session.streak > 0 ? 'text-[#D97706] animate-bounce' : 'text-stone-500'
              }`}
            />
            <span className="font-bold text-xs text-[#FBF9F5]">{session.streak} Streak</span>
            <span className="text-[10px] text-[#C88A2D]">
              ({(1.0 + Math.min(session.streak * 0.2, 2.0)).toFixed(1)}x)
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C88A2D]" />
            <span className="font-bold text-[#FBF9F5]">{session.xpEarned} XP</span>
          </div>
        </div>

        <button
          onClick={handleFinishSession}
          className="text-xs font-mono px-2.5 py-1 bg-[#121F38] hover:bg-[#A83232] text-white border border-[#2E323B] transition btn-tactile cursor-pointer"
        >
          Exit Arena
        </button>
      </div>

      {/* Main Arcade Question Card */}
      {currentArcadeQuestion ? (
        <div className="bg-white border-2 border-[#1C1D21] shadow-tactile p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#DCD6CD] pb-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#1A2B4C] text-white font-bold">
                Q {arcadeIndex + 1}
              </span>
              <span className="text-[#575A65]">
                {currentArcadeQuestion.chapter} · {currentArcadeQuestion.subtopic}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#C88A2D] bg-[#FFF7ED] px-2 py-0.5 border border-[#C88A2D]/40">
              {currentArcadeQuestion.difficulty}
            </span>
          </div>

          <div className="text-base sm:text-lg font-medium text-[#1C1D21] leading-relaxed">
            <MathRenderer content={currentArcadeQuestion.text} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentArcadeQuestion.options.map((opt) => {
              const isSelected = arcadeSelectedOption === opt.key;
              const isCorrectOpt = arcadeEvaluationResult?.correctOption === opt.key;
              const isWrongSelection = isSelected && !arcadeEvaluationResult?.isCorrect;

              let optionStyle =
                'bg-[#FBF9F5] border-[#1C1D21] text-[#1C1D21] hover:bg-[#F4EFEA] hover:shadow-tactile';

              if (arcadeIsEvaluated) {
                if (isCorrectOpt) {
                  optionStyle = 'bg-[#EBF5F0] border-[#236B47] text-[#236B47] shadow-tactile-emerald font-bold';
                } else if (isWrongSelection) {
                  optionStyle = 'bg-[#FDF0F0] border-[#A83232] text-[#A83232] shadow-tactile-crimson font-bold';
                } else {
                  optionStyle = 'bg-[#FBF9F5] border-[#DCD6CD] text-[#8E929E] opacity-50';
                }
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={arcadeIsEvaluated}
                  onClick={() => handleSelectOptionArcade(opt.key)}
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                      isCorrectOpt && arcadeIsEvaluated
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

          {/* Arcade Immediate KaTeX Derivation */}
          {arcadeIsEvaluated && arcadeEvaluationResult && (
            <div
              className={`p-5 border-2 text-xs font-sans space-y-3 animate-in fade-in duration-200 ${
                arcadeEvaluationResult.isCorrect ? 'bg-[#F4FAF6] border-[#236B47]' : 'bg-[#FDF6F6] border-[#A83232]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {arcadeEvaluationResult.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#236B47]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#A83232]" />
                  )}
                  <span
                    className={`font-serif font-bold text-sm ${
                      arcadeEvaluationResult.isCorrect ? 'text-[#236B47]' : 'text-[#A83232]'
                    }`}
                  >
                    {arcadeEvaluationResult.isCorrect
                      ? `Brilliant! +${arcadeEvaluationResult.addedXp} XP Earned`
                      : `Incorrect. Correct Option is (${arcadeEvaluationResult.correctOption})`}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 border border-[#DCD6CD] space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#575A65]">
                  Step-by-Step Analytical Derivation:
                </span>
                <div className="text-xs text-[#1C1D21] font-mono leading-relaxed overflow-x-auto">
                  <MathRenderer content={arcadeEvaluationResult.solutionText} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextArcadeQuestion}
                  className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center gap-2 cursor-pointer shadow-tactile"
                >
                  <span>Next Challenge ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 border border-[#1C1D21] text-center font-mono text-xs text-[#575A65] space-y-3">
          <div className="w-8 h-8 border-3 border-[#1A2B4C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Prefetching Next Challenge from Gemini Engine...</p>
        </div>
      )}
    </div>
  );
};

export default PracticeArenaPage;
