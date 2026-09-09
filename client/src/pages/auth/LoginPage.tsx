import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, LogIn, AlertCircle, Terminal, Cpu } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickerStep, setTickerStep] = useState(0);

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
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1A2B4C] selection:text-[#FBF9F5]">
      {/* Top Academic Masthead */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1A2B4C] text-[#FBF9F5] border border-[#1C1D21] shadow-tactile mb-4">
          <ShieldCheck className="w-6 h-6 text-[#C88A2D]" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1D21]">
          Examination Portal
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#575A65]">
          Computer-Based Testing & Proctoring Engine
        </p>
      </div>

      {/* Main Terminal Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#1C1D21] shadow-tactile-lg p-6 sm:p-8">
          {error && (
            <div className="mb-5 bg-[#FDF0F0] border border-[#A83232] text-[#A83232] px-4 py-3 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-[#A83232] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1">
                Candidate / Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@cbt.com"
                className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1">
                Access Key / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#1A2B4C] hover:bg-[#121F38] text-[#FBF9F5] font-mono text-xs uppercase tracking-wider font-bold btn-tactile flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#FBF9F5] border-t-transparent animate-spin" />
                    <span>Verifying Environment...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#C88A2D]" />
                    <span>Authenticate & Access Console</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Student Registration Link */}
          <div className="mt-5 text-center">
            <Link
              to="/register"
              className="font-mono text-xs text-[#1A2B4C] hover:text-[#C88A2D] font-bold hover:underline inline-flex items-center gap-1 transition"
            >
              <span>New student? Verify &amp; Register here</span>
              <span>→</span>
            </Link>
          </div>

          {/* Micro Footer */}
          <div className="mt-5 pt-4 border-t border-[#DCD6CD] flex items-center justify-between text-[10px] font-mono text-[#575A65]">
            <span>STATUS: READY</span>
            <span>RESTRICTED ACCESS</span>
          </div>
        </div>
      </div>

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
