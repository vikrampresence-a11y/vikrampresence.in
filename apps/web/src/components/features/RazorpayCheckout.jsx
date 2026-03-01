
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Phone, CheckCircle2, XCircle, Send, ShieldCheck, KeyRound, Lock, CreditCard, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';
import apiServerClient from '@/lib/apiServerClient';

const RazorpayCheckout = ({ product, className = '', buttonText = 'Buy Now' }) => {
  const { processPayment, isProcessing } = usePayment();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  // ── Email OTP State ──
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpStatus, setEmailOtpStatus] = useState('idle');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const emailCooldownRef = useRef(null);

  // ── Phone Validation (No OTP — strict 10-digit only) ──
  const isValidPhone = phone.length === 10;

  useEffect(() => {
    return () => { if (emailCooldownRef.current) clearInterval(emailCooldownRef.current); };
  }, []);

  const startCooldown = () => {
    setEmailCooldown(60);
    emailCooldownRef.current = setInterval(() => {
      setEmailCooldown((prev) => {
        if (prev <= 1) { clearInterval(emailCooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ═══ EMAIL OTP ═══
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
        toast({ title: 'OTP Sent ✉️', description: 'Check your email inbox for the 4-digit code.' });
        startCooldown();
      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Failed', description: data.error || 'Could not send email OTP.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Network Error', description: 'Could not reach the server.', variant: 'destructive' });
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 4) {
      toast({ title: 'Enter OTP', description: 'Enter the 4-digit code from your email.', variant: 'destructive' });
      return;
    }
    setEmailOtpStatus('verifying');
    try {
      const res = await apiServerClient.fetch('/verification/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsEmailVerified(true);
        setEmailOtpStatus('idle');
        toast({ title: 'Email Verified ✅', description: 'Your email has been verified.' });
      } else {
        setEmailOtpStatus('error');
        toast({ title: 'Invalid OTP', description: data.error || 'Incorrect code.', variant: 'destructive' });
      }
    } catch {
      setEmailOtpStatus('error');
      toast({ title: 'Error', description: 'Could not verify OTP.', variant: 'destructive' });
    }
  };

  // ═══ FIELD HANDLERS ═══
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp('');
      setEmailOtpStatus('idle');
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  // ── Pay ──
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

  // ── Auth Gate ──
  const handleBuyClick = () => {
    if (!isAuthenticated) {
      saveRedirectPath(window.location.pathname);
      navigate(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      toast({ title: 'Login Required', description: 'Please sign in to purchase this product.' });
      return;
    }
    setShowForm(true);
    if (currentUser?.email) setEmail(currentUser.email);
  };

  const canPay = isEmailVerified && isValidPhone;

  if (!showForm) {
    return (
      <button
        onClick={handleBuyClick}
        aria-label={`Buy ${product.title || 'product'} for ₹${product.price}`}
        className={`flex items-center justify-center gap-2 px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-[0.12em] text-sm rounded-2xl transition-all duration-300 shimmer-btn animate-cta-glow hover:bg-yellow-400 active:scale-[0.98] interactive-hover ${className}`}
      >
        <CreditCard size={16} />
        {`${buttonText} — ₹${product.price}`}
      </button>
    );
  }

  return (
    <form onSubmit={handleCheckout} className={`checkout-card p-5 sm:p-7 ${className}`}>

      {/* Section Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-3)' }}>
          <Lock size={14} className="text-[#FFD700]/70" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold tracking-tight">Secure Checkout</p>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.12em]">₹{product.price} · {product.title}</p>
        </div>
      </div>

      {/* ═══ STEP 1: EMAIL VERIFICATION ═══ */}
      <div className="mb-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white/40" style={{ background: 'var(--surface-3)' }}>1</div>
            Email Verification
          </label>
          {isEmailVerified && <span className="text-green-400/80 text-[9px] font-semibold uppercase tracking-wider">✓ Done</span>}
        </div>

        <AnimatePresence mode="wait">
          {isEmailVerified ? (
            <motion.div key="verified" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="verified-block animate-success-pulse">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <span className="text-green-400/90 text-[13px] font-medium truncate">{email}</span>
            </motion.div>
          ) : (
            <motion.div key="unverified" className="space-y-2.5">
              <div className="flex gap-2 checkout-row">
                <div className="relative flex-1">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
                  <input type="email" placeholder="your@email.com" value={email} onChange={handleEmailChange}
                    aria-label="Email address for verification"
                    className="premium-input" />
                </div>
                <button type="button" onClick={handleSendEmailOtp}
                  disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                  aria-label={emailCooldown > 0 ? `Resend OTP in ${emailCooldown} seconds` : 'Send OTP'}
                  className="px-4 py-3 text-[#FFD700]/90 border border-[#FFD700]/15 rounded-[0.875rem] text-[10px] font-bold tracking-[0.05em] uppercase disabled:opacity-25 hover:border-[#FFD700]/25 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap interactive-hover"
                  style={{ background: 'var(--surface-3)' }}>
                  {emailOtpStatus === 'sending' ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                  {emailCooldown > 0 ? <span className="font-mono tabular-nums">{emailCooldown}s</span> : 'Send'}
                </button>
              </div>

              <AnimatePresence>
                {emailOtpSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="flex gap-2 pt-0.5 otp-row">
                      <input type="text" inputMode="numeric" maxLength={4} placeholder="• • • •"
                        value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                        aria-label="Enter 4-digit OTP code"
                        className="otp-input flex-1" />
                      <button type="button" onClick={handleVerifyEmailOtp}
                        disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                        aria-label="Verify OTP"
                        className="px-5 py-3 bg-[#FFD700] text-black rounded-[0.875rem] text-[10px] font-extrabold tracking-[0.08em] uppercase disabled:opacity-30 hover:bg-yellow-400 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap interactive-hover">
                        {emailOtpStatus === 'verifying' ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                        Verify
                      </button>
                    </div>
                    <p className="text-white/20 text-[10px] mt-1.5 ml-1">Check your inbox — enter the 4-digit code</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ STEP 2: PHONE NUMBER ═══ */}
      <div className="mb-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white/40" style={{ background: 'var(--surface-3)' }}>2</div>
            Phone Number
          </label>
          {isValidPhone && <span className="text-green-400/80 text-[9px] font-semibold uppercase tracking-wider">✓ Valid</span>}
        </div>

        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
          <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
            value={phone} onChange={handlePhoneChange}
            aria-label="10-digit mobile phone number"
            className="premium-input pr-12" />
          {phone.length > 0 && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {isValidPhone ? <CheckCircle2 size={18} className="text-green-400" /> : <XCircle size={18} className="text-white/15" />}
            </div>
          )}
        </div>

        <AnimatePresence>
          {phone.length > 0 && !isValidPhone && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="text-white/25 text-[11px] ml-1 overflow-hidden">
              {10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} needed
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.04] mb-5" />

      {/* ═══ PAY BUTTON ═══ */}
      <AnimatePresence mode="wait">
        {canPay ? (
          <motion.div key="can-pay" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <button type="submit" disabled={isProcessing}
              aria-label={isProcessing ? 'Processing payment' : `Pay ₹${product.price}`}
              className="w-full bg-[#FFD700] text-black py-4 font-bold text-sm uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 disabled:opacity-50 shimmer-btn animate-cta-glow hover:bg-yellow-400 active:scale-[0.98] flex items-center justify-center gap-2">
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /><span>Processing...</span></>
              ) : (
                <><CreditCard size={16} /><span>Pay ₹{product.price}</span></>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-2)' }}>
            <ShieldCheck size={16} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/20 text-[11px] leading-relaxed">
              {!isEmailVerified && !isValidPhone
                ? 'Verify your email and enter phone number to proceed.'
                : !isEmailVerified ? 'Verify your email to continue.'
                  : 'Enter a valid 10-digit phone number.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Badges */}
      <div className="trust-badges mt-5">
        <div className="trust-badge"><Lock size={11} /><span>256-bit SSL</span></div>
        <div className="trust-badge"><ShieldCheck size={11} /><span>100% Secure</span></div>
        <div className="trust-badge"><CreditCard size={11} /><span>Razorpay</span></div>
        <div className="trust-badge"><Zap size={11} /><span>Instant Access</span></div>
      </div>
    </form>
  );
};

export default RazorpayCheckout;
