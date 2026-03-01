// ═══════════════════════════════════════════════
// Order Store — localStorage + optional Firebase
// Tracks purchases: email, product, amount, razorpay ID, date
// ═══════════════════════════════════════════════

import { db } from '@/lib/firebase';
import {
    collection, addDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';

const LS_KEY = 'vp_orders';

const isFirebaseConfigured = () => {
    try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY;
        return key && !key.includes('YOUR_') && key.length > 10;
    } catch { return false; }
};

const getLocalOrders = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
};

const saveLocalOrders = (orders) => {
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
};

/** Get all orders */
export const getAllOrders = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch { return getLocalOrders(); }
    }
    return getLocalOrders();
};

/** Record a new order */
export const addOrder = async (order) => {
    const data = {
        email: order.email,
        phone: order.phone || '',
        productName: order.productName,
        amount: order.amount,
        razorpayId: order.razorpayId || '',
        otpVerified: order.otpVerified || false,
        driveLink: order.driveLink || '',
        createdAt: new Date().toISOString(),
    };
    if (isFirebaseConfigured()) {
        try {
            await addDoc(collection(db, 'orders'), { ...data, createdAt: serverTimestamp() });
            return;
        } catch { /* fall through */ }
    }
    const orders = getLocalOrders();
    data.id = 'order-' + Date.now();
    orders.unshift(data);
    saveLocalOrders(orders);
};

/** Get order stats for dashboard */
export const getOrderStats = async () => {
    const orders = await getAllOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalSales = orders.length;

    // Last 7 days revenue
    const now = Date.now();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now - (6 - i) * 86400000);
        return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: 0, date: d.toDateString() };
    });
    orders.forEach(o => {
        const d = new Date(o.createdAt).toDateString();
        const match = days.find(day => day.date === d);
        if (match) match.value += (o.amount || 0);
    });

    return { totalRevenue, totalSales, recentOrders: orders.slice(0, 8), dailyRevenue: days };
};
