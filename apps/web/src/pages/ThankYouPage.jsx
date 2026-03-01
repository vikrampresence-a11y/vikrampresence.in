
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, ArrowRight, Copy, Mail, Phone, Sparkles } from 'lucide-react';
import { useState } from 'react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    productName,
    googleDriveLink,
    paymentId,
    buyerEmail,
    buyerPhone,
    emailSent,
    smsSent,
  } = location.state || {};

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!productName && !googleDriveLink) {
      navigate('/');
    }
  }, [productName, googleDriveLink, navigate]);

  if (!productName && !googleDriveLink) return null;

  const handleCopyLink = () => {
    if (googleDriveLink) {
      navigator.clipboard.writeText(googleDriveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Successful | Vikram Presence</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center py-20 px-6">
        <div className="max-w-xl w-full glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
          style={{ borderColor: 'rgba(255, 215, 0, 0.2)', boxShadow: '0 0 60px rgba(255, 215, 0, 0.08)' }}
        >
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-6">
            <CheckCircle size={32} />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Payment Successful! 🎉
          </h1>

          <p className="text-base text-white/50 mb-6 font-light">
            Thank you for the trust. Your product is ready.
          </p>

          {/* Delivery Status */}
          <div className="glass-card rounded-xl p-4 mb-6" style={{ borderColor: 'rgba(255, 215, 0, 0.15)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#FFD700]" />
              <p className="text-[#FFD700] font-semibold text-[10px] uppercase tracking-[0.15em]">
                Delivery Status
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center gap-2 text-[13px]">
                <Mail size={12} className={emailSent ? 'text-green-400' : 'text-white/20'} />
                <span className={emailSent ? 'text-green-400 font-medium' : 'text-white/30'}>
                  {emailSent
                    ? `✅ Drive link sent to ${buyerEmail}`
                    : buyerEmail
                      ? `Email delivery pending for ${buyerEmail}`
                      : 'No email provided'
                  }
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[13px]">
                <Phone size={12} className={smsSent ? 'text-green-400' : 'text-white/20'} />
                <span className={smsSent ? 'text-green-400 font-medium' : 'text-white/30'}>
                  {smsSent
                    ? `✅ SMS sent to ${buyerPhone}`
                    : buyerPhone
                      ? `SMS delivery pending for ${buyerPhone}`
                      : 'No phone provided'
                  }
                </span>
              </div>
            </div>

            {(emailSent || smsSent) && (
              <p className="text-[#FFD700]/60 text-[11px] mt-2.5 font-medium">
                📧 Check your inbox (and spam folder) for the product link
              </p>
            )}
          </div>

          {/* Purchased Product */}
          <div className="glass-card rounded-xl p-5 mb-6">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5">Purchased Product</p>
            <h2 className="text-xl font-bold text-[#FFD700]">{productName}</h2>
            {paymentId && (
              <p className="text-[10px] text-white/15 mt-1.5 font-mono">Payment ID: {paymentId}</p>
            )}
          </div>

          {/* Product Link */}
          {googleDriveLink && (
            <div className="rounded-xl p-5 mb-6" style={{ border: '2px solid rgba(255, 215, 0, 0.3)', backgroundColor: 'rgba(255, 215, 0, 0.03)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.08)' }}>
              <p className="text-[10px] text-[#FFD700] uppercase tracking-[0.15em] font-bold mb-3">
                ⬇️ YOUR PRODUCT ACCESS LINK ⬇️
              </p>

              <a
                href={googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm md:text-base font-semibold break-all mb-4 text-[#FFD700] underline underline-offset-4 decoration-[#FFD700]/30"
              >
                {googleDriveLink}
              </a>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-7 py-3.5 bg-[#FFD700] text-black font-bold uppercase tracking-[0.15em] text-[12px] rounded-full hover:bg-yellow-400 transition-all duration-300 shimmer-btn animate-pulse-gold"
                >
                  <Download size={16} className="mr-2" />
                  Open Product
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center px-5 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium uppercase tracking-[0.12em] text-[11px] rounded-full hover:bg-white/[0.08] transition-all duration-300"
                >
                  <Copy size={14} className="mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          <Link
            to="/"
            className="inline-flex items-center text-white/30 text-[11px] uppercase tracking-[0.12em] hover:text-[#FFD700] transition-colors"
          >
            Explore More <ArrowRight size={12} className="ml-1.5" />
          </Link>

          <p className="text-white/10 text-[10px] mt-6">
            Save this link — it's your permanent access to the product.
          </p>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;
