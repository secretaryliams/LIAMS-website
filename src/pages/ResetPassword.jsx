import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ADMIN_LOGIN_PATH,
  AUTH_MESSAGES,
  validateNewPassword,
} from '../lib/authValidation';
import { getRecoveryLinkError } from '../lib/passwordReset';
import './admin/Admin.css';

const RECOVERY_WAIT_MS = 2000;
const initialLinkError = getRecoveryLinkError();

export default function ResetPassword() {
  const navigate = useNavigate();
  const recoveryConfirmed = useRef(Boolean(initialLinkError));

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(initialLinkError || '');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pageReady, setPageReady] = useState(Boolean(initialLinkError));
  const [linkExpired, setLinkExpired] = useState(Boolean(initialLinkError));

  useEffect(() => {
    if (!supabase || initialLinkError) {
      return undefined;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryConfirmed.current = true;
        setPageReady(true);
        setLinkExpired(false);
        setError('');
      }
    });

    const verifyRecoveryAccess = async () => {
      const search = new URLSearchParams(window.location.search);
      const code = search.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setLinkExpired(true);
          setError(AUTH_MESSAGES.linkExpired);
          setPageReady(true);
          return;
        }
        recoveryConfirmed.current = true;
        window.history.replaceState(null, '', '/reset-password');
        setPageReady(true);
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (hash.get('type') === 'recovery') {
        await new Promise((resolve) => {
          setTimeout(resolve, 400);
        });
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          recoveryConfirmed.current = true;
          setPageReady(true);
          return;
        }
      }

      await new Promise((resolve) => {
        setTimeout(resolve, RECOVERY_WAIT_MS);
      });

      if (!recoveryConfirmed.current) {
        navigate(ADMIN_LOGIN_PATH, { replace: true });
      }
    };

    verifyRecoveryAccess();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validation = validateNewPassword(password, confirmPassword);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    if (!supabase) {
      setError(AUTH_MESSAGES.supabaseNotConfigured);
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        if (/expired|invalid|session/i.test(updateError.message)) {
          setLinkExpired(true);
          setError(AUTH_MESSAGES.linkExpired);
        } else {
          setError(updateError.message);
        }
        return;
      }

      await supabase.auth.signOut({ scope: 'global' });

      setSuccess(AUTH_MESSAGES.resetSuccess);
      setTimeout(() => {
        navigate(ADMIN_LOGIN_PATH, { replace: true, state: { resetSuccess: true } });
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  if (!supabase) {
    return (
      <div className="reset-password-page admin-page">
        <div className="admin-card admin-card--narrow reset-password-card">
          <h2>Reset Password</h2>
          <p className="admin-error">{AUTH_MESSAGES.supabaseNotConfigured}</p>
          <p className="admin-muted">
            <Link to={ADMIN_LOGIN_PATH}>← Back to admin login</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!pageReady && !linkExpired) {
    return (
      <div className="reset-password-page admin-page">
        <div className="admin-card admin-card--narrow">
          <p className="admin-muted">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  if (linkExpired) {
    return (
      <div className="reset-password-page admin-page">
        <div className="admin-card admin-card--narrow reset-password-card">
          <h2>Reset Password</h2>
          <p className="admin-error">{error || AUTH_MESSAGES.linkExpired}</p>
          <p className="admin-muted">
            <Link to={ADMIN_LOGIN_PATH}>← Back to admin login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page admin-page">
      <form
        className="admin-card admin-card--narrow admin-form reset-password-card"
        onSubmit={handleUpdatePassword}
      >
        <h2>Reset Password</h2>
        <p className="admin-muted reset-password-card__hint">
          Enter a new password for your admin account.
        </p>

        <label>
          New password
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p className="admin-error" role="alert">{error}</p>}
        {success && <p className="admin-success" role="status">{success}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting || Boolean(success)}>
          {submitting ? 'Updating…' : 'Update Password'}
        </button>

        <p className="admin-muted">
          <Link to={ADMIN_LOGIN_PATH}>← Back to admin login</Link>
        </p>
      </form>
    </div>
  );
}
