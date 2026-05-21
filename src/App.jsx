import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Training from './pages/Training';
import Research from './pages/Research';
import Events from './pages/Events';
import Collaborations from './pages/Collaborations';
import Contact from './pages/Contact';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Announcements from './pages/admin/Announcements';
import UpcomingEvents from './pages/admin/UpcomingEvents';
import PreviousEvents from './pages/admin/PreviousEvents';
import Certifications from './pages/admin/Certifications';
import './pages/Shared.css';
import './pages/admin/Admin.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="training" element={<Training />} />
          <Route path="research" element={<Research />} />
          <Route path="events" element={<Events />} />
          <Route path="collaborations" element={<Collaborations />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="upcoming-events" element={<UpcomingEvents />} />
            <Route path="previous-events" element={<PreviousEvents />} />
            <Route path="certifications" element={<Certifications />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
