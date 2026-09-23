import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { AlertCircle, ArrowRight, ArrowLeft, Mail, Key, User, ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { FoxCadetMascot } from '../../components/auth/FoxCadetMascot';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mascot interaction state
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // OTP 6-digit state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer state
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { verifyOtpAndLogin } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown tick
  useEffect(() => {
    let interval: any;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full student name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await api.post('/auth/send-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
      });

      setSuccessMessage(`A 6-digit verification code was dispatched to ${email}.`);
      setStep(2);
      setCooldown(60);

      // Auto-focus first digit input in Step 2
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Failed to dispatch verification email. Please try again.'
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;
    setError(null);
    setIsSendingOtp(true);
    try {
      await api.post('/auth/send-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
      });
      setSuccessMessage(`New 6-digit verification code dispatched to ${email}.`);
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Failed to resend code. Please try again.'
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanValue.length > 1) {
      const pastedChars = cleanValue.slice(0, 6).split('');
      pastedChars.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedChars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Dedicated paste handler
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    pasted.split('').forEach((char, i) => {
      if (index + i < 6) newDigits[index + i] = char;
    });
    setOtpDigits(newDigits);
    otpInputRefs.current[Math.min(index + pasted.length, 5)]?.focus();
  };

  // Handle Step 2: Verify OTP and complete registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpAndLogin({
        email: email.trim().toLowerCase(),
        code: fullCode,
        name: name.trim(),
        password,
      });

      setIsSuccess(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 180));
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Compact input class — py-2.5 for viewport optimization
  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-[#121826] border border-slate-800/80 rounded-lg text-sm text-[#F3F4F6] placeholder:text-slate-500 focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]/40 focus:outline-none transition-all';

  return (
    <div
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      className="min-h-screen bg-[#0B0F17] text-stone-100 flex flex-col lg:flex-row font-sans selection:bg-[#C85A32] selection:text-white relative overflow-x-hidden"
    >
      {/* Dynamic Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap');
        .font-space-grotesk {
          font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      {/* Soft Ambient Radial Canvas Wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#131B2A_0%,_#0D111A_45%,_#0B0F17_85%)] opacity-85 pointer-events-none" />

      {/* ========================================================= */}
      {/* LEFT 60% STAGE: Mascot Stage (Desktop)                    */}
      {/* ========================================================= */}
      <section
        aria-label="Cadet Mascot Stage"
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] lg:h-screen lg:max-h-screen relative flex-col items-center justify-center p-8 lg:p-12 overflow-hidden select-none"
      >
        {/* Ambient Cosmic Depth Rings */}
        <div className="absolute w-[460px] h-[460px] rounded-full border border-slate-800/40 pointer-events-none -translate-y-4" />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-slate-800/20 pointer-events-none -translate-y-4" />

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
      {/* RIGHT 40% STAGE: Enlistment Terminal                      */}
      {/* ========================================================= */}
      <section
        aria-label="Enlistment Terminal"
        className="w-full lg:w-[42%] xl:w-[40%] min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center items-center px-6 py-6 sm:px-10 lg:px-12 z-10 overflow-y-auto"
      >
        {/* Mobile Mascot (< 1024px) — full vector, no clipping */}
        <div className="lg:hidden flex justify-center mb-4">
          <FoxCadetMascot
            isPasswordFocused={isPasswordFocused}
            isError={Boolean(error)}
            isSuccess={isSuccess}
            mousePosition={mousePosition}
            className="w-28 h-auto overflow-visible"
          />
        </div>

        {/* Borderless Floating Form Container */}
        <div className="relative w-full max-w-md space-y-3.5">

          {/* Subtle Corner Tick Marks */}
          <span className="hidden sm:block absolute -top-4 -left-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -top-4 -right-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -bottom-4 -left-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>
          <span className="hidden sm:block absolute -bottom-4 -right-4 font-mono text-xs text-stone-700/60 select-none pointer-events-none">+</span>

          {/* Centered Editorial Header */}
          <div className="flex flex-col items-center text-center mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6] font-space-grotesk">
              Student Registration
            </h1>
          </div>

          {/* 2-Step Progress Indicator */}
          <div className="flex items-center justify-center gap-3">
            {/* Step 1 */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                step === 1 ? 'bg-[#D4A373] shadow-[0_0_6px_rgba(212,163,115,0.5)]' : 'bg-emerald-500'
              }`} />
              <span className={`font-mono text-[11px] tracking-[0.12em] uppercase transition-colors ${
                step === 1 ? 'text-[#D4A373] font-bold' : 'text-slate-500'
              }`}>
                01 Credentials
              </span>
            </div>

            {/* Divider */}
            <div className="w-8 md:w-12 border-t border-dashed border-slate-800" />

            {/* Step 2 */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                step === 2 ? 'bg-[#D4A373] shadow-[0_0_6px_rgba(212,163,115,0.5)]' : 'bg-slate-700'
              }`} />
              <span className={`font-mono text-[11px] tracking-[0.12em] uppercase transition-colors ${
                step === 2 ? 'text-[#D4A373] font-bold' : 'text-slate-600'
              }`}>
                02 Verification
              </span>
            </div>
          </div>

          {/* Error Feedback Banner */}
          {error && (
            <div className="bg-[#261316] text-[#FCA5A5] px-4 py-2.5 text-xs rounded-lg flex items-start gap-2.5 border border-red-950">
              <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Feedback Banner */}
          {successMessage && !error && (
            <div className="bg-[#0F1F17] text-emerald-300 px-4 py-2.5 text-xs rounded-lg flex items-start gap-2.5 border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ====================================== */}
          {/* STEP 1: Credentials Form               */}
          {/* ====================================== */}
          {step === 1 && (
            <form className="space-y-3" onSubmit={handleSendOtp}>
              {/* Full Student Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8A99AD] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Student Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A99AD] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Mehta"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8A99AD] mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A99AD] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@cbt.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8A99AD] mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A99AD] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Minimum 8 characters"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8A99AD] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A99AD] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Re-enter password"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className={`w-full py-3 px-5 bg-[#C85A32] hover:bg-[#B54E29] text-[#F3F4F6] font-mono text-sm font-bold rounded-lg shadow-lg active:translate-y-[1px] transition-all flex items-center justify-center gap-2 ${
                    isSendingOtp ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                  }`}
                >
                  {isSendingOtp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Dispatching Code…</span>
                    </div>
                  ) : (
                    <>
                      <span>[ Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>]</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ====================================== */}
          {/* STEP 2: OTP Verification Terminal      */}
          {/* ====================================== */}
          {step === 2 && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="text-center space-y-1">
                <p className="text-xs text-[#8A99AD] font-mono">
                  Enter the 6-digit transmission code dispatched to:
                </p>
                <p className="text-sm font-mono font-bold text-[#D4A373]">
                  {email}
                </p>
              </div>

              {/* 6-Digit Input Grid */}
              <div className="flex justify-center items-center gap-2 sm:gap-3 my-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    aria-label={`OTP digit ${idx + 1}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={(e) => handleOtpPaste(e, idx)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center font-mono text-lg sm:text-xl font-bold bg-[#151C2C] border border-slate-800 rounded-xl text-[#F3F4F6] focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]/40 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Resend Telemetry Bar */}
              <div className="flex items-center justify-center">
                {cooldown > 0 ? (
                  <span className="font-mono text-[11px] tracking-wider text-slate-500 uppercase">
                    Resend Code In ({cooldown}s)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="font-mono text-[11px] tracking-wider text-[#D4A373] hover:text-[#E0B68A] font-bold uppercase flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    Request New Code
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={isVerifying || otpDigits.join('').length !== 6}
                  className={`w-full py-3 px-5 bg-[#C85A32] hover:bg-[#B54E29] text-[#F3F4F6] font-mono text-sm font-bold rounded-lg shadow-lg active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                    isVerifying ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Activating Account…</span>
                    </div>
                  ) : (
                    <>
                      <span>[ Activate Cadet Account</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>]</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full text-center font-mono text-xs text-slate-400 hover:text-[#D4A373] flex items-center justify-center gap-1.5 transition-colors py-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Credentials</span>
                </button>
              </div>
            </form>
          )}

          {/* Terminal Footer */}
          <div className="pt-1 text-center">
            <Link
              to="/login"
              className="text-xs text-stone-400 hover:text-[#D4A373] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <span>Already registered? Sign In Here</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
