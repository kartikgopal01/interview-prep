'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };
  
  const navigationItems = [
    { name: 'AI Interviews', path: '/' },
    { name: 'Peer Interviews', path: '/peer-interview' },
  ];
  
  return (
    <nav className="mb-6 ">
      <div className="flex justify-between items-center px-4 md:justify-center">
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-2 transition-colors ${
                isActive(item.path)
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } md:hidden flex-col border-b border-gray-200 dark:border-gray-700 mb-4`}
      >
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`px-4 py-2 transition-colors ${
              isActive(item.path)
                ? 'text-blue-500'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation; 