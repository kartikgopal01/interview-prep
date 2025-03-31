'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0, transformOrigin: 'top' }}
          exit={{ scaleY: 1, transformOrigin: 'bottom' }}
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 