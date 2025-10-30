# TapAndTrack Deployment Guide

Complete guide for deploying TapAndTrack to production.

## Prerequisites

- GitHub account
- Supabase account and project
- Vercel account (for frontend)

## Step 1: Setup Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for the database to be ready
4. Go to **SQL Editor**
5. Run the following SQL:

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    department TEXT,
    year_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    subject TEXT NOT NULL,
    session_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    session_code TEXT NOT NULL,
    time_in TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all for attendance" ON attendance FOR ALL USING (true);
```

6. Navigate to **Settings** > **API**
7. Copy your **Project URL** and **anon public key**

## Step 2: Push Code to GitHub
This guide assumes you have already pushed your code to a GitHub repository.

## Step 3: Deploy Backend Functions to Supabase

1.  Install the Supabase CLI if you haven't already.
2.  Link your local project to your remote Supabase project:
    ```bash
    supabase link --project-ref <project-id>
    ```
3.  Deploy all your Edge Functions to production:
    ```bash
    supabase functions deploy
    ```

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Import Project"**
3. Select **TapAndTrack** repository
4. Configure the project:

   **Framework Preset:**
   - Select **Vite**

   **Root Directory:**
   - Select **frontend**

5. Click **"Environment Variables"**
6. Add the following:
   ```
   Name: VITE_SUPABASE_URL
   Value: https://YOUR-PROJECT-ID.supabase.co
   ```
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: YOUR_SUPABASE_ANON_KEY
   ```
   Replace the values with the ones from your Supabase project's API settings.

7. Click **"Deploy"**
8. Wait for the deployment to complete
9. Copy your deployment URL (e.g., `https://tapandtrack.vercel.app`)

## Step 5: Testing Deployment

## Environment Variables Summary

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Continuous Deployment

- **Vercel**: Automatically deploys on push to the connected branch

Simply push to your main branch to trigger a new deployment.

## Monitoring and Logs

### Frontend Logs (Vercel)
1. Go to your Vercel dashboard
2. Select your project
3. Click on a deployment
4. View real-time and build logs

## Troubleshooting

### Frontend Issues

**Build Failed:**
- Check build logs in Vercel
- Verify dependencies in `package.json`
- Ensure Node.js version is compatible

**API Connection Failed:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct.
- Check your Supabase Edge Function logs.
- Ensure you have configured CORS in your `supabase/config.toml` file if you are calling functions from a different domain.

### Database Issues

**Tables Not Found:**
- Verify SQL migrations were run
- Check Supabase project settings
- Review Row Level Security policies

## Cost Estimation

### Free Tiers:
- **Vercel**: Free tier available
- **Supabase**: Free tier with 500MB database

### Production:
- **Vercel**: Starting at $20/month (Pro plan)
- **Supabase**: Starting at $25/month (Pro plan)

## Security Recommendations

1. Enable Row Level Security (RLS) policies in Supabase
2. Use Supabase's built-in JWT authentication.
3. Add rate limiting to your Edge Functions if needed.
4. Regularly update frontend dependencies.
5. Monitor for security vulnerabilities.
