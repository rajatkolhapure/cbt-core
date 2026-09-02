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
    <div className="space-y-4 pt-2 max-w-sm">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
          className="w-full text-lg font-mono font-bold px-3 py-2 border-2 border-slate-400 rounded focus:outline-none focus:border-blue-600 bg-white"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="px-3 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors duration-75 shrink-0 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* On-screen Keypad */}
      <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-2 select-none">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          On-Screen Keypad
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {keypadKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="py-2.5 bg-white hover:bg-slate-200 border border-slate-300 rounded font-mono font-bold text-sm text-slate-800 shadow-2xs active:bg-slate-300 transition-colors duration-75 cursor-pointer"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyPress('BACKSPACE')}
            className="py-2.5 col-span-2 bg-slate-200 hover:bg-slate-300 border border-slate-300 rounded font-semibold text-xs text-slate-700 flex items-center justify-center gap-1 active:bg-slate-400 transition-colors duration-75 cursor-pointer"
          >
            <Delete className="w-4 h-4" />
            <span>Backspace</span>
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('CLEAR')}
            className="py-2.5 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded font-semibold text-xs text-rose-800 active:bg-rose-300 transition-colors duration-75 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericalInput;
