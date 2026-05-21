import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AUTH_MESSAGES } from '../../lib/authValidation';
import { requestPasswordReset } from '../../lib/passwordReset';
import './Admin.css';

export default function Login() {
  const { signIn, session, isConfigured, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const resetSuccessFromNav = location.state?.resetSuccess;

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

  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    setForgotSubmitting(true);
    try {
      const result = await requestPasswordReset(forgotEmail);
      if (!result.ok) {
        setForgotError(result.message);
        return;
      }
      setForgotSuccess(result.message);
    } catch (err) {
      setForgotError(err.message || 'Could not send reset email');
    } finally {
      setForgotSubmitting(false);
    }
  }

  function openForgotPassword() {
    setShowForgotPassword(true);
    setForgotEmail(email);
    setForgotError('');
    setForgotSuccess('');
  }

  function closeForgotPassword() {
    setShowForgotPassword(false);
    setForgotError('');
    setForgotSuccess('');
  }

  return (
    <div className="admin-page">
      <div className="admin-card admin-card--narrow">
        <h2>Admin sign in</h2>

        {resetSuccessFromNav && (
          <p className="admin-success" role="status">
            {AUTH_MESSAGES.resetSuccess}
          </p>
        )}

        {!isConfigured ? (
          <p className="admin-muted">
            Configure Supabase in <code>.env</code> (see <code>.env.example</code>).
          </p>
        ) : showForgotPassword ? (
          <form className="admin-form forgot-password-form" onSubmit={handleForgotPasswordSubmit}>
            <p className="admin-muted">
              Enter your registered admin email. A secure reset link will be sent to your inbox.
            </p>
            <label>
              Admin email
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </label>
            {forgotError && <p className="admin-error" role="alert">{forgotError}</p>}
            {forgotSuccess && <p className="admin-success" role="status">{forgotSuccess}</p>}
            <div className="forgot-password-form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={forgotSubmitting}
              >
                {forgotSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
              <button
                type="button"
                className="forgot-password-btn"
                onClick={closeForgotPassword}
              >
                ← Back to sign in
              </button>
            </div>
          </form>
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
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button
              type="button"
              onClick={openForgotPassword}
              className="forgot-password-btn"
            >
              Forgot Password?
            </button>
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
