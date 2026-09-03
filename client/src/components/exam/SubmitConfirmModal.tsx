import React from 'react';
import type { ExamSection, Answer } from '../../types';
import { AlertCircle, CheckCircle2, Clock, Send, X } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  sections: ExamSection[];
  answers: Map<string, Answer | any>;
  formattedTime: string;
  isSubmitting?: boolean;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  sections,
  answers,
  formattedTime,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  // Compute breakdown across sections
  const sectionSummaries = sections.map((sec) => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    const qList = sec.questions || [];

    for (const qItem of qList) {
      const qId = qItem.question.id;
      const ans = answers.get(qId);

      const isVisited = !!ans?.isVisited;
      const hasResponse =
        (ans?.selectedOptions && ans.selectedOptions.length > 0) ||
        (ans?.numericalAnswer !== null && ans?.numericalAnswer !== undefined);
      const isMarked = !!ans?.isMarkedForReview;

      if (hasResponse && isMarked) answeredMarked++;
      else if (isMarked) marked++;
      else if (hasResponse) answered++;
      else if (isVisited) notAnswered++;
      else notVisited++;
    }

    return {
      name: sec.name,
      total: qList.length,
      answered,
      notAnswered,
      marked,
      answeredMarked,
      notVisited,
    };
  });

  const totals = sectionSummaries.reduce(
    (acc, sec) => ({
      total: acc.total + sec.total,
      answered: acc.answered + sec.answered,
      notAnswered: acc.notAnswered + sec.notAnswered,
      marked: acc.marked + sec.marked,
      answeredMarked: acc.answeredMarked + sec.answeredMarked,
      notVisited: acc.notVisited + sec.notVisited,
    }),
    { total: 0, answered: 0, notAnswered: 0, marked: 0, answeredMarked: 0, notVisited: 0 }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 select-none font-sans animate-in fade-in">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold tracking-tight">
              Examination Submission Confirmation
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#C88A2D] p-1 transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-700">Remaining Time:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formattedTime}
              </span>
            </div>
            <div className="text-slate-600">
              Total Questions: <span className="font-bold text-slate-900">{totals.total}</span>
            </div>
          </div>

          {/* Detailed Section Status Summary Table */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-200 font-bold text-slate-700 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">Answered</th>
                  <th className="py-2.5 px-3 text-center text-rose-700">Not Answered</th>
                  <th className="py-2.5 px-3 text-center text-purple-700">Marked</th>
                  <th className="py-2.5 px-3 text-center text-slate-600">Not Visited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {sectionSummaries.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">
                      {sec.name}
                    </td>
                    <td className="py-2 px-3 text-center">{sec.total}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">
                      {sec.answered + sec.answeredMarked}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">
                      {sec.notAnswered}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-purple-600">
                      {sec.marked}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500">{sec.notVisited}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold border-t border-gray-300">
                  <td className="py-2 px-3 font-sans text-slate-900">Total</td>
                  <td className="py-2 px-3 text-center">{totals.total}</td>
                  <td className="py-2 px-3 text-center text-emerald-700">
                    {totals.answered + totals.answeredMarked}
                  </td>
                  <td className="py-2 px-3 text-center text-rose-700">{totals.notAnswered}</td>
                  <td className="py-2 px-3 text-center text-purple-700">{totals.marked}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{totals.notVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Are you sure you want to submit your examination?</p>
              <p className="text-[11px] text-amber-800">
                Once submitted, your paper will be scored by the evaluation engine and no further response changes will be accepted.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              Resume Test
            </button>
            <button
              type="button"
              onClick={onConfirmSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Paper...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
