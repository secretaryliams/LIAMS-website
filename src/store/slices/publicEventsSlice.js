import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axiosConfig';
import { formatEventDateLabel, formatEventDateParts } from '../../lib/eventFormat';
import { formatEventVenue } from '../../lib/eventVenue';

function mapUpcomingEvent(row) {
  const primaryDate = row.start_date || row.event_date;
  const parts = formatEventDateParts(primaryDate);
  return {
    id: String(row.id),
    title: row.title,
    description: row.description || (row.form_link
      ? 'Registration / submission link available. Join us for this advanced session.'
      : 'Details coming soon. Stay tuned for further announcements.'),
    form_link: row.form_link,
    image_url: row.image_url,
    event_date: row.event_date,
    start_date: row.start_date,
    end_date: row.end_date,
    registration_end_date: row.registration_end_date,
    ...parts,
    dateLabel: formatEventDateLabel(primaryDate),
    venue: formatEventVenue(row.venue),
  };
}

export const fetchPublicUpcomingEvents = createAsyncThunk(
  'publicEvents/fetchPublicUpcomingEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/upcoming_events', {
        params: {
          select: '*',
          enabled: 'eq.true',
          order: 'start_date.asc.nullsfirst',
        },
      });
      const mapped = response.data.map(mapUpcomingEvent);
      // Sort in Javascript as well to ensure bulletproof ascending order by Start Date
      return mapped.sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date) : new Date(a.event_date || '9999-12-31');
        const dateB = b.start_date ? new Date(b.start_date) : new Date(b.event_date || '9999-12-31');
        return dateA - dateB;
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicPreviousEvents = createAsyncThunk(
  'publicEvents/fetchPublicPreviousEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/previous_events', {
        params: {
          select: '*',
          order: 'created_at.desc',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  upcoming: [],
  previous: [],
  loadingUpcoming: false,
  loadingPrevious: false,
  errorUpcoming: null,
  errorPrevious: null,
};

const publicEventsSlice = createSlice({
  name: 'publicEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upcoming Events
      .addCase(fetchPublicUpcomingEvents.pending, (state) => {
        state.loadingUpcoming = true;
        state.errorUpcoming = null;
      })
      .addCase(fetchPublicUpcomingEvents.fulfilled, (state, action) => {
        state.loadingUpcoming = false;
        state.upcoming = action.payload || [];
      })
      .addCase(fetchPublicUpcomingEvents.rejected, (state, action) => {
        state.loadingUpcoming = false;
        state.errorUpcoming = action.payload || 'Failed to fetch public upcoming events';
      })
      // Previous Events
      .addCase(fetchPublicPreviousEvents.pending, (state) => {
        state.loadingPrevious = true;
        state.errorPrevious = null;
      })
      .addCase(fetchPublicPreviousEvents.fulfilled, (state, action) => {
        state.loadingPrevious = false;
        state.previous = action.payload || [];
      })
      .addCase(fetchPublicPreviousEvents.rejected, (state, action) => {
        state.loadingPrevious = false;
        state.errorPrevious = action.payload || 'Failed to fetch public previous events';
      });
  },
});

export default publicEventsSlice.reducer;
