'use client'

import { motion } from 'framer-motion'

interface AnimatedWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedWrapper({ children, className, delay = 0 }: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
