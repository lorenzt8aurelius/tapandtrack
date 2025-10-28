# TapAndTrack - QR-Based Attendance Tracking System

A complete full-stack application for tracking student attendance using QR codes. Built with .NET 8 (C#) backend, React frontend, and Supabase database.

## 🎯 Features

- ✅ **Teacher Dashboard**: Create attendance sessions and generate unique QR codes
- ✅ **Student Dashboard**: Scan QR codes using mobile camera to record attendance
- ✅ **Real-time Tracking**: View attendance records in real-time
- ✅ **User Authentication**: Secure login and registration system
- ✅ **Role-based Access**: Separate views for teachers and students
- ✅ **Mobile-First Design**: Responsive UI optimized for mobile devices
- ✅ **Swagger Documentation**: Complete API documentation at `/swagger`

## 🏗️ Tech Stack

### Backend
- **.NET 8** - Modern C# Web API
- **Supabase** - PostgreSQL database
- **QRCoder** - QR code generation
- **BCrypt** - Password hashing
- **Swagger** - API documentation

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **HTML5 QR Code** - Mobile camera scanner
- **TailwindCSS** - Styling
- **Axios** - HTTP client

### Deployment
- **Backend**: Render (cloud hosting)
- **Frontend**: Vercel (static hosting)
- **Database**: Supabase (PostgreSQL)

## 📦 Project Structure

```
TapAndTrack/
├── backend/                 # .NET 8 Web API
│   ├── Controllers/        # API endpoints
│   ├── Models/             # Data models
│   ├── Program.cs          # App configuration
│   └── README.md           # Backend documentation
│
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # React components
│   │   ├── App.jsx         # Main app
│   │   └── api.js          # API client
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Supabase Account** - [Sign up](https://supabase.com)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd TapAndTrack
```

### 2. Setup Supabase Database

Create a new project in [Supabase](https://supabase.com) and run these SQL commands:

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

### 3. Setup Backend

```bash
cd backend

# Install dependencies
dotnet restore

# Run the application
dotnet run
```

Backend will be available at `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

**Environment Variables:**
Create a `.env` file or set these in your system:
```env
Supabase__Url=https://YOURPROJECT.supabase.co
Supabase__AnonKey=YOUR_SUPABASE_ANON_KEY
ASPNETCORE_URLS=http://+:5000
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

**Environment Variables:**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## ☁️ Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `tapandtrack-backend`
   - **Environment**: `.NET`
   - **Build Command**: `dotnet publish -c Release -o out`
   - **Start Command**: `dotnet out/TapAndTrack.dll`
6. Add environment variables:
   - `Supabase__Url`
   - `Supabase__Key` (Use the **service_role** key here)
   - `ASPNETCORE_URLS=http://+:10000`
7. Click "Create Web Service"

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
6. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-RENDER-BACKEND.onrender.com/api`
7. Click "Deploy"

## 📱 Usage

### Teacher Flow

1. **Register** as a teacher at `/register`
2. **Login** with your credentials
3. **Create Session**: Enter subject name and click "Create Session"
4. **Show QR Code**: Display the generated QR code to students
5. **End Session**: Click "End Session" when finished

### Student Flow

1. **Register** as a student at `/register`
2. **Login** with your credentials
3. **Scan QR Code**: Tap "Open QR Scanner" and point camera at QR code
4. **View Attendance**: Check your attendance history

## 🧪 Testing

### API Testing with Swagger

1. Visit `http://localhost:5000/swagger`
2. Explore all available endpoints
3. Test API requests directly from the UI

### Manual Testing Flow

1. Create a teacher account and login
2. Create a new session
3. Copy the session code
4. Create a student account and login
5. Scan the QR code using the scanner
6. Verify attendance is recorded in the database

## 🔧 API Endpoints

### Authentication
- `POST /api/Auth/register` - Register new user
- `POST /api/Auth/login` - User login

### Sessions
- `POST /api/Sessions/create` - Create new session
- `GET /api/Sessions/list?teacherId={id}` - Get teacher's sessions
- `GET /api/Sessions/active` - Get active sessions
- `GET /api/Sessions/qr/{sessionCode}` - Get QR code
- `POST /api/Sessions/end/{sessionCode}` - End session

### Attendance
- `POST /api/Attendance/record` - Record attendance
- `GET /api/Attendance/session/{sessionCode}` - Get session attendance
- `GET /api/Attendance/student/{studentId}` - Get student attendance

## 📚 Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 🔒 Security Notes

- Passwords are hashed using BCrypt
- Session codes are unique UUIDs
- CORS is configured for specific origins
- Consider implementing JWT tokens for production
- Row Level Security (RLS) is enabled in Supabase

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot connect to Supabase**
- Check environment variables are set correctly
- Verify Supabase URL and Anon Key

**Error: Migration failed**
- Ensure SQL tables are created correctly
- Check Supabase project is active

### Frontend Issues

**Error: Camera not working**
- Grant camera permissions in browser
- Use HTTPS for production (required for camera)
- Check browser compatibility

**Error: API connection failed**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS configuration

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Built with ❤️ using .NET 8, React, and Supabase**
