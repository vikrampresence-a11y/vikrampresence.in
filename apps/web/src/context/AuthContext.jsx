
import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider — thin wrapper around Clerk hooks.
 * Maintains the same API shape that the rest of the app expects:
 *   isAuthenticated, isAdmin, currentUser, currentAdmin, logout, isLoading
 *
 * Admin detection: set `role: "admin"` in Clerk Dashboard → Users → publicMetadata
 */
export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuth();

  // Admin check via Clerk publicMetadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Map Clerk user to the shape the app already uses
  const currentUser = isSignedIn && user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    name: user.fullName || user.firstName || '',
    profilePicture: user.imageUrl || '',
    avatar: user.imageUrl || '',
  } : null;

  const currentAdmin = isSignedIn && isAdmin ? currentUser : null;

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{
      currentUser: isAdmin ? null : currentUser,
      currentAdmin,
      logout,
      isLoading: !isLoaded,
      isAuthenticated: !!isSignedIn,
      isAdmin,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
