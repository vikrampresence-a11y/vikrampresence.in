import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, Users, Mail, LogOut, Menu, X,
    Search, Command, ChevronRight, BarChart3, Settings, Globe,
    MonitorPlay, Tag, MessageCircle, Code2, Database, ShoppingCart,
    Palette, Zap, Search as SearchIcon, Image, History, Shield, AlertTriangle
} from 'lucide-react';
import { AUTH_KEY } from './AdminLogin';

// ═══════════════════════════════════════════════════════════
// ADMIN LAYOUT V3 — 6 Groups, 20 Pages, Command-K
// ═══════════════════════════════════════════════════════════

const NAV_GROUPS = [
    {
        label: 'Analytics',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: Users },
            { id: 'promotions', label: 'Promotions', icon: Tag },
            { id: 'checkout', label: 'Checkout Control', icon: ShoppingCart },
        ],
    },
    {
        label: 'Communication',
        items: [
            { id: 'emailer', label: 'Email Automation', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
            { id: 'automation', label: 'Automation Engine', icon: Zap },
        ],
    },
    {
        label: 'Website Control',
        items: [
            { id: 'globalSettings', label: 'Global Settings', icon: Settings },
            { id: 'homepage', label: 'Homepage', icon: Globe },
            { id: 'content', label: 'Content Manager', icon: MonitorPlay },
            { id: 'seo', label: 'SEO Command Center', icon: SearchIcon },
            { id: 'design', label: 'Design System', icon: Palette },
        ],
    },
    {
        label: 'Media',
        items: [
            { id: 'media', label: 'Media Library', icon: Image },
        ],
    },
    {
        label: 'System',
        items: [
            { id: 'developer', label: 'Developer Tools', icon: Code2 },
            { id: 'backup', label: 'Backup & Restore', icon: Database },
            { id: 'audit', label: 'Audit Trail', icon: History },
            { id: 'access', label: 'Access Control', icon: Shield },
            { id: 'errors', label: 'Error Logs', icon: AlertTriangle },
        ],
    },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);
const MOBILE_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: Users },
    { id: 'globalSettings', label: 'Settings', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
];

