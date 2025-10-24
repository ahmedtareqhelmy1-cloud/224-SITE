import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * ScrollReveal
 * - Reveals children when scrolled into view
 * - Props: direction ('up'|'down'|'left'|'right'), delay, duration
 */
export default function ScrollReveal({
  children,
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  duration = 0.6,
  once = true,
  className = ''
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-10% 0px -10% 0px', once })

  const dirMap = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 28, y: 0 },
    right: { x: -28, y: 0 }
  }

  const initial = { opacity: 0, ...dirMap[direction] }
  const animate = inView
    ? { opacity: 1, x: 0, y: 0, transition: { duration, delay, ease: [0.22, 0.9, 0.26, 1] } }
    : { opacity: 0, ...dirMap[direction] }

  return (
    <motion.div ref={ref} initial={initial} animate={animate} className={className}>
      <Tag>{children}</Tag>
    </motion.div>
  )
}
