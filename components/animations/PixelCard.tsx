import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { PixelDecoration } from '.';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  interactive?: boolean;
}

const PixelCard: React.FC<PixelCardProps> = ({
  children,
  className = '',
  variant = 'primary',
  interactive = true,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Only apply pixel styles in light mode
  if (theme === 'dark') {
    return <div className={className}>{children}</div>;
  }

  // Define color variants
  const colorMap = {
    primary: {
      bg: 'var(--pixel-light)',
      border: 'var(--pixel-border)',
      shadow: 'var(--pixel-shadow)',
      accent: 'var(--pixel-accent)'
    },
    secondary: {
      bg: 'var(--pixel-secondary)',
      border: 'var(--pixel-border)',
      shadow: 'var(--pixel-shadow)',
      accent: 'var(--pixel-primary)'
    },
    accent: {
      bg: 'var(--pixel-primary)',
      border: 'var(--pixel-dark)',
      shadow: 'rgba(0,0,0,0.3)',
      accent: 'var(--pixel-accent)'
    }
  };

  const colors = colorMap[variant];
  
  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        backgroundColor: colors.bg,
        borderRadius: '2px',
        boxShadow: `0 0 0 4px ${colors.border}, 8px 8px 0 0 ${colors.shadow}`,
        padding: '24px',
        transition: 'all 0.2s ease',
        transform: isHovered && interactive ? 'translate(4px, 4px)' : 'translate(0, 0)',
        overflow: 'visible'
      }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Decorative pixels in corners */}
      <div className="absolute top-0 left-0 w-2 h-2" 
        style={{ backgroundColor: colors.accent, transform: 'translate(-3px, -3px)' }} />
      <div className="absolute top-0 right-0 w-2 h-2" 
        style={{ backgroundColor: colors.accent, transform: 'translate(3px, -3px)' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2" 
        style={{ backgroundColor: colors.accent, transform: 'translate(-3px, 3px)' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2" 
        style={{ backgroundColor: colors.accent, transform: 'translate(3px, 3px)' }} />
      
      {/* Add decorative pixel patterns */}
      {isHovered && (
        <>
          <PixelDecoration type="dot" color="--pixel-green" className="absolute top-4 right-4" />
          <PixelDecoration type="dot" color="--pixel-blue" className="absolute bottom-4 left-4" />
        </>
      )}
      
      {children}
    </motion.div>
  );
};

export default PixelCard; 