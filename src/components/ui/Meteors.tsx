import React from "react";
import { cn } from "../../lib/utils";

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number).fill(true);
  return (
    <>
      <style>
        {`
          @keyframes meteor {
            0% {
              transform: rotate(215deg) translateX(0);
              opacity: 1;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: rotate(215deg) translateX(-600px);
              opacity: 0;
            }
          }
          .animate-meteor {
            animation: meteor 5s linear infinite;
          }
        `}
      </style>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-indigo-400 dark:bg-slate-300 shadow-[0_0_0_1px_ffffff10] rotate-[215deg] animate-meteor pointer-events-none z-0",
            className
          )}
          style={{
            top: -20,
            left: Math.random() * 120 - 10 + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 4) + 4) + "s",
          }}
        >
          {/* Meteor Tail */}
          <div className="absolute top-1/2 -translate-y-1/2 z-10 h-[1px] w-[50px] bg-gradient-to-r from-indigo-400 dark:from-slate-400 to-transparent pointer-events-none" />
        </span>
      ))}
    </>
  );
};
