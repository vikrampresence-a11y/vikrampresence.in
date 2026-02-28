import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

/**
 * DirectCheckoutButton — Full delivery pipeline.
 * 1. Collects buyer's email + phone
 * 2. Opens Razorpay checkout
 * 3. On success → calls /deliver-product API (email + SMS)
 * 4. Navigates to ThankYouPage
 */
const DirectCheckoutButton = ({ productName, pricePaise, driveLink }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    // Load Razorpay script
    useEffect(() => {
        if (window.Razorpay) {
            setRazorpayLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay SDK');
        document.body.appendChild(script);
    }, []);

    // Call delivery API (fire-and-forget)
    // Call Email + SMS delivery via PHP relay (same domain, works on Hostinger)
    const triggerDelivery = async (paymentId) => {
        const results = { emailSent: false, smsSent: false };

        try {
            const res = await fetch('/api/send-email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    phone,
                    productName,
                    driveLink,
                    paymentId,
                }),
            });
            const data = await res.json();
            results.emailSent = data.emailSent || false;
            results.smsSent = data.smsSent || false;
            console.log('Delivery result:', data);
        } catch (err) {
            console.error('Delivery error:', err);
        }

        return results;
    };

    const handleClick = () => {
        if (!razorpayLoaded) {
            alert('Payment system is loading. Please try again.');
            return;
        }

        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address to receive your product.');
            return;
        }

        setIsLoading(true);

        const options = {
            key: 'rzp_live_SKSh64mq33En2x',
            amount: pricePaise,
            currency: 'INR',
            name: 'Vikram Presence',
            description: productName,
            theme: { color: '#FFD700' },
            prefill: {
                email: email,
                contact: phone || undefined,
            },
            handler: async function (response) {
                // Trigger delivery in background
                const deliveryResult = await triggerDelivery(response.razorpay_payment_id);

                // Navigate to Thank You page
                navigate('/thank-you', {
                    state: {
                        productName,
                        googleDriveLink: driveLink,
                        paymentId: response.razorpay_payment_id,
                        buyerEmail: email,
                        buyerPhone: phone,
                        emailSent: deliveryResult.emailSent || false,
                        smsSent: deliveryResult.smsSent || false,
                    },
                });
            },
            modal: {
                ondismiss: function () {
                    setIsLoading(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
            setIsLoading(false);
            alert('Payment failed. Please try again.');
        });
        rzp.open();
    };

    const displayPrice = `₹${(pricePaise / 100).toFixed(0)}`;

    return (
        <div style={{ width: '100%' }}>
            {/* Email + Phone inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                    }} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address *"
                        required
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 40px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.3s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,204,0,0.5)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                    }} />
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number (for SMS)"
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 40px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.3s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,204,0,0.5)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                </div>
            </div>

            {/* Buy Now Button */}
            <button
                onClick={handleClick}
                disabled={isLoading}
                style={{
                    width: '100%',
                    background: '#ffcc00',
                    color: '#000000',
                    padding: '18px 50px',
                    fontWeight: 800,
                    fontSize: '16px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: isLoading ? 'wait' : 'pointer',
                    boxShadow: '0 0 25px rgba(255, 204, 0, 0.8)',
                    transition: 'all 0.3s ease',
                    opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 204, 0, 1)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 204, 0, 0.8)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {isLoading ? 'Processing...' : `Buy Now — ${displayPrice}`}
            </button>
        </div>
    );
};

export default DirectCheckoutButton;
