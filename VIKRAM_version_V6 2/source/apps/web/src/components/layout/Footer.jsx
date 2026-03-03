import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@vikrampresence?si=S6KREibiIGo7nyYN' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/vikram_presence?igsh=eWlkbmM2N3o2Zmdk' },
    { name: 'WhatsApp', icon: MessageCircle, url: 'https://wa.me/917670926198' },
  ];

  return (
    <footer className="relative pt-20 pb-8 mt-auto gradient-border" style={{ background: 'var(--surface-0)' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E2F034]/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">

        {/* Top Row — Logo + Tagline */}
        <div className="text-center mb-14">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#E2F034]/20 group-hover:shadow-[0_0_15px_rgba(226,240,52,0.15)]">
              <span className="text-[#E2F034] text-xs font-black">VP</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-[#E2F034] transition-colors duration-300">
              Vikram Presence
            </span>
          </Link>
          <p className="text-white/25 text-sm font-light max-w-md mx-auto leading-relaxed">
            Premium digital products for clarity, discipline, and confidence.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-14">
          {['Home', 'Shop', 'Ebooks', 'Courses', 'About', 'Contact'].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-white/35 hover:text-[#E2F034] transition-all duration-300 text-[11px] uppercase tracking-[0.15em] font-medium hover:tracking-[0.2em]"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Social Icons — PRO-MAX */}
        <div className="flex justify-center space-x-4 mb-14">
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-[#E2F034] hover:border-[#E2F034]/30 hover:bg-[#E2F034]/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(226,240,52,0.1)] hover:-translate-y-1"
              aria-label={social.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <social.icon size={16} />
            </motion.a>
          ))}
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
          {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-white/15 hover:text-white/35 transition-colors text-[10px] uppercase tracking-[0.1em]"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] pt-6 text-center">
          <p className="text-white/10 text-[10px] uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} Vikram Presence · Clarity · Discipline · Confidence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
