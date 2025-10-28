# TapAndTrack - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check .NET 8
dotnet --version
# Should show: 8.x.x

# Check Node.js
node --version
# Should show: 18.x.x or higher

# Check npm
npm --version
```

If any are missing, see [SETUP.md](./SETUP.md) for installation links.

## 5-Minute Setup

### 1️⃣ Setup Supabase (2 minutes)

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

### 2️⃣ Setup Backend (1 minute)

```bash
cd backend

# Windows (PowerShell)
$env:Supabase__Url="YOUR_SUPABASE_URL"
$env:Supabase__AnonKey="YOUR_ANON_KEY"

# Or edit appsettings.json directly
# Then run:
dotnet run
```

Backend runs on: `http://localhost:5000`
Swagger: `http://localhost:5000/swagger` ✅

### 3️⃣ Setup Frontend (1 minute)

```bash
cd frontend

# Create .env file (or set environment variable)
echo "VITE_API_URL=http://localhost:5000/api" > .env

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

### Backend won't start
```bash
# Check if port 5000 is in use
cd backend
dotnet run
# Or change port in Program.cs: ASPNETCORE_URLS
```

### Frontend build fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to Supabase
- Check URL and key are correct
- Verify Supabase project is active
- Check tables exist in Table Editor

### Camera not working
- Grant browser permissions
- Use HTTPS in production
- Test on mobile device

## Common Commands

### Backend
```bash
cd backend
dotnet run              # Run
dotnet build            # Build
dotnet test             # Test (if tests exist)
```

### Frontend
```bash
cd frontend
npm run dev             # Development server
npm run build           # Production build
npm run preview         # Preview production build
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
