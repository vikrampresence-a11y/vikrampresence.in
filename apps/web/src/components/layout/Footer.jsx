
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
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center space-x-3 mb-6 group inline-flex">
              <img 
                src="https://horizons-cdn.hostinger.com/b97f6cc3-989b-4f74-bc63-5ca3ca17eb47/be8b4dcc5a2a5cf25f645f196e119fda.png" 
                alt="Vikram Presence Logo" 
                className="w-10 h-10 object-contain transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))' }}
              />
              <span className="text-2xl font-bold text-white tracking-widest uppercase group-hover:text-[#FFD700] transition-colors">
                Vikram Presence
              </span>
            </Link>
            <p className="text-gray-400 text-base font-light leading-relaxed mb-8 max-w-md">
              Premium Digital Products Platform. We help you build clarity, discipline, and confidence through honest, grounded frameworks.
            </p>
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FFD700] hover:border-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Explore</h4>
            <ul className="space-y-3">
              {['Home', 'Shop', 'Ebooks', 'Courses', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-gray-400 hover:text-[#FFD700] transition-colors text-sm uppercase tracking-wider"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-gray-400 hover:text-[#FFD700] transition-colors text-sm uppercase tracking-wider"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Vikram Presence. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-4 md:mt-0">
            Clarity • Discipline • Confidence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
