'use client'

import React from 'react'
import { motion } from 'motion/react'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li'
}

export const Reveal: React.FC<Props> = ({ children, className, delay = 0, as = 'div' }) => {
  const MotionTag = as === 'li' ? motion.li : motion.div

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
