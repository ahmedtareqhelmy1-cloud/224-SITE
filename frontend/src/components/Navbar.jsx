import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../app/providers/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import Logo from './Logo';
import ShopMenu from './ShopMenu';
// We'll load the Clerk user via a small nested component so Navbar can remain safe
import { SignInButton } from '@clerk/clerk-react';
import { FaMoon, FaSun, FaShoppingCart, FaInstagram } from 'react-icons/fa';

const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clerkUser, setClerkUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authComponents, setAuthComponents] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart?.items || []);

  useEffect(() => {
    // load Clerk auth components dynamically for SignedIn/SignedOut wrappers
    if (isClerkAvailable) {
      import('@clerk/clerk-react').then((clerk) => {
        setAuthComponents({
          SignedIn: clerk.SignedIn,
          SignedOut: clerk.SignedOut,
          SignInButton: clerk.SignInButton,
          UserButton: clerk.UserButton,
        });
      }).catch((err) => console.warn('Error loading Clerk components:', err));
    }
  }, []);

  // Nested component to safely call useUser when ClerkProvider is present
  function ClerkUserLoader() {
    try {
      // dynamic require inside function so it's only used when Clerk is present
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { useUser } = require('@clerk/clerk-react');
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isSignedIn: signed, user } = useUser();
      useEffect(() => {
        setIsSignedIn(!!signed);
        setClerkUser(user || null);
      }, [signed, user]);
    } catch (err) {
      // Clerk not available or hook cannot be used; silently ignore
    }
    return null;
  }

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com';
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = isSignedIn && userEmail === adminEmail;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { type: 'shop-menu' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <motion.nav 
      className={`fixed w-full z-50 backdrop-blur-sm transition-all duration-500 ease-custom-ease
        ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 shadow-glass' : 'bg-transparent'}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.25, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hamburger Menu */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted 
                hover:text-foreground hover:bg-panel focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? '' : ''}
            </button>
            
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              if (link.type === 'shop-menu') {
                return <ShopMenu key="shop-menu" isAdmin={isAdmin} />;
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={'px-3 py-2 rounded-md text-sm font-medium ' + 
                    (location.pathname === link.to
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400')
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/224_.studios?igsh=bHluNm1vdnQ5bmlv"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-700 hover:text-pink-600 dark:text-gray-200 dark:hover:text-pink-400"
              aria-label="224_.studios on Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="theme-toggle group relative flex items-center gap-2 px-3 py-2 border border-white/10 dark:border-white/10 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-foreground hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors duration-300"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: theme==='dark'? -90: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.35, ease: [0.2, 0.9, 0.25, 1] }}
                className="relative w-5 h-5"
              >
                {/* Futuristic Sun/Moon icon */}
                {theme === 'dark' ? (
                  // Sun
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-300 drop-shadow" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" fill="currentColor" className="text-yellow-300" />
                    <g className="animate-spin-slow origin-center" style={{animationDuration:'9s'}}>
                      <line x1="12" y1="1.5" x2="12" y2="4.2" />
                      <line x1="12" y1="19.8" x2="12" y2="22.5" />
                      <line x1="1.5" y1="12" x2="4.2" y2="12" />
                      <line x1="19.8" y1="12" x2="22.5" y2="12" />
                      <line x1="4.4" y1="4.4" x2="6.3" y2="6.3" />
                      <line x1="17.7" y1="17.7" x2="19.6" y2="19.6" />
                      <line x1="4.4" y1="19.6" x2="6.3" y2="17.7" />
                      <line x1="17.7" y1="6.3" x2="19.6" y2="4.4" />
                    </g>
                  </svg>
                ) : (
                  // Moon (crescent)
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" className="text-blue-400" />
                    <circle cx="18" cy="6" r="0.9" fill="currentColor" className="opacity-80" />
                    <circle cx="15.5" cy="8.5" r="0.6" fill="currentColor" className="opacity-60" />
                  </svg>
                )}
              </motion.div>
              <span className="text-sm hidden sm:inline select-none">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </motion.button>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {isClerkAvailable && <ClerkUserLoader />}
            {authComponents && (
              <>
                <authComponents.SignedIn>
                  <authComponents.UserButton afterSignOutUrl="/" />
                </authComponents.SignedIn>
                <authComponents.SignedOut>
                  <authComponents.SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      Sign in
                    </button>
                  </authComponents.SignInButton>
                </authComponents.SignedOut>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={'block px-3 py-2 rounded-md text-base font-medium ' + 
                      (location.pathname === to
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400')
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
