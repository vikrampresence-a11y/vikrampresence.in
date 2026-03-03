import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const VP_AUTH_KEY = 'vp_auth_user';

/**
 * AuthProvider — Dual Authentication Support
 * 1. PocketBase native auth (if PB is running)
 * 2. PHP OTP localStorage auth (Hostinger shared hosting)
 *
 * V2.0 FIX: Added localStorage-based auth so PHP OTP login works
 * without requiring a live PocketBase instance.
 */
export const AuthProvider = ({ children }) => {
  // Try to load PHP auth user from localStorage
  const getStoredPhpUser = () => {
    try {
      const stored = localStorage.getItem(VP_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(pb.authStore.model || getStoredPhpUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);

    // Listen to PocketBase auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model) {
        setCurrentUser(model);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // V2.0 FIX: isAuthenticated checks BOTH PocketBase AND localStorage PHP auth
  const phpUser = getStoredPhpUser();
  const isAuthenticated = pb.authStore.isValid || !!phpUser;
  const activeUser = pb.authStore.model || phpUser;

  const isAdmin = activeUser?.collectionName === 'admins' || activeUser?.role === 'admin';
  const currentAdmin = isAuthenticated && isAdmin ? activeUser : null;

  /**
   * V2.0: Login with PHP OTP token — saves user to localStorage
   * Called from LoginPage after successful OTP verification
   */
  const loginWithPhpUser = useCallback((userData) => {
    const user = {
      id: userData.id || 'php_user_' + Date.now(),
      email: userData.email,
      name: userData.name || '',
      role: 'user',
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(VP_AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    localStorage.removeItem(VP_AUTH_KEY);
    setCurrentUser(null);
  }, []);

  const getToken = useCallback(async () => {
    return pb.authStore.token || null;
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser: isAdmin ? null : activeUser,
      currentAdmin,
      logout,
      isLoading,
      isAuthenticated,
      isAdmin,
      getToken,
      loginWithPhpUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
