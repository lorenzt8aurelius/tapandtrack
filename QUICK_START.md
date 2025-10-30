# TapAndTrack - Quick Start Guide

Get up and running in 5 minutes!
## 1. Prerequisites Check
```bash
# Check Node.js
node --version
# Should show: 18.x.x or higher

# Check npm
npm --version
```

If any are missing, see [SETUP.md](./SETUP.md) for installation links.

You will also need the Supabase CLI.

## 5-Minute Setup

### ✅ Step 1: Setup Supabase DB (2 minutes)

Go to [supabase.com](https://supabase.com) → Create Project → Run this SQL:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('teacher', 'student')),
    department TEXT,
    year_level TEXT
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID,
    subject TEXT NOT NULL,
    session_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID,
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

Copy **Project URL** and **anon key** from Settings → API.

### ✅ Step 2: Setup Supabase Locally (1 minute)

```bash
# Link your local repository to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# Start the local Supabase stack
supabase start
```

This will provide you with local Supabase credentials.

### ✅ Step 3: Setup Frontend (1 minute)

1.  Navigate to the frontend directory: `cd frontend`
2.  Create a `.env` file and add your **local** Supabase credentials from the `supabase start` output:
    ```env
    VITE_SUPABASE_URL="https://ggemseirsbpuwookpqsi.supabase.co"
    VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
    ```
3.  Install dependencies and run the server:
    ```bash
    npm install
    npm run dev
    ```

Frontend runs on: `http://localhost:5173` ✅

### 4️⃣ Test It! (1 minute)

1. Go to `http://localhost:5173`
2. **Register as Teacher**: 
   - Email: `teacher@test.com`
   - Password: `password123`
   - Role: Teacher
3. **Create Session**: Enter subject name
4. **Register as Student**: 
   - Open new incognito window
   - Email: `student@test.com`
   - Role: Student
5. **Scan QR Code**: Click scanner → point camera at QR code
6. ✅ Attendance recorded!

## Troubleshooting

## Common Commands

### Supabase CLI
```bash
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase functions deploy <function-name> # Deploy a function
```

### Frontend
```bash
cd frontend
npm run dev             # Development server
npm run build           # Production build
```

## Environment Variables Reference

### Backend
```env
Supabase__Url=https://xxxxx.supabase.co
Supabase__AnonKey=your_anon_key
ASPNETCORE_URLS=http://+:5000
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

## Next Steps

- 📖 Read [SETUP.md](./SETUP.md) for detailed instructions
- 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- 📋 Read [README.md](./README.md) for complete documentation

## Quick Links

- **Backend Swagger**: http://localhost:5000/swagger
- **Frontend App**: http://localhost:5173
- **Supabase Dashboard**: Your project URL

---

**Happy Coding! 🎉**
