import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import SessionModal from './SessionModal';
import AttendanceCharts from './AttendanceCharts';
import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const TeacherDashboard = ({
  subject,
  setSubject,
  activeSession,
  sessions,
  handleCreateSession,
  handleEndSession,
  user, // Assuming user object with id is passed down
  onSessionUpdate, // Function to trigger data refetch
}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('subject');
  const [durationMinutes, setDurationMinutes] = useState('');

  const filteredSessions = sessions.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (filterBy) {
      case 'subject':
        return s.subject.toLowerCase().includes(term);
      case 'date':
        return new Date(s.created_at).toLocaleDateString().includes(term);
      default:
        return true;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">

      {activeSession ? (
        // Active Session View
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200">Active Session: {activeSession.subject}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-600">Live Now</span>
            </div>
          </div>
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
        <form onSubmit={(e) => {
          handleCreateSession(e, durationMinutes);
          setDurationMinutes(''); // Reset duration after submission
        }} className="space-y-4">
          <div>
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
              required
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Leave empty or 0 for no auto-end"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Session will automatically end after this duration (0 = no auto-end)
            </p>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Create New Session
          </button>
        </form>
      )}

      {/* --- Past Sessions with Filtering --- */}
      <div className="mt-8">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Past Sessions</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder={`Search by ${filterBy}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="subject">Subject</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((s) => (
            <button key={s.id} onClick={() => setSelectedSession(s)} className="w-full text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors card-hover">
              <div className="flex items-center gap-3">
                <BookOpenIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{s.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 text-xs font-semibold rounded-full ${s.is_active ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                {s.is_active ? 'Active' : 'Ended'}
              </div>
            </button>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No past sessions found.</p>
        )}
      </div>

      {/* --- New Attendance Charts Section --- */}
      <AttendanceCharts user={user} />

      {/* --- Session Details Modal --- */}
      {selectedSession && (
        <SessionModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
          onSessionReopened={onSessionUpdate}
          onSessionDeleted={onSessionUpdate} />
      )}
    </div>
  );
};

export default TeacherDashboard;