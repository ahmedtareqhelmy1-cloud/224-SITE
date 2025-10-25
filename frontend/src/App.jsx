import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from './features/products/productsSlice';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { AppRoutes } from './routes/AppRoutes';
import Navbar from './components/Navbar';
import LiveBackground from './components/LiveBackground';
import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';
import Newsletter from './components/Newsletter';
import OfferPopup from './components/OfferPopup';
import { useAdminStatus } from './components/AdminCheck';

export default function App() {
  const dispatch = useDispatch();
  const { isAdmin } = useAdminStatus();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <OfferPopup />

        <div className="relative">
          {/* live animated background */}
          <LiveBackground />
          <CustomCursor />

          <main className="flex-grow relative">
            <AppRoutes isAdmin={isAdmin} />
          </main>
        </div>

        {/* spacer to prevent fixed newsletter from covering content */}
        <div className="h-24" />
        <Newsletter fixed />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
