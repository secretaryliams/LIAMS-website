import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axiosConfig';
import { formatEventDateLabel, formatEventDateParts } from '../../lib/eventFormat';
import { formatEventVenue } from '../../lib/eventVenue';

function mapUpcomingEvent(row) {
  const parts = formatEventDateParts(row.event_date);
  return {
    id: String(row.id),
    title: row.title,
    description: row.form_link
      ? 'Registration / submission link available.'
      : 'Details coming soon.',
    form_link: row.form_link,
    image_url: row.image_url,
    event_date: row.event_date,
    ...parts,
    dateLabel: formatEventDateLabel(row.event_date),
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
          order: 'event_date.asc.nullsfirst', // Note: in PostgREST it's usually asc.nullsfirst or asc.nullslast
        },
      });
      return response.data.map(mapUpcomingEvent);
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
