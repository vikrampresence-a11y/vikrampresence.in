import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2, Mail, ShieldCheck, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// V2.0: loginWithPhpUser saves auth to localStorage
import { useToast } from '@/components/ui/use-toast';
import apiServerClient from '@/lib/apiServerClient';
// pb import removed — V2.0 uses loginWithPhpUser instead of pb.authStore

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${5 + Math.random() * 8}s`,
    delay: `${Math.random() * 5}s`,
    size: Math.random() > 0.5 ? 3 : 2,
  }));

  return (
    <div className="floating-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--duration': p.duration,
            '--delay': p.delay,
          }}
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const { isAuthenticated, loginWithPhpUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/my-products';
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpStatus, setEmailOtpStatus] = useState('idle');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const emailCooldownRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
    return () => {
      if (emailCooldownRef.current) clearInterval(emailCooldownRef.current);
    };
  }, [isAuthenticated, navigate, redirectUrl]);

  const startCooldown = () => {
    setEmailCooldown(60);
    emailCooldownRef.current = setInterval(() => {
      setEmailCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(emailCooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (emailCooldown > 0) return;
    if (!email || !email.includes('@') || email.length < 5) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email address.', variant: 'destructive' });
      return;
    }
    setEmailOtpStatus('sending');
    try {
      const res = await apiServerClient.fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailOtpSent(true);
        setEmailOtpStatus('sent');
        toast({ title: 'OTP Sent', description: 'Check your email inbox for the magic code.' });
        startCooldown();
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Failed', description: data.error || 'Could not send login OTP.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Network Error', description: 'Could not reach the server.', variant: 'destructive' });
    }
  };

  const currentOtpString = emailOtp.join('');

  const handleVerifyEmailOtp = async () => {
    if (currentOtpString.length < 4) return;
    setEmailOtpStatus('verifying');
    try {
      const res = await apiServerClient.fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', email, otp: currentOtpString }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsEmailVerified(true);
        setEmailOtpStatus('idle');

        // V2.0 FIX: Use loginWithPhpUser (localStorage) instead of pb.authStore.save
        // This ensures auth state persists even without a live PocketBase instance
        loginWithPhpUser({ email, id: data.user?.id || 'otp_' + Date.now(), name: data.user?.name || '' });

        toast({ title: 'Login Successful', description: 'Welcome to Vikram Presence.' });
        navigate(redirectUrl);

      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Invalid OTP', description: data.error || 'Incorrect code.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Error', description: 'Could not verify OTP.', variant: 'destructive' });
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...emailOtp];
    newOtp[index] = digit;
    setEmailOtp(newOtp);

    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Step indicator state
  const currentStep = isEmailVerified ? 2 : emailOtpSent ? 1 : 0;

  return (
    <>
      <Helmet>
        <title>Login | Vikram Presence</title>
      </Helmet>
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Floating Particles */}
        <FloatingParticles />

        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E2F034]/[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

        {/* Orbiting decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
          <div className="animate-orbit absolute w-2 h-2 bg-[#E2F034]/20 rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md glass-card-premium p-8 md:p-10 relative z-10"
        >
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`step-dot ${currentStep >= 0 ? (currentStep > 0 ? 'completed' : 'active') : ''}`} />
            <div className={`step-line ${currentStep >= 1 ? 'completed' : ''}`} />
            <div className={`step-dot ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : ''}`} />
            <div className={`step-line ${currentStep >= 2 ? 'completed' : ''}`} />
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`} />
          </div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E2F034]/10 border border-[#E2F034]/20 mb-5"
            >
              <Sparkles className="text-[#E2F034]" size={24} />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tighter mb-3">Welcome Back</h1>
            <p className="text-white/35 text-sm font-light">
              Enter your email to receive a secure login code. No passwords needed.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!emailOtpSent ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSendEmailOtp}
                className="space-y-6"
              >
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] pl-1">Email <span className="text-[#E2F034]">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 w-5 h-5 group-focus-within:text-[#E2F034] transition-colors duration-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#E2F034]/40 focus:ring-1 focus:ring-[#E2F034]/20 focus:shadow-[0_0_20px_rgba(226,240,52,0.06)] transition-all duration-300 font-medium"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={emailOtpStatus === 'sending' || emailCooldown > 0}
                  className="relative overflow-hidden w-full py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-[#E2F034] text-black hover:bg-[#d4e22e] shadow-[0_0_25px_rgba(226,240,52,0.2)] hover:shadow-[0_0_40px_rgba(226,240,52,0.35)] group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  {emailOtpStatus === 'sending' ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : emailCooldown > 0 ? (
                    `Resend in ${emailCooldown}s`
                  ) : (
                    <><span className="relative z-10">Send Magic Code</span> <ArrowRight size={18} className="relative z-10" /></>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] pl-1">Verification Code <span className="text-[#E2F034]">*</span></label>
                    {emailOtpStatus === 'idle' && isEmailVerified && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Verified
                      </motion.span>
                    )}
                  </div>

                  <div className="flex gap-2.5 justify-center">
                    {emailOtp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl bg-white/[0.03] border-2 transition-all duration-300 backdrop-blur-sm ${isEmailVerified
                          ? 'border-green-400/50 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.15)] bg-green-400/[0.03]'
                          : emailOtpStatus === 'error'
                            ? 'border-red-500/40 text-red-400'
                            : emailOtpStatus === 'verifying'
                              ? 'border-white/20 text-white/50'
                              : 'border-white/[0.08] text-white focus:border-[#E2F034]/50 focus:shadow-[0_0_20px_rgba(226,240,52,0.1)] focus:bg-white/[0.04]'
                          }`}
                        placeholder="·"
                        disabled={isEmailVerified || emailOtpStatus === 'verifying'}
                      />
                    ))}
                  </div>
                  <p className="text-white/25 text-xs text-center mt-3">
                    Code sent to <span className="text-[#E2F034] font-medium">{email}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleVerifyEmailOtp}
                    disabled={currentOtpString.length < 6 || isEmailVerified || emailOtpStatus === 'verifying'}
                    className="relative overflow-hidden w-full py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-100 shadow-[0_4px_20px_rgba(255,255,255,0.06)] group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {emailOtpStatus === 'verifying' ? (
                      <>Verifying <Loader2 className="animate-spin w-4 h-4" /></>
                    ) : isEmailVerified ? (
                      <>Verified <CheckCircle className="w-4 h-4 text-green-600" /></>
                    ) : (
                      'Verify & Login'
                    )}
                  </motion.button>

                  <button
                    onClick={handleSendEmailOtp}
                    disabled={emailCooldown > 0 || isEmailVerified}
                    className="w-full py-3 rounded-2xl font-semibold text-xs tracking-wider text-white/30 hover:text-white/60 transition-all duration-300 disabled:opacity-30"
                  >
                    {emailCooldown > 0 ? `Resend Code in ${emailCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom trust */}
          <div className="flex items-center justify-center gap-4 mt-8 text-white/15 text-[9px] uppercase tracking-widest font-medium">
            <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-[#E2F034]/30" /> Secure</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-1"><Mail size={10} className="text-[#E2F034]/30" /> Encrypted</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
