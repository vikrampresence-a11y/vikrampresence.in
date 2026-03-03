import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag, Percent, Calendar, Hash, Plus, Trash2, Loader2, CheckCircle,
    Save, Zap, Clock, AlertTriangle
} from 'lucide-react';
import { getCoupons, addCoupon, deleteCoupon, getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...props }) => <input {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-white/60 text-sm">{label}</span>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);
const TABS = [
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'flashsale', label: 'Flash Sale', icon: Zap },
];

const PromotionsPage = () => {
    const [activeTab, setActiveTab] = useState('coupons');
    const [coupons, setCoupons] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [toast, setToast] = useState({ msg: '' });
    const [form, setForm] = useState({ code: '', discountPercent: 10, maxUses: 100, expiryDate: '' });

    useEffect(() => {
        Promise.all([getCoupons(), getSiteSettings()]).then(([c, s]) => {
            setCoupons(c); setSettings(s); setLoading(false);
        });
    }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const setS = (key, value) => setSettings(s => ({ ...s, [key]: value }));
    const setF = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleAddCoupon = async () => {
        if (!form.code.trim()) { showToast('❌ Enter a coupon code', 'error'); return; }
        setSaving(true);
        try {
            await addCoupon({ code: form.code.trim().toUpperCase(), discountPercent: Number(form.discountPercent), maxUses: Number(form.maxUses), expiryDate: form.expiryDate });
            setCoupons(await getCoupons());
            setForm({ code: '', discountPercent: 10, maxUses: 100, expiryDate: '' });
            showToast('✅ Coupon created!');
        } catch { showToast('❌ Failed to create coupon', 'error'); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        await deleteCoupon(id);
        setCoupons(await getCoupons());
        setDeleting(null);
        showToast('✅ Coupon deleted');
    };

    const saveFlashSale = async () => {
        setSaving(true);
        try { await updateSiteSettings({ flashSaleEnabled: settings.flashSaleEnabled, flashSaleEnd: settings.flashSaleEnd, flashSaleLabel: settings.flashSaleLabel }); showToast('✅ Flash sale settings saved!'); }
        catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Promotions</h1>
                <p className="text-white/25 text-xs mt-1">Manage coupons, flash sales, and discount campaigns</p>
            </div>

            <div className="flex gap-2 mb-8">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${activeTab === tab.id ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60'}`}>
                        <tab.icon size={13} />{tab.label}
                    </button>
                ))}
            </div>

            {/* Coupons */}
            {activeTab === 'coupons' && (
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Create Coupon Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Plus size={14} className="text-[#d4ff00]" /> Create Coupon</h3>
                            <div className="space-y-3">
                                <div>
                                    <Label>Coupon Code</Label>
                                    <Input value={form.code} onChange={e => setF('code', e.target.value.toUpperCase())} placeholder="e.g. VIKRAM20" />
                                </div>
                                <div>
                                    <Label>Discount Percentage (%)</Label>
                                    <div className="relative">
                                        <Input type="number" min={1} max={100} value={form.discountPercent} onChange={e => setF('discountPercent', e.target.value)} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 text-sm font-bold">%</span>
                                    </div>
                                </div>
                                <div>
                                    <Label>Max Uses</Label>
                                    <Input type="number" min={1} value={form.maxUses} onChange={e => setF('maxUses', e.target.value)} placeholder="100" />
                                </div>
                                <div>
                                    <Label>Expiry Date (optional)</Label>
                                    <Input type="date" value={form.expiryDate} onChange={e => setF('expiryDate', e.target.value)} />
                                </div>
                                <motion.button onClick={handleAddCoupon} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-[#d4ff00] text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Generate Coupon
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Coupons List */}
                    <div className="lg:col-span-3 space-y-3">
                        {coupons.length === 0 ? (
                            <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center">
                                <Tag size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/20 text-sm">No coupons yet. Create your first coupon!</p>
                            </div>
                        ) : coupons.map(coupon => {
                            const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                            const isFull = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                            return (
                                <div key={coupon.id} className={`p-4 border rounded-xl transition-all ${isExpired || isFull ? 'border-white/[0.04] opacity-50' : 'border-white/[0.08] bg-white/[0.02] hover:border-[#d4ff00]/15'}`}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 bg-[#d4ff00]/10 border border-[#d4ff00]/20 rounded-lg">
                                                <span className="text-[#d4ff00] font-black text-sm tracking-widest">{coupon.code}</span>
                                            </div>
                                            <div>
                                                <p className="text-white/70 text-sm font-semibold">{coupon.discountPercent}% OFF</p>
                                                <p className="text-white/25 text-xs">{coupon.usedCount || 0}/{coupon.maxUses} uses · {isExpired ? '⚠️ Expired' : isFull ? '⚠️ Limit reached' : '✅ Active'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/20 text-xs">
                                            {coupon.expiryDate && <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</span>}
                                            <button onClick={() => handleDelete(coupon.id)} disabled={deleting === coupon.id}
                                                className="p-2 rounded-lg border border-white/[0.06] hover:text-red-400 hover:border-red-400/20 transition-all">
                                                {deleting === coupon.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Flash Sale */}
            {activeTab === 'flashsale' && settings && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5 max-w-xl">
                    <Toggle value={settings.flashSaleEnabled || false} onChange={v => setS('flashSaleEnabled', v)} label="Enable Flash Sale Banner" />
                    {settings.flashSaleEnabled && (
                        <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-400/70 text-xs flex items-center gap-2">
                            <Zap size={12} /> Flash sale banner will appear on your website with countdown timer
                        </div>
                    )}
                    <div><Label>Sale Label Text</Label><Input value={settings.flashSaleLabel || '⚡ FLASH SALE — Limited Time!'} onChange={e => setS('flashSaleLabel', e.target.value)} /></div>
                    <div><Label>Sale End Date & Time</Label><Input type="datetime-local" value={settings.flashSaleEnd || ''} onChange={e => setS('flashSaleEnd', e.target.value)} /></div>
                    <motion.button onClick={saveFlashSale} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Flash Sale
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default PromotionsPage;
