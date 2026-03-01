import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Phone, CheckCircle2, ChevronRight, XCircle, Send, ShieldCheck, KeyRound, Lock, CreditCard, Zap, Star } from 'lucide-react';
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

  // OTP State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
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
      const res = await apiServerClient.fetch('/verification/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailOtpSent(true);
        setEmailOtpStatus('sent');
        toast({ title: 'OTP Sent', description: 'Check your email inbox for the 4-digit code.' });
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
    if (currentOtpString.length < 4) return;
    setEmailOtpStatus('verifying');
    try {
      const res = await apiServerClient.fetch('/verification/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: currentOtpString }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsEmailVerified(true);
        setEmailOtpStatus('idle');

        // --- AUTO LOGIN TRIGGER ---
        // If the backend created/fetched a user and issued a token, log them in instantly
        if (data.token && data.user) {
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
      setEmailOtp(['', '', '', '']);
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

    if (digit && index < 3) {
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
        className={`group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#FFD700] text-black font-semibold uppercase tracking-widest text-sm rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-yellow-400 hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] active:scale-95 ${className}`}
      >
        <CreditCard size={18} />
        <span>{`${buttonText} — ₹${finalPrice}`}</span>
        <ChevronRight size={16} className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden bg-[#0A0A0C] border border-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row font-sans ${className}`}
    >
      {/* ═══ LEFT COLUMN: Product Showcase ═══ */}
      <div className="flex flex-col w-full lg:w-5/12 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-[#121215] to-[#0A0A0C] border-b lg:border-b-0 lg:border-r border-white/[0.03] relative overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-[#FFD700]/[0.02] rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 rounded-lg border border-white/5 bg-white/[0.02] text-white/50 text-[10px] uppercase font-bold tracking-[0.2em]">
              <Lock size={10} className="text-[#FFD700]/70" />
              Secure Checkout
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-[1.15]">
              {product.title || 'Premium Access'}
            </h2>
            <p className="text-white/30 mt-3 text-[13px] leading-relaxed font-light">
              You are one step away from unlocking the ultimate premium experience.
            </p>
          </div>

          <div className="flex-1 mt-6">
            <h3 className="text-[11px] font-semibold text-[#FFD700]/60 uppercase tracking-[0.15em] mb-5">
              What You Will Learn / Get
            </h3>
            <ul className="space-y-4">
              {learningItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3.5 group">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-[#FFD700]/10 group-hover:border-[#FFD700]/20 transition-all duration-300">
                    <CheckCircle2 size={11} className="text-[#FFD700]/80 group-hover:text-[#FFD700]" />
                  </div>
                  <span className="text-[13px] text-white/60 leading-relaxed font-light group-hover:text-white/80 transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 pt-8 border-t border-white/[0.03] flex items-end justify-between">
            <div className="text-white/30 text-[11px] uppercase tracking-widest font-semibold pb-1">Total Today</div>
            <div className="text-3xl font-light text-white tracking-tight">₹{finalPrice}</div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT COLUMN: Premium Checkout Card ═══ */}
      <div className="w-full lg:w-7/12 p-8 sm:p-10 lg:p-14 relative bg-[#0D0D10] flex flex-col justify-center">
        <form onSubmit={handleCheckout} className="max-w-[420px] mx-auto w-full relative z-10 flex flex-col h-full">

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-2xl font-medium text-white tracking-tight mb-2">Payment Details</h3>
            <p className="text-white/30 text-[13px] font-light">Enter your verified details to complete the purchase.</p>
          </div>

          <div className="space-y-7 flex-1">
            {/* ── EMAIL SECTION ── */}
            <div className="space-y-2.5 relative z-20">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] ml-1">
                Email Address
              </label>

              <AnimatePresence mode="wait">
                {isEmailVerified ? (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.015] border border-green-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-green-400" />
                    </div>
                    <span className="text-green-50/80 font-medium text-[13px]">{email}</span>
                  </motion.div>
                ) : (
                  <motion.div key="input" className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                        <Mail size={16} className="text-white/20 group-focus-within:text-[#FFD700]/70 transition-colors ml-1" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-28 py-4.5 rounded-2xl bg-[#121215] border border-white/[0.04] text-white placeholder-white/15 focus:outline-none focus:border-[#FFD700]/30 focus:bg-[#15151A] transition-all text-[13px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                      />
                      <div className="absolute inset-y-0 right-1.5 flex items-center">
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email.includes('@')}
                          className="px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.05] text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-xl border border-white/[0.02] transition-all disabled:opacity-30 disabled:hover:bg-white/[0.03] flex items-center gap-2"
                        >
                          {emailOtpStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : null}
                          {emailCooldown > 0 ? `${emailCooldown}s` : 'Verify'}
                        </button>
                      </div>
                    </div>

                    {/* Highly Controlled OTP Component */}
                    <AnimatePresence>
                      {emailOtpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-1 overflow-hidden"
                        >
                          <div className="bg-[#121215] border border-white/[0.04] rounded-2xl p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                            <label className="text-[10px] text-center w-full block font-medium text-white/40 uppercase tracking-[0.15em] mb-4">
                              Enter 4-Digit Code
                            </label>
                            <div className="flex justify-center gap-3.5">
                              {[0, 1, 2, 3].map((idx) => (
                                <input
                                  key={idx}
                                  ref={otpRefs[idx]}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={emailOtp[idx]}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                  className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-light bg-[#0A0A0C] border border-white/[0.05] rounded-xl text-white focus:outline-none focus:border-[#FFD700]/40 focus:ring-1 focus:ring-[#FFD700]/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] placeholder-white/10"
                                  placeholder="·"
                                />
                              ))}
                            </div>
                            <div className="mt-6 flex justify-center">
                              <button
                                type="button"
                                onClick={handleVerifyEmailOtp}
                                disabled={currentOtpString.length < 4 || emailOtpStatus === 'verifying'}
                                className="w-full max-w-[220px] py-3.5 bg-white/[0.03] hover:bg-white/[0.06] text-white/90 text-[11px] font-semibold uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-30 flex justify-center items-center gap-2 border border-white/[0.04]"
                              >
                                {emailOtpStatus === 'verifying' ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} className="text-white/40" />}
                                Confirm Code
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
              className="space-y-2.5 relative z-10"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: isEmailVerified ? 1 : 0.4 }}
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
                      className="text-[10px] font-bold text-green-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-green-500/10"
                    >
                      Valid
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                  <Phone size={16} className={`transition-colors ml-1 ${isEmailVerified ? 'text-white/20 group-focus-within:text-[#FFD700]/70' : 'text-white/5'}`} />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={!isEmailVerified}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-12 py-4.5 rounded-2xl bg-[#121215] border border-white/[0.04] text-white placeholder-white/15 focus:outline-none focus:border-[#FFD700]/30 focus:bg-[#15151A] transition-all text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  {isValidPhone ? <CheckCircle2 size={18} className="text-green-400" /> : phone.length > 0 ? <Loader2 size={16} className="text-white/20 animate-spin" /> : null}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── PAY BUTTON & TRUST BADGES ── */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={!canPay || isProcessing}
              className="relative w-full overflow-hidden group py-5 bg-[#FFD700] text-black rounded-2xl font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:bg-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /><span>Processing Securely...</span></>
              ) : (
                <>
                  {canPay ? <CreditCard size={18} /> : <Lock size={16} className="opacity-50" />}
                  <span>{canPay ? `Confirm & Pay ₹${finalPrice}` : 'Complete Details'}</span>
                </>
              )}
            </button>

            {/* Apple-tier Trust Badges */}
            <div className="flex items-center justify-center gap-5 mt-6 border-t border-white/[0.02] pt-6">
              <div className="flex items-center gap-1.5 text-[#FFD700]/40 hover:text-[#FFD700]/70 transition-colors text-[10px] uppercase font-semibold tracking-widest cursor-default">
                <ShieldCheck size={12} />
                <span>100% Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/5" />
              <div className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-[10px] uppercase font-semibold tracking-widest cursor-default">
                <Lock size={12} />
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
