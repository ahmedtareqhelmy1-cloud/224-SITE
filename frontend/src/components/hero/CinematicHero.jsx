import React from 'react'
import { motion } from 'framer-motion'

export default function CinematicHero(){
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(1200px 400px at 20% 20%, rgba(255,255,255,0.08), transparent), radial-gradient(900px 300px at 80% 80%, rgba(255,255,255,0.05), transparent)'
      }} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{y:20, opacity:0}}
              animate={{y:0, opacity:1}}
              transition={{duration:0.6}}
              className="text-5xl md:text-6xl font-extrabold tracking-tight"
            >224 Studios</motion.h1>
            <motion.p
              initial={{y:20, opacity:0}}
              animate={{y:0, opacity:1}}
              transition={{delay:0.15, duration:0.6}}
              className="mt-4 text-lg text-white/70 max-w-prose"
            >Luxury streetwear engineered for everyday performance. Precision fabrics. Intentional silhouettes. Built in Egypt for the world.</motion.p>
            <motion.div
              initial={{y:20, opacity:0}}
              animate={{y:0, opacity:1}}
              transition={{delay:0.25, duration:0.6}}
              className="mt-7 flex gap-3"
            >
              <a href={import.meta.env.BASE_URL + 'shop'} className="px-5 py-3 rounded-lg bg-white text-black hover:bg-zinc-200 transition">Shop Now</a>
              <a href={import.meta.env.BASE_URL + 'collections'} className="px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">Collections</a>
            </motion.div>
          </div>
          <div>
            <motion.div
              initial={{scale:1.05, opacity:0}}
              animate={{scale:1, opacity:1}}
              transition={{duration:0.8}}
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.08)]"
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-zinc-900 to-black">
                <img src="https://images.unsplash.com/photo-1503342217505-b0a15cf70489?w=1600" alt="Hero" className="w-full h-full object-cover mix-blend-lighten" />
              </div>
              <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(to top, rgba(0,0,0,0.6), transparent 40%)'}} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
