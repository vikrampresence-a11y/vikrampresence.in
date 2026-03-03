import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, RefreshCw, Loader2, Clock, User } from 'lucide-react';
import { getAuditLogs, clearAuditLogs } from '@/lib/siteSettings';

// ═══════════════════════════════════════════════
// AUDIT TRAIL — Who changed what and when
// ═══════════════════════════════════════════════

const ACTION_COLORS = {
    ADD_PRODUCT: 'text-green-400 border-green-500/20 bg-green-500/[0.05]',
    UPDATE_PRODUCT: 'text-blue-400 border-blue-500/20 bg-blue-500/[0.05]',
    DELETE_PRODUCT: 'text-red-400 border-red-500/20 bg-red-500/[0.05]',
    UPDATE_SETTINGS: 'text-[#d4ff00] border-[#d4ff00]/20 bg-[#d4ff00]/[0.04]',
    UPDATE_CHECKOUT: 'text-purple-400 border-purple-500/20 bg-purple-500/[0.05]',
    UPDATE_DESIGN_SYSTEM: 'text-pink-400 border-pink-500/20 bg-pink-500/[0.05]',
    UPDATE_SMTP: 'text-orange-400 border-orange-500/20 bg-orange-500/[0.05]',
    DEFAULT: 'text-white/40 border-white/[0.08] bg-white/[0.02]',
};

const AuditTrailPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [filter, setFilter] = useState('');

    const load = async () => { setLoading(true); const l = await getAuditLogs(); setLogs(l); setLoading(false); };
    useEffect(() => { load(); }, []);

    const handleClear = async () => {
        if (!confirm('Clear all audit logs? This cannot be undone.')) return;
        setClearing(true); await clearAuditLogs(); setLogs([]); setClearing(false);
    };

    const filtered = filter ? logs.filter(l => l.action?.includes(filter) || l.detail?.toLowerCase().includes(filter.toLowerCase())) : logs;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div><h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail</h1><p className="text-white/25 text-xs mt-1">Every admin action logged — who changed what and when</p></div>
                <div className="flex gap-3">
                    <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/40 text-xs font-bold hover:text-white/60 cursor-pointer"><RefreshCw size={13} /> Refresh</button>
                    <button onClick={handleClear} disabled={clearing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400/60 text-xs font-bold hover:text-red-400 cursor-pointer disabled:opacity-50"><Trash2 size={13} /> Clear All</button>
                </div>
            </div>

            {/* Filter */}
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search logs..." className="w-full px-4 py-3 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <History size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-sm">No logs yet. Actions you take in admin will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-white/20 text-xs mb-4">{filtered.length} log entries</p>
                    {filtered.map((log, i) => {
                        const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;
                        return (
                            <motion.div key={log.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                                className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/[0.1] transition-all">
                                <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border shrink-0 ${colorClass}`}>
                                    {log.action?.replace(/_/g, ' ')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/70 text-sm">{log.detail}</p>
                                </div>
                                <div className="text-white/20 text-[11px] text-right shrink-0 flex flex-col items-end gap-1">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                                    <span className="flex items-center gap-1"><User size={10} /> Admin</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default AuditTrailPage;
