# TapAndTrack Deployment Guide

Complete guide for deploying TapAndTrack to production.

## Prerequisites

- GitHub account
- Supabase account and project
- Render account (for backend)
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

-- Create attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    session_code TEXT NOT NULL,
    time_in TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations)
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all for attendance" ON attendance FOR ALL USING (true);
```

6. Navigate to **Settings** > **API**
7. Copy your **Project URL** and **anon public key**

## Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TapAndTrack project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TapAndTrack.git
git push -u origin main
```

## Step 3: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** > **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select **TapAndTrack** repository
5. Configure the service:

   **Settings:**
   - **Name**: `tapandtrack-backend`
   - **Region**: `Oregon` (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Starter` (or `Free` for testing)

   **Build & Deploy:**
   - **Build Command**: `dotnet publish -c Release -o out`
   - **Start Command**: `dotnet out/TapAndTrack.dll`

6. Click **"Advanced"** and add environment variables:

```
Supabase__Url=https://YOURPROJECT.supabase.co
Supabase__AnonKey=YOUR_SUPABASE_ANON_KEY
ASPNETCORE_URLS=http://+:5000
```

7. Click **"Create Web Service"**
8. Wait for the build to complete
9. Copy the service URL (e.g., `https://tapandtrack-backend.onrender.com`)

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
   Name: VITE_API_URL
   Value: https://YOUR-RENDER-BACKEND.onrender.com/api
   ```
   Replace `YOUR-RENDER-BACKEND` with your actual Render service name.

7. Click **"Deploy"**
8. Wait for the deployment to complete
9. Copy your deployment URL (e.g., `https://tapandtrack.vercel.app`)

## Step 5: Update CORS Configuration

1. Go back to your Render backend service
2. Edit your `backend/Program.cs` to include your Vercel URL in CORS origins
3. Or update via Render dashboard environment variables

The CORS configuration in `Program.cs` includes:
- `http://localhost:5173` (local development)
- `https://tapandtrack.vercel.app` (production)

Update the allowed origins as needed.

## Step 6: Testing Deployment

### Test Backend

1. Visit `https://YOUR-BACKEND.onrender.com/swagger`
2. Test the API endpoints
3. Try registering a user via Swagger UI

### Test Frontend

1. Visit your Vercel deployment URL
2. Register as a teacher
3. Create a session
4. Register as a student
5. Scan the QR code to record attendance

## Environment Variables Summary

### Backend (Render)
```env
Supabase__Url=https://YOURPROJECT.supabase.co
Supabase__AnonKey=YOUR_SUPABASE_ANON_KEY
ASPNETCORE_URLS=http://+:5000
```

### Frontend (Vercel)
```env
VITE_API_URL=https://tapandtrack-backend.onrender.com/api
```

## Continuous Deployment

Both Render and Vercel support automatic deployments:

- **Render**: Automatically deploys on push to the connected branch
- **Vercel**: Automatically deploys on push to the connected branch

Simply push to your main branch to trigger a new deployment.

## Monitoring and Logs

### Backend Logs (Render)
1. Go to your Render dashboard
2. Select your backend service
3. Click on the **"Logs"** tab

### Frontend Logs (Vercel)
1. Go to your Vercel dashboard
2. Select your project
3. Click on a deployment
4. View real-time and build logs

## Troubleshooting

### Backend Issues

**Build Failed:**
- Check build logs in Render
- Verify `.csproj` file dependencies
- Ensure .NET 8 SDK is specified

**API Not Responding:**
- Check environment variables are set correctly
- Verify Supabase connection
- Check service logs

### Frontend Issues

**Build Failed:**
- Check build logs in Vercel
- Verify dependencies in `package.json`
- Ensure Node.js version is compatible

**API Connection Failed:**
- Verify `VITE_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend service is running

### Database Issues

**Tables Not Found:**
- Verify SQL migrations were run
- Check Supabase project settings
- Review Row Level Security policies

## Cost Estimation

### Free Tier:
- **Render**: Free tier available (with limitations)
- **Vercel**: Free tier available
- **Supabase**: Free tier with 500MB database

### Production:
- **Render**: Starting at $7/month
- **Vercel**: Starting at $20/month (Pro plan)
- **Supabase**: Starting at $25/month (Pro plan)

## Security Recommendations

1. Enable Row Level Security (RLS) policies in Supabase
2. Implement JWT authentication for production
3. Add rate limiting to API endpoints
4. Enable HTTPS for all endpoints
5. Regularly update dependencies
6. Monitor for security vulnerabilities

## Support

For issues or questions:
1. Check application logs
2. Review error messages
3. Test API endpoints with Swagger
4. Verify environment variables
5. Check service status on Render/Vercel dashboards
