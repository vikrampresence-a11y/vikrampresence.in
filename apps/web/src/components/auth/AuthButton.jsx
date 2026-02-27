import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { ShoppingBag, LogOut, ChevronDown, User } from 'lucide-react';

const AuthButton = () => {
    const { currentUser, currentAdmin, isAuthenticated, isAdmin, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
        navigate('/');
    };

    // ── Logged Out State ──
    if (!isAuthenticated) {
        return (
            <Link
                to="/login"
                id="auth-sign-in-btn"
                className="auth-btn-outline"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 24px',
                    backgroundColor: 'transparent',
                    border: '1px solid #ffcc00',
                    color: '#ffcc00',
                    borderRadius: '25px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffcc00';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffcc00';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                Sign In
            </Link>
        );
    }

    // ── Logged In State ──
    const user = currentUser || currentAdmin;
    const userName = user?.name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = user?.profilePicture || user?.avatar;
    const initials = userName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                id="auth-user-menu-btn"
                className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-white/10 hover:border-[#FFD700]/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
            >
                {/* Avatar */}
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={userName}
                        className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center">
                        <span className="text-[#FFD700] text-xs font-bold">{initials}</span>
                    </div>
                )}
                <span className="text-white text-xs font-medium tracking-wide hidden lg:block max-w-[80px] truncate">
                    {userName}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-white text-sm font-semibold truncate">{userName}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center px-4 py-2.5 text-xs uppercase tracking-widest text-[#FFD700] hover:bg-white/5 transition-colors"
                            >
                                <User size={14} className="mr-3" />
                                Dashboard
                            </Link>
                        )}

                        {!isAdmin && (
                            <Link
                                to="/my-products"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center px-4 py-2.5 text-xs uppercase tracking-widest text-white/80 hover:text-[#FFD700] hover:bg-white/5 transition-colors"
                            >
                                <ShoppingBag size={14} className="mr-3" />
                                My Products
                            </Link>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-white/5 py-1">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-xs uppercase tracking-widest text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                        >
                            <LogOut size={14} className="mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthButton;
