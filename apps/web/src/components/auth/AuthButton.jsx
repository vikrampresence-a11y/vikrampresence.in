import React from 'react';
import { Link } from 'react-router-dom';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from '@clerk/clerk-react';

/**
 * AuthButton — Clerk-powered auth UI for the navbar.
 *
 * Signed Out → Custom "Sign In" button (#ffcc00 border, transparent bg, 25px radius)
 * Signed In  → "My Portal" link + Clerk <UserButton /> avatar
 */
const AuthButton = () => {
    return (
        <div className="flex items-center gap-3">
            {/* ── Signed Out: Show Sign In Button ── */}
            <SignedOut>
                <SignInButton mode="modal">
                    <button
                        id="auth-sign-in-btn"
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
                    </button>
                </SignInButton>
            </SignedOut>

            {/* ── Signed In: "My Portal" link + UserButton avatar ── */}
            <SignedIn>
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
                />
            </SignedIn>
        </div>
    );
};

export default AuthButton;
