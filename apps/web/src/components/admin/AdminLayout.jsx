import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, Users, Mail, LogOut, Menu, X,
    Search, Command, ChevronRight
} from 'lucide-react';
import { AUTH_KEY } from './AdminLogin';

// ═══════════════════════════════════════════════
// ELITE ADMIN LAYOUT — Deep Space Command Center
// Sidebar + Top Bar + Command-K + Mobile Bottom Tab
// ═══════════════════════════════════════════════

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: Users },
    { id: 'emailer', label: 'Emailer', icon: Mail },
];

const AdminLayout = ({ activePage, onNavigate, onLogout, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [kbarOpen, setKbarOpen] = useState(false);
    const [kbarQuery, setKbarQuery] = useState('');

    // ── Command+K Shortcut ──
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setKbarOpen(prev => !prev);
                setKbarQuery('');
            }
            if (e.key === 'Escape') setKbarOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleKbarSelect = useCallback((id) => {
        onNavigate(id);
        setKbarOpen(false);
        setKbarQuery('');
    }, [onNavigate]);

    const filteredNav = NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(kbarQuery.toLowerCase())
    );

    const handleLogout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        onLogout();
    };

    return (
        <div className="admin-shell">
            {/* ═══ SIDEBAR — Desktop ═══ */}
            <aside className="admin-sidebar">
                {/* Logo */}
                <div className="px-5 pt-7 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#d4ff00] font-black text-sm"
                            style={{ background: 'linear-gradient(135deg, rgba(212,255,0,0.15), rgba(212,255,0,0.05))', border: '1px solid rgba(212,255,0,0.2)' }}>
                            VP
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold tracking-tight">Vikram</p>
                            <p className="text-white/25 text-[10px] tracking-[0.15em] uppercase">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="px-3 flex-1">
                    <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/20 px-3 mb-3">Navigation</p>
                    {NAV_ITEMS.map(item => {
                        const isActive = activePage === item.id;
                        return (
                            <button key={item.id} onClick={() => onNavigate(item.id)}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon size={18} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto opacity-40" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-5 mt-auto">
                    <button onClick={handleLogout} className="admin-nav-item text-red-400/60 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20">
                        <LogOut size={18} /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <button onClick={() => setSidebarOpen(true)} className="admin-mobile-menu-btn">
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    {/* KBar Trigger */}
                    <button onClick={() => { setKbarOpen(true); setKbarQuery(''); }}
                        className="admin-kbar-trigger">
                        <Search size={14} className="text-white/30" />
                        <span className="text-white/25 text-xs">Quick Navigate</span>
                        <kbd className="admin-kbd">⌘K</kbd>
                    </button>

                    <div className="flex items-center gap-3 ml-4">
                        <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/20 flex items-center justify-center text-[10px] font-bold text-[#d4ff00]">V</div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">
                    {children}
                </div>

                {/* ═══ MOBILE BOTTOM TAB ═══ */}
                <nav className="admin-bottom-tab">
                    {NAV_ITEMS.map(item => {
                        const isActive = activePage === item.id;
                        return (
                            <button key={item.id} onClick={() => onNavigate(item.id)}
                                className={`admin-tab-item ${isActive ? 'active' : ''}`}>
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden" />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[260px] z-[70] lg:hidden"
                            style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex justify-end p-4">
                                <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="px-3">
                                {NAV_ITEMS.map(item => (
                                    <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                                        className={`admin-nav-item ${activePage === item.id ? 'active' : ''}`}>
                                        <item.icon size={18} /> <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ═══ COMMAND-K PALETTE ═══ */}
            <AnimatePresence>
                {kbarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setKbarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]" />
                        <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[90] rounded-2xl overflow-hidden"
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                                <Command size={16} className="text-white/30" />
                                <input value={kbarQuery} onChange={(e) => setKbarQuery(e.target.value)}
                                    placeholder="Type to navigate..."
                                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25"
                                    autoFocus />
                            </div>
                            <div className="p-2 max-h-[250px] overflow-y-auto">
                                {filteredNav.map(item => (
                                    <button key={item.id} onClick={() => handleKbarSelect(item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white/60 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors">
                                        <item.icon size={16} className="text-[#d4ff00]/60" />
                                        <span>{item.label}</span>
                                        {activePage === item.id && <span className="ml-auto text-[9px] text-[#d4ff00]/50 uppercase tracking-wider">Active</span>}
                                    </button>
                                ))}
                                {filteredNav.length === 0 && (
                                    <p className="text-center text-white/20 text-sm py-6">No results</p>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                /* ── Shell ── */
                .admin-shell { display: flex; min-height: 100vh; background: #050505; font-family: 'Inter', system-ui, sans-serif; }

                /* ── Sidebar ── */
                .admin-sidebar {
                    display: none; width: 240px; flex-shrink: 0; flex-direction: column;
                    background: #0a0a0a; border-right: 1px solid rgba(255,255,255,0.05);
                    position: sticky; top: 0; height: 100vh; overflow-y: auto;
                }
                @media (min-width: 1024px) { .admin-sidebar { display: flex; } }

                .admin-nav-item {
                    width: 100%; display: flex; align-items: center; gap: 12px;
                    padding: 11px 16px; border-radius: 12px; font-size: 13px; font-weight: 500;
                    color: rgba(255,255,255,0.4); background: transparent;
                    border: 1px solid transparent; cursor: pointer;
                    transition: all 0.25s; margin-bottom: 2px;
                }
                .admin-nav-item:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); }
                .admin-nav-item.active {
                    color: #d4ff00; background: rgba(212,255,0,0.06);
                    border-color: rgba(212,255,0,0.12);
                    box-shadow: 0 0 20px rgba(212,255,0,0.05);
                }

                /* ── Main ── */
                .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

                /* ── Top Bar ── */
                .admin-topbar {
                    display: flex; align-items: center; gap: 12px;
                    padding: 12px 24px; background: rgba(10,10,10,0.8);
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    position: sticky; top: 0; z-index: 40;
                }
                .admin-mobile-menu-btn {
                    display: flex; padding: 8px; color: rgba(255,255,255,0.4);
                    background: transparent; border: none; cursor: pointer;
                    border-radius: 8px;
                }
                .admin-mobile-menu-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                @media (min-width: 1024px) { .admin-mobile-menu-btn { display: none; } }

                .admin-kbar-trigger {
                    display: none; align-items: center; gap: 8px;
                    padding: 8px 14px; border-radius: 10px;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    cursor: pointer; transition: all 0.2s;
                }
                .admin-kbar-trigger:hover { border-color: rgba(255,255,255,0.12); }
                @media (min-width: 768px) { .admin-kbar-trigger { display: flex; } }

                .admin-kbd {
                    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.3);
                    padding: 2px 6px; border-radius: 5px;
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
                    font-family: 'SF Mono', 'Fira Code', monospace;
                }

                /* ── Content ── */
                .admin-content { flex: 1; padding: 28px 24px 100px 24px; }
                @media (min-width: 768px) { .admin-content { padding: 32px 32px 32px 32px; } }

                /* ── Bottom Tab (Mobile) ── */
                .admin-bottom-tab {
                    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
                    background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding: 6px 8px; padding-bottom: max(6px, env(safe-area-inset-bottom));
                    z-index: 50;
                }
                @media (min-width: 1024px) { .admin-bottom-tab { display: none; } }

                .admin-tab-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
                    padding: 8px 0; border-radius: 10px; font-size: 9px; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    color: rgba(255,255,255,0.3); background: transparent;
                    border: none; cursor: pointer; transition: all 0.2s;
                }
                .admin-tab-item.active { color: #d4ff00; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
