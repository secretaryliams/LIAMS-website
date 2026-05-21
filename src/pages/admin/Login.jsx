import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function Login() {
  const { signIn, session, isConfigured, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-card admin-card--narrow">
        <h2>Admin sign in</h2>
        {!isConfigured ? (
          <p className="admin-muted">
            Configure Supabase in <code>.env</code> (see <code>.env.example</code>).
          </p>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
        <p className="admin-muted" style={{ marginTop: '1rem' }}>
          <Link to="/">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
