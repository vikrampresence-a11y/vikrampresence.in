
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Layers, Loader2, ShieldCheck, Zap, Mail } from 'lucide-react';
// V2.0 FIX: Use productStore (Firebase/localStorage) instead of PocketBase
import { getAllProducts, getProductsByType } from '@/lib/productStore';

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
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
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--duration': p.duration,
            '--delay': p.delay,
          }}
        />
      ))}
    </div>
  );
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // V2.0 FIX: Fetch from productStore (Firebase + localStorage)
        let items;
        if (activeFilter === 'ebooks') {
          items = await getProductsByType('ebook');
        } else if (activeFilter === 'courses') {
          items = await getProductsByType('course');
        } else {
          items = await getAllProducts();
        }
        setProducts(items);
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    setSearchParams({ filter: activeFilter });
  }, [activeFilter, setSearchParams]);

  // V2.0 FIX: Use coverImageUrl from productStore instead of PocketBase file URLs
  const getImageUrl = (product) => {
    if (product.coverImageUrl) return product.coverImageUrl;
    if (product.image) return product.image;
    return product.type === 'ebook'
      ? 'https://images.unsplash.com/photo-1547817705-54f36887b36a?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1679316481049-4f6549df499f?auto=format&fit=crop&w=600&q=80';
  };

  // V2.0 FIX: Normalize price — productStore uses pricePaise, display as rupees
  const getPrice = (product) => {
    if (product.price && product.price > 0) return product.price;
    if (product.pricePaise) return Math.round(product.pricePaise / 100);
    return 0;
  };

  const categories = [
    { id: 'all', title: 'All Products', icon: Layers },
    { id: 'ebooks', title: 'Ebooks', icon: BookOpen },
    { id: 'courses', title: 'Courses', icon: GraduationCap }
  ];

  // Stagger animation config
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <>
      <Helmet>
        <title>Best Ebooks for Clarity, Discipline & Confidence | Vikram Presence</title>
        <meta name="description" content="Discover powerful ebooks to build clarity, discipline, and confidence. Simple, practical guides for real life improvement." />
        <meta name="keywords" content="ebooks, self-improvement, clarity, discipline, confidence" />
      </Helmet>

      <div className="min-h-screen text-white pt-32 pb-24 font-sans relative overflow-hidden" style={{ background: '#050505' }}>
        {/* Background effects */}
        <FloatingParticles />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#E2F034]/[0.02] blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E2F034]/10 border border-[#E2F034]/20 mb-5"
            >
              <Layers className="text-[#E2F034]" size={20} />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-white">Digital Store</h1>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#E2F034] to-transparent mx-auto mb-5 opacity-60" />
            <p className="text-base text-white/40 max-w-xl mx-auto font-light">
              Premium resources designed to help you build discipline and find clarity.
            </p>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="trust-bar mb-12 max-w-md mx-auto"
          >
            <span><ShieldCheck size={13} className="text-[#E2F034]/50" /> Secure Payment</span>
            <span><Zap size={13} className="text-[#E2F034]/50" /> Instant Access</span>
            <span><Mail size={13} className="text-[#E2F034]/50" /> Email Delivery</span>
          </motion.div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-16 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`group flex items-center space-x-2.5 px-6 py-3 rounded-full border text-[12px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${activeFilter === cat.id
                  ? 'bg-[#E2F034]/10 border-[#E2F034]/40 text-[#E2F034] shadow-[0_0_25px_rgba(226,240,52,0.12)]'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
              >
                <cat.icon size={16} className={activeFilter === cat.id ? 'text-[#E2F034]' : 'text-white/30 group-hover:text-white/60'} />
                <span>{cat.title}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-32 gap-3">
              <Loader2 className="w-10 h-10 text-[#E2F034] animate-spin" />
              <p className="text-white/20 text-xs uppercase tracking-widest">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 text-white/30">
              <p className="text-xl">No products found in this category.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {products.map((product) => {
                const displayPrice = getPrice(product);
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[#E2F034]/20 hover:shadow-[0_12px_40px_rgba(226,240,52,0.06)] flex flex-col h-full group relative card-3d"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <img
                        src={getImageUrl(product)}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                          {product.type}
                        </span>
                      </div>
                      {/* Price badge overlay */}
                      <div className="absolute bottom-4 right-4 z-20">
                        <span className="px-3 py-1.5 bg-[#E2F034] text-black rounded-lg text-sm font-black">
                          ₹{displayPrice}
                        </span>
                      </div>
                    </div>
                    <div className="p-7 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#E2F034] transition-colors duration-300 line-clamp-1">{product.title}</h3>
                      <p className="text-white/25 text-sm font-light line-clamp-2 mb-6 flex-grow">{product.description}</p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(226, 240, 52, 0.1)' }}>₹{displayPrice}</span>
                        <div className="flex space-x-2.5">
                          <Link
                            to={`/product/${product.id}`}
                            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white text-[11px] font-medium uppercase tracking-widest rounded-full transition-all duration-300 hover:border-white/15"
                          >
                            Details
                          </Link>
                          <Link
                            to={`/product/${product.id}`}
                            className="relative overflow-hidden px-5 py-2 bg-[#E2F034] hover:bg-[#d4e22e] text-black text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(226,240,52,0.2)] hover:shadow-[0_0_30px_rgba(226,240,52,0.35)] group/btn"
                          >
                            <span className="relative z-10">Buy Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
};

export default ShopPage;
