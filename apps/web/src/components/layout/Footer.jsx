
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@vikrampresence?si=S6KREibiIGo7nyYN' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/vikram_presence?igsh=eWlkbmM2N3o2Zmdk' },
    { name: 'WhatsApp', icon: MessageCircle, url: 'https://wa.me/917670926198' },
  ];

  return (
    <footer className="bg-[#030303] border-t border-white/[0.04] pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Top Row — Logo + Tagline */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-4">
            <span className="text-xl font-semibold text-white tracking-[0.15em] uppercase group-hover:text-[#FFD700] transition-colors duration-300">
              Vikram Presence
            </span>
          </Link>
          <p className="text-white/30 text-sm font-light max-w-md mx-auto leading-relaxed">
            Premium digital products for clarity, discipline, and confidence.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {['Home', 'Shop', 'Ebooks', 'Courses', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-white/40 hover:text-[#FFD700] transition-colors text-[11px] uppercase tracking-[0.15em] font-medium"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-4 mb-12">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-[#FFD700] hover:border-[#FFD700]/30 hover:bg-[#FFD700]/5 transition-all duration-300"
              aria-label={social.name}
            >
              <social.icon size={15} />
            </a>
          ))}
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
          {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-white/20 hover:text-white/40 transition-colors text-[10px] uppercase tracking-[0.1em]"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] pt-6 text-center">
          <p className="text-white/15 text-[10px] uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} Vikram Presence · Clarity · Discipline · Confidence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
