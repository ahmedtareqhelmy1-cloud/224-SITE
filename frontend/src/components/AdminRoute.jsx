import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function AdminRoute({ children, isAdmin }) {
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!isClerkAvailable) {
    // If Clerk isn't configured, allow access (dev mode)
    return children;
  }

  const { isLoaded, isSignedIn, user } = useUser();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com';
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn || userEmail !== adminEmail) {
    return <Navigate to="/" replace />;
  }

  return children;
}