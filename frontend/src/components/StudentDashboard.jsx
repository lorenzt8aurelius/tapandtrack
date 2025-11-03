import React from 'react';
import Scanner from '../pages/Scanner';

const StudentDashboard = ({ user, attendance, showScanner, setShowScanner, onAttendanceUpdate }) => {
  const handleScannerClose = (shouldRefresh = false) => {
    setShowScanner(false);
    if (shouldRefresh && onAttendanceUpdate) {
      // Small delay to ensure the database has updated
      setTimeout(() => {
        onAttendanceUpdate();
      }, 500);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Student Dashboard</h2>

      <button
        onClick={() => setShowScanner(true)}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 mb-4"
      >
        Open QR Scanner
      </button>

      {showScanner && (
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md">
          <Scanner userId={user.id} onClose={handleScannerClose} />
        </div>
      )}

      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-8 mb-4">Your Attendance History</h3>
      <div className="space-y-2">
        {attendance.length > 0 ? (
          attendance.map((a) => (
            <div key={a.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
              <span className="text-gray-800 dark:text-gray-200">
                Session: <span className="font-mono">{a.session_code}</span> -{' '}
                <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(a.time_in).toLocaleString()}</span>
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">You have not attended any sessions yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;