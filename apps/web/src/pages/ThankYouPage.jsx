
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, ArrowRight, Copy, Mail } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productName, googleDriveLink } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handleSendEmail = () => {
    // Open mailto with the Drive link pre-filled
    const subject = encodeURIComponent(`Your Product: ${productName} — Vikram Presence`);
    const body = encodeURIComponent(
      `Thank you for purchasing "${productName}" from Vikram Presence!\n\n` +
      `Here is your product access link:\n${googleDriveLink}\n\n` +
      `Click the link above to access your product.\n\n` +
      `— Vikram Presence`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setEmailSent(true);
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

          <p className="text-xl text-gray-300 mb-8 font-light">
            Thank you for the trust. Your product is ready.
          </p>

          {/* Purchased Product */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Purchased Product</p>
            <h2 className="text-2xl font-bold text-[#FFD700]">{productName}</h2>
          </div>

          {/* ═══════════════════════════════════════
              HIGHLIGHTED PRODUCT LINK — THE STAR
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

              {/* The Link — Highlighted, Clickable, Prominent */}
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
                {/* Open Link Button */}
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

                {/* Copy Link Button */}
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

          {/* Email Button */}
          <button
            onClick={handleSendEmail}
            className="flex items-center justify-center mx-auto px-8 py-4 bg-transparent border border-[#FFD700]/30 text-[#FFD700] font-bold uppercase tracking-widest rounded-full hover:bg-[#FFD700]/10 transition-all duration-300 text-sm mb-8"
          >
            <Mail size={16} className="mr-2" />
            {emailSent ? 'Email Opened!' : 'Send Link to Email'}
          </button>

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
