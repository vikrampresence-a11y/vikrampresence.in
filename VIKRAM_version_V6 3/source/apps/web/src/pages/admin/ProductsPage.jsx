import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Package, Loader2, Book, MonitorPlay, Edit3,
    Upload, X, Link, Image as ImageIcon, ToggleLeft, ToggleRight, Search
} from 'lucide-react';
import { subscribeProducts, addProduct, deleteProduct } from '@/lib/productStore';

// ═══════════════════════════════════════════════
// PRODUCTS — CRUD with Direct File Upload
// ═══════════════════════════════════════════════

const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
const UPLOAD_URL = isShopDomain ? '/api/upload-image.php' : null;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceRupees, setPriceRupees] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [driveLink, setDriveLink] = useState('');
    const [productType, setProductType] = useState('ebook');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsub = subscribeProducts((items) => { setProducts(items); setLoading(false); });
        return () => unsub();
    }, []);

    // File upload handler
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) { alert('Only JPG, PNG, WebP, GIF allowed.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Max file size: 5MB.'); return; }

        if (UPLOAD_URL) {
            // Upload to PHP backend on .shop
            setUploading(true);
            try {
                const form = new FormData();
                form.append('image', file);
                const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
                const data = await res.json();
                if (data.success && data.url) {
                    setCoverImageUrl(data.url);
                } else {
                    alert(data.error || 'Upload failed');
                }
            } catch { alert('Upload failed — server unreachable.'); }
            setUploading(false);
        } else {
            // Local preview as data URL for .in / dev
            const reader = new FileReader();
            reader.onload = () => setCoverImageUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setTitle(''); setDescription(''); setPriceRupees('');
        setCoverImageUrl(''); setDriveLink(''); setProductType('ebook');
        setShowForm(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!title || !priceRupees || !coverImageUrl || !driveLink) { alert('All fields required.'); return; }
        const pricePaise = Math.round(parseFloat(priceRupees) * 100);
        if (isNaN(pricePaise) || pricePaise <= 0) { alert('Enter a valid price.'); return; }
        setSaving(true);
        try {
            await addProduct({ title, description, pricePaise, coverImageUrl, driveLink, type: productType });
            resetForm();
        } catch { alert('Failed to add product.'); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        setDeleting(id);
        try { await deleteProduct(id); } catch { alert('Failed to delete.'); }
        setDeleting(null);
    };

    const filtered = products.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
                    <p className="text-white/30 text-sm mt-1">{products.length} total products</p>
                </div>
                <button onClick={() => setShowForm(true)} className="admin-btn-primary px-5 py-3 text-xs">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="admin-input pl-11 w-full" />
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
                        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="fixed inset-4 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 rounded-2xl overflow-y-auto max-h-[90vh]"
                            style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>

                            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                                <h2 className="text-lg font-bold text-white">New Product</h2>
                                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleAdd} className="p-5 space-y-4">
                                {/* Type */}
                                <div className="flex gap-3">
                                    {[{ t: 'ebook', icon: Book, label: 'Ebook' }, { t: 'course', icon: MonitorPlay, label: 'Course' }].map(({ t, icon: I, label }) => (
                                        <button key={t} type="button" onClick={() => setProductType(t)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all ${productType === t
                                                ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]'
                                                : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'
                                                }`}>
                                            <I size={16} /> {label}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="admin-label">Title</label>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Content Creation Mastery" className="admin-input w-full" />
                                </div>
                                <div>
                                    <label className="admin-label">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What the buyer will learn..." rows={3} maxLength={500} className="admin-input w-full resize-none" />
                                </div>
                                <div>
                                    <label className="admin-label">Price (₹)</label>
                                    <input type="number" step="1" min="1" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} placeholder="99" className="admin-input w-full" />
                                </div>

                                {/* Cover Image Upload */}
                                <div>
                                    <label className="admin-label">Cover Image</label>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 bg-white/[0.02] transition-all flex-1">
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            {uploading ? 'Uploading...' : 'Upload File'}
                                        </button>
                                        <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
                                            placeholder="or paste URL" className="admin-input flex-1" />
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    {coverImageUrl && (
                                        <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border border-white/10 relative group">
                                            <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setCoverImageUrl('')}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <X size={16} className="text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="admin-label">Google Drive Link</label>
                                    <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/..." className="admin-input w-full" />
                                </div>

                                <button type="submit" disabled={saving} className="admin-btn-primary w-full py-3.5 text-sm mt-2">
                                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Plus size={16} /> Add Product</>}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="text-[#d4ff00] animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <Package size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 text-sm">{searchQuery ? 'No matching products.' : 'No products yet. Add your first one!'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.map((product) => (
                            <motion.div key={product.id} layout
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#d4ff00]/15"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {/* Image */}
                                <div className="aspect-video overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img src={product.coverImageUrl} alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=400&q=60'; }} />
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${product.type === 'course'
                                            ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                                            : 'bg-[#d4ff00]/15 border border-[#d4ff00]/25 text-[#d4ff00]'
                                            }`}>
                                            {product.type || 'ebook'}
                                        </span>
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-white text-sm font-bold truncate mb-1">{product.title}</h3>
                                    {product.description && (
                                        <p className="text-white/25 text-xs line-clamp-2 mb-3">{product.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#d4ff00] text-lg font-bold font-mono">₹{(product.pricePaise / 100).toFixed(0)}</span>
                                        <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                                            className="p-2 rounded-lg border border-white/[0.06] text-white/25 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-all">
                                            {deleting === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                    {product.driveLink && product.driveLink !== '#' && (
                                        <a href={product.driveLink} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 mt-3 text-[10px] text-white/20 hover:text-[#d4ff00]/60 transition-colors truncate">
                                            <Link size={10} /> {product.driveLink}
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <style>{`
                .admin-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
                .admin-input { padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; color: white; font-size: 14px; outline: none; transition: all 0.3s; }
                .admin-input:focus { border-color: rgba(212,255,0,0.4); box-shadow: 0 0 20px rgba(212,255,0,0.08); }
                .admin-input::placeholder { color: rgba(255,255,255,0.15); }
                .admin-btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; background: #d4ff00; color: #050505; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 12px; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 25px rgba(212,255,0,0.25); }
                .admin-btn-primary:hover { box-shadow: 0 0 40px rgba(212,255,0,0.5); transform: translateY(-1px); }
                .admin-btn-primary:disabled { opacity: 0.5; }
            `}</style>
        </div>
    );
};

export default ProductsPage;
