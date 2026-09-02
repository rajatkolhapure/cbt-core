import React from 'react';
import type { Question, Answer } from '../../types';
import { X } from 'lucide-react';

export type QuestionStatus =
  | 'NOT_VISITED'
  | 'NOT_ANSWERED'
  | 'ANSWERED'
  | 'MARKED_FOR_REVIEW'
  | 'ANSWERED_AND_MARKED';

interface QuestionPaletteProps {
  questions: Array<{ id: string; order: number; question: Question }>;
  currentQuestionIndex: number;
  answers: Map<string, Answer | any>;
  onSelectQuestion: (index: number) => void;
  sectionName: string;
  onCloseMobile?: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  onSelectQuestion,
  onCloseMobile,
}) => {
  const getStatus = (questionId: string, index: number): QuestionStatus => {
    const ans = answers.get(questionId);

    const isVisited = ans?.isVisited || index === currentQuestionIndex;
    const hasResponse =
      (ans?.selectedOptions && ans.selectedOptions.length > 0) ||
      (ans?.numericalAnswer !== null && ans?.numericalAnswer !== undefined);
    const isMarked = !!ans?.isMarkedForReview;

    if (hasResponse && isMarked) return 'ANSWERED_AND_MARKED';
    if (isMarked) return 'MARKED_FOR_REVIEW';
    if (hasResponse) return 'ANSWERED';
    if (isVisited) return 'NOT_ANSWERED';
    return 'NOT_VISITED';
  };

  const summaryCounts = questions.reduce(
    (acc, q, idx) => {
      const status = getStatus(q.question.id, idx);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {
      ANSWERED: 0,
      NOT_ANSWERED: 0,
      NOT_VISITED: 0,
      MARKED_FOR_REVIEW: 0,
      ANSWERED_AND_MARKED: 0,
    } as Record<QuestionStatus, number>
  );

  const handleItemClick = (idx: number) => {
    onSelectQuestion(idx);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-full lg:w-88 bg-[#F4EFEA] border-l border-[#1C1D21] flex flex-col shrink-0 select-none overflow-y-auto font-sans h-full max-h-full">
      {/* Legend Header & Status Grid */}
      <div className="p-3.5 border-b border-[#1C1D21] bg-white space-y-3">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>QUESTION PALETTE</span>
            <span className="font-mono text-[#1C1D21] bg-[#F4EFEA] px-2 py-0.5 border border-[#1C1D21] text-[10px] shadow-xs">
              TOTAL: {questions.length}
            </span>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#1C1D21] hover:bg-[#F4EFEA] border border-[#1C1D21] btn-tactile"
              title="Close Palette"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Stamp Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#1C1D21]">
          {/* Answered */}
          <div className="flex items-center gap-2 p-1.5 bg-[#EBF5F0] border border-[#236B47]">
            <span className="w-5 h-5 bg-[#236B47] text-[#FBF9F5] font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
              {summaryCounts.ANSWERED}
            </span>
            <span className="truncate text-[11px] font-bold text-[#236B47]">ANSWERED</span>
          </div>

          {/* Not Answered */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FDF0F0] border border-[#A83232]">
            <span className="w-5 h-5 bg-[#A83232] text-[#FBF9F5] font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
              {summaryCounts.NOT_ANSWERED}
            </span>
            <span className="truncate text-[11px] font-bold text-[#A83232]">UNANSWERED</span>
          </div>

          {/* Marked for Review */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FEF8ED] border border-[#C88A2D]">
            <span className="w-5 h-5 bg-[#C88A2D] text-[#1C1D21] font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
              {summaryCounts.MARKED_FOR_REVIEW}
            </span>
            <span className="truncate text-[11px] font-bold text-[#C88A2D]">REVIEW</span>
          </div>

          {/* Not Visited */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FBF9F5] border border-[#1C1D21]/30">
            <span className="w-5 h-5 bg-white text-[#575A65] font-bold font-mono text-[11px] border border-[#1C1D21]/40 flex items-center justify-center shrink-0">
              {summaryCounts.NOT_VISITED}
            </span>
            <span className="truncate text-[11px] font-bold text-[#575A65]">UNVISITED</span>
          </div>
        </div>
      </div>

      {/* Palette Matrix Grid */}
      <div className="p-3.5 flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const status = getStatus(q.question.id, idx);
            const isCurrent = idx === currentQuestionIndex;

            let colorClasses = 'bg-white border-[#1C1D21]/40 text-[#1C1D21] hover:border-[#1C1D21]';

            if (status === 'ANSWERED') {
              colorClasses = 'bg-[#236B47] border-[#1C1D21] text-white font-bold';
            } else if (status === 'ANSWERED_AND_MARKED') {
              colorClasses = 'bg-[#236B47] border-2 border-[#C88A2D] text-white font-bold';
            } else if (status === 'MARKED_FOR_REVIEW') {
              colorClasses = 'bg-[#C88A2D] border-[#1C1D21] text-[#1C1D21] font-bold';
            } else if (status === 'NOT_ANSWERED') {
              colorClasses = 'bg-[#A83232] border-[#1C1D21] text-white font-bold';
            } else if (status === 'NOT_VISITED') {
              colorClasses = 'bg-[#FFFFFF] border border-[#1C1D21]/30 text-[#575A65] hover:bg-[#F4EFEA]';
            }

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => handleItemClick(idx)}
                className={`h-9 border font-mono text-xs flex items-center justify-center transition-all duration-75 btn-tactile relative ${colorClasses} ${
                  isCurrent
                    ? 'ring-2 ring-[#1A2B4C] ring-offset-1 font-black shadow-tactile'
                    : ''
                }`}
                title={`Question ${idx + 1} (${status})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default QuestionPalette;
