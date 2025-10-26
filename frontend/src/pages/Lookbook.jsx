import React from 'react';
import { motion } from 'framer-motion';

export default function Lookbook(){
  const photos = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519744346366-66f9087b30e1?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548883354-94bcfe321c25?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop'
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold">Lookbook</h1>
        <p className="text-secondary">Selected moments from our lens — hover to feel the motion.</p>
      </div>
      <div className="row g-4">
        {photos.map((src, i)=> (
          <div className="col-12 col-sm-6 col-lg-4" key={i}>
            <motion.div whileHover={{ y: -6, scale: 1.01 }} className="card border-0 shadow-sm overflow-hidden">
              <div className="ratio ratio-4x3">
                <img src={src} alt="Lookbook" className="w-100 h-100 object-fit-cover" />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
