import React from 'react';
import type { Question } from '../../types';
import MathRenderer from '../common/MathRenderer';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestionsInSection: number;
  marks: number;
  negativeMarks: number;
  fontSize?: 'small' | 'normal' | 'large';
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestionsInSection,
  marks,
  negativeMarks,
  fontSize = 'normal',
}) => {
  const fontSizeClass =
    fontSize === 'small' ? 'text-base' : fontSize === 'large' ? 'text-xl' : 'text-lg';

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Journal Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#1C1D21]">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif font-bold text-lg sm:text-xl text-[#1C1D21] tracking-tight">
            Question {questionNumber}
          </span>
          <span className="text-[#575A65] font-mono text-xs uppercase">
            / {totalQuestionsInSection}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#1C1D21]">
          <span className="text-[11px] font-bold uppercase bg-[#F4EFEA] border border-[#1C1D21] px-2 py-0.5 shadow-xs">
            {question.type === 'SINGLE_CHOICE'
              ? 'Single Choice'
              : question.type === 'MULTIPLE_CHOICE'
              ? 'Multiple Choice'
              : 'Numerical'}
          </span>
          <span className="font-bold text-[#236B47] bg-[#EBF5F0] border border-[#236B47] px-2 py-0.5">
            +{marks}.0
          </span>
          {negativeMarks > 0 && (
            <span className="font-bold text-[#A83232] bg-[#FDF0F0] border border-[#A83232] px-2 py-0.5">
              -{negativeMarks}.0
            </span>
          )}
        </div>
      </div>

      {/* Main Question Body */}
      <div className={`${fontSizeClass} text-[#1C1D21] leading-relaxed font-sans py-2`}>
        <MathRenderer content={question.text} />
      </div>

      {/* Question Diagram / Image */}
      {question.imageUrl && (
        <div className="my-4 max-w-lg border border-[#1C1D21] p-2 bg-[#F4EFEA] shadow-tactile">
          <img
            src={question.imageUrl}
            alt="Question Diagram"
            className="max-h-72 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
