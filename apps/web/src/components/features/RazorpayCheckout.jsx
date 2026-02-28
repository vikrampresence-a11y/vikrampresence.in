
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Mail, Phone, CheckCircle2, Send, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';
import apiServerClient from '@/lib/apiServerClient';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const RazorpayCheckout = ({ product, className = '', buttonText = 'Buy Now' }) => {
  const { processPayment, isProcessing } = usePayment();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Form Fields ──
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  // ── Email OTP State ──
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpStatus, setEmailOtpStatus] = useState('idle'); // idle | sending | sent | verifying | error
  const [emailCooldown, setEmailCooldown] = useState(0);
  const emailCooldownRef = useRef(null);

  // ── Phone OTP State (Firebase) ──
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpStatus, setPhoneOtpStatus] = useState('idle');
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const phoneCooldownRef = useRef(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaRef = useRef(null);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (emailCooldownRef.current) clearInterval(emailCooldownRef.current);
      if (phoneCooldownRef.current) clearInterval(phoneCooldownRef.current);
    };
  }, []);

  // ── Start 60s Cooldown Helper ──
  const startCooldown = (setter, ref) => {
    setter(60);
    ref.current = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ═══════════════════════════════════════════════
  // EMAIL OTP — Send via Backend (Nodemailer)
  // ═══════════════════════════════════════════════
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
        startCooldown(setEmailCooldown, emailCooldownRef);
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

  // ═══════════════════════════════════════════════
  // PHONE OTP — Firebase Phone Authentication
  // ═══════════════════════════════════════════════
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => { },
      });
    }
    return recaptchaRef.current;
  };

  const handleSendPhoneOtp = async () => {
    if (phoneCooldown > 0) return;

    let formattedPhone = phone.replace(/[\s\-]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^91/, '');
    }

    const digits = formattedPhone.replace(/\+91/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      toast({ title: 'Invalid Phone', description: 'Enter a valid 10-digit Indian mobile number.', variant: 'destructive' });
      return;
    }

    setPhoneOtpStatus('sending');
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setPhoneOtpSent(true);
      setPhoneOtpStatus('sent');
      toast({ title: 'OTP Sent 📱', description: 'Check your phone for the 6-digit code.' });
      startCooldown(setPhoneCooldown, phoneCooldownRef);
    } catch (err) {
      setPhoneOtpStatus('error');
      console.error('Firebase Phone Auth error:', err);
      // Reset recaptcha on error
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      const msg = err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err.code === 'auth/invalid-phone-number'
          ? 'Invalid phone number format.'
          : 'Could not send OTP. Please try again.';
      toast({ title: 'SMS Failed', description: msg, variant: 'destructive' });
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 6) {
      toast({ title: 'Enter OTP', description: 'Enter the 6-digit code from SMS.', variant: 'destructive' });
      return;
    }

    if (!confirmationResult) {
      toast({ title: 'Error', description: 'Please send OTP first.', variant: 'destructive' });
      return;
    }

    setPhoneOtpStatus('verifying');
    try {
      await confirmationResult.confirm(phoneOtp);
      setIsPhoneVerified(true);
      setPhoneOtpStatus('idle');
      toast({ title: 'Phone Verified ✅', description: 'Your phone number has been verified.' });
    } catch (err) {
      setPhoneOtpStatus('error');
      const msg = err.code === 'auth/invalid-verification-code'
        ? 'Invalid verification code. Please try again.'
        : err.code === 'auth/code-expired'
          ? 'Code expired. Please request a new one.'
          : 'Verification failed. Please try again.';
      toast({ title: 'Invalid OTP', description: msg, variant: 'destructive' });
    }
  };

  // ═══════════════════════════════════════════════
  // FIELD CHANGE HANDLERS (reset on edit)
  // ═══════════════════════════════════════════════
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
    setPhone(e.target.value);
    if (isPhoneVerified) {
      setIsPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp('');
      setPhoneOtpStatus('idle');
      setConfirmationResult(null);
    }
  };

  // ── Handle Pay ──
  const handleCheckout = (e) => {
    e.preventDefault();
    if (!isEmailVerified || !isPhoneVerified) return;

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

  const bothVerified = isEmailVerified && isPhoneVerified;

  // ── Pre-form: Buy Button ──
  if (!showForm) {
    return (
      <button
        onClick={handleBuyClick}
        className={`flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-full hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] ${className}`}
      >
        {`${buttonText} - ₹${product.price}`}
      </button>
    );
  }

  // ── Main Form ──
  return (
    <form onSubmit={handleCheckout} className={`bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 shadow-xl ${className}`}>
      <h3 className="text-white font-bold mb-2 text-lg">Verify & Pay</h3>
      <p className="text-gray-400 text-sm mb-6">Complete both verifications to unlock payment.</p>

      {/* ═══ EMAIL SECTION ═══ */}
      <div className="mb-5">
        <label className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2 block">
          <Mail size={12} className="inline mr-1.5" />Email Verification
        </label>

        {isEmailVerified ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">{email} — Verified</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                className="px-4 py-3 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FFD700]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {emailOtpStatus === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={12} />}
                {emailCooldown > 0 ? `${emailCooldown}s` : 'Send OTP'}
              </button>
            </div>

            {emailOtpSent && (
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-black border border-[#FFD700]/30 rounded-xl py-3 px-4 text-white text-center text-lg tracking-[0.4em] placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmailOtp}
                  disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                  className="px-5 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {emailOtpStatus === 'verifying' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound size={14} />}
                  Verify
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ PHONE SECTION ═══ */}
      <div className="mb-6">
        <label className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2 block">
          <Phone size={12} className="inline mr-1.5" />Phone Verification
        </label>

        {isPhoneVerified ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">{phone} — Verified</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="tel"
                  placeholder="Phone (e.g. 9876543210)"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={phoneCooldown > 0 || phoneOtpStatus === 'sending' || !phone}
                className="px-4 py-3 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FFD700]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {phoneOtpStatus === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={12} />}
                {phoneCooldown > 0 ? `${phoneCooldown}s` : 'Send OTP'}
              </button>
            </div>

            {phoneOtpSent && (
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-black border border-[#FFD700]/30 rounded-xl py-3 px-4 text-white text-center text-lg tracking-[0.3em] placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerifyPhoneOtp}
                  disabled={phoneOtpStatus === 'verifying' || phoneOtp.length < 6}
                  className="px-5 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {phoneOtpStatus === 'verifying' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound size={14} />}
                  Verify
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ INVISIBLE RECAPTCHA CONTAINER ═══ */}
      <div id="recaptcha-container"></div>

      {/* ═══ PAY BUTTON — HIDDEN until both verified ═══ */}
      {bothVerified ? (
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] disabled:opacity-70"
        >
          {isProcessing ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
          ) : (
            `Pay ₹${product.price}`
          )}
        </button>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <ShieldCheck size={18} className="text-[#FFD700] mx-auto mb-2" />
          <p className="text-gray-400 text-xs">
            {!isEmailVerified && !isPhoneVerified
              ? 'Verify your email and phone number to unlock payment.'
              : !isEmailVerified
                ? 'Verify your email address to continue.'
                : 'Verify your phone number to continue.'}
          </p>
        </div>
      )}
    </form>
  );
};

export default RazorpayCheckout;
