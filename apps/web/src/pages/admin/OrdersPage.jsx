import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Mail, RefreshCw, CheckCircle, XCircle, ExternalLink, Loader2, Clock } from 'lucide-react';
import { getAllOrders } from '@/lib/orderStore';

// ═══════════════════════════════════════════════
// ORDERS — User & Order Audit Table
// ═══════════════════════════════════════════════

const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
const PHP_API = '/api/send-email.php';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [resending, setResending] = useState(null);

    useEffect(() => {
        const load = async () => {
            setOrders(await getAllOrders());
            setLoading(false);
        };
        load();
    }, []);

    const handleResendLink = async (order) => {
        if (!order.email || !order.driveLink) { alert('Missing email or drive link.'); return; }
        setResending(order.id);
        try {
            const endpoint = isShopDomain ? PHP_API : '/hcgi/api/verification/resend-link';
            const body = isShopDomain
                ? { action: 'verify_payment', buyerEmail: order.email, productName: order.productName, googleDriveLink: order.driveLink, orderId: 'resend', paymentId: 'resend', signature: '' }
                : { email: order.email, productName: order.productName, driveLink: order.driveLink };

            const res = await fetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) alert('✅ Product link resent to ' + order.email);
            else alert('Failed to resend.');
        } catch { alert('Server unreachable.'); }
        setResending(null);
    };

    const filtered = orders.filter(o =>
        (o.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.razorpayId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
                    <p className="text-white/30 text-sm mt-1">{orders.length} total orders</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email, product, or Razorpay ID..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-[#d4ff00]/40 transition-all placeholder-white/15" />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <Users size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 text-sm">{searchQuery ? 'No matching orders.' : 'No orders yet.'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((order, i) => (
                            <motion.div key={order.id || i} layout
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                                <div className="flex items-start gap-4 flex-wrap">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center text-sm font-bold text-[#d4ff00] shrink-0">
                                        {(order.email || '?')[0].toUpperCase()}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white text-sm font-semibold">{order.email || 'Unknown'}</p>
                                            {order.otpVerified ? (
                                                <span className="flex items-center gap-1 text-[9px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-lg uppercase tracking-wider font-bold">
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[9px] text-red-400/60 bg-red-400/5 border border-red-400/10 px-2 py-0.5 rounded-lg uppercase tracking-wider font-bold">
                                                    <XCircle size={10} /> Unverified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/30 text-xs mt-1">{order.productName || 'Product'}</p>
                                        {order.razorpayId && (
                                            <p className="text-white/15 text-[10px] font-mono mt-1">Razorpay: {order.razorpayId}</p>
                                        )}
                                        {order.phone && (
                                            <p className="text-white/15 text-[10px] mt-0.5">📱 {order.phone}</p>
                                        )}
                                    </div>
                                    {/* Right */}
                                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                        <p className="text-[#d4ff00] text-lg font-bold font-mono">₹{order.amount || 0}</p>
                                        <p className="text-white/20 text-[10px] flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </p>
                                        {order.driveLink && order.driveLink !== '#' && (
                                            <button onClick={() => handleResendLink(order)} disabled={resending === order.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/[0.06] text-white/35 hover:text-[#d4ff00] hover:border-[#d4ff00]/20 transition-all disabled:opacity-40">
                                                {resending === order.id ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                                                Resend Link
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
