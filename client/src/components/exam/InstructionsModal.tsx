import React from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-100">
      <div className="bg-white rounded-md border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight uppercase">
              Official Examination Instructions & Guidelines
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 leading-relaxed">
          {/* General Rules */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 border-b pb-1 border-slate-200">
              1. General Examination Instructions
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>The clock on the top right displays the remaining time for the examination.</li>
              <li>When the timer reaches zero, your responses will be <strong>automatically submitted</strong>.</li>
              <li>There is no negative marking for MHT-CET PCM papers unless explicitly stated.</li>
              <li>Mathematics carries <strong>+2 marks</strong> per correct answer. Physics and Chemistry carry <strong>+1 mark</strong> each.</li>
            </ul>
          </div>

          {/* Palette Color Codes */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b pb-1 border-slate-200">
              2. Question Palette Symbols & Color Legend (NTA / TCS iON Pattern)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="w-6 h-6 rounded-full bg-slate-200 border border-slate-400 text-slate-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                  01
                </span>
                <span><strong>Not Visited:</strong> You have not visited this question yet.</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-rose-50 border border-rose-200 rounded">
                <span className="w-6 h-6 bg-rose-600 text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0 rounded-xs">
                  02
                </span>
                <span><strong>Not Answered:</strong> You visited but have not answered.</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded">
                <span className="w-6 h-6 bg-emerald-600 text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0 rounded-xs">
                  03
                </span>
                <span><strong>Answered:</strong> You have selected an answer.</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-purple-50 border border-purple-200 rounded">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                  04
                </span>
                <span><strong>Marked for Review:</strong> Flagged for review without answer.</span>
              </div>

              <div className="col-span-1 sm:col-span-2 flex items-center gap-2.5 p-2 bg-purple-50 border border-purple-300 rounded">
                <div className="relative w-6 h-6 rounded-full bg-purple-700 text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                  05
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                </div>
                <span><strong>Answered & Marked for Review:</strong> Answer is saved AND flagged for review. <em>(Will be evaluated for scoring)</em>.</span>
              </div>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 border-b pb-1 border-slate-200">
              3. Navigating to a Question
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Click on the question number in the Question Palette to jump directly to that question.</li>
              <li>Click <strong>Save & Next</strong> to save your answer and move to the next question.</li>
              <li>Click <strong>Clear Response</strong> to deselect your chosen answer.</li>
              <li>Click <strong>Mark for Review & Next</strong> to flag the question and continue.</li>
            </ul>
          </div>

          {/* Anti-Cheat & Security */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 border-b pb-1 border-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Integrity & Anti-Cheat Protocols</span>
            </h3>
            <p className="text-slate-600">
              The examination runs under strict fullscreen monitoring. Switching tabs, minimizing the browser window, or attempting developer tools inspection will trigger security violation strikes. Exceeding <strong>3 strikes</strong> results in automatic disqualification and immediate test submission.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded transition-colors duration-75 cursor-pointer shadow-xs"
          >
            I Understand / Return to Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
