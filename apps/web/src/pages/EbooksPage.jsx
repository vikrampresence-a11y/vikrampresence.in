
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

          <Link to="/" className="inline-flex items-center text-white hover:text-[#FFD700] transition-colors mb-10 text-sm uppercase tracking-widest font-bold">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Our Ebooks</h1>
            <p className="text-lg text-white max-w-2xl mx-auto font-light">
              Simple books to help you grow and get better every day.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
            </div>
          ) : ebooks.length === 0 ? (
            <div className="text-center py-32 text-white/40">
              <p className="text-xl mb-2">No ebooks available yet.</p>
              <p className="text-sm">Check back soon — new content is on the way!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {ebooks.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#0a0a0a] border border-[#FFD700]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:-translate-y-1 flex flex-col h-full group"
                >
                  {/* Cover Image */}
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img
                      src={product.coverImageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-[#FFD700]/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
                        EBOOK
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors">{product.title}</h3>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 mb-6">
                      <span className="text-2xl font-bold text-white">₹{(product.pricePaise / 100).toFixed(0)}</span>
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
