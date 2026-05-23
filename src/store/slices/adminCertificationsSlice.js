import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// Async Thunks
export const fetchCertifications = createAsyncThunk(
  'adminCertifications/fetchCertifications',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return rejectWithValue(error.message);
    }
    return data;
  }
);

export const addCertification = createAsyncThunk(
  'adminCertifications/addCertification',
  async (certData, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('certifications').insert(certData);
    if (error) {
      return rejectWithValue(error.message);
    }
    dispatch(fetchCertifications());
    return true;
  }
);

export const toggleCertification = createAsyncThunk(
  'adminCertifications/toggleCertification',
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('certifications').update({ enabled: !enabled }).eq('id', id);
    if (error) {
      return rejectWithValue(error.message);
    }
    dispatch(fetchCertifications());
    return id;
  }
);

export const deleteCertification = createAsyncThunk(
  'adminCertifications/deleteCertification',
  async (id, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) {
      return rejectWithValue(error.message);
    }
    dispatch(fetchCertifications());
    return id;
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const adminCertificationsSlice = createSlice({
  name: 'adminCertifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCertifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCertifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load certifications';
      })
      // Add
      .addCase(addCertification.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add certification';
      })
      // Toggle
      .addCase(toggleCertification.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update certification';
      })
      // Delete
      .addCase(deleteCertification.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete certification';
      });
  },
});

export const { clearError } = adminCertificationsSlice.actions;
export default adminCertificationsSlice.reducer;
