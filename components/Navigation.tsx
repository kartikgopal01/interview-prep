'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };
  
  const navigationItems = [
    { name: 'AI Interviews', path: '/' },
    { name: 'Peer Interviews', path: '/peer-interview' },
  ];

  // Menu animation variants
  const menuVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      clipPath: 'inset(0% 0% 100% 0%)',
    },
    visible: { 
      opacity: 1, 
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delayChildren: 0.1,
        staggerChildren: 0.05
      } 
    },
    exit: { 
      opacity: 0,
      y: -10,
      clipPath: 'inset(0% 0% 100% 0%)',
      transition: { 
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    hover: {
      scale: 1.05,
      x: 5,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    },
    tap: {
      scale: 0.95
    }
  };
  
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 
        'backdrop-blur-xl bg-white/75 dark:bg-gray-900/85 shadow-lg' : 
        'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 md:px-8 py-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {navigationItems.map((item) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.43, 0.13, 0.23, 0.96] 
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  href={item.path}
                  className={`relative px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-500'
                      : 'text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.div 
                      layoutId="underline"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* Hamburger Menu Button */}
          <motion.button
            className="md:hidden relative w-10 h-10 flex items-center justify-center z-20 overflow-hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative flex flex-col justify-center items-center w-6 h-6">
              <motion.span 
                className="absolute h-0.5 w-6 rounded-full bg-gray-700 dark:bg-gray-200 transform"
                animate={{ 
                  rotate: isMenuOpen ? 45 : 0,
                  translateY: isMenuOpen ? 0 : -8,
                  width: isMenuOpen ? 24 : 24
                }}
                transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
              />
              
              <motion.span 
                className="absolute h-0.5 w-6 rounded-full bg-gray-700 dark:bg-gray-200"
                animate={{ 
                  opacity: isMenuOpen ? 0 : 1,
                  width: isMenuOpen ? 0 : 16,
                  translateX: isMenuOpen ? 20 : 0
                }}
                transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
              />
              
              <motion.span 
                className="absolute h-0.5 w-6 rounded-full bg-gray-700 dark:bg-gray-200 transform"
                animate={{ 
                  rotate: isMenuOpen ? -45 : 0,
                  translateY: isMenuOpen ? 0 : 8,
                  width: isMenuOpen ? 24 : 20
                }}
                transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              className="md:hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/95 rounded-b-3xl overflow-hidden fixed left-0 right-0 top-[60px] border-t border-gray-200/20 dark:border-gray-700/20 shadow-2xl"
            >
              <motion.div 
                className="flex flex-col py-6 px-8 space-y-5 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {navigationItems.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href={item.path}
                      className={`block py-3 px-5 rounded-xl transition-all ${
                        isActive(item.path)
                          ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-400 shadow-md shadow-blue-500/20'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/10 to-blue-500/5 rounded-full blur-2xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation; 