'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface PixelInterviewCardProps {
  children: React.ReactNode;
  className?: string;
  companyColor?: string;
  onClick?: () => void;
}

const PixelInterviewCard: React.FC<PixelInterviewCardProps> = ({
  children,
  className = '',
  companyColor = '#4875e8',
  onClick
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Only apply pixel styles in light mode
  if (theme === 'dark') {
    return <div className={`card-interview ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      className={`card-interview relative ${className}`}
      style={{
        backgroundColor: 'var(--pixel-light)',
        borderRadius: '2px',
        boxShadow: isHovered
          ? `0 0 0 4px var(--pixel-border), 4px 4px 0 0 var(--pixel-shadow)`
          : `0 0 0 4px var(--pixel-border), 8px 8px 0 0 var(--pixel-shadow)`,
        padding: '24px',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translate(2px, 2px)' : 'translate(0, 0)',
        overflow: 'visible',
        color: 'var(--pixel-dark)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Company color accent */}
      <div 
        className="absolute top-0 left-0 h-2 w-full" 
        style={{ 
          backgroundColor: companyColor,
          borderTopLeftRadius: '2px',
          borderTopRightRadius: '2px'
        }} 
      />
      
      {/* Decorative pixels in corners */}
      <div className="absolute top-2 left-0 w-2 h-2" 
        style={{ backgroundColor: companyColor, transform: 'translate(-3px, 0)' }} />
      <div className="absolute top-2 right-0 w-2 h-2" 
        style={{ backgroundColor: companyColor, transform: 'translate(3px, 0)' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2" 
        style={{ backgroundColor: companyColor, transform: 'translate(-3px, 3px)' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2" 
        style={{ backgroundColor: companyColor, transform: 'translate(3px, 3px)' }} />
      
      {/* Score indicator (animated on hover) */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex items-center">
          <div className="w-2 h-2 bg-pixel-green animate-pulse mr-1"></div>
          <div className="w-2 h-2 bg-pixel-green animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-pixel-green animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {children}
    </motion.div>
  );
};

export default PixelInterviewCard; 