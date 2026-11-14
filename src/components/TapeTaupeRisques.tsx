import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Flame
} from "lucide-react";

interface TapeTaupeRisquesProps {
  onClose: () => void;
}

// --- RH GAME DEFINITIONS ---
type CharacterType = "danger" | "gold" | "peace";

interface RHItemDef {
  id: string;
  type: CharacterType;
  label: string;
  category: string;
  points: number;
  desc: string;
}

const RH_ITEMS: RHItemDef[] = [
  // 1. RISQUES RH (Taupes brunes ordinaires - À FRAPPER !)
  { id: "rps", type: "danger", label: "Burnout & RPS", category: "Santé au Travail", points: 100, desc: "Risque psycho-social prévenu !" },
  { id: "heures", type: "danger", label: "Dépassement 1607h", category: "Temps de Travail", points: 100, desc: "Régularisation du temps de travail !" },
  { id: "chute", type: "danger", label: "Accident de Service", category: "Sécurité", points: 100, desc: "Mesure de prévention appliquée !" },
  { id: "harcelement", type: "danger", label: "Harcèlement / Conflit", category: "Climat Social", points: 100, desc: "Médiation RH enclenchée !" },
  { id: "amiante", type: "danger", label: "Amiante & Toxiques", category: "Locaux", points: 100, desc: "Mise en sécurité immédiate !" },
  { id: "dossier", type: "danger", label: "Dossier en Retard", category: "Gestion Carrière", points: 100, desc: "Dossier agent traité !" },
  { id: "agression", type: "danger", label: "Agression Usager", category: "Accueil Public", points: 100, desc: "Protection fonctionnelle accordée !" },
  { id: "fraude", type: "danger", label: "Cumul Non Autorisé", category: "Déontologie", points: 100, desc: "Contrôle déontologique effectué !" },

  // 2. BONUS DORÉS (Taupe dorée couronnée - JACKPOT !)
  { id: "prime_cia", type: "gold", label: "Prime CIA Débloquée", category: "Rémunération", points: 300, desc: "Enveloppe indemnitaire débloquée !" },
  { id: "audit_crc", type: "gold", label: "Audit CRC Exemplaire", category: "Conformité", points: 300, desc: "Félicitations de la Chambre Régionale !" },
  { id: "budget_valide", type: "gold", label: "Budget RH Validé", category: "Finances", points: 300, desc: "Crédits de recrutement ouverts !" },
  { id: "accord_social", type: "gold", label: "Accord Social Signé", category: "Dialogue Social", points: 300, desc: "Protocole d'accord unanime !" },

  // 3. PROTÉGÉS / BONNES PRATIQUES (Tortue en bonnet de nuit 💤 - NE PAS FRAPPER !)
  { id: "deconnexion", type: "peace", label: "Droit Déconnexion", category: "Repos Garanti", points: -150, desc: "Aïe ! Il fallait laisser l'agent se reposer !" },
  { id: "delegue", type: "peace", label: "Délégué Syndical", category: "Dialogue Social", points: -150, desc: "Erreur ! Le dialogue social est protégé !" },
  { id: "rtt", type: "peace", label: "Agent en RTT", category: "Temps Libre", points: -150, desc: "Erreur ! Respectez les congés acquis !" },
  { id: "visite_med", type: "peace", label: "Visite Médicale", category: "Santé", points: -150, desc: "Erreur ! La visite médicale est essentielle !" },
  { id: "formation", type: "peace", label: "Formation Sécurité", category: "Compétences", points: -150, desc: "Erreur ! La formation ne doit pas être interrompue !" },
  { id: "epi", type: "peace", label: "Équipement EPI", category: "Protection", points: -150, desc: "Erreur ! L'agent portait son casque et son gilet !" }
];

interface ActiveSlot {
  id: number;
  item: RHItemDef;
  spawnTime: number;
  duration: number;
  isHit: boolean;
  hitType?: CharacterType;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
}

interface PopFeedback {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

const MAX_HEARTS = 4;
const HOLE_COUNT = 6; // 2 rows of 3 holes matching the cartoon design

const TapeTaupeRisques: React.FC<TapeTaupeRisquesProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [stats, setStats] = useState({ dangersHit: 0, goldHit: 0, peaceMistakes: 0 });

