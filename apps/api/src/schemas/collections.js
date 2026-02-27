/**
 * PocketBase Collection Schema Reference
 * ========================================
 * This file documents the PocketBase collection structures.
 * The actual collections are managed via PocketBase Admin UI.
 * This serves as a reference for the development team.
 *
 * Collections:
 * 1. users (built-in, enhanced)
 * 2. products
 * 3. purchases (NEW)
 * 4. product_files (existing)
 */

// ─── USERS COLLECTION (Built-in + Enhanced) ─────────────────────────
// PocketBase's built-in `users` collection already provides:
//   id, email, name, username, avatar, verified, created, updated
//
// Additional fields to add via PocketBase Admin:
//   - profilePicture (URL)    → Avatar URL from Google OAuth
//   - phone (text)            → WhatsApp number for delivery

export const UsersSchema = {
    collection: 'users',
    type: 'auth', // PocketBase auth collection
    fields: {
        id: { type: 'string', auto: true },
        email: { type: 'email', required: true, unique: true },
        name: { type: 'text', required: false },
        username: { type: 'text', required: false },
        avatar: { type: 'file', required: false },
        profilePicture: { type: 'url', required: false },  // Google OAuth avatar
        phone: { type: 'text', required: false },
        verified: { type: 'bool', default: false },
        created: { type: 'date', auto: true },
        updated: { type: 'date', auto: true },
    },
    authProviders: ['email/password', 'google'],
};


// ─── PRODUCTS COLLECTION ─────────────────────────────────────────────
// Stores all digital products (ebooks, courses)

export const ProductsSchema = {
    collection: 'products',
    type: 'base',
    fields: {
        id: { type: 'string', auto: true },
        title: { type: 'text', required: true },
        description: { type: 'text', required: false },
        price: { type: 'number', required: true, min: 0 },
        type: { type: 'select', options: ['ebook', 'course'], required: true },
        image: { type: 'file', required: false },
        coverImage: { type: 'file', required: false },
        googleDriveLink: { type: 'url', required: true },  // Hidden — only exposed post-purchase
        isActive: { type: 'bool', default: true },
        benefits: { type: 'text', required: false },  // Comma-separated list
        whatYouLearn: { type: 'text', required: false },  // Comma-separated list
        duration: { type: 'text', required: false },
        created: { type: 'date', auto: true },
        updated: { type: 'date', auto: true },
    },
    // API Rule: googleDriveLink should NEVER be returned in list/view endpoints
    // Only returned after successful purchase verification
};


// ─── PURCHASES COLLECTION (NEW) ──────────────────────────────────────
// Tracks all user purchases for the "My Products" portal

export const PurchasesSchema = {
    collection: 'purchases',
    type: 'base',
    fields: {
        id: { type: 'string', auto: true },
        user: { type: 'relation', collection: 'users', required: true, cascadeDelete: true },
        product: { type: 'relation', collection: 'products', required: true },
        paymentId: { type: 'text', required: true },   // Razorpay payment_id
        orderId: { type: 'text', required: false },  // Razorpay order_id
        status: { type: 'select', options: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
        amountPaid: { type: 'number', required: false, min: 0 },
        created: { type: 'date', auto: true },
        updated: { type: 'date', auto: true },
    },
    // API Rules:
    // - List/View: Only the owning user can see their purchases
    //   listRule: "@request.auth.id = user"
    //   viewRule: "@request.auth.id = user"
    // - Create: Authenticated users only
    //   createRule: "@request.auth.id != ''"
    // - Update/Delete: Admin only
    //   updateRule: null (admin only)
    //   deleteRule: null (admin only)
};


// ─── PRODUCT FILES COLLECTION (Existing) ─────────────────────────────
// Managed by admin for file uploads

export const ProductFilesSchema = {
    collection: 'product_files',
    type: 'base',
    fields: {
        id: { type: 'string', auto: true },
        productId: { type: 'relation', collection: 'products', required: true },
        fileName: { type: 'text', required: true },
        fileType: { type: 'select', options: ['pdf', 'audio', 'video'] },
        file: { type: 'file', required: true },
        created: { type: 'date', auto: true },
        updated: { type: 'date', auto: true },
    },
};
