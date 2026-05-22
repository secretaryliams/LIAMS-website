import { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./Admin.css";

export default function UpdatePassword() {
  const auth = useAuth();

  const {
    updatePassword,
    session,
    isConfigured = true,
    loading = false,
  } = auth || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Safe reset token check
  const hasResetToken =
    searchParams.get("token") ||
    (typeof window !== "undefined" &&
      window.location.hash.includes("access_token"));

  useEffect(() => {
    async function handlePasswordRecovery() {
      try {
        if (
          typeof window !== "undefined" &&
          window.location.hash.includes("access_token") &&
          supabase
        ) {
          // Supabase automatically reads the hash and creates session
          await supabase.auth.getSession();
        }
      } catch (err) {
        console.error("Recovery session error:", err);
      } finally {
        if (!loading) {
          setSessionChecked(true);
        }
      }
    }

    handlePasswordRecovery();
  }, [loading]);

  // Redirect only after checking session
  if (sessionChecked && !loading && !session && !hasResetToken) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-card--narrow">
          <h2>Password updated</h2>

          <p className="admin-muted">
            Your password has been successfully updated.
          </p>

          <p
            className="admin-muted"
            style={{ marginTop: "1rem" }}
          >
            <Link to="/admin">
              ← Go to dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-card admin-card--narrow">
        <h2>Set new password</h2>

        {!isConfigured ? (
          <p className="admin-muted">
            Configure Supabase in <code>.env</code>
            {" "} (see <code>.env.example</code>).
          </p>
        ) : (
          <form
            className="admin-form"
            onSubmit={handleSubmit}
          >
            <label>
              New password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Enter new password"
              />
            </label>

            <label>
              Confirm password

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
            </label>

            {error && (
              <p className="admin-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting
                ? "Updating..."
                : "Update password"}
            </button>
          </form>
        )}

        <p
          className="admin-muted"
          style={{ marginTop: "1rem" }}
        >
          <Link to="/admin">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}