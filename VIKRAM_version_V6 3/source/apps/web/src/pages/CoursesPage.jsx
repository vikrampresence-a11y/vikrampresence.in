
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShieldCheck, Zap, Mail } from 'lucide-react';
// V2.0 FIX: Use productStore for data consistency
import { getProductsByType } from '@/lib/productStore';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const items = await getProductsByType('course');
        setCourses(items);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, []);

  // V2.0 FIX: Normalize fields for consistent premium rendering
  const getDisplayPrice = (p) => {
    if (p.price && p.price > 0) return p.price;
    if (p.pricePaise) return Math.round(p.pricePaise / 100);
    return 0;
  };

  const getImageUrl = (p) => {
    return p.coverImageUrl || p.image || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <>
      <Helmet>
        <title>Online Courses for Personal Growth | Vikram Presence</title>
        <meta name="description" content="Join structured online courses designed to help you grow. Simple, practical guides for real life improvement." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans relative overflow-hidden">
        {/* Abstract Glow Background */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          <Link to="/shop" className="inline-flex items-center text-white/30 hover:text-[#FFD700] transition-colors mb-10 text-[11px] uppercase tracking-[0.15em] font-medium group">
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Store
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-white">Premium Courses</h1>
            <div className="w-10 h-[2px] bg-[#FFD700] mx-auto mb-5 opacity-60" />
            <p className="text-base text-white/50 max-w-xl mx-auto font-light">
              High-performance systems to upgrade your habits and confidence.
            </p>
          </motion.div>

          {/* Trust Bar */}
          <div className="trust-bar mb-14">
            <span><ShieldCheck size={13} className="text-[#FFD700]/50" /> Secure Payment</span>
            <span><Zap size={13} className="text-[#FFD700]/50" /> Instant Access</span>
            <span><Mail size={13} className="text-[#FFD700]/50" /> Email Delivery</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-32 text-white/30 glass-card rounded-2xl max-w-lg mx-auto border-white/5">
              <p className="text-xl mb-2 font-medium">No courses available yet.</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Developing curriculum...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700]/25 hover:shadow-[0_8px_40px_rgba(255,215,0,0.1)] hover:-translate-y-1.5 flex flex-col h-full group"
                >
                  <Link to={`/product/${product.id}`} className="block overflow-hidden relative aspect-video">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <img
                      src={getImageUrl(product)}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80">
                        COURSE
                      </span>
                    </div>
                  </Link>

                  <div className="p-7 flex flex-col flex-grow bg-gradient-to-b from-white/[0.01] to-transparent">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300 line-clamp-1">{product.title}</h3>
                    {product.description && (
                      <p className="text-white/30 text-sm font-light mb-8 leading-relaxed line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-auto pt-6 border-t border-white/[0.05] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-0.5">Price</span>
                        <span className="text-xl font-black text-white">₹{getDisplayPrice(product)}</span>
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className="px-6 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                      >
                        Enroll Now
                      </Link>
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

export default CoursesPage;
