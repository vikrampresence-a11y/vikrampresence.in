
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (pb.authStore.isValid) {
        if (pb.authStore.model?.collectionName === 'admins') {
          setCurrentAdmin(pb.authStore.model);
          setCurrentUser(null);
        } else if (pb.authStore.model?.collectionName === 'users') {
          setCurrentUser(pb.authStore.model);
          setCurrentAdmin(null);
        }
      } else {
        setCurrentAdmin(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (pb.authStore.isValid) {
        if (model?.collectionName === 'admins') {
          setCurrentAdmin(model);
          setCurrentUser(null);
        } else if (model?.collectionName === 'users') {
          setCurrentUser(model);
          setCurrentAdmin(null);
        }
      } else {
        setCurrentAdmin(null);
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const authData = await pb.collection('admins').authWithPassword(email, password);
      setCurrentAdmin(authData.record);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const signupUser = async (data) => {
    try {
      const record = await pb.collection('users').create(data, { $autoCancel: false });
      await loginUser(data.email, data.password);
      return record;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentAdmin(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      currentAdmin, 
      loginAdmin, 
      loginUser, 
      signupUser, 
      logout, 
      isLoading, 
      isAuthenticated: !!currentUser || !!currentAdmin,
      isAdmin: !!currentAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
