import React from 'react';
import { Delete } from 'lucide-react';

interface NumericalInputProps {
  value?: number | null;
  onChange: (val: number | null) => void;
}

export const NumericalInput: React.FC<NumericalInputProps> = ({
  value,
  onChange,
}) => {
  const displayValue = value !== undefined && value !== null ? String(value) : '';

  const handleKeyPress = (char: string) => {
    if (char === 'CLEAR') {
      onChange(null);
      return;
    }
    if (char === 'BACKSPACE') {
      if (displayValue.length <= 1) {
        onChange(null);
      } else {
        const next = displayValue.slice(0, -1);
        onChange(Number(next));
      }
      return;
    }
    if (char === '.' && displayValue.includes('.')) {
      return;
    }
    if (char === '-' && displayValue.length > 0) {
      return;
    }

    const nextStr = displayValue + char;
    const num = Number(nextStr);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '-'];

  return (
    <div className="space-y-4 pt-2 max-w-sm font-sans">
      <div className="text-[11px] font-mono font-bold text-[#575A65] uppercase tracking-wider">
        Enter Numerical Response:
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === '' ? null : Number(val));
          }}
          placeholder="0.00"
          className="w-full text-lg font-mono font-bold px-3.5 py-2 border border-[#1C1D21] focus:outline-none focus:bg-white focus:shadow-tactile bg-[#FBF9F5] text-[#1C1D21]"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="px-3 py-2 font-mono text-xs font-bold uppercase bg-[#FBF9F5] hover:bg-[#EAE3D9] text-[#575A65] hover:text-[#1C1D21] border border-[#1C1D21]/40 btn-tactile shrink-0 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* On-screen Keypad */}
      <div className="bg-[#F4EFEA] p-3 border border-[#1C1D21] space-y-2 select-none shadow-tactile">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#575A65]">
          On-Screen Keypad
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {keypadKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="py-2.5 bg-white hover:bg-[#EAE3D9] border border-[#1C1D21] font-mono font-bold text-sm text-[#1C1D21] btn-tactile cursor-pointer"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyPress('BACKSPACE')}
            className="py-2.5 col-span-2 bg-[#FBF9F5] hover:bg-[#EAE3D9] border border-[#1C1D21] font-mono font-bold text-xs text-[#1C1D21] flex items-center justify-center gap-1.5 btn-tactile cursor-pointer"
          >
            <Delete className="w-3.5 h-3.5 text-[#575A65]" />
            <span>Backspace</span>
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('CLEAR')}
            className="py-2.5 bg-[#FDF0F0] hover:bg-[#FBE4E4] border border-[#A83232] font-mono font-bold text-xs text-[#A83232] hover:text-[#8F2929] btn-tactile cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericalInput;
