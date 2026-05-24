import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';
import Loader from './components/common/Loader';
import AuthInitializer from './components/common/AuthInitializer';
import './pages/Shared.css';
import './pages/admin/Admin.css';

// Lazy loaded public components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Training = lazy(() => import('./pages/Training'));
const Research = lazy(() => import('./pages/Research'));
const Events = lazy(() => import('./pages/Events'));
const Collaborations = lazy(() => import('./pages/Collaborations'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy loaded admin components
const Login = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const UpcomingEvents = lazy(() => import('./pages/admin/UpcomingEvents'));
const PreviousEvents = lazy(() => import('./pages/admin/PreviousEvents'));
const Certifications = lazy(() => import('./pages/admin/Certifications'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<Loader />}><Home /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<Loader />}><About /></Suspense>} />
          <Route path="training" element={<Suspense fallback={<Loader />}><Training /></Suspense>} />
          <Route path="research" element={<Suspense fallback={<Loader />}><Research /></Suspense>} />
          <Route path="events" element={<Suspense fallback={<Loader />}><Events /></Suspense>} />
          <Route path="certificates" element={<Suspense fallback={<Loader />}><Certificates /></Suspense>} />
          <Route path="collaborations" element={<Suspense fallback={<Loader />}><Collaborations /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<Loader />}><Contact /></Suspense>} />
        </Route>

        <Route path="/admin/login" element={<Suspense fallback={<Loader />}><Login /></Suspense>} />
        <Route path="/admin/forgot-password" element={<Suspense fallback={<Loader />}><ForgotPassword /></Suspense>} />
        <Route path="/admin/reset-password" element={<Suspense fallback={<Loader />}><ResetPassword /></Suspense>} />
        <Route path="/admin/update-password" element={<Suspense fallback={<Loader />}><ResetPassword /></Suspense>} />
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route element={<Suspense fallback={<Loader />}><AdminLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<Loader />}><Dashboard /></Suspense>} />
            <Route path="invite" element={<Navigate to="/admin" replace />} />
            <Route path="announcements" element={<Suspense fallback={<Loader />}><Announcements /></Suspense>} />
            <Route path="upcoming-events" element={<Suspense fallback={<Loader />}><UpcomingEvents /></Suspense>} />
            <Route path="previous-events" element={<Suspense fallback={<Loader />}><PreviousEvents /></Suspense>} />
            <Route path="certifications" element={<Suspense fallback={<Loader />}><Certifications /></Suspense>} />
          </Route>
        </Route>
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}
