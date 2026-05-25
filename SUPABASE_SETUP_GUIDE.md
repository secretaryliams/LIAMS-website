# Final Supabase Production & Security Setup Guide

This guide describes the configuration required to secure and deploy the **LIAMS** database on Supabase in coordination with your **Vercel** production hosting and **Hostinger (`liams.in`)** SMTP service.

---

## 🔒 Enterprise-Grade Security Principles
1. **No "Add Admin" or "Invite Admin" UI**: To protect the institute from unauthorized access, we have **completely removed all dynamic admin creation and invitation routes** from the application. 
2. **Hardened SQL Provisioning**: Admin accounts can only be provisioned directly inside your Supabase dashboard. This eliminates any possibility of external attacker injections.
3. **Audit Logged Events**: Every administrative login success, failure, lockout, or content modification is permanently recorded in the `audit_logs` table for tracking.

---

## Step 1: Run the Database Setup Schema

1. Log into your [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor** on the left sidebar (the terminal `>_` icon).
3. Click **"+ New query"** and name it `LIAMS Database Setup`.
4. Open the file `supabase/schema.sql` from your local codebase, copy its entire contents, paste it into the editor, and click **Run**.
5. Create another new query named `Admin Schema & Policies`.
6. Open the file `supabase/migrations/20260522_create_admin_and_audit.sql` from your codebase, copy its entire contents, paste it into the SQL Editor, and click **Run**.

---

## Step 2: Manually Provision Your Administrative Account

To authorize your primary administrator, create their login credentials directly in Supabase:

1. In the Supabase Dashboard, go to **Authentication** -> **Users** from the left navigation bar.
2. Click the **Add User** dropdown at the top right and select **Create User**.
3. Set the email to your primary email address:
   `secretary.liams@gmail.com`
4. Assign a secure password and click **Create User**.
5. *Note: The database trigger we established in Step 1 will automatically sync this email into the `admin_users` table, setting their status to active and assigning them the role of `super_admin`.*

---

## Step 3: Configure URL Redirection for Live Domain

To ensure that the forgot password reset link works correctly when clicked from an email in production:

1. Navigate to **Authentication** -> **URL Configuration** in the left sidebar of the Supabase dashboard.
2. Under **Site URL**, change the value to your live production domain:
   `https://liams.in`
3. Under **Redirect URLs**, click **Add URL** and add the following two paths:
   - `https://liams.in/admin/reset-password` *(for production resets)*
   - `http://localhost:5173/admin/reset-password` *(keeps local offline testing working)*
4. Click **Save**.

---

## Step 4: Configure Storage Buckets for Media Uploads

For event photos and certificates to display on the public website:

1. Navigate to **Storage** in the left sidebar.
2. Click **New Bucket** at the top:
   - Name: `event-images`
   - **Public bucket**: Toggle **ON** (so visitors can see the uploaded event photos).
3. Under **Bucket Policies**, ensure `SELECT` access is allowed for public anonymous users, and `INSERT`, `UPDATE`, and `DELETE` access is allowed only for **Authenticated** users.

---

## Step 5: Disable Supabase Default Emails (Bypassing Limits)

Since we are using **Hostinger SMTP (`smtp.hostinger.com`)** via the serverless Express API to send reliable emails with zero rate limits, you must disable Supabase's built-in email reset triggers:

1. Navigate to **Authentication** -> **Email Templates**.
2. Select the **Reset Password** template.
3. Toggle the **Enable Template** option to **OFF** or leave it empty, as all password reset requests are now captured by our Vercel API and sent via Nodemailer.
