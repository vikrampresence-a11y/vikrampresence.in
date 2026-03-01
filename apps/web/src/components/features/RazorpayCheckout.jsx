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
    if (!isAuthenticated) {
      saveRedirectPath(window.location.pathname);
      navigate(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      toast({ title: 'Login Required', description: 'Please sign in to purchase this product.' });
      return;
    }
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

  if (!showForm) {
    return (
      <button
        onClick={handleBuyClick}
        aria-label={`Buy ${product.title || 'product'} for ₹${finalPrice}`}
        className={`group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-[#E2F034] text-black font-extrabold uppercase tracking-[0.2em] text-[13px] rounded-2xl transition-all duration-500 hover:bg-[#d4e130] hover:shadow-[0_0_40px_rgba(226,240,52,0.3)] hover:-translate-y-1 active:scale-95 active:translate-y-0 ${className}`}
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />
        <CreditCard size={20} strokeWidth={2.5} />
        <span>{`${buttonText} — ₹${finalPrice}`}</span>
        <ChevronRight size={18} strokeWidth={3} className="absolute right-5 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-[1000px] mx-auto rounded-[2rem] overflow-hidden bg-[#0A0A0C] border border-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row font-sans relative ${className}`}
    >
      {/* ═══ LEFT COLUMN: Premium Showcase & Scarcity ═══ */}
      <div className="flex flex-col w-full lg:w-5/12 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-[#121215] to-[#0A0A0C] lg:border-r border-white/[0.03] relative overflow-hidden">
        {/* Contained Soft Ambient Glow (Fixed Overflow) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-[#E2F034]/[0.015] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Pricing Badge (Fixed Alignment & Added Scarcity) */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
          <div className="bg-[#E2F034] text-black px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-[0_4px_25px_rgba(226,240,52,0.25)] flex items-center gap-1.5 transform rotate-2">
            <Zap size={10} strokeWidth={3} /> Limited Offer
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full mt-2 lg:mt-6">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded-md bg-white/[0.03] text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] border border-white/5">
              <Lock size={10} className="text-[#E2F034]/80" />
              Secure Checkout
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-[1.15]">
              {product.title || 'Premium Access'}
            </h2>
            <p className="text-white/30 mt-4 text-[13px] leading-relaxed font-light pr-4">
              Unlock the definitive framework used by Top 1% creators to architect highly lucrative digital ecosystems.
            </p>
          </div>

          <div className="flex-1 mt-4">
            <h3 className="text-[10px] font-bold text-[#E2F034]/60 uppercase tracking-[0.2em] mb-5">
              What You Receive
            </h3>
            <ul className="space-y-4">
              {learningItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-[#E2F034]/10 group-hover:border-[#E2F034]/20 transition-all duration-300">
                    <CheckCircle2 size={10} className="text-[#E2F034]/80 group-hover:text-[#E2F034]" />
                  </div>
                  <span className="text-[13px] text-white/60 leading-relaxed font-light group-hover:text-white/90 transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.03] flex items-end justify-between">
            <div className="text-white/30 text-[10px] uppercase tracking-[0.25em] font-semibold pb-1.5">Total Today</div>
            <div className="text-4xl font-light text-white tracking-tight flex items-baseline gap-1">
              <span className="text-2xl text-white/40">₹</span>{finalPrice}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT COLUMN: Glassmorphic Checkout Card ═══ */}
      <div className="w-full lg:w-7/12 p-8 sm:p-10 lg:p-14 relative bg-[#0D0D10]/90 backdrop-blur-xl flex flex-col justify-center">
        <form onSubmit={handleCheckout} className="max-w-[380px] mx-auto w-full relative z-10 flex flex-col h-full">

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-2xl font-medium text-white tracking-tight mb-2">Billing Details</h3>
            <p className="text-white/30 text-[13px] font-light">Enter your verified communication details to proceed.</p>
          </div>

          <div className="space-y-6 flex-1">
            {/* ── EMAIL SECTION ── */}
            <div className="space-y-2 relative z-20">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] ml-1">
                Email Address
              </label>

              <AnimatePresence mode="wait">
                {isEmailVerified ? (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-[#E2F034]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#E2F034]/10 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-[#E2F034]" />
                    </div>
                    <span className="text-white/90 font-medium text-[13px]">{email}</span>
                  </motion.div>
                ) : (
                  <motion.div key="input" className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                        <Mail size={16} className="text-white/20 group-focus-within:text-[#E2F034]/70 transition-colors ml-1" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-28 py-4 rounded-2xl bg-[#121215] border border-white/[0.04] text-white placeholder-white/15 focus:outline-none focus:border-[#E2F034]/30 focus:bg-[#15151A] transition-all text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                      />
                      <div className="absolute inset-y-0 right-1.5 flex items-center">
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email.includes('@')}
                          className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-xl border border-white/[0.02] transition-all disabled:opacity-30 disabled:hover:bg-white/[0.03] flex items-center gap-2"
                        >
                          {emailOtpStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : null}
                          {emailCooldown > 0 ? `${emailCooldown}s` : 'Verify'}
                        </button>
                      </div>
                    </div>

                    {/* Clean & Sleek 6-Digit OTP Animated Field */}
                    <AnimatePresence>
                      {emailOtpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-1 overflow-hidden"
                        >
                          <div className="bg-[#0f0f12] border border-[#E2F034]/10 rounded-2xl p-5 shadow-[inset_0_2px_15px_rgba(0,0,0,0.3)]">
                            <label className="text-[10px] text-center w-full block font-semibold text-[#E2F034]/60 uppercase tracking-[0.2em] mb-4">
                              Enter Secure Code
                            </label>
                            <div className="flex justify-between gap-1.5 sm:gap-2">
                              {[0, 1, 2, 3, 4, 5].map((idx) => (
                                <input
                                  key={idx}
                                  ref={otpRefs[idx]}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={emailOtp[idx]}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                  className="w-10 h-14 sm:w-12 sm:h-14 mt-1 mb-1 text-center text-xl font-light bg-[#0A0A0C] border border-white/[0.05] rounded-[10px] text-white focus:outline-none focus:border-[#E2F034]/40 focus:ring-1 focus:ring-[#E2F034]/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] placeholder-white/5"
                                  placeholder="·"
                                />
                              ))}
                            </div>
                            <div className="mt-5 flex justify-center">
                              <button
                                type="button"
                                onClick={handleVerifyEmailOtp}
                                disabled={currentOtpString.length < 6 || emailOtpStatus === 'verifying'}
                                className="w-full py-3 bg-[#E2F034]/10 hover:bg-[#E2F034]/15 text-[#E2F034] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-20 flex justify-center items-center gap-2 border border-[#E2F034]/10"
                              >
                                {emailOtpStatus === 'verifying' ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} strokeWidth={2.5} />}
                                Confirm 6-Digit Code
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── PHONE SECTION ── */}
            <motion.div
              className="space-y-2 relative z-10"
              initial={{ opacity: 0.3, pointerEvents: 'none' }}
              animate={{ opacity: isEmailVerified ? 1 : 0.3, pointerEvents: isEmailVerified ? 'auto' : 'none' }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">
                  Phone Number
                </label>
                <AnimatePresence>
                  {isValidPhone && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[9px] font-bold text-[#E2F034] uppercase tracking-widest px-2 py-0.5 rounded bg-[#E2F034]/10"
                    >
                      Verified format
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                  <Phone size={16} className={`transition-colors ml-1 ${isEmailVerified ? 'text-white/20 group-focus-within:text-[#E2F034]/70' : 'text-white/5'}`} />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={!isEmailVerified}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#121215] border border-white/[0.04] text-white placeholder-white/15 focus:outline-none focus:border-[#E2F034]/30 focus:bg-[#15151A] transition-all text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  {isValidPhone ? <CheckCircle2 size={18} className="text-[#E2F034]" /> : phone.length > 0 ? <Loader2 size={16} className="text-white/20 animate-spin" /> : null}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── PAY BUTTON & TRUST BADGES ── */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={!canPay || isProcessing}
              className="relative w-full overflow-hidden group py-4.5 bg-[#E2F034] text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed hover:bg-[#d4e130] hover:shadow-[0_0_30px_rgba(226,240,52,0.2)] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />

              {isProcessing ? (
                <><Loader2 size={16} className="animate-spin" /><span>Processing Securely...</span></>
              ) : (
                <>
                  {canPay ? <CreditCard size={18} /> : <Lock size={16} className="opacity-50" />}
                  <span>{canPay ? `Confirm & Pay ₹${finalPrice}` : 'Complete Details To Pay'}</span>
                </>
              )}
            </button>

            {/* Apple-tier Trust Badges */}
            <div className="flex items-center justify-center gap-5 mt-6 border-t border-white/[0.02] pt-5">
              <div className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-[9px] uppercase font-bold tracking-[0.15em] cursor-default">
                <ShieldCheck size={11} strokeWidth={2.5} />
                <span>100% Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/5" />
              <div className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-[9px] uppercase font-bold tracking-[0.15em] cursor-default">
                <Lock size={11} strokeWidth={2.5} />
                <span>By Razorpay</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default RazorpayCheckout;
