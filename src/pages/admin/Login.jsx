// LIAMS Premium Admin Login Page
// Path: src/pages/admin/Login.jsx

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

// Form Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(true),
});

export default function Login() {
  const { session, loading, isConfigured } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  // Redirect if session already exists
  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      // Connect to centralized Auth Service
      await authService.signIn(data.email, data.password, data.rememberMe);
      toast.success('Successfully authenticated.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      {/* Decorative Premium Mesh Gradient Background */}
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
        {/* Brand Logo & Header */}
        <header className="login-card__header">
          <img src="/logos/liams-logo-symbol.png" alt="LIAMS Crest" className="login-card__logo" />
          <span className="login-card__brand">
            <strong>LIAMS</strong>
            <small>Loyola Institute of Advanced Multidisciplinary Studies</small>
          </span>
          <h2>Admin Portal</h2>
          <p className="login-card__subtitle">Sign in to manage institute operations</p>
        </header>

        {!isConfigured ? (
          <div className="login-unconfigured">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>
              Supabase configurations are missing. Please define environment variables in your <code>.env</code> file.
            </p>
          </div>
        ) : (
          <form className="login-form-element" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div className="login-form__group">
              <label htmlFor="email">Email Address</label>
              <div className="login-input-container">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@liams.in"
                  className={errors.email ? 'input--invalid' : ''}
                  disabled={submitting}
                  autoComplete="username"
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

            {/* Password Field */}
            <div className="login-form__group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                <Link to="/admin/forgot-password" className="login-link-forgot">
                  Forgot Password?
                </Link>
              </div>
              <div className="login-input-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={errors.password ? 'input--invalid' : ''}
                  disabled={submitting}
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="login-validation-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="login-checkbox-group">
              <label className="login-checkbox-label">
                <input type="checkbox" {...register('rememberMe')} />
                <span className="custom-checkbox"></span>
                Remember this session
              </label>
            </div>

            {/* Submit Button */}
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
                  Verifying…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        <footer className="login-card__footer">
          <Link to="/">← Back to public website</Link>
        </footer>
      </motion.div>
    </div>
  );
}
