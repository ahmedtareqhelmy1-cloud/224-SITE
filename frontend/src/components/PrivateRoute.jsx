import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // If Clerk is not configured, allow access
  if (!isClerkAvailable) {
    return children;
  }

  // Dynamically import Clerk when needed
  const isAuthenticated = () => {
    try {
      if (window.__clerk_user__) {
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error checking auth state:', err);
      return false;
    }
  };

  return isAuthenticated() ? children : <Navigate to="/sign-in" replace />;
};

export default PrivateRoute;