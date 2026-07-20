import React, { useRef } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(249, 115, 22, 0.15)',
  style = {},
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10 ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, ${spotlightColor}), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SpotlightCard;
