import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    colorClass?: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6",
        className
      )}
    >
      {items.map((item, idx) => {
        const CardContent = (
          <>
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-slate-100 dark:bg-slate-800/80 block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.1 },
                  }}
                />
              )}
            </AnimatePresence>
            <div className="rounded-2xl h-full w-full p-4 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 relative z-20 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="relative z-50">
                <div className="p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 mb-4 text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h4 className={cn("text-slate-900 dark:text-slate-100 font-bold tracking-wide mt-2 text-base", item.colorClass)}>
                  {item.title}
                </h4>
                <p className="mt-2 text-slate-600 dark:text-slate-400 tracking-wide leading-relaxed text-xs font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          </>
        );

        if (item.link) {
          return (
            <a
              href={item.link}
              key={idx}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block p-2 h-full w-full"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {CardContent}
            </a>
          );
        }

        return (
          <button
            key={idx}
            onClick={item.onClick}
            className="relative group block p-2 h-full w-full text-left focus:outline-none"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {CardContent}
          </button>
        );
      })}
    </div>
  );
};
