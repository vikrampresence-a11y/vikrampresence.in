import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AnimatedLogo from '../shared/AnimatedLogo.jsx';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.06] py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <AnimatedLogo
              className="w-9 h-9 text-white transition-all duration-300 group-hover:text-[#FFD700]"
              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' }}
            />
            <span className="text-lg font-semibold tracking-[0.15em] uppercase hidden sm:block text-white group-hover:text-[#FFD700] transition-colors duration-300">
              Vikram Presence
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] uppercase tracking-[0.15em] font-medium relative group py-2 transition-colors duration-300 ${location.pathname === link.path ? 'text-[#FFD700]' : 'text-white/70 hover:text-white'
                  }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-[1px] bg-[#FFD700] transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
              </Link>
            ))}
            {/* Shop CTA */}
            <Link
              to="/shop"
              className="px-5 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#FFD700] transition-colors z-50 relative"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-in-out md:hidden flex flex-col justify-center items-center ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
            }`}
        >
          <div className="flex flex-col space-y-6 text-center w-full px-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-2xl font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${location.pathname === link.path ? 'text-[#FFD700]' : 'text-white hover:text-[#FFD700]'
                  }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
            {/* Mobile Shop CTA */}
            <div className="pt-4 border-t border-white/10">
              <Link
                to="/shop"
                className="inline-block px-8 py-3 bg-[#FFD700] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-yellow-400 transition-all duration-300 animate-pulse-gold"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;