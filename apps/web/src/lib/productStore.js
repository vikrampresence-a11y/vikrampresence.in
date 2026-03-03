// ═══════════════════════════════════════════════
// Product Store — localStorage + optional Firebase
// Works IMMEDIATELY with localStorage fallback.
// If Firebase is configured, syncs to Firestore.
// ═══════════════════════════════════════════════

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
} from 'firebase/firestore';

const LS_KEY = 'vp_products';

// ── Check if Firebase is actually configured ──
const isFirebaseConfigured = () => {
    try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY;
        return key && !key.includes('YOUR_') && key.length > 10;
    } catch {
        return false;
    }
};

// ── localStorage helpers ──
const getLocalProducts = () => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveLocalProducts = (products) => {
    localStorage.setItem(LS_KEY, JSON.stringify(products));
};

// ── Public API ──

/**
 * Get all products. Returns from Firestore if configured, else localStorage.
 */
export const getAllProducts = async () => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (err) {
            console.warn('Firestore read failed, falling back to localStorage:', err);
            return getLocalProducts();
        }
    }
    return getLocalProducts();
};

/**
 * Get products filtered by type ('ebook' or 'course')
 */
export const getProductsByType = async (type) => {
    const all = await getAllProducts();
    return all.filter((p) => p.type === type);
};

/**
 * Subscribe to real-time product updates (admin dashboard).
 * Returns an unsubscribe function.
 */
export const subscribeProducts = (callback) => {
    if (isFirebaseConfigured()) {
        try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                // Also sync to localStorage as backup
                saveLocalProducts(items);
                callback(items, null);
            }, (err) => {
                console.warn('Firestore listen failed:', err);
                callback(getLocalProducts(), null);
            });
        } catch (err) {
            callback(getLocalProducts(), null);
            return () => { };
        }
    }

    // localStorage mode — return products immediately
    callback(getLocalProducts(), null);
    // Poll localStorage every 500ms for changes (e.g. when admin adds a product)
    const interval = setInterval(() => {
        callback(getLocalProducts(), null);
    }, 500);
    return () => clearInterval(interval);
};

/**
 * Add a new product. Saves to Firestore if configured, else localStorage.
 */
export const addProduct = async (product) => {
    const productData = {
        title: product.title,
        description: product.description || '',
        pricePaise: product.pricePaise,
        coverImageUrl: product.coverImageUrl,
        driveLink: product.driveLink,
        type: product.type || 'ebook',
        createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
        try {
            await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: serverTimestamp(),
            });
            return;
        } catch (err) {
            console.warn('Firestore write failed, saving to localStorage:', err);
        }
    }

    // localStorage fallback
    const products = getLocalProducts();
    productData.id = 'local-' + Date.now();
    products.unshift(productData);
    saveLocalProducts(products);
};

/**
 * Delete a product by ID.
 */
export const deleteProduct = async (productId) => {
    if (isFirebaseConfigured() && !productId.startsWith('local-')) {
        try {
            await deleteDoc(doc(db, 'products', productId));
            return;
        } catch (err) {
            console.warn('Firestore delete failed:', err);
        }
    }

    // localStorage fallback
    const products = getLocalProducts().filter((p) => p.id !== productId);
    saveLocalProducts(products);
};

/**
 * Update an existing product by ID.
 */
export const updateProduct = async (productId, updates) => {
    const productData = {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.pricePaise !== undefined && { pricePaise: updates.pricePaise }),
        ...(updates.coverImageUrl !== undefined && { coverImageUrl: updates.coverImageUrl }),
        ...(updates.driveLink !== undefined && { driveLink: updates.driveLink }),
        ...(updates.type !== undefined && { type: updates.type }),
        updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured() && !productId.startsWith('local-')) {
        try {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'products', productId), productData);
            return;
        } catch (err) {
            console.warn('Firestore update failed, updating localStorage:', err);
        }
    }

    // localStorage fallback
    const products = getLocalProducts().map((p) =>
        p.id === productId ? { ...p, ...productData } : p
    );
    saveLocalProducts(products);
};

export { isFirebaseConfigured };
