'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'glow' | 'lift' | 'tilt' | 'none';
  delay?: number;
}

export default function AnimatedCard({
  children,
  className = '',
  hoverEffect = 'tilt',
  delay = 0,
}: AnimatedCardProps) {
  const baseStyles = cn(
    'relative overflow-hidden dark-gradient rounded-2xl border border-primary-200/10 backdrop-blur-sm',
    className
  );

  // Different animation variants based on hoverEffect
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case 'glow':
        return { 
          boxShadow: '0 0 15px 2px rgba(202, 197, 254, 0.3)',
          scale: 1.02 
        };
      case 'lift':
        return { 
          y: -10,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        };
      case 'tilt':
        return {
          rotateX: 5,
          rotateY: 5,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        }
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={baseStyles}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay
      }}
      whileHover={getHoverAnimation()}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-2xl z-0 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'linear-gradient(to right, #4B4D4F, #4B4D4F33, #CAC5FE)',
          filter: 'blur(5px)',
        }}
      />
      {children}
    </motion.div>
  );
} 