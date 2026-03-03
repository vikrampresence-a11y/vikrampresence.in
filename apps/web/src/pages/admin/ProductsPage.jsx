import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Package, Loader2, Book, MonitorPlay, Edit3,
    Upload, X, Link, Star, Tag, Calendar, Eye, Flame, CheckCircle,
    Search, ChevronDown, Hash, Percent, ToggleLeft, ToggleRight, Copy
} from 'lucide-react';
import { subscribeProducts, addProduct, deleteProduct, updateProduct } from '@/lib/productStore';
import { addAuditLog } from '@/lib/siteSettings';

// ═══════════════════════════════════════════════════════
// PRODUCTS V3 — Full Product Management Pro
// Edit, Discount, Bestseller, Featured, Category, Slug, Schedule
// ═══════════════════════════════════════════════════════

const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
const UPLOAD_URL = isShopDomain ? '/api/upload-image.php' : null;

const CATEGORIES = ['Mindset', 'Confidence', 'Productivity', 'Discipline', 'Focus', 'Communication', 'Leadership', 'Relationships', 'Finance', 'Other'];

// ── Helpers ──
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5">{children}</label>;
const Input = ({ ...p }) => <input {...p} className="admin-input w-full" />;
const Select = ({ children, ...p }) => <select {...p} className="admin-input w-full bg-[#0e0e0e]">{children}</select>;
const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-white/50 text-xs">{label}</span>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={15} />{msg}</motion.div>}</AnimatePresence>
);

