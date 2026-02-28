import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Plus, Trash2, Package, LogOut, ShieldCheck, AlertCircle, Loader2, Book, MonitorPlay, Info } from 'lucide-react';
import { subscribeProducts, addProduct, deleteProduct, isFirebaseConfigured } from '@/lib/productStore';

// ═══════════════════════════════════════════════
// HARDCODED CREDENTIALS — Admin access only
// ═══════════════════════════════════════════════
const ADMIN_ID = 'vikrampresence3280';
const ADMIN_PASSWORD = 'Vikram@3280';
const AUTH_KEY = 'vp_admin_auth';

// ─────────────────────────────────────────────
// Admin Login Component
// ─────────────────────────────────────────────
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ffcc00]/[0.03] blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative z-10 w-full max-w-md ${shake ? 'animate-shake' : ''}`}
                style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#ffcc00]/30 bg-[#ffcc00]/[0.05] mb-6"
                        style={{ boxShadow: '0 0 40px rgba(255, 204, 0, 0.15)' }}>
                        <ShieldCheck size={36} className="text-[#ffcc00]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-white/40 text-sm mt-2 tracking-wide uppercase">Vikram Presence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Admin ID</label>
                        <input type="text" value={userId} onChange={(e) => { setUserId(e.target.value); setError(''); }}
                            placeholder="Enter your admin ID"
                            className="w-full px-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/50 focus:shadow-[0_0_20px_rgba(255,204,0,0.1)] transition-all duration-300 text-sm"
                            autoComplete="off" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter password"
                            className="w-full px-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/50 focus:shadow-[0_0_20px_rgba(255,204,0,0.1)] transition-all duration-300 text-sm" />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <span className="text-red-400 text-sm font-medium">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button type="submit"
                        className="w-full py-4 mt-2 rounded-xl font-bold text-sm uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3"
                        style={{ background: '#ffcc00', color: '#000000', boxShadow: '0 0 30px rgba(255, 204, 0, 0.4)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 204, 0, 0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 204, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <LogIn size={18} /> Access Dashboard
                    </button>
                </form>
            </motion.div>

            <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 50%, 90% { transform: translateX(-6px); } 30%, 70% { transform: translateX(6px); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// Admin Dashboard Component
// ─────────────────────────────────────────────
const AdminDashboard = ({ onLogout }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [priceRupees, setPriceRupees] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [driveLink, setDriveLink] = useState('');
    const [productType, setProductType] = useState('ebook');
    const [formMsg, setFormMsg] = useState({ text: '', type: '' });

    // Real-time listener for products
    useEffect(() => {
        const unsubscribe = subscribeProducts((items) => {
            setProducts(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Add product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!title || !priceRupees || !coverImageUrl || !driveLink) {
            setFormMsg({ text: 'All fields are required.', type: 'error' });
            return;
        }

        const pricePaise = Math.round(parseFloat(priceRupees) * 100);
        if (isNaN(pricePaise) || pricePaise <= 0) {
            setFormMsg({ text: 'Enter a valid price.', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await addProduct({
                title,
                pricePaise,
                coverImageUrl,
                driveLink,
                type: productType,
            });
            setTitle('');
            setPriceRupees('');
            setCoverImageUrl('');
            setDriveLink('');
            setProductType('ebook');
            setFormMsg({ text: '✅ Product added successfully!', type: 'success' });
            setTimeout(() => setFormMsg({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error('Error adding product:', err);
            setFormMsg({ text: 'Failed to add product.', type: 'error' });
        }
        setSaving(false);
    };

    // Delete product
    const handleDelete = async (productId) => {
        setDeleting(productId);
        try {
            await deleteProduct(productId);
        } catch (err) {
            console.error('Error deleting product:', err);
        }
        setDeleting(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        onLogout();
    };

    const firebaseActive = isFirebaseConfigured();

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center">
                            <Package size={18} className="text-[#ffcc00]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Product Management</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white/50 hover:text-red-400 border border-white/[0.08] hover:border-red-400/30 rounded-lg transition-all duration-300">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Storage mode indicator */}
                <div className={`mb-8 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${firebaseActive
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                    <Info size={16} />
                    {firebaseActive
                        ? 'Connected to Firebase Firestore'
                        : 'Using local storage (add Firebase keys to .env for cloud sync)'
                    }
                </div>

                <div className="grid lg:grid-cols-5 gap-12">

                    {/* ── LEFT: Add Product Form ── */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="sticky top-28">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Plus size={20} className="text-[#ffcc00]" /> Add New Product
                            </h2>

                            <form onSubmit={handleAddProduct} className="space-y-4">
                                {/* Product Type Selector */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Product Type</label>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setProductType('ebook')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${productType === 'ebook'
                                                    ? 'bg-[#ffcc00]/10 border-[#ffcc00]/50 text-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.15)]'
                                                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                                                }`}>
                                            <Book size={16} /> Ebook
                                        </button>
                                        <button type="button" onClick={() => setProductType('course')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${productType === 'course'
                                                    ? 'bg-[#ffcc00]/10 border-[#ffcc00]/50 text-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.15)]'
                                                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                                                }`}>
                                            <MonitorPlay size={16} /> Course
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Title</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Habit Mastery Ebook"
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/40 transition-all duration-300" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">₹</span>
                                        <input type="number" step="1" min="1" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)}
                                            placeholder="99"
                                            className="w-full pl-9 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/40 transition-all duration-300" />
                                    </div>
                                    {priceRupees && (
                                        <p className="text-[11px] text-white/30 mt-1.5 ml-1">
                                            = {Math.round(parseFloat(priceRupees) * 100)} paise
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Cover Image URL</label>
                                    <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/40 transition-all duration-300" />
                                    {coverImageUrl && (
                                        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                                            <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Google Drive Link</label>
                                    <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ffcc00]/40 transition-all duration-300" />
                                </div>

                                <AnimatePresence>
                                    {formMsg.text && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className={`text-sm font-medium ${formMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                            {formMsg.text}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <button type="submit" disabled={saving}
                                    className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-[0.12em] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{ background: '#ffcc00', color: '#000000', boxShadow: '0 0 25px rgba(255, 204, 0, 0.35)' }}
                                    onMouseEnter={(e) => { if (!saving) e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 204, 0, 0.6)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 204, 0, 0.35)'; }}>
                                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Plus size={16} /> Add Product</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: Product List ── */}
                    <div className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Package size={20} className="text-[#ffcc00]" /> Active Products
                                <span className="ml-auto text-sm font-normal text-white/30">{products.length} total</span>
                            </h2>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={32} className="text-[#ffcc00] animate-spin" />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-2xl">
                                    <Package size={40} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">No products yet. Add your first one!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {products.map((product) => (
                                            <motion.div key={product.id} layout
                                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
                                                transition={{ duration: 0.3 }}
                                                className="group flex items-center gap-5 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-[#ffcc00]/20 transition-all duration-300">
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0 border border-white/[0.06]">
                                                    <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }} />
                                                </div>
                                                {/* Info */}
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="font-bold text-white text-sm truncate">{product.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${product.type === 'course'
                                                                ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                                                                : 'text-[#ffcc00] border-[#ffcc00]/30 bg-[#ffcc00]/10'
                                                            }`}>
                                                            {product.type || 'ebook'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[#ffcc00] text-sm font-bold">
                                                        ₹{(product.pricePaise / 100).toFixed(0)}
                                                        <span className="text-white/20 font-normal ml-2 text-xs">({product.pricePaise} paise)</span>
                                                    </p>
                                                    <p className="text-white/20 text-xs truncate mt-0.5">{product.driveLink}</p>
                                                </div>
                                                {/* Delete */}
                                                <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                                                    className="flex-shrink-0 p-2.5 rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-300 disabled:opacity-50"
                                                    title="Delete product">
                                                    {deleting === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Main AdminPage
// ─────────────────────────────────────────────
const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => sessionStorage.getItem(AUTH_KEY) === 'true'
    );

    return isAuthenticated ? (
        <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
    ) : (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
    );
};

export default AdminPage;
