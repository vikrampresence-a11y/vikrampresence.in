import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  CheckCircle2, Download, ArrowRight, Copy, Mail, Phone,
  Sparkles, ShieldCheck, Lock, ExternalLink, CreditCard,
  PartyPopper, Star, Zap, Clock
} from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';

// ═══════════════════════════════════════════════════════
// CSS CONFETTI — Pure CSS exploding particles (no Lottie)
// ═══════════════════════════════════════════════════════
const ConfettiExplosion = () => {
  const colors = ['#E2F034', '#4ADE80', '#38BDF8', '#F472B6', '#FACC15', '#A78BFA', '#FB923C'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${45 + (Math.random() - 0.5) * 10}%`,
    delay: `${Math.random() * 0.4}s`,
    angle: Math.random() * 360,
    distance: 200 + Math.random() * 500,
    duration: `${1.5 + Math.random() * 2}s`,
    size: 4 + Math.random() * 6,
    shape: Math.random() > 0.5 ? '50%' : '0%',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '40%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: p.shape,
            background: p.color,
            animation: `confetti-burst ${p.duration} ${p.delay} ease-out forwards`,
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-burst {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
          100% {
            opacity: 0;
            transform:
              translate(
                calc(cos(var(--angle)) * var(--distance)),
                calc(sin(var(--angle)) * var(--distance) - 200px)
              )
              rotate(720deg)
              scale(0);
          }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// FLOATING PARTICLES (ambient depth)
// ═══════════════════════════════════════════════════════
const FloatingParticles = ({ count = 15 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 4}s`,
    size: Math.random() > 0.5 ? 3 : 2,
  }));

  return (
    <div className="floating-particles">
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{
          left: p.left, top: p.top,
          width: `${p.size}px`, height: `${p.size}px`,
          '--duration': p.duration, '--delay': p.delay,
        }} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-white/[0.04] ${className}`} />
);

// ═══════════════════════════════════════════════════════
// 3D TILT PRODUCT CARD
// ═══════════════════════════════════════════════════════
const ProductShowcase = ({ product, isLoading }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xs mx-auto">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl mb-4" />
        <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  const imageUrl = product?.coverImageUrl || product?.image
    || 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="relative w-full max-w-xs mx-auto cursor-pointer"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-[#E2F034]/[0.04] blur-[60px] rounded-full pointer-events-none" />

      {/* Card Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E2F034]/20 shadow-[0_0_60px_rgba(226,240,52,0.08)]"
        style={{ transform: 'translateZ(40px)' }}>

        {/* Verified Badge */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#E2F034]/25">
          <CheckCircle2 size={11} className="text-[#E2F034]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#E2F034]/90">Verified Purchase</span>
        </div>

        {/* Product Image */}
        <div className="aspect-[3/4] bg-black/50">
          <img
            src={imageUrl}
            alt={product?.title || 'Product'}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80'; }}
          />
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Product info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#E2F034]/60 mb-1">
            {product?.type === 'course' ? '📚 Course' : '📖 Ebook'}
          </p>
          <h3 className="text-white font-bold text-lg tracking-tight leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            {product?.title || 'Your Product'}
          </h3>
          {product?.pricePaise && (
            <p className="text-[#E2F034] font-bold text-sm mt-1"
              style={{ textShadow: '0 0 20px rgba(226,240,52,0.2)' }}>
              ₹{(product.pricePaise / 100).toFixed(0)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT — ThankYouPage (Pro-Max)
// ═══════════════════════════════════════════════════════
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
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  // Redirect if no data
  useEffect(() => {
    if (!productName && !googleDriveLink) {
      navigate('/');
    }
  }, [productName, googleDriveLink, navigate]);

  // Fetch product details (cover image) from store
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productName) { setProductLoading(false); return; }
      try {
        const allProducts = await getAllProducts();
        const found = allProducts.find(
          (p) => p.title === productName || (p.title && p.title.toLowerCase() === productName.toLowerCase())
        );
        if (found) setProduct(found);
      } catch (err) {
        console.error('Could not fetch product details:', err);
      }
      setProductLoading(false);
    };
    fetchProduct();
  }, [productName]);

  // Kill confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!productName && !googleDriveLink) return null;

  const handleCopyLink = () => {
    if (googleDriveLink) {
      navigator.clipboard.writeText(googleDriveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <>
      <Helmet>
        <title>Payment Successful | Vikram Presence</title>
      </Helmet>

      {/* CONFETTI BURST */}
      {showConfetti && <ConfettiExplosion />}

      <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: '#050505' }}>
        <FloatingParticles count={18} />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#E2F034]/[0.02] blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-500/[0.015] blur-[120px] rounded-full pointer-events-none" />

        {/* Main Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20 px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* ═══ SUCCESS BADGE ═══ */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 12 }}
              className="relative"
            >
              {/* Pulse rings */}
              <div className="absolute inset-0 w-28 h-28 -m-4 rounded-full border border-green-400/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 w-28 h-28 -m-4 rounded-full border border-green-400/5 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />

              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-green-400/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.03))',
                  boxShadow: '0 0 60px rgba(74,222,128,0.15), inset 0 0 30px rgba(74,222,128,0.05)'
                }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 250 }}
                >
                  <CheckCircle2 size={38} className="text-green-400" strokeWidth={1.5} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* ═══ HEADLINE ═══ */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Payment <span className="text-green-400" style={{ textShadow: '0 0 40px rgba(74,222,128,0.2)' }}>Successful</span>
            </h1>
            <p className="text-white/35 text-base font-light max-w-md mx-auto leading-relaxed">
              Thank you for your trust — your product is ready to unlock.
            </p>
          </motion.div>

          {/* ═══ MAIN CARD — Glass ═══ */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl glass-card-premium p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Inner shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E2F034]/20 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

              {/* LEFT — Product Showcase with 3D tilt */}
              <ProductShowcase product={product} isLoading={productLoading} />

              {/* RIGHT — Actions */}
              <div className="space-y-5 flex flex-col">

                {/* Product Name */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E2F034]/50 mb-1">Purchased Product</p>
                  {productLoading ? (
                    <Skeleton className="h-7 w-3/4" />
                  ) : (
                    <h2 className="text-2xl font-bold text-white tracking-tight"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      {productName}
                    </h2>
                  )}
                </div>

                {/* Transaction ID */}
                {paymentId && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Transaction ID</p>
                    <p className="text-white/50 text-xs font-mono tracking-wide">{paymentId}</p>
                  </div>
                )}

                {/* Delivery Status */}
                <div className="px-3.5 py-3 rounded-lg border border-white/[0.04]"
                  style={{ background: 'rgba(74,222,128,0.02)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles size={12} className="text-[#E2F034]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#E2F034]/70">Delivery Status</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail size={11} className={emailSent ? 'text-green-400' : 'text-white/15'} />
                      <span className={emailSent ? 'text-green-400/90 font-medium' : 'text-white/30'}>
                        {emailSent
                          ? `Link sent to ${buyerEmail}`
                          : buyerEmail
                            ? `Email pending → ${buyerEmail}`
                            : 'Check your inbox for the link'}
                      </span>
                    </div>
                    {buyerPhone && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <Phone size={11} className={smsSent ? 'text-green-400' : 'text-white/15'} />
                        <span className={smsSent ? 'text-green-400/90 font-medium' : 'text-white/30'}>
                          {smsSent ? `SMS sent to ${buyerPhone}` : `SMS pending → ${buyerPhone}`}
                        </span>
                      </div>
                    )}
                  </div>
                  {(emailSent || smsSent) && (
                    <p className="text-white/15 text-[10px] mt-2 flex items-center gap-1.5">
                      <Clock size={10} /> Check inbox (and spam folder)
                    </p>
                  )}
                </div>

                {/* ═══ CTA: GET YOUR PRODUCT ═══ */}
                {googleDriveLink ? (
                  <div className="space-y-3 mt-auto">
                    <motion.a
                      href={googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#E2F034] text-black font-black uppercase tracking-[0.15em] text-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(226,240,52,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ animation: 'cta-glow 3s ease-in-out infinite' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />
                      <Download size={18} className="relative z-10" />
                      <span className="relative z-10">Get Your Product Now</span>
                      <ExternalLink size={14} className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>

                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-white/[0.06] text-white/40 font-medium uppercase tracking-[0.1em] text-[10px] rounded-xl hover:text-white/70 hover:border-white/15 transition-all duration-300 bg-white/[0.02]"
                    >
                      <Copy size={12} />
                      {copied ? '✓ Link Copied!' : 'Copy Access Link'}
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <Mail size={18} className="text-[#E2F034]/40 mx-auto mb-2" />
                    <p className="text-white/30 text-sm font-light">
                      Your download link has been sent to your email.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ═══ TRUST FOOTER ═══ */}
          <motion.div variants={itemVariants} className="mt-10 text-center space-y-5">
            <div className="flex items-center justify-center gap-6 text-white/15 text-[9px] uppercase font-bold tracking-[0.12em]">
              <span className="flex items-center gap-1.5"><Lock size={10} className="text-[#E2F034]/30" /> Encrypted</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-[#E2F034]/30" /> Verified</span>
              <span className="flex items-center gap-1.5"><CreditCard size={10} className="text-[#E2F034]/30" /> Razorpay</span>
              <span className="flex items-center gap-1.5"><Zap size={10} className="text-[#E2F034]/30" /> Instant</span>
            </div>

            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-white/20 text-[11px] uppercase tracking-[0.12em] hover:text-[#E2F034] transition-colors duration-300"
            >
              Explore More Products
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-white/[0.06] text-[9px]">
              Save this page — it contains your permanent product access link.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
};

export default ThankYouPage;
