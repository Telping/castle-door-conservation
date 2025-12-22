import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, signIn, signUp, signOut } from '@/services/supabase';
import {
  isDemoMode,
  demoUsers,
  getDemoUser,
  setDemoUser,
  initDemoUser,
} from '@/services/demoData';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      // Demo mode - check for saved user
      const savedUser = initDemoUser();
      setUser(savedUser);
      setLoading(false);
      return;
    }

    // Production mode - use Supabase
    getCurrentUser().then((profile) => {
      setUser(profile);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const profile = await getCurrentUser();
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      // Demo mode - find user by email
      const demoUser = demoUsers.find(u => u.email === email);
      if (demoUser) {
        setDemoUser(demoUser);
        setUser(demoUser);
        return { user: demoUser };
      }
      // In demo mode, any password works for demo users
      throw new Error('User not found. Try one of the demo emails listed below.');
    }

    setLoading(true);
    const { data, error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      throw error;
    }
    if (data.user) {
      const profile = await getCurrentUser();
      setUser(profile);
    }
    setLoading(false);
    return data;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: string) => {
    if (isDemoMode()) {
      throw new Error('Registration is disabled in demo mode. Please use a demo account.');
    }

    setLoading(true);
    const { data, error } = await signUp(email, password, name, role);
    if (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
    return data;
  }, []);

  const logout = useCallback(async () => {
    if (isDemoMode()) {
      setDemoUser(null);
      setUser(null);
      return;
    }

    const { error } = await signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  return {
    user: isDemoMode() ? getDemoUser() : user,
    loading,
    isAuthenticated: isDemoMode() ? !!getDemoUser() : !!user,
    login,
    register,
    logout,
    isDemoMode: isDemoMode(),
  };
}
