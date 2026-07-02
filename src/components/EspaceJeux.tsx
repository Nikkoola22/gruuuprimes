import React, { useState, useEffect, lazy, Suspense } from "react";
import { 
  ArrowLeft, 
  Gamepad2, 
  Sparkles, 
  Brain, 
  ArrowRight,
  HelpCircle,
  Zap,
  Activity,
  AlertTriangle,
  Inbox,
  Shield,
  Building2
} from "lucide-react";

// Lazy-load les quatre jeux
const RouletteQVT = lazy(() => import("./RouletteQVT.tsx"));
const MemoryRH = lazy(() => import("./MemoryRH.tsx"));
const FAQQuiz = lazy(() => import("./FAQQuiz.tsx"));
const CasseBrique = lazy(() => import("./CasseBrique.tsx"));
const FroggerContractuel = lazy(() => import("./FroggerContractuel.tsx"));
const TapeTaupeRisques = lazy(() => import("./TapeTaupeRisques.tsx"));
const SortEmAll = lazy(() => import("./SortEmAll.tsx"));
const PacManPaie = lazy(() => import("./PacManPaie.tsx"));
const TowerDefenseRH = lazy(() => import("./TowerDefenseRH.tsx"));
const TycoonCollectivite = lazy(() => import("./TycoonCollectivite.tsx"));
const EscapeGameRH = lazy(() => import("./EscapeGameRH.tsx"));

interface EspaceJeuxProps {
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const BASE_URL = import.meta.env.BASE_URL;

const ViewLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
    <div className="px-6 py-4 rounded-2xl border border-purple-500/30 bg-slate-900/60 text-purple-100/90 shadow-xl backdrop-blur-md animate-pulse">
      Chargement du jeu...
    </div>
  </div>
);

const EspaceJeuxStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
    }
    .EspaceJeux-root-container .min-h-screen {
      background-color: #000000 !important;
    }
  `}} />
);

interface GameDef {
  id: "roulette" | "memory" | "quiz" | "cassebrique" | "frogger" | "tapetaupe" | "sortemall" | "pacman" | "towerdefense" | "tycoon" | "escapegame";
  title: string;
  description: string;
  actionText: string;
  icon: React.ElementType;
  iconTheme: string;
  bgImage: string;
  spanClass: string;
  iconSizeClass?: string;
  titleSizeClass?: string;
}

const themeStyles: Record<string, { bg: string, text: string, border: string, shadow: string, btnBg: string }> = {
  amber: { bg: "bg-amber-500/20", text: "text-amber-500 dark:text-amber-300", border: "border-amber-400/30", shadow: "shadow-amber-500/20", btnBg: "bg-amber-500 hover:bg-amber-600" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-500 dark:text-blue-300", border: "border-blue-400/30", shadow: "shadow-blue-500/20", btnBg: "bg-blue-500 hover:bg-blue-600" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-500 dark:text-emerald-300", border: "border-emerald-400/30", shadow: "shadow-emerald-500/20", btnBg: "bg-emerald-500 hover:bg-emerald-600" },
  red: { bg: "bg-red-500/20", text: "text-red-500 dark:text-red-300", border: "border-red-400/30", shadow: "shadow-red-500/20", btnBg: "bg-red-500 hover:bg-red-600" },
  sky: { bg: "bg-sky-500/20", text: "text-sky-500 dark:text-sky-300", border: "border-sky-400/30", shadow: "shadow-sky-500/20", btnBg: "bg-sky-500 hover:bg-sky-600" },
  green: { bg: "bg-green-500/20", text: "text-green-500 dark:text-green-300", border: "border-green-400/30", shadow: "shadow-green-500/20", btnBg: "bg-green-500 hover:bg-green-600" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-500 dark:text-yellow-300", border: "border-yellow-400/30", shadow: "shadow-yellow-500/20", btnBg: "bg-yellow-500 hover:bg-yellow-600" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-500 dark:text-purple-300", border: "border-purple-400/30", shadow: "shadow-purple-500/20", btnBg: "bg-purple-500 hover:bg-purple-600" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-500 dark:text-orange-300", border: "border-orange-400/30", shadow: "shadow-orange-500/20", btnBg: "bg-orange-500 hover:bg-orange-600" }
};

const games: GameDef[] = [
  { id: "tycoon", title: "Tycoon RH", description: "\"Ma Collectivité\" : Un jeu de gestion au tour par tour. Gérez le budget, calmez les syndicats, et survivez aux crises !", actionText: "Prendre ses fonctions", icon: Building2, iconTheme: "amber", bgImage: "memory.png", spanClass: "md:col-span-2 lg:col-span-2 lg:row-span-2", iconSizeClass: "w-8 h-8 sm:w-12 sm:h-12", titleSizeClass: "text-3xl sm:text-5xl" },
  { id: "escapegame", title: "Escape Game RH", description: "S'échapper des mauvaises situations au travail en adoptant les bons réflexes statutaires et QVT.", actionText: "S'échapper", icon: Sparkles, iconTheme: "purple", bgImage: "escapegame.png", spanClass: "col-span-1" },
  { id: "quiz", title: "Quiz FAQ", description: "10 questions sur les droits de la fonction publique.", actionText: "Lancer", icon: HelpCircle, iconTheme: "orange", bgImage: "quiz.png", spanClass: "col-span-1" },
  { id: "pacman", title: "Labyrinthe Paie", description: "Incarnez un gestionnaire, fuyez les fantômes et sécurisez les dossiers de paie.", actionText: "Lancer le jeu", icon: Activity, iconTheme: "blue", bgImage: "tapetaupe.png", spanClass: "md:col-span-2 lg:col-span-2" },
  { id: "towerdefense", title: "Tower Defense", description: "Gérez les effectifs face aux demandes RH.", actionText: "Défendre", icon: Shield, iconTheme: "emerald", bgImage: "towerdefense.png", spanClass: "col-span-1" },
  { id: "cassebrique", title: "Casse-brique", description: "Un casse-brique rétro ! Libérez les acquis sociaux.", actionText: "Jouer", icon: Zap, iconTheme: "red", bgImage: "cassebrique.png", spanClass: "col-span-1" },
  { id: "sortemall", title: "Sort'em All", description: "Triez les dossiers RH dans les bonnes instances sous pression.", actionText: "Trier", icon: Inbox, iconTheme: "sky", bgImage: "sortemall.png", spanClass: "md:col-span-2 lg:col-span-2" },
  { id: "frogger", title: "Frogger RH", description: "Évitez les pièges et visez la titularisation.", actionText: "Jouer", icon: Activity, iconTheme: "green", bgImage: "frogger.png", spanClass: "col-span-1" },
  { id: "tapetaupe", title: "Tape-Taupe", description: "Tapez sur les risques professionnels avant l'accident.", actionText: "Prévention", icon: AlertTriangle, iconTheme: "yellow", bgImage: "tapetaupe.png", spanClass: "col-span-1" },
  { id: "roulette", title: "Roulette QVT", description: "Obtenez des idées concrètes pour votre bien-être au bureau.", actionText: "Lancer", icon: Sparkles, iconTheme: "blue", bgImage: "roulette.png", spanClass: "md:col-span-2 lg:col-span-2" },
  { id: "memory", title: "Memory RH", description: "Testez votre mémoire en associant chaque terme RH.", actionText: "Jouer", icon: Brain, iconTheme: "purple", bgImage: "memory.png", spanClass: "col-span-1" }
];

const EspaceJeux: React.FC<EspaceJeuxProps> = ({ onClose, theme = 'dark' }) => {
  const isLight = false; // L'Espace Jeux reste en thème sombre (fond noir) quel que soit le thème global
  const [activeGame, setActiveGame] = useState<GameDef["id"] | "none">("none");

  useEffect(() => {
    if (activeGame !== "none") {
      const actuBanner = document.querySelector('.marquee-pausable');
      if (actuBanner) {
        window.scrollTo({
          top: actuBanner.getBoundingClientRect().bottom + window.scrollY,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeGame]);

  const wrapGame = (component: React.ReactNode) => (
    <div className="dark bg-black text-white min-h-screen EspaceJeux-root-container">
      <EspaceJeuxStyles />
      <Suspense fallback={<ViewLoader />}>
        {component}
      </Suspense>
    </div>
  );

  if (activeGame === "roulette") return wrapGame(<RouletteQVT onClose={() => setActiveGame("none")} />);
  if (activeGame === "memory") return wrapGame(<MemoryRH onClose={() => setActiveGame("none")} />);
  if (activeGame === "quiz") return wrapGame(<FAQQuiz onClose={() => setActiveGame("none")} />);
  if (activeGame === "cassebrique") return wrapGame(<CasseBrique onClose={() => setActiveGame("none")} />);
  if (activeGame === "frogger") return wrapGame(<FroggerContractuel onClose={() => setActiveGame("none")} />);
  if (activeGame === "tapetaupe") return wrapGame(<TapeTaupeRisques onClose={() => setActiveGame("none")} />);
  if (activeGame === "sortemall") return wrapGame(<SortEmAll onClose={() => setActiveGame("none")} />);
  if (activeGame === "pacman") return wrapGame(<PacManPaie onClose={() => setActiveGame("none")} />);
  if (activeGame === "towerdefense") return wrapGame(<TowerDefenseRH onClose={() => setActiveGame("none")} />);
  if (activeGame === "tycoon") return wrapGame(<TycoonCollectivite onClose={() => setActiveGame("none")} />);
  if (activeGame === "escapegame") return wrapGame(<EscapeGameRH onClose={() => setActiveGame("none")} />);

  return (
    <div className="dark bg-black text-white min-h-screen EspaceJeux-root-container">
      <EspaceJeuxStyles />
      <div className="relative z-30 isolate min-h-screen overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 bg-black text-white">
      
      {/* Dynamic Background Effects */}
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none transition-opacity duration-500 ${isLight ? "opacity-5 mix-blend-multiply" : "opacity-20 mix-blend-screen"}`}
        style={{ backgroundImage: `url('${BASE_URL}unnamed.jpg')` }}
      ></div>
      <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none"></div>
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: isLight ? 'radial-gradient(ellipse at center, rgba(148,163,184,0.15) 0%, transparent 70%)' : 'radial-gradient(ellipse at center, rgba(148,163,184,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Retour au menu principal */}
        <div className="relative z-40 mb-8 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm shadow-lg hover:shadow-red-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center mb-16 animate-fade-in">
          <div className={`inline-flex p-4 rounded-2xl mb-4 shadow-xl backdrop-blur-md transition-colors duration-500 ${isLight ? "bg-white/50 border border-slate-200 text-slate-700" : "bg-white/5 border border-white/10 text-slate-300"}`}>
            <Gamepad2 className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 transition-colors duration-500 drop-shadow-lg ${isLight ? "text-slate-800" : "text-shimmer"}`}>
            Espace Jeux
          </h1>
          <p className={`text-base sm:text-xl font-light max-w-2xl mx-auto transition-colors duration-500 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Détendez-vous tout en enrichissant vos connaissances professionnelles avec nos outils ludiques de nouvelle génération.
          </p>
        </div>

        {/* Selection Cards Grid - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] gap-6 max-w-7xl mx-auto items-stretch justify-items-center">
          {games.map((game) => {
            const theme = themeStyles[game.iconTheme];
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id as any)}
                className={`group relative text-left rounded-3xl overflow-hidden transition-all duration-500 flex flex-col justify-end w-full h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm bg-slate-800 ${game.spanClass}`}
                style={{ 
                  backgroundImage: `url('${BASE_URL}${game.bgImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 bg-gradient-to-t from-black via-black/90 to-transparent" />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 p-6 sm:p-8 transform translate-y-8 sm:translate-y-12 group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-end h-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                    <div className={`p-3 ${theme.bg} backdrop-blur-md rounded-xl border ${theme.border} ${theme.text} shadow-lg ${theme.shadow} shrink-0 w-fit`}>
                      <Icon className={`${game.iconSizeClass || "w-7 h-7"} group-hover:animate-pulse`} />
                    </div>
                    <h3 className={`${game.titleSizeClass || "text-2xl sm:text-3xl"} font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                      {game.title}
                    </h3>
                  </div>
                  
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className={`font-medium text-sm leading-relaxed mb-5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                        {game.description}
                      </p>
                      <div className={`inline-flex items-center gap-2 px-5 py-2.5 ${theme.btnBg} text-white rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-all duration-300`}>
                        <span>{game.actionText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
    </div>
  );
};

export default EspaceJeux;
