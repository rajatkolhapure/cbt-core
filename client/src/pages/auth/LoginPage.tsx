import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, LogIn, AlertCircle, Terminal, Cpu } from 'lucide-react';
import { FoxCadetMascot } from '../../components/auth/FoxCadetMascot';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickerStep, setTickerStep] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
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
    <div className="min-h-screen bg-[#0B0F17] text-stone-100 flex flex-col lg:flex-row font-sans selection:bg-[#C85A32] selection:text-white relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* LEFT 60% STAGE: Fox Cadet Mascot Stage (Desktop >= 1024px) */}
      {/* ========================================================= */}
      <section 
        aria-label="Cadet Mascot Stage"
        className="hidden lg:flex lg:w-[60%] relative flex-col items-center justify-center p-8 lg:p-12 border-r border-stone-800/80 bg-[#0B0F17] overflow-hidden select-none"
      >
        {/* Soft Radial Ambient Lighting Behind Mascot */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_#1C2A44_0%,_#0B0F17_70%)] opacity-60 pointer-events-none" />

        {/* Ambient Orbit Grid / Subtle Depth Markers */}
        <div className="absolute w-[440px] h-[440px] rounded-full border border-stone-800/40 pointer-events-none -translate-y-6" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-stone-800/20 pointer-events-none -translate-y-6" />

        {/* Centered Interactive Fox Cadet Vector Mascot */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
          <FoxCadetMascot
            isPasswordFocused={isPasswordFocused}
            className="w-72 xl:w-80 h-auto"
          />

          {/* Understated Typographic Badge */}
          <div className="mt-8 text-center space-y-1.5">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-300">
              Cadet Flight Log · Ready when you are.
            </p>
            <p className="text-[11px] font-mono text-stone-500 tracking-wider">
              CBT EVALUATION SYSTEM · CADET CONSOLE GATEWAY
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT 40% STAGE: Minimalist Dark Auth Card                 */}
      {/* ========================================================= */}
      <section 
        aria-label="Authentication Form"
        className="w-full lg:w-[40%] min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-12 z-10 bg-[#0D121C]"
      >
        {/* Mobile Header Mascot Badge (< 1024px) */}
        <div className="lg:hidden flex flex-col items-center justify-center pt-2 pb-6">
          <div className="w-20 h-20 rounded-full bg-[#151D2C] border-2 border-stone-700/80 shadow-lg p-1.5 flex items-center justify-center overflow-hidden mb-3">
            <FoxCadetMascot
              isPasswordFocused={isPasswordFocused}
              className="w-16 h-16"
            />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white text-center">
            Examination Portal
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400 text-center mt-0.5">
            Cadet Console Gateway
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-md space-y-6">
          
          {/* Desktop Card Header (≥ 1024px) */}
          <div className="hidden lg:block space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#151E2E] border border-stone-800 text-[10px] font-mono text-[#E2B150] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C88A2D]" />
              <span>Restricted Cadet Terminal</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
              Examination Portal
            </h1>
            <p className="font-mono text-xs text-stone-400 tracking-wide">
              Enter your credentials to access proctored test papers.
            </p>
          </div>

          {/* Card Body */}
          <div className="bg-[#121722] border border-stone-800 shadow-2xl p-6 sm:p-8">
            
            {/* Error Feedback Banner */}
            {error && (
              <div className="mb-5 bg-[#2B1417] border border-[#852C2C] text-[#FCA5A5] px-4 py-3 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Candidate / Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@cbt.com"
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-stone-700/80 text-xs sm:text-sm font-sans text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#C88A2D] focus:ring-1 focus:ring-[#C88A2D] transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-stone-700/80 text-xs sm:text-sm font-sans text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#C88A2D] focus:ring-1 focus:ring-[#C88A2D] transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#B34E2A] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                      <span>Verifying Environment...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-[#F7F3EB]" />
                      <span>Authenticate &amp; Access Console</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Student Registration Link */}
            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-mono text-xs text-stone-300 hover:text-[#E2B150] font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <span>New cadet? Register here</span>
                <span className="text-[#C88A2D]">→</span>
              </Link>
            </div>

            {/* Micro Card Footer */}
            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                STATUS: READY
              </span>
              <span>RESTRICTED ACCESS</span>
            </div>
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
