import React from 'react';
import { X, FileText } from 'lucide-react';
import type { ExamSection, Question, Answer } from '../../types';
import MathRenderer from '../common/MathRenderer';

interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ExamSection[];
  answers: Map<string, Answer | any>;
  onSelectQuestion: (sectionIdx: number, questionIdx: number) => void;
}

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({
  isOpen,
  onClose,
  sections,
  answers,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-100 font-sans">
      <div className="bg-white rounded-md border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight uppercase">
              Full Question Paper Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#C88A2D] p-1 rounded transition-colors duration-150 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-xs text-slate-800">
          {sections.map((sec, secIdx) => {
            const questions = sec.questions || [];

            return (
              <div key={sec.id || secIdx} className="space-y-4">
                <div className="bg-slate-100 p-2.5 rounded border border-slate-300 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase text-xs">
                    {sec.name} ({questions.length} Questions)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-600 font-medium">
                    +{sec.marksPerQuestion} / -{sec.negativeMarksPerQuestion} Marks
                  </span>
                </div>

                <div className="space-y-4">
                  {questions.map((qWrapper, qIdx) => {
                    const q: Question = qWrapper.question;
                    const ans = answers.get(q.id);
                    const isAnswered =
                      (ans?.selectedOptions && ans.selectedOptions.length > 0) ||
                      (ans?.numericalAnswer !== null && ans?.numericalAnswer !== undefined);

                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-75 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                              Q{qIdx + 1}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              {q.type.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAnswered ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                                Answered
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                Not Answered
                              </span>
                            )}
                            <button
                              onClick={() => {
                                onSelectQuestion(secIdx, qIdx);
                                onClose();
                              }}
                              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                            >
                              Jump to Question
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="text-slate-900 leading-relaxed font-medium">
                          <MathRenderer content={q.text} />
                        </div>

                        {/* Options if MCQ */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2 text-[11px]"
                              >
                                <span className="font-mono font-bold shrink-0 text-slate-600">
                                  ({String.fromCharCode(65 + optIdx)})
                                </span>
                                <div>
                                  <MathRenderer content={opt} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded transition-colors duration-75 cursor-pointer"
          >
            Close Question Paper
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperModal;
