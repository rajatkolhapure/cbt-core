import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import type { ExamSection, Question, Answer, SaveAnswerInput } from '../../types';
import { useExamTimer } from '../../hooks/useExamTimer';
import { useExamIntegrity } from '../../hooks/useExamIntegrity';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

import ExamHeader from '../../components/exam/ExamHeader';
import SectionTabs from '../../components/exam/SectionTabs';
import QuestionDisplay from '../../components/exam/QuestionDisplay';
import OptionList from '../../components/exam/OptionList';
import NumericalInput from '../../components/exam/NumericalInput';
import QuestionPalette from '../../components/exam/QuestionPalette';
import ExamNavigation from '../../components/exam/ExamNavigation';
import SubmitConfirmModal from '../../components/exam/SubmitConfirmModal';
import IntegrityWarningModal from '../../components/exam/IntegrityWarningModal';
import ConnectionStatus from '../../components/exam/ConnectionStatus';
import QuestionPaperModal from '../../components/exam/QuestionPaperModal';
import InstructionsModal from '../../components/exam/InstructionsModal';

export const ExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attempt Data
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>('');
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [serverEndTime, setServerEndTime] = useState<string | null>(null);
  const [allowSectionJump, setAllowSectionJump] = useState(true);

  // Navigation state within test
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Utilities state
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');

  // Answers Map: questionId -> Answer state
  const [answersMap, setAnswersMap] = useState<Map<string, Answer | any>>(new Map());

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track time spent per question
  const questionStartTime = useRef<number>(Date.now());

  // 1. Network & Offline sync hook
  const { isOnline, isSyncing, pendingSyncCount, queueAnswer } = useNetworkStatus({
    attemptId: attemptId || undefined,
  });

  // 2. Timer hook
  const handleTimeExpired = useCallback(async () => {
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/attempts/${attemptId}/submit`, { isAutoSubmit: true });
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch {
      navigate(`/student/dashboard`, { replace: true });
    }
  }, [attemptId, isSubmitting, navigate]);

  const { formattedTime, isLowTime, isCriticalTime } = useExamTimer({
    initialRemainingSeconds: 3600,
    serverEndTime,
    onTimeExpired: handleTimeExpired,
  });

  // 3. Integrity Monitoring & Anti-Cheat Enforcement hook
  const handleAutoSubmitIntegrity = useCallback(
    async (_reason?: string) => {
      if (!attemptId || isSubmitting) return;
      setIsSubmitting(true);
      try {
        await api.post(`/attempts/${attemptId}/submit`, {
          isAutoSubmit: true,
        });
        navigate(`/student/results/${attemptId}`, { replace: true });
      } catch {
        navigate(`/student/dashboard`, { replace: true });
      }
    },
    [attemptId, isSubmitting, navigate]
  );

  const {
    isLocked,
    hasStartedFullscreen,
    strikesCount,
    maxStrikes,
    activeViolation,
    enterFullscreen,
    isAbsent,
    exitSecondsRemaining,
  } = useExamIntegrity({
    attemptId: attemptId || undefined,
    isEnabled: true, // Active across all tests
    maxStrikes: 3,
    absentTimeoutSeconds: 300, // 5-minute auto-submit on window exit
    onAutoSubmit: handleAutoSubmitIntegrity,
  });

  // 4. Initialize or Resume Examination Attempt
  useEffect(() => {
    const initAttempt = async () => {
      if (!examId) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await api.post('/attempts/start', {
          examId,
          examEnvironment: 'FULLSCREEN_BROWSER',
          userAgent: navigator.userAgent,
        });

        const { attempt, exam, answers } = res.data;
        setAttemptId(attempt.id);
        setExamTitle(exam.title);
        setSections(exam.sections || []);
        setServerEndTime(attempt.serverEndTime);
        setAllowSectionJump(exam.sections?.[0]?.allowSectionJump ?? true);

        // Populate initial answers map
        const initialMap = new Map<string, any>();
        if (answers && Array.isArray(answers)) {
          answers.forEach((ans: any) => {
            initialMap.set(ans.questionId, ans);
          });
        }
        setAnswersMap(initialMap);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.error || 'Failed to initialize examination session.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initAttempt();
  }, [examId]);

  // Current active section and question
  const currentSection = sections[currentSectionIndex] || null;
  const currentExamQuestions = currentSection?.questions || [];
  const currentExamQuestion = currentExamQuestions[currentQuestionIndex] || null;
  const currentQuestion: Question | null = currentExamQuestion?.question || null;

  // Active answer for currently selected question
  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion.id) : null;

  // Mark current question as visited
  useEffect(() => {
    if (!currentQuestion || !currentExamQuestion || !attemptId) return;

    questionStartTime.current = Date.now();

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id);
      if (!existing) {
        next.set(currentQuestion.id, {
          questionId: currentQuestion.id,
          examQuestionId: currentExamQuestion.id,
          isVisited: true,
          isMarkedForReview: false,
          selectedOptions: null,
          numericalAnswer: null,
          timeSpentSeconds: 0,
        });
      } else if (!existing.isVisited) {
        next.set(currentQuestion.id, { ...existing, isVisited: true });
      }
      return next;
    });
  }, [currentSectionIndex, currentQuestionIndex, currentQuestion?.id]);

  // Persist / Save Answer to Backend (or offline queue)
  const saveCurrentResponse = useCallback(
    async (isMarked: boolean = false) => {
      if (!currentQuestion || !currentExamQuestion || !attemptId) return;

      const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
      questionStartTime.current = Date.now();

      const existing = answersMap.get(currentQuestion.id) || {};
      const payload: SaveAnswerInput = {
        questionId: currentQuestion.id,
        examQuestionId: currentExamQuestion.id,
        selectedOptions: existing.selectedOptions ?? null,
        numericalAnswer: existing.numericalAnswer ?? null,
        isMarkedForReview: isMarked,
        isVisited: true,
        timeSpentSeconds: Math.max(1, timeSpent),
      };

      // Optimistic update local map
      setAnswersMap((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion.id, {
          ...existing,
          ...payload,
        });
        return next;
      });

      // Send to server or queue
      if (navigator.onLine) {
        try {
          await api.post(`/attempts/${attemptId}/answer`, payload);
        } catch {
          queueAnswer(payload);
        }
      } else {
        queueAnswer(payload);
      }
    },
    [currentQuestion, currentExamQuestion, attemptId, answersMap, queueAnswer]
  );

  // Handlers for option / numerical choice selection
  const handleSelectOption = (optIdx: number) => {
    if (!currentQuestion) return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) || {};

      let selectedOptions: number[];
      if (currentQuestion.type === 'SINGLE_CHOICE') {
        selectedOptions = [optIdx];
      } else {
        const arr = Array.isArray(existing.selectedOptions)
          ? [...existing.selectedOptions]
          : [];
        const pos = arr.indexOf(optIdx);
        if (pos > -1) arr.splice(pos, 1);
        else arr.push(optIdx);
        selectedOptions = arr;
      }

      next.set(currentQuestion.id, {
        ...existing,
        selectedOptions,
        isVisited: true,
      });
      return next;
    });
  };

  const handleNumericalChange = (num: number | null) => {
    if (!currentQuestion) return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentQuestion.id) || {};
      next.set(currentQuestion.id, {
        ...existing,
        numericalAnswer: num,
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
        selectedOptions: null,
        numericalAnswer: null,
      });
      return next;
    });
  };

  // Navigation Handlers
  const handleNext = async () => {
    await saveCurrentResponse(false);

    if (currentQuestionIndex < currentExamQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < sections.length - 1 && allowSectionJump) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleMarkForReviewAndNext = async () => {
    await saveCurrentResponse(true);

    if (currentQuestionIndex < currentExamQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < sections.length - 1 && allowSectionJump) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSectionIndex > 0 && allowSectionJump) {
      setCurrentSectionIndex((prev) => prev - 1);
      const prevSectionQuestions = sections[currentSectionIndex - 1]?.questions || [];
      setCurrentQuestionIndex(Math.max(0, prevSectionQuestions.length - 1));
    }
  };

  const handleDirectJump = (questionIdx: number) => {
    saveCurrentResponse(false);
    setCurrentQuestionIndex(questionIdx);
  };

  const handleSectionSwitch = (secIdx: number) => {
    saveCurrentResponse(false);
    setCurrentSectionIndex(secIdx);
    setCurrentQuestionIndex(0);
  };

  const handleJumpFromQuestionPaper = (secIdx: number, qIdx: number) => {
    saveCurrentResponse(false);
    setCurrentSectionIndex(secIdx);
    setCurrentQuestionIndex(qIdx);
  };

  // Submission handler
  const handleConfirmSubmit = async () => {
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await saveCurrentResponse(false);
      await api.post(`/attempts/${attemptId}/submit`, { isAutoSubmit: false });
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit examination.');
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isSubmitModalOpen ||
        isQuestionPaperOpen ||
        isInstructionsOpen ||
        document.activeElement?.tagName === 'INPUT'
      )
        return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (['1', '2', '3', '4'].includes(e.key) && currentQuestion?.options) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (optIdx < currentQuestion.options.length) {
          handleSelectOption(optIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSubmitModalOpen,
    isQuestionPaperOpen,
    isInstructionsOpen,
    currentQuestion,
    handleNext,
    handlePrevious,
  ]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#141619] text-[#FBF9F5] flex flex-col items-center justify-center p-6 select-none font-mono animate-shutter">
        <div className="bg-[#1D2026] border-2 border-[#2E323B] p-8 max-w-sm w-full text-center shadow-[4px_4px_0px_0px_#0C0D0F]">
          <div className="w-12 h-12 mx-auto mb-4 bg-[#141619] border border-[#C88A2D] flex items-center justify-center">
            <div className="w-4 h-4 bg-[#C88A2D] animate-ping" />
          </div>
          <h2 className="font-serif text-lg font-bold text-white tracking-tight">Setting Up Test Canvas</h2>
          <p className="text-[11px] text-[#8E929E] mt-2 leading-relaxed font-mono">
            &gt; SYNCHRONIZING AUTHORITATIVE CLOCK &amp; QUESTION DATA...
          </p>
          <div className="mt-5 h-1.5 w-full bg-[#141619] border border-[#2E323B] overflow-hidden">
            <div className="h-full bg-[#C88A2D] animate-pulse w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !currentQuestion) {
    return (
      <div className="h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 border border-[#1C1D21] shadow-tactile-lg max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-[#FDF0F0] border border-[#A83232] text-[#A83232] flex items-center justify-center mx-auto font-bold text-lg">
            !
          </div>
          <h2 className="font-serif text-lg font-bold text-[#1C1D21]">Examination Error</h2>
          <p className="text-xs text-[#575A65] leading-normal">{errorMessage || 'Question not found'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-2.5 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold btn-tactile cursor-pointer"
          >
            Return to Candidate Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#FBF9F5] overflow-hidden font-sans select-none">
      {/* 1. Header with timer, user info, font size, and quick modals */}
      <ExamHeader
        examTitle={examTitle}
        formattedTime={formattedTime}
        isLowTime={isLowTime}
        isCriticalTime={isCriticalTime}
        currentSectionName={currentSection?.name}
        strikesCount={strikesCount}
        maxStrikes={maxStrikes}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onOpenQuestionPaper={() => setIsQuestionPaperOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        onToggleMobilePalette={() => setIsMobilePaletteOpen((prev) => !prev)}
      />

      {/* 2. Subject Section Switcher Tabs */}
      <SectionTabs
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        onSelectSection={handleSectionSwitch}
        allowSectionJump={allowSectionJump}
      />

      {/* 3. Main Center Split View: Full Width Question Area on Mobile + Responsive Palette */}
      <div
        className={`flex-1 flex min-h-0 overflow-hidden relative ${
          isLocked ? 'filter blur-sm select-none pointer-events-none' : ''
        }`}
      >
        {/* Main Question Scroll Area (Full Width on Mobile, Left Column on Desktop) */}
        <main className="flex-1 w-full p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-white border-r border-[#1C1D21] shadow-2xs">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestionsInSection={currentExamQuestions.length}
            marks={currentSection?.marksPerQuestion || currentQuestion.marks}
            negativeMarks={currentSection?.negativeMarksPerQuestion || currentQuestion.negativeMarks}
            fontSize={fontSize}
          />

          {/* Option List or Numerical Input */}
          {currentQuestion.type === 'NUMERICAL' ? (
            <NumericalInput
              value={currentAnswer?.numericalAnswer}
              onChange={handleNumericalChange}
            />
          ) : (
            <OptionList
              options={currentQuestion.options || []}
              type={currentQuestion.type as any}
              selectedOptions={currentAnswer?.selectedOptions}
              onSelectOption={handleSelectOption}
              fontSize={fontSize}
            />
          )}
        </main>

        {/* Desktop Sidebar: Question Palette Grid & Legend */}
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

      {/* 4. Fixed Bottom Action Control Bar */}
      <ExamNavigation
        onPrevious={handlePrevious}
        onSaveAndNext={handleNext}
        onClearResponse={handleClearResponse}
        onMarkForReviewAndNext={handleMarkForReviewAndNext}
        onSubmitExam={() => setIsSubmitModalOpen(true)}
        hasPrevious={currentQuestionIndex > 0 || (currentSectionIndex > 0 && allowSectionJump)}
        hasNext={
          currentQuestionIndex < currentExamQuestions.length - 1 ||
          (currentSectionIndex < sections.length - 1 && allowSectionJump)
        }
      />

      {/* 5. Modals & Overlays */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        sections={sections}
        answers={answersMap}
        formattedTime={formattedTime}
        isSubmitting={isSubmitting}
      />

      {/* Question Paper Preview Modal */}
      <QuestionPaperModal
        isOpen={isQuestionPaperOpen}
        onClose={() => setIsQuestionPaperOpen(false)}
        sections={sections}
        answers={answersMap}
        onSelectQuestion={handleJumpFromQuestionPaper}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Strict Anti-Cheat Fullscreen Gate & Security Lockout Modal */}
      <IntegrityWarningModal
        isLocked={isLocked}
        hasStartedFullscreen={hasStartedFullscreen}
        activeViolation={activeViolation}
        strikesCount={strikesCount}
        maxStrikes={maxStrikes}
        onEnterFullscreen={enterFullscreen}
        isSubmitting={isSubmitting}
      />

      {/* 5-Minute Absence Countdown Overlay */}
      {isAbsent && !isLocked && (
        <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            {/* Warning Icon */}
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              You Have Left the Exam
            </h1>
            <p className="text-red-300 text-sm sm:text-base mb-8">
              Return to the test window immediately. Your exam will be auto-submitted when the countdown reaches zero.
            </p>

            {/* Big Countdown */}
            <div className={`text-7xl sm:text-8xl font-mono font-black mb-4 tabular-nums ${
              (exitSecondsRemaining ?? 0) <= 30 ? 'text-red-400 animate-pulse' :
              (exitSecondsRemaining ?? 0) <= 60 ? 'text-orange-400' : 'text-white'
            }`}>
              {exitSecondsRemaining !== null
                ? `${Math.floor(exitSecondsRemaining / 60)}:${String(exitSecondsRemaining % 60).padStart(2, '0')}`
                : '5:00'}
            </div>

            <p className="text-red-400 text-xs uppercase tracking-widest font-semibold">
              Remaining before auto-submission
            </p>

            {/* Progress bar */}
            <div className="mt-6 h-2 w-full bg-red-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${((exitSecondsRemaining ?? 0) / 300) * 100}%` }}
              />
            </div>

            <p className="mt-6 text-red-400/70 text-xs">
              Click on this window or return to the exam to dismiss
            </p>
          </div>
        </div>
      )}

      <ConnectionStatus
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingSyncCount={pendingSyncCount}
      />
    </div>
  );
};

export default ExamPage;
