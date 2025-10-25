import React from 'react';
import NavBar from './NavBar';
import { motion, AnimatePresence } from 'framer-motion';
import Newsletter from '../../Newsletter';
import DynamicText from '../../DynamicText';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavBar />
      {/* Decorative dynamic text that slides from sides */}
      <DynamicText leftText="CAVEE" rightText="224" />
      <AnimatePresence mode="wait">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {/* Fixed newsletter at bottom */}
      <Newsletter fixed />
    </div>
  );
};

export default Layout;