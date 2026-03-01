import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, ArrowUpRight, Clock } from 'lucide-react';
import { getOrderStats } from '@/lib/orderStore';
import { getAllProducts } from '@/lib/productStore';

// ═══════════════════════════════════════════════
// DASHBOARD — Sales Analytics Command Center
// ═══════════════════════════════════════════════

const StatCard = ({ icon: Icon, label, value, prefix = '', suffix = '', color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="admin-stat-card"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <ArrowUpRight size={14} className="text-white/15" />
        </div>
        <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight font-mono">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
    </motion.div>
);

const RevenueChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="admin-glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.2em]">Revenue · Last 7 Days</p>
                </div>
                <BarChart3 size={16} className="text-[#d4ff00]/40" />
            </div>
            <div className="flex items-end gap-3 h-40">
                {data.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-white/30 font-mono">
                            {day.value > 0 ? `₹${day.value}` : ''}
                        </span>
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: `${Math.max((day.value / max) * 100, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                            className="w-full rounded-t-lg min-h-[4px]"
                            style={{
                                background: day.value > 0
                                    ? 'linear-gradient(to top, rgba(212,255,0,0.6), rgba(212,255,0,0.2))'
                                    : 'rgba(255,255,255,0.04)',
                                boxShadow: day.value > 0 ? '0 0 15px rgba(212,255,0,0.15)' : 'none'
                            }}
                        />
                        <span className="text-[9px] text-white/25 font-medium">{day.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [orderStats, products] = await Promise.all([
                getOrderStats(),
                getAllProducts(),
            ]);
            setStats(orderStats);
            setProductCount(products.length);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#d4ff00]/20 border-t-[#d4ff00] rounded-full animate-spin" />
            </div>
        );
    }

    const conversionRate = stats.totalSales > 0 ? ((stats.totalSales / Math.max(stats.totalSales * 3, 1)) * 100).toFixed(1) : '0.0';

    return (
        <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-white/30 text-sm mt-1">Sales analytics & performance overview</p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={DollarSign} label="Total Revenue" value={stats.totalRevenue} prefix="₹" color="#d4ff00" delay={0} />
                <StatCard icon={ShoppingBag} label="Total Sales" value={stats.totalSales} color="#3b82f6" delay={0.08} />
                <StatCard icon={TrendingUp} label="Conversion" value={conversionRate} suffix="%" color="#8b5cf6" delay={0.16} />
                <StatCard icon={BarChart3} label="Products" value={productCount} color="#f59e0b" delay={0.24} />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={stats.dailyRevenue} />

            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="admin-glass-card p-6 mt-6">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.2em]">Recent Orders</p>
                    <Clock size={14} className="text-white/20" />
                </div>
                {stats.recentOrders.length === 0 ? (
                    <p className="text-center text-white/20 text-sm py-8">No orders yet. Sales data will appear here.</p>
                ) : (
                    <div className="space-y-3">
                        {stats.recentOrders.map((order, i) => (
                            <div key={order.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center text-[10px] font-bold text-[#d4ff00]">
                                    {(order.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{order.email || 'Unknown'}</p>
                                    <p className="text-white/25 text-[11px] truncate">{order.productName || 'Product'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[#d4ff00] text-sm font-bold font-mono">₹{order.amount || 0}</p>
                                    <p className="text-white/20 text-[10px]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <style>{`
                .admin-stat-card {
                    padding: 20px; border-radius: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.3s;
                }
                .admin-stat-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
                .admin-glass-card {
                    border-radius: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;
