'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(100, window.innerWidth / 20);
      
      const lightColors = ['#7248E4', '#5FA1EE', '#43C0F6', '#FF61A6', '#FF9676'];
      const darkColors = ['#6c7ae0', '#8a5cf5', '#9d94ff', '#443cb5', '#2c2d6e'];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: theme === 'dark' 
            ? darkColors[Math.floor(Math.random() * darkColors.length)] 
            : lightColors[Math.floor(Math.random() * lightColors.length)]
        });
      }
      
      particlesRef.current = particles;
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.4;
        ctx.fill();
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    animate();
    window.addEventListener('resize', resizeCanvas);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  // Update particle colors when theme changes
  useEffect(() => {
    if (!particlesRef.current.length) return;
    
    const lightColors = ['#7248E4', '#5FA1EE', '#43C0F6', '#FF61A6', '#FF9676'];
    const darkColors = ['#6c7ae0', '#8a5cf5', '#9d94ff', '#443cb5', '#2c2d6e'];
    
    particlesRef.current = particlesRef.current.map(particle => ({
      ...particle,
      color: theme === 'dark' 
        ? darkColors[Math.floor(Math.random() * darkColors.length)] 
        : lightColors[Math.floor(Math.random() * lightColors.length)]
    }));
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
};

export default AnimatedBackground; 