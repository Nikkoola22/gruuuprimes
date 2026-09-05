import { motion } from "framer-motion";

export const OrangeGeometricBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* 2. Dotted Geometric Grids */}
      <div 
        className="absolute top-24 right-12 w-80 h-80 opacity-15 dark:opacity-10"
        style={{
          backgroundImage: "radial-gradient(#f97316 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px"
        }}
      />
      <div 
        className="absolute bottom-36 left-10 w-96 h-48 opacity-10 dark:opacity-5"
        style={{
          backgroundImage: "radial-gradient(#f97316 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px"
        }}
      />

      {/* 3. Slow rotating dashed outline circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-[18%] left-[8%] w-64 h-64 rounded-full border border-dashed border-orange-500/20 dark:border-orange-500/10"
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
        className="absolute top-[45%] right-[12%] w-32 h-32 rounded-3xl border-2 border-orange-400/30 dark:border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/[0.02] shadow-[0_0_25px_rgba(249,115,22,0.2)]"
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
        className="absolute bottom-[28%] left-[15%] w-48 h-48 opacity-20 dark:opacity-10"
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
        className="absolute top-[70%] right-[22%] w-20 h-20 opacity-25 dark:opacity-15"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-orange-500 stroke-[4]">
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
        className="absolute top-[32%] left-[45%] text-orange-400/30 dark:text-orange-500/20 font-bold text-6xl"
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
        className="absolute bottom-[45%] left-[35%] text-orange-400/30 dark:text-orange-500/15 font-bold text-5xl"
      >
        ×
      </motion.div>

      {/* 8. Concentric circles or radar-like effect in a corner */}
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
        <div className="w-[450px] h-[450px] rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
          <div className="w-[300px] h-[300px] rounded-full border border-orange-500/10 dark:border-orange-500/5 flex items-center justify-center">
            <div className="w-[150px] h-[150px] rounded-full border border-orange-500/15 dark:border-orange-500/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
