import React from 'react';
import { ChevronLeft, ChevronRight, BookmarkCheck, RotateCcw, Send } from 'lucide-react';

interface ExamNavigationProps {
  onPrevious: () => void;
  onSaveAndNext: () => void;
  onClearResponse: () => void;
  onMarkForReviewAndNext: () => void;
  onSubmitExam: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const ExamNavigation: React.FC<ExamNavigationProps> = ({
  onPrevious,
  onSaveAndNext,
  onClearResponse,
  onMarkForReviewAndNext,
  onSubmitExam,
  hasPrevious,
  hasNext,
}) => {
  return (
    <footer className="bg-white border-t border-[#1C1D21] px-3.5 sm:px-6 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 select-none shrink-0 font-sans shadow-tactile">
      {/* Left Utilities: Mark Review & Clear */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMarkForReviewAndNext}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF8ED] hover:bg-[#FBF3E4] text-[#C88A2D] font-mono text-xs font-bold uppercase border border-[#C88A2D] btn-tactile cursor-pointer"
          title="Flag question for review and proceed"
        >
          <BookmarkCheck className="w-3.5 h-3.5 text-[#C88A2D]" />
          <span className="hidden sm:inline">Mark for Review &amp; Next</span>
          <span className="sm:hidden">Review</span>
        </button>

        <button
          type="button"
          onClick={onClearResponse}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#FBF9F5] hover:bg-[#EAE3D9] text-[#575A65] hover:text-[#1C1D21] font-mono text-xs font-bold uppercase border border-[#1C1D21]/40 btn-tactile cursor-pointer"
          title="Deselect chosen option"
        >
          <RotateCcw className="w-3 h-3 text-[#575A65]" />
          <span>Clear</span>
        </button>
      </div>

      {/* Right Core Actions: Previous, Save & Next, Submit */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FBF9F5] hover:bg-[#EAE3D9] text-[#1C1D21] font-mono text-xs font-bold uppercase border border-[#1C1D21] btn-tactile disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Previous Question"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onSaveAndNext}
          className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#1A2B4C] hover:bg-[#121F38] text-[#FBF9F5] font-mono text-xs font-bold uppercase border border-[#1C1D21] btn-tactile shadow-tactile cursor-pointer"
          title="Save response and advance to next question"
        >
          <span>{hasNext ? 'Save & Next' : 'Save Response'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#C88A2D]" />
        </button>

        <button
          type="button"
          onClick={onSubmitExam}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#C88A2D] hover:bg-[#B37923] text-[#1C1D21] font-mono text-xs font-bold uppercase border border-[#1C1D21] btn-tactile shadow-tactile cursor-pointer ml-1"
          title="Submit Examination Paper"
        >
          <Send className="w-3 h-3 text-[#1C1D21]" />
          <span>Submit Paper</span>
        </button>
      </div>
    </footer>
  );
};

export default ExamNavigation;
