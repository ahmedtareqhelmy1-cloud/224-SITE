import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ScrollReveal from '../components/animations/ScrollReveal';
import ParallaxLayer from '../components/animations/ParallaxLayer';
import LogoMark from '../assets/products/file.svg';

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
      {/* Hero Section */}
      <motion.section 
        className="relative h-[80vh] bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Bold background: moving fabric + animated brand mark */}
        <ParallaxLayer speed={0.06} strength={140}>
          <video src={`${import.meta.env.BASE_URL || '/'}videos/hero-fabric.mp4`} autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-60" />
        </ParallaxLayer>
        {/* Living circular stage + brand mark (animated) */}
        <ParallaxLayer speed={-0.02} strength={60}>
          {/* Pulsing circular stage */}
          <motion.div
            className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '72vw', height: '72vw',
              background: 'radial-gradient(closest-side, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 60%, transparent 70%)',
              boxShadow: '0 0 140px rgba(255,255,255,0.06) inset, 0 0 160px rgba(0,0,0,0.5) inset'
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{
              scale: [0.96, 1.02, 0.98, 1],
              opacity: [0.14, 0.2, 0.16, 0.18]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </ParallaxLayer>
        {/* Brand mark floating within the stage */}
        <ParallaxLayer speed={-0.01} strength={40}>
          <motion.img
            src={LogoMark}
            alt="brand-bg"
            className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58vw] md:w-[42vw]"
            style={{ WebkitUserDrag:'none', filter: 'brightness(0) invert(1) drop-shadow(0 0 24px rgba(255,255,255,0.10))' }}
            initial={{ scale: 0.95, rotate: -1.2, y: 0, opacity: 0 }}
            animate={{
              scale: 1,
              rotate: [-1.2, 1.2, -1.2],
              y: [-8, 6, -8],
              opacity: [0.14, 0.22, 0.18]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.05} strength={90}>
          <div className="absolute inset-0 bg-black/25" />
        </ParallaxLayer>
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="text-white max-w-3xl">
            <ScrollReveal as="div" direction="left">
              <HeroTitle />
            </ScrollReveal>
            {/* Subline stays on top of animated background */}
            <ScrollReveal as="p" direction="right" delay={0.08} className="text-lg md:text-xl mb-8 text-gray-200/80">
              Designed Beyond Reality — premium streetwear crafted with care.
            </ScrollReveal>
            <ScrollReveal as="div" direction="up" delay={0.16}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/shop" className="inline-block bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:scale-105 transition-transform">
                  Shop Now
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </motion.section>

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


