
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft, ShieldCheck, Zap, Mail, Star, CreditCard } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';
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

  const benefitsList = product.benefits ? product.benefits.split(',').map(b => b.trim()).slice(0, 3) : [
    "Instant digital delivery to your inbox",
    "Lifetime access — no expiry",
    "Premium quality content"
  ];

  // Strikethrough price (perceived value)
  const originalPrice = Math.round(product.price * 2.5);

  // Truncate long descriptions
  const shortDesc = product.description && product.description.length > 120
    ? product.description.substring(0, 120) + '…'
    : product.description;

  return (
    <>
      <Helmet>
        <title>{product.title} | Vikram Presence</title>
        <meta name="description" content={shortDesc} />
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

          {/* ═══ HERO: Image + Info + BIG BUY BUTTON ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

            {/* LEFT — Product Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square rounded-2xl overflow-hidden glass-card-premium group"
            >
              <img
                src={getImageUrl(product)}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 bg-black/50 backdrop-blur-md border border-white/10">
                  {product.type}
                </span>
              </div>
            </motion.div>

            {/* RIGHT — Title + Price + BIG BUY BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between"
            >
              <div className="space-y-5">
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

                {/* Short Description */}
                {shortDesc && (
                  <p className="text-white/30 text-sm font-light leading-relaxed line-clamp-2">
                    {shortDesc}
                  </p>
                )}

                {/* Benefits */}
                <div className="flex flex-col gap-2.5 pt-1">
                  {benefitsList.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 text-white/40 text-sm"
                    >
                      <CheckCircle size={14} className="text-[#E2F034]/50 shrink-0" />
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

              {/* Trust Signals — glass background */}
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
                        <div className="aspect-[4/3] overflow-hidden relative">
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
