import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Loader2, CheckCircle2, XCircle, Send, ShieldCheck, KeyRound } from 'lucide-react';

/**
 * DirectCheckoutButton — Email OTP + Strict 10-digit Phone
 * No Firebase. No SMS OTP.
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
        <div className="w-full space-y-4">
            {/* ═══ EMAIL SECTION ═══ */}
            <div>
                <label className="flex items-center gap-1.5 text-[#FFD700]/70 text-[10px] font-semibold uppercase tracking-[0.12em] mb-2">
                    <Mail size={10} /> Email Verification
                </label>
                {isEmailVerified ? (
                    <div className="flex items-center gap-2 bg-green-500/[0.06] border border-green-500/20 rounded-xl px-4 py-3">
                        <CheckCircle2 size={14} className="text-green-400" />
                        <span className="text-green-400 text-[13px] font-medium">{email} — Verified</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                <input type="email" value={email} onChange={handleEmailChange}
                                    placeholder="Your email address"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-white text-[13px] font-light outline-none focus:border-[#FFD700]/40 transition-all duration-300 placeholder:text-white/20" />
                            </div>
                            <button type="button" onClick={handleSendEmailOtp}
                                disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                                className="px-4 py-3.5 bg-[#FFD700]/[0.08] text-[#FFD700] border border-[#FFD700]/20 rounded-xl text-[10px] font-bold tracking-[0.05em] uppercase disabled:opacity-30 transition-all duration-300 hover:bg-[#FFD700]/15 flex items-center gap-1.5 whitespace-nowrap">
                                {emailOtpStatus === 'sending' ? <Loader2 size={11} className="animate-spin" /> : <Send size={10} />}
                                {emailCooldown > 0 ? `${emailCooldown}s` : 'OTP'}
                            </button>
                        </div>
                        {emailOtpSent && (
                            <div className="flex gap-2">
                                <input type="text" inputMode="numeric" maxLength={4} placeholder="4-digit code"
                                    value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 bg-white/[0.03] border border-[#FFD700]/20 rounded-xl px-4 py-3.5 text-white text-center text-lg tracking-[0.3em] font-medium outline-none focus:border-[#FFD700]/40 transition-all duration-300 placeholder:text-white/15 placeholder:text-sm placeholder:tracking-normal" />
                                <button type="button" onClick={handleVerifyEmailOtp}
                                    disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                                    className="px-5 py-3.5 bg-[#FFD700] text-black rounded-xl text-[10px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-40 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap">
                                    {emailOtpStatus === 'verifying' ? <Loader2 size={11} className="animate-spin" /> : <KeyRound size={11} />}
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══ PHONE NUMBER ═══ */}
            <div>
                <label className="flex items-center gap-1.5 text-[#FFD700]/70 text-[10px] font-semibold uppercase tracking-[0.12em] mb-2">
                    <Phone size={10} /> Phone Number
                </label>
                <div className="relative">
                    <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                    <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3.5 text-white text-[13px] font-light outline-none focus:border-[#FFD700]/40 transition-all duration-300 placeholder:text-white/20"
                    />
                    {phone.length > 0 && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {isValidPhone
                                ? <CheckCircle2 size={16} className="text-green-400" />
                                : <XCircle size={16} className="text-red-400/60" />}
                        </div>
                    )}
                </div>
                {phone.length > 0 && !isValidPhone && (
                    <p className="text-red-400/60 text-[11px] mt-1.5 ml-1">
                        Enter exactly 10 digits ({10 - phone.length} more needed)
                    </p>
                )}
                {isValidPhone && (
                    <p className="text-green-400/60 text-[11px] mt-1.5 ml-1">
                        ✅ Valid phone number
                    </p>
                )}
            </div>

            {/* ═══ BUY BUTTON ═══ */}
            {canPay ? (
                <button onClick={handleClick} disabled={isLoading}
                    className="w-full bg-[#FFD700] text-black py-4 font-bold text-sm uppercase tracking-[0.15em] rounded-full transition-all duration-300 disabled:opacity-60 shimmer-btn animate-pulse-gold hover:bg-yellow-400"
                >
                    {isLoading ? 'Processing...' : `Buy Now — ${displayPrice}`}
                </button>
            ) : (
                <div className="glass-card rounded-xl p-4 text-center">
                    <ShieldCheck size={14} className="text-[#FFD700]/40 mx-auto mb-2" />
                    <p className="text-white/25 text-[11px]">
                        {!isEmailVerified && !isValidPhone
                            ? 'Verify your email and enter a valid phone number to unlock payment.'
                            : !isEmailVerified ? 'Verify your email to continue.'
                                : 'Enter a valid 10-digit phone number to continue.'}
                    </p>
                </div>
            )}

            {/* Razorpay Trust Microcopy */}
            {canPay && (
                <p className="text-center text-white/15 text-[9px] uppercase tracking-[0.1em]">
                    Powered by Razorpay · 256-bit SSL Encrypted
                </p>
            )}
        </div>
    );
};

export default DirectCheckoutButton;
