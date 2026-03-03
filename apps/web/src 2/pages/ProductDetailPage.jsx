
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft, ShieldCheck, Zap, Mail, Star, CreditCard, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';
import RazorpayCheckout from '@/components/features/RazorpayCheckout.jsx';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allProducts = await getAllProducts();
        const found = allProducts.find((p) => p.id === id);

        if (!found) {
          setError('Product not found');
          setIsLoading(false);
          return;
        }

        const normalizedProduct = {
          ...found,
          price: found.price || (found.pricePaise ? Math.round(found.pricePaise / 100) : 0),
          image: found.coverImageUrl || found.image || '',
          googleDriveLink: found.driveLink || found.googleDriveLink || '',
          description: found.description || '',
        };

        setProduct(normalizedProduct);

        const related = allProducts
          .filter((p) => p.type === found.type && p.id !== found.id)
          .slice(0, 3)
          .map((p) => ({
            ...p,
            price: p.price || (p.pricePaise ? Math.round(p.pricePaise / 100) : 0),
            image: p.coverImageUrl || p.image || '',
          }));
        setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handlePaymentSuccess = (data) => {
    navigate('/thank-you', {
      state: {
        productName: data.productName,
        googleDriveLink: data.googleDriveLink,
      },
    });
  };

  const getImageUrl = (item) => {
    if (item?.coverImageUrl) return item.coverImageUrl;
    if (item?.image) return item.image;
    return item?.type === 'ebook'
      ? 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-0)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#E2F034]/60 animate-spin" />
          </div>
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
          <Link to="/shop" className="text-[#E2F034] hover:underline text-[11px] uppercase tracking-[0.15em]">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const benefitsList = product.benefits ? product.benefits.split(',').map(b => b.trim()).slice(0, 5) : [
    "Instant digital delivery to your inbox",
    "Lifetime access — no expiry",
    "Premium quality content",
    "Mobile & desktop friendly",
    "Actionable frameworks & strategies",
  ];

  // Strikethrough price (perceived value)
  const originalPrice = Math.round(product.price * 2.5);

  // Short desc for SEO meta only — never shown on page
  const metaDesc = product.description && product.description.length > 160
    ? product.description.substring(0, 160) + '…'
    : product.description;

  return (
    <>
      <Helmet>
        <title>{product.title} | Vikram Presence</title>
        <meta name="description" content={metaDesc} />
      </Helmet>

      <div className="min-h-screen text-white pt-24 pb-16 font-sans relative overflow-hidden" style={{ background: 'var(--surface-0)' }}>
        {/* Ambient background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#E2F034]/[0.02] blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/shop" className="inline-flex items-center text-white/30 hover:text-[#E2F034] transition-all duration-300 mb-6 text-[11px] uppercase tracking-[0.12em] font-medium interactive-hover gap-1.5">
              <ArrowLeft size={13} /> Back to Shop
            </Link>
          </motion.div>

          {/* ═══ BUY NOW SECTION: Image (16:9) + Key Info + Checkout ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

            {/* LEFT — Product Image Slider (16:9 ratio with glowing tail) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video rounded-2xl p-[2px] group overflow-hidden"
            >
              {/* Glowing tail background animate-spin */}
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,0,0,0.8)_360deg)] animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_180deg,transparent_0_340deg,rgba(226,240,52,0.4)_360deg)] animate-[spin_3s_linear_infinite]" />

              <div className="absolute inset-[2px] rounded-[14px] overflow-hidden glass-card-premium bg-[#050505]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={getImageUrl(product)}
                    alt={`${product.title} slide ${currentSlide + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: "contrast(1.15) saturate(1.2)" }}
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <span className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E2F034] bg-black/60 backdrop-blur-md border border-[#E2F034]/20 shadow-[0_0_10px_rgba(226,240,52,0.15)]">
                    {product.type}
                  </span>
                </div>

                {/* Slider Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <button onClick={(e) => { e.preventDefault(); setCurrentSlide(prev => prev === 0 ? 2 : prev - 1); }} className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setCurrentSlide(prev => prev === 2 ? 0 : prev + 1); }} className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Dots indicator for 3 slides */}
                <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
                  {[0, 1, 2].map(idx => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-1.5 h-1.5 rounded-full transition-all ${currentSlide === idx ? 'bg-[#E2F034] w-3 scale-110 shadow-[0_0_5px_rgba(226,240,52,0.8)]' : 'bg-white/30 hover:bg-white/50'}`} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Buy Now: Title + Price + Key Points + Checkout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Label */}
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E2F034]/70 bg-[#E2F034]/[0.06] border border-[#E2F034]/15 px-3 py-1.5 rounded-full inline-block">
                  {product.type === 'course' ? '🎓 Online Course' : '📖 Digital Ebook'}
                </span>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white leading-[1.1]">{product.title}</h1>

                {/* Price — Prominent */}
                <div className="flex items-baseline gap-4">
                  <div className="text-4xl font-black text-[#E2F034]" style={{ textShadow: '0 0 30px rgba(226,240,52,0.15)' }}>
                    ₹{product.price}
                  </div>
                  {originalPrice > product.price && (
                    <>
                      <div className="text-lg text-white/20 line-through font-light">
                        ₹{originalPrice}
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="text-[10px] font-bold uppercase tracking-wider text-green-400/80 bg-green-400/[0.08] border border-green-400/15 px-3 py-1 rounded-full"
                      >
                        {Math.round((1 - product.price / originalPrice) * 100)}% Off
                      </motion.span>
                    </>
                  )}
                </div>

                {/* Key Benefits (Buy Now section — main bullet points) */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <p className="text-white/40 text-xs uppercase tracking-[0.15em] font-semibold mb-1">What you get:</p>
                  {benefitsList.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 text-white/60 text-sm"
                    >
                      <CheckCircle size={14} className="text-[#E2F034]/60 shrink-0" />
                      <span className="font-light">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ═══ CHECKOUT ═══ */}
              <div className="mt-6">
                <RazorpayCheckout
                  product={product}
                  onSuccess={handlePaymentSuccess}
                  className="w-full"
                />
              </div>

              {/* Trust Signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-5 mt-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="flex items-center gap-1.5 text-white/25 text-[10px] uppercase tracking-[0.1em] font-medium"><ShieldCheck size={12} className="text-[#E2F034]/40" /> Secure</span>
                <span className="flex items-center gap-1.5 text-white/25 text-[10px] uppercase tracking-[0.1em] font-medium"><Zap size={12} className="text-[#E2F034]/40" /> Instant Access</span>
                <span className="flex items-center gap-1.5 text-white/25 text-[10px] uppercase tracking-[0.1em] font-medium"><Mail size={12} className="text-[#E2F034]/40" /> Email Delivery</span>
              </motion.div>
            </motion.div>
          </div>

          {/* ═══ FULL DETAILS SECTION ═══ */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border-t border-white/[0.04] pt-12 mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#E2F034]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">About This {product.type === 'course' ? 'Course' : 'Ebook'}</h2>
              </div>
              <div className="glass-card p-6 md:p-10 rounded-2xl bg-[#090909] border border-white/[0.03] shadow-2xl relative">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2F034]/30 to-transparent" />
                <div className="text-white/75 text-[15px] sm:text-base leading-relaxed tracking-wide font-light space-y-4">
                  {product.description.split('\n').map((paragraph, idx) =>
                    paragraph.trim() ? (
                      <p key={idx} className="relative z-10">{paragraph}</p>
                    ) : (
                      <div key={idx} className="h-2" />
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-white/[0.04] pt-12"
            >
              <h2 className="text-lg font-semibold mb-8 tracking-tight text-white/80">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedProducts.map((rel, idx) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <Link to={`/product/${rel.id}`} className="group block">
                      <div className="glass-card rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 card-3d">
                        {/* 16:9 for related products too */}
                        <div className="aspect-video overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                          <img
                            src={getImageUrl(rel)}
                            alt={rel.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#E2F034] transition-colors line-clamp-1">{rel.title}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-white">₹{rel.price}</span>
                            <span className="text-[11px] text-white/15 line-through">₹{Math.round(rel.price * 2.5)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
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
