
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DirectCheckoutButton from '@/components/features/DirectCheckoutButton';

const DRIVE_LINK = 'https://drive.google.com/drive/folders/1-fJ109sF0WJNRv3geArVKehGHE2SQ0zW?usp=drive_link';

// Hardcoded ebook product — ₹1 for testing
const ebook = {
  id: 'vikram-presence-ebook',
  title: 'The Vikram Presence',
  subtitle: 'The Internal Blueprint for Control, Dominance & Monetization',
  description: 'Content Creation: Mastering internal systems, mindset, algorithm psychology, authority positioning, and monetization frameworks for unfair advantage.',
  price: 1,         // ₹1 for testing
  pricePaise: 100,  // 100 paise = ₹1
  driveLink: DRIVE_LINK,
  image: '/ebooks/vikram-presence-cover.png',
};

const EbooksPage = () => {
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

          {/* Featured Ebook — Single Product */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="rounded-3xl overflow-hidden border-2 border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-500"
              style={{
                backgroundColor: '#0a0a0a',
                boxShadow: '0 0 40px rgba(255, 204, 0, 0.15)',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                {/* Cover Image — No white background */}
                <div
                  className="relative flex items-center justify-center p-8 md:p-12"
                  style={{ backgroundColor: '#0a0a0a' }}
                >
                  <img
                    src={ebook.image}
                    alt={ebook.title}
                    className="w-full max-w-xs md:max-w-sm rounded-lg object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(255, 204, 0, 0.3))',
                      backgroundColor: 'transparent',
                    }}
                    onError={(e) => {
                      // Fallback if image not found
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-black/80 backdrop-blur-md border border-[#FFD700]/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
                      EBOOK
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2
                    className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight"
                    style={{ color: '#FFD700', textShadow: '0 0 15px rgba(255, 204, 0, 0.3)' }}
                  >
                    {ebook.title}
                  </h2>
                  <p className="text-sm text-gray-400 uppercase tracking-widest mb-6 font-bold">
                    {ebook.subtitle}
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-8 font-light">
                    {ebook.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-white">₹{ebook.price}</span>
                    <span className="text-gray-500 text-sm ml-2 line-through">₹499</span>
                    <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full">
                      Test Price
                    </span>
                  </div>

                  {/* Direct Checkout — Razorpay → Drive Link */}
                  <DirectCheckoutButton
                    productName={ebook.title}
                    pricePaise={ebook.pricePaise}
                    driveLink={ebook.driveLink}
                  />

                  <p className="text-gray-500 text-xs mt-6 text-center">
                    Instant access after payment. No login required.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default EbooksPage;
