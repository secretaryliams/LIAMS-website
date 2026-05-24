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
      const [certResponse, settingsResponse] = await Promise.all([
        api.get('/certifications', {
          params: {
            select: '*',
            order: 'created_at.desc',
          },
        }),
        api.get('/site_settings', {
          params: {
            select: 'value',
            key: 'eq.certifications_section_title',
          },
        }),
      ]);

      const items = (certResponse.data || []).map(mapCertification);
      let sectionTitle = 'Certifications';
      if (settingsResponse.data && settingsResponse.data.length > 0) {
        sectionTitle = settingsResponse.data[0].value?.trim() || 'Certifications';
      }

      return { items, sectionTitle };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  sectionTitle: 'Certifications',
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
        state.items = action.payload.items || [];
        state.sectionTitle = action.payload.sectionTitle || 'Certifications';
      })
      .addCase(fetchPublicCertifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch public certifications';
      });
  },
});

export default publicCertificationsSlice.reducer;
