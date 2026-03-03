import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import AboutVikram from '@/components/sections/AboutVikram.jsx';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Vikram Presence - Premium Digital Products</title>
        <meta name="description" content="Vikram Presence helps you build clarity, discipline, and confidence through practical ebooks and structured courses." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24 font-sans selection:bg-[#FFD700] selection:text-black">
        <div className="container mx-auto px-6 max-w-4xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20 glass-card rounded-2xl p-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-white">Who We Are</h1>
            <div className="w-10 h-[2px] bg-[#FFD700] mx-auto mb-8 opacity-60" />

            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
              Vikram Presence helps people build clarity, discipline, and confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-none font-light leading-relaxed text-white/40 mb-20 space-y-6 text-base"
          >
            <p>
              The internet is full of noise. We believe in a different approach—a <strong className="text-white/70">calm</strong>, <strong className="text-white/70">honest</strong>, and <strong className="text-white/70">human</strong> approach.
            </p>

            <p>
              We focus entirely on practical <span className="text-[#FFD700] font-medium">Ebooks</span> and structured <span className="text-[#FFD700] font-medium">Courses</span>. No exaggeration. No fake promises. Just the exact frameworks needed to untangle your mind and start taking meaningful action. Everything is designed for real life improvement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { icon: Target, title: "Clarity", desc: "Understand exactly what you need to do." },
              { icon: Activity, title: "Discipline", desc: "Build habits that stick for good." },
              { icon: Shield, title: "Confidence", desc: "Act with unshakeable certainty." }
            ].map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-7 rounded-2xl text-center group transition-all duration-500 hover:border-[#FFD700]/20"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#FFD700]/10 transition-colors duration-500">
                  <val.icon className="text-white/40 group-hover:text-[#FFD700] transition-colors duration-500" size={22} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300">{val.title}</h3>
                <p className="text-sm text-white/30 font-light">{val.desc}</p>
              </motion.div>
            ))}
          </div>

          <AboutVikram />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-10 md:p-14 text-center mt-20"
            style={{ borderColor: 'rgba(255, 215, 0, 0.15)', boxShadow: '0 0 40px rgba(255, 215, 0, 0.05)' }}
          >
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">Ready to Begin?</h2>
            <p className="text-white/40 font-light mb-8 max-w-xl mx-auto text-base leading-relaxed">
              Explore our collection of ebooks for deep study, and our video courses for step-by-step guidance.
            </p>
            <Link to="/shop" className="inline-block px-8 py-3.5 bg-[#FFD700] text-black font-bold uppercase tracking-[0.2em] text-[12px] rounded-full hover:bg-yellow-400 transition-all duration-300 shimmer-btn animate-pulse-gold">
              Explore The Shop
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default AboutPage;