const EMPTY_FORM = { title: '', description: '', priceRupees: '', discountPercent: 0, coverImageUrl: '', driveLink: '', type: 'ebook', category: 'Mindset', slug: '', featured: false, bestseller: false, publishDate: '', active: true };

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [activeFilter, setActiveFilter] = useState('all');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsub = subscribeProducts((items) => { setProducts(items); setLoading(false); });
        return () => unsub();
    }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3500); };
    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Auto-slug from title
    const handleTitleChange = (val) => {
        setF('title', val);
        if (!editingProduct) setF('slug', slugify(val));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) { showToast('Only JPG, PNG, WebP, GIF allowed.', 'error'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('Max file size: 5MB.', 'error'); return; }
        if (UPLOAD_URL) {
            setUploading(true);
            try {
                const form = new FormData(); form.append('image', file);
                const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
                const data = await res.json();
                if (data.success && data.url) setF('coverImageUrl', data.url);
                else showToast(data.error || 'Upload failed', 'error');
            } catch { showToast('Upload failed', 'error'); }
            setUploading(false);
        } else {
            const reader = new FileReader();
            reader.onload = () => setF('coverImageUrl', reader.result);
            reader.readAsDataURL(file);
        }
    };

    const openAdd = () => { setForm(EMPTY_FORM); setEditingProduct(null); setShowForm(true); };
    const openEdit = (p) => {
        setEditingProduct(p);
        setForm({ title: p.title || '', description: p.description || '', priceRupees: p.pricePaise ? (p.pricePaise / 100).toString() : '', discountPercent: p.discountPercent || 0, coverImageUrl: p.coverImageUrl || '', driveLink: p.driveLink || '', type: p.type || 'ebook', category: p.category || 'Mindset', slug: p.slug || slugify(p.title || ''), featured: p.featured || false, bestseller: p.bestseller || false, publishDate: p.publishDate || '', active: p.active !== false });
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditingProduct(null); setForm(EMPTY_FORM); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.priceRupees || !form.coverImageUrl || !form.driveLink) { showToast('All fields required', 'error'); return; }
        const pricePaise = Math.round(parseFloat(form.priceRupees) * 100);
        if (isNaN(pricePaise) || pricePaise <= 0) { showToast('Enter valid price', 'error'); return; }
        setSaving(true);
        try {
            const data = { title: form.title, description: form.description, pricePaise, discountPercent: Number(form.discountPercent) || 0, coverImageUrl: form.coverImageUrl, driveLink: form.driveLink, type: form.type, category: form.category, slug: form.slug || slugify(form.title), featured: form.featured, bestseller: form.bestseller, publishDate: form.publishDate, active: form.active };
            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
                await addAuditLog('UPDATE_PRODUCT', `Updated product: ${form.title}`);
                showToast('✅ Product updated!');
            } else {
                await addProduct(data);
                await addAuditLog('ADD_PRODUCT', `Added product: ${form.title}`);
                showToast('✅ Product added!');
            }
            closeForm();
        } catch { showToast('❌ Failed to save', 'error'); }
        setSaving(false);
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Delete "${title}"?`)) return;
        setDeleting(id);
        try { await deleteProduct(id); await addAuditLog('DELETE_PRODUCT', `Deleted product: ${title}`); showToast('✅ Deleted'); }
        catch { showToast('❌ Delete failed', 'error'); }
        setDeleting(null);
    };

    const filtered = products.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchSearch = p.title?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
        const matchFilter = activeFilter === 'all' || (activeFilter === 'featured' && p.featured) || (activeFilter === 'bestseller' && p.bestseller) || (activeFilter === p.type);
        return matchSearch && matchFilter;
    });

    // Discounted price
    const discountedPrice = (pricePaise, pct) => pct > 0 ? Math.round(pricePaise * (1 - pct / 100)) : pricePaise;

    return (
        <div>
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
                    <p className="text-white/30 text-sm mt-1">{products.length} total · {products.filter(p => p.featured).length} featured · {products.filter(p => p.bestseller).length} bestsellers</p>
                </div>
                <button onClick={openAdd} className="admin-btn-primary px-5 py-3 text-xs"><Plus size={16} /> Add Product</button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="admin-input pl-11 w-full" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'ebook', 'course', 'featured', 'bestseller'].map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${activeFilter === f ? 'bg-[#d4ff00]/10 border-[#d4ff00]/30 text-[#d4ff00]' : 'border-white/[0.06] text-white/30 hover:text-white/50'}`}>{f}</button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <Package size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 text-sm">{searchQuery ? 'No matching products.' : 'No products yet. Add your first one!'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.map((product) => {
                            const origPrice = product.pricePaise / 100;
                            const hasDiscount = product.discountPercent > 0;
                            const finalPrice = hasDiscount ? discountedPrice(product.pricePaise, product.discountPercent) / 100 : origPrice;
                            const isScheduled = product.publishDate && new Date(product.publishDate) > new Date();
                            return (
                                <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#d4ff00]/15 ${!product.active ? 'opacity-50' : ''}`}
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {/* Image */}
                                    <div className="aspect-video overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=400&q=60'; }} />
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 z-20 flex gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${product.type === 'course' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-[#d4ff00]/15 border border-[#d4ff00]/25 text-[#d4ff00]'}`}>{product.type || 'ebook'}</span>
                                            {product.bestseller && <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center gap-1"><Flame size={8} /> Best</span>}
                                            {product.featured && <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center gap-1"><Star size={8} /> Featured</span>}
                                            {isScheduled && <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center gap-1"><Calendar size={8} /> Scheduled</span>}
                                        </div>
                                        {hasDiscount && (
                                            <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-lg text-[9px] font-black bg-red-500/80 text-white">-{product.discountPercent}%</div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-white text-sm font-bold truncate flex-1">{product.title}</h3>
                                            {product.category && <span className="px-2 py-0.5 rounded text-[9px] text-white/30 border border-white/[0.06] shrink-0">{product.category}</span>}
                                        </div>
                                        {product.description && <p className="text-white/25 text-xs line-clamp-2 mb-3">{product.description}</p>}
                                        {product.slug && <p className="text-white/15 text-[10px] font-mono mb-3">/{product.slug}</p>}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[#d4ff00] text-lg font-bold font-mono">₹{finalPrice.toFixed(0)}</span>
                                                {hasDiscount && <span className="text-white/25 text-xs line-through ml-2 font-mono">₹{origPrice.toFixed(0)}</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(product)} className="p-2 rounded-lg border border-white/[0.06] text-white/25 hover:text-[#d4ff00] hover:border-[#d4ff00]/20 transition-all cursor-pointer"><Edit3 size={13} /></button>
                                                <button onClick={() => handleDelete(product.id, product.title)} disabled={deleting === product.id} className="p-2 rounded-lg border border-white/[0.06] text-white/25 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-all cursor-pointer">
                                                    {deleting === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }}
                            className="fixed inset-4 md:inset-auto md:top-[3%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 rounded-2xl overflow-y-auto max-h-[94vh]"
                            style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 100px rgba(0,0,0,0.9)' }}>

                            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 z-10" style={{ background: '#0c0c0c' }}>
                                <h2 className="text-lg font-bold text-white">{editingProduct ? '✏️ Edit Product' : '➕ New Product'}</h2>
                                <button onClick={closeForm} className="text-white/40 hover:text-white p-1 cursor-pointer"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Type */}
                                <div className="flex gap-3">
                                    {[{ t: 'ebook', icon: Book, label: 'Ebook' }, { t: 'course', icon: MonitorPlay, label: 'Course' }].map(({ t, icon: I, label }) => (
                                        <button key={t} type="button" onClick={() => setF('type', t)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all cursor-pointer ${form.type === t ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'}`}>
                                            <I size={16} /> {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. Content Creation Mastery" required /></div>
                                    <div><Label>Price (₹)</Label><Input type="number" step="1" min="1" value={form.priceRupees} onChange={e => setF('priceRupees', e.target.value)} placeholder="499" required /></div>
                                    <div><Label>Discount % (0 = none)</Label>
                                        <div className="relative"><Input type="number" min="0" max="90" value={form.discountPercent} onChange={e => setF('discountPercent', e.target.value)} placeholder="0" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                </div>

                                {form.discountPercent > 0 && form.priceRupees && (
                                    <div className="px-4 py-2.5 bg-green-500/[0.06] border border-green-500/15 rounded-xl text-green-400 text-xs flex items-center gap-2">
                                        <CheckCircle size={12} /> Final price: ₹{Math.round(parseFloat(form.priceRupees) * (1 - form.discountPercent / 100))} (saving ₹{Math.round(parseFloat(form.priceRupees) * form.discountPercent / 100)})
                                    </div>
                                )}

                                <div><Label>Description</Label><textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="What the buyer will learn..." rows={3} maxLength={1000} className="admin-input w-full resize-none" /></div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Category</Label>
                                        <Select value={form.category} onChange={e => setF('category', e.target.value)}>
                                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                        </Select>
                                    </div>
                                    <div><Label>URL Slug</Label>
                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">/</span>
                                            <Input value={form.slug} onChange={e => setF('slug', slugify(e.target.value))} className="pl-6" placeholder="my-product" />
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <div><Label>Cover Image (16:9)</Label>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 bg-white/[0.02] transition-all flex-1 cursor-pointer">
                                            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                        <input type="url" value={form.coverImageUrl} onChange={e => setF('coverImageUrl', e.target.value)} placeholder="or paste URL" className="admin-input flex-1" />
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    {form.coverImageUrl && (
                                        <div className="mt-3 aspect-video w-full max-w-xs rounded-xl overflow-hidden border border-white/10 relative group">
                                            <img src={form.coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setF('coverImageUrl', '')} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"><X size={16} className="text-white" /></button>
                                        </div>
                                    )}
                                </div>

                                <div><Label>Google Drive Link</Label><Input type="url" value={form.driveLink} onChange={e => setF('driveLink', e.target.value)} placeholder="https://drive.google.com/..." required /></div>

                                <div><Label>Schedule Publish Date (optional — leave blank to publish now)</Label><Input type="datetime-local" value={form.publishDate} onChange={e => setF('publishDate', e.target.value)} /></div>

                                {/* Toggles */}
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-2">
                                    <Toggle value={form.active} onChange={v => setF('active', v)} label="Active (visible on shop)" />
                                    <Toggle value={form.featured} onChange={v => setF('featured', v)} label="Featured (shown on homepage)" />
                                    <Toggle value={form.bestseller} onChange={v => setF('bestseller', v)} label="Bestseller Badge (shows 🔥 badge)" />
                                </div>

                                <button type="submit" disabled={saving} className="admin-btn-primary w-full py-4 text-sm mt-2 cursor-pointer">
                                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingProduct ? <><Edit3 size={16} /> Update Product</> : <><Plus size={16} /> Add Product</>}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .admin-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
                .admin-input { padding: 11px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; color: white; font-size: 13px; outline: none; transition: all 0.25s; }
                .admin-input:focus { border-color: rgba(212,255,0,0.4); box-shadow: 0 0 20px rgba(212,255,0,0.06); }
                .admin-input::placeholder { color: rgba(255,255,255,0.15); }
                .admin-input option { background: #111; }
                .admin-btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; background: #d4ff00; color: #050505; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 12px; border: none; cursor: pointer; transition: all 0.25s; box-shadow: 0 0 25px rgba(212,255,0,0.2); }
                .admin-btn-primary:hover { box-shadow: 0 0 40px rgba(212,255,0,0.45); transform: translateY(-1px); }
                .admin-btn-primary:disabled { opacity: 0.5; transform: none; }
            `}</style>
        </div>
    );
};
export default ProductsPage;
