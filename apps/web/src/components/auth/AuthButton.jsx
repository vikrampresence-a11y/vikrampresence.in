import React from 'react';
import { Link } from 'react-router-dom';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from '@clerk/clerk-react';
import { useAuth } from '@/context/AuthContext.jsx';
import { ShoppingBag, User } from 'lucide-react';

const AuthButton = () => {
    const { isAdmin } = useAuth();

    return (
        <>
            {/* ── Signed Out: Show Sign In Button ── */}
            <SignedOut>
                <SignInButton mode="modal">
                    <button
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
                    </button>
                </SignInButton>
            </SignedOut>

            {/* ── Signed In: Show UserButton with menu items ── */}
            <SignedIn>
                <div className="flex items-center gap-3">
                    {/* Quick link to dashboard or my products */}
                    {isAdmin ? (
                        <Link
                            to="/admin"
                            className="text-[#FFD700] text-xs uppercase tracking-widest font-bold hover:text-yellow-300 transition-colors hidden lg:block"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/my-products"
                            className="text-white/70 hover:text-[#FFD700] transition-colors hidden lg:block"
                        >
                            <ShoppingBag size={18} />
                        </Link>
                    )}

                    {/* Clerk's UserButton with custom appearance */}
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox:
                                    'w-8 h-8 rounded-full border-2 border-[#FFD700]/40 hover:border-[#FFD700] transition-all duration-300 shadow-[0_0_12px_rgba(255,215,0,0.15)]',
                                userButtonPopoverCard:
                                    'bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]',
                                userButtonPopoverActionButtonText:
                                    'text-white/80 text-xs uppercase tracking-widest',
                                userButtonPopoverActionButtonIcon: 'text-white/60',
                                userButtonPopoverFooter: 'hidden',
                            },
                        }}
                    >
                        <UserButton.MenuItems>
                            {isAdmin ? (
                                <UserButton.Link
                                    label="Admin Dashboard"
                                    labelIcon={<User size={14} />}
                                    href="/admin"
                                />
                            ) : (
                                <UserButton.Link
                                    label="My Products"
                                    labelIcon={<ShoppingBag size={14} />}
                                    href="/my-products"
                                />
                            )}
                        </UserButton.MenuItems>
                    </UserButton>
                </div>
            </SignedIn>
        </>
    );
};

export default AuthButton;
