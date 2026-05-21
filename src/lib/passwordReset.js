import { supabase } from './supabase';
import {
  AUTH_MESSAGES,
  RESET_PASSWORD_REDIRECT,
  normalizeEmail,
  validateAdminEmail,
} from './authValidation';

const RATE_LIMIT_KEY = 'liams_password_reset_last_request';
const RATE_LIMIT_MS = 60 * 1000;

export function getResetRateLimitRemainingMs() {
  const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
  const elapsed = Date.now() - last;
  return Math.max(0, RATE_LIMIT_MS - elapsed);
}

export function markResetRequestSent() {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
}

export async function isRegisteredAdminEmail(email) {
  if (!supabase) throw new Error(AUTH_MESSAGES.supabaseNotConfigured);

  const { data, error } = await supabase.rpc('is_registered_admin_email', {
    check_email: normalizeEmail(email),
  });

  if (error) {
    if (error.code === 'PGRST202' || error.message?.includes('is_registered_admin_email')) {
      throw new Error(
        'Admin email verification is not set up. Run supabase/migrations/add_admin_email_check.sql in Supabase SQL Editor.',
      );
    }
    throw error;
  }

  return Boolean(data);
}

export async function requestPasswordReset(email) {
  const validation = validateAdminEmail(email);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const waitMs = getResetRateLimitRemainingMs();
  if (waitMs > 0) {
    return { ok: false, message: AUTH_MESSAGES.rateLimited };
  }

  if (!supabase) {
    return { ok: false, message: AUTH_MESSAGES.supabaseNotConfigured };
  }

  const registered = await isRegisteredAdminEmail(validation.email);
  if (!registered) {
    return { ok: false, message: AUTH_MESSAGES.emailUnregistered };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(validation.email, {
    redirectTo: RESET_PASSWORD_REDIRECT,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  markResetRequestSent();
  return { ok: true, message: AUTH_MESSAGES.resetEmailSent };
}

export function getRecoveryLinkError() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const search = new URLSearchParams(window.location.search);

  const errorCode = hash.get('error_code') || search.get('error_code');
  const errorDescription = hash.get('error_description') || search.get('error_description') || '';
  const hasError = hash.get('error') || search.get('error');

  if (
    errorCode === 'otp_expired'
    || errorCode === 'expired_token'
    || hasError
    || /expired|invalid/i.test(errorDescription)
  ) {
    return AUTH_MESSAGES.linkExpired;
  }

  return null;
}
