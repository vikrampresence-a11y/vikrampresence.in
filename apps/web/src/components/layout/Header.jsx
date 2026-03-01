import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext.jsx';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, currentUser, isAdmin } = useAuth();

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

            {!isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-8 ml-2">
                <Link to="/login" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors duration-300">
                  Login
                </Link>
                <Link
                  to="/shop"
                  className="px-5 py-2 bg-[#E2F034] text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 hover:shadow-[0_0_24px_rgba(226,240,52,0.3)]"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6 border-l border-white/10 pl-8 ml-2 relative">
                <div
                  className="relative"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E2F034]/10 border border-[#E2F034]/30 text-[#E2F034] hover:bg-[#E2F034]/20 transition-colors">
                    <User size={16} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-white/10 mb-2">
                          <p className="text-white text-xs font-bold truncate">{currentUser?.email}</p>
                        </div>

                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <ShieldCheck size={14} /> Admin Portal
                          </Link>
                        )}
                        <Link to="/my-products" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#E2F034] transition-colors">
                          <Package size={14} /> My Products
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/shop"
                  className="px-5 py-2 bg-[#E2F034] text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 hover:shadow-[0_0_24px_rgba(226,240,52,0.3)]"
                >
                  Shop
                </Link>
              </div>
            )}
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

              {!isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="pt-6 border-t border-white/10 flex flex-col gap-4 items-center"
                >
                  <Link
                    to="/login"
                    className="text-white hover:text-[#E2F034] font-semibold tracking-tight transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-block px-10 py-3.5 bg-[#E2F034] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#d4e22e] transition-all duration-300"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="pt-6 border-t border-white/10 flex flex-col gap-6 items-center"
                >
                  <Link to="/my-products" className="text-white flex items-center gap-2 hover:text-[#E2F034] font-semibold transition-colors duration-300">
                    <Package size={18} /> My Products
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-white flex items-center gap-2 hover:text-blue-400 font-semibold transition-colors duration-300">
                      <ShieldCheck size={18} /> Admin Portal
                    </Link>
                  )}
                  <button onClick={logout} className="text-red-400 flex items-center gap-2 hover:text-red-300 font-semibold transition-colors duration-300">
                    <LogOut size={18} /> Logout
                  </button>
                  <Link
                    to="/shop"
                    className="inline-block px-10 py-3.5 bg-[#E2F034] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 mt-2"
                  >
                    Shop More
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;