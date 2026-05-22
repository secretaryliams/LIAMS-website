// LIAMS Premium Admin Forgot Password Page
// Path: src/pages/admin/ForgotPassword.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

// Validation Schema
const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export default function ForgotPassword() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Dynamic SEO Block: Exclude from search crawler indexing
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      // Direct request to Express security endpoint
      const result = await authService.forgotPassword(data.email);
      if (result.success) {
        setCompleted(true);
        toast.success('Recovery instruction dispatched.');
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to submit recovery request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      {/* Mesh Orb Gradient Styling */}
      <div className="login-mesh">
        <div className="login-mesh__orb orb-1"></div>
        <div className="login-mesh__orb orb-2"></div>
      </div>

      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <header className="login-card__header">
                <img src="/logos/liams-logo-symbol.png" alt="LIAMS Crest" className="login-card__logo" />
                <h2>Recover Password</h2>
                <p className="login-card__subtitle" style={{ maxWidth: '300px', marginInline: 'auto' }}>
                  Enter your registered administrator email to receive a password reset link
                </p>
              </header>

              <form className="login-form-element" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email Field */}
                <div className="login-form__group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="email">Administrator Email</label>
                  <div className="login-input-container">
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@liams.in"
                      className={errors.email ? 'input--invalid' : ''}
                      disabled={submitting}
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <span className="login-validation-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Submit Action Button */}
                <button type="submit" className="btn btn--primary login-submit-button" disabled={submitting}>
                  {submitting ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3" className="spinner">
                        <defs>
                          <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                            <stop stopColor="currentColor" stopOpacity="0" offset="0%"/>
                            <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%"/>
                            <stop stopColor="currentColor" offset="100%"/>
                          </linearGradient>
                        </defs>
                        <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <footer className="login-card__footer" style={{ marginTop: '1.5rem' }}>
                <Link to="/admin/login">Back to Sign In</Link>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '1.5rem 0' }}
            >
              {/* Success Visual Overlay */}
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Request Processed</h2>
              <p className="admin-muted" style={{ fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '320px', marginInline: 'auto' }}>
                If that email exists in our records, a secure password recovery message has been dispatched. Please review your inbox (and spam/promotional folders).
              </p>
              
              <Link to="/admin/login" className="btn btn--secondary" style={{ display: 'inline-flex', width: '100%', textDecoration: 'none' }}>
                Return to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
