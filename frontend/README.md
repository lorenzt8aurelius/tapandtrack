# TapAndTrack Frontend

A React-based frontend for the TapAndTrack QR attendance tracking system.

## Features

- ✅ Teacher Dashboard - Create sessions and generate QR codes
- ✅ Student Dashboard - Scan QR codes to record attendance
- ✅ Responsive design for mobile and desktop
- ✅ Real-time QR code scanning
- ✅ Toast notifications for user feedback
- ✅ Modern UI with TailwindCSS

## Prerequisites

- Node.js 18+ and npm
- TapAndTrack Backend API running

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:
```env
VITE_API_URL=https://tapandtrack-backend.onrender.com/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # Main dashboard (teacher/student views)
│   │   └── Scanner.jsx        # QR code scanner
│   ├── App.jsx                # Main app component with routing
│   ├── api.js                 # API client configuration
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tailwind.config.js         # TailwindCSS configuration
└── vite.config.js            # Vite configuration
```

## Pages

### Login Page
- Email and password authentication
- Links to registration page

### Register Page
- User registration with role selection (teacher/student)
- Optional department and year level fields

### Dashboard Page
**Teacher View:**
- Create new attendance sessions
- View and manage QR codes
- End active sessions
- View session history

**Student View:**
- Access QR scanner
- View attendance history

### Scanner Page
- Mobile-friendly QR code scanner
- Real-time attendance recording
- Camera permission handling

## API Integration

The frontend communicates with the backend API through the `api.js` module:

- `authAPI` - User authentication
- `sessionsAPI` - Session management
- `attendanceAPI` - Attendance recording

## Deployment to Vercel

### Option 1: Git Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables:
   - `VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com/api`
5. Deploy

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add environment variables when prompted.

## Environment Variables

Add these in your Vercel dashboard:

```
VITE_API_URL=https://tapandtrack-backend.onrender.com/api
```

## Mobile Optimization

The app is fully optimized for mobile devices:
- Touch-friendly buttons and inputs
- Responsive QR scanner
- Mobile camera integration
- Responsive layouts using TailwindCSS

## Troubleshooting

### Camera not working
- Ensure browser has camera permissions
- Use HTTPS in production (required for camera access)
- Check browser compatibility (Chrome, Firefox, Safari)

### API connection errors
- Verify `VITE_API_URL` is set correctly
- Check backend API is running and accessible
- Ensure CORS is configured on backend

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v` (should be 18+)
- Delete lock file if version conflicts occur

## Technologies Used

- React 18
- Vite
- React Router DOM
- Axios
- HTML5 QR Code Scanner
- QRCode.react
- TailwindCSS
- React Toastify
