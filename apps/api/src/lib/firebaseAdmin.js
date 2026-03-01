/**
 * ===================================================================
 * FIREBASE ADMIN SDK — Secure Signed URL Generation
 * ===================================================================
 *
 * Initializes Firebase Admin with a service account and provides
 * a function to generate temporary signed URLs for digital products
 * stored in Firebase Storage.
 *
 * Signed URLs expire after 48 hours — preventing piracy from
 * permanent public links being shared on WhatsApp/Telegram.
 *
 * ===================================================================
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import logger from '../utils/logger.js';

// ─── Firebase Admin Singleton ────────────────────────────────────────
let firebaseApp = null;
let storageBucket = null;

const initializeFirebase = () => {
    if (firebaseApp) return storageBucket;

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

    if (!serviceAccountPath || !bucketName) {
        logger.error('Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH and FIREBASE_STORAGE_BUCKET in .env');
        throw new Error('Firebase Admin credentials not configured.');
    }

    try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: bucketName,
        });

        storageBucket = admin.storage().bucket();
        logger.info(`Firebase Admin initialized — Bucket: ${bucketName}`);
        return storageBucket;
    } catch (error) {
        logger.error('Failed to initialize Firebase Admin:', error.message);
        throw error;
    }
};


// ─── Generate Signed URL (48-hour expiry) ────────────────────────────
/**
 * Generates a temporary signed download URL for a file in Firebase Storage.
 *
 * @param {string} filePath - Path to the file in Firebase Storage (e.g., "ebooks/my-product.pdf")
 * @param {number} expiryHours - How long the URL remains valid (default: 48 hours)
 * @returns {Promise<string>} - The signed download URL
 */
export const generateSignedUrl = async (filePath, expiryHours = 48) => {
    const bucket = initializeFirebase();

    if (!filePath) {
        throw new Error('File path is required to generate a signed URL');
    }

    const file = bucket.file(filePath);

    // Verify the file actually exists before generating a URL
    const [exists] = await file.exists();
    if (!exists) {
        logger.error(`Firebase Storage: File not found — "${filePath}"`);
        throw new Error(`File not found in Firebase Storage: ${filePath}`);
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: expiresAt,
    });

    logger.info(`Signed URL generated for "${filePath}" — expires in ${expiryHours}h`);
    return signedUrl;
};

export default { generateSignedUrl };
