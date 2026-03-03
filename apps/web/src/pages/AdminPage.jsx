import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Plus, Trash2, Package, LogOut, ShieldCheck, AlertCircle, Loader2, Book, MonitorPlay, Info, Pencil, X, Check, Save } from 'lucide-react';
import { subscribeProducts, addProduct, deleteProduct, updateProduct, isFirebaseConfigured } from '@/lib/productStore';

// ═══════════════════════════════════════════════
// HARDCODED CREDENTIALS — Admin access only
// ═══════════════════════════════════════════════
const ADMIN_ID = 'vikrampresence3280';
const ADMIN_PASSWORD = 'Vikram@3280';
const AUTH_KEY = 'vp_admin_auth';

// Floating Particles
const FloatingParticles = ({ count = 12 }) => {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 8}s`,
        delay: `${Math.random() * 4}s`,
        size: Math.random() > 0.5 ? 3 : 2,
    }));

    return (
        <div className="floating-particles">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        '--duration': p.duration,
                        '--delay': p.delay,
                    }}
                />
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// Admin Login Component — PRO-MAX
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <FloatingParticles />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E2F034]/[0.03] blur-[150px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.02] blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 w-full max-w-md glass-card-premium p-8 md:p-10 ${shake ? 'animate-shake' : ''}`}
                style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[#E2F034]/25 bg-[#E2F034]/[0.08] mb-6"
                        style={{ boxShadow: '0 0 40px rgba(226, 240, 52, 0.1)' }}
                    >
                        <ShieldCheck size={32} className="text-[#E2F034]" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-white/30 text-sm mt-2 tracking-wide uppercase">Vikram Presence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Admin ID</label>
                        <input type="text" value={userId} onChange={(e) => { setUserId(e.target.value); setError(''); }}
                            placeholder="Enter your admin ID"
                            className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 focus:shadow-[0_0_20px_rgba(226,240,52,0.06)] transition-all duration-300 text-sm"
                            autoComplete="off" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter password"
                            className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 focus:shadow-[0_0_20px_rgba(226,240,52,0.06)] transition-all duration-300 text-sm" />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 px-4 py-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <span className="text-red-400 text-sm font-medium">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        className="relative overflow-hidden w-full py-4 mt-2 rounded-xl font-bold text-sm uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3 bg-[#E2F034] text-black shadow-[0_0_30px_rgba(226,240,52,0.25)] hover:shadow-[0_0_50px_rgba(226,240,52,0.4)] group"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <LogIn size={18} /> Access Dashboard
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </motion.button>
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
// Product Form Component (shared for Add & Edit)
// ─────────────────────────────────────────────
const ProductForm = ({ initialData = null, onSave, onCancel, saving }) => {
    const isEditing = !!initialData;
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [priceRupees, setPriceRupees] = useState(
        initialData?.pricePaise ? (initialData.pricePaise / 100).toString() : ''
    );
    const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
    const [driveLink, setDriveLink] = useState(initialData?.driveLink || '');
    const [productType, setProductType] = useState(initialData?.type || 'ebook');

    const handleSubmit = (e) => {
        e.preventDefault();
        const pricePaise = Math.round(parseFloat(priceRupees) * 100);
        onSave({ title, description, pricePaise, coverImageUrl, driveLink, type: productType });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Type Selector */}
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">Product Type</label>
                <div className="flex gap-3">
                    {['ebook', 'course'].map((type) => (
                        <motion.button
                            key={type}
                            type="button"
                            onClick={() => setProductType(type)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${productType === type
                                ? 'bg-[#E2F034]/10 border-[#E2F034]/40 text-[#E2F034] shadow-[0_0_20px_rgba(226,240,52,0.1)]'
                                : 'bg-white/[0.02] border-white/[0.08] text-white/35 hover:text-white/50'
                                }`}
                        >
                            {type === 'ebook' ? <Book size={16} /> : <MonitorPlay size={16} />}
                            {type === 'ebook' ? 'Ebook' : 'Course'}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Habit Mastery Ebook" required
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 transition-all duration-300" />
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">
                    Description <span className="text-white/15">(max 2000 chars)</span>
                </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product — what the buyer will learn or get..."
                    maxLength={2000}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 transition-all duration-300 resize-y" />
                <p className="text-[11px] text-white/15 mt-1 ml-1">{description.length}/2000</p>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">Price (₹) *</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm font-bold">₹</span>
                    <input type="number" step="1" min="1" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)}
                        placeholder="99" required
                        className="w-full pl-9 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 transition-all duration-300" />
                </div>
                {priceRupees && (
                    <p className="text-[11px] text-white/20 mt-1.5 ml-1">
                        = {Math.round(parseFloat(priceRupees) * 100)} paise
                    </p>
                )}
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">Cover Image URL *</label>
                <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..." required
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 transition-all duration-300" />
                {/* 16:9 preview */}
                {coverImageUrl && (
                    <div className="mt-2 w-full aspect-video rounded-lg overflow-hidden border border-white/[0.08] max-w-xs">
                        <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2">Google Drive Link *</label>
                <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..." required
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#E2F034]/40 transition-all duration-300" />
            </div>

            <div className="flex gap-3 pt-2">
                {isEditing && (
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-[0.12em] flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all duration-300"
                    >
                        <X size={16} /> Cancel
                    </motion.button>
                )}
                <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-[0.12em] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 bg-[#E2F034] text-black shadow-[0_0_25px_rgba(226,240,52,0.2)] hover:shadow-[0_0_40px_rgba(226,240,52,0.35)] group"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : isEditing ? <><Save size={16} /> Update Product</> : <><Plus size={16} /> Add Product</>}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </motion.button>
            </div>
        </form>
    );
};

// ─────────────────────────────────────────────
// Admin Dashboard Component — PRO-MAX
// ─────────────────────────────────────────────
const AdminDashboard = ({ onLogout }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null); // null = add mode, product = edit mode
    const [formMsg, setFormMsg] = useState({ text: '', type: '' });

    // Real-time listener for products
    useEffect(() => {
        const unsubscribe = subscribeProducts((items) => {
            setProducts(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const showMsg = (text, type) => {
        setFormMsg({ text, type });
        setTimeout(() => setFormMsg({ text: '', type: '' }), 3000);
    };

    // Add product
    const handleAdd = async ({ title, description, pricePaise, coverImageUrl, driveLink, type }) => {
        if (!title || !pricePaise || !coverImageUrl || !driveLink) {
            showMsg('All required fields must be filled.', 'error');
            return;
        }
        if (isNaN(pricePaise) || pricePaise <= 0) {
            showMsg('Enter a valid price.', 'error');
            return;
        }
        setSaving(true);
        try {
            await addProduct({ title, description, pricePaise, coverImageUrl, driveLink, type });
            showMsg('✅ Product added successfully!', 'success');
        } catch (err) {
            console.error('Error adding product:', err);
            showMsg('Failed to add product.', 'error');
        }
        setSaving(false);
    };

    // Update product
    const handleUpdate = async ({ title, description, pricePaise, coverImageUrl, driveLink, type }) => {
        if (!editingProduct) return;
        if (!title || !pricePaise || !coverImageUrl || !driveLink) {
            showMsg('All required fields must be filled.', 'error');
            return;
        }
        setSaving(true);
        try {
            await updateProduct(editingProduct.id, { title, description, pricePaise, coverImageUrl, driveLink, type });
            showMsg('✅ Product updated successfully!', 'success');
            setEditingProduct(null);
        } catch (err) {
            console.error('Error updating product:', err);
            showMsg('Failed to update product.', 'error');
        }
        setSaving(false);
    };

    // Delete product
    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
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
        <div className="min-h-screen bg-black text-white font-sans relative">
            {/* Top Bar — PRO-MAX Glassmorphic */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#E2F034]/10 border border-[#E2F034]/20 flex items-center justify-center">
                            <Package size={18} className="text-[#E2F034]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">Product Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {formMsg.text && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-sm font-medium ${formMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}
                            >
                                {formMsg.text}
                            </motion.span>
                        )}
                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white/40 hover:text-red-400 border border-white/[0.08] hover:border-red-400/30 hover:bg-red-400/5 rounded-lg transition-all duration-300"
                        >
                            <LogOut size={14} /> Logout
                        </motion.button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Storage mode indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${firebaseActive
                        ? 'bg-green-500/[0.06] border-green-500/15 text-green-400'
                        : 'bg-[#E2F034]/[0.04] border-[#E2F034]/15 text-[#E2F034]/80'
                        }`}
                >
                    <Info size={16} />
                    {firebaseActive
                        ? '✅ Connected to Firebase Firestore — changes sync in real-time'
                        : '⚠️ Using local storage (add Firebase keys to .env for cloud sync)'
                    }
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-12">

                    {/* ── LEFT: Add / Edit Product Form ── */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="sticky top-28">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                {editingProduct ? (
                                    <>
                                        <Pencil size={20} className="text-[#E2F034]" />
                                        Edit Product
                                        <button
                                            onClick={() => setEditingProduct(null)}
                                            className="ml-auto text-white/30 hover:text-white/60 transition-colors p-1"
                                            title="Cancel editing"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="text-[#E2F034]" /> Add New Product
                                    </>
                                )}
                            </h2>

                            {editingProduct ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={editingProduct.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="mb-4 px-4 py-3 bg-[#E2F034]/[0.04] border border-[#E2F034]/15 rounded-xl text-[11px] text-[#E2F034]/70 uppercase tracking-widest font-bold">
                                            Editing: {editingProduct.title}
                                        </div>
                                        <ProductForm
                                            initialData={editingProduct}
                                            onSave={handleUpdate}
                                            onCancel={() => setEditingProduct(null)}
                                            saving={saving}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="add-form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <ProductForm
                                            onSave={handleAdd}
                                            saving={saving}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </motion.div>
                    </div>

                    {/* ── RIGHT: Product List ── */}
                    <div className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Package size={20} className="text-[#E2F034]" /> Active Products
                                <span className="ml-auto text-sm font-normal text-white/25">{products.length} total</span>
                            </h2>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={32} className="text-[#E2F034] animate-spin" />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-2xl">
                                    <Package size={40} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/25 text-sm">No products yet. Add your first one!</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <AnimatePresence>
                                        {products.map((product, idx) => (
                                            <motion.div key={product.id} layout
                                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
                                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                className={`group p-5 border rounded-2xl transition-all duration-300 ${editingProduct?.id === product.id
                                                    ? 'border-[#E2F034]/30 bg-[#E2F034]/[0.03] shadow-[0_0_20px_rgba(226,240,52,0.05)]'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-[#E2F034]/15 hover:bg-white/[0.03]'
                                                    }`}
                                            >
                                                {/* 16:9 Thumbnail */}
                                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-4 relative">
                                                    <img
                                                        src={product.coverImageUrl}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${product.type === 'course'
                                                            ? 'text-blue-400 border-blue-400/20 bg-blue-400/[0.15] backdrop-blur-sm'
                                                            : 'text-[#E2F034] border-[#E2F034]/20 bg-[#E2F034]/[0.15] backdrop-blur-sm'
                                                            }`}>
                                                            {product.type || 'ebook'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <h3 className="font-bold text-white text-base leading-tight">{product.title}</h3>
                                                    <p className="text-[#E2F034] text-sm font-bold whitespace-nowrap">
                                                        ₹{(product.pricePaise / 100).toFixed(0)}
                                                    </p>
                                                </div>

                                                {/* Full Description — no truncation */}
                                                {product.description && (
                                                    <p className="text-white/40 text-sm font-light leading-relaxed mb-3">
                                                        {product.description}
                                                    </p>
                                                )}

                                                {/* Drive Link */}
                                                <p className="text-white/15 text-xs mb-4 truncate">
                                                    🔗 {product.driveLink}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => setEditingProduct(product)}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#E2F034]/20 text-[#E2F034]/70 hover:bg-[#E2F034]/[0.06] hover:border-[#E2F034]/40 hover:text-[#E2F034] transition-all duration-300"
                                                    >
                                                        <Pencil size={13} /> Edit
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={deleting === product.id}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/[0.06] text-white/25 hover:text-red-400 hover:border-red-400/25 hover:bg-red-400/5 transition-all duration-300 disabled:opacity-40"
                                                        title="Delete product"
                                                    >
                                                        {deleting === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    </motion.button>
                                                </div>
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
