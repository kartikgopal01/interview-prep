'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface PixelDecorationProps {
  type?: 'corner' | 'dot' | 'border' | 'pattern';
  color?: string;
  className?: string;
}

const PixelDecoration: React.FC<PixelDecorationProps> = ({ 
  type = 'corner',
  color = '--pixel-accent',
  className = ''
}) => {
  const { theme } = useTheme();
  const pixelRef = useRef<HTMLDivElement>(null);
  
  // Only render in light mode
  if (theme === 'dark') return null;
  
  // Styling based on decoration type
  let pixelStyle: React.CSSProperties = {};
  
  switch (type) {
    case 'corner':
      pixelStyle = {
        position: 'absolute',
        top: '-4px',
        left: '-4px',
        width: '8px',
        height: '8px',
        backgroundColor: `var(${color})`,
        boxShadow: `
          calc(100% + 0px) 0 0 var(${color}),
          0 calc(100% + 0px) 0 var(${color}),
          calc(100% + 0px) calc(100% + 0px) 0 var(${color})
        `,
        zIndex: 2
      };
      break;
    
    case 'dot':
      pixelStyle = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '8px',
        height: '8px',
        backgroundColor: `var(${color})`,
        boxShadow: `
          -12px 0 0 var(${color}),
          0 12px 0 var(${color}),
          -12px 12px 0 var(${color})
        `,
        zIndex: 2,
        animation: 'pixelPulse 1s infinite alternate'
      };
      break;
    
    case 'border':
      pixelStyle = {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        border: `4px solid var(${color})`,
        zIndex: 2,
        pointerEvents: 'none'
      };
      break;
      
    case 'pattern':
      pixelStyle = {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        width: '12px',
        height: '12px',
        backgroundColor: `var(${color})`,
        boxShadow: `
          -16px 0 0 var(${color}),
          -32px 0 0 var(${color}),
          0 -16px 0 var(${color}),
          -16px -16px 0 var(${color}),
          -32px -16px 0 var(${color})
        `,
        zIndex: 1
      };
      break;
  }
  
  return (
    <div 
      ref={pixelRef} 
      className={`pixel-decoration pixel-${type} ${className}`}
      style={pixelStyle}
    />
  );
};

export default PixelDecoration; 