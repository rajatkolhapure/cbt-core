import React, { useEffect, useRef, useState } from 'react';

export interface FoxCadetMascotProps {
  isPasswordFocused?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  mousePosition?: { x: number; y: number };
  className?: string;
}

export const FoxCadetMascot: React.FC<FoxCadetMascotProps> = ({
  isPasswordFocused = false,
  isError = false,
  isSuccess = false,
  mousePosition,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic eye blinking (every 4-6s)
  useEffect(() => {
    let blinkTimeout: any;
    let cycleInterval: any;

    const scheduleBlink = () => {
      const nextDelay = 3600 + Math.random() * 2400;
      cycleInterval = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeout = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, nextDelay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(cycleInterval);
    };
  }, []);

  // Calculate pupil offset from mousePosition prop or fallback to window tracking
  useEffect(() => {
    if (isPasswordFocused || isSuccess) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    const computePupil = (clientX: number, clientY: number) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height * 0.44;

      const deltaX = clientX - eyeCenterX;
      const deltaY = clientY - eyeCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance === 0) {
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      const maxRadius = 4.2;
      const pull = Math.min(1, distance / 280);
      const angle = Math.atan2(deltaY, deltaX);

      setPupilOffset({
        x: Math.cos(angle) * maxRadius * pull,
        y: Math.sin(angle) * maxRadius * pull,
      });
    };

    if (mousePosition && (mousePosition.x !== 0 || mousePosition.y !== 0)) {
      computePupil(mousePosition.x, mousePosition.y);
    } else {
      const handleWindowMouse = (e: MouseEvent) => computePupil(e.clientX, e.clientY);
      window.addEventListener('mousemove', handleWindowMouse, { passive: true });
      return () => window.removeEventListener('mousemove', handleWindowMouse);
    }
  }, [mousePosition, isPasswordFocused, isSuccess]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <style>{`
        @keyframes chibiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shadowBreathe {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(0.9); opacity: 0.2; }
        }
        .animate-chibi-float {
          animation: chibiFloat 4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .animate-shadow-breathe {
          animation: shadowBreathe 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox="0 0 320 340"
        className="w-full h-full max-w-[340px] drop-shadow-2xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Muted Terracotta Fur Gradient */}
          <linearGradient id="chibiFur" x1="160" y1="70" x2="160" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D96338" />
            <stop offset="100%" stopColor="#B64B22" />
          </linearGradient>

          {/* Helmet Dome Specular Sheen */}
          <linearGradient id="glassDomeSheen" x1="90" y1="40" x2="230" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="40%" stopColor="#E2B150" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0B0F17" stopOpacity="0.2" />
          </linearGradient>

          {/* Polarized Visor Tint for "No Peeking" */}
          <linearGradient id="polarizedVisorTint" x1="160" y1="50" x2="160" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" stopOpacity="0.96" />
            <stop offset="60%" stopColor="#1C2541" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#3A506B" stopOpacity="0.9" />
          </linearGradient>

          {/* Eye Socket Clips */}
          <clipPath id="chibiLeftEyeClip">
            <ellipse cx="124" cy="148" rx="12" ry="14" />
          </clipPath>
          <clipPath id="chibiRightEyeClip">
            <ellipse cx="196" cy="148" rx="12" ry="14" />
          </clipPath>

          {/* Helmet Glass Clip */}
          <clipPath id="chibiHelmetClip">
            <circle cx="160" cy="150" r="102" />
          </clipPath>
        </defs>

        {/* Ambient Ground Contact Shadow */}
        <ellipse
          cx="160"
          cy="326"
          rx="76"
          ry="10"
          fill="#05070B"
          className="animate-shadow-breathe"
        />

        {/* --- MAIN CHIBI FLOAT GROUP (1.5:1 Head to Torso Ratio) --- */}
        <g className="animate-chibi-float">

          {/* ========================================================= */}
          {/* 1. COMPACT SUITED TORSO & SPACE COLLAR                     */}
          {/* ========================================================= */}
          <g id="compactTorso">
            {/* Suited Shoulders */}
            <path
              d="M 104 250 C 82 264 68 290 64 322 L 256 322 C 252 290 238 264 216 250 Z"
              fill="#1B263B"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Tactical Seams */}
            <path
              d="M 124 258 L 112 322 M 196 258 L 208 322"
              stroke="#2C3D5A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Center Zip Line */}
            <path
              d="M 160 266 L 160 322"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cadet Mission Insignia */}
            <g transform="translate(182, 280)">
              <polygon
                points="0,0 20,0 24,12 10,20 -4,12"
                fill="#24344D"
                stroke="#C88A2D"
                strokeWidth="1.8"
              />
              <circle cx="10" cy="8" r="3.5" fill="#C88A2D" />
            </g>

            {/* Astronaut Collar Ring */}
            <rect
              x="106"
              y="238"
              width="108"
              height="20"
              rx="9"
              fill="#2B3A52"
              stroke="#141824"
              strokeWidth="2.5"
            />
            {/* Mechanical Collar Bolts */}
            <circle cx="122" cy="248" r="2.8" fill="#8EA0B8" stroke="#141824" strokeWidth="1.2" />
            <circle cx="160" cy="248" r="2.8" fill="#C88A2D" stroke="#141824" strokeWidth="1.2" />
            <circle cx="198" cy="248" r="2.8" fill="#8EA0B8" stroke="#141824" strokeWidth="1.2" />
          </g>

          {/* ========================================================= */}
          {/* 2. CHIBI FOX EARS (With Distinct Dark Charcoal Tips)       */}
          {/* ========================================================= */}
          <g id="foxEars">
            {/* Left Ear */}
            <g
              style={{
                transformOrigin: '102px 112px',
                transform: isPasswordFocused
                  ? 'rotate(-9deg)'
                  : isError
                  ? 'rotate(-6deg) translateY(2px)'
                  : isSuccess
                  ? 'rotate(-3deg) translateY(-2px)'
                  : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Outer Ear Body */}
              <path
                d="M 98 116 L 62 42 C 86 46 114 66 126 102 Z"
                fill="url(#chibiFur)"
                stroke="#141824"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Dark Ear Tip */}
              <path
                d="M 62 42 L 78 56 C 80 50 82 46 86 46 Z"
                fill="#161B26"
                stroke="#141824"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner Ear Cream */}
              <path
                d="M 94 108 L 74 58 C 90 66 108 82 116 102 Z"
                fill="#FBF7F0"
              />
            </g>

            {/* Right Ear */}
            <g
              style={{
                transformOrigin: '218px 112px',
                transform: isPasswordFocused
                  ? 'rotate(9deg)'
                  : isError
                  ? 'rotate(6deg) translateY(2px)'
                  : isSuccess
                  ? 'rotate(3deg) translateY(-2px)'
                  : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Outer Ear Body */}
              <path
                d="M 222 116 L 258 42 C 234 46 206 66 194 102 Z"
                fill="url(#chibiFur)"
                stroke="#141824"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Dark Ear Tip */}
              <path
                d="M 258 42 L 242 56 C 240 50 238 46 234 46 Z"
                fill="#161B26"
                stroke="#141824"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner Ear Cream */}
              <path
                d="M 226 108 L 246 58 C 230 66 212 82 204 102 Z"
                fill="#FBF7F0"
              />
            </g>
          </g>

          {/* ========================================================= */}
          {/* 3. CHIBI FOX HEAD (1.5:1 Expressive Ratio)                 */}
          {/* ========================================================= */}
          <g id="foxHead">
            {/* Expressive Crown & Cheeks */}
            <path
              d="M 106 102 C 106 102 128 88 160 88 C 192 88 214 102 214 102 C 236 120 248 150 248 172 C 248 202 216 220 160 220 C 104 220 72 202 72 172 C 72 150 84 120 106 102 Z"
              fill="url(#chibiFur)"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Clean Cream Muzzle Wedge */}
            <path
              d="M 160 140 C 142 140 114 160 96 176 C 112 206 142 218 160 218 C 178 218 208 206 224 176 C 206 160 178 140 160 140 Z"
              fill="#FBF7F0"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Subtle Cheek Fluff Tuft (Clean Ink Strokes) */}
            <path
              d="M 84 170 L 74 174 L 86 180 M 236 170 L 246 174 L 234 180"
              stroke="#141824"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Tiny Button Nose */}
            <g id="tinyNose">
              <path
                d="M 154 175 C 154 172 157 170 160 170 C 163 170 166 172 166 175 C 166 178 162 181 160 181 C 158 181 154 178 154 175 Z"
                fill="#161B26"
              />
              <circle cx="158.5" cy="173" r="0.9" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Confident Gentle Smile Line */}
            <path
              d="M 160 181 L 160 187"
              stroke="#141824"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {isSuccess ? (
              // Open cheerful happy mouth
              <path
                d="M 152 187 Q 160 196 168 187 Z"
                fill="#B64B22"
                stroke="#141824"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            ) : isError ? (
              // Slight curious/concerned wavy mouth
              <path
                d="M 152 189 Q 156 186 160 188 Q 164 190 168 187"
                stroke="#141824"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Confident calm smile
              <path
                d="M 152 186 Q 160 191 168 186"
                stroke="#141824"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Studious Whisker Eyebrow Arcs */}
            <path
              d="M 114 128 Q 124 122 136 128"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 206 128 Q 196 122 184 128"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* ========================================================= */}
            {/* 4. LARGE EXPRESSIVE ANIME EYES (Dual Specular Highlights)  */}
            {/* ========================================================= */}
            {isSuccess ? (
              // Happy curved closed eyes (^ _ ^)
              <g id="happyEyes">
                <path
                  d="M 112 148 Q 124 136 136 148"
                  stroke="#141824"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 184 148 Q 196 136 208 148"
                  stroke="#141824"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : (
              <g id="animeEyes">
                {/* Left Eye */}
                <g clipPath="url(#chibiLeftEyeClip)">
                  <ellipse cx="124" cy="148" rx="12" ry="14" fill="#FFFFFF" stroke="#141824" strokeWidth="2.5" />
                  {/* Left Pupil with dual specular highlights */}
                  <g
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                      transition: 'transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    <ellipse cx="124" cy="148" rx="7.5" ry="9" fill="#141824" />
                    <ellipse cx="124" cy="148" rx="6.2" ry="7.6" fill="#C88A2D" />
                    <circle cx="124" cy="148" r="4.2" fill="#0E121B" />
                    {/* Primary Large Specular Catchlight */}
                    <circle cx="121.5" cy="144" r="2.4" fill="#FFFFFF" />
                    {/* Secondary Small Specular Sparkle */}
                    <circle cx="126" cy="151.5" r="1.1" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Right Eye */}
                <g clipPath="url(#chibiRightEyeClip)">
                  <ellipse cx="196" cy="148" rx="12" ry="14" fill="#FFFFFF" stroke="#141824" strokeWidth="2.5" />
                  {/* Right Pupil with dual specular highlights */}
                  <g
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                      transition: 'transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    <ellipse cx="196" cy="148" rx="7.5" ry="9" fill="#141824" />
                    <ellipse cx="196" cy="148" rx="6.2" ry="7.6" fill="#C88A2D" />
                    <circle cx="196" cy="148" r="4.2" fill="#0E121B" />
                    {/* Primary Large Specular Catchlight */}
                    <circle cx="193.5" cy="144" r="2.4" fill="#FFFFFF" />
                    {/* Secondary Small Specular Sparkle */}
                    <circle cx="198" cy="151.5" r="1.1" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Eye Contours */}
                <ellipse cx="124" cy="148" rx="12" ry="14" fill="none" stroke="#141824" strokeWidth="2.5" />
                <ellipse cx="196" cy="148" rx="12" ry="14" fill="none" stroke="#141824" strokeWidth="2.5" />

                {/* Eye Blink Cover */}
                <g
                  style={{
                    opacity: isBlinking ? 1 : 0,
                    transition: 'opacity 60ms ease-out',
                  }}
                >
                  <ellipse cx="124" cy="148" rx="12.5" ry="14.5" fill="url(#chibiFur)" />
                  <path d="M 112 149 Q 124 154 136 149" stroke="#141824" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="196" cy="148" rx="12.5" ry="14.5" fill="url(#chibiFur)" />
                  <path d="M 184 149 Q 196 154 208 149" stroke="#141824" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* 5. PERFECT SPHERICAL BUBBLE HELMET & VISOR                 */}
          {/* ========================================================= */}
          <g id="bubbleHelmet">
            {/* Perfectly Spherical Helmet Glass */}
            <circle
              cx="160"
              cy="150"
              r="102"
              fill="url(#glassDomeSheen)"
              stroke="#141824"
              strokeWidth="2.8"
            />

            {/* Elegant Specular Glass Reflection Highlights */}
            <path
              d="M 88 108 A 90 90 0 0 1 208 70"
              stroke="#E2B150"
              strokeWidth="4"
              strokeLinecap="round"
              strokeOpacity="0.4"
              fill="none"
            />
            <path
              d="M 82 134 A 92 92 0 0 1 122 84"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeOpacity="0.5"
              fill="none"
            />
            <path
              d="M 226 196 A 90 90 0 0 1 180 234"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.22"
              fill="none"
            />

            {/* Polarized Visor Shield Slide-Down (Password Focus "No Peeking") */}
            <g clipPath="url(#chibiHelmetClip)">
              <rect
                x="50"
                y="40"
                width="220"
                height="220"
                fill="url(#polarizedVisorTint)"
                style={{
                  opacity: isPasswordFocused ? 0.92 : 0,
                  transform: isPasswordFocused ? 'translateY(0px)' : 'translateY(-150px)',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease',
                }}
              />
              {/* Polarized Gold Stripe */}
              <line
                x1="60"
                y1="150"
                x2="260"
                y2="150"
                stroke="#C88A2D"
                strokeWidth="2.8"
                strokeOpacity="0.8"
                style={{
                  opacity: isPasswordFocused ? 1 : 0,
                  transform: isPasswordFocused ? 'translateY(0px)' : 'translateY(-150px)',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease',
                }}
              />
            </g>
          </g>

          {/* ========================================================= */}
          {/* 6. SUITED PAWS ("NO PEEKING" COVER)                       */}
          {/* ========================================================= */}
          <g id="astronautPaws">
            {/* Left Suited Paw */}
            <g
              style={{
                transform: isPasswordFocused
                  ? 'translate(8px, -78px) rotate(-14deg)'
                  : 'translate(0px, 0px) rotate(0deg)',
                transformOrigin: '110px 248px',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
            >
              <path
                d="M 94 238 C 94 222 110 210 124 210 C 136 210 144 218 144 230 C 144 238 140 246 134 252 L 98 252 C 96 248 94 244 94 238 Z"
                fill="#F4EFEA"
                stroke="#141824"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <ellipse cx="120" cy="228" rx="5" ry="6" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="108" cy="234" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <circle cx="114" cy="218" r="2.5" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <circle cx="126" cy="218" r="2.5" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <path
                d="M 96 252 C 108 256 124 256 134 252"
                stroke="#C88A2D"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>

            {/* Right Suited Paw */}
            <g
              style={{
                transform: isPasswordFocused
                  ? 'translate(-8px, -78px) rotate(14deg)'
                  : 'translate(0px, 0px) rotate(0deg)',
                transformOrigin: '210px 248px',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
            >
              <path
                d="M 226 238 C 226 222 210 210 196 210 C 184 210 176 218 176 230 C 176 238 180 246 186 252 L 222 252 C 224 248 226 244 226 238 Z"
                fill="#F4EFEA"
                stroke="#141824"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <ellipse cx="200" cy="228" rx="5" ry="6" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="212" cy="234" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <circle cx="206" cy="218" r="2.5" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <circle cx="194" cy="218" r="2.5" fill="#DCD5C8" stroke="#141824" strokeWidth="1" />
              <path
                d="M 186 252 C 196 256 212 256 224 252"
                stroke="#C88A2D"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </g>

        </g>
      </svg>
    </div>
  );
};

export default FoxCadetMascot;
