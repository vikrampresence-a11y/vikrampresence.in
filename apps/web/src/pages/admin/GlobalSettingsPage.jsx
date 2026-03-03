import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Image, Link, Mail, Phone, MapPin, Youtube, Instagram, MessageCircle,
    Search, BarChart2, Palette, CreditCard, AlertTriangle, Type, Zap, Save,
    CheckCircle, ChevronDown, Eye, EyeOff, Loader2, RefreshCw
} from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';

// ──────────────────────────────────────────────
// Reusable field components
// ──────────────────────────────────────────────
const Label = ({ children }) => (
    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>
);
const Input = ({ ...props }) => (
    <input {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all duration-200" />
);
const TextArea = ({ rows = 3, ...props }) => (
    <textarea rows={rows} {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all duration-200 resize-y" />
);
const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-white/60 text-sm">{label}</span>
        <button type="button" onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);
const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center">
                <Icon size={13} className="text-[#d4ff00]" />
            </div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em]">{title}</h3>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            {children}
        </div>
    </div>
);

// ──────────────────────────────────────────────
// Toast
// ──────────────────────────────────────────────
const Toast = ({ msg, type }) => (
    <AnimatePresence>
        {msg && (
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}
            >
                <CheckCircle size={16} />{msg}
            </motion.div>
        )}
    </AnimatePresence>
);

