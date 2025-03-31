'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  type = 'button'
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Only apply pixel styles in light mode
  if (theme === 'dark') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  // Color variants
  const variants = {
    primary: {
      bg: 'var(--pixel-primary)',
      text: 'white',
      border: '#1a54b8', 
      shadow: '#13408c'
    },
    secondary: {
      bg: 'var(--pixel-secondary)',
      text: 'var(--pixel-dark)',
      border: '#a6afbd',
      shadow: '#7a8292'
    },
    success: {
      bg: '#4caf50',
      text: 'white',
      border: '#359c38',
      shadow: '#26722a'
    },
    danger: {
      bg: '#f44336',
      text: 'white',
      border: '#d32f2f',
      shadow: '#b71c1c'
    }
  };

  const colors = variants[variant];

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={`font-courier font-medium relative ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: '2px',
        boxShadow: isPressed 
          ? `0 0 0 3px ${colors.border}, 0 0 0 0 ${colors.shadow}`
          : `0 0 0 3px ${colors.border}, 4px 4px 0 0 ${colors.shadow}`,
        border: 'none',
        transition: 'all 0.1s ease',
        transform: isPressed ? 'translate(2px, 2px)' : 'translate(-2px, -2px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        fontFamily: "'Courier New', monospace",
        overflow: 'hidden'
      }}
      onClick={!disabled ? onClick : undefined}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => isPressed && setIsPressed(false)}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Button content with icon support */}
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2 flex items-center">{icon}</span>}
        {children}
      </div>
      
      {/* Decorative pixels that appear when button is pressed */}
      {isPressed && (
        <>
          <div className="absolute top-0 left-0 w-1 h-1" style={{ backgroundColor: colors.shadow }} />
          <div className="absolute bottom-0 right-0 w-1 h-1" style={{ backgroundColor: colors.shadow }} />
        </>
      )}
    </motion.button>
  );
};

export default PixelButton; 