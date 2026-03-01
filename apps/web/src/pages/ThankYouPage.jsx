
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowRight, Copy, Mail, Phone, Sparkles, ShieldCheck, Lock } from 'lucide-react';

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

      <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6" style={{ background: 'var(--surface-0, #080808)' }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full checkout-card p-7 sm:p-10 text-center relative overflow-hidden"
        >

          {/* ═══ ANIMATED SUCCESS CHECKMARK ═══ */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
            className="relative inline-flex items-center justify-center mb-7"
          >
            {/* Outer Ring Pulse */}
            <div className="absolute w-24 h-24 rounded-full animate-success-pulse" />
            {/* Icon Container */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.03))',
                border: '2px solid rgba(74, 222, 128, 0.25)',
                boxShadow: '0 0 40px rgba(74, 222, 128, 0.1)'
              }}>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={36} className="text-green-400" strokeWidth={2} />
              </motion.div>
            </div>
          </motion.div>

          {/* ═══ SUCCESS HEADER ═══ */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tighter"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-sm font-light mb-7 max-w-sm mx-auto"
          >
            Thank you for the trust — your product is ready to access.
          </motion.p>

          {/* ═══ DELIVERY STATUS ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-4 mb-5"
            style={{ background: 'var(--surface-2, #111114)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={13} className="text-[#FFD700]" />
              <p className="text-[#FFD700]/80 font-semibold text-[10px] uppercase tracking-[0.15em]">Delivery Status</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center gap-2 text-[12px]">
                <Mail size={11} className={emailSent ? 'text-green-400' : 'text-white/15'} />
                <span className={emailSent ? 'text-green-400/90 font-medium' : 'text-white/25'}>
                  {emailSent
                    ? `Link sent to ${buyerEmail}`
                    : buyerEmail
                      ? `Email delivery pending for ${buyerEmail}`
                      : 'Check your email for the download link'}
                </span>
              </div>

              {buyerPhone && (
                <div className="flex items-center justify-center gap-2 text-[12px]">
                  <Phone size={11} className={smsSent ? 'text-green-400' : 'text-white/15'} />
                  <span className={smsSent ? 'text-green-400/90 font-medium' : 'text-white/25'}>
                    {smsSent ? `SMS sent to ${buyerPhone}` : `SMS pending for ${buyerPhone}`}
                  </span>
                </div>
              )}
            </div>

            {(emailSent || smsSent) && (
              <p className="text-[#FFD700]/40 text-[10px] mt-2">📧 Check inbox and spam folder</p>
            )}
          </motion.div>

          {/* ═══ PURCHASED PRODUCT ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-5 mb-5"
            style={{ background: 'var(--surface-2, #111114)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <p className="text-[10px] text-white/25 uppercase tracking-[0.15em] mb-1.5">Purchased Product</p>
            <h2 className="text-xl font-bold text-[#FFD700] mb-1">{productName}</h2>
            {paymentId && (
              <p className="text-[10px] text-white/10 font-mono">ID: {paymentId}</p>
            )}
          </motion.div>

          {/* ═══ CHECK EMAIL CTA ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl p-5 mb-5"
            style={{
              background: 'rgba(255, 215, 0, 0.02)',
              border: '1.5px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.05)'
            }}
          >
            <p className="text-[#FFD700] font-bold text-[11px] uppercase tracking-[0.12em] mb-4">
              ✉️ Check Your Email for the Download Link
            </p>

            {googleDriveLink ? (
              <>
                <a
                  href={googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium break-all mb-4 text-[#FFD700]/70 underline underline-offset-4 decoration-[#FFD700]/20 hover:text-[#FFD700] transition-colors"
                >
                  {googleDriveLink}
                </a>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FFD700] text-black font-bold uppercase tracking-[0.12em] text-[12px] rounded-2xl hover:bg-yellow-400 transition-all duration-300 shimmer-btn animate-cta-glow active:scale-[0.98]"
                  >
                    <Download size={15} />
                    Open Product
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 border border-white/[0.06] text-white/50 font-medium uppercase tracking-[0.1em] text-[11px] rounded-2xl hover:text-white/80 hover:border-white/15 transition-all duration-300 interactive-hover"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <Copy size={13} />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm font-light">
                Your download link has been sent to your email. Please check your inbox (and spam folder).
              </p>
            )}
          </motion.div>

          {/* ═══ TRUST FOOTER ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="trust-badges">
              <div className="trust-badge"><Lock size={10} /><span>Encrypted</span></div>
              <div className="trust-badge"><ShieldCheck size={10} /><span>Verified</span></div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center text-white/20 text-[11px] uppercase tracking-[0.1em] hover:text-[#FFD700] transition-colors interactive-hover"
            >
              Explore More <ArrowRight size={11} className="ml-1" />
            </Link>

            <p className="text-white/8 text-[9px]">
              Save this page — it contains your permanent product access link.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ThankYouPage;
