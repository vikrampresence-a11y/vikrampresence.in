import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════
// EMAILER — Compose & Send via Gmail SMTP
// ═══════════════════════════════════════════════

const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
const PHP_API = '/api/send-email.php';

const EmailerPage = () => {
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!toEmail || !subject || !body) { alert('All fields required.'); return; }
        setSending(true);
        setResult(null);
        try {
            const endpoint = isShopDomain ? PHP_API : '/hcgi/api/verification/send-email';
            const payload = isShopDomain
                ? { action: 'send_custom_email', email: toEmail, subject, body }
                : { email: toEmail, subject, body };

            const res = await fetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setResult({ type: 'success', message: '✅ Email sent successfully!' });
                setToEmail(''); setSubject(''); setBody('');
            } else {
                setResult({ type: 'error', message: data.error || 'Failed to send.' });
            }
        } catch {
            setResult({ type: 'error', message: 'Server unreachable.' });
        }
        setSending(false);
    };

    return (
        <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Emailer</h1>
                <p className="text-white/30 text-sm mt-1">Compose and send emails via Gmail SMTP</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>

                <form onSubmit={handleSend} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-2">To</label>
                        <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                            placeholder="recipient@email.com"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-[#d4ff00]/40 transition-all placeholder-white/15" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-2">Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                            placeholder="Product Update — Vikram Presence"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-[#d4ff00]/40 transition-all placeholder-white/15" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-2">Body</label>
                        <textarea value={body} onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your email content here... HTML is supported."
                            rows={10}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-[#d4ff00]/40 transition-all placeholder-white/15 resize-none font-mono" />
                    </div>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${result.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                            {result.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span className="text-sm">{result.message}</span>
                        </motion.div>
                    )}

                    <button type="submit" disabled={sending}
                        className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ background: '#d4ff00', color: '#050505', boxShadow: '0 0 25px rgba(212,255,0,0.25)' }}>
                        {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Email</>}
                    </button>
                </form>

                {/* Quick Templates */}
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Quick Templates</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Product Update', subj: '🚀 New Product Available — Vikram Presence', bod: '<h2>Hey there!</h2><p>We just launched a new product. Check it out on our store!</p>' },
                            { label: 'Thank You', subj: '🙏 Thank You for Your Purchase!', bod: '<h2>Thank You!</h2><p>Your purchase has been confirmed. Check your inbox for the access link.</p>' },
                        ].map((tmpl, i) => (
                            <button key={i} type="button"
                                onClick={() => { setSubject(tmpl.subj); setBody(tmpl.bod); }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white/30 border border-white/[0.06] hover:border-[#d4ff00]/20 hover:text-[#d4ff00]/60 bg-white/[0.02] transition-all">
                                {tmpl.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailerPage;
