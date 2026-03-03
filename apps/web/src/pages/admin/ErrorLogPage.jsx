import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, RefreshCw, Loader2, Bug } from 'lucide-react';
import { getErrorLogs, clearErrorLogs } from '@/lib/siteSettings';

// ═══════════════════════════════════════════════
// ERROR LOG VIEWER — JS error capture & view
// Global error boundary in App.jsx feeds this
// ═══════════════════════════════════════════════

const ErrorLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const load = async () => { setLoading(true); const l = await getErrorLogs(); setLogs(l); setLoading(false); };
    useEffect(() => { load(); }, []);

    const handleClear = async () => {
        if (!confirm('Clear all error logs?')) return;
        await clearErrorLogs(); setLogs([]);
    };

    const filtered = filter ? logs.filter(l => l.message?.toLowerCase().includes(filter.toLowerCase()) || l.url?.includes(filter)) : logs;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Error Log Viewer</h1>
                    <p className="text-white/25 text-xs mt-1">JavaScript errors captured from your live website</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/40 text-xs font-bold hover:text-white/60 cursor-pointer"><RefreshCw size={13} /> Refresh</button>
                    <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400/60 text-xs font-bold hover:text-red-400 cursor-pointer"><Trash2 size={13} /> Clear</button>
                </div>
            </div>

            <div className="p-4 bg-blue-500/[0.05] border border-blue-500/15 rounded-xl mb-6 text-blue-400/70 text-xs flex items-start gap-3">
                <Bug size={13} className="shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-1">How errors are captured</p>
                    <p>A global error boundary in your React app captures unhandled JS crashes and writes them to Firestore `errorLogs/` collection. Errors also appear in browser console.</p>
                </div>
            </div>

            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search errors..." className="w-full px-4 py-3 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <AlertTriangle size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-sm">{filter ? 'No matching errors.' : '✅ No errors logged! Your site is running clean.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-white/20 text-xs">{filtered.length} error entries</p>
                    {filtered.map((log, i) => (
                        <motion.div key={log.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="p-5 bg-red-500/[0.04] border border-red-500/[0.12] rounded-2xl">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                    <p className="text-red-300/80 text-sm font-semibold">{log.message || 'Unknown error'}</p>
                                </div>
                                <span className="text-white/20 text-[11px] shrink-0">{log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                            </div>
                            {log.url && <p className="text-white/25 text-xs mb-2 font-mono">🔗 {log.url}</p>}
                            {log.stack && (
                                <pre className="text-white/20 text-[10px] bg-black/40 rounded-xl p-3 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap max-h-40">{log.stack}</pre>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ErrorLogPage;
