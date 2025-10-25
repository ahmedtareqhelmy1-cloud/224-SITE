import { ClerkProvider as Clerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const ClerkProvider = ({ children }) => {
  const navigate = useNavigate();
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <Clerk
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
    >
      {children}
    </Clerk>
  );
};

export default ClerkProvider;