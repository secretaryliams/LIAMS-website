import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// Async Thunks
export const fetchAnnouncements = createAsyncThunk(
  'adminAnnouncements/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return rejectWithValue(error.message);
    }
    return data;
  }
);

export const addAnnouncement = createAsyncThunk(
  'adminAnnouncements/addAnnouncement',
  async (text, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('announcements').insert({ text: text.trim() });
    if (error) {
      return rejectWithValue(error.message);
    }
    // Refresh the list after adding
    dispatch(fetchAnnouncements());
    return true;
  }
);

export const toggleAnnouncement = createAsyncThunk(
  'adminAnnouncements/toggleAnnouncement',
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('announcements').update({ enabled: !enabled }).eq('id', id);
    if (error) {
      return rejectWithValue(error.message);
    }
    dispatch(fetchAnnouncements());
    return id;
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'adminAnnouncements/deleteAnnouncement',
  async (id, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      return rejectWithValue(error.message);
    }
    dispatch(fetchAnnouncements());
    return id;
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const adminAnnouncementsSlice = createSlice({
  name: 'adminAnnouncements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load announcements';
      })
      // Add
      .addCase(addAnnouncement.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add announcement';
      })
      // Toggle
      .addCase(toggleAnnouncement.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update announcement';
      })
      // Delete
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete announcement';
      });
  },
});

export const { clearError } = adminAnnouncementsSlice.actions;
export default adminAnnouncementsSlice.reducer;
