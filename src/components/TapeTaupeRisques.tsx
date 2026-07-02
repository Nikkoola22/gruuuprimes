import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, ShieldAlert, Activity, AlertTriangle } from "lucide-react";

interface TapeTaupeRisquesProps {
  onClose: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

// --- Constants & Types ---
type MoleType = "RPS" | "CHUTE" | "HEURES" | "DEPASSEMENT" | "HARCELEMENT" | "INCENDIE" | "TMS" | "DELEGUE" | "EPI" | "CHSCT" | "FORMATION" | "ERGO";

interface MoleDefinition {
  type: MoleType;
  label: string;
  emoji: string;
  isDanger: boolean;
  color: string;
}

const MOLES: MoleDefinition[] = [
  { type: "RPS", label: "RPS (Burnout)", emoji: "🤯", isDanger: true, color: "from-pink-500 to-rose-600" },
  { type: "CHUTE", label: "Chute / Glissade", emoji: "💥", isDanger: true, color: "from-orange-500 to-red-500" },
  { type: "HEURES", label: "Non-respect 1607h", emoji: "⏱️", isDanger: true, color: "from-red-500 to-rose-700" },
  { type: "DEPASSEMENT", label: "Dépassement horaire", emoji: "🌙", isDanger: true, color: "from-purple-500 to-fuchsia-600" },
  { type: "HARCELEMENT", label: "Harcèlement", emoji: "👿", isDanger: true, color: "from-red-600 to-red-900" },
  { type: "INCENDIE", label: "Risque Incendie", emoji: "🔥", isDanger: true, color: "from-orange-600 to-yellow-500" },
  { type: "TMS", label: "Troubles Musculaires", emoji: "🦴", isDanger: true, color: "from-amber-600 to-orange-700" },
  
  // Pièges (Bonnes pratiques) - Couleurs trompeuses (similaires aux dangers)
  { type: "DELEGUE", label: "Délégué Syndical", emoji: "🛡️", isDanger: false, color: "from-purple-500 to-fuchsia-600" },
  { type: "EPI", label: "Équipement Conforme", emoji: "🦺", isDanger: false, color: "from-orange-500 to-red-500" },
  { type: "CHSCT", label: "Réunion CHSCT", emoji: "👥", isDanger: false, color: "from-red-500 to-rose-700" },
  { type: "FORMATION", label: "Formation Sécurité", emoji: "🎓", isDanger: false, color: "from-amber-600 to-orange-700" },
  { type: "ERGO", label: "Ergonomie Poste", emoji: "💺", isDanger: false, color: "from-pink-500 to-rose-600" },
];

interface ActiveMole {
  id: number;
  def: MoleDefinition;
  spawnTime: number;
  duration: number;
  hit: boolean;
}

const MAX_ERRORS = 5;

const TapeTaupeRisques: React.FC<TapeTaupeRisquesProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [level, setLevel] = useState(1);
  
  // Grille de 9 emplacements (0 à 8)
  const [holes, setHoles] = useState<(ActiveMole | null)[]>(Array(9).fill(null));
  
  const holesRef = useRef<(ActiveMole | null)[]>(Array(9).fill(null));
  const gameActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const errorsRef = useRef(0);
  const moleIdCounter = useRef(0);

  // Sync state and refs
  useEffect(() => { holesRef.current = holes; }, [holes]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { errorsRef.current = errors; }, [errors]);

  // Sons & Feedback (visuel)
  const [feedback, setFeedback] = useState<{ id: number, text: string, color: string, x: number, y: number }[]>([]);

