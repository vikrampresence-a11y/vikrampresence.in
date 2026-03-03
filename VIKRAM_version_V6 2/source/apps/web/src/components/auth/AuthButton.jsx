import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

/**
 * AuthButton — Vikram Presence Auth UI for the navbar.
 * V2.0 FIX: Replaced Clerk with useAuth() for dual PHP/PocketBase auth support.
 */
const AuthButton = () => {
    const { isAuthenticated, logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex items-center gap-3">
            {!isAuthenticated ? (
                /* ── Signed Out: Show Sign In Button ── */
                <Link
                    to="/login"
                    id="auth-sign-in-btn"
                    className="group"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 20px',
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
            ) : (
                /* ── Signed In: "My Portal" link + Custom User Menu ── */
                <div className="flex items-center gap-4">
                    <Link
                        to="/my-products"
                        style={{
                            color: '#ffcc00',
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#ffcc00';
                            e.currentTarget.style.textShadow = 'none';
                        }}
                    >
                        My Portal
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-1.5 rounded-full border border-[#FFD700]/30 text-white/60 hover:text-[#FFD700] hover:border-[#FFD700] transition-all duration-300"
                        title="Logout"
                    >
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                            <User size={14} />
                        </div>
                        <LogOut size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuthButton;
