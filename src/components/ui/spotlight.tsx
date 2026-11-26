import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({ className, fill = 'white' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const mouseX = useSpring(mousePosition.x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(mousePosition.y, { stiffness: 100, damping: 30 });

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.05), transparent 80%)`
  );

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute inset-0 z-30 transition-opacity duration-300',
        className
      )}
      style={{ background }}
    />
  );
};
