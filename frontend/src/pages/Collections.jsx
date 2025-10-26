import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const collections = [
  { key: 'new-drop', title: 'New Drop', desc: 'Latest arrivals crafted for the season', image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop' },
  { key: 'street-core', title: 'Street Core', desc: 'Urban silhouettes and heavy textures', image: 'https://images.unsplash.com/photo-1520975614082-2c66f7d2a9d1?q=80&w=1200&auto=format&fit=crop' },
  { key: 'minimal', title: 'Minimal', desc: 'Clean lines, timeless cuts', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop' }
];

export default function Collections(){
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold">Collections</h1>
        <p className="text-secondary">Explore seasonal concepts and core lines.</p>
      </div>
      <div className="row g-4">
        {collections.map((c)=> (
          <div className="col-12 col-lg-4" key={c.key}>
            <motion.div whileHover={{ y: -6 }} className="card border-0 shadow-sm overflow-hidden">
              <div className="ratio ratio-4x3">
                <img src={c.image} alt={c.title} className="w-100 h-100 object-fit-cover" />
              </div>
              <div className="card-body">
                <h5 className="card-title fw-bold">{c.title}</h5>
                <p className="card-text text-secondary">{c.desc}</p>
                <Link to="/shop" className="btn btn-dark">Shop {c.title}</Link>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
