import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axiosConfig';

export const fetchPublicAnnouncements = createAsyncThunk(
  'publicAnnouncements/fetchPublicAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/announcements', {
        params: {
          select: 'text',
          enabled: 'eq.true',
          order: 'created_at.desc',
        },
      });
      return response.data.map((row) => row.text);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const publicAnnouncementsSlice = createSlice({
  name: 'publicAnnouncements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchPublicAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch public announcements';
      });
  },
});

export default publicAnnouncementsSlice.reducer;
