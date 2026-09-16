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
      {/* ========================================================= */}
      {/* LEFT 60% STAGE: Seamless Ambient Mascot Stage (Desktop)    */}
      {/* ========================================================= */}
      <section
        aria-label="Cadet Mascot Stage"
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative flex-col items-center justify-center p-8 lg:p-12 overflow-hidden select-none"
      >
        {/* Soft Radial Ambient Lighting Behind Mascot (No center divider line) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,_#1C2A44_0%,_#0B0F17_72%)] opacity-70 pointer-events-none" />

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
          <div className="w-20 h-20 rounded-full bg-[#151C2C] border border-stone-700/60 shadow-xl p-1.5 flex items-center justify-center overflow-hidden mb-2">
            <FoxCadetMascot
              isPasswordFocused={isPasswordFocused}
              isError={Boolean(error)}
              isSuccess={isSuccess}
              mousePosition={mousePosition}
              className="w-16 h-16"
            />
          </div>
        </div>

        {/* Borderless Floating Form Container */}
        <div className="w-full max-w-md space-y-7">
          
          {/* Typography & Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Launch Station
            </h1>
            <p className="text-sm text-stone-400 font-sans tracking-wide">
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

          {/* Borderless Form Fields */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                Candidate / Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@cbt.com"
                className="w-full px-4 py-3 bg-[#151C2C] border-none rounded-lg text-sm text-white placeholder:text-stone-500 focus:ring-2 focus:ring-[#C85A32] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
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
                className="w-full px-4 py-3 bg-[#151C2C] border-none rounded-lg text-sm text-white placeholder:text-stone-500 focus:ring-2 focus:ring-[#C85A32] focus:outline-none transition-all"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#C85A32] hover:bg-[#B64B22] text-white font-mono text-sm font-bold rounded-lg shadow-lg active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

          {/* Registration Link */}
          <div className="pt-2 text-center sm:text-left">
            <Link
              to="/register"
              className="text-xs text-stone-400 hover:text-[#C85A32] font-medium transition-colors inline-flex items-center gap-1.5"
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
