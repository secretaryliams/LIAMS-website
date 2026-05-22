// LIAMS Centralized Auth API Service
// Path: src/services/authService.js

import { supabase } from '../lib/supabase';

const API_BASE = '/api/auth';

export const authService = {
  /**
   * Check if an admin account is currently locked out before triggering auth
   * @param {string} email 
   * @returns {Promise<{ locked: boolean, message?: string }>}
   */
  async checkLockout(email) {
    try {
      const response = await fetch(`${API_BASE}/check-lockout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify account status');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Audit Pre-Check failed, proceeding normally:', err.message);
      return { locked: false };
    }
  },

  /**
   * Signs in user directly with Supabase, then dispatches audit log to Express
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} rememberMe 
   */
  async signIn(email, password, rememberMe = true) {
    if (!supabase) throw new Error('Supabase is not configured');

    // 1. Lockout check prior to auth
    const status = await this.checkLockout(email);
    if (status.locked) {
      throw new Error(status.message);
    }

    // 2. Perform direct sign in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Dispatch audit log of failed login to server
      await this.logAuthEvent(email, 'failure', `failed_login_attempt: ${error.message}`);
      throw error;
    }

    // 3. Handle rememberMe option persistence
    if (!rememberMe) {
      // If "Remember Me" is unchecked, register a listener to clear the session when the tab/window is closed
      window.addEventListener('beforeunload', () => {
        const keys = Object.keys(localStorage);
        const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        if (sbKey) localStorage.removeItem(sbKey);
      });
    }

    // 4. Log successful login to backend Express serverless layer
    if (data.session) {
      await this.logAuthEvent(email, 'success', 'login_success', data.session.access_token);
    }

    return data;
  },

  /**
   * Logs out user from Supabase and audits the exit event
   */
  async signOut() {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const email = session?.user?.email;

      await supabase.auth.signOut();

      if (email && token) {
        await this.logAuthEvent(email, 'success', 'logout_success', token);
      }
    } catch (err) {
      console.error('Failed to audit logout event:', err.message);
    }
  },

  /**
   * Dispatches forgot password request to the secure Express helper endpoint (User Enumeration Safe)
   * @param {string} email 
   */
  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit recovery request');
    }

    return await response.json();
  },

  /**
   * Updates password directly with Supabase, then triggers success audit log
   * @param {string} newPassword 
   */
  async resetPassword(newPassword) {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    try {
      const token = data?.session?.access_token;
      const email = data?.user?.email;
      if (email && token) {
        await this.logAuthEvent(email, 'success', 'password_update_success', token);
      }
    } catch (err) {
      console.error('Failed to log password reset event:', err.message);
    }

    return data;
  },

  /**
   * Triggers audit log logging inside the Express security helper
   * @param {string} email 
   * @param {'success'|'failure'} status 
   * @param {string} action 
   * @param {string} [token] 
   */
  async logAuthEvent(email, status, action, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, status, action })
      });
    } catch (err) {
      console.error('Failed to send audit log event:', err.message);
    }
  }
};
