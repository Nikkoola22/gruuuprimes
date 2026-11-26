import React, { useId } from "react";

interface FaitAGennevilliersBadgeProps {
  className?: string;
}

/**
 * Sceau rond avec texte circulaire « FAIT À GENNEVILLIERS »
 * affiché en bas à gauche sur chaque page de l'application ATLAS.
 */
export const FaitAGennevilliersBadge: React.FC<FaitAGennevilliersBadgeProps> = ({
  className = "fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-[70]",
}) => {
  const rawId = useId();
  const pathId = `fait-gennevilliers-circle-${rawId.replace(/:/g, "")}`;

  return (
    <div
      aria-label="Fait à Gennevilliers"
      title="Fait à Gennevilliers — CFDT Gennevilliers (92230)"
      className={`${className} pointer-events-none select-none opacity-95 dark:opacity-95 transition-opacity duration-300`}
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-orange-500/85 dark:border-orange-400/80 shadow-lg shadow-orange-500/20 dark:shadow-orange-500/25 ring-2 ring-white/80 dark:ring-slate-950/80 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          role="img"
          aria-hidden="true"
        >
          <defs>
            {/* Cercle de rayon 35.5 (circonférence ≈ 223.1) pour le texte en rond */}
            <path
              id={pathId}
              d="M 50,50 m -35.5,0 a 35.5,35.5 0 1,1 71,0 a 35.5,35.5 0 1,1 -71,0"
              fill="none"
            />
          </defs>

          {/* Anneau extérieur pointillé */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="2.8 2.4"
            className="text-orange-500/80 dark:text-orange-400/75"
          />

          {/* Texte circulaire rotatif "FAIT À GENNEVILLIERS" (rotation sens inverse des aiguilles d'une montre) */}
          <g
            className="origin-center motion-safe:animate-[spin_32s_linear_infinite] [animation-direction:reverse]"
            style={{ animationDirection: "reverse" }}
          >
            <text
              fill="currentColor"
              className="text-slate-900 dark:text-white font-black uppercase"
              fontSize="9"
              letterSpacing="1.2"
            >
              <textPath
                href={`#${pathId}`}
                startOffset="0%"
                textLength="218"
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
            r="23"
            className="fill-orange-500/15 dark:fill-orange-500/25 stroke-orange-600/80 dark:stroke-orange-400/85"
            strokeWidth="1.6"
          />
          <text
            x="50"
            y="46"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-orange-600 dark:fill-orange-400 font-black"
            fontSize="14.5"
          >
            92
          </text>
          <text
            x="50"
            y="60.5"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-800 dark:fill-orange-100 font-extrabold uppercase"
            fontSize="6.5"
            letterSpacing="0.8"
          >
            CFDT
          </text>
        </svg>
      </div>
    </div>
  );
};

export default FaitAGennevilliersBadge;
