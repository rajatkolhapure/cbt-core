import React from 'react';

interface FoxCadetMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  showBadge?: boolean;
}

export const FoxCadetMascot: React.FC<FoxCadetMascotProps> = ({
  className = '',
  size = 'responsive',
  showBadge = false,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32',
    responsive: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group select-none ${className}`}
      role="img"
      aria-label="Fox Cadet Mascot in Bubble Space Helmet"
    >
      {/* Ambient Space Glow */}
      <div className="absolute inset-0 rounded-full bg-[#C85A32]/20 blur-xl scale-110 group-hover:scale-125 transition-transform duration-500 opacity-60" />

      {/* Bubble Helmet Shell */}
      <div
        className={`${sizeClasses} relative transition-transform duration-300 group-hover:scale-105 active:scale-95`}
      >
        <img
          src="/assets/homepage/fox-cadet.svg"
          alt="Fox Cadet Space Mascot"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(200,90,50,0.35)]"
          loading="eager"
        />

        {/* Visor Glint Reflection sweep */}
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
      </div>

      {/* Optional Status Pill Badge */}
      {showBadge && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest bg-[#151C2C] border border-[#D4A373]/60 text-[#D4A373] shadow-md whitespace-nowrap">
          CADET-01
        </span>
      )}
    </div>
  );
};

export default FoxCadetMascot;
