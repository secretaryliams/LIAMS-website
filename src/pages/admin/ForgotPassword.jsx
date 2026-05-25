import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import "./Admin.css";

export default function ForgotPassword() {
  const { isConfigured, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    console.log("[ForgotPassword] Submitting reset request for email:", email);
    try {
      const response = await resetPassword(email);
      console.log("[ForgotPassword] Supabase password reset request successfully processed:", response);
      setSuccess(true);
    } catch (err) {
      console.error("[ForgotPassword] Reset submission failed:", err);
      setError(err.message || "Failed to submit recovery request");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-card--narrow">
          <h2>Check your email</h2>
          <p className="admin-muted" style={{ marginBottom: "1rem" }}>
            If the email address <strong>{email}</strong> is registered in your Supabase Auth dashboard, a recovery link has been dispatched.
          </p>
          <div className="admin-muted" style={{ fontSize: "0.85rem", background: "rgba(197, 160, 89, 0.08)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(197, 160, 89, 0.18)", marginBottom: "1.5rem", textAlign: "left", lineHeight: "1.5" }}>
            <strong>💡 Production Checklist:</strong>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px" }}>
              <li style={{ marginBottom: "4px" }}>Supabase free tiers limit emails to <strong>3 requests per hour</strong>. If exceeded, trigger attempts are silently blocked.</li>
              <li style={{ marginBottom: "4px" }}>Check your <strong>Spam or Promotions</strong> inbox tabs if the message does not arrive within 2 minutes.</li>
              <li>Attacking/unregistered emails are ignored silently by Supabase for user enumeration safety.</li>
            </ul>
          </div>
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
