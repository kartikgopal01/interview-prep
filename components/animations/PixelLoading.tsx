'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface PixelLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  onComplete?: () => void;
}

const PixelLoading: React.FC<PixelLoadingProps> = ({
  isLoading = true,
  loadingText = "Loading...",
  onComplete
}) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(0);
  
  // Only apply pixel styles in light mode
  if (theme === 'dark') {
    return null;
  }
  
  useEffect(() => {
    if (!isLoading) {
      if (onComplete) onComplete();
      return;
    }
    
    // Simulate random progress increments
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 5 + (100 - prev) * 0.02;
        const newValue = Math.min(prev + increment, 100);
        
        // Call onComplete when progress reaches 100%
        if (newValue >= 100 && onComplete) {
          clearInterval(interval);
          onComplete();
        }
        
        return newValue;
      });
    }, 200);
    
    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 300);
    
    return () => {
      clearInterval(interval);
      clearInterval(dotsInterval);
    };
  }, [isLoading, onComplete]);
  
  // Don't render if not loading
  if (!isLoading) return null;
  
  return (
    <div className="flex flex-col items-center">
      {/* Loading text with animated dots */}
      <div 
        className="mb-4 text-lg font-courier" 
        style={{ 
          color: 'var(--pixel-dark)',
          fontFamily: "'Courier New', monospace",
          textShadow: '1px 1px 0 var(--pixel-shadow)'
        }}
      >
        {loadingText}{'.'.repeat(dots)}
      </div>
      
      {/* Progress bar container */}
      <div 
        className="w-full max-w-md h-6 mb-2 relative"
        style={{
          border: '3px solid var(--pixel-border)',
          boxShadow: '3px 3px 0 var(--pixel-shadow)',
          backgroundColor: 'var(--pixel-light)',
          borderRadius: '2px',
          padding: '2px'
        }}
      >
        {/* Actual progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut" }}
          style={{
            height: '100%',
            backgroundColor: progress < 50 
              ? 'var(--pixel-green)' 
              : progress < 80 
                ? 'var(--pixel-yellow)' 
                : 'var(--pixel-primary)',
            backgroundImage: `
              linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                transparent 75%
              )
            `,
            backgroundSize: '16px 16px',
            borderRadius: '1px'
          }}
        />
        
        {/* Percentage indicator */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
          style={{
            color: progress > 70 ? 'white' : 'var(--pixel-dark)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            fontFamily: "'Courier New', monospace",
            mixBlendMode: 'difference'
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
      
      {/* Little pixel decorations */}
      <div className="flex gap-3 mt-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: i % 2 === 0 ? 'var(--pixel-primary)' : 'var(--pixel-accent)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelLoading; 