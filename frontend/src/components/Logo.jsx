import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import LogoMark from '../assets/products/file.svg';
import { useTheme } from '../app/providers/ThemeProvider';

const Logo = ({ onNavigate }) => {
  const controls = useAnimation();
  const logoRef = useRef(null);
  const pieceRefs = useRef([null, null, null]);
  const { theme } = useTheme ? useTheme() : { theme: 'dark' };

  useEffect(() => {
    animateLogoEntry();
  }, []);

  const animateLogoEntry = async () => {
    // Check if piece images exist
    const hasPieces = pieceRefs.current.every((ref, i) => {
      return ref?.querySelector('img')?.src.includes('piece');
    });

    if (hasPieces) {
      // Animate each piece separately
      pieceRefs.current.forEach((ref, i) => {
        controls.start({
          opacity: 1,
          scale: 1,
          rotate: 0,
          x: 0,
          y: 0,
          transition: {
            duration: 0.72,
            delay: i * 0.06,
            type: 'spring',
            stiffness: 150,
            damping: 12
          }
        });
      });

      // Subtle main logo bounce
      controls.start({
        scale: [0.98, 1.02, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.7, 1],
          ease: 'easeOut'
        }
      });
    } else {
      // Fallback single-image animation
      controls.start({
        scale: [0.94, 1, 1.03, 1],
        rotate: [-8, 0],
        opacity: [0, 1],
        transition: {
          duration: 0.86,
          times: [0, 0.6, 0.8, 1],
          ease: 'easeOut'
        }
      });
    }
  };

  const animateLogoTransition = async () => {
    await controls.start({
      x: [-28, 28, 0],
      skewX: [4, -2, 0],
      opacity: [0.7, 1, 1],
      transition: {
        duration: 0.72,
        times: [0.3, 0.6, 1],
        ease: [0.2, 0.9, 0.25, 1]
      }
    });
  };

  return (
    <div className="logo-wrap flex items-center" ref={logoRef} aria-label="224. brand logo" title="224.">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/80 shadow-sm backdrop-blur flex items-center justify-center overflow-hidden">
        <motion.img
          src={LogoMark}
          alt="224."
          className="w-full h-full object-contain select-none filter brightness-0 dark:invert"
          style={{ WebkitUserDrag: 'none', filter: theme==='dark' ? 'invert(1) drop-shadow(0 0 1.5px rgba(255,255,255,0.35))' : 'brightness(0) drop-shadow(0 0 1.5px rgba(0,0,0,0.5))' }}
          animate={controls}
        />
      </div>
    </div>
  );
};

export default Logo;