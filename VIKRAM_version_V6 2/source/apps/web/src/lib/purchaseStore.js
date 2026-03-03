// ═══════════════════════════════════════════════════════
// Purchase Store — localStorage-based purchase tracking
// ═══════════════════════════════════════════════════════
// Works with PHP OTP auth (no live PocketBase needed).
// After a successful payment, call `savePurchase()` to
// store the product in the user's local purchase history.
// The My Products page reads from this store.
// ═══════════════════════════════════════════════════════

const PURCHASES_KEY = 'vp_purchases';

/**
 * Get all purchases for a given email.
 * Returns array sorted newest-first.
 */
export const getPurchases = (email) => {
    try {
        const all = JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
        if (!email) return all;
        return all.filter((p) => p.buyerEmail?.toLowerCase() === email.toLowerCase());
    } catch {
        return [];
    }
};

/**
 * Save a new purchase after successful payment.
 * Deduplicates by paymentId to prevent double-entries.
 */
export const savePurchase = ({
    productName,
    productId,
    productType,
    coverImageUrl,
    googleDriveLink,
    pricePaise,
    buyerEmail,
    buyerPhone,
    paymentId,
}) => {
    try {
        const all = JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');

        // Deduplicate: don't add if paymentId already exists
        if (paymentId && all.some((p) => p.paymentId === paymentId)) {
            return;
        }

        const purchase = {
            id: 'purchase_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            productName,
            productId: productId || '',
            productType: productType || 'ebook',
            coverImageUrl: coverImageUrl || '',
            googleDriveLink: googleDriveLink || '',
            pricePaise: pricePaise || 0,
            buyerEmail: buyerEmail || '',
            buyerPhone: buyerPhone || '',
            paymentId: paymentId || '',
            purchasedAt: new Date().toISOString(),
        };

        all.unshift(purchase); // newest first
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(all));
        return purchase;
    } catch (err) {
        console.error('Failed to save purchase:', err);
    }
};

/**
 * Get total purchase count for a given email.
 */
export const getPurchaseCount = (email) => {
    return getPurchases(email).length;
};
