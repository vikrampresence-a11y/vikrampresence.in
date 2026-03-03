import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogIn, AlertCircle, Fingerprint } from 'lucide-react';

// ═══════════════════════════════════════════════
// ELITE ADMIN LOGIN — Deep Space Theme
// ═══════════════════════════════════════════════
const ADMIN_ID = 'vikrampresence3280';
const ADMIN_PASSWORD = 'Vikram@3280';
export const AUTH_KEY = 'vp_admin_auth';

const AdminLogin = ({ onLogin }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userId === ADMIN_ID && password === ADMIN_PASSWORD) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            onLogin();
        } else {
            setError('Invalid credentials. Access denied.');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    return (
        <div className="admin-login-screen">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4ff00]/20 to-transparent" />
            </div>

            {/* Grid pattern overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative z-10 w-full max-w-md px-6 ${shake ? 'animate-shake' : ''}`}
            >
                {/* Logo */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-2xl border border-[#d4ff00]/20 mb-8 relative"
                        style={{ background: 'linear-gradient(135deg, rgba(212,255,0,0.08) 0%, rgba(212,255,0,0.02) 100%)', boxShadow: '0 0 60px rgba(212,255,0,0.1)' }}
                    >
                        <Fingerprint size={42} className="text-[#d4ff00]" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#d4ff00] animate-pulse" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-tight font-sans">Command Center</h1>
                    <p className="text-white/30 text-xs mt-3 tracking-[0.25em] uppercase font-medium">Vikram Presence · Admin</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="admin-label">Admin ID</label>
                        <input type="text" value={userId}
                            onChange={(e) => { setUserId(e.target.value); setError(''); }}
                            placeholder="Enter your admin ID"
                            className="admin-input" autoComplete="off" />
                    </div>
                    <div>
                        <label className="admin-label">Password</label>
                        <input type="password" value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter password"
                            className="admin-input" />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <AlertCircle size={15} className="text-red-400 shrink-0" />
                                <span className="text-red-400 text-sm">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button type="submit" className="admin-btn-primary w-full py-4 mt-2 text-sm">
                        <LogIn size={17} /> Access Command Center
                    </button>
                </form>

                <p className="text-center text-white/15 text-[10px] mt-8 tracking-wider uppercase">
                    Secured · Encrypted · Private
                </p>
            </motion.div>

            <style>{`
                .admin-login-screen { min-height: 100vh; background: #050505; display: flex; align-items: center; justify-content: center; font-family: 'Inter', system-ui, sans-serif; }
                .admin-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
                .admin-input { width: 100%; padding: 14px 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; color: white; font-size: 14px; outline: none; transition: all 0.3s; }
                .admin-input:focus { border-color: rgba(212,255,0,0.4); box-shadow: 0 0 20px rgba(212,255,0,0.08); }
                .admin-input::placeholder { color: rgba(255,255,255,0.15); }
                .admin-btn-primary { display: flex; align-items: center; justify-content: center; gap: 10px; background: #d4ff00; color: #050505; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; border-radius: 14px; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 30px rgba(212,255,0,0.3); }
                .admin-btn-primary:hover { box-shadow: 0 0 50px rgba(212,255,0,0.5); transform: translateY(-1px); }
                @keyframes shake { 0%,100% { transform: translateX(0); } 10%,50%,90% { transform: translateX(-6px); } 30%,70% { transform: translateX(6px); } }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

export default AdminLogin;
