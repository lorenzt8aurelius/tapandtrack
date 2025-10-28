# TapAndTrack Setup Guide

Complete step-by-step setup instructions for the TapAndTrack project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com)

## Part 1: Setup Supabase Database

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `tapandtrack`
   - **Database Password**: (use a strong password)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait for the database to be provisioned (takes a few minutes)

### 1.2 Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click **"New query"**
3. Paste the following SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    department TEXT,
    year_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    subject TEXT NOT NULL,
    session_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    session_code TEXT NOT NULL,
    time_in TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all for attendance" ON attendance FOR ALL USING (true);
```

4. Click **"RUN"** to execute
5. Verify tables were created in **Table Editor**

### 1.3 Get API Credentials

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **`service_role` secret key**: Long alphanumeric string (This is required for the backend)

Keep both the Project URL and the `service_role` key for the next steps.

## Part 2: Setup Backend

### 2.1 Install Dependencies

```bash
cd backend

# Restore NuGet packages
dotnet restore
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory (or set system environment variables):

**On Windows (PowerShell):**
```powershell
$env:Supabase__Url="YOUR_SUPABASE_PROJECT_URL"
$env:Supabase__Key="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

**On Linux/Mac:**
```bash
export Supabase__Url="https://YOURPROJECT.supabase.co"
export Supabase__AnonKey="YOUR_SUPABASE_ANON_KEY"
```

Or edit `backend/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "https://YOURPROJECT.supabase.co",
    "AnonKey": "YOUR_SUPABASE_ANON_KEY"
  }
}
```

### 2.3 Run Backend

```bash
cd backend
dotnet run
```

The backend should start on `http://localhost:5000`

Test it by visiting: `http://localhost:5000/swagger`

## Part 3: Setup Frontend

### 3.1 Install Dependencies

```bash
cd frontend

# Install npm packages
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3.3 Run Frontend

```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

## Part 4: Testing the Application

### 4.1 Test as Teacher

1. Open `http://localhost:5173`
2. Click **"Register here"**
3. Fill in the form:
   - Email: `teacher@example.com`
   - Password: `password123`
   - Role: Select **"Teacher"**
   - Department: `Computer Science`
4. Click **"Register"**
5. You should be redirected to the teacher dashboard
6. Enter a subject name (e.g., "Mathematics 101")
7. Click **"Create Session"**
8. A QR code should appear

### 4.2 Test as Student

1. Open a **new browser window** or **incognito mode**
2. Go to `http://localhost:5173`
3. Click **"Register here"**
4. Fill in the form:
   - Email: `student@example.com`
   - Password: `password123`
   - Role: Select **"Student"**
   - Department: `Computer Science`
5. Click **"Register"**
6. You should be redirected to the student dashboard
7. Click **"Open QR Scanner"**
8. Allow camera permissions
9. Point your camera at the QR code from the teacher dashboard
10. Your attendance should be recorded!

### 4.3 Verify in Database

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** > **attendance**
3. You should see your attendance record

## Troubleshooting

### Backend Issues

**Error: Cannot connect to Supabase**
- Verify your Supabase URL and Anon Key are correct
- Check Supabase project is active
- Ensure tables exist

**Error: Entity Framework errors**
- This project doesn't use EF Core - Supabase is used directly
- Check your Supabase client initialization

**Port already in use**
- Change port in `appsettings.json`: `"ASPNETCORE_URLS": "http://+:5001"`
- Or kill the process using port 5000

### Frontend Issues

**Error: npm install failed**
- Make sure Node.js 18+ is installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

**Error: Camera not working**
- Grant camera permissions in your browser
- Use HTTPS or localhost for camera to work
- Check browser compatibility

**Error: Cannot connect to API**
- Verify `VITE_API_URL` is set correctly
- Check backend is running on port 5000
- Check browser console for CORS errors

### Database Issues

**Error: Tables not found**
- Run the SQL commands again in Supabase SQL Editor
- Check table names match exactly

**Error: Permission denied**
- Verify Row Level Security policies were created
- Check policies allow all operations (for development)

## Next Steps

### Local Development

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Swagger: `http://localhost:5000/swagger`

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Development Tips

### Hot Reload

- Backend: Restart manually or use `dotnet watch run`
- Frontend: Automatic via Vite

### Debugging

- Backend: Use Swagger UI to test endpoints
- Frontend: Use browser DevTools console
- Database: Use Supabase Table Editor

### Making Changes

1. Edit code
2. Save files
3. Frontend auto-refreshes
4. Backend: restart with `dotnet run`

## Project Structure Reference

```
TapAndTrack/
├── backend/                 # .NET 8 Web API
│   ├── Controllers/        # API endpoints
│   │   ├── AuthController.cs
│   │   ├── SessionsController.cs
│   │   └── AttendanceController.cs
│   ├── Models/             # Data models
│   │   ├── User.cs
│   │   ├── Session.cs
│   │   └── AttendanceRecord.cs
│   ├── Program.cs          # App configuration
│   └── TapAndTrack.csproj  # Project file
│
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Scanner.jsx
│   │   ├── App.jsx         # Main app
│   │   ├── api.js          # API client
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Support

If you encounter issues:

1. Check error messages in console/logs
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Test each component individually (database, backend, frontend)
5. Check the troubleshooting section above
