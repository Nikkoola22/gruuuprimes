import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

const springValues = {
  damping: 25,
  stiffness: 120,
  mass: 1.2,
};

export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className = '',
  rotateAmplitude = 12,
  scaleOnHover = 1.04,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default TiltedCard;
