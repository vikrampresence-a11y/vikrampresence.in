import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
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

        // Auto-login logic
        if (data.token && data.user && !data.user.id.startsWith('hostinger_')) {
          pb.authStore.save(data.token, data.user);
        }
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

  return (
    <>
      <Helmet>
        <title>Login | Vikram Presence</title>
      </Helmet>
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E2F034]/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tighter mb-3">Welcome Back</h1>
            <p className="text-gray-400 text-sm font-light">
              Enter your email to receive a secure login code. No passwords needed.
            </p>
          </div>

          {!emailOtpSent ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-white uppercase tracking-widest pl-1">Email <span className="text-[#E2F034]">*</span></label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#E2F034] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E2F034]/50 focus:ring-1 focus:ring-[#E2F034]/50 transition-all font-medium"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={emailOtpStatus === 'sending' || emailCooldown > 0}
                className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#E2F034] text-black hover:bg-[#c8d42e] shadow-[0_0_20px_rgba(226,240,52,0.2)]"
              >
                {emailOtpStatus === 'sending' ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : emailCooldown > 0 ? (
                  `Resend in ${emailCooldown}s`
                ) : (
                  <>Send Magic Code <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-white uppercase tracking-widest pl-1">Verification Code <span className="text-[#E2F034]">*</span></label>
                  {emailOtpStatus === 'idle' && isEmailVerified && (
                    <span className="text-[#E2F034] text-xs font-bold flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  {emailOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl bg-[#111] border transition-all ${isEmailVerified
                        ? 'border-[#E2F034] text-[#E2F034] shadow-[0_0_15px_rgba(226,240,52,0.2)]'
                        : emailOtpStatus === 'error'
                          ? 'border-red-500/50 text-red-400'
                          : emailOtpStatus === 'verifying'
                            ? 'border-white/30 text-white opacity-50'
                            : 'border-white/10 text-white focus:border-[#E2F034]/50 focus:ring-1 focus:ring-[#E2F034]/50'
                        }`}
                      placeholder="·"
                      disabled={isEmailVerified || emailOtpStatus === 'verifying'}
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-xs text-center mt-3">
                  Code sent to <span className="text-[#E2F034]">{email}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={currentOtpString.length < 6 || isEmailVerified || emailOtpStatus === 'verifying'}
                  className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-lg"
                >
                  {emailOtpStatus === 'verifying' ? (
                    <>Verifying <Loader2 className="animate-spin w-4 h-4" /></>
                  ) : isEmailVerified ? (
                    <>Verified</>
                  ) : (
                    'Verify & Login'
                  )}
                </button>

                <button
                  onClick={handleSendEmailOtp}
                  disabled={emailCooldown > 0 || isEmailVerified}
                  className="w-full py-3 rounded-2xl font-semibold text-xs tracking-wider text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {emailCooldown > 0 ? `Resend Code in ${emailCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
