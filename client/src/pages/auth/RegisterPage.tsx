import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Mail, KeyRound, User, Hash, RefreshCw, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      setError('Please enter your full candidate name.');
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
    // Only accept numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanValue.length > 1) {
      // Handle paste of full 6 digits
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

    // Auto focus next box
    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Dedicated paste handler — onChange can't see full paste because maxLength=1 truncates it
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
        candidateId: candidateId.trim() || undefined,
      });

      // Redirect immediately to student dashboard with auto-assigned exam ready
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

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1A2B4C] selection:text-[#FBF9F5]">
      {/* Top Academic Masthead */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1A2B4C] text-[#FBF9F5] border border-[#1C1D21] shadow-tactile mb-4">
          <ShieldCheck className="w-6 h-6 text-[#C88A2D]" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1D21]">
          Candidate Registration
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#575A65]">
          Computer-Based Testing &amp; Verification Terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#1C1D21] shadow-tactile-lg p-6 sm:p-8">
          {/* Step Indicator */}
          <div className="mb-6 flex items-center justify-between border-b border-[#DCD6CD] pb-3 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 flex items-center justify-center border font-bold ${
                  step === 1
                    ? 'bg-[#1A2B4C] text-white border-[#1C1D21]'
                    : 'bg-[#EBF5F0] text-[#236B47] border-[#236B47]'
                }`}
              >
                1
              </span>
              <span className={step === 1 ? 'font-bold text-[#1C1D21]' : 'text-[#575A65]'}>
                Credentials
              </span>
            </div>
            <div className="w-8 h-px bg-[#1C1D21]/30" />
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 flex items-center justify-center border font-bold ${
                  step === 2
                    ? 'bg-[#1A2B4C] text-white border-[#1C1D21]'
                    : 'bg-[#F4EFEA] text-[#575A65] border-[#1C1D21]/30'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'font-bold text-[#1C1D21]' : 'text-[#575A65]'}>
                OTP Verification
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 bg-[#FDF0F0] border border-[#A83232] text-[#A83232] px-4 py-3 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-[#A83232] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {successMessage && !error && (
            <div className="mb-5 bg-[#EBF5F0] border border-[#236B47] text-[#236B47] px-4 py-3 text-xs flex items-start gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#236B47] shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Registration Credentials Form */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#575A65]" />
                  Full Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Mehta"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#575A65]" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#575A65]" />
                  Roll Number / Candidate ID <span className="text-[#8E929E] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="e.g. CET-2026-0005"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#575A65]" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#1C1D21] mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#575A65]" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-[#1C1D21] text-xs sm:text-sm font-sans focus:outline-none focus:bg-white focus:shadow-tactile transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 px-4 bg-[#1A2B4C] hover:bg-[#121F38] text-[#FBF9F5] font-mono text-xs uppercase tracking-wider font-bold btn-tactile flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#FBF9F5] border-t-transparent animate-spin" />
                      <span>Dispatching OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4 text-[#C88A2D]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 6-Digit Snappy OTP Input */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="text-center">
                <p className="font-mono text-xs text-[#575A65]">
                  Enter the 6-digit verification code sent to:
                </p>
                <p className="font-mono text-sm font-bold text-[#1A2B4C] mt-0.5">
                  {email}
                </p>
              </div>

              {/* 6-box input */}
              <div className="flex justify-center items-center gap-2 sm:gap-2.5 my-4">
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
                    className="w-10 sm:w-12 h-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold bg-[#FBF9F5] border-2 border-[#1C1D21] text-[#1C1D21] focus:bg-white focus:border-[#1A2B4C] focus:shadow-tactile focus:outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || otpDigits.join('').length !== 6}
                  className="w-full py-3 px-4 bg-[#236B47] hover:bg-[#1C5538] text-white font-mono text-xs uppercase tracking-wider font-bold btn-tactile flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                      <span>Verifying &amp; Initializing Account...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#FBF9F5]" />
                      <span>Verify &amp; Launch Portal</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-[#575A65] hover:text-[#1C1D21] flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isSendingOtp}
                    className="text-[#1A2B4C] font-bold hover:underline disabled:text-[#8E929E] disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Micro Footer */}
          <div className="mt-6 pt-4 border-t border-[#DCD6CD] flex items-center justify-between text-[11px] font-mono text-[#575A65]">
            <span>Already registered?</span>
            <Link to="/login" className="font-bold text-[#1A2B4C] hover:underline">
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
