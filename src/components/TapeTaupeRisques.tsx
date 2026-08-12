import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, ShieldAlert, Activity, AlertTriangle } from "lucide-react";

interface TapeTaupeRisquesProps {
  onClose: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

// --- Constants & Types ---
type MoleType = "RPS" | "CHUTE" | "HEURES" | "DEPASSEMENT" | "HARCELEMENT" | "INCENDIE" | "TMS" | "DELEGUE" | "EPI" | "CHSCT" | "FORMATION" | "ERGO" | "AMIANTE" | "AGRESSION" | "BRUIT" | "DUERP" | "VISITE" | "DROIT_ALERTE";

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
  { type: "AMIANTE", label: "Amiante / Toxiques", emoji: "☣️", isDanger: true, color: "from-amber-700 to-yellow-900" },
  { type: "AGRESSION", label: "Agression Usager", emoji: "😡", isDanger: true, color: "from-red-700 to-red-950" },
  { type: "BRUIT", label: "Bruit Assourdissant", emoji: "📢", isDanger: true, color: "from-rose-700 to-pink-900" },
  
  // Pièges (Bonnes pratiques) - Couleurs trompeuses (similaires aux dangers)
  { type: "DELEGUE", label: "Délégué Syndical", emoji: "🛡️", isDanger: false, color: "from-purple-500 to-fuchsia-600" },
  { type: "EPI", label: "Équipement Conforme", emoji: "🦺", isDanger: false, color: "from-orange-500 to-red-500" },
  { type: "CHSCT", label: "Réunion CHSCT", emoji: "👥", isDanger: false, color: "from-red-500 to-rose-700" },
  { type: "FORMATION", label: "Formation Sécurité", emoji: "🎓", isDanger: false, color: "from-amber-600 to-orange-700" },
  { type: "ERGO", label: "Ergonomie Poste", emoji: "💺", isDanger: false, color: "from-pink-500 to-rose-600" },
  { type: "DUERP", label: "Document Unique", emoji: "📋", isDanger: false, color: "from-emerald-500 to-green-700" },
  { type: "VISITE", label: "Visite Médicale", emoji: "🩺", isDanger: false, color: "from-teal-500 to-cyan-600" },
  { type: "DROIT_ALERTE", label: "Droit d'alerte", emoji: "🚨", isDanger: false, color: "from-red-500 to-rose-600" },
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
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center h-full">
        
        {/* Retour button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 w-full">
          <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent drop-shadow-sm mb-3">
            Tape-Taupe des Risques
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
            <span className="bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-purple-500/30 text-slate-200 flex items-center gap-2">
              Niveau : <span className="text-purple-400 font-black text-base">{level}</span>
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-emerald-500/30 text-slate-200 flex items-center gap-2">
              Dossiers traités : <span className="text-emerald-400 font-black text-base">{score}</span>
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-rose-500/30 text-slate-200 flex items-center gap-2">
              Alerte : 
              <div className="flex gap-1.5">
                {[...Array(MAX_ERRORS)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i < errors ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] scale-110' : 'bg-slate-800 border border-slate-700'}`}
                  />
                ))}
              </div>
            </span>
          </div>
        </div>

        {/* Game Grid Area */}
        <div className="relative w-full max-w-2xl bg-slate-950/70 backdrop-blur-2xl rounded-3xl p-3 sm:p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800/80 overflow-hidden">
          
          {/* Grille css 3x3 */}
          <div className="grid grid-cols-3 grid-rows-3 gap-3 sm:gap-4 w-full aspect-square relative z-10">
            {holes.map((mole, i) => (
              <div 
                key={i} 
                className="relative bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer group hover:border-amber-500/40 transition-all duration-200"
                onPointerDown={(e) => handleHoleClick(i, e)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                
                {/* La Taupe (Carte) */}
                {mole && !mole.hit && (
                  <div 
                    className={`absolute inset-1.5 bg-gradient-to-t ${mole.def.color} rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center animate-slide-up border border-white/30 z-10 cursor-pointer active:scale-95 transition-transform`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl pointer-events-none" />
                    <span className="relative z-10 text-4xl sm:text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform">
                      {mole.def.emoji}
                    </span>
                    <span className="relative z-10 text-[11px] sm:text-[13px] font-extrabold uppercase tracking-wide mt-1.5 text-center leading-tight px-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                      {mole.def.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(245,158,11,0.5)] transform -rotate-3 hover:rotate-0 transition-transform">
                <AlertTriangle className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-wide">Prévention des Risques</h2>
              <p className="text-slate-300 max-w-md mx-auto mb-8 font-medium text-sm leading-relaxed">
                Tapez sur les situations dangereuses (<span className="text-amber-400 font-bold">RPS</span>, <span className="text-rose-400 font-bold">Non-respect des horaires</span>, <span className="text-orange-400 font-bold">Chutes</span>) avant qu'il ne soit trop tard ! <br/><br/>
                <span className="inline-block bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-300 text-xs">
                  ⚠️ <strong>ATTENTION :</strong> Ne tapez pas sur le Délégué 🛡️ ni sur les équipements conformes 🦺 !
                </span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-full text-lg transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" />
                Démarrer la partie
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h2 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent mb-2 leading-tight uppercase tracking-wider drop-shadow-[0_0_20px_rgba(225,29,72,0.5)]">
                ALERTE DÉCLENCHÉE !
              </h2>
              <p className="text-slate-300 text-base mb-6 max-w-md">Trop d'accidents ou de non-conformités ont été signalés sur votre site.</p>
              
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl mb-8 flex flex-col items-center min-w-[220px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Dossiers traités</p>
                <p className="text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">{score}</p>
              </div>
              
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-full text-base transition-all shadow-[0_0_25px_rgba(225,29,72,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider"
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
            className={`fixed font-black text-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] pointer-events-none animate-float-up z-50 ${f.color}`}
            style={{ left: f.x - 20, top: f.y - 20 }}
          >
            {f.text}
          </div>
        ))}

      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.8); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-60px) scale(1.5); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default TapeTaupeRisques;
