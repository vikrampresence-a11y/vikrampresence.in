
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
        <div className="max-w-2xl w-full bg-[#0a0a0a] border-2 border-[#FFD700]/50 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{ boxShadow: '0 0 50px rgba(255, 204, 0, 0.2)' }}
        >
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-400 mb-6">
            <CheckCircle size={40} />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Payment Successful! 🎉
          </h1>

          <p className="text-xl text-gray-300 mb-6 font-light">
            Thank you for the trust. Your product is ready.
          </p>

          {/* ═══════════════════════════════════════
              DELIVERY STATUS — Glowing Success Toast
              ═══════════════════════════════════════ */}
          <div className="rounded-2xl p-5 mb-8 border border-[#FFD700]/30 bg-[#FFD700]/[0.05]"
            style={{ boxShadow: '0 0 25px rgba(255, 204, 0, 0.1)' }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#FFD700]" />
              <p className="text-[#FFD700] font-bold text-sm uppercase tracking-widest">
                Delivery Status
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Email Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Mail size={14} className={emailSent ? 'text-green-400' : 'text-gray-500'} />
                <span className={emailSent ? 'text-green-400 font-medium' : 'text-gray-500'}>
                  {emailSent
                    ? `✅ Drive link sent to ${buyerEmail}`
                    : buyerEmail
                      ? `Email delivery pending for ${buyerEmail}`
                      : 'No email provided'
                  }
                </span>
              </div>

              {/* SMS Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Phone size={14} className={smsSent ? 'text-green-400' : 'text-gray-500'} />
                <span className={smsSent ? 'text-green-400 font-medium' : 'text-gray-500'}>
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
              <p className="text-[#FFD700] text-xs mt-3 font-medium">
                📧 Please check your email inbox (and spam folder) for the product link!
              </p>
            )}
          </div>

          {/* Purchased Product */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Purchased Product</p>
            <h2 className="text-2xl font-bold text-[#FFD700]">{productName}</h2>
            {paymentId && (
              <p className="text-xs text-gray-500 mt-2 font-mono">Payment ID: {paymentId}</p>
            )}
          </div>

          {/* ═══════════════════════════════════════
              HIGHLIGHTED PRODUCT LINK
              ═══════════════════════════════════════ */}
          {googleDriveLink && (
            <div
              className="rounded-2xl p-6 mb-8"
              style={{
                border: '3px solid #FFD700',
                backgroundColor: '#111',
                boxShadow: '0 0 30px rgba(255, 204, 0, 0.3)',
              }}
            >
              <p className="text-sm text-[#FFD700] uppercase tracking-widest font-bold mb-3">
                ⬇️ YOUR PRODUCT ACCESS LINK ⬇️
              </p>

              <a
                href={googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg md:text-xl font-bold break-all mb-4 underline underline-offset-4 decoration-[#FFD700] decoration-2"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 10px rgba(255, 204, 0, 0.4)',
                }}
              >
                {googleDriveLink}
              </a>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-extrabold uppercase tracking-widest rounded-full hover:bg-yellow-400 hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: '0 0 25px rgba(255, 204, 0, 0.6)' }}
                >
                  <Download size={18} className="mr-2" />
                  Open Product
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center px-6 py-4 bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/20 transition-all duration-300 text-sm"
                >
                  <Copy size={16} className="mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          <Link
            to="/"
            className="inline-flex items-center text-gray-400 text-sm uppercase tracking-widest hover:text-[#FFD700] transition-colors"
          >
            Explore More <ArrowRight size={14} className="ml-2" />
          </Link>

          <p className="text-gray-600 text-xs mt-8">
            Save this link — it's your permanent access to the product.
          </p>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;
