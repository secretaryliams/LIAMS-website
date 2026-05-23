import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../lib/supabase';
import { initializeAuth } from '../../store/slices/authSlice';
import Loader from './Loader';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { loading, isConfigured } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      return;
    }

    let active = true;

    // Fetch initial session on mount
    dispatch(initializeAuth());

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        if (!active) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
           dispatch(initializeAuth(session));
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch, isConfigured]);

  // We could block the whole app rendering until auth is determined,
  // but usually we only want to block protected routes.
  // We'll let ProtectedAdminRoute handle the loading state block specifically for admin routes,
  // but we run this provider at the root level to ensure session is maintained.
  
  return children;
}
