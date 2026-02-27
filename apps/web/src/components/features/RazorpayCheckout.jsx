
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Loader2, Mail, Phone } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast';
import { saveRedirectPath } from '@/hooks/useSmartRedirect';

const RazorpayCheckout = ({ product, className = '', buttonText = 'Buy Now' }) => {
  const { processPayment, isProcessing } = usePayment();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(pb.authStore.model?.email || '');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = (data) => {
    navigate('/thank-you', {
      state: {
        productName: data.productName,
        googleDriveLink: data.googleDriveLink
      }
    });
  };

  const handleBuyClick = () => {
    // If user is NOT logged in, save current product page and redirect to login
    if (!isAuthenticated) {
      saveRedirectPath(window.location.pathname);
      navigate(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      toast({
        title: "Login Required",
        description: "Please sign in to purchase this product.",
      });
      return;
    }
    // If logged in, show the contact details form
    setShowForm(true);
    // Pre-fill email from auth
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (!phone || phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    const customerDetails = {
      name: currentUser?.name || pb.authStore.model?.name || 'Guest User',
      email: email,
      phone: phone
    };

    processPayment(product, customerDetails, handleSuccess);
  };

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
      <h3 className="text-white font-bold mb-4 text-lg">Contact Details</h3>
      <p className="text-gray-400 text-sm mb-6">We'll send your product access to these details.</p>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="tel"
            placeholder="WhatsApp Number (e.g. +919876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-70"
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
