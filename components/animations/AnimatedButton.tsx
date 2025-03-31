'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hoverScale?: number;
  glowOnHover?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  hoverScale = 1.03,
  glowOnHover = true,
  onClick,
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {
  const baseStyles = cn(
    'relative overflow-hidden rounded-full font-bold transition-all duration-300',
    {
      'bg-primary-200 text-dark-100': variant === 'primary',
      'bg-dark-200 text-primary-200': variant === 'secondary',
      'bg-transparent hover:bg-dark-200/20': variant === 'ghost',
      'px-4 py-2 text-sm': size === 'sm',
      'px-5 py-2.5 text-base': size === 'md',
      'px-7 py-3 text-lg': size === 'lg',
      'opacity-50 cursor-not-allowed': disabled,
    },
    glowOnHover && !disabled && 'hover:shadow-glow',
    className
  );

  return (
    <motion.button
      className={baseStyles}
      whileHover={!disabled ? { scale: hoverScale } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {variant !== 'ghost' && !disabled && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: 0.3 }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 1.5,
            ease: 'linear',
            delay: Math.random() * 2
          }}
        />
      )}
      {children}
    </motion.button>
  );
} 