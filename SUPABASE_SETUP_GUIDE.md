# Supabase Admin & Security Setup Guide

This guide details the exact steps required to configure your Supabase project for the newly built Enterprise Admin Authentication system. You do not need to create tables manually via the Supabase Table Editor UI.

## Step 1: Run the Database Setup Script

We have prepared a complete SQL script that will automatically create the tables, configure Row Level Security (RLS) rules, and set up the necessary database triggers.

1. Open your Supabase Dashboard.
2. Navigate to the **SQL Editor** from the left sidebar (the icon looks like a terminal window `>_`).
3. Click the **"+ New query"** button.
4. Open the file `supabase/migrations/20260522_create_admin_and_audit.sql` from your local codebase and copy all of its contents.
5. Paste the entire SQL script into the Supabase SQL Editor.
6. Click the green **Run** button at the bottom right.

**What this script does:**
- Creates the `admin_users` table to track your administrators and their roles (`super_admin`, `admin`, etc.).
- Creates the `audit_logs` table for security monitoring.
- Sets up Row Level Security (RLS) so users can only access what they are permitted to.
- Creates a special "Trigger" that automatically adds the very first user you create as a `super_admin`.

---

## Step 2: Configure Redirect URLs for Forgot Password

For the forgot password flow to work, Supabase needs explicit permission to redirect users back to your local application after they click the secure link in their email.

1. Go to **Authentication** in the left sidebar of Supabase.
2. Click on **URL Configuration** (under the Configuration section).
3. Look for **Site URL** and ensure it is set to your frontend's address:
   `http://localhost:5173`
4. Under **Redirect URLs**, click **Add URL** and add the exact path to your reset password page:
   `http://localhost:5173/admin/reset-password`
   *(You can also add `http://localhost:5173/*` to allow all local paths during development)*
5. Click **Save**.

---

## Step 3: Create Your First Admin Account

Because of the security trigger we set up in Step 1, the system is designed to "bootstrap" itself securely.

1. The very first user account created in Supabase Authentication will automatically be synced into the `admin_users` table and granted the highest `super_admin` role.
2. You can create this first user directly from the Supabase UI by going to **Authentication -> Users** and clicking **Add User -> Create new user**, or by signing up through your application (if you have a public signup page temporarily enabled).

---

## How the Secure Forgot Password Flow Works

We built a highly secure setup to prevent hackers from guessing or enumerating email addresses:

1. When an email is entered on the Forgot Password screen, React sends it to your local Express backend server (`server/server.js`).
2. The Express server bypasses RLS using its secure service role key and checks the `admin_users` table.
3. If the email exists and belongs to an active admin, the Express server secretly tells Supabase to send the recovery email.
4. Whether the email actually exists or not, the server sends back the exact same generic "Request Processed" message to the frontend. This prevents "user enumeration" attacks.
5. When the user clicks the link in the email, Supabase securely redirects them to `http://localhost:5173/admin/reset-password` where they can establish their new secure password.
