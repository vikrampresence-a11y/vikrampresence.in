
import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import apiServerClient from '@/lib/apiServerClient';

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (product, customerDetails, onSuccess) => {
    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      toast({
        title: "Initializing Secure Checkout",
        description: `Preparing payment for ${product.name || product.title}`,
      });

      // 1. Create Order on Backend
      const orderResponse = await apiServerClient.fetch('/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          productId: product.id,
          productTitle: product.name || product.title,
          customerEmail: customerDetails.email,
          customerName: customerDetails.name || 'Guest User'
        })
      });

      if (!orderResponse.ok) {
        const errData = await orderResponse.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      // 2. Initialize Razorpay
      const options = {
        key: 'rzp_live_SKSh64mq33En2x',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vikram Presence',
        description: product.name || product.title,
        order_id: orderData.orderId,
        theme: {
          color: '#FFD700'
        },
        handler: async function (response) {
          try {
            toast({
              title: "Verifying Payment",
              description: "Please wait while we confirm your transaction...",
            });

            // 3. Verify Payment on Backend (Triggers Email only)
            const verifyResponse = await apiServerClient.fetch('/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productId: product.id,
                buyerEmail: customerDetails.email,
                buyerPhone: customerDetails.phone,
                productName: product.name || product.title,
                googleDriveLink: product.googleDriveLink
              })
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            toast({
              title: "Payment Successful",
              description: "Your access has been granted.",
              style: { backgroundColor: '#FFD700', color: '#000000' }
            });

            if (onSuccess) {
              onSuccess({
                productName: product.name || product.title,
                googleDriveLink: verifyData.productLink || product.googleDriveLink
              });
            }

          } catch (err) {
            console.error("Verification error:", err);
            toast({
              title: "Verification Error",
              description: err.message || "There was an issue verifying your payment. Please contact support.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerDetails.name || '',
          email: customerDetails.email || '',
          contact: customerDetails.phone || '',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You closed the payment window.",
              variant: "destructive"
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Transaction declined.",
          variant: "destructive"
        });
      });

      rzp.open();

    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      toast({
        title: "Checkout Error",
        description: error.message || "Could not initialize checkout.",
        variant: "destructive"
      });
    }
  };

  return (
    <PaymentContext.Provider value={{ processPayment, isProcessing }}>
      {children}
    </PaymentContext.Provider>
  );
};