  const addFeedback = (text: string, color: string, e: React.MouseEvent | React.TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const id = Date.now() + Math.random();
    setFeedback(prev => [...prev, { id, text, color, x: clientX, y: clientY }]);
    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  const handleGameOver = useCallback(() => {
    gameActiveRef.current = false;
    setGameState("gameover");
  }, []);

  const incrementError = useCallback(() => {
    setErrors(e => {
      const next = e + 1;
      if (next >= MAX_ERRORS) {
        handleGameOver();
      }
      return next;
    });
  }, [handleGameOver]);

  const spawnMole = useCallback(() => {
    if (!gameActiveRef.current) return;

    const currentHoles = [...holesRef.current];
    const emptyIndices = currentHoles.map((h, i) => h === null ? i : -1).filter(i => i !== -1);
    
    if (emptyIndices.length === 0) return; // Grille pleine

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    
    // Chances: 80% Danger, 20% Piège (Bonne pratique)
    const isTrap = Math.random() < 0.2;
    const candidates = MOLES.filter(m => m.isDanger === !isTrap);
    const selectedDef = candidates[Math.floor(Math.random() * candidates.length)];

    // Durée de vie d'une taupe: dépend du niveau
    const currentLevel = Math.floor(scoreRef.current / 5) + 1;
    setLevel(currentLevel);
    
    // Base 2.5s, réduit très vite (exponentiel)
    const duration = Math.max(500, 2500 * Math.pow(0.85, currentLevel - 1));

    const newMole: ActiveMole = {
      id: moleIdCounter.current++,
      def: selectedDef,
      spawnTime: performance.now(),
      duration: duration,
      hit: false,
    };

    currentHoles[randomIndex] = newMole;
    setHoles(currentHoles);

  }, []);

  // Boucle principale: nettoie les taupes expirées et spawn les nouvelles
  useEffect(() => {
    let animationId: number;
    let lastSpawn = performance.now();

    const loop = (timestamp: number) => {
      if (!gameActiveRef.current) return;

      // 1. Check expirations
      let holesChanged = false;
      const currentHoles = [...holesRef.current];

      for (let i = 0; i < currentHoles.length; i++) {
        const mole = currentHoles[i];
        if (mole) {
          const age = timestamp - mole.spawnTime;
          if (age > mole.duration && !mole.hit) {
            // Expirée !
            if (mole.def.isDanger) {
              // Un risque a été ignoré !
              incrementError();
            }
            currentHoles[i] = null;
            holesChanged = true;
          }
        }
      }

      if (holesChanged) {
        setHoles(currentHoles);
      }

      // 2. Spawn de nouvelles taupes
      const currentLevel = Math.floor(scoreRef.current / 5) + 1;
      const spawnInterval = Math.max(300, 1500 * Math.pow(0.85, currentLevel - 1)); // De plus en plus vite
      
      if (timestamp - lastSpawn > spawnInterval) {
        // Aléatoirement spawn 1 ou 2 taupes à haut niveau
        spawnMole();
        if (currentLevel > 4 && Math.random() < 0.3) {
          spawnMole();
        }
        lastSpawn = timestamp;
      }

      animationId = requestAnimationFrame(loop);
    };

    if (gameState === "playing") {
      animationId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationId);
  }, [gameState, incrementError, spawnMole]);


  const handleHoleClick = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (gameState !== "playing") return;

    const currentHoles = [...holes];
    const mole = currentHoles[index];

    if (!mole || mole.hit) return;

    mole.hit = true;
    
    if (mole.def.isDanger) {
      // Succès ! On a tapé un risque
      setScore(s => s + 1);
      addFeedback("+1", "text-green-400", e);
    } else {
      // Erreur ! On a tapé une bonne pratique / délégué
      incrementError();
      addFeedback("NON !", "text-red-500", e);
    }

    // Retrait immédiat (avec petite animation visuelle possible)
    currentHoles[index] = null;
    setHoles(currentHoles);
  };

  const startGame = () => {
    setScore(0);
    setErrors(0);
    setLevel(1);
    setHoles(Array(9).fill(null));
    gameActiveRef.current = true;
    moleIdCounter.current = 0;
    setGameState("playing");
  };

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500  sm: px-4 font-sans text-slate-800 dark:text-slate-100 touch-none select-none">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center h-full">
        
