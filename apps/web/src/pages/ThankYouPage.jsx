
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, ArrowRight, Copy, Mail, Loader2, Inbox } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productName, googleDriveLink, paymentId } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | error

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

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      return;
    }

    setEmailStatus('sending');

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiBase}/api/email/send-product-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail: email,
          productName,
          googleDriveLink,
        }),
      });

      if (res.ok) {
        setEmailStatus('sent');
      } else {
        setEmailStatus('error');
      }
    } catch (err) {
      console.error('Email send error:', err);
      setEmailStatus('error');
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

          <p className="text-xl text-gray-300 mb-4 font-light">
            Thank you for the trust. Your product is ready.
          </p>

          {/* ═══════════════════════════════════════
              CHECK YOUR EMAIL BANNER
              ═══════════════════════════════════════ */}
          <div className="flex items-center justify-center gap-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl px-6 py-4 mb-8">
            <Inbox size={22} className="text-[#FFD700] flex-shrink-0" />
            <p className="text-[#FFD700] font-bold text-sm md:text-base">
              Enter your email below to receive the product link in your inbox!
            </p>
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
              EMAIL INPUT — Send Drive Link to Email
              ═══════════════════════════════════════ */}
          <div className="rounded-2xl p-6 mb-8 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail size={18} className="text-[#FFD700]" />
              <p className="text-sm text-white font-bold uppercase tracking-widest">
                Get Link in Your Email
              </p>
            </div>

            {emailStatus === 'sent' ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4">
                <p className="text-green-400 font-bold text-sm">
                  ✅ Email sent to {email}! Please check your inbox (and spam folder).
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-5 py-4 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-all duration-300"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending' || !email.includes('@')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex-shrink-0"
                  style={{
                    background: '#FFD700',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(255, 204, 0, 0.3)',
                  }}
                >
                  {emailStatus === 'sending' ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : emailStatus === 'error' ? (
                    'Retry'
                  ) : (
                    <><Mail size={16} /> Send</>
                  )}
                </button>
              </div>
            )}

            {emailStatus === 'error' && (
              <p className="text-red-400 text-xs mt-3">
                Failed to send email. You can still access your product using the link below.
              </p>
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
            to="/shop"
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
