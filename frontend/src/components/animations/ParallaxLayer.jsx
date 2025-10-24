import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * ParallaxLayer
 * - Translates children vertically with the page scroll.
 * - speed: positive moves with scroll (slower/faster), negative moves opposite.
 * - strength controls the max offset range.
 */
export default function ParallaxLayer({
  children,
  className = '',
  speed = 0.2,
  strength = 80,
  style = {},
}) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, speed * strength])

  return (
    <motion.div style={{ y, willChange: 'transform', ...style }} className={className}>
      {children}
    </motion.div>
  )
}
