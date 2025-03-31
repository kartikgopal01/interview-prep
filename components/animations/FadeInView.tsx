'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

const getAnimationProps = (direction: string, distance: number) => {
  const initialY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const initialX = direction === 'left' ? distance : direction === 'right' ? -distance : 0;
  
  return {
    initial: { 
      opacity: 0, 
      y: initialY,
      x: initialX,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      x: 0,
    },
    exit: { 
      opacity: 0, 
      y: direction === 'up' ? -distance/2 : direction === 'down' ? distance/2 : 0,
      x: direction === 'left' ? -distance/2 : direction === 'right' ? distance/2 : 0,
    },
  };
};

export default function FadeInView({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  className = '',
  direction = 'up',
  distance = 20
}: FadeInViewProps) {
  const animationProps = getAnimationProps(direction, distance);
  
  return (
    <motion.div
      className={className}
      {...animationProps}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for futuristic feel
      }}
    >
      {children}
    </motion.div>
  );
} 