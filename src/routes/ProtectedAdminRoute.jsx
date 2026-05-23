// LIAMS Secure RBAC Router Guard
// Path: src/routes/ProtectedAdminRoute.jsx

import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProtectedAdminRoute() {
  const { session, profile, loading, isConfigured, signOut } = useAuth();
  const toast = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 1. Check if Supabase keys are configured in local environment
  if (!isConfigured) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-card--narrow">
          <h1>Admin unavailable</h1>
          <p className="admin-muted">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a{' '}
            <code>.env</code> file, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  // 2. Display premium loading state while verifying auth session and role
  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="admin-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="2.5" className="spinner" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                <stop stopColor="currentColor" stopOpacity="0" offset="0%"/>
                <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%"/>
                <stop stopColor="currentColor" offset="100%"/>
              </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
              <g transform="translate(1 1)">
                <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)"/>
                <circle cx="36" cy="18" r="1"/>
              </g>
            </g>
          </svg>
          Checking authorizations…
        </p>
      </div>
    );
  }

  // 3. Reject unauthenticated requests and redirect to Login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // 4. Enforce RBAC validation: Ensure profile is active and holds a valid role
  const authorizedRoles = ['super_admin', 'admin', 'editor', 'viewer'];
  const hasAccess = profile && authorizedRoles.includes(profile.role) && profile.is_active;

  if (!hasAccess) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-card admin-card--narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Forbidden</h2>
          <p className="admin-muted" style={{ marginBottom: '1rem' }}>
            This account is registered but does not have active administrative clearances. 
            If you believe this is an error, contact the system administrator.
          </p>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all' }}>
            <strong>Debug Info:</strong><br/>
            Email: {session?.user?.email}<br/>
            User ID: {session?.user?.id}<br/>
            Profile Found: {profile ? 'Yes' : 'No'}<br/>
            {profile && <>
              Role: {profile.role}<br/>
              Active: {profile.is_active ? 'Yes' : 'No'}
            </>}
          </div>
          <button 
            type="button" 
            className="btn btn--danger" 
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              try {
                await signOut();
                toast.success('Successfully signed out.');
              } catch (err) {
                toast.error(err.message || 'Failed to sign out.');
                setIsSigningOut(false);
              }
            }}
            style={{ width: '100%' }}
          >
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    );
  }

  // 5. Allow entry
  return <Outlet />;
}
