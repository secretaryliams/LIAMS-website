// LIAMS Premium Admin Reset Password Page
// Path: src/pages/admin/ResetPassword.jsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

// Enterprise Password Strength Validation Schema
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(30, 'Password must not exceed 30 characters')
    .refine((val) => /[A-Z]/.test(val), { message: 'Must contain at least 1 uppercase letter' })
    .refine((val) => /[a-z]/.test(val), { message: 'Must contain at least 1 lowercase letter' })
    .refine((val) => /[0-9]/.test(val), { message: 'Must contain at least 1 numerical digit' })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Must contain at least 1 special character' }),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, loading, signOut } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(4);

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
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const watchedPassword = watch('password', '');

  // Calculate Password Strength Meter
  const calculateStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score += 20;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[a-z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 20;
    if (/[^A-Za-z0-9]/.test(val)) score += 20;
    return score;
  };

  const strength = calculateStrength(watchedPassword);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    if (!completed) return;
    if (countdown === 0) {
      // Force logout to clear temporary recovery session, requiring fresh login
      signOut().then(() => {
        navigate('/admin/login');
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [completed, countdown, navigate, signOut]);

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      // Direct update through Auth Service
      await authService.resetPassword(data.password);
      toast.success('Password successfully modernized.');
      setCompleted(true);
    } catch (err) {
      toast.error(err.message || 'Failed to update password. Recovery token may be expired.');
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Loading Session
  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="admin-muted">Validating authorization session…</p>
      </div>
    );
  }

  // Enforce session presence (Supabase sets session from recovery link automatically)
  const isAuthorized = Boolean(session);

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
              <header className="login-card__header">
                <img src="/logos/liams-logo-symbol.png" alt="LIAMS Crest" className="login-card__logo" />
                <h2>Update Password</h2>
                <p className="login-card__subtitle">Establish new administrator credentials</p>
              </header>

              {!isAuthorized ? (
                <div className="login-unconfigured" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ color: '#ef4444' }}>
                    Recovery session is invalid or has expired. Please submit a new forgot password request.
                  </p>
                  <Link to="/admin/forgot-password" className="btn btn--secondary" style={{ marginTop: '1rem', width: '100%', textDecoration: 'none' }}>
                    Request New Link
                  </Link>
                </div>
              ) : (
                <form className="login-form-element" onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* New Password */}
                  <div className="login-form__group">
                    <label htmlFor="password">New Password</label>
                    <div className="login-input-container">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        className={errors.password ? 'input--invalid' : ''}
                        disabled={submitting}
                        autoComplete="new-password"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ height: '4px', width: '100%', background: 'rgba(15, 23, 42, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${strength}%`,
                              background: strength <= 40 ? '#ef4444' : strength <= 80 ? '#f59e0b' : '#10b981',
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: strength <= 40 ? '#ef4444' : strength <= 80 ? '#f59e0b' : '#10b981', marginTop: '0.25rem', display: 'inline-block', fontWeight: 600 }}>
                          {strength <= 40 ? 'Weak' : strength <= 80 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}

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

                  {/* Confirm Password */}
                  <div className="login-form__group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="login-input-container">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        className={errors.confirmPassword ? 'input--invalid' : ''}
                        disabled={submitting}
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="login-validation-error">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {errors.confirmPassword.message}
                      </span>
                    )}
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
                        Modernizing…
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '1.5rem 0' }}
            >
              {/* Success Visual Confirmation */}
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Password Modernized</h2>
              <p className="admin-muted" style={{ fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '320px', marginInline: 'auto' }}>
                Your administrative password was updated successfully. You will be redirected to the secure login gateway shortly.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--blue)', fontWeight: 600, fontSize: '0.95rem' }}>
                <svg width="18" height="18" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3.5" className="spinner">
                  <defs>
                    <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                      <stop stopColor="currentColor" stopOpacity="0" offset="0%"/>
                      <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%"/>
                      <stop stopColor="currentColor" offset="100%"/>
                    </linearGradient>
                  </defs>
                  <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)"/>
                </svg>
                Redirecting in {countdown}s…
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
