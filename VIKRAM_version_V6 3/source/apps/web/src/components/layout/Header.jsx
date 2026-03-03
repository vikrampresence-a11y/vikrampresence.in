import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Package, ShieldCheck } from 'lucide-react';
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
      <header className={`floating-nav ${isScrolled ? 'scrolled animate-nav-glow' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#E2F034]/20 group-hover:shadow-[0_0_15px_rgba(226,240,52,0.15)]">
              <span className="text-[#E2F034] text-xs font-black">VP</span>
            </div>
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
                className={`relative text-[13px] font-medium transition-all duration-300 ${location.pathname === link.path
                  ? 'text-[#E2F034]'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#E2F034] rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}

            {!isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-8 ml-2">
                <Link to="/login" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors duration-300">
                  Login
                </Link>
                <Link
                  to="/shop"
                  className="relative overflow-hidden px-5 py-2 bg-[#E2F034] text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 hover:shadow-[0_0_24px_rgba(226,240,52,0.3)] group"
                >
                  <span className="relative z-10">Shop Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6 border-l border-white/10 pl-8 ml-2 relative">
                <div
                  className="relative"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E2F034]/10 border border-[#E2F034]/30 text-[#E2F034] hover:bg-[#E2F034]/20 hover:shadow-[0_0_15px_rgba(226,240,52,0.15)] transition-all duration-300">
                    <User size={16} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a18]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                          <p className="text-white text-xs font-bold truncate">{currentUser?.email}</p>
                          <p className="text-white/25 text-[9px] uppercase tracking-widest mt-0.5">Account</p>
                        </div>

                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#E2F034]/5 hover:text-[#E2F034] transition-all duration-200">
                            <ShieldCheck size={14} /> Admin Portal
                          </Link>
                        )}
                        <Link to="/my-products" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#E2F034]/5 hover:text-[#E2F034] transition-all duration-200">
                          <Package size={14} /> My Products
                        </Link>
                        <div className="border-t border-white/[0.04] mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-left"
                          >
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/shop"
                  className="relative overflow-hidden px-5 py-2 bg-[#E2F034] text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 hover:shadow-[0_0_24px_rgba(226,240,52,0.3)] group"
                >
                  <span className="relative z-10">Shop</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
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
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay — PRO-MAX */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#060610]/98 backdrop-blur-2xl z-[90] flex flex-col justify-center items-center md:hidden"
          >
            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#E2F034]/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="flex flex-col space-y-6 text-center w-full px-8 relative z-10">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.path}
                    className={`text-3xl font-semibold tracking-tight transition-colors duration-300 block py-2 ${location.pathname === link.path
                      ? 'text-[#E2F034]'
                      : 'text-white hover:text-[#E2F034]'
                      }`}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        className="h-[2px] w-12 bg-[#E2F034] mx-auto mt-2 rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              {!isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-8 border-t border-white/10 flex flex-col gap-5 items-center"
                >
                  <Link
                    to="/login"
                    className="text-white hover:text-[#E2F034] font-semibold tracking-tight transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-block px-10 py-3.5 bg-[#E2F034] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 shadow-[0_0_30px_rgba(226,240,52,0.2)]"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-8 border-t border-white/10 flex flex-col gap-6 items-center"
                >
                  <Link to="/my-products" className="text-white flex items-center gap-2 hover:text-[#E2F034] font-semibold transition-colors duration-300">
                    <Package size={18} /> My Products
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-white flex items-center gap-2 hover:text-[#E2F034] font-semibold transition-colors duration-300">
                      <ShieldCheck size={18} /> Admin Portal
                    </Link>
                  )}
                  <button onClick={logout} className="text-red-400 flex items-center gap-2 hover:text-red-300 font-semibold transition-colors duration-300">
                    <LogOut size={18} /> Logout
                  </button>
                  <Link
                    to="/shop"
                    className="inline-block px-10 py-3.5 bg-[#E2F034] text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#d4e22e] transition-all duration-300 shadow-[0_0_30px_rgba(226,240,52,0.2)] mt-2"
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