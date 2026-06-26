import React from "react";
import { cn } from "../../lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam = ({
  className,
  size = 120,
  duration = 8,
  borderWidth = 2,
  anchor = 90,
  colorFrom = "#6366f1", // Indigo
  colorTo = "#a855f7",   // Purple
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div
      style={{
        "--size": `${size}px`,
        "--duration": `${duration}s`,
        "--anchor": `${anchor}deg`,
        "--border-width": `${borderWidth}px`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `${delay}s`,
      } as React.CSSProperties}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] z-10",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:bg-[conic-gradient(from_calc(var(--anchor)*1deg)_at_50%_50%,var(--color-from)_0%,var(--color-to)_50%,transparent_100%)] after:[offset-anchor:50%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))] after:[animation-delay:var(--delay)]",
        className
      )}
    >
      <style>
        {`
          @keyframes border-beam {
            100% {
              offset-distance: 100%;
            }
          }
          .animate-border-beam {
            animation: border-beam var(--duration) linear infinite;
          }
        `}
      </style>
    </div>
  );
};
