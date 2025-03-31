'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FuturisticSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export default function FuturisticSpinner({
  size = 'md',
  className = '',
  color = 'primary',
}: FuturisticSpinnerProps) {
  const baseStyles = cn(
    'relative',
    {
      'h-6 w-6': size === 'sm',
      'h-10 w-10': size === 'md',
      'h-16 w-16': size === 'lg',
    },
    className
  );

  const getColor = () => {
    switch (color) {
      case 'primary':
        return 'rgba(202, 197, 254, 1)';
      case 'secondary':
        return 'rgba(214, 224, 255, 1)';
      case 'white':
        return 'rgba(255, 255, 255, 1)';
      default:
        return 'rgba(202, 197, 254, 1)';
    }
  };

  const spinnerColor = getColor();
  
  return (
    <div className={baseStyles}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: spinnerColor,
          borderLeftColor: spinnerColor,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-transparent"
        style={{
          borderBottomColor: spinnerColor,
          borderRightColor: spinnerColor,
          opacity: 0.7,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.8,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      
      {/* Center dot */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          width: size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px',
          height: size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px',
          backgroundColor: spinnerColor,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    </div>
  );
} 