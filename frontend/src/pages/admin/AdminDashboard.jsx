import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Admin Dashboard Components
import ProductManagement from './sections/ProductManagement';
import OrderManagement from './sections/OrderManagement';
import StockManagement from './sections/StockManagement';
import Analytics from './sections/Analytics';

const AdminDashboard = () => {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('products');

  // Check if user is admin
  if (!user || user.primaryEmailAddress?.emailAddress !== 'mohamedtareq543219@gmail.com') {
    return <Navigate to="/" replace />;
  }

  const sections = {
    products: <ProductManagement />,
    orders: <OrderManagement />,
    stock: <StockManagement />,
    analytics: <Analytics />
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-64 bg-white dark:bg-gray-800 h-screen shadow-lg"
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            {Object.keys(sections).map((section) => (
              <motion.button
                key={section}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-6 py-3 ${
                  activeSection === section
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-grow p-8"
        >
          {sections[activeSection]}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;