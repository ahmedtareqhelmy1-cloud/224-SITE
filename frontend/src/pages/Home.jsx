import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ScrollReveal from '../components/animations/ScrollReveal';
import ParallaxLayer from '../components/animations/ParallaxLayer';
import LogoMark from '../assets/products/file.svg';
import CinematicHero from '../components/hero/CinematicHero';
import MarqueeBand from '../components/sections/MarqueeBand';

export const Home = () => {
  const products = useSelector(state => state.products.items);
  const tshirts = products.filter(p=> (p.category||'').includes('tshirt')).slice(0,8);
  const pants = products.filter(p=> (p.category||'').includes('pant')).slice(0,8);
  const featured = (products || []).slice(0,8);
  const trending = (products || []).filter(p=> p.salePrice || p.discount || p.isOnSale).slice(0,8);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* Cinematic hero + marquee band */}
      <CinematicHero />
      <MarqueeBand />

      {/* T-Shirts Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <ScrollReveal as="h2" direction="up" className="text-3xl font-bold text-gray-900 dark:text-white">T‑Shirts</ScrollReveal>
          <Link to="/shop/tshirts" className="text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tshirts.map(product => (<ProductCard key={product.id} product={product} />))}
        </motion.div>
      </section>

      {/* Featured Section */}
      <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <ScrollReveal as="h2" direction="up" className="text-3xl font-bold text-gray-900 dark:text-white">Featured</ScrollReveal>
          <Link to="/shop" className="text-blue-600 dark:text-blue-400 hover:underline">Shop All</Link>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (<ProductCard key={product.id} product={product} />))}
        </motion.div>
      </section>

      {/* Pants Section */}
      <section className="py-4 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <ScrollReveal as="h2" direction="up" className="text-3xl font-bold text-gray-900 dark:text-white">Pants</ScrollReveal>
          <Link to="/shop/pants" className="text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pants.map(product => (<ProductCard key={product.id} product={product} />))}
        </motion.div>
      </section>

      {/* Trending Section */}
      {!!trending.length && (
        <section className="py-4 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <ScrollReveal as="h2" direction="up" className="text-3xl font-bold text-gray-900 dark:text-white">Trending Now</ScrollReveal>
            <Link to="/offers" className="text-blue-600 dark:text-blue-400 hover:underline">View Offers</Link>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trending.map(product => (<ProductCard key={product.id} product={product} />))}
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">🚚</div>
                <motion.h3
                  className="text-2xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#A78BFA]"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundSize: '200% 200%', textShadow: '0 0 14px rgba(236,72,153,0.35), 0 0 28px rgba(59,130,246,0.25)' }}
                >
                  Free Shipping
                </motion.h3>
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: [0.85,1,0.9,0.85] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ textShadow: '0 0 8px rgba(59,130,246,0.25)' }}
                >
                  On orders over 2999 EGP
                </motion.p>
              </motion.div>
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">🔄</div>
                <motion.h3
                  className="text-2xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#A78BFA]"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  style={{ backgroundSize: '200% 200%', textShadow: '0 0 14px rgba(56,189,248,0.35), 0 0 28px rgba(168,85,247,0.25)' }}
                >
                  Easy Returns
                </motion.h3>
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: [0.85,1,0.9,0.85] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  style={{ textShadow: '0 0 8px rgba(56,189,248,0.25)' }}
                >
                  14-day return policy
                </motion.p>
              </motion.div>
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">🛡️</div>
                <motion.h3
                  className="text-2xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[#111827] via-[#4C1D95] to-[#A78BFA]"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  style={{ backgroundSize: '200% 200%', textShadow: '0 0 14px rgba(16,185,129,0.35), 0 0 28px rgba(34,211,238,0.25)' }}
                >
                  Secure Payment
                </motion.h3>
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: [0.85,1,0.9,0.85] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  style={{ textShadow: '0 0 8px rgba(16,185,129,0.25)' }}
                >
                  100% secure payment
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter removed from Home to avoid duplication (kept global `Newsletter` component in `App.jsx`) */}
    </motion.div>
  );
}

function HeroTitle() {
  const full = 'Wear Confidence. Feel 224.';
  const [text, setText] = useState('');

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setText(full.slice(0, i));
      i++;
      if (i > full.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-md">{text}<span className="inline-block w-1 h-8 bg-white ml-2 animate-pulse align-middle" /></h1>
  );
}


