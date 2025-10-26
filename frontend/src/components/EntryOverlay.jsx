import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LS_KEY = 'cavee_entry_seen_v1';

export default function EntryOverlay(){
  const [show, setShow] = useState(false);

  useEffect(()=>{
    try{
      const v = localStorage.getItem(LS_KEY);
      if(!v){ setShow(true); }
    }catch{}

    const t = setTimeout(()=> dismiss(), 2500);
    return ()=> clearTimeout(t);
  },[]);

  function dismiss(){
    try{ localStorage.setItem(LS_KEY,'1'); }catch{}
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          {/* Gradient bloom */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(167,139,250,0.18) 0%, rgba(236,72,153,0.12) 25%, rgba(0,0,0,0.85) 70%)'
          }} />

          {/* Animated logo/text */}
          <motion.div
            className="relative text-center text-white select-none"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.2,0.9,0.25,1] }}
          >
            <motion.div
              className="mx-auto mb-4 w-[220px] h-[220px] rounded-full backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden"
              initial={{ rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.9 }}
              style={{ boxShadow: '0 0 80px rgba(167,139,250,0.25), inset 0 0 120px rgba(255,255,255,0.06)' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-black tracking-wide"
                style={{ textShadow: '0 0 24px rgba(167,139,250,0.45), 0 0 48px rgba(236,72,153,0.35)' }}
              >
                224
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ letterSpacing: '0.35em', opacity: 0 }}
              animate={{ letterSpacing: '0.05em', opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="uppercase text-sm tracking-widest text-white/80"
            >
              Studios
            </motion.div>

            {/* Shine sweep */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0,1,0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
              style={{ width: '80vw', height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
            />

            <motion.button
              onClick={dismiss}
              className="mt-6 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
