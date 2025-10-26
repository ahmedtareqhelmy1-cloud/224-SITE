import React from 'react';
import { motion } from 'framer-motion';

export default function OurStory(){
  return (
    <div className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-lg-6">
          <motion.h1 className="display-5 fw-bold mb-3" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>Our Story</motion.h1>
          <motion.p className="lead text-secondary" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>
            Born from street culture and engineered for everyday performance, 224 Studios crafts garments that
            blend comfort, detail, and attitude. We obsess over fabric, silhouette, and finish to deliver 
            pieces that feel effortless yet intentional.
          </motion.p>
          <motion.p className="text-secondary" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}>
            Designed in Egypt. Built for the world.
          </motion.p>
        </div>
        <div className="col-lg-6">
          <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1400&auto=format&fit=crop" alt="Studio" className="w-100 h-100 object-fit-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
