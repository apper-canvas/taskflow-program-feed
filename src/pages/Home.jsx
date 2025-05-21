import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { AuthContext } from '../App';
import {
  getUserPreference,
  updateUserPreference,
  createUserPreference
} from '../services/userPreferenceService';

const Home = ({ darkMode }) => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { logout } = useContext(AuthContext);
  
  // Get user info from Redux
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const userId = user?.userId;
  const userEmail = user?.emailAddress;
  const userFirstName = user?.firstName || '';
  
  // Fetch user preference on load
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserPreference();
    }
  }, [isAuthenticated, userId]);
  
  const fetchUserPreference = async () => {
    try {
      setIsLoading(true);
      const preferences = await getUserPreference(userId);
      if (preferences && preferences.length > 0) {
        setUserName(preferences[0].userName || userFirstName);
      } else {
        // If no preference exists, use the user's first name from auth
        setUserName(userFirstName);
      }
    } catch (error) {
      console.error('Error fetching user preference:', error);
      // Fallback to first name from auth
      setUserName(userFirstName);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle user name input
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    const nameInput = e.target.elements.nameInput.value.trim();
    if (!nameInput) return;
    
    setIsSaving(true);
    try {
      await updateUserPreference(userId, { userName: nameInput });
      setUserName(nameInput); 
      toast.success("Name updated successfully");
    } catch (error) {
      console.error('Error saving user name:', error);
      toast.error("Failed to save name");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Clear user name
  const clearName = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsSaving(true);
      await updateUserPreference(userId, { userName: '' });
      setUserName('');
      toast.info("Name cleared");
    } catch (error) {
      console.error('Error clearing user name:', error);
      toast.error("Failed to clear name");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (!isAuthenticated) return;
    setUserName('');
    logout();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full"
    >
      <header className="w-full bg-gradient-to-r from-primary to-secondary p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <ChecklistIcon className="h-8 w-8 text-white mr-2" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">TaskFlow</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                  <UserIcon className="h-5 w-5 text-white mr-2" />
                  <span className="text-white font-medium">
                    {isLoading ? (
                      <span className="inline-block w-20 h-4 bg-white/30 animate-pulse rounded"></span>
                    ) : (
                      `Welcome, ${userName || userFirstName || userEmail || 'User'}`
                    )}
                  </span>
                  <button
                    onClick={clearName}
                    className={`ml-2 text-white opacity-70 hover:opacity-100 transition-opacity ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Clear name"
                    disabled={isSaving}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNameSubmit} className="flex">
                  <input
                    type="text"
                    name="nameInput"
                    placeholder="Enter your name"
                    className="px-3 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 text-white placeholder-white/70"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white/30 hover:bg-white/40 transition-colors px-3 py-2 rounded-r-lg text-white"
                  >
                    <SaveIcon className="h-5 w-5" />
                  </button>
                </form>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2 text-white flex items-center"
                >
                  <LogOutIcon className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-surface-800 dark:text-surface-100">
            {userName ? `${userName}'s Tasks` : (userFirstName ? `${userFirstName}'s Tasks` : 'My Tasks')}
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Organize and manage your tasks efficiently with TaskFlow.
          </p>
        </div>
        
        <MainFeature />
      </main>
      
      <footer className="border-t border-surface-200 dark:border-surface-800 mt-12 py-6 px-4">
        <div className="container mx-auto text-center text-surface-500 dark:text-surface-400 text-sm">
          <p>TaskFlow © {new Date().getFullYear()} | Organize your tasks with ease</p>
        </div>
      </footer>
    </motion.div>
  );
};

// Icon components
const ChecklistIcon = getIcon('clipboard-list');
const UserIcon = getIcon('user');
const XIcon = getIcon('x');
const SaveIcon = getIcon('save');
const LogOutIcon = getIcon('log-out');

export default Home;