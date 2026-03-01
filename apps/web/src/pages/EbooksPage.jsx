
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShieldCheck, Zap, Mail } from 'lucide-react';
import { getProductsByType } from '@/lib/productStore';
import DirectCheckoutButton from '@/components/features/DirectCheckoutButton';

const EbooksPage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const items = await getProductsByType('ebook');
      setEbooks(items);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <>
      <Helmet>
        <title>Best Ebooks for Clarity, Discipline & Confidence | Vikram Presence</title>
        <meta name="description" content="Discover powerful ebooks to build clarity, discipline, and confidence." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans">
        <div className="container mx-auto px-6 max-w-7xl">

          <Link to="/" className="inline-flex items-center text-white/50 hover:text-[#FFD700] transition-colors mb-10 text-[11px] uppercase tracking-[0.15em] font-medium">
            <ArrowLeft size={14} className="mr-2" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-white">Our Ebooks</h1>
            <div className="w-10 h-[2px] bg-[#FFD700] mx-auto mb-5 opacity-60" />
            <p className="text-base text-white/50 max-w-xl mx-auto font-light">
              Simple books to help you grow and get better every day.
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
          ) : ebooks.length === 0 ? (
            <div className="text-center py-32 text-white/30">
              <p className="text-xl mb-2">No ebooks available yet.</p>
              <p className="text-sm font-light">Check back soon — new content is on the way!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ebooks.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)] hover:-translate-y-1 flex flex-col h-full group"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img
                      src={product.coverImageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                        EBOOK
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300">{product.title}</h3>
                    {product.description && (
                      <p className="text-white/30 text-sm font-light mb-4 leading-relaxed line-clamp-3">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04] mb-5">
                      <span className="text-xl font-bold text-white">₹{(product.pricePaise / 100).toFixed(0)}</span>
                    </div>

                    <DirectCheckoutButton
                      productName={product.title}
                      pricePaise={product.pricePaise}
                      driveLink={product.driveLink}
                    />
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

export default EbooksPage;
