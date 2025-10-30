import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import TeacherDashboard from '../components/TeacherDashboard';
import StudentDashboard from '../components/StudentDashboard';
import Navbar from '../components/Navbar'; // New component

// A simple card for displaying stats
const StatsCard = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${color.border}`}>
    <div className={`p-3 rounded-full ${color.bg} dark:bg-opacity-20`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? 'N/A'}</p>
    </div>
  </div>
);


function Dashboard({ user, updateUser }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalAttendance: 0, averageAttendance: 0 });
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false); // For StudentDashboard
  const [isDarkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const isTeacher = user && user.role === 'teacher';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isTeacher) {
          const { data, error } = await supabase.functions.invoke('get-teacher-dashboard', {
            body: { teacherId: user.id },
          });
          if (error) throw error;
          if(data.error) throw new Error(data.error);

          setSessions(data.sessions);
          setActiveSession(data.activeSession);

          // Calculate stats for teacher
          const totalAttendance = data.sessions.reduce((acc, s) => acc + (s.attendance_count || 0), 0);
          const avgAttendance = data.sessions.length > 0 ? (totalAttendance / data.sessions.length) : 0;
          setStats({
            totalSessions: data.sessions.length,
            totalAttendance: totalAttendance,
            averageAttendance: avgAttendance.toFixed(1)
          });

        } else {
          // Replaced failing 'get-student-dashboard' function call with a direct, secure query.
          const { data: studentAttendance, error: studentError } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', user.id);
          if (studentError) throw studentError;
          setAttendance(studentAttendance || []);
          setStats({
            totalSessions: 'N/A',
            totalAttendance: studentAttendance?.length || 0,
            averageAttendance: 'N/A'
          });
        }
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [user, navigate, isTeacher]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!subject) {
      toast.warn('Please enter a subject name.');
      return;
    } 
    try {
      const { data: newSession, error } = await supabase.functions.invoke('create-session', {
        body: { teacherId: user.id, subject },
      });
      if (error) throw error;
      if(newSession.error) throw new Error(newSession.error);
      setActiveSession(newSession);
      setSubject('');
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create session.');
      console.error(error);
    }
  };

  const handleEndSession = async (sessionCode) => {
    try {
      const { error } = await supabase.functions.invoke('end-session', {
        body: { sessionCode },
      });
      if (error) throw error;
      setActiveSession(null);
      toast.success('Session ended.');
    } catch (error) {
      toast.error('Failed to end session.');
      console.error(error);
    }
  };

  const handleLogout = () => {
    updateUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    toast.info('Logged out successfully.');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar 
        user={user} 
        updateUser={updateUser}
        handleLogout={handleLogout} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatsCard
                title="Total Sessions"
                value={sessions.length}
                icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                color={{ border: "border-blue-500", bg: "bg-blue-100" }}
              />
              <StatsCard
                title="Total Attendance"
                value={stats.totalAttendance}
                icon={<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.103-1.282-.29-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.103-1.282.29-1.857m0 0a5.002 5.002 0 019.42 0M17 16H7m10 4h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.103-1.282-.29-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.103-1.282.29-1.857m0 0a5.002 5.002 0 019.42 0" /></svg>}
                color={{ border: "border-green-500", bg: "bg-green-100" }}
              />
              <StatsCard
                title="Avg. Attendance"
                value={stats.averageAttendance}
                icon={<svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM9 17a4 4 0 00-4 4v1h14v-1a4 4 0 00-4-4H9z" /></svg>}
                color={{ border: "border-yellow-500", bg: "bg-yellow-100" }}
              />
            </div>

            {isTeacher ? (
              <TeacherDashboard
                subject={subject}
                setSubject={setSubject}
                activeSession={activeSession}
                sessions={sessions}
                handleCreateSession={handleCreateSession}
                handleEndSession={handleEndSession}
                user={user}
              />
            ) : (
              <StudentDashboard
                user={user}
                attendance={attendance}
                showScanner={showScanner}
                setShowScanner={setShowScanner}
              />
            )}
          </div>
        </main>
    </div>
  );
}

export default Dashboard;
