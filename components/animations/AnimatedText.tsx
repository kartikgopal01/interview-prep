'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  animated?: boolean;
  glowEffect?: boolean;
}

const MotionComponents = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
};

export default function AnimatedText({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  as = 'p',
  animated = true,
  glowEffect = false
}: AnimatedTextProps) {
  const baseStyles = cn(
    className,
    glowEffect && 'cyber-text'
  );
  
  const MotionComponent = MotionComponents[as];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: 0.025,
        delayChildren: delay,
      },
    },
  };
  
  // For character-by-character animation
  const characterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  
  // If we want to animate text character by character
  if (animated && typeof children === 'string') {
    return (
      <motion.div
        className={baseStyles}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from(children).map((char, index) => (
          <motion.span key={index} variants={characterVariants}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  // For simple fade-in animation of the entire text
  return (
    <MotionComponent
      className={baseStyles}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionComponent>
  );
} 