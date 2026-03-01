import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Loader2, CheckCircle2, XCircle, Send, ShieldCheck, KeyRound, Lock, CreditCard, Zap } from 'lucide-react';

/**
 * DirectCheckoutButton — Premium Checkout Experience
 * Email OTP + Strict 10-digit Phone
 * Pay button gated by: isEmailVerified && phone.length === 10
 */
const DirectCheckoutButton = ({ productName, pricePaise, driveLink }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/hcgi/api';

    // ── Email OTP State ──
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpStatus, setEmailOtpStatus] = useState('idle');
    const [emailCooldown, setEmailCooldown] = useState(0);
    const emailCooldownRef = useRef(null);

    // ── Phone (strict 10-digit, no OTP) ──
    const isValidPhone = phone.length === 10;

    useEffect(() => {
        if (window.Razorpay) { setRazorpayLoaded(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay SDK');
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        return () => { if (emailCooldownRef.current) clearInterval(emailCooldownRef.current); };
    }, []);

    const startCooldown = () => {
        setEmailCooldown(60);
        emailCooldownRef.current = setInterval(() => {
            setEmailCooldown((prev) => { if (prev <= 1) { clearInterval(emailCooldownRef.current); return 0; } return prev - 1; });
        }, 1000);
    };

    // ═══ EMAIL OTP ═══
    const handleSendEmailOtp = async () => {
        if (emailCooldown > 0) return;
        if (!email || !email.includes('@') || email.length < 5) { alert('Enter a valid email address.'); return; }
        setEmailOtpStatus('sending');
        try {
            const res = await fetch(`${API_URL}/verification/send-email-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) { setEmailOtpSent(true); setEmailOtpStatus('sent'); startCooldown(); }
            else { setEmailOtpStatus('error'); alert(data.error || 'Could not send email OTP.'); }
        } catch { setEmailOtpStatus('error'); alert('Could not reach the server.'); }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp || emailOtp.length < 4) { alert('Enter the 4-digit code.'); return; }
        setEmailOtpStatus('verifying');
        try {
            const res = await fetch(`${API_URL}/verification/verify-email-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: emailOtp }),
            });
            const data = await res.json();
            if (data.verified) { setIsEmailVerified(true); setEmailOtpStatus('idle'); }
            else { setEmailOtpStatus('error'); alert(data.error || 'Incorrect code.'); }
        } catch { setEmailOtpStatus('error'); alert('Could not verify OTP.'); }
    };

    // ═══ FIELD HANDLERS ═══
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (isEmailVerified) { setIsEmailVerified(false); setEmailOtpSent(false); setEmailOtp(''); setEmailOtpStatus('idle'); }
    };

    const handlePhoneChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhone(digits);
    };

    // ═══ DELIVERY ═══
    const triggerDelivery = async (paymentId) => {
        try {
            const res = await fetch('/api/send-email.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, productName, driveLink, paymentId }),
            });
            return await res.json();
        } catch (err) { console.error('Delivery error:', err); return {}; }
    };

    // ═══ BUY ═══
    const handleClick = () => {
        if (!razorpayLoaded) { alert('Payment system loading.'); return; }
        if (!isEmailVerified || !isValidPhone) return;
        setIsLoading(true);
        const rzp = new window.Razorpay({
            key: 'rzp_live_SKSh64mq33En2x', amount: pricePaise, currency: 'INR',
            name: 'Vikram Presence', description: productName, theme: { color: '#FFD700' },
            prefill: { email, contact: phone },
            handler: async (response) => {
                const deliveryResult = await triggerDelivery(response.razorpay_payment_id);
                navigate('/thank-you', {
                    state: {
                        productName, googleDriveLink: driveLink, paymentId: response.razorpay_payment_id,
                        buyerEmail: email, buyerPhone: phone, emailSent: deliveryResult.emailSent
                    },
                });
            },
            modal: { ondismiss: () => setIsLoading(false) },
        });
        rzp.on('payment.failed', () => { setIsLoading(false); alert('Payment failed.'); });
        rzp.open();
    };

    const displayPrice = `₹${(pricePaise / 100).toFixed(0)}`;
    const canPay = isEmailVerified && isValidPhone;

    return (
        <div className="w-full">
            {/* ═══════════════════════════════════════
                CHECKOUT CARD — Premium Glassmorphism
                ═══════════════════════════════════════ */}
            <div className="checkout-card p-5 sm:p-7 space-y-5">

                {/* Section Header */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center">
                        <Lock size={14} className="text-[#FFD700]/70" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-semibold tracking-tight">Secure Checkout</p>
                        <p className="text-white/25 text-[10px] uppercase tracking-[0.12em]">Verify to unlock payment</p>
                    </div>
                </div>

                {/* ═══ STEP 1: EMAIL VERIFICATION ═══ */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-[0.12em]" htmlFor="checkout-email">
                            <div className="w-4 h-4 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-[8px] font-bold text-white/40">1</div>
                            Email Verification
                        </label>
                        {isEmailVerified && (
                            <span className="text-green-400/80 text-[9px] font-semibold uppercase tracking-wider">✓ Done</span>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {isEmailVerified ? (
                            <motion.div
                                key="verified"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="verified-block animate-success-pulse"
                            >
                                <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                                <span className="text-green-400/90 text-[13px] font-medium truncate">{email}</span>
                            </motion.div>
                        ) : (
                            <motion.div key="unverified" className="space-y-2.5">
                                {/* Email Input + Send OTP */}
                                <div className="flex gap-2 checkout-row">
                                    <div className="relative flex-1">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            placeholder="your@email.com"
                                            aria-label="Email address for verification"
                                            className="premium-input"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendEmailOtp}
                                        disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                                        aria-label={emailCooldown > 0 ? `Resend OTP in ${emailCooldown} seconds` : 'Send OTP'}
                                        className="px-4 py-3 bg-[var(--surface-3)] text-[#FFD700]/90 border border-[#FFD700]/15 rounded-[0.875rem] text-[10px] font-bold tracking-[0.05em] uppercase disabled:opacity-25 hover:bg-[var(--surface-4)] hover:border-[#FFD700]/25 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap interactive-hover"
                                    >
                                        {emailOtpStatus === 'sending'
                                            ? <Loader2 size={13} className="animate-spin" />
                                            : <Send size={12} />}
                                        {emailCooldown > 0 ? (
                                            <span className="font-mono tabular-nums">{emailCooldown}s</span>
                                        ) : 'Send'}
                                    </button>
                                </div>

                                {/* OTP Input — Banking Style */}
                                <AnimatePresence>
                                    {emailOtpSent && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex gap-2 pt-0.5 checkout-row">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="• • • •"
                                                    value={emailOtp}
                                                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                                    aria-label="Enter 4-digit OTP code"
                                                    className="otp-input flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmailOtp}
                                                    disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                                                    aria-label="Verify OTP"
                                                    className="px-5 py-3 bg-[#FFD700] text-black rounded-[0.875rem] text-[10px] font-extrabold tracking-[0.08em] uppercase disabled:opacity-30 hover:bg-yellow-400 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap interactive-hover"
                                                >
                                                    {emailOtpStatus === 'verifying'
                                                        ? <Loader2 size={13} className="animate-spin" />
                                                        : <KeyRound size={13} />}
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
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-[0.12em]" htmlFor="checkout-phone">
                            <div className="w-4 h-4 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-[8px] font-bold text-white/40">2</div>
                            Phone Number
                        </label>
                        {isValidPhone && (
                            <span className="text-green-400/80 text-[9px] font-semibold uppercase tracking-wider">✓ Valid</span>
                        )}
                    </div>

                    <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15 pointer-events-none" />
                        <input
                            id="checkout-phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChange={handlePhoneChange}
                            aria-label="10-digit mobile phone number"
                            className="premium-input pr-12"
                        />
                        {phone.length > 0 && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                {isValidPhone
                                    ? <CheckCircle2 size={18} className="text-green-400" />
                                    : <XCircle size={18} className="text-white/15" />}
                            </div>
                        )}
                    </div>

                    {/* Validation Feedback — Graceful Height Transition */}
                    <AnimatePresence>
                        {phone.length > 0 && !isValidPhone && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-white/25 text-[11px] ml-1 overflow-hidden"
                            >
                                {10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} needed
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* ═══ DIVIDER ═══ */}
                <div className="border-t border-white/[0.04]" />

                {/* ═══ BUY BUTTON — Revealed with Animation ═══ */}
                <AnimatePresence mode="wait">
                    {canPay ? (
                        <motion.div
                            key="can-pay"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="sm:block sticky-cta"
                        >
                            <button
                                onClick={handleClick}
                                disabled={isLoading}
                                aria-label={isLoading ? 'Processing payment' : `Buy ${productName} for ${displayPrice}`}
                                className="w-full bg-[#FFD700] text-black py-4 font-bold text-sm uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 disabled:opacity-50 shimmer-btn animate-cta-glow hover:bg-yellow-400 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={16} />
                                        <span>Buy Now — {displayPrice}</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl p-4 text-center"
                            style={{ background: 'var(--surface-2)' }}
                        >
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

                {/* ═══ TRUST BADGES — Bank-Grade Security ═══ */}
                <div className="trust-badges">
                    <div className="trust-badge">
                        <Lock size={11} />
                        <span>256-bit SSL</span>
                    </div>
                    <div className="trust-badge">
                        <ShieldCheck size={11} />
                        <span>100% Secure</span>
                    </div>
                    <div className="trust-badge">
                        <CreditCard size={11} />
                        <span>Razorpay</span>
                    </div>
                    <div className="trust-badge">
                        <Zap size={11} />
                        <span>Instant Access</span>
                    </div>
                </div>

            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default DirectCheckoutButton;
