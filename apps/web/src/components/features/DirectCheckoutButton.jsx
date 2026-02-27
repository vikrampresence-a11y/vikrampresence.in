import React, { useState, useEffect } from 'react';

/**
 * DirectCheckoutButton — Zero-auth Razorpay pipeline.
 * Opens Razorpay checkout, on success redirects directly to the Google Drive link.
 *
 * Props:
 *   productName  — Name shown in Razorpay modal
 *   pricePaise   — Price in paise (e.g. 49900 for ₹499)
 *   driveLink    — Google Drive link to redirect to after payment
 */
const DirectCheckoutButton = ({ productName, pricePaise, driveLink }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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

    const handleClick = () => {
        if (!razorpayLoaded) {
            alert('Payment system is loading. Please try again.');
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
            handler: function () {
                // THE ONLY FULFILLMENT LOGIC: Redirect to drive link
                window.location.href = driveLink;
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
        <button
            onClick={handleClick}
            disabled={isLoading}
            style={{
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
    );
};

export default DirectCheckoutButton;
