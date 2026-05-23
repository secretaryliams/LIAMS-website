import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axiosConfig';

function mapCertification(row) {
  return {
    id: String(row.id),
    title: row.title,
    subtitle: row.drive_link ? 'View certificate' : 'Certificate document',
    drive_link: row.drive_link,
    icon: '📄',
  };
}

export const fetchPublicCertifications = createAsyncThunk(
  'publicCertifications/fetchPublicCertifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/certifications', {
        params: {
          select: '*',
          order: 'created_at.desc',
        },
      });
      return response.data.map(mapCertification);
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

const publicCertificationsSlice = createSlice({
  name: 'publicCertifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicCertifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCertifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchPublicCertifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch public certifications';
      });
  },
});

export default publicCertificationsSlice.reducer;
