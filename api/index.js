// LIAMS Security Helper Backend
// Path: server/server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// 1. Environment Configurations
// Try loading dotenv from root directory, fallback to local directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Verify Supabase keys
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

if (!supabaseUrl) {
  console.error('CRITICAL: VITE_SUPABASE_URL / SUPABASE_URL is missing in environment variables.');
  process.exit(1);
}

if (!supabaseServiceRole) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing on the server. Bypassing admin functions or using restricted keys.');
}

// Initialize Supabase Client with Service Role Key for secure admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRole || process.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// 2. Global Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", supabaseUrl],
      imgSrc: ["'self'", "data:", supabaseUrl],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' }
}));

app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

// 3. Route Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 forgot password requests per 15 minutes
  message: { error: 'Too many recovery attempts. Please wait 15 minutes.' }
});

const lockoutCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many verification attempts. Please try again later.' }
});

const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many invitations sent. Please wait 15 minutes.' }
});

app.use('/api/', generalLimiter);

// 4. Secure Endpoints

// Helper: Log audit events to Supabase
async function logAuditEvent(userId, action, req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        action,
        ip_address: ip,
        user_agent: userAgent
      });
    if (error) throw error;
  } catch (err) {
    console.error('Failed to write to audit_logs:', err.message);
  }
}

// Endpoint: Invite Admin (Super Admin Only RBAC)
app.post('/api/auth/invite', inviteLimiter, async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Session token required' });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Session is invalid or has expired' });
  }

  // Verify caller's role in DB
  const { data: caller, error: dbError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (dbError || !caller) {
    return res.status(403).json({ error: 'Forbidden: Admin profile not found' });
  }

  if (!caller.is_active || caller.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Only active super_admins can invite users' });
  }

  const schema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required')
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, name } = parsed.data;

  try {
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name,
        is_admin: 'true'
      },
      redirectTo: `${clientUrl}/admin/reset-password`
    });

    if (inviteError) {
      console.error('Supabase admin invitation API failed:', inviteError.message);
      return res.status(400).json({ error: inviteError.message });
    }

    await logAuditEvent(user.id, `invited_new_admin: ${email} (${name})`, req);
    return res.status(200).json({ success: true, message: 'User invited successfully.' });
  } catch (err) {
    console.error('System error in invite handler:', err);
    return res.status(500).json({ error: 'Failed to complete invite' });
  }
});

// Endpoint A: Forgot Password Handler (Enumeration Proof)
app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const schema = z.object({
    email: z.string().email('Invalid email address')
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email } = parsed.data;
  const genericResponse = {
    success: true,
    message: 'If your email is registered in our admin database, you will receive a password reset link shortly.'
  };

  try {
    // 1. Query public.admin_users to check admin existence and role
    const { data: admin, error: dbError } = await supabase
      .from('admin_users')
      .select('id, role, is_active')
      .eq('email', email)
      .maybeSingle();

    if (dbError) {
      console.error('Database query failed for forgot-password check:', dbError);
      return res.status(200).json(genericResponse); // Safe fallback
    }

    // 2. If user exists and is active admin
    if (admin && admin.is_active) {
      const redirectUrl = `${clientUrl}/admin/reset-password`;
      
      // Trigger Supabase Auth Reset Link
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (resetError) {
        console.error('Supabase reset password request failed:', resetError);
        return res.status(200).json(genericResponse);
      }

      // Write to audit log
      await logAuditEvent(admin.id, `password_reset_requested_email: ${email}`, req);
      console.log(`Success: Forgot Password email triggered for active admin: ${email}`);
    } else {
      // Prevent user enumeration: log skipped email
      await logAuditEvent(null, `unregistered_or_inactive_forgot_password_attempt: ${email}`, req);
      console.log(`Enumeration Shield: Skipping forgot password trigger for non-admin email: ${email}`);
    }

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error('System error in forgot-password handler:', err);
    return res.status(200).json(genericResponse);
  }
});

// Endpoint B: Lockout Check (Pre-Auth Hook)
app.post('/api/auth/check-lockout', lockoutCheckLimiter, async (req, res) => {
  const schema = z.object({
    email: z.string().email('Invalid email address')
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email } = parsed.data;

  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('failed_login_attempts, lock_until')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (admin && admin.lock_until) {
      const lockTime = new Date(admin.lock_until);
      const now = new Date();
      if (lockTime > now) {
        const remainingMinutes = Math.ceil((lockTime.getTime() - now.getTime()) / (60 * 1000));
        return res.status(200).json({
          locked: true,
          lock_until: admin.lock_until,
          message: `This account is temporarily locked due to excessive failed attempts. Please retry in ${remainingMinutes} minutes.`
        });
      }
    }

    return res.status(200).json({ locked: false });
  } catch (err) {
    console.error('Lockout check failed:', err.message);
    return res.status(200).json({ locked: false }); // Safe fallback
  }
});

// Endpoint C: Audit Logs Tracker (Track auth successes / failures from client)
app.post('/api/auth/audit', async (req, res) => {
  const schema = z.object({
    email: z.string().email().optional(),
    status: z.enum(['success', 'failure']),
    action: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, status, action } = parsed.data;
  const authHeader = req.headers['authorization'];

  try {
    let userId = null;

    // If client provides Authorization JWT, verify it and extract user
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (!userError && user) {
        userId = user.id;
      }
    }

    // A. Handle success login tracking
    if (status === 'success' && userId) {
      // Reset failed logins counter and update last_login
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          failed_login_attempts: 0,
          lock_until: null,
          last_login: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) console.error('Failed to update admin profile on login success:', updateError.message);
      
      await logAuditEvent(userId, 'login_success', req);
      return res.status(200).json({ success: true });
    }

    // B. Handle failed login tracking
    if (status === 'failure' && email) {
      // Lookup if email exists in admin_users
      const { data: admin, error: adminErr } = await supabase
        .from('admin_users')
        .select('id, failed_login_attempts')
        .eq('email', email)
        .maybeSingle();

      if (!adminErr && admin) {
        const attempts = (admin.failed_login_attempts || 0) + 1;
        const updatePayload = { failed_login_attempts: attempts };
        
        // If attempts reach 5, trigger lock
        if (attempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 15); // Lock for 15 mins
          updatePayload.lock_until = lockUntil.toISOString();
        }

        const { error: updateError } = await supabase
          .from('admin_users')
          .update(updatePayload)
          .eq('id', admin.id);

        if (updateError) console.error('Failed to increment failed login attempts:', updateError.message);
        
        await logAuditEvent(admin.id, attempts >= 5 ? 'account_temporary_lockout' : `login_failed_attempt_${attempts}`, req);
      } else {
        await logAuditEvent(null, `login_failed_unregistered_email: ${email}`, req);
      }

      return res.status(200).json({ success: true });
    }

    // C. General admin auditing (logouts, password resets, edits)
    await logAuditEvent(userId, action, req);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Audit logging handler failed:', err);
    return res.status(500).json({ error: 'Failed to record audit event' });
  }
});

// Start Express Listener (For local dev)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`LIAMS Security Helper running on port ${PORT}`);
    console.log(`CORS Whitelisted Origin: ${clientUrl}`);
    console.log(`Supabase Project Target: ${supabaseUrl}`);
    console.log(`===================================================`);
  });
}

// Export for Vercel Serverless Functions
export default app;
