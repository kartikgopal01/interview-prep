'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Mounted check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Create pixel art sun for light mode
  const PixelSun = () => (
    <div className="pixel-sun" style={{
      width: '24px',
      height: '24px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '8px',
        height: '8px',
        backgroundColor: '#FFD866'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '8px',
        width: '8px',
        height: '4px',
        backgroundColor: '#FFD866'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '8px',
        width: '8px',
        height: '4px',
        backgroundColor: '#FFD866'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '4px',
        width: '4px',
        height: '8px',
        backgroundColor: '#FFD866'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '12px',
        width: '4px',
        height: '8px',
        backgroundColor: '#FFD866'
      }}></div>
    </div>
  );

  // Different styles for light and dark mode
  const buttonClass = theme === 'dark' 
    ? "relative flex items-center justify-center w-12 h-12 transition-colors p-2 dark:bg-dark-200/40 dark:hover:bg-dark-200/60" 
    : "theme-toggle relative flex items-center justify-center w-12 h-12 transition-colors p-2";

  return (
    <motion.button
      aria-label="Toggle theme"
      className={buttonClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: theme === 'dark' ? 1.05 : 1.00 }}
      whileTap={{ 
        scale: theme === 'dark' ? 0.95 : 1.00, 
        y: theme === 'dark' ? 0 : 4, 
        x: theme === 'dark' ? 0 : 4,
        transition: { duration: 0.1 }
      }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        // Dark mode - use regular icons
        <>
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Moon className="h-6 w-6 text-blue-400" />
          </motion.div>
        </>
      ) : (
        // Light mode - use pixel art style
        <>
          {/* Custom pixel art sun */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.1, type: 'tween' }}
          >
            <PixelSun />
          </motion.div>
          
          {/* Pixel decoration */}
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <div className="absolute top-0 left-0 w-2 h-2 bg-pixel-accent"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-pixel-accent"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-pixel-accent"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-pixel-accent"></div>
            </motion.div>
          )}
        </>
      )}
    </motion.button>
  );
};

export default ThemeToggle; 