import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Phone, CheckCircle2, ChevronRight, KeyRound, Lock, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const RazorpayCheckout = ({ product = {}, className = '', buttonText = 'Buy Now' }) => {
  const { processPayment, isProcessing } = usePayment();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  // OTP State (6 Digits for High Security PHP Backend)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpStatus, setEmailOtpStatus] = useState('idle');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const emailCooldownRef = useRef(null);

  const isValidPhone = phone.length === 10;

  useEffect(() => {
    if (currentUser?.email) setEmail(currentUser.email);
    return () => { if (emailCooldownRef.current) clearInterval(emailCooldownRef.current); };
  }, [currentUser]);

  const startCooldown = () => {
    setEmailCooldown(60);
    emailCooldownRef.current = setInterval(() => {
      setEmailCooldown((prev) => {
        if (prev <= 1) { clearInterval(emailCooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendEmailOtp = async () => {
    if (emailCooldown > 0) return;
    if (!email || !email.includes('@') || email.length < 5) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email address.', variant: 'destructive' });
      return;
    }
    setEmailOtpStatus('sending');
    try {
      // Pointing to new PHP Backend
      const res = await apiServerClient.fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailOtpSent(true);
        setEmailOtpStatus('sent');
        toast({ title: 'OTP Sent', description: 'Check your email inbox for the 6-digit code.' });
        startCooldown();
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Failed', description: data.error || 'Could not send email OTP.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Network Error', description: 'Could not reach the server.', variant: 'destructive' });
    }
  };

  const currentOtpString = emailOtp.join('');

  const handleVerifyEmailOtp = async () => {
    if (currentOtpString.length < 6) return;
    setEmailOtpStatus('verifying');
    try {
      // Pointing to new PHP Backend
      const res = await apiServerClient.fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', email, otp: currentOtpString }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsEmailVerified(true);
        setEmailOtpStatus('idle');

        // Note: For a pure PHP rewrite without Node Pocketbase, user auto-login sync might fail silently
        // but we preserve the logic in case PocketBase is running remotely on Hostinger via VPS.
        if (data.token && data.user && data.user.id !== 'php_user') {
          pb.authStore.save(data.token, data.user);
        }

        toast({ title: 'Verified', description: 'Email verified successfully.' });
      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Invalid OTP', description: data.error || 'Incorrect code.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Error', description: 'Could not verify OTP.', variant: 'destructive' });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp(['', '', '', '', '', '']);
      setEmailOtpStatus('idle');
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
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

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!isEmailVerified || !isValidPhone) return;
    processPayment(product, {
      name: currentUser?.name || 'Guest User',
      email,
      phone,
    }, (data) => {
      navigate('/thank-you', {
        state: { productName: data.productName, googleDriveLink: data.googleDriveLink },
      });
    });
  };

  const handleBuyClick = () => {
    // V2.0 FIX: Removed mandatory login gate. 
    // The checkout form itself handles OTP verification which is sufficient.
    setShowForm(true);
  };

  const canPay = isEmailVerified && isValidPhone;
  const learningItems = product.whatYouLearn ? product.whatYouLearn.split(',').map(s => s.trim()) : [
    "High-converting mental architecture models",
    "Psychology-driven design frameworks",
    "Flawless and optimized user experiences",
    "Millionaire-tier conversion strategies"
  ];
  const finalPrice = product.price || 0;

  // Step indicator state
  const checkoutStep = isEmailVerified ? (isValidPhone ? 2 : 1) : 0;

  if (!showForm) {
    return (
      <motion.button
        onClick={handleBuyClick}
        aria-label={`Buy ${product.title || 'product'} for ₹${finalPrice}`}
        className={`group relative flex items-center justify-center gap-3 w-full px-10 py-6 bg-[#E2F034] text-black font-black uppercase tracking-[0.15em] text-base rounded-2xl transition-all duration-500 hover:bg-[#d4e130] hover:shadow-[0_0_50px_rgba(226,240,52,0.35)] hover:-translate-y-1 active:scale-95 active:translate-y-0 overflow-hidden ${className}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />
        <CreditCard size={22} strokeWidth={2.5} className="relative z-10" />
        <span className="relative z-10">{`${buttonText} — ₹${finalPrice}`}</span>
        <ChevronRight size={20} strokeWidth={3} className="absolute right-5 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full rounded-2xl overflow-hidden glass-card-premium p-6 sm:p-8 font-sans ${className}`}
    >
      <form onSubmit={handleCheckout} className="w-full space-y-5">

        {/* Header + Step Indicator */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center">
            <Lock size={14} className="text-[#E2F034]/80" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold tracking-tight">Secure Checkout</p>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.1em]">Verify email → Enter phone → Pay</p>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            <div className={`step-dot ${checkoutStep >= 0 ? (checkoutStep > 0 ? 'completed' : 'active') : ''}`} />
            <div className={`step-line ${checkoutStep >= 1 ? 'completed' : ''}`} style={{ width: '12px' }} />
            <div className={`step-dot ${checkoutStep >= 1 ? (checkoutStep > 1 ? 'completed' : 'active') : ''}`} />
            <div className={`step-line ${checkoutStep >= 2 ? 'completed' : ''}`} style={{ width: '12px' }} />
            <div className={`step-dot ${checkoutStep >= 2 ? 'active' : ''}`} />
          </div>
        </div>

        {/* ── EMAIL ── */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em] ml-1">
            Email Address
          </label>

          <AnimatePresence mode="wait">
            {isEmailVerified ? (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-green-400/[0.03] border border-green-400/15"
              >
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-white/80 font-medium text-sm">{email}</span>
              </motion.div>
            ) : (
              <motion.div key="input" className="space-y-3">
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15 group-focus-within:text-[#E2F034]/60 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-28 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/12 focus:outline-none focus:border-[#E2F034]/30 focus:shadow-[0_0_15px_rgba(226,240,52,0.05)] transition-all duration-300 text-sm font-medium"
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center">
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email.includes('@')}
                      className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg border border-white/[0.04] transition-all duration-300 disabled:opacity-20 flex items-center gap-2"
                    >
                      {emailOtpStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : null}
                      {emailCooldown > 0 ? `${emailCooldown}s` : 'Send OTP'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {emailOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/[0.02] border border-[#E2F034]/10 rounded-xl p-4">
                        <label className="text-[10px] text-center w-full block font-semibold text-[#E2F034]/50 uppercase tracking-[0.15em] mb-3">
                          Enter 6-Digit Code
                        </label>
                        <div className="flex justify-between gap-1.5">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <motion.input
                              key={idx}
                              ref={otpRefs[idx]}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={emailOtp[idx]}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-light bg-white/[0.02] border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-[#E2F034]/40 focus:shadow-[0_0_12px_rgba(226,240,52,0.08)] transition-all duration-300 placeholder-white/5"
                              placeholder="·"
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={currentOtpString.length < 6 || emailOtpStatus === 'verifying'}
                          className="w-full mt-3 py-3 bg-[#E2F034]/[0.08] hover:bg-[#E2F034]/[0.12] text-[#E2F034] text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg transition-all disabled:opacity-15 flex justify-center items-center gap-2 border border-[#E2F034]/[0.08]"
                        >
                          {emailOtpStatus === 'verifying' ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                          Verify Code
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PHONE ── */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0.3, pointerEvents: 'none' }}
          animate={{ opacity: isEmailVerified ? 1 : 0.3, pointerEvents: isEmailVerified ? 'auto' : 'none' }}
          transition={{ duration: 0.4 }}
        >
          <label className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em] ml-1">
            Phone Number
          </label>
          <div className="relative group">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15" />
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              disabled={!isEmailVerified}
              placeholder="10-digit mobile number"
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/12 focus:outline-none focus:border-[#E2F034]/30 focus:shadow-[0_0_15px_rgba(226,240,52,0.05)] transition-all duration-300 text-sm font-medium disabled:opacity-40"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              {isValidPhone ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle2 size={18} className="text-green-400" />
                </motion.div>
              ) : phone.length > 0 ? (
                <Loader2 size={16} className="text-white/15 animate-spin" />
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* ── BIG PAY BUTTON ── */}
        <motion.button
          type="submit"
          disabled={!canPay || isProcessing}
          className="relative w-full overflow-hidden group py-5 bg-[#E2F034] text-black rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-15 disabled:grayscale disabled:cursor-not-allowed hover:bg-[#d4e130] hover:shadow-[0_0_50px_rgba(226,240,52,0.25)] active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
          whileHover={canPay ? { scale: 1.01 } : {}}
          whileTap={canPay ? { scale: 0.98 } : {}}
        >
          <div className="absolute inset-0 bg-white/25 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />
          {isProcessing ? (
            <><Loader2 size={18} className="animate-spin relative z-10" /><span className="relative z-10">Processing…</span></>
          ) : (
            <>
              {canPay ? <CreditCard size={20} className="relative z-10" /> : <Lock size={18} className="opacity-40 relative z-10" />}
              <span className="relative z-10">{canPay ? `Pay ₹${finalPrice}` : 'Complete Details To Pay'}</span>
            </>
          )}
        </motion.button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-5 text-white/15 text-[9px] uppercase font-bold tracking-[0.1em]">
          <span className="flex items-center gap-1.5"><ShieldCheck size={11} /> Secure</span>
          <span className="flex items-center gap-1.5"><Lock size={11} /> Razorpay</span>
          <span className="flex items-center gap-1.5"><Zap size={11} /> Instant</span>
        </div>

      </form>
    </motion.div>
  );
};

export default RazorpayCheckout;
