import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Book, MonitorPlay, Layers, ShieldCheck, Zap, Mail } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';
import ScrollReveal from '@/components/shared/ScrollReveal';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import DirectCheckoutButton from '@/components/features/DirectCheckoutButton';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback sample products
  const getSampleProducts = () => [
    {
      id: 'sample-1',
      title: 'Habit Mastery Ebook',
      pricePaise: 49900,
      coverImageUrl: 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80',
      driveLink: '#',
      type: 'ebook',
    },
    {
      id: 'sample-2',
      title: 'Confidence Builder Course',
      pricePaise: 149900,
      coverImageUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80',
      driveLink: '#',
      type: 'course',
    },
    {
      id: 'sample-3',
      title: 'The Clarity Journal',
      pricePaise: 89900,
      coverImageUrl: 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80',
      driveLink: '#',
      type: 'ebook',
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const items = await getAllProducts();
      setFeaturedProducts(items.length > 0 ? items : getSampleProducts());
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Vikram Presence - Premium Ebooks & Courses</title>
        <meta name="description" content="Premium ebooks and courses for building clarity, discipline, and absolute confidence." />
      </Helmet>

      <div className="min-h-screen text-white selection:bg-[#FFD700] selection:text-black font-sans relative overflow-hidden bg-black">

        {/* ═══════════════════════════════════════
            1. HERO — Immersive Full Viewport
            ═══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 grain-overlay radial-gold-glow">
          <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <AnimatedLogo size={100} className="text-[#FFD700]"
                style={{ filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 80px rgba(255, 215, 0, 0.2))' }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tighter"
            >
              Vikram <span className="text-[#FFD700]" style={{ textShadow: '0 0 30px rgba(255,215,0,0.3)' }}>Presence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-white/60 mb-16 font-light max-w-lg mx-auto tracking-wide"
            >
              Get clear. Build habits. Be confident.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-5 mb-12 w-full max-w-md mx-auto sm:max-w-none sm:w-auto"
            >
              <Link to="/ebooks" className="w-full sm:w-auto group relative px-12 py-4 bg-[#FFD700] rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] shimmer-btn animate-pulse-gold">
                <span className="relative text-black font-bold uppercase tracking-[0.2em] text-sm">Ebooks</span>
              </Link>
              <Link to="/courses" className="w-full sm:w-auto group relative px-12 py-4 bg-transparent border border-white/20 rounded-full overflow-hidden transition-all duration-300 hover:border-[#FFD700]/50 hover:bg-[#FFD700]/5">
                <span className="relative text-white font-medium uppercase tracking-[0.2em] text-sm group-hover:text-[#FFD700] transition-colors">Courses</span>
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="trust-bar"
            >
              <span><ShieldCheck size={14} className="text-[#FFD700]/60" /> Secure Payment</span>
              <span><Zap size={14} className="text-[#FFD700]/60" /> Instant Access</span>
              <span><Mail size={14} className="text-[#FFD700]/60" /> Email Delivery</span>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            2. EXPLORE SHOP
            ═══════════════════════════════════════ */}
        <section className="py-24 relative border-t border-white/[0.04]">
          <div className="container mx-auto px-6 text-center relative z-10">
            <ScrollReveal>
              <button onClick={() => setShowCategories(!showCategories)}
                className="inline-flex items-center px-8 py-3.5 glass-card text-white/80 font-medium uppercase tracking-[0.15em] text-[12px] rounded-full hover:text-white hover:border-white/20 transition-all duration-300">
                Explore Shop <ArrowRight size={14} className={`ml-3 transition-transform duration-300 ${showCategories ? 'rotate-90' : ''}`} />
              </button>
            </ScrollReveal>

            <AnimatePresence>
              {showCategories && (
                <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="mt-12 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                      { to: '/ebooks', icon: Book, title: 'Only Ebooks', desc: 'Deep written frameworks.' },
                      { to: '/courses', icon: MonitorPlay, title: 'Only Courses', desc: 'Video modules and guides.' },
                      { to: '/shop', icon: Layers, title: 'Ebooks + Courses', desc: 'View the entire collection.' },
                    ].map((cat) => (
                      <Link key={cat.to} to={cat.to} className="group p-8 glass-card rounded-2xl flex flex-col items-center transition-all duration-500 hover:border-[#FFD700]/30 hover:bg-[#FFD700]/[0.02]">
                        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-5 group-hover:bg-[#FFD700]/10 transition-colors duration-500">
                          <cat.icon className="text-white/50 group-hover:text-[#FFD700] transition-colors duration-500" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1.5 uppercase tracking-wide">{cat.title}</h3>
                        <p className="text-white/30 text-sm font-light">{cat.desc}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            3. TOP EBOOKS & COURSES
            ═══════════════════════════════════════ */}
        <section className="py-28 relative">
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">Top Ebooks & Courses</h2>
                <div className="w-12 h-[2px] bg-[#FFD700] mx-auto opacity-60" />
              </div>
            </ScrollReveal>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {featuredProducts.map((product, index) => (
                  <ScrollReveal key={product.id} delay={index * 100}>
                    <div className="group h-full">
                      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700]/30 hover:-translate-y-1 h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                          <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                              {product.type === 'course' ? 'Course' : 'Ebook'}
                            </span>
                          </div>
                        </div>
                        <div className="p-7 flex flex-col flex-grow">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300">{product.title}</h3>
                          {product.description && (
                            <p className="text-white/35 text-sm font-light mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/[0.04] mb-5">
                            <span className="text-xl font-bold text-white">₹{(product.pricePaise / 100).toFixed(0)}</span>
                          </div>
                          <DirectCheckoutButton productName={product.title} pricePaise={product.pricePaise} driveLink={product.driveLink} />
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
