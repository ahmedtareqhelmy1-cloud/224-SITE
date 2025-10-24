import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme-224') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    return savedTheme;
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';
    overlay.style.background = newTheme === 'dark' ? '#000' : '#fff';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.45s var(--ease)';
    document.body.appendChild(overlay);

    // Animate transition
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.06';
      setTimeout(() => {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        setTheme(newTheme);
        localStorage.setItem('theme-224', newTheme);
        
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      }, 260);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};