import React, { useState, lazy, Suspense } from "react";
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
  Inbox
} from "lucide-react";

// Lazy-load les quatre jeux
const RouletteQVT = lazy(() => import("./RouletteQVT.tsx"));
const MemoryRH = lazy(() => import("./MemoryRH.tsx"));
const FAQQuiz = lazy(() => import("./FAQQuiz.tsx"));
const CasseBrique = lazy(() => import("./CasseBrique.tsx"));
const FroggerContractuel = lazy(() => import("./FroggerContractuel.tsx"));
const TapeTaupeRisques = lazy(() => import("./TapeTaupeRisques.tsx"));
const SortEmAll = lazy(() => import("./SortEmAll.tsx"));

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

const EspaceJeux: React.FC<EspaceJeuxProps> = ({ onClose, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [activeGame, setActiveGame] = useState<"none" | "roulette" | "memory" | "quiz" | "cassebrique" | "frogger" | "tapetaupe" | "sortemall">("none");

  if (activeGame === "roulette") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <RouletteQVT onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "memory") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <MemoryRH onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "quiz") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <FAQQuiz onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "cassebrique") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <CasseBrique onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "frogger") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <FroggerContractuel onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "tapetaupe") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <TapeTaupeRisques onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  if (activeGame === "sortemall") {
    return (
      <Suspense fallback={<ViewLoader />}>
        <SortEmAll onClose={() => setActiveGame("none")} />
      </Suspense>
    );
  }

  return (
    <div className={`relative z-30 isolate min-h-screen overflow-x-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ${isLight ? "bg-slate-50 text-slate-900" : "bg-[#040009] text-white"}`}>
      
      {/* Dynamic Background Effects matching LandingPage */}
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none transition-opacity duration-500 ${isLight ? "opacity-5 mix-blend-multiply" : "opacity-20 mix-blend-screen"}`}
        style={{ backgroundImage: `url('${BASE_URL}unnamed.jpg')` }}
      ></div>

      {/* Subtle overlay for better text readability */}
      <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Soft glow orb */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: isLight 
          ? 'radial-gradient(ellipse at center, rgba(148,163,184,0.15) 0%, transparent 70%)' 
          : 'radial-gradient(ellipse at center, rgba(148,163,184,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Retour au menu principal */}
        <div className="relative z-40 mb-6">
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
        <div className="text-center mb-12 animate-fade-in">
          <div className={`inline-flex p-4 rounded-2xl mb-4 shadow-xl backdrop-blur-md transition-colors duration-500 ${isLight ? "bg-white/50 border border-slate-200 text-slate-700" : "bg-white/5 border border-white/10 text-slate-300"}`}>
            <Gamepad2 className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className={`text-4xl sm:text-6xl font-light tracking-tight mb-3 transition-colors duration-500 ${isLight ? "text-slate-800" : "text-shimmer"}`}>
            Espace Jeux
          </h1>
          <p className={`text-sm sm:text-lg font-light max-w-lg mx-auto transition-colors duration-500 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Détendez-vous tout en enrichissant vos connaissances professionnelles avec nos outils ludiques.
          </p>
        </div>

        {/* Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch justify-items-center">
          
          {/* Card A: Roulette QVT */}
          <button
            onClick={() => setActiveGame("roulette")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}roulette.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay Gradient */}
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30 text-blue-300">
                  <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Roulette QVT
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Tournez la roulette pour obtenir des idées concrètes pour votre bien-être au bureau, des gestes managériaux ou des astuces de carrière.
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Lancer le jeu</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card B: Memory RH */}
          <button
            onClick={() => setActiveGame("memory")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}memory.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/30 text-purple-300">
                  <Brain className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Memory RH
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Testez votre mémoire RH ! Associez chaque terme de la fonction publique à son idée clé correspondante en retournant les cartes par paires.
              </p>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Lancer le jeu</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card C: Quiz FAQ */}
          <button
            onClick={() => setActiveGame("quiz")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}quiz.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/20 backdrop-blur-md rounded-xl border border-orange-400/30 text-orange-300">
                  <HelpCircle className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Quiz FAQ
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Mettez au défi vos connaissances ! Répondez à 10 questions tirées au hasard sur les règlements, congés et droits de la fonction publique.
              </p>
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Lancer le quiz</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card D: Casse-brique RH */}
          <button
            onClick={() => setActiveGame("cassebrique")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}cassebrique.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-400/30 text-red-300">
                  <Zap className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Casse-brique RH
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Un casse-brique rétro aux couleurs de la CFDT ! Libérez les acquis et droits sociaux de la fonction publique en détruisant les obstacles.
              </p>
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Lancer le jeu</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card E: Frogger Contractuel */}
          <button
            onClick={() => setActiveGame("frogger")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}frogger.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 backdrop-blur-md rounded-xl border border-green-400/30 text-green-300">
                  <Activity className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Frogger RH
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Le Frogger des Contractuels ! Évitez les pièges de recrutement et sautez sur les bons CDD pour atteindre la Titularisation.
              </p>
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Lancer le jeu</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card F: Tape-Taupe */}
          <button
            onClick={() => setActiveGame("tapetaupe")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}tapetaupe.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-500/20 backdrop-blur-md rounded-xl border border-yellow-400/30 text-yellow-300">
                  <AlertTriangle className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Tape-Taupe Risques
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Soyez réactif ! Tapez sur les risques professionnels (RPS, chutes, heures supp) avant qu'un accident ne survienne.
              </p>
              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Démarrer la prévention</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card G: Sort Em All */}
          <button
            onClick={() => setActiveGame("sortemall")}
            className={`group relative text-left rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end h-[400px] w-full max-w-lg shadow-lg hover:shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"} backdrop-blur-sm`}
            style={{ 
              backgroundImage: `url('${BASE_URL}sortemall.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-80 group-hover:opacity-90 ${isLight ? "bg-gradient-to-t from-white via-white/80 to-white/10" : "bg-gradient-to-t from-[#040009] via-[#040009]/80 to-transparent"}`} />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-sky-500/20 backdrop-blur-md rounded-xl border border-sky-400/30 text-sky-300">
                  <Inbox className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className={`text-3xl font-bold tracking-tight drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  Sort'em All : Instances
                </h3>
              </div>
              <p className={`font-light text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                Triez le courrier et les dossiers RH dans les bonnes bannettes (CST, CAP, F3SCT...) sous la pression du temps !
              </p>
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                <span>Commencer le tri</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EspaceJeux;
