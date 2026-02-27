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
          ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-white/5 py-4'
          : 'bg-transparent py-6'
        }`}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo with static yellow glow */}
          <Link to="/" className="flex items-center space-x-3 group">
            <AnimatedLogo
              className="w-10 h-10 text-white transition-all duration-300 group-hover:text-[#FFD700]"
              style={{ filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))' }}
            />
            <span
              className="text-xl font-bold tracking-widest uppercase hidden sm:block"
              style={{
                color: '#ffffff',
                textShadow: '0 0 10px #ffcc00',
              }}
            >
              Vikram Presence
            </span>
          </Link>

          {/* Desktop Nav — 4 links, no auth */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white/90 hover:text-[#FFD700] transition-all duration-300 text-xs uppercase tracking-widest relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFD700] transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#FFD700] transition-colors z-50 relative"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-transform duration-500 ease-in-out md:hidden flex flex-col justify-center items-center ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex flex-col space-y-8 text-center w-full px-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white text-2xl uppercase tracking-widest hover:text-[#FFD700] transition-all duration-300"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;