
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft, ShieldCheck, Clock, Zap, Mail, Star, BookOpen } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-0)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FFD700]/60 animate-spin" />
          <p className="text-white/20 text-[11px] uppercase tracking-[0.15em]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: 'var(--surface-0)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Product not found</h2>
          <Link to="/shop" className="text-[#FFD700] hover:underline text-[11px] uppercase tracking-[0.15em]">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const benefitsList = product.benefits ? product.benefits.split(',').map(b => b.trim()) : [
    "Eliminate cognitive friction and overthinking.",
    "Build systems for unshakeable daily discipline.",
    "Develop genuine confidence through action."
  ];

  const learningList = product.whatYouLearn ? product.whatYouLearn.split(',').map(l => l.trim()) : [
    "A proven framework for building lasting habits",
    "Mental models used by high-performers worldwide",
    "Practical daily exercises for immediate results",
    "How to overcome self-doubt and take massive action"
  ];

  // Strikethrough price (show perceived value)
  const originalPrice = Math.round(product.price * 2.5);

  return (
    <>
      <Helmet>
        <title>{product.title} | Vikram Presence</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen text-white pt-28 pb-24 font-sans" style={{ background: 'var(--surface-0)' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          <Link to="/shop" className="inline-flex items-center text-white/30 hover:text-[#FFD700] transition-colors mb-8 text-[11px] uppercase tracking-[0.12em] font-medium interactive-hover">
            <ArrowLeft size={13} className="mr-1.5" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-24">

            {/* ═══════════════════════════════════════
                LEFT COLUMN — Product Image + Context
                ═══════════════════════════════════════ */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product Image — Premium Container */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)'
                }}
              >
                <img
                  src={getImageUrl(product)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80"
                    style={{ background: 'var(--surface-1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {product.type}
                  </span>
                </div>
              </motion.div>

              {/* ── What You'll Learn — Emotional Triggers ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="checkout-card p-6 space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-[#FFD700]/60" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-[0.08em]">What You'll Learn</h3>
                </div>
                <ul className="space-y-3">
                  {learningList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-[#FFD700]/50 shrink-0 mt-0.5" />
                      <span className="text-white/45 text-[13px] font-light leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* ═══════════════════════════════════════
                RIGHT COLUMN — Details + Checkout
                ═══════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[1.1]">{product.title}</h1>

                {/* Price — With Strikethrough for Perceived Value */}
                <div className="flex items-baseline gap-4">
                  <div className="text-3xl font-bold text-[#FFD700]" style={{ textShadow: '0 0 30px rgba(255,215,0,0.15)' }}>
                    ₹{product.price}
                  </div>
                  <div className="text-lg text-white/20 line-through font-light">
                    ₹{originalPrice}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400/70 bg-green-400/[0.06] px-2.5 py-1 rounded-full">
                    {Math.round((1 - product.price / originalPrice) * 100)}% Off
                  </span>
                  {product.duration && (
                    <div className="flex items-center text-white/30 text-[11px] font-medium uppercase tracking-[0.1em]">
                      <Clock size={13} className="mr-1" /> {product.duration}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/40 text-base font-light leading-[1.75] max-w-xl">
                  {product.description}
                </p>

                {/* Key Benefits */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">Key Benefits</h3>
                  <ul className="space-y-2.5">
                    {benefitsList.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Star size={13} className="text-[#FFD700]/50 shrink-0 mt-0.5" />
                        <span className="text-white/45 text-sm font-light leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* ── Checkout ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <RazorpayCheckout
                  product={product}
                  onSuccess={handlePaymentSuccess}
                  className="w-full"
                />
              </motion.div>

              {/* Trust Signals */}
              <div className="trust-bar pt-2">
                <span><ShieldCheck size={12} className="text-[#FFD700]/40" /> Secure Payment</span>
                <span><Zap size={12} className="text-[#FFD700]/40" /> Instant Access</span>
                <span><Mail size={12} className="text-[#FFD700]/40" /> Email Delivery</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RELATED PRODUCTS
              ═══════════════════════════════════════ */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-white/[0.04] pt-14"
            >
              <h2 className="text-lg font-semibold mb-7 tracking-tight text-white/80">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {relatedProducts.map((rel) => (
                  <Link key={rel.id} to={`/product/${rel.id}`} className="group interactive-hover">
                    <div className="glass-card rounded-xl overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                        <img
                          src={getImageUrl(rel)}
                          alt={rel.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#FFD700] transition-colors line-clamp-1">{rel.title}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-white">₹{rel.price}</span>
                          <span className="text-[11px] text-white/15 line-through">₹{Math.round(rel.price * 2.5)}</span>
                        </div>
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
