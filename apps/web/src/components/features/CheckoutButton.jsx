/**
 * ===================================================================
 * <CheckoutButton /> — Secure Purchase Button with Razorpay Integration
 * ===================================================================
 * 
 * Flow:
 * 1. User clicks "Buy Now"
 * 2. If NOT authenticated → save current URL → redirect to /login
 * 3. If authenticated → call backend /razorpay/create-order
 * 4. Backend verifies price from DB, creates PENDING purchase, returns orderId
 * 5. Load Razorpay checkout script dynamically
 * 6. Open Razorpay payment modal (dark theme, brand colors)
 * 7. On success → call /payment/verify-payment → fulfillment
 * 8. On failure → show error toast
 * 
 * Props:
 *   - productId (string) — PocketBase product ID
 *   - price (number) — Display price in INR (verified server-side)
 *   - productTitle (string) — Product name for display
 *   - googleDriveLink (string) — Hidden Drive link (passed for fulfillment)
 *   - buttonText (string) — Custom button text (default: "Buy Now")
 *   - className (string) — Additional CSS classes
 * 
 * ===================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';
import apiServerClient from '@/lib/apiServerClient';

const CheckoutButton = ({
    productId,
    price,
    productTitle = '',
    googleDriveLink = '',
    buttonText = 'Buy Now',
    className = '',
}) => {
    const { isAuthenticated, currentUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // ── Dynamic Razorpay Script Loader ──
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // ── Main Click Handler ──
    const handleClick = async () => {
        // ─── Pre-Check: Authentication Gate ───
        if (!isAuthenticated) {
            // Save current product page for smart redirect after login
            saveRedirectPath(window.location.pathname);
            navigate(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
            toast({
                title: 'Login Required',
                description: 'Please sign in to purchase this product.',
            });
            return;
        }

        setIsLoading(true);

        try {
            // ─── Step 1: Load Razorpay SDK ───
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // ─── Step 2: Create Order on Backend ───
            // Backend will verify the price from the database, NOT trust this `price` prop
            const orderResponse = await apiServerClient.fetch('/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    userId: currentUser?.id || '',
                    amount: price, // Fallback — server overrides with DB price
                    productTitle,
                    customerEmail: currentUser?.email || '',
                    customerName: currentUser?.name || '',
                    customerPhone: currentUser?.phone || '',
                }),
            });

            if (!orderResponse.ok) {
                const errData = await orderResponse.json();
                throw new Error(errData.error || 'Failed to create order');
            }

            const orderData = await orderResponse.json();

            // ─── Step 3: Configure & Open Razorpay Checkout Modal ───
            const options = {
                // Razorpay Key (public — safe to expose)
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SKSh64mq33En2x',

                // Order details from backend
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,

                // Brand configuration
                name: 'Vikram Presence',
                description: productTitle,
                image: 'https://horizons-cdn.hostinger.com/b97f6cc3-989b-4f74-bc63-5ca3ca17eb47/be8b4dcc5a2a5cf25f645f196e119fda.png',

                // Dark theme with gold accent
                theme: {
                    color: '#ffcc00',
                    backdrop_color: 'rgba(0, 0, 0, 0.85)',
                },

                // Pre-fill user details
                prefill: {
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    contact: currentUser?.phone || '',
                },

                // ─── Payment Success Handler ───
                handler: async function (response) {
                    try {
                        toast({
                            title: 'Verifying Payment',
                            description: 'Please wait while we confirm your transaction...',
                        });

                        // Call backend to verify signature + fulfill order
                        const verifyResponse = await apiServerClient.fetch('/payment/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                productId,
                                buyerEmail: currentUser?.email,
                                buyerPhone: currentUser?.phone || '',
                                productName: productTitle,
                                googleDriveLink,
                            }),
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();

                        toast({
                            title: 'Payment Successful! 🎉',
                            description: 'Your access has been granted.',
                            style: { backgroundColor: '#FFD700', color: '#000000' },
                        });

                        // Navigate to Thank You page with product access
                        navigate('/thank-you', {
                            state: {
                                productName: productTitle,
                                googleDriveLink: verifyData.productLink || googleDriveLink,
                            },
                        });
                    } catch (err) {
                        console.error('Verification error:', err);
                        toast({
                            title: 'Verification Error',
                            description: err.message || 'Please contact support.',
                            variant: 'destructive',
                        });
                    } finally {
                        setIsLoading(false);
                    }
                },

                // ─── Modal Dismissed Handler ───
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                        toast({
                            title: 'Payment Cancelled',
                            description: 'You closed the payment window.',
                            variant: 'destructive',
                        });
                    },
                },
            };

            const rzp = new window.Razorpay(options);

            // ─── Payment Failed Handler ───
            rzp.on('payment.failed', function (response) {
                setIsLoading(false);
                toast({
                    title: 'Payment Failed',
                    description: response.error.description || 'Transaction declined.',
                    variant: 'destructive',
                });
            });

            rzp.open();
        } catch (error) {
            console.error('Checkout error:', error);
            toast({
                title: 'Checkout Error',
                description: error.message || 'Could not initialize checkout.',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className={className}>
            <button
                onClick={handleClick}
                disabled={isLoading}
                id="checkout-buy-btn"
                className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-[30px] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: '#ffcc00',
                    color: '#000000',
                    padding: '15px 40px',
                    fontSize: '14px',
                    border: 'none',
                    boxShadow: '0 0 15px rgba(255, 204, 0, 0.5)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                    </>
                ) : (
                    `${buttonText} — ₹${price}`
                )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-white/50 text-[10px] uppercase tracking-widest">
                <ShieldCheck size={12} className="text-[#FFD700]" /> Secure Payment via Razorpay
            </div>
        </div>
    );
};

export default CheckoutButton;
