import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const Home = ({ darkMode }) => {
  // State for user name (for welcome message)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });
  
  // Save user name to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);
  
  // Handle user name input
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const nameInput = e.target.elements.nameInput.value.trim();
    if (nameInput) {
      setUserName(nameInput);
      toast.success("Name updated successfully!");
    }
  };
  
  // Clear user name
  const clearName = () => {
    setUserName('');
    toast.info("Name cleared");
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
            
            {userName ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                <UserIcon className="h-5 w-5 text-white mr-2" />
                <span className="text-white font-medium">Welcome, {userName}</span>
                <button 
                  onClick={clearName}
                  className="ml-2 text-white opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Clear name"
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
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-surface-800 dark:text-surface-100">
            {userName ? `${userName}'s Tasks` : 'My Tasks'}
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

export default Home;