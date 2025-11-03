import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import TeacherDashboard from '../components/TeacherDashboard';
import StudentDashboard from '../components/StudentDashboard';
import SettingsModal from '../components/SettingsModal';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

function Dashboard({ user, updateUser }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false); // For StudentDashboard
  const [isDarkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  }); 
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect for clicking outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const isTeacher = user && user.role === 'teacher';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isTeacher) {
        const { data, error } = await supabase.functions.invoke('get-teacher-dashboard', {
          body: { teacherId: user.id },
        });
        if (error) throw error;
        setSessions(data.sessions || []);
        setActiveSession(data.activeSession || null);
      } else {
        const { data: studentAttendance, error: studentError } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' }) // Use count for efficiency
          .eq('student_id', user.id);
        if (studentError) throw studentError;
        setAttendance(studentAttendance || []);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isTeacher, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadData();

    // Real-time subscription setup
    const channel = supabase.channel('dashboard-updates');
    if (isTeacher) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `teacher_id=eq.${user.id}` }, loadData);
    } else {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, (payload) => {
        loadData();
        toast.info('Your attendance has been updated!');
      });
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, isTeacher, loadData]);

  const handleCreateSession = async (e, durationMinutes) => {
    e.preventDefault();
    if (!subject) {
      toast.warn('Please enter a subject name.');
      return;
    } 
    try {
      const { data: newSession, error } = await supabase.functions.invoke('create-session', {
        body: { teacherId: user.id, subject, durationMinutes: durationMinutes || null },
      });
      if (error) throw error;
      setActiveSession(newSession);
      setSubject('');
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create session.');
      console.error(error);
    }
  };

  const handleEndSession = useCallback(async (sessionCode) => {
    try {
      const { error } = await supabase.functions.invoke('end-session', {
        body: { sessionCode },
      });
      if (error) throw error;
      setActiveSession(null);
      await loadData(); // Refresh data after ending a session
      toast.success('Session ended.');
    } catch (error) {
      toast.error('Failed to end session.');
      console.error(error);
    }
  }, [loadData]);

  const handleLogout = () => {
    updateUser(null);
    // Clear state to prevent flashing old data for next user
    setSessions([]);
    setAttendance([]);
    setActiveSession(null);
    localStorage.removeItem('user');
    navigate('/login');
    toast.info('Logged out successfully.');
  };

  // Effect for auto-ending sessions
  useEffect(() => {
    if (isTeacher && activeSession && activeSession.duration_minutes && parseInt(activeSession.duration_minutes, 10) > 0) {
      const sessionStartTime = new Date(activeSession.created_at).getTime();
      const durationMs = parseInt(activeSession.duration_minutes, 10) * 60 * 1000;
      const endTime = sessionStartTime + durationMs;

      const interval = setInterval(() => {
        if (Date.now() >= endTime) {
          handleEndSession(activeSession.session_code);
          toast.info(`Session for ${activeSession.subject} automatically ended after ${activeSession.duration_minutes} minutes.`);
          clearInterval(interval);
        }
      }, 1000 * 30); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeSession, isTeacher, handleEndSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Tap & Track
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(o => !o)} className="flex items-center space-x-2">
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{user?.email}</span>
                <img className="h-8 w-8 rounded-full bg-gray-300" src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} alt="avatar" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                      <p className="font-semibold">Signed in as</p>
                      <p className="truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSettingsOpen(true);
                        setProfileOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {isTeacher ? (
              <TeacherDashboard
                subject={subject}
                setSubject={setSubject}
                activeSession={activeSession}
                sessions={sessions}
                handleCreateSession={handleCreateSession}
                handleEndSession={handleEndSession}
                user={user}
                onSessionUpdate={loadData}
              />
            ) : (
              <StudentDashboard
                user={user}
                attendance={attendance}
                showScanner={showScanner}
                setShowScanner={setShowScanner}
                onAttendanceUpdate={loadData}
              />
            )}
          </div>
        </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
    </div>
  );
}

export default Dashboard;