  // 6 Holes board
  const [holes, setHoles] = useState<(ActiveSlot | null)[]>(Array(HOLE_COUNT).fill(null));
  const holesRef = useRef<(ActiveSlot | null)[]>(Array(HOLE_COUNT).fill(null));

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Particles & Popups
  const [stars, setStars] = useState<StarParticle[]>([]);
  const [feedbacks, setFeedbacks] = useState<PopFeedback[]>([]);

  // Mallet Position & Swing
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isSwinging, setIsSwinging] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Sync refs
  const gameActiveRef = useRef(false);
  const slotIdCounter = useRef(0);
  const starIdCounter = useRef(0);
  const feedbackIdCounter = useRef(0);
  const scoreRef = useRef(0);
  const heartsRef = useRef(MAX_HEARTS);

  useEffect(() => { holesRef.current = holes; }, [holes]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { heartsRef.current = hearts; }, [hearts]);

  // Procedural Sound Generator (Web Audio API)
  const playSound = useCallback((type: "whack" | "gold" | "hurt" | "whoosh" | "gameover" | "start") => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      if (type === "whack") {
        // Crisp cartoon hammer thud + boing
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "gold") {
        // High sparkling bell arpeggio
        [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.25);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.25);
        });
      } else if (type === "hurt") {
        // Low discordant error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "whoosh") {
        // Fast air whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "start") {
        // Happy arcade chime
        [392, 523.25, 659.25, 783.99].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.25, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.2);
        });
      }
    } catch {
      // Audio policy safe
    }
  }, [isMuted]);

  // Star Explosion generator
  const triggerStars = useCallback((cx: number, cy: number, isGolden: boolean) => {
    const starCount = isGolden ? 12 : 7;
    const colors = isGolden 
      ? ["#facc15", "#fef08a", "#ffffff", "#fbbf24"] 
      : ["#fbbf24", "#f43f5e", "#ffffff", "#38bdf8"];

    const newStars: StarParticle[] = [];
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount + (Math.random() - 0.5) * 0.5;
      const speed = 3.5 + Math.random() * 5.5;
      newStars.push({
        id: starIdCounter.current++,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 14 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360
      });
    }
    setStars(prev => [...prev, ...newStars]);
  }, []);

  const addFeedback = useCallback((text: string, color: string, cx: number, cy: number) => {
    const id = feedbackIdCounter.current++;
    setFeedbacks(prev => [...prev, { id, text, color, x: cx, y: cy }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 750);
  }, []);

  // Animate stars physics
  useEffect(() => {
    if (stars.length === 0) return;
    const interval = requestAnimationFrame(() => {
      setStars(prev => 
        prev
          .map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.35, // Gravity
            rotation: s.rotation + 8,
            size: Math.max(0, s.size - 0.5)
          }))
          .filter(s => s.size > 2)
      );
    });
    return () => cancelAnimationFrame(interval);
  }, [stars]);

  // Game Over trigger
  const handleGameOver = useCallback(() => {
    gameActiveRef.current = false;
    playSound("hurt");
    setGameState("gameover");
  }, [playSound]);

  // Lose a heart
  const loseHeart = useCallback((reason: string) => {
    setHearts(h => {
      const next = h - 1;
      if (next <= 0) {
        handleGameOver();
      }
      return Math.max(0, next);
    });
    setCombo(0);
    playSound("hurt");
    addFeedback(reason, "text-rose-400", window.innerWidth / 2, window.innerHeight / 2 - 40);
  }, [handleGameOver, playSound, addFeedback]);

  // Spawn Mole Logic
  const spawnMole = useCallback(() => {
    if (!gameActiveRef.current) return;

    const currentHoles = [...holesRef.current];
    const emptyHoleIdxs = currentHoles
      .map((slot, idx) => (slot === null ? idx : -1))
      .filter(idx => idx !== -1);

    if (emptyHoleIdxs.length === 0) return;

    const chosenIdx = emptyHoleIdxs[Math.floor(Math.random() * emptyHoleIdxs.length)];

    // Type distribution:
    // 68% Normal Risk Mole (Brown)
    // 16% King Golden Mole (Gold)
    // 16% Sleeping Turtle (Protected Good Practice)
    const roll = Math.random();
    let pickedType: CharacterType = "danger";
    if (roll < 0.16) {
      pickedType = "gold";
    } else if (roll < 0.32) {
      pickedType = "peace";
    }

    const pool = RH_ITEMS.filter(item => item.type === pickedType);
    const item = pool[Math.floor(Math.random() * pool.length)];

    // Dynamic duration based on score
    const curLevel = Math.min(10, Math.floor(scoreRef.current / 600) + 1);
    setLevel(curLevel);

    // Speed up as level increases: from 2200ms down to 850ms
    const baseDuration = pickedType === "gold" ? 1400 : 2200;
    const duration = Math.max(800, baseDuration * Math.pow(0.89, curLevel - 1));

    const newSlot: ActiveSlot = {
      id: slotIdCounter.current++,
      item,
      spawnTime: performance.now(),
      duration,
      isHit: false
    };

    currentHoles[chosenIdx] = newSlot;
    setHoles(currentHoles);
  }, []);

  // Main Loop: manage mole lifetimes and spawn triggers
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;
    let lastSpawn = performance.now();

    const loop = (timestamp: number) => {
      if (!gameActiveRef.current) return;

      const currentHoles = [...holesRef.current];
      let hasChanges = false;

      // 1. Check expired moles
      for (let i = 0; i < currentHoles.length; i++) {
        const slot = currentHoles[i];
        if (slot) {
          const age = timestamp - slot.spawnTime;
          if (age > slot.duration) {
            // Expired without being hit
            if (!slot.isHit && slot.item.type === "danger") {
              // A danger was ignored!
              loseHeart(`Risque ignoré : ${slot.item.label}`);
            }
            currentHoles[i] = null;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        setHoles(currentHoles);
      }

      // 2. Trigger new spawns
      const curLevel = Math.min(10, Math.floor(scoreRef.current / 600) + 1);
      const spawnInterval = Math.max(550, 1600 * Math.pow(0.88, curLevel - 1));

      if (timestamp - lastSpawn > spawnInterval) {
        spawnMole();
        // Occasional double mole at level 3+
        if (curLevel >= 3 && Math.random() < 0.28) {
          spawnMole();
        }
        lastSpawn = timestamp;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, loseHeart, spawnMole]);

  // Click on Hole
  const handleHoleHit = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== "playing") return;

    // Position of strike for particles
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const hitX = rect.left + rect.width / 2;
    const hitY = rect.top + rect.height * 0.45;

    // Trigger visual swing
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 140);

    const currentHoles = [...holesRef.current];
    const slot = currentHoles[index];

    if (!slot || slot.isHit) {
      playSound("whoosh");
      return;
    }

    slot.isHit = true;
    slot.hitType = slot.item.type;

    if (slot.item.type === "danger") {
      // Whack normal risk mole
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      const comboBonus = Math.min(150, (newCombo - 1) * 20);
      const gained = slot.item.points + comboBonus;

      setScore(s => s + gained);
      setStats(st => ({ ...st, dangersHit: st.dangersHit + 1 }));
      playSound("whack");
      triggerStars(hitX, hitY, false);
      addFeedback(`+${gained}`, "text-amber-300", hitX, hitY - 20);
    } else if (slot.item.type === "gold") {
      // Golden King Mole Jackpot!
      const gained = slot.item.points + 100;
      setScore(s => s + gained);
      setStats(st => ({ ...st, goldHit: st.goldHit + 1 }));
      playSound("gold");
      triggerStars(hitX, hitY, true);
      addFeedback(`★ ROYAL +${gained} !`, "text-yellow-300", hitX, hitY - 25);
    } else if (slot.item.type === "peace") {
      // Hit a protected sleeping turtle!
      setStats(st => ({ ...st, peaceMistakes: st.peaceMistakes + 1 }));
      loseHeart("Non ! Agent protégé en repos !");
      playSound("hurt");
      addFeedback("NON !", "text-rose-500", hitX, hitY - 20);
    }

    // Retract mole after hit effect
    setTimeout(() => {
      const refreshed = [...holesRef.current];
      if (refreshed[index]?.id === slot.id) {
        refreshed[index] = null;
        setHoles(refreshed);
      }
    }, 280);

    setHoles(currentHoles);
  };

  // Mallet Cursor Tracking
  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleBoardMouseLeave = () => {
    setMousePos(null);
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHearts(MAX_HEARTS);
    setLevel(1);
    setStats({ dangersHit: 0, goldHit: 0, peaceMistakes: 0 });
    setHoles(Array(HOLE_COUNT).fill(null));
    gameActiveRef.current = true;
    slotIdCounter.current = 0;
    playSound("start");
    setGameState("playing");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 select-none pb-8">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Espace Jeux</span>
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black tracking-wide uppercase font-mono text-white flex items-center justify-center gap-2">
              <span className="text-amber-400">🔨</span> TAPE-TAUPE DES RISQUES RH
            </h1>
            <p className="text-[11px] text-slate-400">Éliminez les risques professionnels, préservez les agents protégés !</p>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs"
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

        </div>
      </header>

      {/* Main Arcade Frame */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 flex-1 w-full flex flex-col items-center">
        
        {/* CARTOON ARCADE CONSOLE (Like Reference Image) */}
        <div className="relative w-full max-w-[680px] flex flex-col items-center">
          
          {/* Top Yellow Handle on Console */}
          <div className="w-44 h-9 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-2xl border-4 border-b-0 border-amber-500 shadow-md flex items-center justify-center -mb-2 z-10">
            <div className="w-24 h-3 bg-slate-900/40 rounded-full border border-amber-600/40" />
          </div>

          {/* Console Outer Bezel (Cyan / Turquoise Arcade Box) */}
          <div className="w-full bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 rounded-[2.5rem] p-3 sm:p-5 shadow-[0_20px_50px_rgba(2,132,199,0.35)] border-4 border-sky-300/80 relative overflow-hidden">
            
            {/* Glossy top reflection on arcade casing */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/20 rounded-t-[2.2rem] pointer-events-none" />

            {/* Inner Dashboard Bar */}
            <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-2.5 sm:px-4 mb-3 border border-sky-200/40 flex items-center justify-between gap-2 shadow-inner text-xs sm:text-sm font-mono font-bold">
              
              {/* Hearts / Vies */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-rose-400 font-black mr-1 hidden sm:inline">Vies :</span>
                {[...Array(MAX_HEARTS)].map((_, i) => (
                  <span 
                    key={i}
                    className={`text-base sm:text-lg transition-transform ${
                      i < hearts ? "text-rose-500 scale-100 animate-pulse" : "text-slate-700 opacity-40 scale-75"
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              {/* Combo Multiplier */}
              {combo > 1 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 rounded-xl font-black text-xs uppercase animate-bounce shadow-lg">
                  <Flame className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Combo x{combo}</span>
                </div>
              )}

              {/* Score Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-1.5 rounded-xl font-black shadow-md">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span className="text-xs uppercase">Score :</span>
                <span className="text-base sm:text-lg font-mono font-black">{score}</span>
              </div>

            </div>

            {/* GAME FIELD (Landscape with sky & lawn matching reference) */}
            <div 
              ref={boardRef}
              onMouseMove={handleBoardMouseMove}
              onMouseLeave={handleBoardMouseLeave}
              className="relative w-full aspect-[4/3] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/30 select-none cursor-none bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400"
            >
              
              {/* Floating Cartoon Lily Pad / Clouds in Sky */}
              <div className="absolute top-4 left-8 w-14 h-8 bg-emerald-400/80 rounded-full border-2 border-emerald-500 shadow-sm transform -rotate-12 pointer-events-none" />
              <div className="absolute top-6 right-10 w-12 h-7 bg-emerald-400/80 rounded-full border-2 border-emerald-500 shadow-sm transform rotate-6 pointer-events-none" />

              {/* Distant Hills separator (Pastel Yellow / Light Green curve) */}
              <div className="absolute top-[22%] left-0 right-0 h-8 bg-[#fef08a] rounded-t-[100%] border-t-2 border-[#facc15] pointer-events-none opacity-90" />

              {/* Vibrant Green Grass Ground */}
              <div className="absolute top-[26%] inset-x-0 bottom-0 bg-gradient-to-b from-[#86efac] via-[#4ade80] to-[#22c55e]">
                
                {/* Lawn pattern highlights */}
                <div className="absolute inset-0 bg-[radial-gradient(#bbf7d0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
                
              </div>

              {/* 6 HOLES GRID (2 Rows of 3 Holes) */}
              <div className="relative z-10 w-full h-full pt-[22%] px-4 sm:px-8 grid grid-cols-3 grid-rows-2 gap-x-4 sm:gap-x-8 gap-y-6 sm:gap-y-9 pb-6">
                
                {holes.map((slot, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleHoleHit(idx, e)}
                    onTouchStart={(e) => handleHoleHit(idx, e)}
                    className="relative w-full h-full flex flex-col items-center justify-end group active:scale-95 transition-transform"
                  >
                    
                    {/* The Dirt Hole (3D Oval Rim with dark pit) */}
                    <div className="w-[90%] sm:w-[85%] h-12 sm:h-14 rounded-[100%] bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#451a03] p-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] border-2 border-[#b45309]/80 relative flex items-center justify-center">
                      {/* Deep Pit Darkness */}
                      <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-[#180d05] to-[#271406] shadow-[inset_0_8px_14px_rgba(0,0,0,0.9)]" />
                    </div>

                    {/* CHARACTER EMERGENCE CONTAINER (Masked by hole rim) */}
                    <div className="absolute bottom-5 sm:bottom-6 w-full h-[155%] overflow-hidden flex flex-col items-center justify-end pointer-events-none">
                      
                      {slot && (
                        <div 
                          className={`relative flex flex-col items-center transition-all duration-150 origin-bottom ${
                            slot.isHit 
                              ? "scale-90 translate-y-3" 
                              : "animate-mole-rise"
                          }`}
                        >
                          
                          {/* ==================================================== */}
                          {/* 1. TAUPES RISQUES RH (Taupe Brune avec grandes dents) */}
                          {/* ==================================================== */}
                          {slot.item.type === "danger" && (
                            <div className="relative flex flex-col items-center">
                              
                              {/* Mole Body */}
                              <div className="w-16 h-22 sm:w-20 sm:h-26 bg-gradient-to-b from-[#8d5b4c] via-[#784435] to-[#5c3125] rounded-t-[2.5rem] rounded-b-2xl border-3 border-[#5c3125] shadow-xl flex flex-col items-center relative overflow-hidden">
                                
                                {/* Belly highlight */}
                                <div className="absolute bottom-0 w-12 sm:w-14 h-10 bg-[#fde047]/30 rounded-t-full pointer-events-none" />

                                {/* Eyes */}
                                <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 sm:gap-3 z-10">
                                  {slot.isHit ? (
                                    <>
                                      <span className="text-black font-black text-xs sm:text-sm">✕</span>
                                      <span className="text-black font-black text-xs sm:text-sm">✕</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2.5 h-3.5 sm:w-3 sm:h-4 bg-slate-950 rounded-full flex items-start justify-end p-0.5">
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                      </div>
                                      <div className="w-2.5 h-3.5 sm:w-3 sm:h-4 bg-slate-950 rounded-full flex items-start justify-end p-0.5">
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Muzzle & Teeth */}
                                <div className="mt-1 w-9 sm:w-11 h-6 bg-[#fde68a] rounded-full border border-amber-300 flex flex-col items-center justify-between p-0.5 shadow-sm z-10">
                                  {/* Pink Nose */}
                                  <div className="w-3.5 h-2 bg-rose-500 rounded-full" />
                                  {/* Buck teeth */}
                                  <div className="flex gap-0.5">
                                    <div className="w-1.5 h-2 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                                    <div className="w-1.5 h-2 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                                  </div>
                                </div>

                                {/* Chest Danger Emblem */}
                                <div className="mt-1 px-1.5 py-0.2 rounded-full bg-rose-600/90 text-white text-[8px] font-black tracking-tight border border-rose-300 shadow-sm z-10">
                                  RISQUE RH
                                </div>

                              </div>

                            </div>
                          )}

                          {/* ==================================================== */}
                          {/* 2. TAUPE DORÉE ROYALE (King Gold Mole with Crown)    */}
                          {/* ==================================================== */}
                          {slot.item.type === "gold" && (
                            <div className="relative flex flex-col items-center">
                              
                              {/* Shiny Crown on Top */}
                              <div className="relative z-20 -mb-2 flex flex-col items-center">
                                <div className="w-8 sm:w-10 h-5 bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 border-2 border-amber-600 rounded-t-sm [clip-path:polygon(0%_100%,0%_20%,25%_60%,50%_0%,75%_60%,100%_20%,100%_100%)] shadow-md" />
                                <div className="w-9 sm:w-11 h-1.5 bg-amber-600 rounded-full -mt-0.5" />
                              </div>

                              {/* Golden Body */}
                              <div className="w-16 h-22 sm:w-20 sm:h-26 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 rounded-t-[2.5rem] rounded-b-2xl border-3 border-amber-600 shadow-[0_0_20px_rgba(250,204,21,0.6)] flex flex-col items-center relative overflow-hidden">
                                
                                {/* Shimmer overlay */}
                                <div className="absolute top-0 right-0 w-8 h-full bg-white/30 transform rotate-12 pointer-events-none" />

                                {/* Eyes */}
                                <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 sm:gap-3 z-10">
                                  {slot.isHit ? (
                                    <>
                                      <span className="text-black font-black text-xs sm:text-sm">★</span>
                                      <span className="text-black font-black text-xs sm:text-sm">★</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2.5 h-3.5 sm:w-3 sm:h-4 bg-slate-950 rounded-full flex items-start justify-end p-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                      <div className="w-2.5 h-3.5 sm:w-3 sm:h-4 bg-slate-950 rounded-full flex items-start justify-end p-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Muzzle */}
                                <div className="mt-1 w-9 sm:w-11 h-6 bg-amber-100 rounded-full border border-amber-400 flex flex-col items-center justify-between p-0.5 shadow-sm z-10">
                                  <div className="w-3.5 h-2 bg-amber-600 rounded-full" />
                                  <div className="flex gap-0.5">
                                    <div className="w-1.5 h-2 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                                    <div className="w-1.5 h-2 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                                  </div>
                                </div>

                                {/* Chest Golden Star */}
                                <div className="mt-1 text-[10px] text-amber-950 font-black z-10">
                                  ★ +300 ★
                                </div>

                              </div>

                            </div>
                          )}

                          {/* ==================================================== */}
                          {/* 3. TORTUE / BONNES PRATIQUES (Sleeping Turtle 💤)    */}
                          {/* ==================================================== */}
                          {slot.item.type === "peace" && (
                            <div className="relative flex flex-col items-center">
                              
                              {/* Blue Sleeping Nightcap with white pompom */}
                              <div className="relative z-20 -mb-2 flex items-center">
                                <div className="w-10 sm:w-12 h-6 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-t-full border-2 border-sky-300 transform -rotate-12 shadow-sm relative flex items-center justify-end">
                                  <div className="w-3 h-3 bg-white rounded-full border border-sky-200 absolute -top-1 -right-1 shadow-sm" />
                                  <span className="text-[10px] text-white font-mono font-bold mr-2">zZz</span>
                                </div>
                              </div>

                              {/* Green Turtle Shell & Head */}
                              <div className="w-16 h-22 sm:w-20 sm:h-26 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 rounded-t-[2.5rem] rounded-b-2xl border-3 border-emerald-700 shadow-md flex flex-col items-center relative overflow-hidden">
                                
                                {/* Turtle shell hex segments */}
                                <div className="absolute inset-x-2 bottom-1 h-10 border-2 border-emerald-700/50 rounded-t-xl bg-emerald-600/30 grid grid-cols-2 gap-1 p-0.5" />

                                {/* Sleeping closed eyes */}
                                <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 sm:gap-3 z-10">
                                  <div className="w-3 h-1 bg-slate-900 rounded-full" />
                                  <div className="w-3 h-1 bg-slate-900 rounded-full" />
                                </div>

                                {/* Gentle Muzzle */}
                                <div className="mt-1.5 w-8 sm:w-10 h-5 bg-emerald-200 rounded-full border border-emerald-400 flex items-center justify-center shadow-inner z-10">
                                  <div className="w-1.5 h-1 bg-emerald-700 rounded-full" />
                                </div>

                                {/* Chest Peaceful Icon */}
                                <div className="mt-1 text-[9px] text-emerald-950 font-black z-10">
                                  🛡️ PROTÉGÉ
                                </div>

                              </div>

                            </div>
                          )}

                        </div>
                      )}

                    </div>

                    {/* 100% VISIBLE LABEL BADGE (Directly Under the Hole & Character) */}
                    {slot && (
                      <div className="absolute -bottom-3.5 sm:-bottom-4 z-30 pointer-events-none transition-all animate-pop-in flex justify-center w-full px-0.5">
                        <div 
                          className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide shadow-[0_6px_14px_rgba(0,0,0,0.8)] border-2 flex items-center justify-center gap-1.5 max-w-full ${
                            slot.item.type === "danger"
                              ? "bg-rose-600 text-white border-rose-300 ring-2 ring-rose-950"
                              : slot.item.type === "gold"
                              ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-white ring-2 ring-amber-700 shadow-[0_0_15px_rgba(250,204,21,0.7)]"
                              : "bg-emerald-600 text-white border-emerald-200 ring-2 ring-emerald-950"
                          }`}
                        >
                          <span className="text-xs sm:text-sm flex-shrink-0">
                            {slot.item.type === "danger" ? "⚠️" : slot.item.type === "gold" ? "👑" : "🛡️"}
                          </span>
                          <span className="truncate">
                            {slot.item.type === "gold" ? `+300 : ${slot.item.label}` : slot.item.type === "peace" ? `PROTÉGÉ : ${slot.item.label}` : slot.item.label}
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}

              </div>

              {/* FLOATING STARS BURST PARTICLES */}
              {stars.map(s => (
                <div
                  key={s.id}
                  className="absolute pointer-events-none font-black text-center"
                  style={{
                    left: s.x - (boardRef.current?.getBoundingClientRect().left || 0),
                    top: s.y - (boardRef.current?.getBoundingClientRect().top || 0),
                    fontSize: `${s.size}px`,
                    color: s.color,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                    textShadow: "0 0 6px rgba(0,0,0,0.6)"
                  }}
                >
                  ✦
                </div>
              ))}

              {/* POPUP SCORE FEEDBACK */}
              {feedbacks.map(f => (
                <div
                  key={f.id}
                  className={`absolute pointer-events-none font-black text-xl sm:text-2xl font-mono animate-pop-up z-40 ${f.color}`}
                  style={{
                    left: f.x - (boardRef.current?.getBoundingClientRect().left || 0),
                    top: f.y - (boardRef.current?.getBoundingClientRect().top || 0),
                    textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
                  }}
                >
                  {f.text}
                </div>
              ))}

              {/* INTERACTIVE CARTOON MALLET (Tracks cursor inside board) */}
              {mousePos && (
                <div
                  className={`absolute pointer-events-none z-50 transition-transform duration-75 origin-[75%_25%] ${
                    isSwinging ? "rotate-[-45deg] scale-110" : "rotate-[15deg]"
                  }`}
                  style={{
                    left: mousePos.x - 45,
                    top: mousePos.y - 75
                  }}
                >
                  {/* Cartoon Mallet SVG */}
                  <svg width="90" height="90" viewBox="0 0 100 100" fill="none" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
                    {/* Wooden Handle */}
                    <rect x="44" y="28" width="12" height="65" rx="6" fill="#d97706" stroke="#92400e" strokeWidth="3" transform="rotate(-32 44 28)" />
                    <rect x="47" y="32" width="4" height="55" rx="2" fill="#fbbf24" opacity="0.6" transform="rotate(-32 47 32)" />

                    {/* Red Hammer Barrel */}
                    <g transform="translate(10, 10) rotate(-15)">
                      <rect x="8" y="10" width="54" height="34" rx="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="3.5" />
                      
                      {/* Left Yellow Striated Ring */}
                      <rect x="4" y="8" width="10" height="38" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
                      
                      {/* Right Yellow Striated Ring */}
                      <rect x="56" y="8" width="10" height="38" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
                      
                      {/* Glossy highlight */}
                      <rect x="18" y="14" width="34" height="6" rx="3" fill="#ffffff" opacity="0.5" />
                    </g>
                  </svg>
                </div>
              )}

              {/* OVERLAY: START SCREEN */}
              {gameState === "ready" && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
                  
                  {/* Big Animated Icon */}
                  <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-rose-500 to-sky-400 rounded-3xl p-1 shadow-2xl flex items-center justify-center mb-3 animate-bounce">
                    <div className="w-full h-full bg-slate-900 rounded-[1.3rem] flex items-center justify-center text-4xl">
                      🔨
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mb-1 uppercase tracking-wider">
                    TAPE-TAUPE DES RISQUES RH
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mb-4 font-medium leading-relaxed">
                    Les risques professionnels envahissent la collectivité ! Utilisez votre marteau RH pour taper sur les dangers et débloquer les primes exceptionnelles.
                  </p>

                  {/* Rules Legend */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-5 text-[11px] font-mono">
                    <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-rose-500/40 text-rose-300 flex flex-col items-center gap-1">
                      <span className="text-xl">⚠️</span>
                      <strong className="text-white">Taupes Brunes</strong>
                      <span>+100 pts : Risques à taper vite</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-amber-400/50 text-amber-300 flex flex-col items-center gap-1">
                      <span className="text-xl">👑</span>
                      <strong className="text-white">Taupe Dorée</strong>
                      <span>+300 pts : Bonus Royal RH</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-emerald-500/40 text-emerald-300 flex flex-col items-center gap-1">
                      <span className="text-xl">💤</span>
                      <strong className="text-white">Tortue en Repos</strong>
                      <span className="text-rose-400 font-bold">NE PAS TAPER (-1 vie)</span>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black rounded-full text-sm sm:text-base uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(52,211,153,0.5)] active:scale-95 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" /> Lancer la Partie RH
                  </button>
                </div>
              )}

              {/* OVERLAY: GAME OVER SCREEN */}
              {gameState === "gameover" && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
                  
                  <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl border border-rose-500/40 flex items-center justify-center mb-2 shadow-xl">
                    <ShieldAlert className="w-8 h-8" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mb-1 uppercase tracking-wider">
                    BILAN RH TERMINÉ !
                  </h2>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Toutes vos vies ont été consommées. Voici les résultats de votre intervention :
                  </p>

                  {/* Final Score Card */}
                  <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl w-full max-w-xs mb-5">
                    <div className="text-[11px] uppercase font-mono text-slate-400 font-bold">Score Final</div>
                    <div className="text-4xl font-black font-mono text-amber-400 my-1">{score}</div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">DANGERS</span>
                        <strong className="text-white text-xs">{stats.dangersHit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ROYAL</span>
                        <strong className="text-amber-300 text-xs">{stats.goldHit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">COMBO MAX</span>
                        <strong className="text-sky-400 text-xs">x{maxCombo}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Rejouer
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      Quitter
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Bottom Controls / Help info */}
          <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-400 font-mono bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Clic / Toucher pour frapper avec le marteau</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Moteur Web: React + SVG + Web Audio
            </span>
          </div>

        </div>

      </main>

      {/* Animation Styles */}
      <style>{`
        @keyframes moleRise {
          0% { transform: translateY(110%); }
          70% { transform: translateY(-5%); }
          100% { transform: translateY(0%); }
        }
        .animate-mole-rise {
          animation: moleRise 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-45px) scale(1); opacity: 0; }
        }
        .animate-pop-up {
          animation: popUp 0.75s ease-out forwards;
        }

        @keyframes popIn {
          0% { transform: scale(0.7) translateY(6px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.16s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

    </div>
  );
};

export default TapeTaupeRisques;
