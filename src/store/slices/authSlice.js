import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Helper to fetch custom profile from the public schema
async function fetchProfile(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to retrieve database admin profile:', err.message);
    return null;
  }
}

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (sessionInfo, { dispatch, rejectWithValue }) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return { session: null, profile: null };
      }

      // Allow passing a session directly (from onAuthStateChange) or fetching it
      let currentSession = sessionInfo;
      if (currentSession === undefined) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        currentSession = session;
      }

      if (currentSession) {
        // Query custom DB profile
        const dbProfile = await fetchProfile(currentSession.user.id);
        
        if (dbProfile) {
          if (!dbProfile.is_active) {
            // Automatically sign out disabled admins
            await supabase.auth.signOut();
            return { session: null, profile: null };
          }
          return { session: currentSession, profile: dbProfile };
        } else {
          // No profile found, log out to prevent being stuck
          await supabase.auth.signOut();
          return { session: null, profile: null };
        }
      }
      
      return { session: null, profile: null };
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // On error (e.g. invalid token), sign out and clear session
      if (supabase) await supabase.auth.signOut().catch(() => {});
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/update-password`,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  session: null,
  profile: null,
  loading: isSupabaseConfigured, // Start loading if configured
  isConfigured: isSupabaseConfigured,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.session = action.payload.session;
        state.profile = action.payload.profile;
        state.loading = false;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.session = null;
        state.profile = null;
        state.loading = false;
        state.error = action.payload || 'Authentication failed';
      })
      // Sign In
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.session = null;
        state.profile = null;
      });
  },
});

export default authSlice.reducer;
