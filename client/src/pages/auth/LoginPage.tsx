import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Terminal, Cpu } from 'lucide-react';
import { FoxCadetMascot } from '../../components/auth/FoxCadetMascot';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickerStep, setTickerStep] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  useEffect(() => {
    let timer: any;
    if (isSubmitting) {
      setTickerStep(1);
      timer = setTimeout(() => {
        setTickerStep(2);
      }, 400);
    } else {
      setTickerStep(0);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      setIsSuccess(true);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setIsSuccess(false);
      setError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      className="min-h-screen bg-[#0B0F17] text-stone-100 flex flex-col lg:flex-row font-sans selection:bg-[#C85A32] selection:text-white relative overflow-x-hidden"
    >
      {/* Dynamic Font Import: Space Grotesk for Human Typographic Character */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap');
        .font-space-grotesk {
          font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      {/* Soft Ambient Radial Canvas Wash (warm charcoal/navy into graphite) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#131B2A_0%,_#0D111A_45%,_#0B0F17_85%)] opacity-85 pointer-events-none" />

      {/* ========================================================= */}
      {/* LEFT 60% STAGE: Seamless Ambient Mascot Stage (Desktop)    */}
      {/* ========================================================= */}
      <section
        aria-label="Cadet Mascot Stage"
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative flex-col items-center justify-center p-8 lg:p-12 overflow-hidden select-none"
      >
        {/* Ambient Cosmic Depth Rings */}
        <div className="absolute w-[460px] h-[460px] rounded-full border border-stone-800/30 pointer-events-none -translate-y-4" />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-stone-800/15 pointer-events-none -translate-y-4" />

        {/* Interactive Fox Cadet Vector Mascot */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
          <FoxCadetMascot
            isPasswordFocused={isPasswordFocused}
            isError={Boolean(error)}
            isSuccess={isSuccess}
            mousePosition={mousePosition}
            className="w-72 xl:w-84 h-auto"
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT 40% STAGE: Borderless "Launch Station" Login Form    */}
      {/* ========================================================= */}
      <section
        aria-label="Launch Station Form"
        className="w-full lg:w-[42%] xl:w-[40%] min-h-screen flex flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-14 z-10"
      >
        {/* Mobile Mascot Badge (< 1024px) */}
        <div className="lg:hidden flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#121826] border border-stone-700/60 shadow-xl p-1.5 flex items-center justify-center overflow-hidden mb-2">
            <FoxCadetMascot
              isPasswordFocused={isPasswordFocused}
              isError={Boolean(error)}
              isSuccess={isSuccess}
              mousePosition={mousePosition}
              className="w-16 h-16"
            />
          </div>
        </div>

        {/* Borderless Floating Form Container with Editorial Accents */}
        <div className="relative w-full max-w-md space-y-7">
          
          {/* Subtle Corner Tick Marks (Mechanical Instrument Aesthetic) */}
          <span className="hidden sm:block absolute -top-4 -left-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -top-4 -right-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -bottom-4 -left-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -bottom-4 -right-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>

          {/* Centered Editorial Header Hierarchy */}
          <div className="flex flex-col items-center text-center mx-auto space-y-2">
            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#D4A373] uppercase select-none">
              // CADET ACCESS GATE
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F4F6] font-space-grotesk">
              Launch Station
            </h1>
            <p className="text-sm text-stone-400 font-normal tracking-wide max-w-xs">
              Sign in to continue your training streak.
            </p>
          </div>

          {/* Error Feedback Banner */}
          {error && (
            <div className="bg-[#261316] text-[#FCA5A5] px-4 py-3 text-xs rounded-lg flex items-start gap-2.5 border border-red-950">
              <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Tactile Form Fields */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-2">
                Candidate / Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@cbt.com"
                className="w-full px-4 py-3 bg-[#121826] border-none rounded-lg text-sm text-[#F3F4F6] placeholder:text-stone-500 focus:ring-1 focus:ring-[#D4A373]/70 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-2">
                Access Key / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#121826] border-none rounded-lg text-sm text-[#F3F4F6] placeholder:text-stone-500 focus:ring-1 focus:ring-[#D4A373]/70 focus:outline-none transition-all"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#C85A32] hover:bg-[#B64B22] text-[#F3F4F6] font-mono text-sm font-bold rounded-lg shadow-lg active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Launching Environment...</span>
                  </div>
                ) : (
                  <span>[ Enter Arena ➔ ]</span>
                )}
              </button>
            </div>
          </form>

          {/* Centered Registration Link */}
          <div className="pt-1 text-center">
            <Link
              to="/register"
              className="text-xs text-stone-400 hover:text-[#D4A373] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <span>New cadet? Register here</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Retro Telemetry Loading Screen Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-[#141619]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1D2026] border-2 border-[#2E323B] shadow-[4px_4px_0px_0px_#0C0D0F] p-6 max-w-md w-full text-left font-mono text-xs text-[#EAE3D9] animate-shutter">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2E323B] text-[11px] text-[#C88A2D]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold tracking-wider">CBT SECURITY TELEMETRY</span>
              </div>
              <Cpu className="w-4 h-4 text-[#236B47] animate-pulse" />
            </div>

            <div className="space-y-2 mb-5 font-mono text-[11px]">
              <div className="text-[#236B47]">
                &gt; INITIALIZING PRE-EXAM HARDWARE PROBE... [OK]
              </div>
              {tickerStep >= 1 && (
                <div className="text-[#C88A2D] animate-in fade-in duration-100">
                  &gt; PROBING GRAPHICS ENGINE &amp; VM INTEGRITY... [IN_PROGRESS]
                </div>
              )}
              {tickerStep >= 2 && (
                <div className="text-[#8E929E] animate-in fade-in duration-100">
                  &gt; CONFIGURING SECURE TEST CANVAS... [SYNCHRONIZING]
                </div>
              )}
            </div>

            <div className="h-1.5 w-full bg-[#141619] border border-[#2E323B] overflow-hidden">
              <div className="h-full bg-[#C88A2D] animate-pulse w-3/4" />
            </div>
            <p className="mt-3 text-[10px] text-[#8E929E] text-center">
              Please do not refresh or close this browser window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
