import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const NotFound = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800"
    >
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-block"
        >
          <AlertTriangleIcon className="h-20 w-20 mx-auto text-accent" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-surface-800 dark:text-surface-100"
        >
          404
        </motion.h1>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold mb-2 text-surface-700 dark:text-surface-200"
        >
          Page Not Found
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg mb-8 text-surface-600 dark:text-surface-300"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-300"
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center text-surface-500 dark:text-surface-400"
      >
        <p>
          Need help? <a href="mailto:support@taskflow.com" className="underline hover:text-primary transition-colors">Contact Support</a>
        </p>
      </motion.div>
    </motion.div>
  );
};

// Icon components
const AlertTriangleIcon = getIcon('alert-triangle');
const HomeIcon = getIcon('home');

export default NotFound;