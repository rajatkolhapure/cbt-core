import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, FileText, HelpCircle, LayoutGrid } from 'lucide-react';

interface ExamHeaderProps {
  examTitle: string;
  formattedTime: string;
  isLowTime: boolean;
  isCriticalTime: boolean;
  currentSectionName?: string;
  strikesCount?: number;
  maxStrikes?: number;
  fontSize: 'small' | 'normal' | 'large';
  onChangeFontSize: (size: 'small' | 'normal' | 'large') => void;
  onOpenQuestionPaper: () => void;
  onOpenInstructions: () => void;
  onToggleMobilePalette?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  examTitle,
  formattedTime,
  isLowTime,
  isCriticalTime,
  fontSize,
  onChangeFontSize,
  onOpenQuestionPaper,
  onOpenInstructions,
  onToggleMobilePalette,
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-[#1A2B4C] text-[#FBF9F5] px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none shrink-0 font-sans border-b border-[#1C1D21] shadow-tactile">
      {/* Left: Exam Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 bg-[#C88A2D] text-[#1C1D21] border border-[#1C1D21] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
          CBT
        </div>
        <h1 className="font-serif text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">
          {examTitle || 'Standardized Examination'}
        </h1>
      </div>

      {/* Center: Laboratory Stopwatch / Digital Counter */}
      <div className="flex items-center gap-2 bg-[#0C0D0F] px-3.5 py-1 border border-[#2E323B] shrink-0 shadow-inner">
        <Clock
          className={`w-3.5 h-3.5 ${
            isCriticalTime
              ? 'text-[#A83232] animate-pulse'
              : isLowTime
              ? 'text-[#C88A2D]'
              : 'text-[#8E929E]'
          }`}
        />
        <span
          className={`font-mono text-sm sm:text-base font-bold tracking-widest ${
            isCriticalTime
              ? 'text-[#A83232]'
              : isLowTime
              ? 'text-[#C88A2D]'
              : 'text-[#FBF9F5]'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Right: Quick Tools & Candidate Details */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onToggleMobilePalette && (
          <button
            type="button"
            onClick={onToggleMobilePalette}
            className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 bg-[#121F38] hover:bg-[#1A2B4C] text-[#FBF9F5] text-xs font-mono uppercase border border-[#2E323B] btn-tactile cursor-pointer"
            title="Open Question Palette"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#C88A2D]" />
            <span>Palette</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenQuestionPaper}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121F38] hover:bg-[#1A2B4C] text-[#FBF9F5] text-xs font-mono uppercase border border-[#2E323B] btn-tactile cursor-pointer"
          title="View Full Question Paper"
        >
          <FileText className="w-3.5 h-3.5 text-[#8E929E]" />
          <span className="hidden sm:inline">Paper</span>
        </button>

        <button
          type="button"
          onClick={onOpenInstructions}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121F38] hover:bg-[#1A2B4C] text-[#FBF9F5] text-xs font-mono uppercase border border-[#2E323B] btn-tactile cursor-pointer"
          title="View Instructions"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#8E929E]" />
          <span className="hidden sm:inline">Rules</span>
        </button>

        {/* Font Switcher */}
        <div className="hidden md:flex items-center border border-[#2E323B] bg-[#121F38]">
          {(['small', 'normal', 'large'] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => onChangeFontSize(sz)}
              className={`px-2 py-0.5 font-mono text-[10px] uppercase font-bold transition-colors duration-160 cursor-pointer ${
                fontSize === sz
                  ? 'bg-[#C88A2D] text-[#1C1D21]'
                  : 'text-[#8E929E] hover:text-[#FBF9F5] hover:bg-[#1A2B4C]'
              }`}
            >
              {sz === 'small' ? 'A-' : sz === 'normal' ? 'A' : 'A+'}
            </button>
          ))}
        </div>

        {/* Candidate Badge */}
        <div className="hidden xl:flex items-center pl-2 border-l border-[#2E323B] text-[11px] font-mono">
          <span className="text-[#C88A2D] font-bold truncate max-w-[110px]">
            {user?.candidateId || user?.name || 'CANDIDATE'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
