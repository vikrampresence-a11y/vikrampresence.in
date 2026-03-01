
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Layers, Loader2, ShieldCheck, Zap, Mail } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let filterString = '';
        if (activeFilter === 'ebooks') filterString = 'type="ebook"';
        if (activeFilter === 'courses') filterString = 'type="course"';

        const records = await pb.collection('products').getFullList({
          filter: filterString,
          sort: 'price',
          $autoCancel: false
        });
        setProducts(records);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    setSearchParams({ filter: activeFilter });
  }, [activeFilter, setSearchParams]);

  const getImageUrl = (record) => {
    if (record.image) {
      return pb.files.getUrl(record, record.image);
    }
    return record.type === 'ebook'
      ? 'https://images.unsplash.com/photo-1547817705-54f36887b36a?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1679316481049-4f6549df499f?auto=format&fit=crop&w=600&q=80';
  };

  const categories = [
    { id: 'all', title: 'All Products', icon: Layers },
    { id: 'ebooks', title: 'Ebooks', icon: BookOpen },
    { id: 'courses', title: 'Courses', icon: GraduationCap }
  ];

  return (
    <>
      <Helmet>
        <title>Best Ebooks for Clarity, Discipline & Confidence | Vikram Presence</title>
        <meta name="description" content="Discover powerful ebooks to build clarity, discipline, and confidence. Simple, practical guides for real life improvement." />
        <meta name="keywords" content="ebooks, self-improvement, clarity, discipline, confidence" />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans">
        <div className="container mx-auto px-6 max-w-7xl">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-white">Digital Store</h1>
            <div className="w-10 h-[2px] bg-[#FFD700] mx-auto mb-5 opacity-60" />
            <p className="text-base text-white/50 max-w-xl mx-auto font-light">
              Premium resources designed to help you build discipline and find clarity.
            </p>
          </motion.div>

          {/* Trust Bar */}
          <div className="trust-bar mb-12">
            <span><ShieldCheck size={13} className="text-[#FFD700]/50" /> Secure Payment</span>
            <span><Zap size={13} className="text-[#FFD700]/50" /> Instant Access</span>
            <span><Mail size={13} className="text-[#FFD700]/50" /> Email Delivery</span>
          </div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3 mb-16 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`group flex items-center space-x-2.5 px-6 py-3 rounded-full border text-[12px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${activeFilter === cat.id
                  ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
              >
                <cat.icon size={16} className={activeFilter === cat.id ? 'text-[#FFD700]' : 'text-white/30 group-hover:text-white/60'} />
                <span>{cat.title}</span>
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400/80 glass-card rounded-2xl max-w-lg mx-auto">
              <p className="p-8">Error loading products: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 text-white/30">
              <p className="text-xl">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)] flex flex-col h-full group relative"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img
                      src={getImageUrl(product)}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                        {product.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300 line-clamp-1">{product.title}</h3>
                    <p className="text-white/30 text-sm font-light line-clamp-2 mb-6 flex-grow">{product.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold text-white">₹{product.price}</span>
                      <div className="flex space-x-2.5">
                        <Link
                          to={`/product/${product.id}`}
                          className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white text-[11px] font-medium uppercase tracking-widest rounded-full transition-all duration-300"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/product/${product.id}`}
                          className="px-5 py-2 bg-[#FFD700] hover:bg-yellow-400 text-black text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ShopPage;
