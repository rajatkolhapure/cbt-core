import React, { useEffect, useRef, useState } from 'react';

interface FoxCadetMascotProps {
  isPasswordFocused?: boolean;
  className?: string;
}

export const FoxCadetMascot: React.FC<FoxCadetMascotProps> = ({
  isPasswordFocused = false,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic gentle eye blinking (every 4-6 seconds)
  useEffect(() => {
    let blinkTimeout: any;
    let cycleInterval: any;

    const scheduleBlink = () => {
      const nextDelay = 3500 + Math.random() * 2500;
      cycleInterval = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeout = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, nextDelay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(cycleInterval);
    };
  }, []);

  // Smooth cursor tracking clamped within +/- 4.5px
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPasswordFocused || !svgRef.current) {
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      // Target the mascot's eye level (roughly at 42% height of SVG)
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height * 0.42;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance === 0) {
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      // Clamped radius: max 4.2px offset
      const maxRadius = 4.2;
      const pullFactor = Math.min(1, distance / 320);
      const angle = Math.atan2(deltaY, deltaX);

      setPupilOffset({
        x: Math.cos(angle) * maxRadius * pullFactor,
        y: Math.sin(angle) * maxRadius * pullFactor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPasswordFocused]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* SVG Style Definition for Hardware Accelerated Keyframes */}
      <style>{`
        @keyframes mascotHover {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes shadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.92);
            opacity: 0.22;
          }
        }
        .animate-mascot-hover {
          animation: mascotHover 4.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .animate-shadow-pulse {
          animation: shadowPulse 4.2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox="0 0 320 340"
        className="w-full h-full max-w-[340px] drop-shadow-xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Helmet Specular Gradient */}
          <linearGradient id="helmetSheen" x1="100" y1="50" x2="220" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#E2B150" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0B0F17" stopOpacity="0.25" />
          </linearGradient>

          {/* Polarized Visor Tint Gradient for Password "No Peeking" */}
          <linearGradient id="polarizedVisor" x1="160" y1="60" x2="160" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#1C2541" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#3A506B" stopOpacity="0.88" />
          </linearGradient>

          {/* Warm Fur Shadows */}
          <linearGradient id="furShade" x1="160" y1="90" x2="160" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D46137" />
            <stop offset="100%" stopColor="#B34924" />
          </linearGradient>

          {/* Eye socket clips */}
          <clipPath id="leftEyeClip">
            <ellipse cx="127" cy="144" rx="10.5" ry="12" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <ellipse cx="193" cy="144" rx="10.5" ry="12" />
          </clipPath>

          {/* Helmet Glass Clip to contain visor effects */}
          <clipPath id="helmetDomeClip">
            <circle cx="160" cy="148" r="95" />
          </clipPath>
        </defs>

        {/* Ambient Ground Contact Shadow */}
        <ellipse
          cx="160"
          cy="325"
          rx="72"
          ry="9"
          fill="#05070B"
          className="animate-shadow-pulse"
        />

        {/* --- MAIN CHARACTER GROUP (Hover/Breathing Loop) --- */}
        <g className="animate-mascot-hover">

          {/* ========================================================= */}
          {/* 1. SUITED BODY & FLIGHT COLLAR */}
          {/* ========================================================= */}
          <g id="flightSuit">
            {/* Shoulders & Torso */}
            <path
              d="M 96 244 C 74 260 58 290 54 326 L 266 326 C 262 290 246 260 224 244 Z"
              fill="#1B263B"
              stroke="#141824"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Flight Suit Seams & Padding */}
            <path
              d="M 120 252 L 105 326 M 200 252 L 215 326"
              stroke="#2C3D5A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Center Utility Zip Line */}
            <path
              d="M 160 262 L 160 326"
              stroke="#141824"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Cadet Mission Patch Badge (Muted Gold & Slate) */}
            <g transform="translate(182, 280)">
              <polygon
                points="0,0 22,0 26,14 11,24 -4,14"
                fill="#24344D"
                stroke="#C88A2D"
                strokeWidth="2"
              />
              <circle cx="11" cy="9" r="4.5" fill="#C88A2D" />
              <line x1="6" y1="16" x2="16" y2="16" stroke="#E2B150" strokeWidth="1.5" />
            </g>

            {/* Astronaut Neck Ring / Base Collar */}
            <rect
              x="108"
              y="232"
              width="104"
              height="20"
              rx="9"
              fill="#2B3A52"
              stroke="#141824"
              strokeWidth="3"
            />
            {/* Mechanical Collar Fasteners / Rivets */}
            <circle cx="124" cy="242" r="3" fill="#8EA0B8" stroke="#141824" strokeWidth="1.5" />
            <circle cx="160" cy="242" r="3" fill="#C88A2D" stroke="#141824" strokeWidth="1.5" />
            <circle cx="196" cy="242" r="3" fill="#8EA0B8" stroke="#141824" strokeWidth="1.5" />
          </g>

          {/* ========================================================= */}
          {/* 2. FOX EARS (Behind the Visor) */}
          {/* ========================================================= */}
          <g id="foxEars">
            {/* Left Ear */}
            <g
              style={{
                transformOrigin: '108px 115px',
                transform: isPasswordFocused ? 'rotate(-9deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Outer Ear */}
              <path
                d="M 104 115 L 72 45 C 92 48 116 68 126 102 Z"
                fill="url(#furShade)"
                stroke="#141824"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Inner Ear Cream */}
              <path
                d="M 99 108 L 81 58 C 96 66 111 82 118 102 Z"
                fill="#F7F3EB"
              />
              {/* Inner Ear Fluff Tuft */}
              <path
                d="M 94 92 C 104 88 108 94 114 88"
                stroke="#D8CFBE"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Right Ear */}
            <g
              style={{
                transformOrigin: '212px 115px',
                transform: isPasswordFocused ? 'rotate(9deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Outer Ear */}
              <path
                d="M 216 115 L 248 45 C 228 48 204 68 194 102 Z"
                fill="url(#furShade)"
                stroke="#141824"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Inner Ear Cream */}
              <path
                d="M 221 108 L 239 58 C 224 66 209 82 202 102 Z"
                fill="#F7F3EB"
              />
              {/* Inner Ear Fluff Tuft */}
              <path
                d="M 226 92 C 216 88 212 94 206 88"
                stroke="#D8CFBE"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>

          {/* ========================================================= */}
          {/* 3. FOX HEAD & PROFILE */}
          {/* ========================================================= */}
          <g id="foxHead">
            {/* Cheeks & Head Crown Base */}
            <path
              d="M 112 106 C 112 106 132 94 160 94 C 188 94 208 106 208 106 C 226 122 236 150 236 168 C 236 194 208 210 160 210 C 112 210 84 194 84 168 C 84 150 94 122 112 106 Z"
              fill="url(#furShade)"
              stroke="#141824"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Cream Face Wedge & Muzzle */}
            <path
              d="M 160 138 C 144 138 120 156 102 170 C 116 196 142 208 160 208 C 178 208 204 196 218 170 C 200 156 176 138 160 138 Z"
              fill="#F7F3EB"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Cheek Fluff Accents */}
            <path
              d="M 94 164 L 84 168 L 95 174 M 226 164 L 236 168 L 225 174"
              stroke="#141824"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Nose (Warm Charcoal with soft highlight) */}
            <g id="foxNose">
              <path
                d="M 152 171 C 152 168 156 166 160 166 C 164 166 168 168 168 171 C 168 175 162 178 160 178 C 158 178 152 175 152 171 Z"
                fill="#161B26"
              />
              <ellipse cx="158" cy="168.5" rx="1.6" ry="0.9" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Mouth / Muzzle Center Line */}
            <path
              d="M 160 178 L 160 185"
              stroke="#141824"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Studious Calm Smile */}
            <path
              d="M 153 184 Q 160 188 167 184"
              stroke="#141824"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Whisker Dots (Subtle) */}
            <circle cx="145" cy="177" r="1" fill="#7C808E" />
            <circle cx="142" cy="181" r="1" fill="#7C808E" />
            <circle cx="175" cy="177" r="1" fill="#7C808E" />
            <circle cx="178" cy="181" r="1" fill="#7C808E" />

            {/* Studious Whisker Eyebrows / Fur Markings */}
            <path
              d="M 120 126 Q 128 122 138 126"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 200 126 Q 192 122 182 126"
              stroke="#141824"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* ========================================================= */}
            {/* 4. EYES & PUPILS (Interactive Cursor Tracking) */}
            {/* ========================================================= */}
            <g id="foxEyes">
              {/* Left Eye White Socket */}
              <g clipPath="url(#leftEyeClip)">
                <ellipse cx="127" cy="144" rx="10.5" ry="12" fill="#FFFFFF" stroke="#141824" strokeWidth="2.5" />
                {/* Left Pupil (Amber/Slate with Specular Highlight) */}
                <g
                  style={{
                    transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                    transition: 'transform 110ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <circle cx="127" cy="144" r="6.2" fill="#141824" />
                  <circle cx="127" cy="144" r="5.2" fill="#C88A2D" />
                  <circle cx="127" cy="144" r="3.8" fill="#10141D" />
                  {/* Eye Catchlight Reflection */}
                  <circle cx="125" cy="142" r="1.6" fill="#FFFFFF" />
                  <circle cx="128.5" cy="145.5" r="0.7" fill="#FFFFFF" />
                </g>
              </g>

              {/* Right Eye White Socket */}
              <g clipPath="url(#rightEyeClip)">
                <ellipse cx="193" cy="144" rx="10.5" ry="12" fill="#FFFFFF" stroke="#141824" strokeWidth="2.5" />
                {/* Right Pupil */}
                <g
                  style={{
                    transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                    transition: 'transform 110ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <circle cx="193" cy="144" r="6.2" fill="#141824" />
                  <circle cx="193" cy="144" r="5.2" fill="#C88A2D" />
                  <circle cx="193" cy="144" r="3.8" fill="#10141D" />
                  {/* Eye Catchlight Reflection */}
                  <circle cx="191" cy="142" r="1.6" fill="#FFFFFF" />
                  <circle cx="194.5" cy="145.5" r="0.7" fill="#FFFFFF" />
                </g>
              </g>

              {/* Eye Contours */}
              <ellipse cx="127" cy="144" rx="10.5" ry="12" fill="none" stroke="#141824" strokeWidth="2.5" />
              <ellipse cx="193" cy="144" rx="10.5" ry="12" fill="none" stroke="#141824" strokeWidth="2.5" />

              {/* Natural Eye Blinking Overlay */}
              <g
                style={{
                  opacity: isBlinking ? 1 : 0,
                  transition: 'opacity 60ms ease-out',
                }}
              >
                <ellipse cx="127" cy="144" rx="11" ry="12.5" fill="url(#furShade)" />
                <path d="M 116 145 Q 127 150 138 145" stroke="#141824" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <ellipse cx="193" cy="144" rx="11" ry="12.5" fill="url(#furShade)" />
                <path d="M 182 145 Q 193 150 204 145" stroke="#141824" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 5. CLEAR BUBBLE HELMET & VISOR */}
          {/* ========================================================= */}
          <g id="astronautHelmet">
            {/* Clear Helmet Glass Sphere */}
            <circle
              cx="160"
              cy="148"
              r="95"
              fill="url(#helmetSheen)"
              stroke="#141824"
              strokeWidth="3.5"
            />

            {/* Visor Glare / Specular Arc (Warm Gold & White) */}
            <path
              d="M 92 108 A 82 82 0 0 1 204 74"
              stroke="#E2B150"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M 85 132 A 84 84 0 0 1 122 86"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.5"
              fill="none"
            />
            {/* Secondary Lower Reflection Arc */}
            <path
              d="M 218 190 A 82 82 0 0 1 176 226"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.25"
              fill="none"
            />

            {/* Polarized Visor Shield Slide-Down (Triggered on password focus) */}
            <g clipPath="url(#helmetDomeClip)">
              <rect
                x="60"
                y="50"
                width="200"
                height="200"
                fill="url(#polarizedVisor)"
                style={{
                  opacity: isPasswordFocused ? 0.88 : 0,
                  transform: isPasswordFocused ? 'translateY(0px)' : 'translateY(-140px)',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease',
                }}
              />
              {/* Polarized Horizon Golden Stripe */}
              <line
                x1="65"
                y1="148"
                x2="255"
                y2="148"
                stroke="#C88A2D"
                strokeWidth="3"
                strokeOpacity="0.75"
                style={{
                  opacity: isPasswordFocused ? 1 : 0,
                  transform: isPasswordFocused ? 'translateY(0px)' : 'translateY(-140px)',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease',
                }}
              />
            </g>
          </g>

          {/* ========================================================= */}
          {/* 6. SUITED PAWS ("NO PEEKING" REACTION) */}
          {/* ========================================================= */}
          {/* In default state, paws rest quietly near chest / bottom edge.
              When isPasswordFocused is true, paws translate up to cover the visor! */}
          <g id="astronautPaws">
            {/* Left Suited Paw */}
            <g
              style={{
                transform: isPasswordFocused
                  ? 'translate(8px, -74px) rotate(-14deg)'
                  : 'translate(0px, 0px) rotate(0deg)',
                transformOrigin: '110px 245px',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
            >
              {/* White/Parchment Suited Glove */}
              <path
                d="M 92 235 C 92 220 108 208 122 208 C 134 208 142 216 142 228 C 142 236 138 244 132 250 L 98 250 C 94 246 92 240 92 235 Z"
                fill="#F4EFEA"
                stroke="#141824"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Glove Pad Grip Accents */}
              <ellipse cx="120" cy="226" rx="5" ry="6" fill="#DCD5C8" stroke="#141824" strokeWidth="1.5" />
              <circle cx="108" cy="232" r="3" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="114" cy="216" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="126" cy="216" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              {/* Glove Cuff Ring */}
              <path
                d="M 96 250 C 108 254 124 254 134 250"
                stroke="#C88A2D"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Right Suited Paw */}
            <g
              style={{
                transform: isPasswordFocused
                  ? 'translate(-8px, -74px) rotate(14deg)'
                  : 'translate(0px, 0px) rotate(0deg)',
                transformOrigin: '210px 245px',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
            >
              {/* White/Parchment Suited Glove */}
              <path
                d="M 228 235 C 228 220 212 208 198 208 C 186 208 178 216 178 228 C 178 236 182 244 188 250 L 222 250 C 226 246 228 240 228 235 Z"
                fill="#F4EFEA"
                stroke="#141824"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Glove Pad Grip Accents */}
              <ellipse cx="200" cy="226" rx="5" ry="6" fill="#DCD5C8" stroke="#141824" strokeWidth="1.5" />
              <circle cx="212" cy="232" r="3" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="206" cy="216" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              <circle cx="194" cy="216" r="2.8" fill="#DCD5C8" stroke="#141824" strokeWidth="1.2" />
              {/* Glove Cuff Ring */}
              <path
                d="M 186 250 C 196 254 212 254 224 250"
                stroke="#C88A2D"
                strokeWidth="2.5"
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
