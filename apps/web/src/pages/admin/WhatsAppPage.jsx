import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, CheckCircle, Loader2, Save, AlertTriangle, RefreshCw, Variable } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...props }) => <input {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const TextArea = ({ rows = 6, ...props }) => <textarea rows={rows} {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all font-mono text-xs resize-y" />;
const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-2">
        <div><p className="text-white/70 text-sm">{label}</p>{desc && <p className="text-white/25 text-xs">{desc}</p>}</div>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);

const VARIABLES = ['{{name}}', '{{product}}', '{{link}}', '{{amount}}', '{{date}}'];

const WhatsAppPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '' });
    const [testPhone, setTestPhone] = useState('');
    const [testSending, setTestSending] = useState(false);

    useEffect(() => { getSiteSettings().then(s => { setSettings(s); setLoading(false); }); }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({ whatsappEnabled: settings.whatsappEnabled, whatsappTemplate: settings.whatsappTemplate, whatsappNumber: settings.whatsappNumber });
            showToast('✅ WhatsApp settings saved!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const insertVariable = (v) => set('whatsappTemplate', (settings.whatsappTemplate || '') + v);

    const sendTestMessage = async () => {
        if (!testPhone.trim()) { showToast('❌ Enter a phone number', 'error'); return; }
        setTestSending(true);
        // Build WhatsApp URL with the template (replace variables with sample values)
        const sampleMsg = (settings.whatsappTemplate || '')
            .replace('{{name}}', 'Test User')
            .replace('{{product}}', 'Sample Ebook')
            .replace('{{link}}', 'https://drive.google.com/sample')
            .replace('{{amount}}', '₹499')
            .replace('{{date}}', new Date().toLocaleDateString('en-IN'));
        const url = `https://wa.me/${testPhone.replace(/\D/g, '')}?text=${encodeURIComponent(sampleMsg)}`;
        window.open(url, '_blank');
        showToast('✅ WhatsApp opened with test message');
        setTestSending(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    // Live preview
    const preview = (settings?.whatsappTemplate || '')
        .replace('{{name}}', 'Vikram')
        .replace('{{product}}', 'Focus Mastery Ebook')
        .replace('{{link}}', 'https://drive.google.com/file/...')
        .replace('{{amount}}', '₹499')
        .replace('{{date}}', new Date().toLocaleDateString('en-IN'));

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Automation</h1>
                    <p className="text-white/25 text-xs mt-1">Auto-send delivery messages to buyers after purchase</p>
                </div>
                <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </motion.button>
            </div>

            {/* Enable Toggle */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <Toggle value={settings.whatsappEnabled || false} onChange={v => set('whatsappEnabled', v)} label="Enable WhatsApp Automation" desc="Automatically send purchase confirmation on buyer's WhatsApp" />
                {settings.whatsappEnabled && (
                    <div className="mt-3 p-3 bg-green-500/[0.06] border border-green-500/15 rounded-xl text-green-400/70 text-xs flex items-center gap-2">
                        <CheckCircle size={12} /> WhatsApp automation is ACTIVE — messages will be sent after each successful payment
                    </div>
                )}
            </div>

            {/* Business Phone */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <Label>Your WhatsApp Business Number (with country code, no +)</Label>
                <Input value={settings.whatsappNumber || ''} onChange={e => set('whatsappNumber', e.target.value)} placeholder="917670926198" />
            </div>

            {/* Template Editor */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Label>Message Template</Label>
                        <p className="text-white/25 text-xs">Use dynamic variables that get replaced with real data</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    {VARIABLES.map(v => (
                        <button key={v} onClick={() => insertVariable(v)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00]/80 hover:bg-[#d4ff00]/20 transition-all">
                            {v}
                        </button>
                    ))}
                </div>
                <TextArea rows={8} value={settings.whatsappTemplate || ''} onChange={e => set('whatsappTemplate', e.target.value)} placeholder="Hi {{name}}! Your purchase of *{{product}}* is confirmed.&#10;&#10;Access your content here: {{link}}&#10;&#10;Thank you! 🙏" />
            </div>

            {/* Preview */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">📱 Message Preview</p>
                <div className="bg-[#1a1a1a] rounded-2xl p-4 max-w-xs">
                    <div className="bg-[#d4ff00]/10 rounded-xl rounded-tl-sm p-3">
                        <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap">{preview}</p>
                        <p className="text-white/20 text-[10px] mt-2 text-right">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            {/* Test Send */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-white/60 text-sm font-semibold mb-3">Send Test Message</p>
                <div className="flex gap-3">
                    <Input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="91XXXXXXXXXX (with country code)" />
                    <motion.button onClick={sendTestMessage} disabled={testSending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm rounded-xl shrink-0 hover:bg-green-500/20 disabled:opacity-50">
                        {testSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Test
                    </motion.button>
                </div>
                <p className="text-white/20 text-xs mt-2">This will open WhatsApp with a sample message for the number provided.</p>
            </div>
        </div>
    );
};

export default WhatsAppPage;
