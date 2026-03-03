import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, FileCode, Share2, Download, CheckCircle, Loader2, Save, Eye } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, addAuditLog } from '@/lib/siteSettings';

const Input = ({ ...p }) => <input {...p} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const TextArea = ({ rows = 4, ...p }) => <textarea rows={rows} {...p} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all resize-y" />;
const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Section = ({ icon: Icon, title, desc, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2"><div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center"><Icon size={13} className="text-[#d4ff00]" /></div><h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em]">{title}</h3></div>
        {desc && <p className="text-white/25 text-xs mb-4 ml-9">{desc}</p>}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">{children}</div>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={15} />{msg}</motion.div>}</AnimatePresence>
);

const PAGES = [
    { key: 'home', label: 'Homepage (/)' },
    { key: 'shop', label: 'Shop Page (/shop)' },
    { key: 'about', label: 'About Page (/about)' },
    { key: 'contact', label: 'Contact (/contact)' },
    { key: 'blog', label: 'Blog (/blog)' },
];

const SeoCommandCenterPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '' });
    const [activePage, setActivePage] = useState('home');
    const [tab, setTab] = useState('meta');

    useEffect(() => getSiteSettings().then(s => { setSettings(s); setLoading(false); }), []);
    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));
    const setPageSeo = (page, field, val) => setSettings(s => ({ ...s, pageSeo: { ...(s.pageSeo || {}), [page]: { ...(s.pageSeo?.[page] || {}), [field]: val } } }));
    const pageSeo = (page) => settings?.pageSeo?.[page] || {};

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({ pageSeo: settings.pageSeo, seoTitle: settings.seoTitle, seoDescription: settings.seoDescription, seoKeywords: settings.seoKeywords, ogImage: settings.ogImage });
            await addAuditLog('UPDATE_SEO', 'Updated SEO settings');
            showToast('✅ SEO settings saved!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const downloadSitemap = () => {
        const urls = ['', 'shop', 'about', 'about/privacy', 'about/terms', 'about/refund', 'blog'].map(path => `  <url><loc>https://vikrampresence.in/${path}</loc><changefreq>weekly</changefreq><priority>${path === '' ? '1.0' : '0.8'}</priority></url>`).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        const blob = new Blob([xml], { type: 'application/xml' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sitemap.xml'; a.click();
        showToast('✅ Sitemap downloaded');
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    // OG Preview
    const ogTitle = pageSeo(activePage).title || settings?.seoTitle || 'Vikram Presence';
    const ogDesc = pageSeo(activePage).description || settings?.seoDescription || '';
    const ogImg = settings?.ogImage || '';

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div><h1 className="text-2xl font-bold text-white tracking-tight">SEO Command Center</h1><p className="text-white/25 text-xs mt-1">Per-page meta, OG tags, sitemap, and schema</p></div>
                <div className="flex gap-3">
                    <button onClick={downloadSitemap} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/40 text-sm font-bold hover:text-white/60 cursor-pointer"><Download size={14} /> Sitemap</button>
                    <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </motion.button>
                </div>
            </div>

            {/* Tab */}
            <div className="flex gap-2 mb-8">
                {[{ id: 'meta', label: 'Per-Page Meta', icon: FileCode }, { id: 'global', label: 'Global Meta', icon: Globe }, { id: 'og', label: 'OG Preview', icon: Share2 }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${tab === t.id ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'border-white/[0.06] text-white/40 hover:text-white/60'}`}><t.icon size={13} />{t.label}</button>
                ))}
            </div>

            {tab === 'meta' && (
                <div>
                    {/* Page Selector */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {PAGES.map(p => (
                            <button key={p.key} onClick={() => setActivePage(p.key)} className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${activePage === p.key ? 'border-[#d4ff00]/40 bg-[#d4ff00]/[0.06] text-[#d4ff00]' : 'border-white/[0.06] text-white/30 hover:text-white/50'}`}>{p.label}</button>
                        ))}
                    </div>
                    <Section icon={Search} title={`${PAGES.find(p => p.key === activePage)?.label} — SEO`}>
                        <div><Label>Meta Title (shown in Google results)</Label><Input value={pageSeo(activePage).title || ''} onChange={e => setPageSeo(activePage, 'title', e.target.value)} placeholder={`Vikram Presence — ${activePage}`} /></div>
                        <div><Label>Meta Description</Label><TextArea rows={3} value={pageSeo(activePage).description || ''} onChange={e => setPageSeo(activePage, 'description', e.target.value)} placeholder="150-160 characters description for Google..." /></div>
                        <div><Label>Keywords (comma separated)</Label><Input value={pageSeo(activePage).keywords || ''} onChange={e => setPageSeo(activePage, 'keywords', e.target.value)} placeholder="mindset, confidence, ebook, vikram" /></div>
                        <div className="flex items-baseline gap-3 text-xs text-white/25 mt-1">
                            <span>Title: {(pageSeo(activePage).title || '').length}/60 chars</span>
                            <span>Desc: {(pageSeo(activePage).description || '').length}/160 chars</span>
                        </div>
                    </Section>
                </div>
            )}

            {tab === 'global' && (
                <Section icon={Globe} title="Default / Fallback Meta Tags" desc="Used when a page doesn't have its own specific meta tags">
                    <div><Label>Default Meta Title</Label><Input value={settings.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} placeholder="Vikram Presence — Clarity, Discipline, Confidence" /></div>
                    <div><Label>Default Meta Description</Label><TextArea rows={3} value={settings.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} /></div>
                    <div><Label>Global Keywords</Label><Input value={settings.seoKeywords || ''} onChange={e => set('seoKeywords', e.target.value)} /></div>
                    <div><Label>OG Image URL (shown when shared on WhatsApp/Twitter/Facebook)</Label><Input type="url" value={settings.ogImage || ''} onChange={e => set('ogImage', e.target.value)} placeholder="https://vikrampresence.in/og-image.png" /></div>
                    <div><Label>Google Analytics ID</Label><Input value={settings.googleAnalyticsId || ''} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
                </Section>
            )}

            {tab === 'og' && (
                <div className="space-y-8">
                    {/* Facebook/WhatsApp Preview */}
                    <div>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-4">📘 Facebook / WhatsApp Preview</p>
                        <div className="max-w-sm rounded-xl overflow-hidden border border-white/[0.08] bg-[#1c1e21]">
                            <div className="aspect-video bg-white/[0.05] overflow-hidden">
                                {ogImg ? <img src={ogImg} alt="OG" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-sm">No OG image set</div>}
                            </div>
                            <div className="p-4">
                                <p className="text-[#bebebe] text-[10px] uppercase tracking-wider mb-1">vikrampresence.in</p>
                                <p className="text-white text-sm font-semibold leading-snug mb-1.5">{ogTitle}</p>
                                <p className="text-[#b0b3b8] text-xs leading-relaxed line-clamp-2">{ogDesc}</p>
                            </div>
                        </div>
                    </div>
                    {/* Twitter Preview */}
                    <div>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-4">🐦 Twitter / X Preview</p>
                        <div className="max-w-sm rounded-2xl overflow-hidden border border-white/[0.12] bg-black">
                            <div className="aspect-video bg-white/[0.05] overflow-hidden">
                                {ogImg ? <img src={ogImg} alt="OG" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-sm">No OG image set</div>}
                            </div>
                            <div className="p-3 border-t border-white/[0.08]">
                                <p className="text-white/80 text-sm font-semibold truncate">{ogTitle}</p>
                                <p className="text-white/40 text-xs">vikrampresence.in</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SeoCommandCenterPage;
