import React from 'react';
import MathRenderer from '../common/MathRenderer';

interface OptionListProps {
  options: string[];
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  selectedOptions?: number[] | null;
  onSelectOption: (optionIndex: number) => void;
  fontSize?: 'small' | 'normal' | 'large';
}

export const OptionList: React.FC<OptionListProps> = ({
  options,
  type,
  selectedOptions = [],
  onSelectOption,
  fontSize = 'normal',
}) => {
  const currentSelected = selectedOptions || [];
  const fontSizeClass =
    fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className="w-full max-w-full space-y-2.5 pt-3 select-none font-sans">
      <div className="font-mono text-[10px] font-bold text-[#575A65] uppercase tracking-wider pl-0.5">
        {type === 'SINGLE_CHOICE' ? '[SELECT ONE RESPONSE]' : '[SELECT ALL APPLICABLE RESPONSES]'}
      </div>

      <div className="grid grid-cols-1 gap-2.5 w-full max-w-full">
        {options.map((option, idx) => {
          const isSelected = currentSelected.includes(idx);
          const label = String.fromCharCode(65 + idx); // A, B, C, D...

          return (
            <div
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`group w-full max-w-full p-3 sm:p-3.5 border transition-all duration-75 cursor-pointer flex items-start gap-3 min-h-[48px] btn-tactile ${
                isSelected
                  ? 'border-[#1A2B4C] bg-[#F4EFEA] text-[#1C1D21] shadow-tactile'
                  : 'border-[#1C1D21]/30 bg-white hover:border-[#1C1D21] hover:bg-[#FBF9F5] text-[#1C1D21]'
              }`}
            >
              {/* Radio or Checkbox */}
              <div className="shrink-0 mt-0.5">
                {type === 'SINGLE_CHOICE' ? (
                  <div
                    className={`w-4.5 h-4.5 border-2 flex items-center justify-center transition-colors duration-75 ${
                      isSelected
                        ? 'border-[#1A2B4C] bg-[#1A2B4C]'
                        : 'border-[#1C1D21]/60 bg-white group-hover:border-[#1C1D21]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-[#C88A2D]" />}
                  </div>
                ) : (
                  <div
                    className={`w-4.5 h-4.5 border-2 flex items-center justify-center transition-colors duration-75 ${
                      isSelected
                        ? 'border-[#1A2B4C] bg-[#1A2B4C] text-[#C88A2D]'
                        : 'border-[#1C1D21]/60 bg-white group-hover:border-[#1C1D21]'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Option Letter Label */}
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 border shrink-0 transition-colors duration-75 ${
                  isSelected
                    ? 'bg-[#1A2B4C] text-[#C88A2D] border-[#1A2B4C]'
                    : 'bg-[#F4EFEA] text-[#1C1D21] border-[#1C1D21]/30 group-hover:bg-[#EAE3D9]'
                }`}
              >
                {label}
              </span>

              {/* Math / Option Content */}
              <div className={`flex-1 min-w-0 ${fontSizeClass} leading-relaxed break-words overflow-x-auto pt-0.5`}>
                <MathRenderer content={option} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OptionList;
