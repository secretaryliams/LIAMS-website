import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminPageTransition from '../../components/motion/AdminPageTransition';
import './Admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/upcoming-events', label: 'Upcoming Events' },
  { to: '/admin/previous-events', label: 'Previous Events' },
  { to: '/admin/certifications', label: 'Certifications' },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <h1>LIAMS Admin</h1>
          <nav className="admin-nav" aria-label="Admin sections">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="admin-actions">
            <Link to="/" className="btn btn--view-site">
              View site
            </Link>
            <button type="button" className="btn btn--navy" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <AdminPageTransition />
      </div>
    </div>
  );
}
