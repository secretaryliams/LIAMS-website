import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminPageTransition from '../../components/motion/AdminPageTransition';
import './Admin.css';

export default function AdminLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const isSuperAdmin = profile?.role === 'super_admin';
  const visibleLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    isSuperAdmin && { to: '/admin/invite', label: 'Invite Admin' },
    { to: '/admin/announcements', label: 'Announcements' },
    { to: '/admin/upcoming-events', label: 'Upcoming Events' },
    { to: '/admin/previous-events', label: 'Previous Events' },
    { to: '/admin/certifications', label: 'Certifications' },
  ].filter(Boolean);

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-topbar__main">
            <h1>LIAMS Admin</h1>
            <button 
              className="admin-menu-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
          
          <div className={`admin-nav-container ${menuOpen ? 'is-open' : ''}`}>
            <nav className="admin-nav" aria-label="Admin sections">
              {visibleLinks.map(({ to, label, end }) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  end={end}
                  onClick={() => setMenuOpen(false)}
                >
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
          </div>
        </header>
        <AdminPageTransition />
      </div>
    </div>
  );
}
