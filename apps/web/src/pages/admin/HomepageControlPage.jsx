import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wand2, Image, MousePointer, Sparkles, Star, GripVertical,
    Plus, Trash2, Save, Loader2, CheckCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';
import { getAllProducts } from '@/lib/productStore';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...props }) => <input {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const TextArea = ({ rows = 3, ...props }) => <textarea rows={rows} {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all resize-y" />;
const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-2">
        <div><p className="text-white/70 text-sm">{label}</p>{desc && <p className="text-white/25 text-xs">{desc}</p>}</div>
        <button type="button" onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center"><Icon size={13} className="text-[#d4ff00]" /></div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em]">{title}</h3>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">{children}</div>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);

const HomepageControlPage = () => {
    const [settings, setSettings] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [newMarqueeUrl, setNewMarqueeUrl] = useState('');

    useEffect(() => {
        Promise.all([getSiteSettings(), getAllProducts()]).then(([s, p]) => {
            setSettings(s);
            setProducts(p);
            setLoading(false);
        });
    }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const addMarqueeImage = () => {
        if (!newMarqueeUrl.trim()) return;
        set('marqueeImages', [...(settings.marqueeImages || []), newMarqueeUrl.trim()]);
        setNewMarqueeUrl('');
    };
    const removeMarqueeImage = (idx) => set('marqueeImages', settings.marqueeImages.filter((_, i) => i !== idx));

    const toggleFeaturedProduct = (id) => {
        const current = settings.featuredProductIds || [];
        set('featuredProductIds', current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
    };

    const handleSave = async () => {
        setSaving(true);
        try { await updateSiteSettings(settings); showToast('✅ Homepage settings saved!'); }
        catch { showToast('❌ Failed to save.', 'error'); }
        setSaving(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Homepage Control</h1>
                    <p className="text-white/25 text-xs mt-1">Edit every element on your homepage without touching code</p>
                </div>
                <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
                </motion.button>
            </div>

            {/* Hero */}
            <Section icon={Wand2} title="Hero Section">
                <div><Label>Hero Title (large text)</Label><Input value={settings.heroTitle} onChange={e => set('heroTitle', e.target.value)} placeholder="Your Favourite" /></div>
                <div><Label>Hero Subtitle (highlighted)</Label><Input value={settings.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} placeholder="Motivational Speaker" /></div>
                <div><Label>Hero Subtext (small paragraph)</Label><TextArea value={settings.heroSubtext} onChange={e => set('heroSubtext', e.target.value)} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>CTA Button Text</Label><Input value={settings.heroCtaText} onChange={e => set('heroCtaText', e.target.value)} placeholder="Explore Now" /></div>
                    <div><Label>CTA Button Link</Label><Input value={settings.heroCtaLink} onChange={e => set('heroCtaLink', e.target.value)} placeholder="/shop" /></div>
                </div>
            </Section>

            {/* Animations */}
            <Section icon={Sparkles} title="Animations & Effects">
                <Toggle value={settings.glowEnabled ?? true} onChange={v => set('glowEnabled', v)} label="Glow Effects" desc="Golden glow highlights and hover glows" />
                <Toggle value={settings.fireAnimationEnabled ?? true} onChange={v => set('fireAnimationEnabled', v)} label="Fire Animation" desc="Fire particle effects in hero section" />
                <Toggle value={settings.scrollAnimationEnabled ?? true} onChange={v => set('scrollAnimationEnabled', v)} label="Scroll Animations" desc="Fade-in animations as user scrolls" />
                <Toggle value={settings.loaderEnabled ?? true} onChange={v => set('loaderEnabled', v)} label="Page Loader" desc="Loading animation on page entry" />
            </Section>

            {/* Marquee Images */}
            <Section icon={Image} title="Marquee / Slider Images (min 3 required to show)">
                <div className="space-y-2">
                    {(settings.marqueeImages || []).map((url, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                            <div className="w-16 h-9 rounded-lg overflow-hidden bg-white/[0.05] shrink-0">
                                <img src={url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.opacity = 0} />
                            </div>
                            <p className="flex-1 text-white/40 text-xs truncate">{url}</p>
                            <button onClick={() => removeMarqueeImage(idx)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <Input value={newMarqueeUrl} onChange={e => setNewMarqueeUrl(e.target.value)} placeholder="https://... (image URL)" onKeyDown={e => e.key === 'Enter' && addMarqueeImage()} />
                    <button onClick={addMarqueeImage} className="px-4 py-2.5 bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] rounded-xl hover:bg-[#d4ff00]/20 transition-all shrink-0">
                        <Plus size={16} />
                    </button>
                </div>
                <p className="text-white/20 text-xs">{settings.marqueeImages?.length || 0} images • {(settings.marqueeImages?.length || 0) >= 3 ? '✅ Slider will show' : '⚠️ Add at least 3 images for slider to appear'}</p>
            </Section>

            {/* Social Proof */}
            <Section icon={Star} title="Social Proof Pills">
                <Toggle value={settings.showSocialProof ?? true} onChange={v => set('showSocialProof', v)} label="Show Social Proof Pills" desc="YouTube & Instagram stats at the bottom of homepage" />
            </Section>

            {/* Featured Products */}
            <Section icon={Star} title="Featured Products (shown on Homepage)">
                <p className="text-white/30 text-xs mb-3">Select which products appear in the "Top Products" section on the homepage. If none selected, all products show.</p>
                {products.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-4">No products added yet</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {products.map(p => {
                            const selected = (settings.featuredProductIds || []).includes(p.id);
                            return (
                                <button key={p.id} type="button" onClick={() => toggleFeaturedProduct(p.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${selected ? 'border-[#d4ff00]/30 bg-[#d4ff00]/[0.04]' : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]'}`}>
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'border-[#d4ff00] bg-[#d4ff00]' : 'border-white/20'}`}>
                                        {selected && <CheckCircle size={10} className="text-black" />}
                                    </div>
                                    <div className="w-10 h-6 rounded overflow-hidden bg-white/[0.05] shrink-0">
                                        <img src={p.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{p.title}</p>
                                        <p className="text-white/30 text-xs">₹{(p.pricePaise / 100).toFixed(0)} · {p.type}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </Section>
        </div>
    );
};

export default HomepageControlPage;
