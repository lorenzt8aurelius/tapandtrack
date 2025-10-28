import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sessionsAPI, attendanceAPI, analyticsAPI } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import StatsCard from '../components/StatsCard';
import Timer from '../components/Timer';
import LiveCounter from '../components/LiveCounter';
import Logo from '../components/Logo';

function Dashboard({ user, updateUser }) {
  const [subject, setSubject] = useState('');
  const [useTimer, setUseTimer] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        loadSessions();
        loadTeacherOverview();
      } else if (user.role === 'student') {
        loadAttendance();
        loadStudentOverview();
      }
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const response = await sessionsAPI.list(user.id);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await attendanceAPI.getByStudent(user.id);
      setAttendance(response.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const loadTeacherOverview = async () => {
    setLoadingOverview(true);
    try {
      const response = await analyticsAPI.getTeacherOverview(user.id);
      setOverview(response.overview);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadStudentOverview = async () => {
    setLoadingOverview(true);
    try {
      const response = await analyticsAPI.getStudentOverview(user.id);
      setOverview(response.overview);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (useTimer) {
        response = await sessionsAPI.createTimer({
          subject,
          teacherId: user.id,
          durationMinutes
        });
      } else {
        response = await sessionsAPI.create({
          subject,
          teacherId: user.id
        });
      }
      
      toast.success('Session created successfully!');
      setCurrentSession(response.session);
      setSubject('');
      setUseTimer(false);
      loadSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionCode) => {
    try {
      await sessionsAPI.end(sessionCode);
      toast.success('Session ended successfully!');
      setCurrentSession(null);
      loadSessions();
      loadTeacherOverview();
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const refreshQR = async (sessionCode) => {
    try {
      const response = await sessionsAPI.refreshQR(sessionCode);
      setCurrentSession({ ...currentSession, qrCode: response.qrCode });
      toast.success('QR code refreshed!');
    } catch (error) {
      toast.error('Failed to refresh QR code');
    }
  };

  const exportSession = async (sessionCode) => {
    try {
      const response = await analyticsAPI.exportSession(sessionCode);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${sessionCode}-${new Date().toISOString()}.json`;
      link.click();
      toast.success('Attendance data exported!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleTimerExpire = () => {
    if (currentSession?.sessionCode) {
      endSession(currentSession.sessionCode);
    }
  };

  const logout = () => {
    updateUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Logo and Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col items-center mb-4">
            <Logo size="medium" showText={true} />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.email}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Role: <span className="font-semibold capitalize text-indigo-600">{user.role}</span>
                {user.department && (
                  <> | Department: <span className="font-semibold">{user.department}</span></>
                )}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && !currentSession && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {user.role === 'teacher' && (
              <>
                <StatsCard
                  title="Total Sessions"
                  value={overview.totalSessions || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  color="bg-blue-100 text-blue-600"
                  delay={0}
                />
                <StatsCard
                  title="Active Sessions"
                  value={overview.activeSessions || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>}
                  color="bg-green-100 text-green-600"
                  delay={100}
                />
                <StatsCard
                  title="Total Attendance"
                  value={overview.totalAttendance || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>}
                  color="bg-purple-100 text-purple-600"
                  delay={200}
                />
                <StatsCard
                  title="Avg. per Session"
                  value={Math.round(overview.averageAttendancePerSession || 0)}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>}
                  color="bg-orange-100 text-orange-600"
                  delay={300}
                />
              </>
            )}
            {user.role === 'student' && (
              <>
                <StatsCard
                  title="Total Attendance"
                  value={overview.totalAttendance || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                  color="bg-green-100 text-green-600"
                />
                <StatsCard
                  title="Today"
                  value={overview.todayAttendance || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
                  color="bg-blue-100 text-blue-600"
                />
                <StatsCard
                  title="This Week"
                  value={overview.thisWeekAttendance || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>}
                  color="bg-purple-100 text-purple-600"
                />
                <StatsCard
                  title="This Month"
                  value={overview.thisMonthAttendance || 0}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>}
                  color="bg-orange-100 text-orange-600"
                />
              </>
            )}
          </div>
        )}

        {user.role === 'teacher' && (
          <>
            {/* Create Session Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Create New Session
              </h2>
              <form onSubmit={createSession} className="space-y-4">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject name (e.g., Mathematics 101)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useTimer"
                    checked={useTimer}
                    onChange={(e) => setUseTimer(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="useTimer" className="text-gray-700 font-medium">
                    Auto-close after timer
                  </label>
                </div>
                {useTimer && (
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    placeholder="Duration (minutes)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Creating...' : '✨ Create Session'}
                </button>
              </form>
            </div>

            {/* Current Session */}
            {currentSession && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6 animate-fadeIn">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎯 Active Session</h2>
                    <p className="text-lg font-semibold text-gray-700 mt-2">{currentSession.subject}</p>
                    <p className="text-sm text-gray-600">Code: <span className="font-mono font-bold">{currentSession.sessionCode}</span></p>
                    {currentSession.expiresAt && <Timer expiresAt={currentSession.expiresAt} onExpire={handleTimerExpire} />}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => refreshQR(currentSession.sessionCode)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-200 text-sm"
                      title="Refresh QR Code"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={() => endSession(currentSession.sessionCode)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 text-sm"
                      title="End Session"
                    >
                      ⏹️ End
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                        <QRCodeSVG value={currentSession.sessionCode} size={256} />
                      </div>
                    </div>
                    <LiveCounter sessionCode={currentSession.sessionCode} />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3">📊 Quick Actions</h3>
                      <button
                        onClick={() => exportSession(currentSession.sessionCode)}
                        className="w-full mb-2 px-4 py-3 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-200 font-medium"
                      >
                        📥 Export Attendance Data
                      </button>
                      <p className="text-sm text-gray-600 mt-4">
                        💡 Display the QR code on screen for students to scan. Attendance is recorded in real-time!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Previous Sessions */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Session History</h2>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No sessions yet</p>
                ) : (
                  sessions.map(session => (
                    <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{session.subject}</p>
                          <p className="text-sm text-gray-600">Code: <span className="font-mono font-bold">{session.session_code}</span></p>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(session.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.is_active ? '✅ Active' : '❌ Ended'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {user.role === 'student' && (
          <>
            {/* Scanner Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                Scan QR Code
              </h2>
              <button
                onClick={() => navigate('/scanner')}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-200 text-lg font-semibold flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open QR Scanner
              </button>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 My Attendance</h2>
              <div className="space-y-3">
                {attendance.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No attendance records yet</p>
                ) : (
                  attendance.map(record => (
                    <div key={record.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Session: <span className="font-mono">{record.session_code}</span></p>
                          <p className="text-sm text-gray-600 mt-1">
                            🕐 Time In: {new Date(record.time_in).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          ✅ Present
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;