import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Book, MonitorPlay, Layers, ShieldCheck, Zap, Mail, Youtube, Instagram, ChevronDown, Plus, CheckCircle } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';
import ScrollReveal from '@/components/shared/ScrollReveal';
import DirectCheckoutButton from '@/components/features/DirectCheckoutButton';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const getSampleProducts = () => [
    {
      id: 'content-creation',
      title: 'Content Creation',
      description: 'Master the art of content creation — strategy, production, and growth for every platform.',
      pricePaise: 100,
      coverImageUrl: '/content-creation-cover.png',
      driveLink: 'https://drive.google.com/drive/folders/1-fJ109sF0WJNRv3geArVKehGHE2SQ0zW?usp=drive_link',
      type: 'ebook',
    },
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

  const curriculum = [
    {
      num: '01',
      title: 'Build Unshakeable Clarity',
      items: ['Eliminate mental fog and overthinking', 'Design your personal decision framework', 'Master the art of focused execution'],
    },
    {
      num: '02',
      title: 'Develop Iron Discipline',
      items: ['Create habit systems that stick forever', 'Build morning and evening routines', 'Destroy procrastination at its root'],
    },
    {
      num: '03',
      title: 'Unlock True Confidence',
      items: ['Rewire your self-image from the inside', 'Develop a high-performer mindset', 'Take massive action without self-doubt'],
    },
  ];

  const faqs = [
    { q: 'What formats are the ebooks available in?', a: 'All ebooks are delivered as high-quality PDFs. You get instant access via email and Google Drive link after purchase.' },
    { q: 'How do I access the courses?', a: 'After purchase, you receive a Google Drive link with all course materials. Access is instant and lifetime.' },
    { q: 'Is there a refund policy?', a: 'Yes! We offer a full refund within 7 days of purchase if the product does not meet your expectations.' },
    { q: 'Are payments secure?', a: 'Absolutely. All payments are processed through Razorpay with 256-bit SSL encryption. Your data is 100% safe.' },
    { q: 'Can I access on mobile?', a: 'Yes, all products are mobile-friendly. PDFs and course materials can be accessed on any device.' },
  ];

  return (
    <>
      <Helmet>
        <title>Vikram Presence — Premium Ebooks & Courses</title>
        <meta name="description" content="Premium ebooks and courses for building clarity, discipline, and absolute confidence." />
      </Helmet>

      <div className="min-h-screen text-white font-sans relative overflow-hidden" style={{ background: 'var(--surface-0)' }}>

        {/* ═══════════════════════════════════════
            1. HERO — tharunspeaks style
            ═══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay radial-gold-glow section-glow">
          <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center pt-28 pb-20">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8"
            >
              <div className="w-6 h-6 rounded-full bg-[#E2F034]/20 flex items-center justify-center text-[10px] font-bold text-[#E2F034]">VP</div>
              <span className="text-white/60 text-sm font-medium">Vikram Presence</span>
            </motion.div>

            {/* Serif italic prefix */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="serif-italic text-white/50 text-xl md:text-2xl mb-3"
            >
              not just another
            </motion.p>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6"
            >
              <span className="text-white">Your Favourite</span>
              <br />
              <span className="text-[#E2F034]">Motivational Speaker</span>
            </motion.h1>

            {/* Scrolling Product Marquee */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="w-full max-w-2xl mx-auto mb-8 overflow-hidden relative"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
            >
              <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
                {[
                  'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
                  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80',
                ].map((src, i) => (
                  <div key={i} className="w-48 h-32 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    <img src={src} alt={`Product ${(i % 4) + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="text-lg md:text-xl text-white/50 mb-10 font-light max-w-lg mx-auto leading-relaxed"
            >
              the ultimate collection of ebooks & courses<br />
              to build clarity, discipline, and confidence.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-12 py-4 bg-[#E2F034] text-black font-bold uppercase tracking-[0.15em] text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(226,240,52,0.4)] hover:scale-[1.03] active:scale-95"
              >
                Explore Now
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            2. SOCIAL PROOF PILLS
            ═══════════════════════════════════════ */}
        <section className="py-20 relative section-glow-blue">
          <div className="container mx-auto px-6 max-w-xl">
            <ScrollReveal>
              <div className="flex flex-col gap-4 items-center">
                {[
                  { icon: Youtube, platform: 'YouTube', count: '55K+', label: 'Subscribers', color: '#FF0000', url: 'https://youtube.com/@vikrampresence?si=S6KREibiIGo7nyYN' },
                  { icon: Instagram, platform: 'Instagram', count: '220K+', label: 'Followers', color: '#E1306C', url: 'https://www.instagram.com/vikram_presence?igsh=eWlkbmM2N3o2Zmdk' },
                ].map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-proof-pill w-full max-w-md group cursor-pointer"
                    style={{ boxShadow: '0 0 30px rgba(226, 240, 52, 0.08), 0 0 60px rgba(226, 240, 52, 0.04)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(226,240,52,0.3)]" style={{ background: `${social.color}15` }}>
                      <social.icon size={18} style={{ color: social.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold group-hover:text-[#E2F034] transition-colors">{social.platform}</p>
                      <p className="text-white/30 text-xs">{social.label}</p>
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">{social.count}</span>
                  </a>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            3. CURRICULUM / VALUE CARDS
            ═══════════════════════════════════════ */}
        <section className="py-28 relative section-glow">
          <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="serif-italic text-white/40 text-lg mb-3">Learn the</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                  <span className="text-[#E2F034]">Exact Frameworks</span> We Teach
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              {curriculum.map((module, idx) => (
                <ScrollReveal key={idx} delay={idx * 120}>
                  <div className="curriculum-card">
                    <span className="big-number">{module.num}</span>
                    <div className="relative z-10">
                      <span className="text-[#E2F034] text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Module {module.num}</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">{module.title}</h3>
                      <ul className="space-y-3">
                        {module.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-white/50 text-[15px] font-light">
                            <Plus size={14} className="text-[#E2F034]/70 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            4. BENEFITS DIAGRAM
            ═══════════════════════════════════════ */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-4">
                  Why <span className="text-[#E2F034]">This Works</span>
                </h2>
                <p className="text-white/40 max-w-md mx-auto text-base font-light">Four pillars that drive real transformation.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '🧠', title: 'Clarity', desc: 'Cut through mental noise' },
                { emoji: '⚡', title: 'Discipline', desc: 'Build systems that stick' },
                { emoji: '🎯', title: 'Growth', desc: 'Compound progress daily' },
                { emoji: '💰', title: 'Wealth', desc: 'Monetize your potential' },
              ].map((benefit, idx) => (
                <ScrollReveal key={idx} delay={idx * 80}>
                  <div className="glass-card p-6 text-center group h-full">
                    <div className="text-3xl mb-4">{benefit.emoji}</div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-[#E2F034] transition-colors">{benefit.title}</h3>
                    <p className="text-white/30 text-xs font-light">{benefit.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            5. TOP EBOOKS & COURSES
            ═══════════════════════════════════════ */}
        <section className="py-28 relative section-glow">
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="serif-italic text-white/40 text-lg mb-3">Browse our</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                  Top <span className="text-[#E2F034]">Products</span>
                </h2>
              </div>
            </ScrollReveal>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-[#E2F034]/20 border-t-[#E2F034] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {featuredProducts.map((product, index) => (
                  <ScrollReveal key={product.id} delay={index * 100}>
                    <div className="group h-full">
                      <div className="glass-card overflow-hidden transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                          <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                              {product.type === 'course' ? 'Course' : 'Ebook'}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#E2F034] transition-colors duration-300">{product.title}</h3>
                          {product.description && (
                            <p className="text-white/35 text-sm font-light mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/[0.04] mb-4">
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

        {/* ═══════════════════════════════════════
            6. FAQ ACCORDION
            ═══════════════════════════════════════ */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6 max-w-3xl">
            <ScrollReveal>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
                  Frequently Asked <span className="text-[#E2F034]">Questions</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-0">
              {faqs.map((faq, idx) => (
                <ScrollReveal key={idx} delay={idx * 60}>
                  <div
                    className="faq-item py-5 px-2"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-between gap-4 cursor-pointer">
                      <h3 className="text-white text-[15px] font-medium">{faq.q}</h3>
                      <motion.div
                        animate={{ rotate: openFaq === idx ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <Plus size={18} className="text-[#E2F034]/60" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-white/40 text-sm font-light leading-relaxed pt-3 pr-8">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            7. FINAL CTA
            ═══════════════════════════════════════ */}
        <section className="py-28 relative section-glow">
          <div className="container mx-auto px-6 text-center relative z-10">
            <ScrollReveal>
              <p className="serif-italic text-white/40 text-xl mb-4">Ready to</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
                Transform Your <span className="text-[#E2F034]">Life</span>?
              </h2>
              <p className="text-white/40 text-lg font-light max-w-md mx-auto mb-10">
                Join thousands who have already upgraded their mindset with our premium digital products.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-14 py-5 bg-[#E2F034] text-black font-bold uppercase tracking-[0.15em] text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(226,240,52,0.4)] hover:scale-[1.03] active:scale-95"
              >
                Start Now
                <ArrowRight size={16} />
              </Link>

              {/* Trust */}
              <div className="flex items-center justify-center gap-6 mt-10 text-white/30 text-xs font-medium uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#E2F034]/50" /> Secure Payments</span>
                <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#E2F034]/50" /> Instant Access</span>
                <span className="flex items-center gap-1.5"><Mail size={14} className="text-[#E2F034]/50" /> Email Delivery</span>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
