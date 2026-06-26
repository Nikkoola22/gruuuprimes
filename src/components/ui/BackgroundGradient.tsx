import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div className={cn("relative p-[4px] group rounded-3xl", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: "400% 400%",
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#f43f5e,transparent_85%),radial-gradient(circle_farthest-side_at_100%_0%,#3b82f6,transparent_85%),radial-gradient(circle_farthest-side_at_100%_100%,#10b981,transparent_85%),radial-gradient(circle_farthest-side_at_0%_0%,#8b5cf6,transparent_85%)]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: "400% 400%",
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#f43f5e,transparent_85%),radial-gradient(circle_farthest-side_at_100%_0%,#3b82f6,transparent_85%),radial-gradient(circle_farthest-side_at_100%_100%,#10b981,transparent_85%),radial-gradient(circle_farthest-side_at_0%_0%,#8b5cf6,transparent_85%)]"
        )}
      />

      <div className={cn("relative z-10 rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-md", className)}>
        {children}
      </div>
    </div>
  );
};
