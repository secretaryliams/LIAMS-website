import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import "./Admin.css";

export default function ForgotPassword() {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-card--narrow">
          <h2>Check your email</h2>
          <p className="admin-muted">
            If account exists, reset link sent.
          </p>
          <p className="admin-muted">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <p className="admin-muted" style={{ marginTop: "1rem" }}>
            <Link to="/admin/login">← Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-card admin-card--narrow">
        <h2>Reset password</h2>
        {!isConfigured ? (
          <p className="admin-muted">
            Configure Supabase in <code>.env</code> (see{" "}
            <code>.env.example</code>).
          </p>
        ) : (
          <>
            <p className="admin-muted">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="admin@example.com"
                />
              </label>
              {error && <p className="admin-error">{error}</p>}
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <p className="admin-muted" style={{ marginTop: "1rem" }}>
          <Link to="/admin/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
