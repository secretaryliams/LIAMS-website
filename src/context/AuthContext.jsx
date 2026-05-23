// LIAMS Unified Authentication Context
// Path: src/context/AuthContext.jsx

import { createContext, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, signOut, resetPassword, updatePassword } from '../store/slices/authSlice';
import { isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { session, profile, loading, error } = useSelector((state) => state.auth);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      error,
      isConfigured: isSupabaseConfigured,
      signIn: async (email, password) => {
        const result = await dispatch(signIn({ email, password }));
        if (signIn.rejected.match(result)) throw new Error(result.payload || 'Sign in failed');
      },
      signOut: async () => {
        const result = await dispatch(signOut());
        if (signOut.rejected.match(result)) throw new Error(result.payload || 'Sign out failed');
      },
      resetPassword: async (email) => {
        const result = await dispatch(resetPassword(email));
        if (resetPassword.rejected.match(result)) throw new Error(result.payload || 'Reset password failed');
      },
      updatePassword: async (newPassword) => {
        const result = await dispatch(updatePassword(newPassword));
        if (updatePassword.rejected.match(result)) throw new Error(result.payload || 'Update password failed');
      },
    }),
    [session, profile, loading, error, dispatch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
