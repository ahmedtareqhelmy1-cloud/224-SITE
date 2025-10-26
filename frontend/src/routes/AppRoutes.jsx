import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Profile from '../pages/Profile';
import AdminPanel from '../pages/AdminPanel';
import CustomDesign from '../pages/CustomDesign';
import Contact from '../pages/Contact';
import Offers from '../pages/Offers';
import DynamicPage from '../pages/DynamicPage';
import Lookbook from '../pages/Lookbook';
import Collections from '../pages/Collections';
import OurStory from '../pages/OurStory';
import Tshirts from '../pages/shop/Tshirts';
import Pants from '../pages/shop/Pants';
import Accessories from '../pages/shop/Accessories';
import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';
import PageTransition from '../components/PageTransition';

// AppRoutes is a React component that conditionally adds Clerk auth routes
// after importing Clerk at runtime (no top-level await).
export const AppRoutes = React.memo(({ isAdmin }) => {
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const [AuthComponents, setAuthComponents] = useState({ SignIn: null, SignUp: null });
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const loadClerkComponents = async () => {
      if (!isClerkAvailable || !mounted) return;
      
      try {
        const mod = await import('@clerk/clerk-react');
        if (!mounted) return;
        setAuthComponents({
          SignIn: mod.SignIn,
          SignUp: mod.SignUp
        });
      } catch (err) {
        console.warn('Error loading Clerk components:', err);
      }
    };

    loadClerkComponents();
    return () => { mounted = false; };
  }, [isClerkAvailable]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/offers" element={<PageTransition><Offers /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
        <Route path="/p/:slug" element={<PageTransition><DynamicPage /></PageTransition>} />
        <Route path="/shop/tshirts" element={<PageTransition><Tshirts /></PageTransition>} />
        <Route path="/shop/pants" element={<PageTransition><Pants /></PageTransition>} />
        <Route path="/shop/accessories" element={<PageTransition><Accessories /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        {/* Guest checkout enabled: removed auth gate */}
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/profile" element={<PrivateRoute><PageTransition><Profile /></PageTransition></PrivateRoute>} />
        <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
        <Route path="/collections" element={<PageTransition><Collections /></PageTransition>} />
        <Route path="/story" element={<PageTransition><OurStory /></PageTransition>} />
        <Route path="/admin/*" element={<AdminRoute isAdmin={isAdmin}><PageTransition><AdminPanel /></PageTransition></AdminRoute>} />
        <Route path="/custom-design" element={<PageTransition><CustomDesign /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        {isClerkAvailable && AuthComponents.SignIn && (
          <Route path="/sign-in/*" element={<PageTransition><AuthComponents.SignIn routing="path" path="/sign-in" /></PageTransition>} />
        )}
        {isClerkAvailable && AuthComponents.SignUp && (
          <Route path="/sign-up/*" element={<PageTransition><AuthComponents.SignUp routing="path" path="/sign-up" /></PageTransition>} />
        )}
      </Routes>
    </AnimatePresence>
  );
});