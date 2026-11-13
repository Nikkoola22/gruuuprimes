import React, { useId } from "react";

interface FaitAGennevilliersBadgeProps {
  className?: string;
}

/**
 * Sceau rond discret avec texte circulaire « FAIT À GENNEVILLIERS »
 * affiché en filigrane sur chaque page de l'application ATLAS.
 */
export const FaitAGennevilliersBadge: React.FC<FaitAGennevilliersBadgeProps> = ({
  className = "fixed bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-[70]",
}) => {
  const rawId = useId();
  const pathId = `fait-gennevilliers-circle-${rawId.replace(/:/g, "")}`;

  return (
    <div
      aria-label="Fait à Gennevilliers"
      title="Fait à Gennevilliers — CFDT Gennevilliers (92230)"
      className={`${className} pointer-events-none select-none opacity-50 sm:opacity-60 dark:opacity-50 transition-opacity duration-300`}
    >
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-orange-500/35 dark:border-orange-400/30 shadow-md flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          role="img"
          aria-hidden="true"
        >
          <defs>
            {/* Cercle de rayon 36 (circonférence ≈ 226.2) pour le texte en rond */}
            <path
              id={pathId}
              d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
              fill="none"
            />
          </defs>

          {/* Anneau extérieur pointillé subtil */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2.5 2.5"
            className="text-orange-500/45 dark:text-orange-400/40"
          />

          {/* Texte circulaire rotatif "FAIT À GENNEVILLIERS" (rotation sens inverse des aiguilles d'une montre) */}
          <g
            className="origin-center motion-safe:animate-[spin_32s_linear_infinite] [animation-direction:reverse]"
            style={{ animationDirection: "reverse" }}
          >
            <text
              fill="currentColor"
              className="text-slate-800 dark:text-orange-200 font-extrabold uppercase"
              fontSize="8.3"
              letterSpacing="1.35"
            >
              <textPath
                href={`#${pathId}`}
                startOffset="0%"
                textLength="222"
                lengthAdjust="spacing"
              >
                • FAIT À GENNEVILLIERS • 92230
              </textPath>
            </text>
          </g>

          {/* Médaillon central fixe */}
          <circle
            cx="50"
            cy="50"
            r="22"
            className="fill-orange-500/12 dark:fill-orange-500/20 stroke-orange-500/45 dark:stroke-orange-400/45"
            strokeWidth="1.2"
          />
          <text
            x="50"
            y="48"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-orange-600 dark:fill-orange-400 font-black"
            fontSize="12"
          >
            92
          </text>
          <text
            x="50"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-600 dark:fill-slate-300 font-bold uppercase"
            fontSize="5.5"
            letterSpacing="0.6"
          >
            CFDT
          </text>
        </svg>
      </div>
    </div>
  );
};

export default FaitAGennevilliersBadge;
