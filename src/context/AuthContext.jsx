// LIAMS Unified Authentication Context
// Path: src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Fetch custom admin profile from the public schema
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to retrieve database admin profile:', err.message);
      return null;
    }
  }, []);

  // Listen to session changes and retrieve profile metadata
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    async function handleSession(s) {
      if (!active) return;
      
      if (s) {
        setSession(s);
        // Query custom DB profile
        const dbProfile = await fetchProfile(s.user.id);
        
        if (active) {
          if (dbProfile) {
            if (!dbProfile.is_active) {
              // Automatically sign out disabled admins
              await supabase.auth.signOut();
              setSession(null);
              setProfile(null);
            } else {
              setProfile(dbProfile);
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      } else {
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    }

    // Recover session immediately on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSession(s);
    });

    // Session recovery event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log(`Auth state changed: ${event}`);
      await handleSession(s);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase is not configured');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
