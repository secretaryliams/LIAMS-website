export const RESET_PASSWORD_REDIRECT = 'https://liams.in/reset-password';
export const ADMIN_LOGIN_PATH = '/admin/login';

/** Basic email format check (abc@gmail.com) */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_MESSAGES = {
  emailRequired: 'Please enter your email',
  emailInvalid: 'Enter a valid email address',
  emailUnregistered: 'Invalid or unregistered email',
  rateLimited: 'Please wait before requesting another reset email',
  resetEmailSent: 'Password reset email sent successfully. Check your inbox.',
  passwordEmpty: 'Password cannot be empty',
  passwordMinLength: 'Password must be at least 6 characters',
  passwordsMismatch: 'Passwords do not match',
  passwordSameAsOld: 'New password cannot be same as old password',
  resetSuccess: 'Password updated successfully',
  linkExpired: 'Reset link expired. Please request again.',
  supabaseNotConfigured: 'Supabase is not configured',
};

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validateAdminEmail(value) {
  const email = normalizeEmail(value);
  if (!email) return { ok: false, message: AUTH_MESSAGES.emailRequired };
  if (!EMAIL_REGEX.test(email)) return { ok: false, message: AUTH_MESSAGES.emailInvalid };
  return { ok: true, email };
}

export function validateNewPassword(password, confirmPassword) {
  if (!password) return { ok: false, message: AUTH_MESSAGES.passwordEmpty };
  if (!confirmPassword) return { ok: false, message: AUTH_MESSAGES.passwordEmpty };
  if (password.length < 6) return { ok: false, message: AUTH_MESSAGES.passwordMinLength };
  if (password !== confirmPassword) return { ok: false, message: AUTH_MESSAGES.passwordsMismatch };
  return { ok: true };
}
