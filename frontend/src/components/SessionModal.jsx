import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { TrashIcon } from '@heroicons/react/24/outline';

const SessionModal = ({ session, onClose, onSessionReopened, onSessionDeleted }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!session?.session_code) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select(`
            time_in,
            users ( email )
          `)
          .eq('session_code', session.session_code);

        if (error) throw error;
        setAttendance(data);
      } catch (err) {
        toast.error('Failed to fetch attendance details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [session]);

  const handleReopen = async () => {
    try {
      const { error } = await supabase.functions.invoke('reopen-session', {
        body: { session_code: session.session_code },
      });
      if (error) throw error;
      toast.success('Session has been reopened!');
      onSessionReopened(); // This will trigger a refetch in the parent
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to reopen session.');
    }
  };

  const handleExportCSV = () => {
    if (attendance.length === 0) {
      toast.warn('No attendance data to export.');
      return;
    }
    const headers = ['Student Email', 'Time In'];
    const rows = attendance.map(att => [
      att.users.email,
      new Date(att.time_in).toLocaleString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${session.subject}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance exported as CSV.');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the session "${session.subject}"? This action cannot be undone and will also delete all attendance records for this session.`)) {
      return;
    }

    try {
      // First delete all attendance records for this session
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('session_code', session.session_code);

      if (attendanceError) throw attendanceError;

      // Then delete the session itself
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (sessionError) throw sessionError;

      toast.success('Session deleted successfully.');
      if (onSessionDeleted) {
        onSessionDeleted(); // Trigger refetch in parent
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete session.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{session.subject}</h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
          <p><strong className="text-gray-800 dark:text-gray-200">Session Code:</strong> <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 p-1 rounded">{session.session_code}</code></p>
          <p><strong className="text-gray-800 dark:text-gray-200">Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
          <p><strong className="text-gray-800 dark:text-gray-200">Status:</strong> <span className={`font-semibold ${session.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{session.is_active ? 'Active' : 'Ended'}</span></p>
          <p><strong className="text-gray-800 dark:text-gray-200">Total Attended:</strong> {loading ? 'Loading...' : `${attendance.length} students`}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button 
            onClick={onClose} 
            className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
          <button 
            onClick={handleExportCSV} 
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Export CSV
          </button>
          {!session.is_active && (
            <>
              <button 
                onClick={handleReopen} 
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Reopen Session
              </button>
              <button 
                onClick={handleDelete} 
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Session
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionModal;