import React from 'react';
import {
  ShieldCheck,
  Maximize2,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { IntegrityViolation } from '../../hooks/useExamIntegrity';

interface IntegrityWarningModalProps {
  isLocked: boolean;
  hasStartedFullscreen: boolean;
  activeViolation: IntegrityViolation | null;
  strikesCount: number;
  maxStrikes: number;
  onEnterFullscreen: () => void;
  isSubmitting?: boolean;
}

export const IntegrityWarningModal: React.FC<IntegrityWarningModalProps> = ({
  isLocked,
  hasStartedFullscreen,
  activeViolation,
  strikesCount,
  maxStrikes,
  onEnterFullscreen,
  isSubmitting = false,
}) => {
  if (!isLocked) return null;

  // Case 1: Initial Pre-Exam Fullscreen Gate
  if (!hasStartedFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 select-none font-sans animate-in fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-center">
          <div className="bg-slate-900 text-white p-6 flex flex-col items-center">
            <div className="w-13 h-13 rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Standardized Examination Console
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Please enter fullscreen mode to start your test environment
            </p>
          </div>

          <div className="p-6 space-y-4 text-left text-xs text-slate-700">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-slate-800">
              <p className="font-semibold flex items-center gap-1.5 text-slate-900 text-xs">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                Guidelines for a smooth examination experience:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600 pl-1">
                <li>The examination is conducted in strict fullscreen focus mode.</li>
                <li>Stay on the test canvas until you are ready to submit your paper.</li>
                <li>Clipboard actions and right-click shortcuts are disabled for exam security.</li>
                <li>If you leave the test window, you will have 5 minutes to return before auto-submission.</li>
              </ul>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Click the button below when you are ready to begin.
            </p>

            <button
              type="button"
              onClick={onEnterFullscreen}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Enter Fullscreen & Begin Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Focus / Fullscreen Restoration Gate (Polite & Reassuring UX)
  const isTerminated = strikesCount >= maxStrikes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 select-none font-sans animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-center animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col items-center">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-3">
            <Info className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {isTerminated ? 'Examination Session Concluded' : 'Session Focus Notice'}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1 bg-amber-950/70 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full text-[11px] font-mono font-medium">
            Notice count: {strikesCount} of {maxStrikes}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-slate-800 space-y-1.5 text-left">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>System Note:</span>
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {activeViolation?.message ||
                'The examination window temporarily lost focus. Please return to fullscreen mode to continue.'}
            </p>
            <p className="text-[11px] text-slate-500 italic">
              Please inform your invigilator if you experience any display or driver glitches during the exam.
            </p>
          </div>

          {isTerminated ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-left space-y-1.5">
              <p className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Session auto-submission in progress
              </p>
              <p className="text-[11px] text-slate-600">
                Your answers have been securely recorded and dispatched to the evaluation engine.
              </p>
              {isSubmitting && (
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mt-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting responses...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600 text-left text-xs">
                To continue your exam without interruption, click below to re-enter fullscreen.
              </p>

              <button
                type="button"
                onClick={onEnterFullscreen}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Return to Fullscreen & Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrityWarningModal;
