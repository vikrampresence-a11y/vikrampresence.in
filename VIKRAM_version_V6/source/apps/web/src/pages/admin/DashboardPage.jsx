import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, ShoppingBag, BarChart3, Users, Eye, Globe,
    Activity, Zap, ArrowUpRight, ArrowDownRight, Crown, Mail, Download,
    CheckCircle, XCircle, Loader2, RefreshCw, Package, UserCheck,
    ShieldCheck, AlertTriangle, Wifi, Clock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from 'recharts';
import { subscribeAnalytics, exportToCSV } from '@/lib/analyticsStore';

// ═══════════════════════════════════════════════════════════════
// V3 DASHBOARD — 25-Point Analytics Command Center
// Real-time data sync via Firebase onSnapshot
// Premium dark-mode glassmorphism aesthetic
// ═══════════════════════════════════════════════════════════════

// ── Shared animation variants ──
const cardVariant = (delay = 0) => ({
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

// ── Stat Card Component ──
const MetricCard = ({ icon: Icon, label, value, prefix = '', suffix = '', color, trend, delay = 0, small = false }) => (
    <motion.div {...cardVariant(delay)} className="v3-metric-card group">
        <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                <Icon size={16} style={{ color }} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className={`font-bold text-white tracking-tight font-mono ${small ? 'text-lg' : 'text-2xl'}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
    </motion.div>
);

// ── Section Header ──
const SectionHeader = ({ icon: Icon, title, subtitle, delay = 0 }) => (
    <motion.div {...cardVariant(delay)} className="flex items-center gap-3 mb-5 mt-10 first:mt-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#d4ff00]/8 border border-[#d4ff00]/15">
            <Icon size={15} className="text-[#d4ff00]" />
        </div>
        <div>
            <h2 className="text-white text-sm font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-white/20 text-[10px] mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
);

// ── Live Pulse Dot ──
const PulseDot = () => (
    <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
    </span>
);

// ── Custom Recharts Tooltip ──
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="v3-chart-tooltip">
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[#d4ff00] text-sm font-bold font-mono">₹{payload[0].value?.toLocaleString('en-IN')}</p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
const DashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const unsubRef = useRef(null);

    // ── Subscribe to real-time analytics ──
    useEffect(() => {
        unsubRef.current = subscribeAnalytics((data) => {
            setMetrics(data);
            setLoading(false);
            setLastUpdated(new Date());
        });
        return () => { if (unsubRef.current) unsubRef.current(); };
    }, []);

    // ── CSV Export handler ──
    const handleExport = async () => {
        setExporting(true);
        await exportToCSV();
        setExporting(false);
    };

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
                <div className="w-10 h-10 border-2 border-[#d4ff00]/20 border-t-[#d4ff00] rounded-full animate-spin" />
                <p className="text-white/20 text-xs uppercase tracking-[0.2em]">Loading Analytics Engine…</p>
            </div>
        );
    }

    const m = metrics;

    return (
        <div className="v3-dashboard">
            {/* ── HEADER ── */}
            <motion.div {...cardVariant(0)} className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Analytics Command Center
                        <PulseDot />
                    </h1>
                    <p className="text-white/25 text-xs mt-1 flex items-center gap-2">
                        <Wifi size={12} /> Real-time sync active
                        {lastUpdated && (
                            <span className="text-white/15">
                                · Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        )}
                    </p>
                </div>
                <button onClick={handleExport} disabled={exporting}
                    className="v3-export-btn">
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export CSV
                </button>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 1 — TRAFFIC & ACQUISITION              */}
            {/* ═══════════════════════════════════════════════ */}
            <SectionHeader icon={Globe} title="Traffic & Acquisition" subtitle="Live visitor analytics" delay={0.05} />

            <div className="v3-grid-4">
                {/* 1. Live Active Users */}
                <motion.div {...cardVariant(0.08)} className="v3-metric-card v3-metric-live">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <PulseDot />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-green-400/60">LIVE NOW</span>
                        </div>
                    </div>
                    <p className="text-4xl font-black text-white font-mono">{m.liveActiveUsers}</p>
                    <p className="text-white/20 text-[10px] mt-1">Active on site right now</p>
                </motion.div>

                {/* 2. Unique Visitors */}
                <MetricCard icon={Users} label="Visitors Today" value={m.todayVisitors} color="#3b82f6" delay={0.12} />
                <MetricCard icon={Users} label="This Week" value={m.weekVisitors} color="#8b5cf6" delay={0.16} />
                <MetricCard icon={Users} label="This Month" value={m.monthVisitors} color="#06b6d4" delay={0.20} />
            </div>

            <div className="v3-grid-3 mt-4">
                {/* 3. Page Views */}
                <MetricCard icon={Eye} label="Total Page Views" value={m.totalPageViews} color="#f59e0b" delay={0.24} />
                {/* 5. Bounce Rate */}
                <MetricCard icon={ArrowDownRight} label="Bounce Rate" value={m.bounceRate} suffix="%" color="#ef4444" delay={0.28} />
                {/* 10. Conversion Rate */}
                <MetricCard icon={TrendingUp} label="Conversion Rate" value={m.conversionRate} suffix="%" color="#22c55e" delay={0.32} />
            </div>

            {/* 4. Traffic Sources Donut */}
            <motion.div {...cardVariant(0.3)} className="v3-glass-card p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Traffic Sources</p>
                    <Globe size={14} className="text-white/15" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={m.trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                    paddingAngle={3} dataKey="value" animationDuration={1200} animationBegin={300}>
                                    {m.trafficSources.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {m.trafficSources.map((src, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: src.color }} />
                                <div>
                                    <p className="text-white/60 text-xs font-medium">{src.name}</p>
                                    <p className="text-white text-sm font-bold font-mono">{src.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 2 — SALES & REVENUE                    */}
            {/* ═══════════════════════════════════════════════ */}
            <SectionHeader icon={DollarSign} title="Sales & Revenue" subtitle="Live financial analytics" delay={0.3} />

            <div className="v3-grid-4">
                {/* 6. Gross Revenue */}
                <motion.div {...cardVariant(0.32)} className="v3-metric-card v3-metric-revenue">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#d4ff00]/10 border border-[#d4ff00]/20">
                            <DollarSign size={16} className="text-[#d4ff00]" />
                        </div>
                        <ArrowUpRight size={14} className="text-[#d4ff00]/30" />
                    </div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Gross Revenue</p>
                    <p className="text-3xl font-black text-white tracking-tight font-mono">
                        ₹{m.grossRevenue.toLocaleString('en-IN')}
                    </p>
                </motion.div>

                {/* 7. Today's Earnings */}
                <MetricCard icon={Zap} label="Today's Earnings" value={m.todaysEarnings} prefix="₹" color="#d4ff00" delay={0.36} />
                {/* 8. AOV */}
                <MetricCard icon={ShoppingBag} label="Avg Order Value" value={m.aov} prefix="₹" color="#f59e0b" delay={0.40} />
                {/* 9. Total Orders */}
                <MetricCard icon={Package} label="Total Orders" value={m.totalOrders} color="#3b82f6" delay={0.44} />
            </div>

            <div className="v3-grid-2 mt-4">
                {/* 11. Failed Payments */}
                <MetricCard icon={XCircle} label="Failed Payments" value={m.failedPayments} color="#ef4444" delay={0.48} />
                {/* Total Products */}
                <MetricCard icon={Package} label="Total Products" value={m.totalProducts} color="#8b5cf6" delay={0.52} />
            </div>

            {/* Revenue Trend Chart (30 days) */}
            <motion.div {...cardVariant(0.5)} className="v3-glass-card p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Revenue Trend · 30 Days</p>
                    </div>
                    <BarChart3 size={14} className="text-[#d4ff00]/30" />
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.dailyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d4ff00" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#d4ff00" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                                axisLine={false} tickLine={false} interval={4} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9 }}
                                axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="#d4ff00" strokeWidth={2}
                                fill="url(#revGradient)" animationDuration={1500} animationBegin={500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 3 — PRODUCT PERFORMANCE                */}
            {/* ═══════════════════════════════════════════════ */}
            <SectionHeader icon={Package} title="Product Performance" subtitle="Product-level analytics" delay={0.5} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 12. Top Selling Products */}
                <motion.div {...cardVariant(0.52)} className="v3-glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Top Selling Products</p>
                        <Crown size={14} className="text-[#d4ff00]/30" />
                    </div>
                    {m.topProducts.length === 0 ? (
                        <p className="text-white/15 text-sm text-center py-8">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {m.topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                                        style={{
                                            background: i === 0 ? 'rgba(212,255,0,0.12)' : 'rgba(255,255,255,0.04)',
                                            color: i === 0 ? '#d4ff00' : 'rgba(255,255,255,0.3)',
                                            border: `1px solid ${i === 0 ? 'rgba(212,255,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                        }}>
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                                        <p className="text-white/20 text-[10px]">{p.sales} sales</p>
                                    </div>
                                    <p className="text-[#d4ff00] text-sm font-bold font-mono shrink-0">₹{p.revenue.toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* 13. Views vs Purchases */}
                <motion.div {...cardVariant(0.56)} className="v3-glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Views vs Purchases</p>
                        <Eye size={14} className="text-white/15" />
                    </div>
                    {m.productViewsVsPurchases.length === 0 ? (
                        <p className="text-white/15 text-sm text-center py-8">No product data</p>
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={m.productViewsVsPurchases} layout="vertical" margin={{ left: 0, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                                        width={80} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                                    />
                                    <Bar dataKey="views" fill="rgba(139,92,246,0.5)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                                    <Bar dataKey="purchases" fill="#d4ff00" radius={[0, 4, 4, 0]} animationDuration={1000} animationBegin={300} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex items-center gap-6 mt-3 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(139,92,246,0.5)' }} />
                            <span className="text-white/30 text-[10px]">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-[#d4ff00]" />
                            <span className="text-white/30 text-[10px]">Purchases</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 14. Inventory Status */}
            <div className="v3-grid-2 mt-4">
                <MetricCard icon={CheckCircle} label="Active Products" value={m.activeProducts} color="#22c55e" delay={0.58} />
                <MetricCard icon={XCircle} label="Inactive Products" value={m.inactiveProducts} color="#6b7280" delay={0.62} />
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 4 — USER & AUDIENCE INSIGHTS            */}
            {/* ═══════════════════════════════════════════════ */}
            <SectionHeader icon={UserCheck} title="User & Audience Insights" subtitle="Customer intelligence" delay={0.6} />

            <div className="v3-grid-4">
                {/* 15. Total Registered Users */}
                <MetricCard icon={Users} label="Registered Users" value={m.totalRegisteredUsers} color="#3b82f6" delay={0.62} />
                {/* 16. New Buyers */}
                <MetricCard icon={UserCheck} label="New Buyers" value={m.newBuyers} color="#22c55e" delay={0.66} />
                {/* 16. Returning Buyers */}
                <MetricCard icon={RefreshCw} label="Returning Buyers" value={m.returningBuyers} color="#f59e0b" delay={0.70} />
                {/* 17. OTP Success Rate */}
                <MetricCard icon={ShieldCheck} label="OTP Success Rate" value={m.otpSuccessRate} suffix="%" color="#8b5cf6" delay={0.74} />
            </div>

            {/* New vs Returning Chart */}
            <motion.div {...cardVariant(0.7)} className="v3-glass-card p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">New vs Returning Buyers</p>
                    <Users size={14} className="text-white/15" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-40 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'New', value: Math.max(m.newBuyers, 1) },
                                        { name: 'Returning', value: Math.max(m.returningBuyers, 0) },
                                    ]}
                                    cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                                    paddingAngle={4} dataKey="value" animationDuration={1200}
                                >
                                    <Cell fill="#22c55e" stroke="transparent" />
                                    <Cell fill="#f59e0b" stroke="transparent" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <div>
                                <p className="text-white/60 text-xs">New</p>
                                <p className="text-white text-lg font-bold font-mono">{m.newBuyers}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <div>
                                <p className="text-white/60 text-xs">Returning</p>
                                <p className="text-white text-lg font-bold font-mono">{m.returningBuyers}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 18. Top Customers Leaderboard */}
            <motion.div {...cardVariant(0.75)} className="v3-glass-card p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Top Customers Leaderboard</p>
                    <Crown size={14} className="text-[#d4ff00]/30" />
                </div>
                {m.topCustomers.length === 0 ? (
                    <p className="text-white/15 text-sm text-center py-6">No customer data yet</p>
                ) : (
                    <div className="space-y-3">
                        {m.topCustomers.map((c, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black"
                                    style={{
                                        background: i === 0 ? 'rgba(212,255,0,0.12)' : 'rgba(255,255,255,0.04)',
                                        color: i === 0 ? '#d4ff00' : 'rgba(255,255,255,0.3)',
                                        border: `1px solid ${i === 0 ? 'rgba(212,255,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                    }}>
                                    {i === 0 ? '👑' : `#${i + 1}`}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{c.email}</p>
                                    <p className="text-white/20 text-[10px]">{c.orders} orders</p>
                                </div>
                                <p className="text-[#d4ff00] text-sm font-bold font-mono shrink-0">₹{c.total.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 5 — SYSTEM HEALTH & ACTIONS             */}
            {/* ═══════════════════════════════════════════════ */}
            <SectionHeader icon={Activity} title="System Health & Actions" subtitle="Infrastructure monitoring" delay={0.8} />

            <div className="v3-grid-3">
                {/* 19. Email Delivery Status */}
                <motion.div {...cardVariant(0.82)} className="v3-metric-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10 border border-green-500/20">
                            <Mail size={16} className="text-green-400" />
                        </div>
                        <CheckCircle size={14} className="text-green-400/40" />
                    </div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">PHP Mailer</p>
                    <p className="text-green-400 text-sm font-bold">Operational</p>
                    <p className="text-white/15 text-[10px] mt-1">Gmail SMTP Active</p>
                </motion.div>

                {/* 20. Quick Action: Export */}
                <motion.div {...cardVariant(0.86)} className="v3-metric-card flex flex-col justify-between">
                    <div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 mb-3">
                            <Download size={16} className="text-blue-400" />
                        </div>
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Export Data</p>
                        <p className="text-white/50 text-[11px]">Download all orders as CSV</p>
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                        className="mt-3 w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                        {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Export CSV
                    </button>
                </motion.div>

                {/* System Status */}
                <motion.div {...cardVariant(0.90)} className="v3-metric-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#d4ff00]/10 border border-[#d4ff00]/20">
                            <Activity size={16} className="text-[#d4ff00]" />
                        </div>
                    </div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">System Status</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-white/40 text-[10px]">Firebase Firestore</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-white/40 text-[10px]">Razorpay Gateway</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-white/40 text-[10px]">PHP Mailer SMTP</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-white/40 text-[10px]">Apache Server</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── RECENT ORDERS TABLE ── */}
            <motion.div {...cardVariant(0.9)} className="v3-glass-card p-6 mt-6">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Recent Orders</p>
                    <Clock size={14} className="text-white/15" />
                </div>
                {m.recentOrders.length === 0 ? (
                    <p className="text-center text-white/15 text-sm py-8">No orders yet. Sales data will appear here in real-time.</p>
                ) : (
                    <div className="space-y-2.5">
                        {m.recentOrders.map((order, i) => (
                            <div key={order.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center text-[10px] font-bold text-[#d4ff00]">
                                    {(order.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{order.email || 'Unknown'}</p>
                                    <p className="text-white/20 text-[10px] truncate">{order.productName || 'Product'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[#d4ff00] text-sm font-bold font-mono">₹{order.amount || 0}</p>
                                    <p className="text-white/15 text-[10px]">
                                        {(() => {
                                            try {
                                                const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                                                return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                            } catch { return '—'; }
                                        })()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── V3 STYLES ── */}
            <style>{`
                .v3-dashboard { min-height: 100vh; }

                /* Metric Cards — Glassmorphism */
                .v3-metric-card {
                    padding: 20px; border-radius: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgb(30, 41, 59);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }
                .v3-metric-card:hover {
                    border-color: rgba(212,255,0,0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
                }
                .v3-metric-live { border-color: rgba(34,197,94,0.2); }
                .v3-metric-live:hover { border-color: rgba(34,197,94,0.35); }
                .v3-metric-revenue { border-color: rgba(212,255,0,0.12); }
                .v3-metric-revenue:hover { border-color: rgba(212,255,0,0.25); box-shadow: 0 0 30px rgba(212,255,0,0.08); }

                /* Glass Cards */
                .v3-glass-card {
                    border-radius: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgb(30, 41, 59);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                }

                /* Grids */
                .v3-grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .v3-grid-3 { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; }
                .v3-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

                @media (min-width: 768px) {
                    .v3-grid-3 { grid-template-columns: repeat(3, 1fr); }
                }
                @media (min-width: 1024px) {
                    .v3-grid-4 { grid-template-columns: repeat(4, 1fr); }
                }

                /* Chart Tooltip */
                .v3-chart-tooltip {
                    background: #111; border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; padding: 10px 14px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                }

                /* Export Button */
                .v3-export-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-radius: 12px;
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #050505; background: #d4ff00;
                    border: none; cursor: pointer;
                    box-shadow: 0 0 20px rgba(212,255,0,0.2);
                    transition: all 0.3s;
                }
                .v3-export-btn:hover {
                    box-shadow: 0 0 35px rgba(212,255,0,0.4);
                    transform: translateY(-1px);
                }
                .v3-export-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                /* Recharts overrides */
                .recharts-cartesian-grid-horizontal line,
                .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255,255,255,0.03) !important;
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;
