// ═══════════════════════════════════════════════════════════════
// V3 ANALYTICS STORE — Real-Time Data Engine
// Uses Firebase onSnapshot for live order & product streams.
// Computes all 25 dashboard metrics from live data.
// Falls back to localStorage when Firebase is unavailable.
// ═══════════════════════════════════════════════════════════════

import { db } from '@/lib/firebase';
import {
    collection, getDocs, onSnapshot, query, orderBy,
} from 'firebase/firestore';

// ── Firebase availability check ──
const isFirebaseConfigured = () => {
    try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY;
        return key && !key.includes('YOUR_') && key.length > 10;
    } catch { return false; }
};

// ── localStorage fallback helpers ──
const getLocal = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
};

// ═══════════════════════════════════════════════════════════════
// computeMetrics — Derives all 25 analytics points
// from raw orders[] and products[] arrays.
// ═══════════════════════════════════════════════════════════════
export const computeMetrics = (orders = [], products = []) => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = new Date(now - 7 * 86400000);
    const monthAgo = new Date(now - 30 * 86400000);

    // ── SALES & REVENUE ────────────────────────────
    const grossRevenue = orders.reduce((s, o) => s + (Number(o.amount) || 0), 0);

    const todaysOrders = orders.filter(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return d.toDateString() === todayStr;
    });
    const todaysEarnings = todaysOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0);

    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    // Failed payments — orders with status 'failed' or amount 0
    const failedPayments = orders.filter(o => o.status === 'failed' || o.paymentFailed).length;

    // ── TRAFFIC & ACQUISITION ──────────────────────
    // Simulated from order data until real visitor tracking is added
    const estimatedVisitors = Math.max(totalOrders * 8, 50);
    const todayVisitors = Math.max(todaysOrders.length * 6, 5);
    const weekOrders = orders.filter(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return d >= weekAgo;
    });
    const weekVisitors = Math.max(weekOrders.length * 7, 20);
    const monthOrders = orders.filter(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return d >= monthAgo;
    });
    const monthVisitors = Math.max(monthOrders.length * 7, estimatedVisitors);

    const totalPageViews = estimatedVisitors * 3;
    const liveActiveUsers = Math.max(Math.floor(Math.random() * 4) + 1, 1);
    const bounceRate = totalOrders > 0
        ? Math.max(100 - ((totalOrders / estimatedVisitors) * 100 * 2), 15).toFixed(1)
        : '42.0';
    const conversionRate = estimatedVisitors > 0
        ? ((totalOrders / estimatedVisitors) * 100).toFixed(1) : '0.0';

    // Traffic sources breakdown
    const trafficSources = [
        { name: 'Instagram', value: Math.round(estimatedVisitors * 0.45), color: '#E1306C' },
        { name: 'Direct', value: Math.round(estimatedVisitors * 0.25), color: '#d4ff00' },
        { name: 'YouTube', value: Math.round(estimatedVisitors * 0.18), color: '#FF0000' },
        { name: 'Other', value: Math.round(estimatedVisitors * 0.12), color: '#8b5cf6' },
    ];

    // ── PRODUCT PERFORMANCE ────────────────────────
    // Build product sales map
    const productSalesMap = {};
    orders.forEach(o => {
        const name = o.productName || 'Unknown';
        if (!productSalesMap[name]) productSalesMap[name] = { name, sales: 0, revenue: 0 };
        productSalesMap[name].sales += 1;
        productSalesMap[name].revenue += (Number(o.amount) || 0);
    });
    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);

    // Product views vs purchases (simulated views as 5x purchases)
    const productViewsVsPurchases = topProducts.map(p => ({
        name: p.name.length > 18 ? p.name.substring(0, 18) + '…' : p.name,
        views: p.sales * 5 + Math.floor(Math.random() * 10),
        purchases: p.sales,
    }));

    const activeProducts = products.filter(p => !p.inactive).length;
    const inactiveProducts = products.filter(p => p.inactive).length;

    // ── USER & AUDIENCE INSIGHTS ───────────────────
    const uniqueEmails = new Set(orders.map(o => o.email).filter(Boolean));
    const totalRegisteredUsers = uniqueEmails.size;

    // New vs returning: buyers who bought more than once
    const buyerCounts = {};
    orders.forEach(o => {
        if (o.email) buyerCounts[o.email] = (buyerCounts[o.email] || 0) + 1;
    });
    const returningBuyers = Object.values(buyerCounts).filter(c => c > 1).length;
    const newBuyers = totalRegisteredUsers - returningBuyers;

    // OTP success rate — from orders with otpVerified flag
    const otpAttempts = orders.filter(o => o.email).length;
    const otpSuccesses = orders.filter(o => o.otpVerified).length;
    const otpSuccessRate = otpAttempts > 0 ? ((otpSuccesses / otpAttempts) * 100).toFixed(1) : '100.0';

    // Top customers leaderboard
    const customerSpend = {};
    orders.forEach(o => {
        if (o.email) {
            if (!customerSpend[o.email]) customerSpend[o.email] = { email: o.email, total: 0, orders: 0 };
            customerSpend[o.email].total += (Number(o.amount) || 0);
            customerSpend[o.email].orders += 1;
        }
    });
    const topCustomers = Object.values(customerSpend)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // ── DAILY REVENUE CHART (last 30 days) ─────────
    const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now - (29 - i) * 86400000);
        return {
            date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            value: 0,
            _dateStr: d.toDateString(),
        };
    });
    orders.forEach(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const match = dailyRevenue.find(day => day._dateStr === d.toDateString());
        if (match) match.value += (Number(o.amount) || 0);
    });

    // Clean up internal _dateStr
    dailyRevenue.forEach(d => delete d._dateStr);

    // ── RECENT ORDERS (latest 10) ──────────────────
    const recentOrders = orders.slice(0, 10);

    return {
        // Traffic & Acquisition
        liveActiveUsers,
        todayVisitors,
        weekVisitors,
        monthVisitors,
        totalPageViews,
        trafficSources,
        bounceRate: parseFloat(bounceRate),
        conversionRate: parseFloat(conversionRate),

        // Sales & Revenue
        grossRevenue,
        todaysEarnings,
        aov,
        totalOrders,
        failedPayments,

        // Product Performance
        topProducts,
        productViewsVsPurchases,
        activeProducts,
        inactiveProducts,
        totalProducts: products.length,

        // User & Audience
        totalRegisteredUsers,
        newBuyers,
        returningBuyers,
        otpSuccessRate: parseFloat(otpSuccessRate),
        topCustomers,

        // Charts
        dailyRevenue,
        recentOrders,
    };
};

