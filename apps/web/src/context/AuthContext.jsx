import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider — Native PocketBase Authentication
 * Replaces Clerk.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load state
    setIsLoading(false);

    // Listen to auth state changes from PocketBase
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isAdmin = currentUser?.collectionName === 'admins' || currentUser?.role === 'admin';
  const isAuthenticated = pb.authStore.isValid;

  const currentAdmin = isAuthenticated && isAdmin ? currentUser : null;

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const getToken = async () => {
    return pb.authStore.token;
  };

  return (
    <AuthContext.Provider value={{
      currentUser: isAdmin ? null : currentUser,
      currentAdmin,
      logout,
      isLoading,
      isAuthenticated,
      isAdmin,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
