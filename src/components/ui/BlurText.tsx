import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  stepDuration?: number;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 150,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  stepDuration = 0.4,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const fromSnapshot = useMemo(
    () => (direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -30 } : { filter: 'blur(10px)', opacity: 0, y: 30 }),
    [direction]
  );

  const toSnapshot = useMemo(
    () => ({ filter: 'blur(0px)', opacity: 1, y: 0 }),
    []
  );

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          className="inline-block will-change-[transform,filter,opacity]"
          initial={fromSnapshot}
          animate={inView ? toSnapshot : fromSnapshot}
          transition={{
            duration: stepDuration,
            delay: (index * delay) / 1000,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;
