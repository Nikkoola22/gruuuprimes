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
    <div className="relative min-h-screen flex flex-col pt-4 overflow-x-hidden bg-sky-200 text-slate-800 touch-none select-none font-sans">
      
      {/* Sky Clouds (Background) */}
      <div className="absolute top-10 left-10 w-32 h-12 bg-white rounded-full opacity-80 pointer-events-none" style={{ boxShadow: '40px -10px 0 10px white, 80px 0 0 0 white' }}></div>
      <div className="absolute top-24 right-20 w-24 h-8 bg-white rounded-full opacity-70 pointer-events-none" style={{ boxShadow: '30px -15px 0 5px white, 60px 0 0 -5px white' }}></div>
      
      <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center h-full w-full px-2">
        
        {/* Retour button */}
        <div className="absolute top-0 left-2 sm:top-2 sm:left-4 z-50">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
        </div>

        {/* Header - Cartoon Style UI */}
        <div className="text-center mb-4 w-full mt-10">
          
          <div className="flex justify-center gap-4 text-xs sm:text-sm font-bold mt-2">
            
            {/* Vies / Alerte (Red Cross style in image) */}
            <div className="bg-[#4e2d1d] border-4 border-[#8c5a35] rounded-full px-4 py-1.5 flex items-center justify-center min-w-[120px] text-white shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-white" style={{ clipPath: 'polygon(33% 0, 66% 0, 66% 33%, 100% 33%, 100% 66%, 66% 66%, 66% 100%, 33% 100%, 33% 66%, 0 66%, 0 33%, 33% 33%)' }}></div>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[...Array(MAX_ERRORS)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i < errors ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)] scale-110' : 'bg-slate-700 border border-slate-900'}`}
                  />
                ))}
              </div>
            </div>

            {/* Score */}
            <div className="bg-[#4e2d1d] border-4 border-[#8c5a35] rounded-full px-6 py-2 flex items-center text-white shadow-lg">
              <span className="text-amber-400 mr-2 text-lg">★</span>
              <span className="text-[10px] mr-2 opacity-80 uppercase">Score</span>
              <span className="text-2xl font-black">{score * 100}</span>
            </div>
            
          </div>
        </div>

        {/* Game Field Container */}
        <div className="relative w-full max-w-[500px] flex-1 mt-4 rounded-t-3xl border-4 border-amber-600/50 shadow-2xl overflow-hidden bg-[#593d2b] flex flex-col items-center">
          
          {/* Trees Background (Dark Green Zigzags) */}
          <div className="absolute top-0 left-0 w-full h-12 bg-[#2d4b24]" 
               style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%, 0% 100%)' }} />
          
          {/* Grass Strip */}
          <div className="absolute top-10 left-0 w-full h-8 bg-[#65a30d] border-b-4 border-[#4d7c0f] z-10" />

          {/* Dirt Area (with scattered rocks) */}
          <div className="relative w-full h-full mt-20 p-2 sm:p-4 grid grid-cols-3 grid-rows-3 gap-x-2 gap-y-6 sm:gap-y-8 z-10 pb-8">
            
            {/* Random rocks */}
            <div className="absolute top-32 left-8 w-6 h-3 bg-[#78716c] rounded-[100%] opacity-80 pointer-events-none" />
            <div className="absolute top-48 right-12 w-4 h-2 bg-[#78716c] rounded-[100%] opacity-80 pointer-events-none" />
            <div className="absolute bottom-20 left-1/3 w-7 h-4 bg-[#57534e] rounded-[100%] opacity-80 pointer-events-none" />
            <div className="absolute bottom-8 right-1/4 w-5 h-2 bg-[#a8a29e] rounded-[100%] opacity-80 pointer-events-none" />

            {holes.map((mole, i) => (
              <div 
                key={i} 
                className="relative w-full aspect-[5/4] flex items-end justify-center cursor-pointer group"
                onPointerDown={(e) => handleHoleClick(i, e)}
              >
                {/* The Hole (Dark Ellipse on ground) */}
                <div className="absolute bottom-0 w-[85%] h-[40%] bg-[#2a1b12] rounded-[100%] shadow-[inset_0_5px_8px_rgba(0,0,0,0.8)] border border-[#3e271a]" />
                
                {/* Hole number (for styling debug/look) */}
                <div className="absolute -bottom-5 text-[#8b6145] text-xs font-bold">{i}</div>

                {/* The Mole (Masked to look like it's coming out of the hole) */}
                <div className="absolute bottom-[20%] w-full h-[150%] overflow-hidden pointer-events-none flex flex-col items-center justify-end pb-4">
                  {mole && !mole.hit && (
                    <div className="relative flex flex-col items-center animate-slide-up origin-bottom">
                      
                      {/* Aura/Glow */}
                      <div className="absolute inset-0 bg-orange-400 rounded-full opacity-30 blur-md" />
                      
                      {/* Mole Body (Flame shape/Character) */}
                      <div className={`relative flex flex-col items-center justify-center p-2 rounded-t-full rounded-b-[2rem] shadow-lg w-20 h-24 ${mole.def.isDanger ? 'bg-gradient-to-t from-red-600 to-orange-400 border-2 border-orange-300' : 'bg-gradient-to-t from-blue-500 to-cyan-400 border-2 border-cyan-200'}`}>
                        
                        {/* Eyes */}
                        <div className="absolute top-8 flex gap-3 w-full justify-center">
                          <div className="w-2.5 h-3.5 bg-black rounded-full" />
                          <div className="w-2.5 h-3.5 bg-black rounded-full" />
                        </div>
                        
                        {/* Emoji inside */}
                        <div className="text-3xl mt-1 drop-shadow-md z-10">{mole.def.emoji}</div>
                        
                        {/* Label Badge */}
                        <div className="absolute -bottom-3 z-20 bg-black/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap border border-white/30 shadow-md">
                          {mole.def.label}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl border-4 border-white flex items-center justify-center mb-4 shadow-xl transform rotate-3">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase drop-shadow-md">TAPE-TAUPE DES RISQUES</h2>
              <p className="text-white max-w-sm font-medium text-sm mb-6 bg-black/50 p-4 rounded-xl border border-white/20">
                Tapez sur les situations dangereuses (<span className="text-orange-400 font-bold">flammes oranges</span>) avant qu'il ne soit trop tard ! <br/><br/>
                Ne tapez pas sur les bonnes pratiques (<span className="text-cyan-400 font-bold">flammes bleues</span>).
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white font-black rounded-full text-xl shadow-[0_6px_0_#166534] hover:translate-y-[2px] hover:shadow-[0_4px_0_#166534] active:translate-y-[6px] active:shadow-none transition-all uppercase"
              >
                <Play className="w-6 h-6 fill-current" />
                JOUER !
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-5xl font-black text-red-500 mb-2 uppercase drop-shadow-[0_2px_4px_#000]">
                TERMINÉ !
              </h2>
              
              <div className="bg-[#4e2d1d] border-4 border-[#8c5a35] p-5 rounded-2xl mb-8 flex flex-col items-center min-w-[200px] shadow-xl mt-4">
                <p className="text-amber-200 text-xs font-bold mb-1">SCORE FINAL</p>
                <p className="text-5xl font-black text-white">{score * 100}</p>
              </div>
              
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white font-black rounded-full text-lg shadow-[0_6px_0_#1e3a8a] hover:translate-y-[2px] hover:shadow-[0_4px_0_#1e3a8a] active:translate-y-[6px] active:shadow-none transition-all uppercase"
              >
                <ArrowLeft className="w-5 h-5" />
                REJOUER
              </button>
            </div>
          )}

        </div>
        
        {/* Feedbacks clics */}
        {feedback.map(f => (
          <div 
            key={f.id}
            className={`fixed font-black text-3xl pointer-events-none animate-float-up z-50 ${f.color}`}
            style={{ 
              left: f.x - 20, 
              top: f.y - 20,
              textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
            }}
          >
            {f.text}
          </div>
        ))}

      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0%); }
        }
        .animate-slide-up {
          animation: slideUp 0.15s ease-out forwards;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TapeTaupeRisques;
