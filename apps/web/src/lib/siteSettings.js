// ═══════════════════════════════════════════════════════════
// siteSettings.js — Global Site Configuration Store
// Reads/writes from Firestore `siteConfig/main` document.
// Falls back to hardcoded defaults when Firebase not ready.
// ═══════════════════════════════════════════════════════════

import { db } from '@/lib/firebase';
import {
    doc, getDoc, setDoc, updateDoc, onSnapshot,
    collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const isFirebaseConfigured = () => {
    try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY;
        return key && !key.includes('YOUR_') && key.length > 10;
    } catch { return false; }
};

// ── Default site settings ──
export const DEFAULT_SETTINGS = {
    // Brand
    siteName: 'Vikram Presence',
    tagline: 'Clarity · Discipline · Confidence',
    logoUrl: '',
    faviconUrl: '',

    // Contact
    contactEmail: 'hello@vikrampresence.in',
    contactPhone: '+91 7670926198',
    contactAddress: 'India',

    // Social
    youtubeUrl: 'https://youtube.com/@vikrampresence?si=S6KREibiIGo7nyYN',
    instagramUrl: 'https://www.instagram.com/vikram_presence?igsh=eWlkbmM2N3o2Zmdk',
    whatsappNumber: '917670926198',
    youtubeCount: '55K+',
    instagramCount: '220K+',

    // Footer
    footerText: '© 2025 Vikram Presence · Clarity · Discipline · Confidence',

    // SEO
    seoTitle: 'Vikram Presence — Premium Ebooks & Courses',
    seoDescription: 'Premium digital products for building clarity, discipline, and absolute confidence.',
    seoKeywords: 'vikram presence, ebooks, courses, motivation, clarity, discipline',
    ogImageUrl: '',
    googleAnalyticsId: '',
    pixelId: '',

    // Appearance
    accentColor: '#E2F034',
    fontFamily: 'Inter',
    glowIntensity: 50,
    animationSpeed: 1,
    darkMode: true,

    // Payment
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayMode: 'test', // 'test' | 'live'
    currency: 'INR',

    // Homepage
    heroTitle: 'Your Favourite',
    heroSubtitle: 'Motivational Speaker',
    heroCtaText: 'Explore Now',
    heroCtaLink: '/shop',
    heroSubtext: 'the ultimate collection of ebooks & courses to build clarity, discipline, and confidence.',
    fireAnimationEnabled: true,
    glowEnabled: true,
    scrollAnimationEnabled: true,
    loaderEnabled: true,
    marqueeImages: [
        '/assets/marquee/marquee-1.png',
        '/assets/marquee/marquee-2.png',
        '/assets/marquee/marquee-3.png',
        '/assets/marquee/marquee-4.png',
        '/assets/marquee/marquee-5.png',
    ],
    featuredProductIds: [],
    showSocialProof: true,

    // Announcement
    announcementEnabled: false,
    announcementText: '🔥 Limited time offer — 30% OFF on all ebooks!',
    announcementColor: '#E2F034',

    // Popup
    popupEnabled: false,
    popupTitle: 'Exclusive Offer',
    popupMessage: 'Get 20% off on your first purchase!',
    popupCtaText: 'Shop Now',
    popupCtaLink: '/shop',
    popupDelay: 5,

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We\'re upgrading our systems. Back soon!',

    // WhatsApp Automation
    whatsappEnabled: false,
    whatsappTemplate: 'Hi {{name}}! 🎉 Your purchase of *{{product}}* is confirmed.\n\nAccess your product here: {{link}}\n\nThank you for choosing Vikram Presence! 🙏',

    // Developer
    customCss: '',
    customJs: '',
    headerScripts: '',
    footerScripts: '',
    robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://vikrampresence.in/sitemap.xml',
};

// ── LS fallback ──
const LS_KEY = 'vp_site_settings';
const getLocalSettings = () => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }; }
    catch { return { ...DEFAULT_SETTINGS }; }
};
const saveLocalSettings = (s) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { }
};

// ── PUBLIC API ──

export const getSiteSettings = async () => {
    if (isFirebaseConfigured()) {
        try {
            const snap = await getDoc(doc(db, 'siteConfig', 'main'));
            if (snap.exists()) return { ...DEFAULT_SETTINGS, ...snap.data() };
            // First time — seed with defaults
            await setDoc(doc(db, 'siteConfig', 'main'), DEFAULT_SETTINGS);
            return { ...DEFAULT_SETTINGS };
        } catch (err) {
            console.warn('getSiteSettings Firestore failed:', err);
        }
    }
    return getLocalSettings();
};

export const updateSiteSettings = async (patch) => {
    if (isFirebaseConfigured()) {
        try {
            await setDoc(doc(db, 'siteConfig', 'main'), patch, { merge: true });
            return;
        } catch (err) {
            console.warn('updateSiteSettings Firestore failed:', err);
        }
    }
    const current = getLocalSettings();
    saveLocalSettings({ ...current, ...patch });
};

export const subscribeSiteSettings = (callback) => {
    if (isFirebaseConfigured()) {
        try {
            return onSnapshot(doc(db, 'siteConfig', 'main'), (snap) => {
                const data = snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS };
                saveLocalSettings(data);
                callback(data);
            }, (err) => {
                console.warn('subscribeSiteSettings failed:', err);
                callback(getLocalSettings());
            });
        } catch (err) {
            callback(getLocalSettings());
            return () => { };
        }
    }
    callback(getLocalSettings());
    const interval = setInterval(() => callback(getLocalSettings()), 1000);
    return () => clearInterval(interval);
};

