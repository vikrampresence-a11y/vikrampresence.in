
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft, ShieldCheck, Clock, Zap, Mail } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import RazorpayCheckout from '@/components/features/RazorpayCheckout.jsx';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      if (id.startsWith('sample-')) {
        const dummyProduct = {
          id: id,
          title: id === 'sample-1' ? 'Habit Mastery Ebook' : id === 'sample-2' ? 'Confidence Builder Course' : 'The Clarity Journal',
          description: 'A comprehensive guide to building lasting habits and breaking bad ones naturally. This is a sample product.',
          price: id === 'sample-1' ? 499 : id === 'sample-2' ? 1499 : 899,
          type: id.includes('2') ? 'course' : 'ebook',
          googleDriveLink: 'https://drive.google.com/drive/folders/sample-dummy-link',
          image: ''
        };
        setProduct(dummyProduct);
        setRelatedProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const record = await pb.collection('products').getOne(id, { $autoCancel: false });
        setProduct(record);

        // Fetch related
        const related = await pb.collection('products').getList(1, 3, {
          filter: `type="${record.type}" && id!="${record.id}"`,
          $autoCancel: false
        });
        setRelatedProducts(related.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handlePaymentSuccess = (orderId) => {
    navigate('/thank-you', { state: { orderId } });
  };

  const getImageUrl = (record) => {
    if (record?.image) {
      return pb.files.getUrl(record, record.image);
    }
    return record?.type === 'ebook'
      ? 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <Link to="/shop" className="text-[#FFD700] hover:underline text-sm uppercase tracking-widest">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const benefitsList = product.benefits ? product.benefits.split(',').map(b => b.trim()) : [
    "Eliminate cognitive friction and overthinking.",
    "Build systems for unshakeable daily discipline.",
    "Develop genuine confidence through action."
  ];

  const learningList = product.whatYouLearn ? product.whatYouLearn.split(',').map(l => l.trim()) : [];

  return (
    <>
      <Helmet>
        <title>{product.title} | Vikram Presence</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans">
        <div className="container mx-auto px-6 max-w-6xl">

          <Link to="/shop" className="inline-flex items-center text-white/50 hover:text-[#FFD700] transition-colors mb-10 text-[11px] uppercase tracking-[0.15em] font-medium">
            <ArrowLeft size={14} className="mr-2" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mb-28">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden glass-card"
              style={{ boxShadow: '0 0 40px rgba(255,215,0,0.08)' }}
            >
              <img
                src={getImageUrl(product)}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="px-4 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white/80">
                  {product.type}
                </span>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-5 tracking-tighter text-white">{product.title}</h1>

              <div className="flex items-center mb-7">
                <div className="text-3xl font-bold text-[#FFD700]" style={{ textShadow: '0 0 20px rgba(255,215,0,0.2)' }}>₹{product.price}</div>
                {product.duration && (
                  <div className="ml-5 flex items-center text-white/40 text-[11px] font-medium uppercase tracking-widest">
                    <Clock size={14} className="mr-1.5" /> {product.duration}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <p className="text-white/50 text-base font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-[11px] font-semibold text-white/60 mb-4 uppercase tracking-[0.15em]">Key Benefits</h3>
                <ul className="space-y-3">
                  {benefitsList.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="text-[#FFD700]/70 mr-3 shrink-0 mt-0.5" size={16} />
                      <span className="text-white/60 font-light text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {learningList.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-[11px] font-semibold text-white/60 mb-4 uppercase tracking-[0.15em]">What You'll Learn</h3>
                  <ul className="space-y-3">
                    {learningList.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-1 h-1 rounded-full bg-[#FFD700]/50 mr-3 shrink-0 mt-2" />
                        <span className="text-white/60 font-light text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <RazorpayCheckout
                  product={product}
                  onSuccess={handlePaymentSuccess}
                  className="w-full sm:w-auto"
                />
              </div>

              {/* Trust Signals */}
              <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/30 text-[10px] uppercase tracking-[0.12em]">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#FFD700]/50" /> Secure Payment</span>
                <span className="flex items-center gap-1.5"><Zap size={12} className="text-[#FFD700]/50" /> Instant Access</span>
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#FFD700]/50" /> Email Delivery</span>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-white/[0.04] pt-16"
            >
              <h2 className="text-xl font-semibold mb-8 tracking-tight text-white">Similar Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <Link key={rel.id} to={`/product/${rel.id}`} className="group">
                    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)]">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <img
                          src={getImageUrl(rel)}
                          alt={rel.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-[#FFD700] transition-colors line-clamp-1">{rel.title}</h3>
                        <span className="text-base font-bold text-white">₹{rel.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
