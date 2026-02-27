
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Layers, Loader2 } from 'lucide-react';
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Digital Store</h1>
            <p className="text-lg text-white max-w-2xl mx-auto font-light">
              Premium resources designed to help you build discipline and find clarity.
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`group flex items-center justify-center space-x-3 p-6 rounded-2xl border transition-all duration-300 ${activeFilter === cat.id
                    ? 'bg-[#FFD700]/20 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.4)]'
                    : 'bg-[#0a0a0a] border-[#FFD700]/30 hover:border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                  }`}
              >
                <cat.icon className={activeFilter === cat.id ? 'text-[#FFD700]' : 'text-[#FFD700]/70 group-hover:text-[#FFD700]'} size={24} />
                <span className={`font-bold uppercase tracking-widest text-sm ${activeFilter === cat.id ? 'text-[#FFD700]' : 'text-white'}`}>
                  {cat.title}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
              <p>Error loading products: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 text-white">
              <p className="text-xl">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 25px rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)' }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-[#080808] border rounded-2xl overflow-hidden transition-colors duration-500 hover:-translate-y-1 flex flex-col h-full group relative"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img
                      src={getImageUrl(product)}
                      alt={product.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-[#FFD700]/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#FFD700] shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        {product.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors drop-shadow-sm line-clamp-1">{product.title}</h3>
                    <p className="text-white text-sm font-light line-clamp-2 mb-8 flex-grow">{product.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-white">₹{product.price}</span>
                      <div className="flex space-x-3">
                        <Link
                          to={`/product/${product.id}`}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/product/${product.id}`}
                          className="px-6 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
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