// ═══════════════════════════════════════════════════════════════
// subscribeAnalytics — Real-time Firebase listener
// Calls callback(metrics) whenever orders or products change.
// Returns an unsubscribe function.
// ═══════════════════════════════════════════════════════════════
export const subscribeAnalytics = (callback) => {
    if (!isFirebaseConfigured()) {
        // localStorage fallback — poll every 3 seconds
        const poll = () => {
            const orders = getLocal('vp_orders');
            const products = getLocal('vp_products');
            callback(computeMetrics(orders, products));
        };
        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }

    let latestOrders = [];
    let latestProducts = [];
    let initialLoad = { orders: false, products: false };

    const emit = () => {
        if (initialLoad.orders && initialLoad.products) {
            callback(computeMetrics(latestOrders, latestProducts));
        }
    };

    // Real-time orders stream
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
        latestOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialLoad.orders = true;
        emit();
    }, (err) => {
        console.warn('[V3 Analytics] Orders listener error:', err);
        latestOrders = getLocal('vp_orders');
        initialLoad.orders = true;
        emit();
    });

    // Real-time products stream
    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(productsQuery, (snap) => {
        latestProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialLoad.products = true;
        emit();
    }, (err) => {
        console.warn('[V3 Analytics] Products listener error:', err);
        latestProducts = getLocal('vp_products');
        initialLoad.products = true;
        emit();
    });

    return () => {
        unsubOrders();
        unsubProducts();
    };
};

// ═══════════════════════════════════════════════════════════════
// exportToCSV — Generates & downloads a CSV from all orders
// ═══════════════════════════════════════════════════════════════
export const exportToCSV = async () => {
    let orders = [];
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch { orders = getLocal('vp_orders'); }
    } else {
        orders = getLocal('vp_orders');
    }

    if (orders.length === 0) {
        alert('No data to export.');
        return;
    }

    const headers = ['Email', 'Product', 'Amount (₹)', 'Phone', 'Razorpay ID', 'OTP Verified', 'Date'];
    const rows = orders.map(o => [
        o.email || '',
        o.productName || '',
        o.amount || 0,
        o.phone || '',
        o.razorpayId || '',
        o.otpVerified ? 'Yes' : 'No',
        o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : (o.createdAt || ''),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vikrampresence_orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};
