/**
 * PocketBase Admin Client for Backend API
 * ========================================
 * Used by the Express API server to interact with PocketBase
 * for creating/updating purchase records.
 * 
 * Authenticates as an admin to bypass collection rules.
 */
import Pocketbase from 'pocketbase';
import logger from '../utils/logger.js';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

const pb = new Pocketbase(POCKETBASE_URL);

/**
 * Authenticate as PocketBase admin (for server-side operations)
 * Call this once at startup or lazily before DB operations.
 */
export const authenticateAdmin = async () => {
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        logger.warn('PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD not set. DB operations may fail.');
        return;
    }

    try {
        await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
        logger.info('PocketBase admin authenticated successfully');
    } catch (error) {
        logger.error('PocketBase admin auth failed:', error.message);
    }
};

export default pb;
