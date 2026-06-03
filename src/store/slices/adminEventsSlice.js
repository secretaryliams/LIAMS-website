import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// Upcoming Events
export const fetchUpcomingEvents = createAsyncThunk(
  'adminEvents/fetchUpcomingEvents',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('upcoming_events')
      .select('*')
      .order('start_date', { ascending: true, nullsFirst: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const addUpcomingEvent = createAsyncThunk(
  'adminEvents/addUpcomingEvent',
  async (eventData, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('upcoming_events').insert(eventData);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchUpcomingEvents());
    return true;
  }
);

export const updateUpcomingEvent = createAsyncThunk(
  'adminEvents/updateUpcomingEvent',
  async ({ id, eventData }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase
      .from('upcoming_events')
      .update(eventData)
      .eq('id', id);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchUpcomingEvents());
    return true;
  }
);

export const toggleUpcomingEvent = createAsyncThunk(
  'adminEvents/toggleUpcomingEvent',
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('upcoming_events').update({ enabled: !enabled }).eq('id', id);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchUpcomingEvents());
    return id;
  }
);

export const deleteUpcomingEvent = createAsyncThunk(
  'adminEvents/deleteUpcomingEvent',
  async (id, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('upcoming_events').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchUpcomingEvents());
    return id;
  }
);

// Previous Events
export const fetchPreviousEvents = createAsyncThunk(
  'adminEvents/fetchPreviousEvents',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('previous_events')
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const addPreviousEvent = createAsyncThunk(
  'adminEvents/addPreviousEvent',
  async (eventData, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('previous_events').insert(eventData);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchPreviousEvents());
    return true;
  }
);

export const togglePreviousEvent = createAsyncThunk(
  'adminEvents/togglePreviousEvent',
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('previous_events').update({ enabled: !enabled }).eq('id', id);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchPreviousEvents());
    return id;
  }
);

export const deletePreviousEvent = createAsyncThunk(
  'adminEvents/deletePreviousEvent',
  async (id, { dispatch, rejectWithValue }) => {
    const { error } = await supabase.from('previous_events').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    dispatch(fetchPreviousEvents());
    return id;
  }
);

const initialState = {
  upcoming: [],
  previous: [],
  loadingUpcoming: false,
  loadingPrevious: false,
  error: null,
};

const adminEventsSlice = createSlice({
  name: 'adminEvents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upcoming
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.loadingUpcoming = true;
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.loadingUpcoming = false;
        state.upcoming = action.payload || [];
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.loadingUpcoming = false;
        state.error = action.payload || 'Failed to load upcoming events';
      })
      .addCase(addUpcomingEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add upcoming event';
      })
      .addCase(updateUpcomingEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to save changes to upcoming event';
      })
      .addCase(toggleUpcomingEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update upcoming event';
      })
      .addCase(deleteUpcomingEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete upcoming event';
      })
      // Previous
      .addCase(fetchPreviousEvents.pending, (state) => {
        state.loadingPrevious = true;
        state.error = null;
      })
      .addCase(fetchPreviousEvents.fulfilled, (state, action) => {
        state.loadingPrevious = false;
        state.previous = action.payload || [];
      })
      .addCase(fetchPreviousEvents.rejected, (state, action) => {
        state.loadingPrevious = false;
        state.error = action.payload || 'Failed to load previous events';
      })
      .addCase(addPreviousEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add previous event';
      })
      .addCase(togglePreviousEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update previous event';
      })
      .addCase(deletePreviousEvent.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete previous event';
      });
  },
});

export const { clearError } = adminEventsSlice.actions;
export default adminEventsSlice.reducer;
