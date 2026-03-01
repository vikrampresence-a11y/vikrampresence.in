import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    <>
      <header className={`floating-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#E2F034] transition-colors duration-300">
              Vikram Presence
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] font-medium transition-colors duration-300 ${location.pathname === link.path
                    ? 'text-[#E2F034]'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/shop"
              className="px-5 py-2 bg-[#E2F034] text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 hover:shadow-[0_0_24px_rgba(226,240,52,0.3)]"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#E2F034] transition-colors z-50 relative"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#060610]/98 backdrop-blur-2xl z-[90] flex flex-col justify-center items-center md:hidden"
          >
            <div className="flex flex-col space-y-8 text-center w-full px-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    className={`text-3xl font-semibold tracking-tight transition-colors duration-300 ${location.pathname === link.path
                        ? 'text-[#E2F034]'
                        : 'text-white hover:text-[#E2F034]'
                      }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="pt-6 border-t border-white/10"
              >
                <Link
                  to="/shop"
                  className="inline-block px-10 py-3.5 bg-[#E2F034] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#d4e22e] transition-all duration-300"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;