        {/* Retour button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4  bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 w-full">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-slate-800 dark:text-slate-100">
            Tape-Taupe des Risques
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-bold">
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 .5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Niveau : <span className="text-purple-400 font-extrabold">{level}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 .5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Dossiers traités : <span className="text-emerald-400 font-extrabold">{score}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 .5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Alerte : 
              <div className="flex gap-1">
                {[...Array(MAX_ERRORS)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${i < errors ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
            </span>
          </div>
        </div>

        {/* Game Grid Area */}
        <div className="relative w-full max-w-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          
          {/* Grille css 3x3 */}
          <div className="grid grid-cols-3 grid-rows-3 gap-3 sm:gap-6 w-full aspect-square relative z-10">
            {holes.map((mole, i) => (
              <div 
                key={i} 
                className="relative bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 flex items-end justify-center overflow-hidden shadow-sm cursor-pointer group hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onPointerDown={(e) => handleHoleClick(i, e)}
              >
                {/* Trou noir (fond) */}
                <div className="absolute inset-x-2 bottom-4 h-[35%] bg-slate-100 dark:bg-slate-900 rounded-[50%] shadow-inner opacity-90 border border-slate-200 dark:border-slate-800" />
                
                {/* La Taupe */}
                {mole && !mole.hit && (
                  <div 
                    className={`absolute bottom-5 w-[85%] h-[80%] bg-gradient-to-t ${mole.def.color} rounded-xl shadow-[0_0_30px_currentColor] flex flex-col items-center justify-center animate-slide-up border-2 border-white/20`}
                    style={{ color: 'rgba(148,163,184,0.3)' }} // Soft color
                  >
                    <div className="absolute inset-0 bg-black/10 rounded-xl" />
                    <span className="relative z-10 text-4xl sm:text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">{mole.def.emoji}</span>
                    <span className="relative z-10 text-[10px] sm:text-[13px] font-black uppercase tracking-wider mt-1.5 text-center leading-tight px-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                      {mole.def.label}
                    </span>
                  </div>
                )}
                
                {/* Rebord tech devant */}
                <div className="absolute bottom-0 w-full h-6 bg-slate-50 dark:bg-slate-800 rounded-b-xl border-t border-slate-200 dark:border-slate-600 z-10 flex justify-center items-center">
                  <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 shadow-inner" />
                </div>
              </div>
            ))}
          </div>

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <AlertTriangle className="w-10 h-10 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Prévention des Risques</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8 font-light text-sm">
                Tapez sur les situations dangereuses (<span className="text-pink-400">RPS</span>, <span className="text-red-400">Non-respect des horaires</span>, <span className="text-orange-400">Chutes</span>) avant qu'il ne soit trop tard ! <br/><br/>
                <strong>ATTENTION :</strong> Ne tapez pas sur le Délégué Syndical 🛡️ ni sur les équipements conformes 🦺 !
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8  bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium text-lg transition-all shadow-sm hover:shadow-md"
              >
                <Play className="w-5 h-5 fill-current" />
                Démarrer
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h2 className="text-4xl sm:text-5xl font-bold text-red-500 mb-2 leading-tight">
                ALERTE DÉCLENCHÉE
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">Trop d'accidents ou d'erreurs ont eu lieu sur votre site.</p>
              <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-8 flex flex-col items-center min-w-[200px] shadow-sm">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Dossiers traités</p>
                <p className="text-5xl font-bold text-orange-400">{score}</p>
              </div>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8  bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                Reprendre le service
              </button>
            </div>
          )}

        </div>
        
        {/* Feedbacks clics */}
        {feedback.map(f => (
          <div 
            key={f.id}
            className={`fixed font-black text-2xl drop-shadow-lg pointer-events-none animate-float-up z-50 ${f.color}`}
            style={{ left: f.x - 20, top: f.y - 20 }}
          >
            {f.text}
          </div>
        ))}

      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TapeTaupeRisques;
