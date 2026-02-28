import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Loader2, CheckCircle2, Send, ShieldCheck, KeyRound } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/**
 * DirectCheckoutButton — Full delivery pipeline with strict OTP verification.
 * Email OTP (4-digit via Nodemailer) + Phone OTP (6-digit via Firebase Auth).
 * Pay button is HIDDEN until both are verified. No regex fallbacks.
 */
const DirectCheckoutButton = ({ productName, pricePaise, driveLink }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    // API base URL
    const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/hcgi/api';

    // ── Email OTP State ──
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpStatus, setEmailOtpStatus] = useState('idle');
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

    // Load Razorpay
    useEffect(() => {
        if (window.Razorpay) { setRazorpayLoaded(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay SDK');
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        return () => {
            if (emailCooldownRef.current) clearInterval(emailCooldownRef.current);
            if (phoneCooldownRef.current) clearInterval(phoneCooldownRef.current);
        };
    }, []);

    const startCooldown = (setter, ref) => {
        setter(60);
        ref.current = setInterval(() => {
            setter((prev) => { if (prev <= 1) { clearInterval(ref.current); return 0; } return prev - 1; });
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
            if (data.success) {
                setEmailOtpSent(true); setEmailOtpStatus('sent');
                startCooldown(setEmailCooldown, emailCooldownRef);
            } else { setEmailOtpStatus('error'); alert(data.error || 'Could not send email OTP.'); }
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

    // ═══ PHONE OTP (Firebase) ═══
    const setupRecaptcha = () => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-direct', {
                size: 'invisible', callback: () => { },
            });
        }
        return recaptchaRef.current;
    };

    const handleSendPhoneOtp = async () => {
        if (phoneCooldown > 0) return;
        let formattedPhone = phone.replace(/[\s\-]/g, '');
        if (!formattedPhone.startsWith('+')) formattedPhone = '+91' + formattedPhone.replace(/^91/, '');
        const digits = formattedPhone.replace(/\+91/, '');
        if (!/^[6-9]\d{9}$/.test(digits)) { alert('Enter a valid 10-digit Indian mobile number.'); return; }

        setPhoneOtpStatus('sending');
        try {
            const appVerifier = setupRecaptcha();
            const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(result); setPhoneOtpSent(true); setPhoneOtpStatus('sent');
            startCooldown(setPhoneCooldown, phoneCooldownRef);
        } catch (err) {
            setPhoneOtpStatus('error');
            if (recaptchaRef.current) { recaptchaRef.current.clear(); recaptchaRef.current = null; }
            alert(err.code === 'auth/too-many-requests' ? 'Too many attempts. Try later.' : 'Could not send OTP.');
        }
    };

    const handleVerifyPhoneOtp = async () => {
        if (!phoneOtp || phoneOtp.length < 6 || !confirmationResult) return;
        setPhoneOtpStatus('verifying');
        try {
            await confirmationResult.confirm(phoneOtp);
            setIsPhoneVerified(true); setPhoneOtpStatus('idle');
        } catch (err) {
            setPhoneOtpStatus('error');
            alert(err.code === 'auth/invalid-verification-code' ? 'Invalid code.' : 'Verification failed.');
        }
    };

    // ═══ FIELD CHANGE HANDLERS ═══
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (isEmailVerified) { setIsEmailVerified(false); setEmailOtpSent(false); setEmailOtp(''); setEmailOtpStatus('idle'); }
    };
    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
        if (isPhoneVerified) { setIsPhoneVerified(false); setPhoneOtpSent(false); setPhoneOtp(''); setPhoneOtpStatus('idle'); setConfirmationResult(null); }
    };

    // ═══ DELIVERY ═══
    const triggerDelivery = async (paymentId) => {
        const results = { emailSent: false };
        try {
            const res = await fetch('/api/send-email.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, productName, driveLink, paymentId }),
            });
            const data = await res.json();
            results.emailSent = data.emailSent || false;
        } catch (err) { console.error('Delivery error:', err); }
        return results;
    };

    // ═══ BUY ═══
    const handleClick = () => {
        if (!razorpayLoaded) { alert('Payment system loading.'); return; }
        if (!isEmailVerified || !isPhoneVerified) return;
        setIsLoading(true);

        const rzp = new window.Razorpay({
            key: 'rzp_live_SKSh64mq33En2x', amount: pricePaise, currency: 'INR',
            name: 'Vikram Presence', description: productName, theme: { color: '#FFD700' },
            prefill: { email, contact: phone || undefined },
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
    const bothVerified = isEmailVerified && isPhoneVerified;

    // ── Inline Styles ──
    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 40px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', color: '#fff', fontSize: '13px', outline: 'none',
        transition: 'border-color 0.3s', boxSizing: 'border-box',
    };
    const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' };
    const sendBtnStyle = (disabled) => ({
        padding: '14px 14px', background: 'rgba(255,204,0,0.15)', color: '#FFD700',
        border: '1px solid rgba(255,204,0,0.3)', borderRadius: '12px', fontSize: '11px',
        fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.3s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px',
    });
    const verifyBtnStyle = (disabled) => ({
        padding: '14px 18px', background: '#FFD700', color: '#000', border: 'none',
        borderRadius: '12px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em',
        textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.3s', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: '5px',
    });
    const otpInputStyle = {
        ...inputStyle, paddingLeft: '14px', textAlign: 'center', fontSize: '18px',
        letterSpacing: '0.35em', borderColor: 'rgba(255,204,0,0.3)',
    };
    const verifiedStyle = {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
        borderRadius: '12px', padding: '12px 16px',
    };
    const labelStyle = {
        color: '#FFD700', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.15em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px',
    };

    return (
        <div style={{ width: '100%' }}>
            {/* ═══ EMAIL SECTION ═══ */}
            <div style={{ marginBottom: '16px' }}>
                <div style={labelStyle}><Mail size={11} /> Email Verification</div>
                {isEmailVerified ? (
                    <div style={verifiedStyle}>
                        <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
                        <span style={{ color: '#4ADE80', fontSize: '13px', fontWeight: 500 }}>{email} — Verified</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Mail size={14} style={iconStyle} />
                                <input type="email" value={email} onChange={handleEmailChange}
                                    placeholder="Your email address" style={inputStyle}
                                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255,204,0,0.5)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                            </div>
                            <button type="button" onClick={handleSendEmailOtp}
                                disabled={emailCooldown > 0 || emailOtpStatus === 'sending' || !email}
                                style={sendBtnStyle(emailCooldown > 0 || emailOtpStatus === 'sending' || !email)}>
                                {emailOtpStatus === 'sending' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={11} />}
                                {emailCooldown > 0 ? `${emailCooldown}s` : 'OTP'}
                            </button>
                        </div>
                        {emailOtpSent && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" inputMode="numeric" maxLength={4} placeholder="4-digit code"
                                    value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                    style={otpInputStyle} />
                                <button type="button" onClick={handleVerifyEmailOtp}
                                    disabled={emailOtpStatus === 'verifying' || emailOtp.length < 4}
                                    style={verifyBtnStyle(emailOtpStatus === 'verifying' || emailOtp.length < 4)}>
                                    {emailOtpStatus === 'verifying' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <KeyRound size={12} />}
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══ PHONE SECTION ═══ */}
            <div style={{ marginBottom: '16px' }}>
                <div style={labelStyle}><Phone size={11} /> Phone Verification</div>
                {isPhoneVerified ? (
                    <div style={verifiedStyle}>
                        <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
                        <span style={{ color: '#4ADE80', fontSize: '13px', fontWeight: 500 }}>{phone} — Verified</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Phone size={14} style={iconStyle} />
                                <input type="tel" value={phone} onChange={handlePhoneChange}
                                    placeholder="Phone (e.g. 9876543210)" style={inputStyle}
                                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255,204,0,0.5)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                            </div>
                            <button type="button" onClick={handleSendPhoneOtp}
                                disabled={phoneCooldown > 0 || phoneOtpStatus === 'sending' || !phone}
                                style={sendBtnStyle(phoneCooldown > 0 || phoneOtpStatus === 'sending' || !phone)}>
                                {phoneOtpStatus === 'sending' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={11} />}
                                {phoneCooldown > 0 ? `${phoneCooldown}s` : 'OTP'}
                            </button>
                        </div>
                        {phoneOtpSent && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" inputMode="numeric" maxLength={6} placeholder="6-digit code"
                                    value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                                    style={otpInputStyle} />
                                <button type="button" onClick={handleVerifyPhoneOtp}
                                    disabled={phoneOtpStatus === 'verifying' || phoneOtp.length < 6}
                                    style={verifyBtnStyle(phoneOtpStatus === 'verifying' || phoneOtp.length < 6)}>
                                    {phoneOtpStatus === 'verifying' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <KeyRound size={12} />}
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Invisible Recaptcha */}
            <div id="recaptcha-container-direct"></div>

            {/* ═══ BUY BUTTON — HIDDEN until both verified ═══ */}
            {bothVerified ? (
                <button onClick={handleClick} disabled={isLoading}
                    style={{
                        width: '100%', background: '#ffcc00', color: '#000', padding: '18px 50px',
                        fontWeight: 800, fontSize: '16px', letterSpacing: '0.15em', textTransform: 'uppercase',
                        borderRadius: '50px', border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                        boxShadow: '0 0 25px rgba(255,204,0,0.8)', transition: 'all 0.3s',
                        opacity: isLoading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.boxShadow = '0 0 50px rgba(255,204,0,1)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 25px rgba(255,204,0,0.8)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    {isLoading ? 'Processing...' : `Buy Now — ${displayPrice}`}
                </button>
            ) : (
                <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '16px',
                    textAlign: 'center',
                }}>
                    <ShieldCheck size={16} style={{ color: '#FFD700', margin: '0 auto 8px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                        {!isEmailVerified && !isPhoneVerified
                            ? 'Verify your email and phone to unlock payment.'
                            : !isEmailVerified ? 'Verify your email to continue.'
                                : 'Verify your phone to continue.'}
                    </p>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default DirectCheckoutButton;