const AdminLayout = ({ activePage, onNavigate, onLogout, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [kbarOpen, setKbarOpen] = useState(false);
    const [kbarQuery, setKbarQuery] = useState('');

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setKbarOpen(prev => !prev); setKbarQuery(''); }
            if (e.key === 'Escape') setKbarOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleKbarSelect = useCallback((id) => { onNavigate(id); setKbarOpen(false); setKbarQuery(''); }, [onNavigate]);
    const filteredNav = ALL_NAV_ITEMS.filter(item => item.label.toLowerCase().includes(kbarQuery.toLowerCase()));
    const handleLogout = () => { sessionStorage.removeItem(AUTH_KEY); onLogout(); };
    const activeItem = ALL_NAV_ITEMS.find(i => i.id === activePage);

    const SidebarContent = ({ onItemClick }) => (
        <nav className="px-3 flex-1 overflow-y-auto pb-4">
            {NAV_GROUPS.map(group => (
                <div key={group.label} className="mb-5">
                    <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/[0.18] px-3 mb-1.5">{group.label}</p>
                    {group.items.map(item => {
                        const isActive = activePage === item.id;
                        return (
                            <button key={item.id} onClick={() => { onNavigate(item.id); onItemClick?.(); }}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon size={16} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight size={12} className="ml-auto opacity-30" />}
                            </button>
                        );
                    })}
                </div>
            ))}
        </nav>
    );

    return (
        <div className="admin-shell">
            {/* ═══ SIDEBAR — Desktop ═══ */}
            <aside className="admin-sidebar">
                <div className="px-5 pt-7 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#d4ff00] font-black text-sm" style={{ background: 'linear-gradient(135deg, rgba(212,255,0,0.15), rgba(212,255,0,0.05))', border: '1px solid rgba(212,255,0,0.2)' }}>VP</div>
                        <div>
                            <p className="text-white text-sm font-bold tracking-tight">Vikram Presence</p>
                            <p className="text-white/20 text-[9px] tracking-[0.15em] uppercase">Master Control V3</p>
                        </div>
                    </div>
                </div>
                <SidebarContent />
                <div className="px-3 pb-5 border-t border-white/[0.04] pt-4">
                    <button onClick={handleLogout} className="admin-nav-item text-red-400/50 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 cursor-pointer"><LogOut size={16} /> <span>Logout</span></button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button onClick={() => setSidebarOpen(true)} className="admin-mobile-menu-btn cursor-pointer"><Menu size={20} /></button>
                    <div className="flex items-center gap-2 min-w-0">
                        {activeItem && <><activeItem.icon size={14} className="text-white/25 shrink-0" /><span className="text-white/40 text-sm truncate">{activeItem.label}</span></>}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => { setKbarOpen(true); setKbarQuery(''); }} className="admin-kbar-trigger cursor-pointer">
                        <Search size={13} className="text-white/25" />
                        <span className="text-white/20 text-xs">Navigate...</span>
                        <kbd className="admin-kbd">⌘K</kbd>
                    </button>
                    <div className="flex items-center gap-3 ml-3">
                        <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/20 flex items-center justify-center text-[10px] font-bold text-[#d4ff00]">V</div>
                    </div>
                </header>

                <div className="admin-content">{children}</div>

                {/* Bottom Tab */}
                <nav className="admin-bottom-tab">
                    {MOBILE_TABS.map(item => {
                        const isActive = activePage === item.id;
                        return (
                            <button key={item.id} onClick={() => onNavigate(item.id)} className={`admin-tab-item cursor-pointer ${isActive ? 'active' : ''}`}>
                                <item.icon size={19} /><span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden" />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[270px] z-[70] lg:hidden flex flex-col" style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex justify-between items-center px-5 pt-5 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/20 flex items-center justify-center text-xs font-black text-[#d4ff00]">VP</div>
                                    <div><p className="text-white text-sm font-bold">Control Room</p><p className="text-white/20 text-[9px]">V3 · 20 Pages</p></div>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-1 cursor-pointer"><X size={18} /></button>
                            </div>
                            <SidebarContent onItemClick={() => setSidebarOpen(false)} />
                            <div className="px-3 pb-5 border-t border-white/[0.04] pt-3">
                                <button onClick={handleLogout} className="admin-nav-item text-red-400/50 hover:text-red-400 cursor-pointer"><LogOut size={16} /> <span>Logout</span></button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Command-K */}
            <AnimatePresence>
                {kbarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setKbarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]" />
                        <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.18 }}
                            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[90] rounded-2xl overflow-hidden"
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.9)' }}>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                                <Command size={15} className="text-white/25 shrink-0" />
                                <input value={kbarQuery} onChange={e => setKbarQuery(e.target.value)} placeholder="Search 20 pages..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20" autoFocus />
                                <kbd className="admin-kbd">ESC</kbd>
                            </div>
                            <div className="p-2 max-h-[360px] overflow-y-auto">
                                {filteredNav.length === 0 ? <p className="text-center text-white/20 text-sm py-6">No results</p> : filteredNav.map(item => (
                                    <button key={item.id} onClick={() => handleKbarSelect(item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/55 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors text-left cursor-pointer">
                                        <item.icon size={14} className="text-[#d4ff00]/60 shrink-0" />
                                        <span>{item.label}</span>
                                        {activePage === item.id && <span className="ml-auto text-[9px] text-[#d4ff00]/50 uppercase tracking-wider">Active</span>}
                                    </button>
                                ))}
                            </div>
                            <div className="px-5 py-3 border-t border-white/[0.05] flex items-center gap-4 text-[10px] text-white/20">
                                <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .admin-shell { display: flex; min-height: 100vh; background: #050505; font-family: 'Inter', system-ui, sans-serif; }
                .admin-sidebar { display: none; width: 238px; flex-shrink: 0; flex-direction: column; background: #080808; border-right: 1px solid rgba(255,255,255,0.045); position: sticky; top: 0; height: 100vh; overflow-y: auto; }
                @media (min-width: 1024px) { .admin-sidebar { display: flex; } }
                .admin-nav-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 13px; border-radius: 9px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.33); background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 0.18s; margin-bottom: 1px; }
                .admin-nav-item:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.028); }
                .admin-nav-item.active { color: #d4ff00; background: rgba(212,255,0,0.07); border-color: rgba(212,255,0,0.14); box-shadow: 0 0 18px rgba(212,255,0,0.05); }
                .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
                .admin-topbar { display: flex; align-items: center; gap: 10px; padding: 12px 18px; background: rgba(8,8,8,0.92); border-bottom: 1px solid rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 40; }
                .admin-mobile-menu-btn { display: flex; padding: 7px; color: rgba(255,255,255,0.35); background: transparent; border: none; cursor: pointer; border-radius: 8px; }
                .admin-mobile-menu-btn:hover { color: white; background: rgba(255,255,255,0.05); }
                @media (min-width: 1024px) { .admin-mobile-menu-btn { display: none; } }
                .admin-kbar-trigger { display: none; align-items: center; gap: 8px; padding: 7px 13px; border-radius: 10px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.055); cursor: pointer; transition: all 0.18s; }
                .admin-kbar-trigger:hover { border-color: rgba(255,255,255,0.1); }
                @media (min-width: 768px) { .admin-kbar-trigger { display: flex; } }
                .admin-kbd { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.27); padding: 2px 6px; border-radius: 5px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); font-family: 'SF Mono', monospace; }
                .admin-content { flex: 1; padding: 26px 18px 100px 18px; overflow-y: auto; }
                @media (min-width: 768px) { .admin-content { padding: 30px 30px 40px 30px; } }
                .admin-bottom-tab { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(8,8,8,0.98); backdrop-filter: blur(24px); border-top: 1px solid rgba(255,255,255,0.055); padding: 6px 4px; padding-bottom: max(6px, env(safe-area-inset-bottom)); z-index: 50; }
                @media (min-width: 1024px) { .admin-bottom-tab { display: none; } }
                .admin-tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 7px 0; border-radius: 9px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.27); background: transparent; border: none; cursor: pointer; transition: all 0.18s; }
                .admin-tab-item.active { color: #d4ff00; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
