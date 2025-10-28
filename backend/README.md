# TapAndTrack Backend

A .NET 8 Web API backend for a QR-based attendance tracking system.

## Features

- ✅ Swagger UI for API documentation
- ✅ Supabase integration for data storage
- ✅ QR code generation for attendance sessions
- ✅ CORS enabled for frontend integration
- ✅ User authentication and authorization
- ✅ RESTful API endpoints

## Prerequisites

- .NET 8 SDK
- Supabase account and project

## Setup

### 1. Environment Variables

Create a `.env` file or set environment variables:

```env
Supabase__Url=https://YOURPROJECT.supabase.co
Supabase__Key=YOUR_SUPABASE_SERVICE_ROLE_KEY
ASPNETCORE_URLS=http://+:5000
```

### 2. Supabase Database Setup

Run these SQL commands in your Supabase SQL editor:

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
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    session_code TEXT NOT NULL,
    time_in TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your security needs)
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all for attendance" ON attendance_records FOR ALL USING (true);
```

### 3. Install Dependencies

```bash
cd backend
dotnet restore
```

### 4. Run the Application

```bash
dotnet run
```

The API will be available at:
- Local: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

## API Endpoints

### Authentication

- `POST /api/Auth/register` - Register a new user
- `POST /api/Auth/login` - Login with email and password

### Sessions

- `POST /api/Sessions/create` - Create a new attendance session
- `GET /api/Sessions/list?teacherId={id}` - Get all sessions for a teacher
- `GET /api/Sessions/active` - Get all active sessions
- `GET /api/Sessions/qr/{sessionCode}` - Get QR code for a session
- `POST /api/Sessions/end/{sessionCode}` - End an active session

### Attendance

- `POST /api/Attendance/record` - Record attendance for a student
- `GET /api/Attendance/session/{sessionCode}` - Get all attendance for a session
- `GET /api/Attendance/student/{studentId}` - Get attendance history for a student

## Request/Response Examples

### Register User

```json
POST /api/Auth/register
{
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher",
  "department": "Computer Science"
}
```

### Create Session

```json
POST /api/Sessions/create
{
  "subject": "Mathematics 101",
  "teacherId": "guid-here"
}
```

### Record Attendance

```json
POST /api/Attendance/record
{
  "sessionCode": "ABC12345",
  "studentId": "guid-here"
}
```

## Deployment to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Create a new Web Service
4. Connect your repository
5. Set build command: `dotnet publish -c Release -o out`
6. Set start command: `dotnet out/TapAndTrack.dll`
7. Add environment variables in Render dashboard
8. Deploy

## Environment Variables for Production

Add these in your Render dashboard:

```
Supabase__Url=https://YOURPROJECT.supabase.co
Supabase__AnonKey=YOUR_SUPABASE_ANON_KEY
ASPNETCORE_URLS=http://+:5000
```

## Security Notes

- Passwords are hashed using BCrypt
- Session codes are unique UUIDs
- CORS is configured for specific origins
- Consider implementing JWT tokens for production use
