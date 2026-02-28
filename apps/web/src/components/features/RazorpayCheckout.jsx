
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Mail, Phone, CheckCircle2, XCircle, Send, ShieldCheck, KeyRound } from 'lucide-react';
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
    // Strictly numeric only, max 10 digits
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
        className={`flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-full hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] ${className}`}
      >
        {`${buttonText} - ₹${product.price}`}
      </button>
    );
  }

  return (
    <form onSubmit={handleCheckout} className={`bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 shadow-xl ${className}`}>
      <h3 className="text-white font-bold mb-2 text-lg">Verify & Pay</h3>
      <p className="text-gray-400 text-sm mb-6">Verify your email and enter your phone number to proceed.</p>

      {/* ═══ EMAIL VERIFICATION ═══ */}
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
                <input type="email" placeholder="Enter your email" value={email} onChange={handleEmailChange}
                  className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors text-sm" />
              </div>
              <button type="button" onClick={handleSendEmailOtp}
                disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                className="px-4 py-3 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FFD700]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5">
                {emailOtpStatus === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={12} />}
                {emailCooldown > 0 ? `${emailCooldown}s` : 'Send OTP'}
              </button>
            </div>
            {emailOtpSent && (
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit code"
                  value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-black border border-[#FFD700]/30 rounded-xl py-3 px-4 text-white text-center text-lg tracking-[0.4em] placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-[#FFD700] transition-colors" />
                <button type="button" onClick={handleVerifyEmailOtp}
                  disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                  className="px-5 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                  {emailOtpStatus === 'verifying' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound size={14} />}
                  Verify
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ PHONE NUMBER (Strict 10-digit, no OTP) ═══ */}
      <div className="mb-6">
        <label className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2 block">
          <Phone size={12} className="inline mr-1.5" />Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors text-sm"
          />
          {/* Real-time ✅/❌ indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {phone.length > 0 && (
              isValidPhone
                ? <CheckCircle2 size={18} className="text-green-400" />
                : <XCircle size={18} className="text-red-400" />
            )}
          </div>
        </div>
        {phone.length > 0 && !isValidPhone && (
          <p className="text-red-400 text-xs mt-1.5 ml-1">Enter exactly 10 digits ({10 - phone.length} more needed)</p>
        )}
        {isValidPhone && (
          <p className="text-green-400 text-xs mt-1.5 ml-1">✅ Valid phone number</p>
        )}
      </div>

      {/* ═══ PAY BUTTON ═══ */}
      {canPay ? (
        <button type="submit" disabled={isProcessing}
          className="w-full flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] disabled:opacity-70">
          {isProcessing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : `Pay ₹${product.price}`}
        </button>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <ShieldCheck size={18} className="text-[#FFD700] mx-auto mb-2" />
          <p className="text-gray-400 text-xs">
            {!isEmailVerified && !isValidPhone
              ? 'Verify your email and enter a valid phone number to unlock payment.'
              : !isEmailVerified
                ? 'Verify your email to continue.'
                : 'Enter a valid 10-digit phone number to continue.'}
          </p>
        </div>
      )}
    </form>
  );
};

export default RazorpayCheckout;
