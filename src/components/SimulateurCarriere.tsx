import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Briefcase, 
  RotateCcw,
} from "lucide-react";

interface SimulateurCarriereProps {
  onClose: () => void;
  theme?: "light" | "dark";
}

const BASE_URL = import.meta.env.BASE_URL || "/";
const SIMUL_URL = `${BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`}simul-agent/index.html`;

export const SimulateurCarriere: React.FC<SimulateurCarriereProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // S'assurer que le scroll est remis à zéro immédiatement
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Empêcher le défilement de la page en arrière-plan pendant que la simulation est ouverte
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    const iframe = document.getElementById("simul-agent-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = SIMUL_URL;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none font-sans">
      {/* Header Bar - Toujours épinglé en haut */}
      <header className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-md px-4 py-2.5 flex items-center justify-between gap-3 z-20">
        {/* Gauche : Bouton retour et Titre */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour accueil CFDT</span>
          </button>

          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                Simulateur & Guide Carrière de l'Agent Territorial
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
                CFDT 2027
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Échelon • Avancement de Grade • Points LDG-PI • Reclassement Concours & Examens
            </p>
          </div>
        </div>

        {/* Droite : Outil de réinitialisation */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            type="button"
            onClick={handleReload}
            title="Réinitialiser le simulateur"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Frame Container - Occupe 100% de la hauteur restante */}
      <div className="relative flex-1 w-full h-full bg-slate-900 overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-white gap-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-300 animate-pulse">
              Chargement du simulateur de carrière CFDT...
            </p>
          </div>
        )}

        {/* Embedded Application */}
        <iframe
          id="simul-agent-iframe"
          src={SIMUL_URL}
          title="Simulateur Carrière Agent CFDT"
          className="w-full h-full border-0 block"
          onLoad={() => setIsLoading(false)}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default SimulateurCarriere;
