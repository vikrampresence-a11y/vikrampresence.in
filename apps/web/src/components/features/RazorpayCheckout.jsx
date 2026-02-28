
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Mail, Phone, CheckCircle2, XCircle, Send, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';
import apiServerClient from '@/lib/apiServerClient';

const RazorpayCheckout = ({ product, className = '', buttonText = 'Buy Now' }) => {
  const { processPayment, isProcessing } = usePayment();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Form Fields ──
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  // ── Email Verification State ──
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | checking | valid | invalid
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const emailDebounceRef = useRef(null);

  // ── Phone OTP Verification State ──
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('idle'); // idle | sending | sent | verifying | error
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ── Email Verification (MX Check via Backend) ──
  const verifyEmailDomain = useCallback(async (emailValue) => {
    if (!emailValue || !emailValue.includes('@') || emailValue.length < 5) {
      setEmailStatus('idle');
      setIsEmailVerified(false);
      return;
    }

    setEmailStatus('checking');
    try {
      const res = await apiServerClient.fetch('/verification/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();

      if (data.valid) {
        setEmailStatus('valid');
        setIsEmailVerified(true);
      } else {
        setEmailStatus('invalid');
        setIsEmailVerified(false);
      }
    } catch {
      setEmailStatus('invalid');
      setIsEmailVerified(false);
    }
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Reset verification when user edits
    setIsEmailVerified(false);
    setEmailStatus('idle');

    // Debounce the MX check (800ms after stop typing)
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    emailDebounceRef.current = setTimeout(() => {
      verifyEmailDomain(value);
    }, 800);
  };

  // ── Phone Change Handler (resets verification) ──
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    // Reset phone verification when user edits
    if (isPhoneVerified) {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setOtp('');
      setOtpStatus('idle');
    }
  };

  // ── Send OTP ──
  const handleSendOtp = async () => {
    if (otpCooldown > 0) return;

    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast({
        title: 'Invalid Phone',
        description: 'Enter a valid 10-digit Indian mobile number (starting with 6-9).',
        variant: 'destructive',
      });
      return;
    }

    setOtpStatus('sending');
    try {
      const res = await apiServerClient.fetch('/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setOtpStatus('sent');
        toast({ title: 'OTP Sent', description: 'Check your phone for the verification code.' });

        // Start 60-second cooldown
        setOtpCooldown(60);
        cooldownRef.current = setInterval(() => {
          setOtpCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpStatus('error');
        toast({
          title: 'SMS Failed',
          description: data.error || 'Could not send OTP. Try again.',
          variant: 'destructive',
        });
      }
    } catch {
      setOtpStatus('error');
      toast({
        title: 'Network Error',
        description: 'Could not reach the server. Check your connection.',
        variant: 'destructive',
      });
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast({ title: 'Enter OTP', description: 'Please enter the full OTP.', variant: 'destructive' });
      return;
    }

    setOtpStatus('verifying');
    try {
      const res = await apiServerClient.fetch('/verification/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.verified) {
        setIsPhoneVerified(true);
        setOtpStatus('idle');
        toast({ title: 'Phone Verified ✅', description: 'Your phone number has been verified.' });
      } else {
        setOtpStatus('error');
        toast({
          title: 'Invalid OTP',
          description: data.error || 'The OTP you entered is incorrect.',
          variant: 'destructive',
        });
      }
    } catch {
      setOtpStatus('error');
      toast({ title: 'Verification Failed', description: 'Could not verify OTP.', variant: 'destructive' });
    }
  };

  // ── Handle Pay ──
  const handleCheckout = (e) => {
    e.preventDefault();

    if (!isEmailVerified || !isPhoneVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please verify both your email and phone number before paying.',
        variant: 'destructive',
      });
      return;
    }

    const customerDetails = {
      name: currentUser?.name || 'Guest User',
      email: email,
      phone: phone,
    };

    processPayment(product, customerDetails, (data) => {
      navigate('/thank-you', {
        state: {
          productName: data.productName,
          googleDriveLink: data.googleDriveLink,
        },
      });
    });
  };

  // ── Handle Buy Click (Auth Gate) ──
  const handleBuyClick = () => {
    if (!isAuthenticated) {
      saveRedirectPath(window.location.pathname);
      navigate(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      toast({ title: 'Login Required', description: 'Please sign in to purchase this product.' });
      return;
    }
    setShowForm(true);
    if (currentUser?.email) {
      setEmail(currentUser.email);
      // Auto-verify the pre-filled email
      verifyEmailDomain(currentUser.email);
    }
  };

  // ── Email Status Indicator ──
  const EmailIndicator = () => {
    if (emailStatus === 'checking') return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
    if (emailStatus === 'valid') return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    if (emailStatus === 'invalid') return <XCircle className="h-4 w-4 text-red-400" />;
    return null;
  };

  const isPayDisabled = isProcessing || !isEmailVerified || !isPhoneVerified;

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
      <h3 className="text-white font-bold mb-2 text-lg">Contact Details</h3>
      <p className="text-gray-400 text-sm mb-6">Verify your email and phone to unlock payment.</p>

      <div className="space-y-4 mb-6">
        {/* ── Email Field + Verification Indicator ── */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <EmailIndicator />
            </div>
          </div>
          {emailStatus === 'invalid' && (
            <p className="text-red-400 text-xs mt-1 ml-1">This email domain does not appear to be valid.</p>
          )}
          {emailStatus === 'valid' && (
            <p className="text-green-400 text-xs mt-1 ml-1">✅ Email verified</p>
          )}
        </div>

        {/* ── Phone Field + Send OTP Button ── */}
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="tel"
                placeholder="Phone Number (e.g. 9876543210)"
                value={phone}
                onChange={handlePhoneChange}
                required
                disabled={isPhoneVerified}
                className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors disabled:opacity-50"
              />
              {isPhoneVerified && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              )}
            </div>
            {!isPhoneVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpCooldown > 0 || otpStatus === 'sending' || !phone}
                className="px-4 py-3 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#FFD700]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {otpStatus === 'sending' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {otpCooldown > 0 ? `${otpCooldown}s` : 'Send OTP'}
              </button>
            )}
          </div>
          {isPhoneVerified && (
            <p className="text-green-400 text-xs mt-1 ml-1">✅ Phone verified</p>
          )}
        </div>

        {/* ── OTP Input (appears after Send OTP) ── */}
        {otpSent && !isPhoneVerified && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-black border border-[#FFD700]/30 rounded-xl py-3 px-4 text-white text-center text-lg tracking-[0.3em] placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpStatus === 'verifying' || otp.length < 4}
              className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {otpStatus === 'verifying' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Verify
            </button>
          </div>
        )}
      </div>

      {/* ── Verification Status Summary ── */}
      {(!isEmailVerified || !isPhoneVerified) && (
        <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs text-gray-400 flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#FFD700] shrink-0" />
          <span>
            {!isEmailVerified && !isPhoneVerified
              ? 'Verify your email and phone number to unlock payment.'
              : !isEmailVerified
                ? 'Verify your email address to continue.'
                : 'Verify your phone number to continue.'}
          </span>
        </div>
      )}

      {/* ── Pay Button (disabled until verified) ── */}
      <button
        type="submit"
        disabled={isPayDisabled}
        className={`w-full flex items-center justify-center px-8 py-4 font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${isPayDisabled
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-[#FFD700] text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
          }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${product.price}`
        )}
      </button>
    </form>
  );
};

export default RazorpayCheckout;
