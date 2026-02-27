import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Vikram Presence - Premium Digital Products</title>
        <meta name="description" content="Vikram Presence helps you build clarity, discipline, and confidence through practical ebooks and structured courses." />
      </Helmet>

      <div className="bg-[#020202] min-h-screen text-white pt-32 pb-24 font-sans selection:bg-[#FFD700] selection:text-black">
        <div className="container mx-auto px-6 max-w-4xl">

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 25px rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.4)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-24 border border-white/5 rounded-3xl p-10 bg-[#0a0a0a] shadow-[0_0_30px_rgba(255,215,0,0.05)]"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-white">Who We Are</h1>
            <div className="w-16 h-1 bg-[#FFD700] mx-auto mb-10 shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>

            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
              Vikram Presence helps people build clarity, discipline, and confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-gray-300 mb-24 space-y-8"
          >
            <p>
              The internet is full of noise. We believe in a different approach—a <strong>calm</strong>, <strong>honest</strong>, and <strong>human</strong> approach.
            </p>

            <p>
              We focus entirely on practical <span className="text-[#FFD700] font-bold">Ebooks</span> and structured <span className="text-[#FFD700] font-bold">Courses</span>. No exaggeration. No fake promises. Just the exact frameworks needed to untangle your mind and start taking meaningful action. Everything is designed for real life improvement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Target, title: "Clarity", desc: "Understand exactly what you need to do." },
              { icon: Activity, title: "Discipline", desc: "Build habits that stick for good." },
              { icon: Shield, title: "Confidence", desc: "Act with unshakeable certainty." }
            ].map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 25px rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.3)' }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                className="bg-[#080808] border border-white/5 p-8 rounded-2xl text-center group transition-colors duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FFD700]/10 group-hover:border-[#FFD700]/30 transition-all duration-500">
                  <val.icon className="text-white/60 group-hover:text-[#FFD700] transition-colors duration-500" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors duration-300">{val.title}</h3>
                <p className="text-sm text-gray-400 font-light">{val.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 35px rgba(255,215,0,0.2)', borderColor: 'rgba(255,215,0,0.5)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-[#0a0a0a] border border-[#FFD700]/30 p-12 md:p-16 rounded-3xl text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tighter">Ready to Begin?</h2>
            <p className="text-gray-300 font-light mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore our collection of ebooks for deep study, and our video courses for step-by-step guidance.
            </p>
            <Link to="/shop" className="inline-block px-10 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-[0.2em] text-sm rounded-full hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105 active:scale-95">
              Explore The Shop
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default AboutPage;
