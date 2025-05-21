import { createContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import { setUser, clearUser } from './store/userSlice';
import { getUserPreference, updateUserPreference } from './services/userPreferenceService';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingPreference, setIsLoadingPreference] = useState(false);

  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  const userId = userState?.user?.userId;

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
          '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                  ? `/login?redirect=${currentPath}`
                  : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function (error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed. Please try again.");
      }
    });
  }, []);

  // Fetch user preference when logged in
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserPreference();
    }
  }, [isAuthenticated, userId]);

  const fetchUserPreference = async () => {
    try {
      setIsLoadingPreference(true);
      const response = await getUserPreference(userId);
      if (response && response.length > 0) {
        const userPref = response[0];
        setDarkMode(userPref.darkMode);
      } else {
        // Default to system preference if no user preference exists
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
    } catch (error) {
      console.error("Error fetching user preference:", error);
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    } finally {
      setIsLoadingPreference(false);
    }
  };

  // Apply dark mode class to document when darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (isAuthenticated && userId) {
      try {
        await updateUserPreference(userId, { darkMode: newDarkMode });
      } catch (error) {
        console.error("Error updating theme preference:", error);
        toast.error("Failed to save theme preference");
      }
    }
  };

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
        toast.info("Logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="fixed top-4 right-4 z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={`p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors duration-300 ${isLoadingPreference ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          disabled={isLoadingPreference}
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700" />
          )}
        </motion.button>
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={
          isAuthenticated ? 
            <Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> : 
            <Login />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="!bg-surface-100 dark:!bg-surface-800 !shadow-card"
        bodyClassName="!text-surface-800 dark:!text-surface-100"
      />
    </>
  );
}

// Icon components
const SunIcon = getIcon('sun');
const MoonIcon = getIcon('moon');

export default App;
      
      {/* Loading overlay for app initialization */}
      {!isInitialized && (
        <div className="fixed inset-0 bg-white dark:bg-surface-900 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-surface-700 dark:text-surface-300">Initializing application...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
export default App;