import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageSquare, Mail, Link2, Shield, Loader2, Save, CheckCircle, Variable } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, addAuditLog } from '@/lib/siteSettings';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...p }) => <input {...p} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const TextArea = ({ rows = 4, ...p }) => <textarea rows={rows} {...p} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all resize-y" />;
const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-2.5">
        <div><p className="text-white/70 text-sm">{label}</p>{desc && <p className="text-white/25 text-xs mt-0.5">{desc}</p>}</div>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4 cursor-pointer ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
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

const VARS = ['{{name}}', '{{product}}', '{{email}}', '{{amount}}', '{{download_link}}', '{{date}}'];

const CheckoutControlPage = () => {
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
                successPageTitle: settings.successPageTitle, successPageMessage: settings.successPageMessage,
                paymentRedirectUrl: settings.paymentRedirectUrl, otpEnabled: settings.otpEnabled,
                whatsappEnabled: settings.whatsappEnabled, emailTemplate: settings.emailTemplate,
                emailSubject: settings.emailSubject,
            });
            await addAuditLog('UPDATE_CHECKOUT', 'Updated checkout control settings');
            showToast('✅ Checkout settings saved!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8">
                <div><h1 className="text-2xl font-bold text-white tracking-tight">Checkout Control</h1><p className="text-white/25 text-xs mt-1">Control what happens after payment — no code needed</p></div>
                <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </motion.button>
            </div>

            {/* Success Page */}
            <Section icon={MessageSquare} title="Thank You Page" desc="Text shown to buyer after successful payment">
                <div><Label>Page Title</Label><Input value={settings.successPageTitle || 'Payment Successful!'} onChange={e => set('successPageTitle', e.target.value)} /></div>
                <div><Label>Success Message</Label><TextArea rows={4} value={settings.successPageMessage || 'Thank you for your purchase! Your product is on its way.'} onChange={e => set('successPageMessage', e.target.value)} /></div>
                <div><Label>Redirect URL after purchase (leave blank to stay on thank you page)</Label><Input type="url" value={settings.paymentRedirectUrl || ''} onChange={e => set('paymentRedirectUrl', e.target.value)} placeholder="https://..." /></div>
            </Section>

            {/* Automations */}
            <Section icon={Shield} title="Automation Toggles">
                <Toggle value={settings.otpEnabled ?? true} onChange={v => set('otpEnabled', v)} label="OTP Verification System" desc="Require phone OTP before purchase" />
                <Toggle value={settings.whatsappEnabled ?? false} onChange={v => set('whatsappEnabled', v)} label="WhatsApp Auto-Send" desc="Send purchase confirmation via WhatsApp after payment" />
            </Section>

            {/* Email Template */}
            <Section icon={Mail} title="Purchase Confirmation Email" desc="Email sent automatically to buyer after payment">
                <div><Label>Email Subject</Label><Input value={settings.emailSubject || 'Your Purchase from Vikram Presence 🎉'} onChange={e => set('emailSubject', e.target.value)} /></div>
                <div>
                    <div className="flex items-center justify-between mb-2"><Label>Email Body Template</Label></div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {VARS.map(v => (
                            <button key={v} type="button" onClick={() => set('emailTemplate', (settings.emailTemplate || '') + v)}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00]/80 hover:bg-[#d4ff00]/20 transition-all cursor-pointer">{v}</button>
                        ))}
                    </div>
                    <TextArea rows={10} value={settings.emailTemplate || `Hi {{name}},\n\nThank you for purchasing {{product}}!\n\nYour download link: {{download_link}}\n\nAmount paid: ₹{{amount}}\nDate: {{date}}\n\nFor support, reply to this email.\n\nWarm regards,\nVikram Presence`} onChange={e => set('emailTemplate', e.target.value)} />
                </div>
                {/* Preview */}
                <div className="mt-4 p-4 bg-[#111] border border-white/[0.06] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-3">📧 Email Preview</p>
                    <p className="text-white/50 text-xs whitespace-pre-wrap leading-relaxed">
                        {(settings.emailTemplate || '').replace('{{name}}', 'Vikram').replace('{{product}}', 'Focus Mastery').replace('{{download_link}}', 'drive.google.com/...').replace('{{amount}}', '499').replace('{{date}}', new Date().toLocaleDateString('en-IN'))}
                    </p>
                </div>
            </Section>
        </div>
    );
};
export default CheckoutControlPage;
