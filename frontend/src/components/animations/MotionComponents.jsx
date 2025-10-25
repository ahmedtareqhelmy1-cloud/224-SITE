import React from 'react';
import { motion } from 'framer-motion';

const transition = {
  type: "spring",
  stiffness: 200,
  damping: 20
};

const variants = {
  initial: { scale: 0.96, opacity: 0 },
  enter: { scale: 1, opacity: 1, transition },
  hover: { 
    scale: 1.03,
    transition: { ...transition, duration: 0.3 }
  },
  tap: { scale: 0.98 },
  exit: { scale: 0.96, opacity: 0 }
};

export const MotionButton = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <motion.button
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled}
      className={`${className} transform-gpu`} // Use GPU acceleration
    >
      {children}
    </motion.button>
  );
};

export const MotionCard = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      whileHover="hover"
      className={`${className} transform-gpu`}
    >
      {children}
    </motion.div>
  );
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    type: "spring",
    stiffness: 500,
    damping: 50
  }
};