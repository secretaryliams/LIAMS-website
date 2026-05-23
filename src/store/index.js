import { configureStore } from '@reduxjs/toolkit';
import adminAnnouncementsReducer from './slices/adminAnnouncementsSlice';
import adminEventsReducer from './slices/adminEventsSlice';
import adminCertificationsReducer from './slices/adminCertificationsSlice';
import publicAnnouncementsReducer from './slices/publicAnnouncementsSlice';
import publicEventsReducer from './slices/publicEventsSlice';
import publicCertificationsReducer from './slices/publicCertificationsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAnnouncements: adminAnnouncementsReducer,
    adminEvents: adminEventsReducer,
    adminCertifications: adminCertificationsReducer,
    publicAnnouncements: publicAnnouncementsReducer,
    publicEvents: publicEventsReducer,
    publicCertifications: publicCertificationsReducer,
  },
});
