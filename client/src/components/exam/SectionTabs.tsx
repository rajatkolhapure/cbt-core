import React from 'react';
import type { ExamSection } from '../../types';

interface SectionTabsProps {
  sections: ExamSection[];
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  allowSectionJump?: boolean;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  sections,
  currentSectionIndex,
  onSelectSection,
  allowSectionJump = true,
}) => {
  return (
    <div className="bg-[#F4EFEA] border-b border-[#1C1D21] px-3.5 sm:px-6 flex items-center gap-1.5 overflow-x-auto select-none shrink-0 font-sans">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#575A65] mr-1 shrink-0 hidden sm:inline">
        SECTION:
      </span>
      {sections.map((section, idx) => {
        const isActive = idx === currentSectionIndex;
        const qCount = section.questionCount || section.questions?.length || 0;

        return (
          <button
            key={section.id || idx}
            onClick={() => {
              if (allowSectionJump || isActive) {
                onSelectSection(idx);
              }
            }}
            disabled={!allowSectionJump && !isActive}
            className={`px-3.5 sm:px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-75 flex items-center gap-2 border-t border-l border-r border-[#1C1D21] -mb-px shrink-0 cursor-pointer ${
              isActive
                ? 'bg-white text-[#1C1D21] border-b-white shadow-xs font-bold'
                : 'bg-[#EAE3D9] text-[#575A65] hover:text-[#1C1D21] hover:bg-[#FBF9F5] border-b-[#1C1D21]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span>{section.name}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 border border-[#1C1D21]/20 ${
                isActive ? 'bg-[#C88A2D] text-[#1C1D21]' : 'bg-[#DCD6CD] text-[#575A65]'
              }`}
            >
              {qCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
