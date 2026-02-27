
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const CoursesPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const records = await pb.collection('products').getFullList({
          filter: 'type="course"',
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
  }, []);

  const getImageUrl = (record) => {
    if (record.image) {
      return pb.files.getUrl(record, record.image);
    }
    return 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <>
      <Helmet>
        <title>Online Courses for Personal Growth | Vikram Presence</title>
        <meta name="description" content="Join structured online courses designed to help you grow. 30-Day Clarity Challenge, Discipline Bootcamp, and more." />
        <meta name="keywords" content="online courses, personal growth, self-improvement, discipline, confidence" />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <Link to="/" className="inline-flex items-center text-white hover:text-[#FFD700] transition-colors mb-10 text-sm uppercase tracking-widest font-bold">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Our Courses</h1>
            <p className="text-lg text-white max-w-2xl mx-auto font-light">
              Step-by-step guides to change your life for the better.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
              <p>Error loading courses: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 text-white">
              <p className="text-xl">No courses found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.map((product, index) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#0a0a0a] border border-[#FFD700]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:-translate-y-1 flex flex-col h-full group"
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
                        COURSE
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors drop-shadow-sm line-clamp-1">{product.title}</h3>
                    <p className="text-white text-sm font-light line-clamp-2 mb-8 flex-grow">
                      {product.description}
                    </p>
                    
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
                          className="px-4 py-2 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors shadow-[0_0_15px_rgba(255,215,0,0.4)]"
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

export default CoursesPage;
