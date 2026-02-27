import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Book, MonitorPlay, Layers } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import ScrollReveal from '@/components/shared/ScrollReveal';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  const getSampleProducts = () => [
    {
      id: 'sample-1',
      title: 'Habit Mastery Ebook',
      description: 'A comprehensive guide to building lasting habits and breaking bad ones naturally.',
      price: 499,
      type: 'ebook',
      image: ''
    },
    {
      id: 'sample-2',
      title: 'Confidence Builder Course',
      description: 'Video modules and worksheets to help you eliminate self-doubt and act with certainty.',
      price: 1499,
      type: 'course',
      image: ''
    },
    {
      id: 'sample-3',
      title: 'The Clarity Journal',
      description: 'A 90-day guided journal to help you discover your purpose and align your daily actions.',
      price: 899,
      type: 'ebook',
      image: ''
    }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const records = await pb.collection('products').getList(1, 6, {
          sort: '-created',
          $autoCancel: false
        });
        if (records.items && records.items.length > 0) {
          setFeaturedProducts(records.items);
        } else {
          setFeaturedProducts(getSampleProducts());
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setFeaturedProducts(getSampleProducts());
      }
    };
    fetchFeatured();
  }, []);

  const getImageUrl = record => {
    if (record.image) {
      return pb.files.getUrl(record, record.image);
    }
    return record.type === 'ebook' ? 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <>
      <Helmet>
        <title>Vikram Presence - Premium Ebooks & Courses</title>
        <meta name="description" content="Premium ebooks and courses for building clarity, discipline, and absolute confidence." />
      </Helmet>

      <div className="bg-[#020202] min-h-screen text-white selection:bg-[#FFD700] selection:text-black font-sans">

        {/* 1. Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#0a0a0a] to-[#020202]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center">

            {/* Cinematic Fire Animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="relative w-48 h-48 mb-8 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border border-[#FFD700]/10 shadow-[0_0_30px_rgba(255,215,0,0.1)]"></div>
              <div className="absolute inset-4 rounded-full border border-orange-500/10 shadow-[0_0_20px_rgba(255,165,0,0.15)]"></div>
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFD700]/60 to-orange-600/40 blur-[20px]"
              ></motion.div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tighter drop-shadow-lg">
              Vikram <span className="text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">Presence</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-white/80 mb-16 font-light max-w-xl mx-auto tracking-wide">
              Get clear. Build habits. Be confident.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row items-center gap-6 mb-12 w-full max-w-md mx-auto sm:max-w-none sm:w-auto">
              <Link to="/ebooks" className="w-full sm:w-auto group relative px-16 py-5 bg-transparent border border-[#FFD700]/50 rounded-full overflow-hidden transition-all duration-500 hover:border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                <div className="absolute inset-0 bg-[#FFD700]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative text-[#FFD700] font-bold uppercase tracking-[0.2em] text-sm group-hover:dark:text-[#FFD700]">EBOOKS</span>
              </Link>

              <Link to="/courses" className="w-full sm:w-auto group relative px-16 py-5 bg-transparent border border-[#FFD700]/50 rounded-full overflow-hidden transition-all duration-500 hover:border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                <div className="absolute inset-0 bg-[#FFD700]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative text-[#FFD700] font-bold uppercase tracking-[0.2em] text-sm">COURSES</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2. Explore Shop Flow */}
        <section className="py-24 bg-[#050505] relative border-t border-white/5">
          <div className="container mx-auto px-6 text-center">
            <ScrollReveal>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="inline-flex items-center px-10 py-4 bg-white/5 border border-white/20 text-white font-medium uppercase tracking-widest text-sm rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                Explore Shop <ArrowRight size={16} className={`ml-3 transition-transform duration-300 ${showCategories ? 'rotate-90' : ''}`} />
              </button>
            </ScrollReveal>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mt-16 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                    <Link to="/ebooks" className="group p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#FFD700]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#FFD700]/10 transition-colors duration-500">
                        <Book className="text-white/70 group-hover:text-[#FFD700] transition-colors duration-500" size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Only Ebooks</h3>
                      <p className="text-gray-400 text-sm font-light">Deep written frameworks.</p>
                    </Link>

                    <Link to="/courses" className="group p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#FFD700]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#FFD700]/10 transition-colors duration-500">
                        <MonitorPlay className="text-white/70 group-hover:text-[#FFD700] transition-colors duration-500" size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Only Courses</h3>
                      <p className="text-gray-400 text-sm font-light">Video modules and guides.</p>
                    </Link>

                    <Link to="/shop" className="group p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#FFD700]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#FFD700]/10 transition-colors duration-500">
                        <Layers className="text-white/70 group-hover:text-[#FFD700] transition-colors duration-500" size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Ebooks + Courses</h3>
                      <p className="text-gray-400 text-sm font-light">View the entire collection.</p>
                    </Link>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 3. Featured Products */}
        <section className="py-32 bg-[#020202]">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Featured Products</h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
              {featuredProducts.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 100}>
                  <Link to={`/product/${product.id}`} className="block group h-full">
                    <div className="bg-[#080808] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700]/40 shadow-lg hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] h-full flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500 z-10"></div>
                        <img src={getImageUrl(product)} alt={product.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-4 py-1.5 bg-black/90 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                            {product.type === 'ebook' ? 'Ebook' : 'Course'}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors duration-300">{product.title}</h3>
                        <p className="text-gray-400 text-sm font-light line-clamp-3 mb-8 flex-grow leading-relaxed">{product.description}</p>
                        <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                          <span className="text-xl font-bold text-white">₹{product.price}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                            View Details <ArrowRight size={14} className="ml-2" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
