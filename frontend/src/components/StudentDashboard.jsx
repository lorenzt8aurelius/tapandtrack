import React, { useState, useEffect } from 'react';
import Scanner from '../pages/Scanner';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const StudentDashboard = ({ user, attendance, showScanner, setShowScanner }) => {
  const [stats, setStats] = useState({ total_sessions: 0, attended_sessions: 0, attendance_rate: 0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    if (!user?.id) return;
    try {
      // This assumes you have a Supabase function named 'get-student-dashboard'
      const { data, error: functionError } = await supabase.functions.invoke('get-student-dashboard', {
        body: { studentId: user.id },
      });
      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      setStats(data.stats);
      setRecentAttendance(data.attendance);
    } catch (err) {
      setError('Failed to load dashboard data.');
      toast.error(err.message || 'Could not fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();

    // Set up real-time subscription for this student's attendance
    const changes = supabase
      .channel('student-dashboard-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` },
        (payload) => {
          // Optimistically update or just refetch for simplicity
          fetchStudentData();
          toast.info('Your attendance has been updated!');
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(changes);
    };
  }, [user]);

  // A simple card component for the summary
  const SummaryCard = ({ title, value }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Dashboard</h2>

      <button
        onClick={() => setShowScanner(true)}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 mb-4"
      >
        Open QR Scanner
      </button>

      {showScanner && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md">
          <Scanner userId={user.id} onClose={() => setShowScanner(false)} />
        </div>
      )}

      <h3 className="text-xl font-medium text-gray-700 mt-8 mb-4">Your Attendance History</h3>
      <div className="space-y-2">
        {attendance.length > 0 ? (
          attendance.map((a) => (
            <div key={a.id} className="bg-gray-50 p-3 rounded-md">
              <span>
                Session: {a.session_code} -{' '}
                <span className="text-sm text-gray-500">{new Date(a.time_in).toLocaleString()}</span>
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You have not attended any sessions yet.</p>
        )}
      </div>

      {/* --- New Summary Section --- */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard title="Total Classes" value={stats.total_sessions ?? 0} />
          <SummaryCard title="Attended Sessions" value={stats.attended_sessions ?? 0} />
          <SummaryCard title="Attendance Rate" value={`${stats.attendance_rate?.toFixed(1) ?? '0.0'}%`} />
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-3">Recent Attendance</h4>
          <div className="space-y-2">
            {recentAttendance.length > 0 ? (
              recentAttendance.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                  <span className="font-medium text-gray-800">{item.subject || `Session: ${item.session_code}`}</span>
                  <span className="text-sm text-gray-500">{new Date(item.time_in).toLocaleString()}</span>
                </div>
              ))
            ) : <p className="text-gray-500 text-sm">No recent attendance records.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;