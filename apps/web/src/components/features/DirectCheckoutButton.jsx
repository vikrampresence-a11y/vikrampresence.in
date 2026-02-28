import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DirectCheckoutButton — Zero-auth Razorpay pipeline.
 * Opens Razorpay checkout, collects buyer's email,
 * sends product link via email, then redirects to Thank You page.
 *
 * Props:
 *   productName  — Name shown in Razorpay modal
 *   pricePaise   — Price in paise (e.g. 49900 for ₹499)
 *   driveLink    — Google Drive link to deliver after payment
 */
const DirectCheckoutButton = ({ productName, pricePaise, driveLink }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
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

    // Send email with product link (fire-and-forget)
    const sendProductEmail = async (buyerEmail) => {
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${apiBase}/api/email/send-product-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerEmail,
                    productName,
                    googleDriveLink: driveLink,
                }),
            });
            console.log('Product email sent to:', buyerEmail);
        } catch (err) {
            console.error('Failed to send product email:', err);
            // Non-blocking — user still gets the link on the Thank You page
        }
    };

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
            prefill: {
                // Razorpay will ask for email on the checkout modal
            },
            handler: function (response) {
                // Extract buyer's email from Razorpay response
                // Razorpay doesn't return email in handler, but we can get it from the checkout form
                // We'll use a workaround: store email from prefill or collect via modal

                // Send email in background (fire-and-forget)
                // Razorpay provides the email via the payment entity
                // For now, we trigger the email via the Thank You page

                // Navigate to Thank You page with product details
                navigate('/thank-you', {
                    state: {
                        productName,
                        googleDriveLink: driveLink,
                        paymentId: response.razorpay_payment_id,
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
