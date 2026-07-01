import React from "react";
import { motion } from "framer-motion";

export const OrangeGeometricBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Large soft glowing orange blobs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-orange-500/10 to-amber-500/5 dark:from-orange-500/5 dark:to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full bg-gradient-to-br from-amber-500/10 to-orange-600/5 dark:from-orange-600/5 dark:to-transparent blur-3xl"
      />

      {/* 2. Dotted Geometric Grids */}
      <div 
        className="absolute top-24 right-12 w-48 h-48 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: "radial-gradient(#f97316 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px"
        }}
      />
      <div 
        className="absolute bottom-36 left-10 w-64 h-32 opacity-15 dark:opacity-5"
        style={{
          backgroundImage: "radial-gradient(#f97316 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px"
        }}
      />

      {/* 3. Slow rotating dashed outline circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-[18%] left-[8%] w-36 h-36 rounded-full border border-dashed border-orange-500/25 dark:border-orange-500/15"
      />

      {/* 4. Floating glowing square outline */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [45, 65, 45],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[45%] right-[12%] w-16 h-16 rounded-xl border border-orange-400/30 dark:border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/[0.02] shadow-[0_0_15px_rgba(249,115,22,0.08)]"
      />

      {/* 5. A larger floating hollow hexagon */}
      <motion.div
        animate={{
          y: [-15, 15, -15],
          rotate: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[28%] left-[15%] w-24 h-24 opacity-30 dark:opacity-15"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-orange-500 stroke-2">
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" />
        </svg>
      </motion.div>

      {/* 6. Glowing small triangle */}
      <motion.div
        animate={{
          x: [0, 15, 0],
          y: [0, -25, 0],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[70%] right-[22%] w-8 h-8 opacity-40 dark:opacity-20"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-orange-500 stroke-[3]">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </motion.div>

      {/* 7. Floating plus / cross shapes */}
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[32%] left-[45%] text-orange-400/40 dark:text-orange-500/25 font-light text-3xl"
      >
        +
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[45%] left-[35%] text-orange-400/40 dark:text-orange-500/20 font-light text-2xl"
      >
        ×
      </motion.div>

      {/* 8. Concentric circles or radar-like effect in a corner */}
      <div className="absolute -bottom-12 -right-12 w-80 h-80 rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-orange-500/15 dark:border-orange-500/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
