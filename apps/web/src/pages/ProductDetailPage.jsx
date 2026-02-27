
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
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
        <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/shop" className="text-[#FFD700] hover:underline">Return to Shop</Link>
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

          <Link to="/shop" className="inline-flex items-center text-white hover:text-[#FFD700] transition-colors mb-10 text-sm uppercase tracking-widest font-bold">
            <ArrowLeft size={16} className="mr-2" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-[#FFD700]/20 shadow-[0_0_40px_rgba(255,215,0,0.15)]"
            >
              <img
                src={getImageUrl(product)}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="px-4 py-2 bg-black/80 backdrop-blur-md border border-[#FFD700]/50 rounded-full text-xs font-bold uppercase tracking-widest text-[#FFD700] shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                  {product.type}
                </span>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{product.title}</h1>

              <div className="flex items-center mb-8">
                <div className="text-3xl font-bold text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">₹{product.price}</div>
                {product.duration && (
                  <div className="ml-6 flex items-center text-white/70 text-sm font-bold uppercase tracking-widest">
                    <Clock size={16} className="mr-2" /> {product.duration}
                  </div>
                )}
              </div>

              <div className="prose prose-invert mb-10">
                <p className="text-white text-lg font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-12">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">Key Benefits</h3>
                <ul className="space-y-4">
                  {benefitsList.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="text-[#FFD700] mr-3 shrink-0 mt-0.5" size={20} />
                      <span className="text-white font-light">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {learningList.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">What You'll Learn</h3>
                  <ul className="space-y-4">
                    {learningList.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] mr-4 shrink-0 mt-2 shadow-[0_0_5px_rgba(255,215,0,0.8)]"></div>
                        <span className="text-white font-light">{item}</span>
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

              <div className="mt-6 flex items-center justify-center sm:justify-start text-white/60 text-xs uppercase tracking-widest">
                <ShieldCheck size={14} className="mr-2 text-[#FFD700]" /> Secure One-Time Payment
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-white/10 pt-20"
            >
              <h2 className="text-2xl font-bold mb-10 tracking-tighter text-white">Similar Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProducts.map((rel) => (
                  <Link key={rel.id} to={`/product/${rel.id}`} className="group">
                    <div className="bg-[#0a0a0a] border border-[#FFD700]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={getImageUrl(rel)}
                          alt={rel.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors line-clamp-1">{rel.title}</h3>
                        <span className="text-lg font-bold text-white">₹{rel.price}</span>
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
