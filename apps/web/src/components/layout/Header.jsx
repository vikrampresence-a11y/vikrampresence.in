import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import AnimatedLogo from '../shared/AnimatedLogo.jsx';
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    logout
  } = useAuth();
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
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinks = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'Shop',
    path: '/shop'
  }, {
    name: 'Ebooks',
    path: '/ebooks'
  }, {
    name: 'Courses',
    path: '/courses'
  }, {
    name: 'About',
    path: '/about'
  }, {
    name: 'Contact',
    path: '/contact'
  }];
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-white/5 py-4' : 'bg-transparent py-6'}`}>
    <nav className="container mx-auto px-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <AnimatedLogo
            className="w-10 h-10 text-white transition-all duration-300 group-hover:text-[#FFD700]"
            style={{ filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))' }}
          />
          <span className="text-xl font-bold text-white tracking-widest uppercase hidden sm:block group-hover:text-[#FFD700] transition-colors drop-shadow-md">
            Vikram Presence
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map(link => <Link key={link.name} to={link.path} className="text-white/90 hover:text-[#FFD700] hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] transition-all duration-300 text-xs uppercase tracking-widest relative group py-2">
            {link.name}
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFD700] transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(255,215,0,0.8)]"></span>
          </Link>)}

          <div className="w-px h-4 bg-white/20 mx-2"></div>

          {!isAuthenticated ? <div className="flex items-center space-x-4">
            <Link to="/login" className="text-white/50 hover:text-[#FFD700] transition-colors text-[10px] uppercase tracking-widest">
              Admin Login
            </Link>
          </div> : <div className="flex items-center space-x-4">
            {isAdmin ? <Link to="/admin" className="flex items-center text-[#FFD700] hover:text-white transition-colors text-xs uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
              <LayoutDashboard size={14} className="mr-1" /> Dashboard
            </Link> : <span className="flex items-center text-white/80 text-xs uppercase tracking-widest">
              <User size={14} className="mr-1" /> Account
            </span>}
            <button onClick={handleLogout} className="flex items-center text-white/50 hover:text-red-400 transition-colors text-xs uppercase tracking-widest">
              <LogOut size={14} className="mr-1" /> Logout
            </button>
          </div>}
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white hover:text-[#FFD700] transition-colors z-50 relative" aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-transform duration-500 ease-in-out md:hidden flex flex-col justify-center items-center ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-8 text-center w-full px-6">
          {navLinks.map((link, index) => <Link key={link.name} to={link.path} className="text-white text-2xl uppercase tracking-widest hover:text-[#FFD700] hover:drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] transition-all duration-300" style={{
            transitionDelay: `${index * 50}ms`
          }}>
            {link.name}
          </Link>)}

          <div className="w-16 h-px bg-white/20 mx-auto my-4"></div>

          {!isAuthenticated ? <Link to="/login" className="text-white/50 text-sm uppercase tracking-widest hover:text-[#FFD700] transition-colors">
            Admin Login
          </Link> : <>
            {isAdmin && <Link to="/admin" className="text-[#FFD700] text-xl uppercase tracking-widest hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
              Dashboard
            </Link>}
            <button onClick={handleLogout} className="text-white/50 text-xl uppercase tracking-widest hover:text-red-400 transition-colors">
              Logout
            </button>
          </>}
        </div>
      </div>
    </nav>
  </header>;
};
export default Header;