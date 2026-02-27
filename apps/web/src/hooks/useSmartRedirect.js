/**
 * useSmartRedirect Hook
 * =====================
 * Captures the current page URL before redirecting to login,
 * and restores it after successful authentication.
 *
 * Flow:
 * 1. User clicks "Buy Now" on /product/ebook-1 while logged out
 * 2. saveRedirectPath() stores "/product/ebook-1" in sessionStorage
 * 3. User is redirected to /login?redirect_url=/product/ebook-1
 * 4. After login, getAndClearRedirectPath() retrieves and clears the stored path
 * 5. User is navigated back to /product/ebook-1
 */

import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'redirectAfterLogin';

/**
 * Saves the redirect path to sessionStorage
 * @param {string} [path] - Optional explicit path. Defaults to current pathname + search
 */
export const saveRedirectPath = (path) => {
    const redirectPath = path || window.location.pathname + window.location.search;
    sessionStorage.setItem(STORAGE_KEY, redirectPath);
};

/**
 * Gets and clears the stored redirect path
 * @returns {string|null} The stored redirect path, or null
 */
export const getAndClearRedirectPath = () => {
    const path = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return path;
};

/**
 * React Hook for smart redirect functionality
 */
const useSmartRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    /**
     * Save current path and redirect to login
     */
    const redirectToLogin = useCallback(() => {
        const currentPath = location.pathname + location.search;
        saveRedirectPath(currentPath);
        navigate(`/login?redirect_url=${encodeURIComponent(currentPath)}`);
    }, [location, navigate]);

    /**
     * After login, redirect to the saved path or fallback
     * Priority: 1) URL param redirect_url  2) sessionStorage  3) fallback
     * @param {string} [fallback='/'] - Fallback path if no redirect stored
     */
    const executeRedirect = useCallback((fallback = '/') => {
        // Priority 1: URL query parameter
        const urlRedirect = searchParams.get('redirect_url');
        if (urlRedirect) {
            navigate(decodeURIComponent(urlRedirect), { replace: true });
            return;
        }

        // Priority 2: sessionStorage
        const storedPath = getAndClearRedirectPath();
        if (storedPath) {
            navigate(storedPath, { replace: true });
            return;
        }

        // Priority 3: React Router location state (from ProtectedRoute)
        const stateFrom = location.state?.from?.pathname;
        if (stateFrom) {
            navigate(stateFrom, { replace: true });
            return;
        }

        // Fallback
        navigate(fallback, { replace: true });
    }, [searchParams, location.state, navigate]);

    return {
        redirectToLogin,
        executeRedirect,
        saveRedirectPath,
        getAndClearRedirectPath,
    };
};

export default useSmartRedirect;