// ══════════════════════════════════════════════
// GLOBAL SETTINGS PAGE
// ══════════════════════════════════════════════
const GlobalSettingsPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        getSiteSettings().then(s => { setSettings(s); setLoading(false); });
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings(settings);
            showToast('✅ Settings saved successfully!');
        } catch (err) {
            showToast('❌ Failed to save settings.', 'error');
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="text-[#d4ff00] animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Global Settings</h1>
                    <p className="text-white/25 text-xs mt-1">Control everything your visitors see — no code required</p>
                </div>
                <motion.button onClick={handleSave} disabled={saving}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(212,255,0,0.25)] hover:shadow-[0_0_35px_rgba(212,255,0,0.4)] transition-all disabled:opacity-50">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save All
                </motion.button>
            </div>

            {/* ── 1. Brand ── */}
            <Section icon={Globe} title="Brand Identity">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Website Name</Label><Input value={settings.siteName} onChange={e => set('siteName', e.target.value)} placeholder="Vikram Presence" /></div>
                    <div><Label>Tagline</Label><Input value={settings.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Your tagline..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Logo URL</Label><Input value={settings.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." /></div>
                    <div><Label>Favicon URL</Label><Input value={settings.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." /></div>
                </div>
                <div><Label>Footer Text</Label><Input value={settings.footerText} onChange={e => set('footerText', e.target.value)} placeholder="© 2025 Vikram Presence" /></div>
            </Section>

            {/* ── 2. Social Links ── */}
            <Section icon={Link} title="Social Links">
                <div><Label>YouTube URL</Label>
                    <div className="flex gap-2"><span className="flex items-center px-3 rounded-xl bg-red-500/10 border border-white/[0.06]"><Youtube size={14} className="text-red-400" /></span>
                        <Input value={settings.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/@..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>YouTube Subscriber Count</Label><Input value={settings.youtubeCount} onChange={e => set('youtubeCount', e.target.value)} placeholder="55K+" /></div>
                </div>
                <div><Label>Instagram URL</Label>
                    <div className="flex gap-2"><span className="flex items-center px-3 rounded-xl bg-pink-500/10 border border-white/[0.06]"><Instagram size={14} className="text-pink-400" /></span>
                        <Input value={settings.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Instagram Follower Count</Label><Input value={settings.instagramCount} onChange={e => set('instagramCount', e.target.value)} placeholder="220K+" /></div>
                    <div><Label>WhatsApp Number (with country code)</Label><Input value={settings.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="917670926198" /></div>
                </div>
            </Section>

            {/* ── 3. Contact ── */}
            <Section icon={Mail} title="Contact Details">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email</Label><Input type="email" value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} /></div>
                    <div><Label>Phone</Label><Input value={settings.contactPhone} onChange={e => set('contactPhone', e.target.value)} /></div>
                </div>
                <div><Label>Address</Label><Input value={settings.contactAddress} onChange={e => set('contactAddress', e.target.value)} /></div>
            </Section>

            {/* ── 4. SEO ── */}
            <Section icon={Search} title="SEO & Analytics">
                <div><Label>Meta Title</Label><Input value={settings.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></div>
                <div><Label>Meta Description</Label><TextArea rows={2} value={settings.seoDescription} onChange={e => set('seoDescription', e.target.value)} /></div>
                <div><Label>Keywords (comma separated)</Label><Input value={settings.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} /></div>
                <div><Label>OG Image URL</Label><Input value={settings.ogImageUrl} onChange={e => set('ogImageUrl', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Google Analytics ID</Label><Input value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
                    <div><Label>Facebook Pixel ID</Label><Input value={settings.pixelId} onChange={e => set('pixelId', e.target.value)} placeholder="XXXXXXXXXXXXXXXXX" /></div>
                </div>
            </Section>

            {/* ── 5. Appearance ── */}
            <Section icon={Palette} title="Appearance & Design">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-3 items-center">
                            <input type="color" value={settings.accentColor} onChange={e => set('accentColor', e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                            <Input value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Font Family</Label>
                        <select value={settings.fontFamily} onChange={e => set('fontFamily', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#d4ff00]/40 transition-all">
                            {['Inter', 'Poppins', 'Roboto', 'Outfit', 'DM Sans', 'Sora', 'Plus Jakarta Sans'].map(f => (
                                <option key={f} value={f} className="bg-black">{f}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <Label>Glow Intensity: {settings.glowIntensity}%</Label>
                    <input type="range" min={0} max={100} value={settings.glowIntensity} onChange={e => set('glowIntensity', Number(e.target.value))}
                        className="w-full accent-[#d4ff00]" />
                </div>
                <div>
                    <Label>Animation Speed: {settings.animationSpeed}x</Label>
                    <input type="range" min={0.5} max={3} step={0.1} value={settings.animationSpeed} onChange={e => set('animationSpeed', Number(e.target.value))}
                        className="w-full accent-[#d4ff00]" />
                </div>
            </Section>

            {/* ── 6. Payment ── */}
            <Section icon={CreditCard} title="Payment Gateway (Razorpay)">
                <div className="flex items-center gap-3 mb-3">
                    {['test', 'live'].map(mode => (
                        <button key={mode} type="button" onClick={() => set('razorpayMode', mode)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-200 ${settings.razorpayMode === mode ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'bg-white/[0.02] border-white/[0.08] text-white/30'}`}>
                            {mode === 'test' ? '🧪 Test Mode' : '🚀 Live Mode'}
                        </button>
                    ))}
                </div>
                {settings.razorpayMode === 'live' && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl mb-3">
                        <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                        <p className="text-amber-400/80 text-xs">Live mode — real payments enabled. Double-check keys before saving.</p>
                    </div>
                )}
                <div><Label>Razorpay Key ID</Label><Input value={settings.razorpayKeyId} onChange={e => set('razorpayKeyId', e.target.value)} placeholder="rzp_test_..." /></div>
                <div>
                    <Label>Razorpay Key Secret</Label>
                    <div className="relative">
                        <Input type={showSecret ? 'text' : 'password'} value={settings.razorpayKeySecret} onChange={e => set('razorpayKeySecret', e.target.value)} placeholder="••••••••••••••••" />
                        <button type="button" onClick={() => setShowSecret(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>
                <div><Label>Currency</Label>
                    <select value={settings.currency} onChange={e => set('currency', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#d4ff00]/40">
                        <option value="INR" className="bg-black">INR — Indian Rupee (₹)</option>
                        <option value="USD" className="bg-black">USD — US Dollar ($)</option>
                    </select>
                </div>
            </Section>

            {/* ── 7. Maintenance ── */}
            <Section icon={AlertTriangle} title="Maintenance Mode">
                <Toggle value={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)} label="Enable Maintenance Mode" />
                {settings.maintenanceMode && (
                    <div>
                        <Label>Maintenance Message</Label>
                        <TextArea value={settings.maintenanceMessage} onChange={e => set('maintenanceMessage', e.target.value)} rows={2} />
                    </div>
                )}
            </Section>

            {/* Save button bottom */}
            <div className="flex justify-end">
                <motion.button onClick={handleSave} disabled={saving}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-8 py-3 bg-[#d4ff00] text-black font-bold rounded-xl shadow-[0_0_25px_rgba(212,255,0,0.2)] disabled:opacity-50">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save All Settings
                </motion.button>
            </div>
        </div>
    );
};

export default GlobalSettingsPage;
