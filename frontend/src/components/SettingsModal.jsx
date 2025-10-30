import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

// Custom hook to manage state with localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const Toggle = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-700 dark:text-gray-300">{label}</span>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SettingsModal = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('account');
  
  // Account State
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(user?.user_metadata?.department || '');
  const [yearLevel, setYearLevel] = useState(user?.user_metadata?.year_level || '');

  // Notification State
  const [sessionAlerts, setSessionAlerts] = useLocalStorage('settings_sessionAlerts', true);
  const [attendanceSummary, setAttendanceSummary] = useLocalStorage('settings_attendanceSummary', false);
  const [systemNotifications, setSystemNotifications] = useLocalStorage('settings_systemNotifications', true);

  // App Preferences State
  const [language, setLanguage] = useLocalStorage('settings_language', 'en');
  const [timeout, setTimeout] = useLocalStorage('settings_timeout', 30);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setDepartment(user.user_metadata?.department || '');
      setYearLevel(user.user_metadata?.year_level || '');
    }
  }, [user]);

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    const updates = {
      data: { department, year_level: yearLevel },
    };
    if (email !== user.email) {
      updates.email = email;
    }
    if (password) {
      updates.password = password;
    }

    try {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast.success('Account updated successfully! You may need to log in again if you changed your email.');
      setPassword(''); // Clear password field
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
              <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </header>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                <nav className="flex md:flex-col p-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </aside>

              <main className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'account' && (
                  <form onSubmit={handleAccountUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                      <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year Level</label>
                      <input type="text" value={yearLevel} onChange={e => setYearLevel(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Changes</button>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <Toggle label="Session Alerts" enabled={sessionAlerts} setEnabled={setSessionAlerts} />
                    <Toggle label="Attendance Summary" enabled={attendanceSummary} setEnabled={setAttendanceSummary} />
                    <Toggle label="System Notifications" enabled={systemNotifications} setEnabled={setSystemNotifications} />
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="mt-1 block w-full input-style">
                        <option value="en">English</option>
                        <option value="es" disabled>Spanish (coming soon)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout Reminders (minutes)</label>
                      <input type="number" value={timeout} onChange={e => setTimeout(e.target.value)} className="mt-1 block w-full input-style" />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Set a reminder for active sessions before they time out. (Placeholder)</p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

// Add this to your global CSS file (e.g., index.css) to share input styles
/*
@layer components {
  .input-style {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white;
  }
}
*/