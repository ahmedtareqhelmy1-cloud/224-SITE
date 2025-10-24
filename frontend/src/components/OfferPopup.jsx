import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OfferPopup = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('offer_button_dismissed_v1');
    if (!dismissed) setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('offer_button_dismissed_v1', '1');
  };

  const goOffers = () => {
    navigate('/offers');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="fixed left-4 bottom-6 z-40 flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={goOffers}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
          >
            Get Offers
          </motion.button>
          <button
            onClick={handleClose}
            aria-label="Dismiss offers button"
            className="h-8 w-8 grid place-items-center rounded-full bg-black/60 text-white/90 hover:bg-black/80"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;