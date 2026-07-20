import React from 'react';

interface BorderGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderWidth?: string;
}

export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  glowColor = 'from-orange-500 via-amber-400 to-amber-600',
  borderWidth = 'p-[1px]',
  ...props
}) => {
  return (
    <div className={`relative group rounded-2xl overflow-hidden ${borderWidth} ${className}`} {...props}>
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${glowColor} opacity-75 blur-sm transition duration-500 group-hover:opacity-100 group-hover:blur-md animate-gradient-x`}
      />
      <div className="relative rounded-2xl bg-slate-950/90 h-full w-full backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
