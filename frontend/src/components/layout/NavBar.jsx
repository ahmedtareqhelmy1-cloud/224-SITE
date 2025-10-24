import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavBar = () => {
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const { items } = useSelector(state => state.cart);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com';
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === adminEmail;

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.img
                whileHover={{ scale: 1.05 }}
                className="h-8 w-auto"
                src="/logo-224.png"
                alt="224 Logo"
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="nav-link">
                Home
              </Link>
              
              {/* Shop Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setIsShopMenuOpen(true)}
                  onMouseLeave={() => setIsShopMenuOpen(false)}
                  className="nav-link"
                >
                  Shop
                </button>
                <AnimatePresence>
                  {isShopMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800"
                      onMouseEnter={() => setIsShopMenuOpen(true)}
                      onMouseLeave={() => setIsShopMenuOpen(false)}
                    >
                      <div className="py-1">
                        <Link to="/shop" className="dropdown-item">
                          All Products
                        </Link>
                        <Link to="/shop/new" className="dropdown-item">
                          New Arrivals
                        </Link>
                        <Link to="/shop/sale" className="dropdown-item">
                          Sale
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/custom-design" className="nav-link">
                Custom Design
              </Link>
              
              <Link to="/contact" className="nav-link">
                Contact
              </Link>
            </div>
          </div>

          {/* Right Side - Cart, Auth, Admin */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
              ) : (
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate('/admin')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Admin
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => signOut()}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Sign Out
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;