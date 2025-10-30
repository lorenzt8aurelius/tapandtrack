import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const TeacherDashboard = ({
  subject,
  setSubject,
  activeSession,
  sessions,
  handleCreateSession,
  handleEndSession,
  user, // Assuming user object with id is passed down
}) => {
  const [stats, setStats] = useState({ averageAttendance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeacherStats = async () => {
    if (!user?.id) return;
    try {
      // This assumes you have a Supabase function named 'get-teacher-stats'
      const { data, error: functionError } = await supabase.functions.invoke('get-teacher-stats', {
        body: { teacherId: user.id },
      });
      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
      toast.error(err.message || 'Could not fetch stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStats();

    // Set up real-time subscriptions
    const changes = supabase
      .channel('teacher-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, fetchTeacherStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, fetchTeacherStats)
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(changes);
    };
  }, [user]);

  // A simple card component for the summary
  const SummaryCard = ({ title, value, children }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{loading ? '...' : value}</p>
      {children}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Teacher Dashboard</h2>

      {activeSession ? (
        // Active Session View
        <div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-3">Active Session: {activeSession.subject}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Session Code: <span className="font-mono bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">{activeSession.session_code}</span>
          </p>

          <div className="flex justify-center mb-4">
            <QRCode value={activeSession.session_code} size={256} level="H" includeMargin={true} />
          </div>

          <button
            onClick={() => handleEndSession(activeSession.session_code)}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
          >
            End Session
          </button>
        </div>
      ) : (
        // Create New Session Form
        <form onSubmit={handleCreateSession} className="space-y-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subject Name
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Mathematics 101"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Create New Session
          </button>
        </form>
      )}

      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-8 mb-4">Past Sessions</h3>
      <div className="space-y-2">
        {sessions.length > 0 ? (
          sessions.map((s) => (
            <div key={s.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
              <span className="text-gray-800 dark:text-gray-200">
                {s.subject} - <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(s.created_at).toLocaleString()}</span>
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  s.is_active ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}
              >
                {s.is_active ? 'Active' : 'Ended'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No past sessions found.</p>
        )}
      </div>

      {/* --- New Summary Section --- */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Dashboard Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Total Sessions Created" value={sessions.length} />
          <SummaryCard title="Average Attendance" value={`${stats.averageAttendance?.toFixed(1) ?? '0.0'}%`} />
          <SummaryCard title="Most Recent Session">
            {sessions.length > 0 ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">{sessions[0].subject}</p>
                <p className="text-gray-500 dark:text-gray-400">{new Date(sessions[0].created_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No sessions yet.</p>
            )}
          </SummaryCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;