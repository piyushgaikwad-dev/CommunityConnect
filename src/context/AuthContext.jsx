import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUser,
  loginUser,
  registerUser,
  logoutUser,
  demoLogin,
} from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check for stored session
    const initAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const sbUser = data.session.user;
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sbUser.id)
              .single();

            setUser({
              id: sbUser.id,
              email: sbUser.email,
              name: profile?.name || sbUser.user_metadata?.name || 'Resident',
              role: profile?.role || 'resident',
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Auth session restore error:', err);
        }
      }

      // Check local storage fallback
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
      setLoading(false);
    };

    initAuth();

    // Listen to Supabase auth state change if configured
    if (isSupabaseConfigured() && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              name: profile?.name || session.user.user_metadata?.name || 'Resident',
              role: profile?.role || 'resident',
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => {
        listener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (credentials) => {
    const loggedUser = await loginUser(credentials);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const registeredUser = await registerUser(userData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const quickDemoLogin = async (role = 'resident') => {
    const target = await demoLogin(role);
    setUser(target);
    return target;
  };

  const isAdmin = user?.role === 'admin';
  const isResident = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isAdmin,
        isResident,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
