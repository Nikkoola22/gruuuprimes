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
  Flame,
  Maximize2
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
  hitTime?: number;
  isDiving?: boolean;
}

interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
}

interface PopFeedback {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

const MAX_HEARTS = 5;
const HOLE_COUNT = 6; // 2 rows of 3 holes matching the cartoon console

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

  // High-performance Particle Canvas (0 React Re-renders, silky 60/120fps)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<CanvasParticle[]>([]);

  // Popups Feedbacks
  const [feedbacks, setFeedbacks] = useState<PopFeedback[]>([]);
  const feedbackIdCounter = useRef(0);

  // Mallet Hardware-Accelerated Refs (0ms Input Latency)
  const malletRef = useRef<HTMLDivElement | null>(null);
  const isSwingingRef = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const lastHurtTimeRef = useRef(0);

  // Sync refs
  const gameActiveRef = useRef(false);
  const slotIdCounter = useRef(0);
  const scoreRef = useRef(0);
  const heartsRef = useRef(MAX_HEARTS);

  useEffect(() => { holesRef.current = holes; }, [holes]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { heartsRef.current = hearts; }, [hearts]);

  // Handle Canvas Resize for dynamic crisp DPR rendering
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Web Audio Synthesizer
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
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "gold") {
        [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.045);
          gain.gain.setValueAtTime(0.25, now + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.045 + 0.28);
          osc.start(now + idx * 0.045);
          osc.stop(now + idx * 0.045 + 0.28);
        });
      } else if (type === "hurt") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.28);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === "whoosh") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === "start") {
        [392, 523.25, 659.25, 783.99].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.28, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.22);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.22);
        });
      }
    } catch {
      // Audio safe
    }
  }, [isMuted]);

  // Star Explosion generator (pushed directly into Canvas Particle Ref - 0ms React latency)
  const triggerStars = useCallback((bx: number, by: number, isGolden: boolean) => {
    const starCount = isGolden ? 16 : 10;
    const colors = isGolden 
      ? ["#facc15", "#fef08a", "#ffffff", "#fbbf24", "#f59e0b"] 
      : ["#fbbf24", "#f43f5e", "#ffffff", "#38bdf8", "#ec4899"];

    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount + (Math.random() - 0.5) * 0.6;
      const speed = 4.5 + Math.random() * 6.5;
      particlesRef.current.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.2,
        size: 16 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.35,
        alpha: 1
      });
    }
  }, []);

  // Decoupled 60/120fps Canvas Particles Physics Loop
  useEffect(() => {
    let animId: number;
    const renderParticles = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const parts = particlesRef.current;
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.28; // Gravity
            p.vx *= 0.985;
            p.rotation += p.vRot;
            p.alpha -= 0.022;
            p.size = Math.max(0, p.size - 0.3);

            if (p.alpha <= 0 || p.size <= 2) {
              parts.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            // Draw 4-point cartoon sparkle star
            const r = p.size;
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }
      animId = requestAnimationFrame(renderParticles);
    };
    animId = requestAnimationFrame(renderParticles);
    return () => cancelAnimationFrame(animId);
  }, []);

  const addFeedback = useCallback((text: string, color: string, cx: number, cy: number) => {
    const id = feedbackIdCounter.current++;
    setFeedbacks(prev => [...prev, { id, text, color, x: cx, y: cy }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 700);
  }, []);

  // Game Over trigger
  const handleGameOver = useCallback(() => {
    gameActiveRef.current = false;
    playSound("hurt");
    setGameState("gameover");
  }, [playSound]);

  // Lose a heart with grace period
  const loseHeart = useCallback((reason: string) => {
    const now = performance.now();
    if (now - lastHurtTimeRef.current < 650) return;
    lastHurtTimeRef.current = now;

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

    const roll = Math.random();
    let pickedType: CharacterType = "danger";
    if (roll < 0.16) {
      pickedType = "gold";
    } else if (roll < 0.32) {
      pickedType = "peace";
    }

    const pool = RH_ITEMS.filter(item => item.type === pickedType);
    const item = pool[Math.floor(Math.random() * pool.length)];

    const curLevel = Math.min(8, Math.floor(scoreRef.current / 700) + 1);
    setLevel(curLevel);

    const baseDuration = pickedType === "gold" ? 2200 : 3400;
    const duration = Math.max(1400, baseDuration * Math.pow(0.92, curLevel - 1));

    const newSlot: ActiveSlot = {
      id: slotIdCounter.current++,
      item,
      spawnTime: performance.now(),
      duration,
      isHit: false,
      isDiving: false
    };

    currentHoles[chosenIdx] = newSlot;
    setHoles(currentHoles);
  }, []);

  // Main Game Loop: Smooth transitions, natural dive before exit, and fast retreat when hit
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;
    let lastSpawn = performance.now();

    const loop = (timestamp: number) => {
      if (!gameActiveRef.current) return;

      const currentHoles = [...holesRef.current];
      let hasChanges = false;

      // 1. Check mole states and smooth exit
      for (let i = 0; i < currentHoles.length; i++) {
        const slot = currentHoles[i];
        if (slot) {
          // A. If mole was struck: after 360ms squash & knock-out animation, free up the hole immediately
          if (slot.isHit && slot.hitTime) {
            if (timestamp - slot.hitTime > 360) {
              currentHoles[i] = null;
              hasChanges = true;
              continue;
            }
          }

          // B. If expiring naturally: 240ms before duration expires, play smooth dive into pit
          const age = timestamp - slot.spawnTime;
          if (!slot.isHit) {
            if (age > slot.duration - 240 && !slot.isDiving) {
              slot.isDiving = true;
              hasChanges = true;
            }
            if (age > slot.duration) {
              if (slot.item.type === "danger") {
                loseHeart(`Risque ignoré : ${slot.item.label}`);
              }
              currentHoles[i] = null;
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges) {
        setHoles(currentHoles);
      }

      // 2. Trigger new spawns with comfortable arcade pacing
      const curLevel = Math.min(8, Math.floor(scoreRef.current / 700) + 1);
      const spawnInterval = Math.max(950, 2200 * Math.pow(0.90, curLevel - 1));

      if (timestamp - lastSpawn > spawnInterval) {
        spawnMole();
        if (curLevel >= 5 && Math.random() < 0.22) {
          spawnMole();
        }
        lastSpawn = timestamp;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, loseHeart, spawnMole]);

  // Fast Hardware-Accelerated Mallet Positioning (0ms latency, pure transform3d)
  const updateMalletPos = (x: number, y: number, swing: boolean = false) => {
    if (!malletRef.current) return;
    malletRef.current.style.opacity = "1";
    if (swing) {
      malletRef.current.style.transition = "transform 0.08s cubic-bezier(0.12, 0.8, 0.32, 1.3)";
      malletRef.current.style.transform = `translate3d(${x - 55}px, ${y - 95}px, 0) rotate(-48deg) scale(1.18)`;
    } else {
      malletRef.current.style.transition = "transform 0.035s ease-out";
      malletRef.current.style.transform = `translate3d(${x - 55}px, ${y - 95}px, 0) rotate(15deg) scale(1)`;
    }
  };

  // Instant Pointer Down on Hole (Instant 0ms strike)
  const handleHoleHit = (index: number, e: React.PointerEvent) => {
    if (gameState !== "playing") return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const clickX = e.clientX - boardRect.left;
    const clickY = e.clientY - boardRect.top;

    // Trigger visual mallet swing immediately
    isSwingingRef.current = true;
    updateMalletPos(clickX, clickY, true);
    setTimeout(() => {
      isSwingingRef.current = false;
      if (malletRef.current) {
        updateMalletPos(clickX, clickY, false);
      }
    }, 110);

    const currentHoles = [...holesRef.current];
    const slot = currentHoles[index];

    if (!slot || slot.isHit) {
      playSound("whoosh");
      return;
    }

    slot.isHit = true;
    slot.hitType = slot.item.type;
    slot.hitTime = performance.now();

    if (slot.item.type === "danger") {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      const comboBonus = Math.min(150, (newCombo - 1) * 20);
      const gained = slot.item.points + comboBonus;

      setScore(s => s + gained);
      setStats(st => ({ ...st, dangersHit: st.dangersHit + 1 }));
      playSound("whack");
      triggerStars(clickX, clickY, false);
      addFeedback(`+${gained}`, "text-amber-300", e.clientX, e.clientY - 25);
    } else if (slot.item.type === "gold") {
      const gained = slot.item.points + 100;
      setScore(s => s + gained);
      setStats(st => ({ ...st, goldHit: st.goldHit + 1 }));
      playSound("gold");
      triggerStars(clickX, clickY, true);
      addFeedback(`+${gained} 👑`, "text-yellow-300", e.clientX, e.clientY - 30);
    } else if (slot.item.type === "peace") {
      setStats(st => ({ ...st, peaceMistakes: st.peaceMistakes + 1 }));
      loseHeart(`Aïe ! ${slot.item.label} était protégé !`);
    }

    setHoles([...currentHoles]);
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!isSwingingRef.current) {
      updateMalletPos(x, y, false);
    }
  };

  const handleBoardMouseEnter = (e: React.MouseEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    updateMalletPos(e.clientX - rect.left, e.clientY - rect.top, false);
  };

  const handleBoardMouseLeave = () => {
    if (malletRef.current) {
      malletRef.current.style.opacity = "0";
    }
  };

  // Distinct Visual Character Rendering for each RH case (Scaled up & Richly Detailed)
  const renderCharacter = (slot: ActiveSlot) => {
    const isHit = slot.isHit;
    const id = slot.item.id;

    // 1. DANGERS (Risques RH)
    if (slot.item.type === "danger") {
      const isHarcelement = id === "harcelement";
      const bodyBg = isHarcelement 
        ? "from-[#7f1d1d] via-[#991b1b] to-[#450a0a] border-[#450a0a]" 
        : id === "rps" 
        ? "from-[#7e4f44] via-[#6d3e34] to-[#4a261e] border-[#4a261e]"
        : "from-[#8d5b4c] via-[#784435] to-[#5c3125] border-[#5c3125]";

      return (
        <div className="relative flex flex-col items-center">
          {/* Specific Headwear / Accessory */}
          {id === "rps" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
              <div className="w-10 sm:w-14 md:w-16 h-6 sm:h-8 bg-gradient-to-t from-sky-400 to-sky-200 rounded-t-full border-2 border-sky-500 shadow-sm flex items-center justify-center">
                <span className="text-xs sm:text-sm">🧊</span>
              </div>
              <div className="w-4 sm:w-5 h-2 bg-sky-600 rounded-full -mt-0.5" />
            </div>
          )}

          {id === "heures" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center animate-bounce">
              <div className="w-9 sm:w-12 md:w-14 h-9 sm:h-12 md:h-14 rounded-full bg-rose-600 border-2 sm:border-3 border-white shadow-md flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-mono font-black text-white">
                23:59
              </div>
            </div>
          )}

          {id === "chute" && (
            <div className="relative z-20 -mb-1 sm:-mb-2 flex items-center">
              <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-100 rounded-md border border-amber-300 text-rose-600 text-[10px] sm:text-xs font-black shadow-sm transform -rotate-6">
                ✚ PANSEMENT
              </div>
            </div>
          )}

          {id === "harcelement" && (
            <div className="relative z-20 -mb-1 sm:-mb-2 flex items-center justify-between w-20 sm:w-28 px-1">
              <span className="text-sm sm:text-lg animate-pulse">💨</span>
              <span className="text-sm sm:text-lg animate-pulse">💨</span>
            </div>
          )}

          {id === "amiante" && (
            <div className="relative z-20 -mb-1.5 sm:-mb-2 flex items-center">
              <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-400 rounded-md border border-yellow-600 text-slate-950 text-[10px] sm:text-xs font-black shadow-sm">
                ☣️ TOXIQUE
              </div>
            </div>
          )}

          {id === "dossier" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
              <div className="w-14 sm:w-18 md:w-22 h-4 sm:h-5 bg-amber-400 rounded-sm border border-amber-600 shadow-xs" />
              <div className="w-12 sm:w-16 md:w-20 h-4 sm:h-5 bg-rose-500 rounded-sm border border-rose-700 shadow-xs -mt-1 transform rotate-3" />
              <div className="w-11 sm:w-14 md:w-18 h-3.5 sm:h-4.5 bg-sky-500 rounded-sm border border-sky-700 shadow-xs -mt-1 text-[8px] sm:text-[9px] text-white font-mono flex items-center justify-center font-bold">
                URGENT
              </div>
            </div>
          )}

          {id === "agression" && (
            <div className="relative z-20 -mb-1.5 flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-xl">🥊</span>
              <span className="text-sm sm:text-xl">🥊</span>
            </div>
          )}

          {id === "fraude" && (
            <div className="relative z-20 -mb-1.5 flex items-center">
              <div className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-slate-900 rounded-full border border-slate-700 text-[9px] sm:text-[11px] font-mono text-amber-400 font-bold">
                🕶️ CUMUL
              </div>
            </div>
          )}

          {/* Mole Body (Scaled Up Responsively) */}
          <div className={`w-20 h-28 sm:w-28 sm:h-38 md:w-34 md:h-46 bg-gradient-to-b ${bodyBg} rounded-t-[3rem] sm:rounded-t-[4rem] rounded-b-2xl border-3 sm:border-4 shadow-xl flex flex-col items-center relative overflow-hidden`}>
            
            {/* Belly highlight */}
            <div className="absolute bottom-0 w-14 sm:w-20 md:w-24 h-10 sm:h-14 md:h-16 bg-[#fde047]/30 rounded-t-full pointer-events-none" />

            {/* Eyes */}
            <div className="mt-4 sm:mt-6 md:mt-7 flex items-center gap-3 sm:gap-4 md:gap-5 z-10">
              {isHit ? (
                <>
                  <span className="text-black font-black text-sm sm:text-xl">✕</span>
                  <span className="text-black font-black text-sm sm:text-xl">✕</span>
                </>
              ) : id === "rps" ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border border-black flex items-center justify-center text-[9px] sm:text-[11px] font-black">@</div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border border-black flex items-center justify-center text-[9px] sm:text-[11px] font-black">@</div>
                </>
              ) : id === "heures" ? (
                <>
                  <div className="relative">
                    <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 bg-slate-950 rounded-full" />
                    <div className="w-4.5 h-2 sm:w-6 sm:h-2.5 bg-purple-900/60 rounded-full -mt-0.5" />
                  </div>
                  <div className="relative">
                    <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 bg-slate-950 rounded-full" />
                    <div className="w-4.5 h-2 sm:w-6 sm:h-2.5 bg-purple-900/60 rounded-full -mt-0.5" />
                  </div>
                </>
              ) : id === "harcelement" ? (
                <>
                  <div className="relative">
                    <div className="w-4 sm:w-5 h-1.5 bg-black rounded-full transform -rotate-12 mb-0.5" />
                    <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 bg-black rounded-full" />
                  </div>
                  <div className="relative">
                    <div className="w-4 sm:w-5 h-1.5 bg-black rounded-full transform rotate-12 mb-0.5" />
                    <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 bg-black rounded-full" />
                  </div>
                </>
              ) : id === "fraude" ? (
                <div className="flex items-center gap-0.5 bg-slate-950 px-2.5 py-1.5 rounded-sm border border-slate-700 shadow-sm">
                  <div className="w-3 h-2 bg-slate-800" />
                  <div className="w-1.5 h-0.5 bg-slate-600" />
                  <div className="w-3 h-2 bg-slate-800" />
                </div>
              ) : (
                <>
                  <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 md:w-5 md:h-6 bg-slate-950 rounded-full flex items-start justify-end p-0.5 sm:p-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </div>
                  <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 md:w-5 md:h-6 bg-slate-950 rounded-full flex items-start justify-end p-0.5 sm:p-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </div>
                </>
              )}
            </div>

            {/* Muzzle & Teeth */}
            {id === "amiante" ? (
              <div className="mt-1.5 sm:mt-2.5 w-14 sm:w-18 md:w-22 h-8 sm:h-10 bg-amber-400 rounded-lg border-2 border-amber-600 flex items-center justify-between px-1.5 shadow-sm z-10">
                <div className="w-3 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-950 border border-amber-200" />
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 border border-amber-500" />
                <div className="w-3 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-950 border border-amber-200" />
              </div>
            ) : (
              <div className="mt-1.5 sm:mt-2.5 w-11 sm:w-16 md:w-20 h-7 sm:h-9 md:h-11 bg-[#fde68a] rounded-full border border-amber-300 flex flex-col items-center justify-between p-0.5 sm:p-1 shadow-sm z-10">
                <div className="w-4 sm:w-5 h-2.5 sm:h-3 bg-rose-500 rounded-full" />
                <div className="flex gap-0.5 sm:gap-1">
                  <div className="w-2 sm:w-2.5 h-2.5 sm:h-3 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                  <div className="w-2 sm:w-2.5 h-2.5 sm:h-3 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                </div>
              </div>
            )}

            {/* Specific Chest Badge */}
            <div className="mt-1.5 sm:mt-2.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-600/90 text-white text-[8px] sm:text-[10px] md:text-xs font-black tracking-tight border border-rose-300 shadow-sm z-10">
              {id === "rps" ? "BURNOUT" : id === "heures" ? "1607H" : id === "chute" ? "CHUTE" : id === "harcelement" ? "CONFLIT" : id === "amiante" ? "AMIANTE" : id === "dossier" ? "RETARD" : id === "agression" ? "AGRESSION" : "CUMUL"}
            </div>

          </div>
        </div>
      );
    }

    // 2. GOLDS (Bonus Royaux RH)
    if (slot.item.type === "gold") {
      return (
        <div className="relative flex flex-col items-center">
          {id === "prime_cia" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
              <div className="w-10 sm:w-14 md:w-16 h-6 sm:h-8 bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 border-2 border-amber-600 rounded-t-sm [clip-path:polygon(0%_100%,0%_20%,25%_60%,50%_0%,75%_60%,100%_20%,100%_100%)] shadow-md" />
              <div className="w-11 sm:w-15 md:w-17 h-2 bg-amber-600 rounded-full -mt-0.5" />
            </div>
          )}

          {id === "audit_crc" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
              <div className="w-14 sm:w-18 md:w-22 h-7 sm:h-9 bg-slate-100 rounded-t-2xl border-2 border-slate-300 shadow-md flex items-center justify-center">
                <span className="text-xs sm:text-base">⚖️</span>
              </div>
            </div>
          )}

          {id === "budget_valide" && (
            <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
              <div className="w-9 sm:w-12 md:w-14 h-7 sm:h-10 bg-slate-900 rounded-t-md border-2 border-slate-700 flex items-center justify-center">
                <div className="w-full h-1 bg-emerald-400 mt-2" />
              </div>
              <div className="w-13 sm:w-16 md:w-18 h-2 bg-slate-900 rounded-full -mt-0.5 border border-slate-700" />
            </div>
          )}

          {id === "accord_social" && (
            <div className="relative z-20 -mb-1.5 sm:-mb-2 flex items-center gap-1">
              <span className="text-xs sm:text-base">🌿</span>
              <span className="text-xs sm:text-base">📜</span>
              <span className="text-xs sm:text-base">🌿</span>
            </div>
          )}

          {/* Golden Body */}
          <div className="w-20 h-28 sm:w-28 sm:h-38 md:w-34 md:h-46 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 rounded-t-[3rem] sm:rounded-t-[4rem] rounded-b-2xl border-3 sm:border-4 border-amber-600 shadow-[0_0_25px_rgba(250,204,21,0.65)] flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 sm:w-14 h-full bg-white/30 transform rotate-12 pointer-events-none" />

            {/* Eyes */}
            <div className="mt-4 sm:mt-6 md:mt-7 flex items-center gap-3 sm:gap-4 md:gap-5 z-10">
              {isHit ? (
                <>
                  <span className="text-black font-black text-sm sm:text-xl">★</span>
                  <span className="text-black font-black text-sm sm:text-xl">★</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 md:w-5 md:h-6 bg-slate-950 rounded-full flex items-start justify-end p-0.5 sm:p-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </div>
                  <div className="w-3.5 h-4.5 sm:w-4.5 sm:h-5.5 md:w-5 md:h-6 bg-slate-950 rounded-full flex items-start justify-end p-0.5 sm:p-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </div>
                </>
              )}
            </div>

            {/* Muzzle */}
            <div className="mt-1.5 sm:mt-2.5 w-11 sm:w-16 md:w-20 h-7 sm:h-9 md:h-11 bg-amber-100 rounded-full border border-amber-400 flex flex-col items-center justify-between p-0.5 sm:p-1 shadow-sm z-10">
              <div className="w-4 sm:w-5 h-2.5 sm:h-3 bg-amber-600 rounded-full" />
              <div className="flex gap-0.5 sm:gap-1">
                <div className="w-2 sm:w-2.5 h-2.5 sm:h-3 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
                <div className="w-2 sm:w-2.5 h-2.5 sm:h-3 bg-white rounded-b-sm border-t-0 border border-slate-300 shadow-xs" />
              </div>
            </div>

            {/* Chest Badge */}
            <div className="mt-1.5 sm:mt-2.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-950/85 text-amber-300 text-[8px] sm:text-[10px] md:text-xs font-black z-10 border border-amber-400">
              ★ +300 ★
            </div>
          </div>
        </div>
      );
    }

    // 3. PEACES (Protégés / Bonnes Pratiques)
    return (
      <div className="relative flex flex-col items-center">
        {id === "deconnexion" && (
          <div className="relative z-20 -mb-2 sm:-mb-3 flex items-center">
            <div className="w-12 sm:w-16 md:w-20 h-7 sm:h-9 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-t-full border-2 border-sky-300 transform -rotate-12 shadow-sm relative flex items-center justify-end">
              <div className="w-3.5 h-3.5 bg-white rounded-full border border-sky-200 absolute -top-1 -right-1 shadow-sm" />
              <span className="text-[10px] sm:text-xs text-white font-mono font-bold mr-2">zZz</span>
            </div>
          </div>
        )}

        {id === "delegue" && (
          <div className="relative z-20 -mb-1.5 flex items-center gap-1">
            <div className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-rose-600 rounded-md border border-rose-300 text-[8px] sm:text-[10px] font-black text-white shadow-sm">
              📢 DÉLÉGUÉ
            </div>
          </div>
        )}

        {id === "rtt" && (
          <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
            <div className="w-9 sm:w-12 md:w-14 h-5 sm:h-7 bg-yellow-300 rounded-t-full border border-amber-500" />
            <div className="w-16 sm:w-22 md:w-26 h-2 bg-yellow-400 rounded-full border border-amber-600 -mt-0.5" />
          </div>
        )}

        {id === "visite_med" && (
          <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
            <div className="w-10 sm:w-14 md:w-16 h-5 sm:h-7 bg-white rounded-t-md border-2 border-slate-300 flex items-center justify-center text-rose-600 font-bold text-xs sm:text-sm">
              ✚
            </div>
          </div>
        )}

        {id === "formation" && (
          <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
            <div className="w-14 sm:w-18 md:w-22 h-3.5 sm:h-4.5 bg-slate-900 border border-amber-400 rotate-2 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <div className="w-8 sm:w-10 h-3 bg-slate-800 rounded-t-sm -mt-0.5" />
          </div>
        )}

        {id === "epi" && (
          <div className="relative z-20 -mb-2 sm:-mb-3 flex flex-col items-center">
            <div className="w-14 sm:w-18 md:w-22 h-7 sm:h-9 bg-yellow-400 rounded-t-full border-2 border-amber-600 shadow-md relative flex items-center justify-center">
              <div className="w-full h-1.5 bg-amber-500" />
            </div>
            <div className="w-16 sm:w-20 md:w-24 h-2 bg-yellow-500 rounded-full -mt-0.5 border border-amber-700" />
          </div>
        )}

        {/* Turtle Body (Scaled Up) */}
        <div className="w-20 h-28 sm:w-28 sm:h-38 md:w-34 md:h-46 bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-600 rounded-t-[3rem] sm:rounded-t-[4rem] rounded-b-2xl border-3 sm:border-4 border-emerald-700 shadow-xl flex flex-col items-center relative overflow-hidden">
          {id === "epi" ? (
            <div className="absolute inset-x-1.5 bottom-1 h-12 sm:h-16 bg-orange-500 rounded-t-xl border-2 border-orange-700 p-1 flex flex-col justify-around">
              <div className="w-full h-1.5 bg-white opacity-85" />
              <div className="w-full h-1.5 bg-white opacity-85" />
            </div>
          ) : (
            <div className="absolute inset-x-2 bottom-1 h-12 sm:h-16 border-2 border-emerald-700/50 rounded-t-xl bg-emerald-600/30 grid grid-cols-2 gap-1 p-1" />
          )}

          {/* Eyes */}
          <div className="mt-4 sm:mt-6 md:mt-7 flex items-center gap-3 sm:gap-4 md:gap-5 z-10">
            {id === "rtt" ? (
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3 sm:w-4.5 sm:h-4 bg-slate-950 rounded-full border border-amber-300" />
                <div className="w-3.5 h-3 sm:w-4.5 sm:h-4 bg-slate-950 rounded-full border border-amber-300" />
              </div>
            ) : (
              <>
                <div className="w-3.5 sm:w-4.5 h-1.5 bg-slate-900 rounded-full" />
                <div className="w-3.5 sm:w-4.5 h-1.5 bg-slate-900 rounded-full" />
              </>
            )}
          </div>

          {/* Gentle Muzzle */}
          <div className="mt-1.5 sm:mt-2.5 w-10 sm:w-14 md:w-18 h-6 sm:h-8 bg-emerald-200 rounded-full border border-emerald-400 flex items-center justify-center shadow-inner z-10">
            <div className="w-2.5 h-1.5 bg-emerald-700 rounded-full" />
          </div>

          {/* Chest Icon */}
          <div className="mt-1.5 sm:mt-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-950/85 text-emerald-200 text-[8px] sm:text-[10px] md:text-xs font-black tracking-tight border border-emerald-400 shadow-sm z-10">
            {id === "deconnexion" ? "REPOS" : id === "delegue" ? "SYNDICAT" : id === "rtt" ? "CONGÉS" : id === "visite_med" ? "MÉDECIN" : id === "formation" ? "STAGE" : "EPI"}
          </div>
        </div>
      </div>
    );
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHearts(MAX_HEARTS);
    setLevel(1);
    setStats({ dangersHit: 0, goldHit: 0, peaceMistakes: 0 });
    setHoles(Array(HOLE_COUNT).fill(null));
    particlesRef.current = [];
    gameActiveRef.current = true;
    slotIdCounter.current = 0;
    playSound("start");
    setGameState("playing");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 select-none pb-8">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour aux Outils RH</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/40 px-3 py-1.5 rounded-xl text-sky-300 font-mono text-xs font-bold shadow-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Niveau {level}</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Arcade Frame (Expanded & Immersive) */}
      <main className="max-w-6xl mx-auto px-2 sm:px-6 py-3 sm:py-6 flex-1 w-full flex flex-col items-center">
        
        {/* CARTOON ARCADE CONSOLE (Larger format matching cartoon console design) */}
        <div className="relative w-full max-w-[1040px] flex flex-col items-center">
          
          {/* Top Yellow Handle on Console */}
          <div className="w-52 sm:w-64 h-10 sm:h-12 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-2xl sm:rounded-t-3xl border-4 sm:border-[5px] border-b-0 border-amber-500 shadow-md flex items-center justify-center -mb-2 z-10">
            <div className="w-28 sm:w-36 h-3 sm:h-4 bg-slate-900/40 rounded-full border border-amber-600/40" />
          </div>

          {/* Console Outer Bezel (Cyan / Turquoise Arcade Box) */}
          <div className="w-full bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 rounded-[2.5rem] sm:rounded-[3.5rem] p-3 sm:p-6 md:p-8 shadow-[0_25px_60px_rgba(2,132,199,0.4)] border-4 sm:border-[6px] border-sky-300/80 relative overflow-hidden">
            
            {/* Glossy top reflection on arcade casing */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-white/20 rounded-t-[2.2rem] pointer-events-none" />

            {/* Inner Dashboard Bar */}
            <div className="bg-slate-950/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:px-6 mb-3 sm:mb-4 border border-sky-200/40 flex items-center justify-between gap-2 shadow-inner text-xs sm:text-base font-mono font-bold">
              
              {/* Hearts / Vies */}
              <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] sm:text-xs uppercase text-rose-400 font-black mr-1 hidden sm:inline">Vies :</span>
                {[...Array(MAX_HEARTS)].map((_, i) => (
                  <span 
                    key={i}
                    className={`text-base sm:text-xl transition-transform ${
                      i < hearts ? "text-rose-500 scale-100 animate-pulse" : "text-slate-700 opacity-40 scale-75"
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              {/* Combo Multiplier */}
              {combo > 1 && (
                <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase animate-bounce shadow-lg">
                  <Flame className="w-4 h-4 fill-current text-white" />
                  <span>Combo x{combo}</span>
                </div>
              )}

              {/* Score Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black shadow-md">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                <span className="text-xs sm:text-sm uppercase">Score :</span>
                <span className="text-base sm:text-xl font-mono font-black">{score}</span>
              </div>

            </div>

            {/* GAME FIELD (Landscape with sky & lawn matching reference - Expanded Canvas) */}
            <div 
              ref={boardRef}
              onMouseMove={handleBoardMouseMove}
              onMouseEnter={handleBoardMouseEnter}
              onMouseLeave={handleBoardMouseLeave}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[460px] sm:min-h-[540px] md:min-h-[620px] max-h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-[6px] border-amber-900/30 select-none cursor-crosshair bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400"
            >
              
              {/* Floating Cartoon Lily Pad / Clouds in Sky */}
              <div className="absolute top-4 left-10 w-16 h-9 bg-emerald-400/80 rounded-full border-2 border-emerald-500 shadow-sm transform -rotate-12 pointer-events-none" />
              <div className="absolute top-7 right-14 w-14 h-8 bg-emerald-400/80 rounded-full border-2 border-emerald-500 shadow-sm transform rotate-6 pointer-events-none" />

              {/* Distant Hills separator (Pastel Yellow / Light Green curve) */}
              <div className="absolute top-[20%] left-0 right-0 h-10 bg-[#fef08a] rounded-t-[100%] border-t-2 border-[#facc15] pointer-events-none opacity-90" />

              {/* Vibrant Green Grass Ground */}
              <div className="absolute top-[24%] inset-x-0 bottom-0 bg-gradient-to-b from-[#86efac] via-[#4ade80] to-[#22c55e]">
                <div className="absolute inset-0 bg-[radial-gradient(#bbf7d0_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />
              </div>

              {/* 6 HOLES GRID (2 Rows of 3 Holes - Enlarged & Proportional) */}
              <div className="relative z-10 w-full h-full pt-[14%] sm:pt-[12%] px-3 sm:px-8 md:px-12 grid grid-cols-3 grid-rows-2 gap-x-3 sm:gap-x-8 md:gap-x-12 gap-y-10 sm:gap-y-16 md:gap-y-20 pb-12 sm:pb-16">
                
                {holes.map((slot, idx) => (
                  <div
                    key={idx}
                    onPointerDown={(e) => handleHoleHit(idx, e)}
                    className="relative w-full h-full flex flex-col items-center justify-end group active:scale-95 transition-transform"
                  >
                    
                    {/* The Dirt Hole (3D Oval Rim with dark pit - Enlarged) */}
                    <div className="w-[94%] sm:w-[90%] md:w-[86%] h-14 sm:h-18 md:h-22 rounded-[100%] bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#451a03] p-1.5 sm:p-2.5 shadow-[0_10px_20px_rgba(0,0,0,0.55)] border-3 sm:border-4 border-[#b45309]/80 relative flex items-center justify-center">
                      <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-[#180d05] to-[#271406] shadow-[inset_0_10px_18px_rgba(0,0,0,0.95)]" />
                    </div>

                    {/* CHARACTER EMERGENCE CONTAINER (Masked by hole rim) */}
                    <div className="absolute bottom-5 sm:bottom-7 md:bottom-9 w-full h-[160%] overflow-hidden flex flex-col items-center justify-end pointer-events-none">
                      
                      {slot && (
                        <div 
                          className={`relative flex flex-col items-center origin-bottom will-change-transform ${
                            slot.isHit 
                              ? "animate-mole-hit" 
                              : slot.isDiving 
                              ? "animate-mole-dive" 
                              : "animate-mole-rise"
                          }`}
                        >
                          {/* Distinct Custom Character according to the RH Case */}
                          {renderCharacter(slot)}
                        </div>
                      )}

                    </div>

                    {/* 100% VISIBLE & UNTRUNCATED LABEL BADGE */}
                    {slot && (
                      <div className="absolute -bottom-5 sm:-bottom-7 md:-bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all animate-pop-in flex justify-center w-max max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
                        <div 
                          className={`px-2 py-0.5 sm:px-3 sm:py-1 md:px-3.5 md:py-1.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-tight shadow-[0_6px_16px_rgba(0,0,0,0.85)] border-2 flex items-center justify-center gap-1.5 leading-tight text-center whitespace-normal ${
                            slot.item.type === "danger"
                              ? "bg-rose-600 text-white border-rose-300 ring-2 ring-rose-950"
                              : slot.item.type === "gold"
                              ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-white ring-2 ring-amber-700 shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                              : "bg-emerald-600 text-white border-emerald-200 ring-2 ring-emerald-950"
                          }`}
                        >
                          <span className="text-xs sm:text-base flex-shrink-0">
                            {slot.item.type === "danger" ? "⚠️" : slot.item.type === "gold" ? "👑" : "🛡️"}
                          </span>
                          <span className="leading-tight">
                            {slot.item.type === "gold" ? `+300 : ${slot.item.label}` : slot.item.type === "peace" ? `PROTÉGÉ : ${slot.item.label}` : slot.item.label}
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}

              </div>

              {/* DEDICATED HIGH-PERFORMANCE 60/120FPS PARTICLES CANVAS */}
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none z-40"
              />

              {/* POPUP SCORE FEEDBACK (Accelerated CSS) */}
              {feedbacks.map(f => (
                <div
                  key={f.id}
                  className={`absolute pointer-events-none font-black text-2xl sm:text-3xl font-mono animate-pop-up z-40 ${f.color}`}
                  style={{
                    left: f.x - (boardRef.current?.getBoundingClientRect().left || 0),
                    top: f.y - (boardRef.current?.getBoundingClientRect().top || 0),
                    textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
                  }}
                >
                  {f.text}
                </div>
              ))}

              {/* ZERO-LATENCY CARTOON MALLET (Enlarged & Snappy Strike) */}
              <div
                ref={malletRef}
                className="absolute pointer-events-none z-50 origin-[75%_25%] opacity-0 will-change-transform"
                style={{
                  left: 0,
                  top: 0
                }}
              >
                {/* Cartoon Mallet SVG (Enlarged for grand screen) */}
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]">
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

              {/* OVERLAY: START SCREEN */}
              {gameState === "ready" && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
                  
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400 via-rose-500 to-sky-400 rounded-3xl p-1 shadow-2xl flex items-center justify-center mb-4 animate-bounce">
                    <div className="w-full h-full bg-slate-900 rounded-[1.3rem] flex items-center justify-center text-4xl sm:text-5xl">
                      🔨
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black font-mono text-white mb-2 uppercase tracking-wider">
                    TAPE-TAUPE DES RISQUES RH
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 font-medium leading-relaxed">
                    Les risques professionnels envahissent la collectivité ! Utilisez votre marteau RH pour taper sur les dangers et débloquer les primes exceptionnelles.
                  </p>

                  {/* Rules Legend */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6 text-xs font-mono">
                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-rose-500/40 text-rose-300 flex flex-col items-center gap-1.5 shadow-md">
                      <span className="text-2xl">⚠️</span>
                      <strong className="text-white">Taupes Brunes</strong>
                      <span>+100 pts : Risques à taper vite</span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-400/50 text-amber-300 flex flex-col items-center gap-1.5 shadow-md">
                      <span className="text-2xl">👑</span>
                      <strong className="text-white">Taupe Dorée</strong>
                      <span>+300 pts : Bonus Royal RH</span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/40 text-emerald-300 flex flex-col items-center gap-1.5 shadow-md">
                      <span className="text-2xl">💤</span>
                      <strong className="text-white">Tortue en Repos</strong>
                      <span className="text-rose-400 font-bold">NE PAS TAPER (-1 vie)</span>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black rounded-full text-sm sm:text-lg uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-[0_0_35px_rgba(52,211,153,0.5)] active:scale-95 cursor-pointer"
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> Lancer la Partie RH
                  </button>
                </div>
              )}

              {/* OVERLAY: GAME OVER SCREEN */}
              {gameState === "gameover" && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in">
                  
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/20 text-rose-400 rounded-3xl border border-rose-500/40 flex items-center justify-center mb-3 shadow-xl">
                    <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black font-mono text-rose-400 mb-2 uppercase tracking-wider">
                    BILAN RH TERMINÉ !
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-5">
                    Toutes vos vies ont été consommées. Voici les résultats de votre intervention :
                  </p>

                  {/* Final Score Card */}
                  <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl w-full max-w-sm mb-6">
                    <div className="text-xs uppercase font-mono text-slate-400 font-bold">Score Final</div>
                    <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 my-2">{score}</div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block">DANGERS</span>
                        <strong className="text-white text-sm">{stats.dangersHit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ROYAL</span>
                        <strong className="text-amber-300 text-sm">{stats.goldHit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">COMBO MAX</span>
                        <strong className="text-sky-400 text-sm">x{maxCombo}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={startGame}
                      className="px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Rejouer
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                    >
                      Quitter
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Bottom Controls / Help info */}
          <div className="mt-4 flex items-center justify-between w-full text-xs sm:text-sm text-slate-400 font-mono bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Clic / Toucher pour frapper avec le marteau</span>
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Moteur Haute Fluidité 60/120fps (Canvas GPU + Hardware Transitions)
            </span>
          </div>

        </div>

      </main>

      {/* High Fluidity Animation Styles */}
      <style>{`
        /* Smooth Bouncy Rise */
        @keyframes moleRise {
          0% { transform: translateY(115%) scale(0.92, 1.08); }
          55% { transform: translateY(-10%) scale(1.05, 0.95); }
          75% { transform: translateY(3%) scale(0.98, 1.02); }
          100% { transform: translateY(0%) scale(1, 1); }
        }
        .animate-mole-rise {
          animation: moleRise 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.25) forwards;
          will-change: transform;
        }

        /* Juicy Hit Knockout & Squash */
        @keyframes moleHitSquash {
          0% { transform: scale(1.25, 0.7) translateY(12%); }
          25% { transform: scale(0.85, 1.15) translateY(-8%) rotate(-6deg); }
          50% { transform: scale(1.06, 0.94) translateY(4%) rotate(4deg); }
          75% { transform: scale(0.95, 1.02) translateY(20%); }
          100% { transform: scale(0.9, 0.9) translateY(120%); opacity: 0; }
        }
        .animate-mole-hit {
          animation: moleHitSquash 0.36s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          will-change: transform, opacity;
        }

        /* Organic Dive Down when time runs out */
        @keyframes moleDive {
          0% { transform: translateY(0%) scale(1, 1); }
          25% { transform: translateY(-5%) scale(0.98, 1.04); }
          100% { transform: translateY(120%) scale(0.9, 1.08); opacity: 0.9; }
        }
        .animate-mole-dive {
          animation: moleDive 0.24s cubic-bezier(0.4, 0, 0.6, 1) forwards;
          will-change: transform;
        }

        /* Feedback Popups */
        @keyframes popUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          45% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-55px) scale(1); opacity: 0; }
        }
        .animate-pop-up {
          animation: popUp 0.7s ease-out forwards;
        }

        /* Label Badge Smooth Spring */
        @keyframes popIn {
          0% { transform: scale(0.7) translateY(8px); opacity: 0; }
          70% { transform: scale(1.06) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

    </div>
  );
};

export default TapeTaupeRisques;
