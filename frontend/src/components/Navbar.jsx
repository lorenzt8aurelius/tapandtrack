import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { SunIcon, MoonIcon, BellIcon, Cog6ToothIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import SettingsModal from './SettingsModal'; // Import the new component

const Navbar = ({ user, updateUser, handleLogout, isDarkMode, toggleDarkMode }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url);
  const profileRef = useRef(null);

  useEffect(() => {
    setAvatarUrl(user?.user_metadata?.avatar_url);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onUpload = async (event) => {
    // This logic is moved from Dashboard.jsx
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateUserError) throw updateUserError;

      setAvatarUrl(publicUrl);
      updateUser({ ...user, user_metadata: { ...user.user_metadata, avatar_url: publicUrl } });
      toast.success('Profile picture updated!');
      setProfileOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            T<span className="text-indigo-500">@</span>P – TapAndTrack
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <BellIcon className="h-6 w-6" />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!isProfileOpen)}>
                <img
                  className="h-9 w-9 rounded-full object-cover"
                  src={avatarUrl || `https://i.pravatar.cc/150?u=${user?.email}`}
                  alt="User avatar"
                />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20"
                  >
                    <div className="p-2">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                      <div className="mt-1">
                        <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
                          <UserCircleIcon className="h-5 w-5 mr-3" />
                          Edit Profile
                        </a>
                        <label htmlFor="avatar-upload" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-md">
                          <PhotoIcon className="h-5 w-5 mr-3" />
                          Change Picture
                        </label>
                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={onUpload} />
                         <button onClick={() => { setSettingsOpen(true); setProfileOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
                          <Cog6ToothIcon className="h-5 w-5 mr-3" />
                          Settings
                        </button>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </>
  );
};

export default Navbar;