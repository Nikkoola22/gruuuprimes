import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 3,
  className = '',
  color = '#94a3b8',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = speed * 1000;

  useAnimationFrame((time) => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const cycleTime = elapsedRef.current % animationDuration;
    const p = (cycleTime / animationDuration) * 100;
    progress.set(yoyo && Math.floor(elapsedRef.current / animationDuration) % 2 === 1 ? 100 - p : p);
  });

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`);

  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  };

  return (
    <motion.span
      className={`font-semibold tracking-tight ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
