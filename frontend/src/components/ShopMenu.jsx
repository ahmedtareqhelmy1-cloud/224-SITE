import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const categories = [
  { path: '/shop/tshirts', label: 'T-Shirts' },
  { path: '/shop/pants', label: 'Pants' },
  { path: '/shop/accessories', label: 'Accessories' }
];

export default function ShopMenu({ isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSoon, setShowSoon] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          Shop <FaChevronDown className="ml-1 h-3 w-3" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="py-1" role="menu">
              <Link
                to="/shop"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                All Products
              </Link>
              {categories.map(({ path, label }) => {
                const isAccessories = path.includes('accessories');
                const handleClick = (e) => {
                  if (isAccessories && !isAdmin) {
                    e.preventDefault();
                    setShowSoon(true);
                    setTimeout(()=> setShowSoon(false), 1600);
                  } else {
                    setIsOpen(false);
                  }
                };
                return (
                  <Link
                    key={path}
                    to={path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    role="menuitem"
                    onClick={handleClick}
                  >
                    {label}{isAccessories && !isAdmin && ' — Coming Soon'}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSoon && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 mt-2 px-3 py-2 text-xs rounded-md bg-gray-900 text-white border border-white/10 shadow-lg"
          >
            Accessories — Coming Soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}