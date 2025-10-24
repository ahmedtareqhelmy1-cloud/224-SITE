import React from 'react';
import { useUser } from '@clerk/clerk-react';

export function useAdminStatus() {
  const { isLoaded, user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com';
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      setIsAdmin(email === adminEmail);
    } else {
      setIsAdmin(false);
    }
  }, [isLoaded, user]);

  return { isAdmin, isLoaded };
}