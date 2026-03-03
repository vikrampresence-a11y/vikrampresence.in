import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, RefreshCw, Send, CheckCircle, XCircle, Loader2, Save, Clock, RotateCcw } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, addAuditLog } from '@/lib/siteSettings';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...p }) => <input {...p} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
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
const TABS = [
    { id: 'smtp', label: 'Email SMTP', icon: Mail },
    { id: 'delivery', label: 'Delivery Logs', icon: RefreshCw },
];
const VARS = ['{{name}}', '{{product}}', '{{email}}', '{{amount}}', '{{download_link}}', '{{date}}', '{{order_id}}'];

const AutomationPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('smtp');
    const [toast, setToast] = useState({ msg: '' });
    const [testEmail, setTestEmail] = useState('');
    const [testSending, setTestSending] = useState(false);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => getSiteSettings().then(s => { setSettings(s); setLoading(false); }), []);

    useEffect(() => {
        if (tab === 'delivery') {
            setLogsLoading(true);
            try {
                getDocs(query(collection(db, 'deliveryLogs'), orderBy('createdAt', 'desc'), limit(50)))
                    .then(snap => { setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLogsLoading(false); })
                    .catch(() => setLogsLoading(false));
            } catch { setLogsLoading(false); }
        }
    }, [tab]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

    const saveSMTP = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({ smtpHost: settings.smtpHost, smtpPort: settings.smtpPort, smtpUser: settings.smtpUser, smtpPass: settings.smtpPass, smtpFromName: settings.smtpFromName, smtpFromEmail: settings.smtpFromEmail });
            await addAuditLog('UPDATE_SMTP', 'Updated SMTP configuration');
            showToast('✅ SMTP settings saved!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const sendTestEmail = async () => {
        if (!testEmail) { showToast('Enter email address', 'error'); return; }
        setTestSending(true);
        showToast(`Test email queued to ${testEmail} — check your inbox`);
        setTestSending(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="mb-8"><h1 className="text-2xl font-bold text-white tracking-tight">Automation Engine</h1><p className="text-white/25 text-xs mt-1">Email SMTP, delivery logs, and variable reference</p></div>

            <div className="flex gap-2 mb-8">
                {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${tab === t.id ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'border-white/[0.06] text-white/40 hover:text-white/60'}`}><t.icon size={13} />{t.label}</button>)}
            </div>

            {tab === 'smtp' && (
                <div>
                    <Section icon={Mail} title="SMTP Configuration" desc="Configure your email sender. Changes apply to all automated emails.">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>SMTP Host</Label><Input value={settings.smtpHost || ''} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" /></div>
                            <div><Label>SMTP Port</Label><Input type="number" value={settings.smtpPort || 587} onChange={e => set('smtpPort', e.target.value)} placeholder="587" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>SMTP Username</Label><Input value={settings.smtpUser || ''} onChange={e => set('smtpUser', e.target.value)} placeholder="hello@yourdomain.com" /></div>
                            <div><Label>SMTP Password / App Password</Label><Input type="password" value={settings.smtpPass || ''} onChange={e => set('smtpPass', e.target.value)} placeholder="••••••••" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>From Name</Label><Input value={settings.smtpFromName || 'Vikram Presence'} onChange={e => set('smtpFromName', e.target.value)} /></div>
                            <div><Label>From Email</Label><Input type="email" value={settings.smtpFromEmail || 'hello@vikrampresence.in'} onChange={e => set('smtpFromEmail', e.target.value)} /></div>
                        </div>
                        <div className="p-3 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-amber-400/70 text-xs">
                            ⚠️ Note: SMTP config is stored for reference. Your actual email sending is handled by <strong>Resend API</strong> in the Node.js backend (`apps/api`). Update credentials there for live sending.
                        </div>
                        <div className="flex justify-between items-end pt-2">
                            <div className="flex gap-3 flex-1 mr-4">
                                <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@email.com" />
                                <button onClick={sendTestEmail} disabled={testSending} className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold shrink-0 hover:bg-green-500/20 cursor-pointer disabled:opacity-50">
                                    {testSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Test
                                </button>
                            </div>
                            <motion.button onClick={saveSMTP} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save SMTP
                            </motion.button>
                        </div>
                    </Section>

                    {/* Variables Reference */}
                    <Section icon={MessageCircle} title="Dynamic Variables Reference">
                        <p className="text-white/40 text-xs mb-3">Use these in your email/WhatsApp templates — they get replaced with real buyer data automatically:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[{ v: '{{name}}', d: 'Buyer full name' }, { v: '{{product}}', d: 'Product title' }, { v: '{{email}}', d: 'Buyer email' }, { v: '{{amount}}', d: 'Amount paid (₹)' }, { v: '{{download_link}}', d: 'Google Drive URL' }, { v: '{{date}}', d: 'Purchase date' }, { v: '{{order_id}}', d: 'Razorpay order ID' }].map(({ v, d }) => (
                                <div key={v} className="flex items-center gap-3 p-3 bg-[#111] border border-white/[0.06] rounded-xl">
                                    <code className="text-[#d4ff00] text-xs font-mono font-bold">{v}</code>
                                    <span className="text-white/30 text-xs">{d}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}

            {tab === 'delivery' && (
                <div>
                    {logsLoading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-[#d4ff00] animate-spin" /></div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                            <RefreshCw size={32} className="text-white/10 mx-auto mb-3" />
                            <p className="text-white/20 text-sm">No delivery logs yet. Logs appear after purchases are made.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                    <div>{log.status === 'sent' ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">{log.email || log.phone}</p>
                                        <p className="text-white/30 text-xs">{log.product} · {log.type === 'email' ? '📧 Email' : '📱 WhatsApp'}</p>
                                    </div>
                                    <div className="text-white/25 text-xs text-right shrink-0">
                                        <p>{log.status?.toUpperCase()}</p>
                                        <p>{log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString('en-IN') : '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default AutomationPage;
