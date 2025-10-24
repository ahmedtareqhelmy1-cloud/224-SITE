import React from 'react';
import { motion } from 'framer-motion';

export default function DynamicText({ leftText = '', rightText = '' }) {
  const leftVariants = {
    hidden: { x: -200, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 12 } }
  };
  const rightVariants = {
    hidden: { x: 200, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 12 } }
  };

  return (
    <div className="pointer-events-none dynamic-text z-10 fixed inset-0 flex items-center justify-between px-6">
      <motion.div initial="hidden" animate="visible" variants={leftVariants} className="hidden md:block text-3xl lg:text-4xl font-extrabold text-white/10 tracking-tight">
        {leftText}
      </motion.div>
      <motion.div initial="hidden" animate="visible" variants={rightVariants} className="hidden md:block text-3xl lg:text-4xl font-extrabold text-white/10 tracking-tight text-right">
        {rightText}
      </motion.div>
    </div>
  );
}