// ── PAGE CONTENT ──
export const getPageContent = async (page) => {
    if (isFirebaseConfigured()) {
        try {
            const snap = await getDoc(doc(db, 'pageContent', page));
            return snap.exists() ? snap.data().content : '';
        } catch { }
    }
    try { return localStorage.getItem(`vp_page_${page}`) || ''; } catch { return ''; }
};

export const updatePageContent = async (page, content) => {
    if (isFirebaseConfigured()) {
        try {
            await setDoc(doc(db, 'pageContent', page), { content, updatedAt: serverTimestamp() }, { merge: true });
            return;
        } catch { }
    }
    try { localStorage.setItem(`vp_page_${page}`, content); } catch { }
};

// ── BLOG POSTS ──
export const getBlogPosts = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch { }
    }
    try { return JSON.parse(localStorage.getItem('vp_blog') || '[]'); } catch { return []; }
};

export const addBlogPost = async (post) => {
    const data = { ...post, createdAt: new Date().toISOString(), published: post.published ?? true };
    if (isFirebaseConfigured()) {
        try {
            await addDoc(collection(db, 'blogPosts'), { ...data, createdAt: serverTimestamp() });
            return;
        } catch { }
    }
    const posts = await getBlogPosts();
    data.id = 'local-' + Date.now();
    posts.unshift(data);
    try { localStorage.setItem('vp_blog', JSON.stringify(posts)); } catch { }
};

export const updateBlogPost = async (id, patch) => {
    if (isFirebaseConfigured() && !id.startsWith('local-')) {
        try { await setDoc(doc(db, 'blogPosts', id), { ...patch, updatedAt: serverTimestamp() }, { merge: true }); return; } catch { }
    }
    const posts = (await getBlogPosts()).map(p => p.id === id ? { ...p, ...patch } : p);
    try { localStorage.setItem('vp_blog', JSON.stringify(posts)); } catch { }
};

export const deleteBlogPost = async (id) => {
    if (isFirebaseConfigured() && !id.startsWith('local-')) {
        try { await deleteDoc(doc(db, 'blogPosts', id)); return; } catch { }
    }
    const posts = (await getBlogPosts()).filter(p => p.id !== id);
    try { localStorage.setItem('vp_blog', JSON.stringify(posts)); } catch { }
};

// ── COUPONS ──
export const getCoupons = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch { }
    }
    try { return JSON.parse(localStorage.getItem('vp_coupons') || '[]'); } catch { return []; }
};

export const addCoupon = async (coupon) => {
    const data = { ...coupon, usedCount: 0, createdAt: new Date().toISOString(), active: true };
    if (isFirebaseConfigured()) {
        try { await addDoc(collection(db, 'coupons'), { ...data, createdAt: serverTimestamp() }); return; } catch { }
    }
    const coupons = await getCoupons();
    data.id = 'local-' + Date.now();
    coupons.unshift(data);
    try { localStorage.setItem('vp_coupons', JSON.stringify(coupons)); } catch { }
};

export const deleteCoupon = async (id) => {
    if (isFirebaseConfigured() && !id.startsWith('local-')) {
        try { await deleteDoc(doc(db, 'coupons', id)); return; } catch { }
    }
    const coupons = (await getCoupons()).filter(c => c.id !== id);
    try { localStorage.setItem('vp_coupons', JSON.stringify(coupons)); } catch { }
};

export const validateCoupon = async (code, productPrice) => {
    const coupons = await getCoupons();
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.active);
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return { valid: false, message: 'Coupon expired' };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, message: 'Coupon usage limit reached' };
    const discount = Math.round(productPrice * coupon.discountPercent / 100);
    return { valid: true, discount, finalPrice: productPrice - discount, coupon };
};

export { isFirebaseConfigured };

// ── AUDIT LOG ──
export const addAuditLog = async (action, detail = '') => {
    const entry = { action, detail, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured()) {
        try { await addDoc(collection(db, 'auditLog'), { ...entry, createdAt: serverTimestamp() }); return; } catch { }
    }
    try {
        const logs = JSON.parse(localStorage.getItem('vp_audit_log') || '[]');
        logs.unshift(entry);
        localStorage.setItem('vp_audit_log', JSON.stringify(logs.slice(0, 200)));
    } catch { }
};

export const getAuditLogs = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'auditLog'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt }));
        } catch { }
    }
    try { return JSON.parse(localStorage.getItem('vp_audit_log') || '[]'); } catch { return []; }
};

export const clearAuditLogs = async () => {
    if (isFirebaseConfigured()) {
        try {
            const snap = await getDocs(collection(db, 'auditLog'));
            await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
            return;
        } catch { }
    }
    try { localStorage.removeItem('vp_audit_log'); } catch { }
};

// ── ERROR LOG ──
export const logError = async (message, stack = '', url = '') => {
    const entry = { message, stack, url, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured()) {
        try { await addDoc(collection(db, 'errorLogs'), { ...entry, createdAt: serverTimestamp() }); return; } catch { }
    }
    try {
        const logs = JSON.parse(localStorage.getItem('vp_error_log') || '[]');
        logs.unshift(entry);
        localStorage.setItem('vp_error_log', JSON.stringify(logs.slice(0, 100)));
    } catch { }
};

export const getErrorLogs = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'errorLogs'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt }));
        } catch { }
    }
    try { return JSON.parse(localStorage.getItem('vp_error_log') || '[]'); } catch { return []; }
};

export const clearErrorLogs = async () => {
    if (isFirebaseConfigured()) {
        try {
            const snap = await getDocs(collection(db, 'errorLogs'));
            await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
            return;
        } catch { }
    }
    try { localStorage.removeItem('vp_error_log'); } catch { }
};

