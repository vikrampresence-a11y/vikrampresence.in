import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, Sliders, Zap, Save, Loader2, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, addAuditLog } from '@/lib/siteSettings';

const Label = ({ children, hint }) => (
    <div className="flex items-center justify-between mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{children}</label>
        {hint && <span className="text-[10px] text-white/20">{hint}</span>}
    </div>
);
const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
        <div><p className="text-white/70 text-sm">{label}</p>{desc && <p className="text-white/25 text-[11px] mt-0.5">{desc}</p>}</div>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4 cursor-pointer ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-5"><div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center"><Icon size={13} className="text-[#d4ff00]" /></div><h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em]">{title}</h3></div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-5">{children}</div>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={15} />{msg}</motion.div>}</AnimatePresence>
);

const FONTS = [
    { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap' },
    { name: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap' },
    { name: 'Outfit', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap' },
    { name: 'DM Sans', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&display=swap' },
    { name: 'Sora', url: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;900&display=swap' },
    { name: 'Plus Jakarta Sans', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;900&display=swap' },
    { name: 'Space Grotesk', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap' },
];

const DesignSystemPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '' });

    useEffect(() => { getSiteSettings().then(s => { setSettings(s); setLoading(false); }); }, []);
    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({
                accentColor: settings.accentColor, fontFamily: settings.fontFamily,
                glowIntensity: settings.glowIntensity, animationSpeed: settings.animationSpeed,
                buttonRadius: settings.buttonRadius, glowEnabled: settings.glowEnabled,
                scrollGlowEnabled: settings.scrollGlowEnabled, animationsEnabled: settings.animationsEnabled,
                neonEffectEnabled: settings.neonEffectEnabled, fireAnimationEnabled: settings.fireAnimationEnabled,
            });
            await addAuditLog('UPDATE_DESIGN_SYSTEM', 'Updated design system settings');
            // Apply instantly
            document.documentElement.style.setProperty('--accent', settings.accentColor);
            showToast('✅ Design system saved & applied!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const resetDefaults = () => setSettings(s => ({ ...s, accentColor: '#E2F034', fontFamily: 'Inter', glowIntensity: 50, animationSpeed: 1, buttonRadius: 12, glowEnabled: true, scrollGlowEnabled: true, animationsEnabled: true, neonEffectEnabled: true, fireAnimationEnabled: true }));

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8">
                <div><h1 className="text-2xl font-bold text-white tracking-tight">Design System</h1><p className="text-white/25 text-xs mt-1">Control the entire look & feel of your website</p></div>
                <div className="flex gap-3">
                    <button onClick={resetDefaults} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/[0.08] text-white/40 hover:text-white/60 cursor-pointer"><RefreshCw size={13} /> Reset</button>
                    <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save & Apply
                    </motion.button>
                </div>
            </div>

            {/* Live Preview Badge */}
            <div className="flex items-center gap-2 px-4 py-3 bg-green-500/[0.06] border border-green-500/15 rounded-xl mb-8 text-green-400/70 text-xs">
                <div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" /></div>
                Changes apply instantly to your live website via Firebase — no rebuild needed
            </div>

            {/* Accent Color */}
            <Section icon={Palette} title="Colors">
                <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-4 items-center">
                        <input type="color" value={settings.accentColor || '#E2F034'} onChange={e => set('accentColor', e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent flex-shrink-0" />
                        <div className="flex-1">
                            <input type="text" value={settings.accentColor || '#E2F034'} onChange={e => set('accentColor', e.target.value)} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#d4ff00]/40" />
                        </div>
                    </div>
                    {/* Color Presets */}
                    <div className="flex gap-3 mt-4 flex-wrap">
                        {['#E2F034', '#00FF94', '#FF6B35', '#FF3366', '#00D4FF', '#FFD700', '#B24BF3', '#FFFFFF'].map(c => (
                            <button key={c} type="button" onClick={() => set('accentColor', c)} className={`w-9 h-9 rounded-xl border-2 transition-all cursor-pointer ${settings.accentColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ background: c }} />
                        ))}
                    </div>
                </div>
            </Section>

            {/* Typography */}
            <Section icon={Type} title="Typography">
                <div>
                    <Label>Font Family</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {FONTS.map(f => (
                            <button key={f.name} type="button" onClick={() => set('fontFamily', f.name)}
                                className={`px-4 py-3 rounded-xl border text-sm text-left transition-all cursor-pointer ${settings.fontFamily === f.name ? 'border-[#d4ff00]/40 bg-[#d4ff00]/[0.06] text-[#d4ff00]' : 'border-white/[0.06] text-white/50 hover:border-white/[0.14]'}`}
                                style={{ fontFamily: f.name }}>
                                {f.name}
                                {settings.fontFamily === f.name && <span className="text-[9px] ml-2 opacity-60">● ACTIVE</span>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-[#111] border border-white/[0.06] rounded-xl">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Preview</p>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: settings.fontFamily }}>Vikram Presence</p>
                    <p className="text-white/40 text-sm mt-1" style={{ fontFamily: settings.fontFamily }}>Clarity · Discipline · Confidence</p>
                </div>
            </Section>

            {/* Sliders */}
            <Section icon={Sliders} title="Intensity Controls">
                <div>
                    <Label hint={`${settings.glowIntensity}%`}>Glow Intensity</Label>
                    <input type="range" min={0} max={100} value={settings.glowIntensity || 50} onChange={e => set('glowIntensity', Number(e.target.value))} className="w-full accent-[#d4ff00]" />
                    <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>0% — Off</span><span>100% — Max Glow</span></div>
                </div>
                <div>
                    <Label hint={`${settings.animationSpeed || 1}x`}>Animation Speed</Label>
                    <input type="range" min={0.25} max={3} step={0.25} value={settings.animationSpeed || 1} onChange={e => set('animationSpeed', Number(e.target.value))} className="w-full accent-[#d4ff00]" />
                    <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>0.25x — Slow</span><span>3x — Fast</span></div>
                </div>
                <div>
                    <Label hint={`${settings.buttonRadius || 12}px`}>Button Border Radius</Label>
                    <input type="range" min={0} max={32} step={2} value={settings.buttonRadius || 12} onChange={e => set('buttonRadius', Number(e.target.value))} className="w-full accent-[#d4ff00]" />
                    <div className="flex gap-3 mt-3">
                        <div className="flex-1 py-2.5 text-center text-xs font-bold text-black bg-[#d4ff00] transition-all" style={{ borderRadius: settings.buttonRadius || 12 }}>Preview Button</div>
                    </div>
                </div>
            </Section>

            {/* Effect Toggles */}
            <Section icon={Zap} title="Visual Effects">
                <Toggle value={settings.animationsEnabled ?? true} onChange={v => set('animationsEnabled', v)} label="Global Animations" desc="Fade-in, slide-up, scale animations on scroll" />
                <Toggle value={settings.glowEnabled ?? true} onChange={v => set('glowEnabled', v)} label="Glow Effects" desc="Neon glow on buttons, hover states, highlights" />
                <Toggle value={settings.scrollGlowEnabled ?? true} onChange={v => set('scrollGlowEnabled', v)} label="Scroll-Trigger Glow" desc="Sections glow as user scrolls past them" />
                <Toggle value={settings.neonEffectEnabled ?? true} onChange={v => set('neonEffectEnabled', v)} label="Neon Text Effect" desc="Glowing neon highlight on hero text" />
                <Toggle value={settings.fireAnimationEnabled ?? true} onChange={v => set('fireAnimationEnabled', v)} label="Fire Animation" desc="Fire particle effect in hero section" />
            </Section>
        </div>
    );
};
export default DesignSystemPage;
