import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, ShieldAlert, Sparkles, Activity } from "lucide-react";

interface FroggerContractuelProps {
  onClose: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

// --- Constants ---
const GRID = 56;
const ROWS = 14;
const COLS = 13;
const CANVAS_WIDTH = COLS * GRID;
const CANVAS_HEIGHT = ROWS * GRID;

// --- Types ---
interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  label: string;
  type: "car" | "log";
  color: string;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isDead: boolean;
  attachedLog: Entity | null;
}

interface Goal {
  x: number;
  y: number;
  width: number;
  height: number;
  isFilled: boolean;
}

const CAR_LABELS = ["Fin de contrat", "Licenciement", "Chômage", "Faute"];
const LOG_LABELS = ["CDD 1 an", "CDD 6 mois", "CDD 3 ans", "CDD 2 ans", "CDD 18 mois"];

const CAR_COLORS = ["#ff2a85", "#ef4444", "#f97316", "#eab308", "#ec4899"];
const LOG_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#14b8a6"];

const FroggerContractuel: React.FC<FroggerContractuelProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [level, setLevelState] = useState(1);

  const levelRef = useRef(1);
  const setLevel = (val: number) => {
    levelRef.current = val;
    setLevelState(val);
  };

  const playerRef = useRef<Player>({
    x: Math.floor(COLS / 2) * GRID,
    y: (ROWS - 1) * GRID,
    width: GRID * 0.8,
    height: GRID * 0.8,
    color: "#a3e635",
    isDead: false,
    attachedLog: null,
  });

  const entitiesRef = useRef<Entity[]>([]);
  const goalsRef = useRef<Goal[]>([]);
  const particlesRef = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color: string }[]>([]);

  // Timer for movement delay
  const lastMoveTimeRef = useRef(0);

  const initLevel = useCallback((lvl: number) => {
    let roadConfigs;
    let riverConfigs;

    if (lvl === 1) {
      roadConfigs = [
        { row: 11, speed: -1.5, spacing: 3, len: 1 },
        { row: 10, speed: 2, spacing: 4, len: 2 },
        { row: 9, speed: -2.5, spacing: 4, len: 1 },
        { row: 8, speed: 1.8, spacing: 3, len: 1.5 },
        { row: 7, speed: -3, spacing: 5, len: 2 },
      ];
      riverConfigs = [
        { row: 5, speed: 1.5, spacing: 4, len: 2 },
        { row: 4, speed: -2, spacing: 5, len: 3 },
        { row: 3, speed: 2.5, spacing: 4, len: 2 },
        { row: 2, speed: -1.8, spacing: 4, len: 2 },
        { row: 1, speed: 3, spacing: 6, len: 3 },
      ];
    } else {
      roadConfigs = [
        { row: 11, speed: 3, spacing: 3.5, len: 1 },
        { row: 10, speed: -3.5, spacing: 4, len: 1.5 },
        { row: 9, speed: 4, spacing: 5, len: 2 },
        { row: 8, speed: -2.8, spacing: 3, len: 1 },
        { row: 7, speed: 4.5, spacing: 5, len: 1.5 },
      ];
      riverConfigs = [
        { row: 5, speed: -2.5, spacing: 4, len: 1.5 },
        { row: 4, speed: 3.5, spacing: 5, len: 2 },
        { row: 3, speed: -4, spacing: 6, len: 1.5 },
        { row: 2, speed: 2.8, spacing: 4, len: 1.5 },
        { row: 1, speed: -4.5, spacing: 6, len: 2 },
      ];
    }

    const ents: Entity[] = [];

    roadConfigs.forEach((c, index) => {
      const numEnts = Math.floor(COLS / c.spacing);
      for (let i = 0; i < numEnts; i++) {
        ents.push({
          x: i * c.spacing * GRID,
          y: c.row * GRID,
          width: c.len * GRID * 0.9,
          height: GRID * 0.8,
          speed: c.speed,
          label: CAR_LABELS[index % CAR_LABELS.length],
          type: "car",
          color: CAR_COLORS[index % CAR_COLORS.length],
        });
      }
    });

    riverConfigs.forEach((c, index) => {
      const numEnts = Math.floor(COLS / c.spacing);
      for (let i = 0; i < numEnts; i++) {
        ents.push({
          x: i * c.spacing * GRID,
          y: c.row * GRID,
          width: c.len * GRID,
          height: GRID * 0.8,
          speed: c.speed,
          label: LOG_LABELS[index % LOG_LABELS.length],
          type: "log",
          color: LOG_COLORS[index % LOG_COLORS.length],
        });
      }
    });

    entitiesRef.current = ents;

    // --- GOALS (Row 0) ---
    // 5 zones de "Titularisation"
    const goals: Goal[] = [];
    for (let i = 0; i < 5; i++) {
      goals.push({
        x: 1 * GRID + i * 2.5 * GRID,
        y: 0,
        width: GRID,
        height: GRID,
        isFilled: false,
      });
    }
    goalsRef.current = goals;

    playerRef.current = {
      x: Math.floor(COLS / 2) * GRID,
      y: (ROWS - 1) * GRID,
      width: GRID * 0.8,
      height: GRID * 0.8,
      color: "#a3e635",
      isDead: false,
      attachedLog: null,
    };
  }, []);

  const resetPlayer = () => {
    playerRef.current = {
      x: Math.floor(COLS / 2) * GRID,
      y: (ROWS - 1) * GRID,
      width: GRID * 0.8,
      height: GRID * 0.8,
      color: "#a3e635",
      isDead: false,
      attachedLog: null,
    };
  };

  const createDeathParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4;
      particlesRef.current.push({
        x: x + GRID / 2,
        y: y + GRID / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
      });
    }
  };

  const loseLife = () => {
    playerRef.current.isDead = true;
    createDeathParticles(playerRef.current.x, playerRef.current.y, "#ef4444");
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setGameState("gameover");
      } else {
        setTimeout(() => {
          if (gameState === "playing") resetPlayer();
        }, 800);
      }
      return next;
    });
  };

  const startNewGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    particlesRef.current = [];
    initLevel(1);
    setGameState("playing");
  }, [initLevel]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing" || playerRef.current.isDead) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      const p = playerRef.current;
      const now = performance.now();
      if (now - lastMoveTimeRef.current < 100) return; // simple debounce
      lastMoveTimeRef.current = now;

      // Détacher la buche si on bouge
      p.attachedLog = null;

      if (e.key === "ArrowUp") {
        if (p.y > 0) { p.y -= GRID; setScore(s => s + 10); }
      } else if (e.key === "ArrowDown") {
        if (p.y < (ROWS - 1) * GRID) p.y += GRID;
      } else if (e.key === "ArrowLeft") {
        if (p.x > 0) p.x -= GRID;
      } else if (e.key === "ArrowRight") {
        if (p.x < (COLS - 1) * GRID) p.x += GRID;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Touch controls
  const handleTouch = (dir: "up" | "down" | "left" | "right") => {
    if (gameState !== "playing" || playerRef.current.isDead) return;
    const p = playerRef.current;
    p.attachedLog = null;

    if (dir === "up") {
      if (p.y > 0) { p.y -= GRID; setScore(s => s + 10); }
    } else if (dir === "down") {
      if (p.y < (ROWS - 1) * GRID) p.y += GRID;
    } else if (dir === "left") {
      if (p.x > 0) p.x -= GRID;
    } else if (dir === "right") {
      if (p.x < (COLS - 1) * GRID) p.x += GRID;
    }
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const AABB = (r1: { x: number, y: number, width: number, height: number }, r2: { x: number, y: number, width: number, height: number }) => {
      // Ajuster légèrement la hitbox pour être plus permissif (comme frogger)
      const shrink = 4;
      return (
        r1.x + shrink < r2.x + r2.width - shrink &&
        r1.x + r1.width - shrink > r2.x + shrink &&
        r1.y + shrink < r2.y + r2.height - shrink &&
        r1.y + r1.height - shrink > r2.y + shrink
      );
    };

    const update = () => {
      if (gameState !== "playing") return;

      const p = playerRef.current;

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life -= 0.02;
        if (part.life <= 0) particlesRef.current.splice(i, 1);
      }

      // Move entities
      entitiesRef.current.forEach((ent) => {
        ent.x += ent.speed;
        if (ent.speed > 0 && ent.x > CANVAS_WIDTH) ent.x = -ent.width;
        if (ent.speed < 0 && ent.x + ent.width < 0) ent.x = CANVAS_WIDTH;
      });

      if (p.isDead) return;

      // Collision Voitures (Road: rows 7-11)
      const playerRow = Math.round(p.y / GRID);
      if (playerRow >= 7 && playerRow <= 11) {
        for (const ent of entitiesRef.current) {
          if (ent.type === "car" && AABB(p, ent)) {
            loseLife();
            return;
          }
        }
      }

      // Plateformes (River: rows 1-5)
      if (playerRow >= 1 && playerRow <= 5) {
        let onLog = false;
        p.attachedLog = null;
        for (const ent of entitiesRef.current) {
          if (ent.type === "log" && AABB(p, ent)) {
            onLog = true;
            p.attachedLog = ent;
            break;
          }
        }
        if (!onLog) {
          loseLife(); // Noyade (Recours contentieux)
          return;
        }
      }

      // Move with attached log
      if (p.attachedLog) {
        p.x += p.attachedLog.speed;
        // Si sort de l'écran avec la bûche -> perdu
        if (p.x < -GRID / 2 || p.x > CANVAS_WIDTH - GRID / 2) {
          loseLife();
          return;
        }
      }

      // Check Goals (Row 0)
      if (playerRow === 0) {
        let insideGoal = false;
        for (const goal of goalsRef.current) {
          if (!goal.isFilled && Math.abs(p.x - goal.x) < GRID * 0.8) {
            goal.isFilled = true;
            insideGoal = true;
            setScore(s => s + 100);
            createDeathParticles(goal.x, goal.y, "#22c55e"); // Green sparkles
            resetPlayer();
            break;
          }
        }
        if (!insideGoal) {
          // A tapé un mur en essayant d'entrer ou zone déjà remplie
          loseLife();
          return;
        }

        // Check if level clear
        if (goalsRef.current.every((g) => g.isFilled)) {
          if (levelRef.current === 1) {
            setLevel(2);
            setScore(s => s + 1000);
            initLevel(2);
          } else {
            setScore(s => s + 2000);
            setGameState("victory");
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Fond de base (Trottoir bas)
      ctx.fillStyle = "#1e293b"; // slate-800
      ctx.fillRect(0, 12 * GRID, CANVAS_WIDTH, 2 * GRID);
      // Texture trottoir
      ctx.fillStyle = "#334155";
      for(let i=0; i<CANVAS_WIDTH; i+=GRID) {
        ctx.fillRect(i, 12*GRID, 2, 2*GRID);
        ctx.fillRect(i, 12*GRID + GRID, GRID, 2);
      }

      // Route
      ctx.fillStyle = "#0f172a"; // slate-900 (Très sombre)
      ctx.fillRect(0, 7 * GRID, CANVAS_WIDTH, 5 * GRID);
      // Lignes de route
      ctx.fillStyle = "#475569"; // slate-600
      for (let i = 8; i <= 11; i++) {
        for (let j = 0; j < CANVAS_WIDTH; j += 80) {
          ctx.fillRect(j, i * GRID - 2, 40, 4);
        }
      }

      // Trottoir intermédiaire
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 6 * GRID, CANVAS_WIDTH, GRID);
      ctx.fillStyle = "#334155";
      for(let i=0; i<CANVAS_WIDTH; i+=GRID) {
        ctx.fillRect(i, 6*GRID, 2, GRID);
      }

      // Rivière
      ctx.fillStyle = "#1e3a8a"; // blue-900
      ctx.fillRect(0, 1 * GRID, CANVAS_WIDTH, 5 * GRID);
      // Effets d'eau améliorés
      ctx.fillStyle = "rgba(59, 130, 246, 0.4)"; // blue-500 translucide
      for (let i = 1; i <= 5; i++) {
        for (let j = (performance.now() * 0.05 + i * 20) % 100 - 100; j < CANVAS_WIDTH; j += 100) {
          ctx.beginPath();
          ctx.roundRect(j, i * GRID + 14, 50, 8, 4);
          ctx.roundRect(j + 40, i * GRID + 38, 30, 8, 4);
          ctx.fill();
        }
      }

      // Zone des buts (Titularisation)
      ctx.fillStyle = "#022c22"; // emerald-950
      ctx.fillRect(0, 0, CANVAS_WIDTH, GRID);
      ctx.fillStyle = "#064e3b"; // emerald-900
      goalsRef.current.forEach(g => {
        ctx.fillRect(g.x, g.y, g.width, g.height);
        if (g.isFilled) {
          ctx.fillStyle = "#22c55e"; // emerald-500
          ctx.fillRect(g.x + 4, g.y + 4, g.width - 8, g.height - 8);
          // Logo CFDT / Titulaire
          ctx.fillStyle = "white";
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("CDI", g.x + g.width / 2, g.y + g.height / 2);
          ctx.fillStyle = "#064e3b"; // reset
        }
      });

      // Entities
      entitiesRef.current.forEach(ent => {
        ctx.save();
        ctx.fillStyle = ent.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ent.color;
        const pad = 6;
        
        if (ent.type === "car") {
          // Chassis
          ctx.roundRect(ent.x + pad, ent.y + pad + 4, ent.width - pad*2, ent.height - pad*2 - 8, 8);
          ctx.fill();
          
          // Toit
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.roundRect(ent.x + pad + 12, ent.y + pad, ent.width - pad*2 - 24, ent.height - pad*2, 4);
          ctx.fill();

          // Roues
          ctx.fillStyle = "#020617";
          ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.arc(ent.x + pad + 14, ent.y + pad + 2, 6, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(ent.x + ent.width - pad - 14, ent.y + pad + 2, 6, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(ent.x + pad + 14, ent.y + ent.height - pad - 2, 6, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(ent.x + ent.width - pad - 14, ent.y + ent.height - pad - 2, 6, 0, Math.PI*2); ctx.fill();

          // Phares
          ctx.shadowBlur = 10;
          ctx.fillStyle = ent.speed > 0 ? "#fef08a" : "#f87171";
          ctx.shadowColor = ctx.fillStyle;
          const headlightX = ent.speed > 0 ? ent.x + ent.width - pad - 6 : ent.x + pad;
          ctx.fillRect(headlightX, ent.y + pad + 8, 6, 8);
          ctx.fillRect(headlightX, ent.y + ent.height - pad - 16, 6, 8);
          
          ctx.fillStyle = ent.speed > 0 ? "#f87171" : "#fef08a";
          ctx.shadowColor = ctx.fillStyle;
          const taillightX = ent.speed > 0 ? ent.x + pad : ent.x + ent.width - pad - 6;
          ctx.fillRect(taillightX, ent.y + pad + 8, 6, 8);
          ctx.fillRect(taillightX, ent.y + ent.height - pad - 16, 6, 8);

          // Fenêtre centrale
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(ent.x + ent.width/2 - 12, ent.y + pad + 4, 24, ent.height - pad*2 - 8);

        } else {
          // Plateforme (Log)
          ctx.roundRect(ent.x, ent.y + pad, ent.width, ent.height - pad*2, 12);
          ctx.fill();
          
          // Texture bois
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 3;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(ent.x + 15, ent.y + pad + 10); ctx.lineTo(ent.x + ent.width - 15, ent.y + pad + 10);
          ctx.moveTo(ent.x + 10, ent.y + ent.height/2); ctx.lineTo(ent.x + ent.width - 10, ent.y + ent.height/2);
          ctx.moveTo(ent.x + 15, ent.y + ent.height - pad - 10); ctx.lineTo(ent.x + ent.width - 15, ent.y + ent.height - pad - 10);
          ctx.stroke();
        }
        ctx.restore();

        // Texte
        ctx.fillStyle = "white";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ent.label, ent.x + ent.width / 2, ent.y + ent.height / 2);
      });

      // Player
      const p = playerRef.current;
      if (!p.isDead) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        
        const cx = p.x + GRID/2;
        const cy = p.y + GRID/2;
        
        // Corps
        ctx.beginPath();
        ctx.roundRect(cx - p.width/2 + 6, cy - p.height/2 + 10, p.width - 12, p.height - 16, 10);
        ctx.fill();
        
        // Tête (plus claire)
        ctx.fillStyle = "#bef264";
        ctx.beginPath();
        ctx.arc(cx, cy - p.height/4, p.width/3, 0, Math.PI*2);
        ctx.fill();
        
        // Yeux (lunettes)
        ctx.fillStyle = "#1e293b";
        ctx.shadowBlur = 0;
        ctx.fillRect(cx - 12, cy - p.height/4 - 4, 10, 6);
        ctx.fillRect(cx + 2, cy - p.height/4 - 4, 10, 6);
        ctx.fillRect(cx - 2, cy - p.height/4 - 2, 4, 2); // pont lunettes
        
        // Porte-documents (Agent)
        ctx.fillStyle = "#fb923c"; // orange
        ctx.roundRect(cx - p.width/2 - 2, cy, 10, 14, 2);
        ctx.fill();
        ctx.fillStyle = "#f97316";
        ctx.fillRect(cx - p.width/2, cy - 2, 6, 2); // anse
        
        ctx.roundRect(cx + p.width/2 - 8, cy, 10, 14, 2);
        ctx.fill();

        ctx.restore();
      }

      // Particules (Morts / Victoire)
      particlesRef.current.forEach(part => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, part.life);
        ctx.fillStyle = part.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [gameState, initLevel]);

  return (
    <div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500 py-4 sm:py-8 px-4 font-sans text-slate-800 dark:text-slate-100">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* Retour button */}
        <div className="w-full relative z-40 mb-4 flex justify-start">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Title & Stats */}
        <div className="text-center mb-4 w-full">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-slate-800 dark:text-slate-100">
            Le "Frogger" des Contractuels
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-bold">
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Niveau : <span className="text-purple-400 font-extrabold">{level}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Score : <span className="text-orange-400 font-extrabold">{score}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-1">
              Vies : 
              {[...Array(lives)].map((_, i) => (
                <ShieldAlert key={i} className="w-4 h-4 text-red-500 inline fill-red-500/30" />
              ))}
            </span>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-slate-900">
          
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block max-w-full h-auto touch-none"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* D-PAD Virtuel pour Mobile */}
          <div className="absolute bottom-4 right-4 grid grid-cols-3 grid-rows-3 gap-2 sm:hidden opacity-80">
            <div />
            <button onPointerDown={(e) => { e.preventDefault(); handleTouch("up"); }} className="w-12 h-12 bg-white/10 rounded-lg backdrop-blur flex justify-center items-center active:bg-white/30 border border-white/20">↑</button>
            <div />
            <button onPointerDown={(e) => { e.preventDefault(); handleTouch("left"); }} className="w-12 h-12 bg-white/10 rounded-lg backdrop-blur flex justify-center items-center active:bg-white/30 border border-white/20">←</button>
            <button onPointerDown={(e) => { e.preventDefault(); handleTouch("down"); }} className="w-12 h-12 bg-white/10 rounded-lg backdrop-blur flex justify-center items-center active:bg-white/30 border border-white/20">↓</button>
            <button onPointerDown={(e) => { e.preventDefault(); handleTouch("right"); }} className="w-12 h-12 bg-white/10 rounded-lg backdrop-blur flex justify-center items-center active:bg-white/30 border border-white/20">→</button>
          </div>

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,114,182,0.4)]">
                <Activity className="w-10 h-10 text-pink-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">La Traversée du Contractuel</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8 font-light text-sm">
                Évitez les motifs de recrutement abusifs (voitures) et sautez sur les CDD légaux (bûches) pour atteindre la Titularisation / le CDI !
              </p>
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium text-lg transition-all shadow-sm hover:shadow-md"
              >
                <Play className="w-5 h-5 fill-current" />
                Jouer
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 mb-2 drop-shadow-lg">
                LICENCIEMENT
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">Motif : Fin de contrat ou recours contentieux.</p>
              <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-8 shadow-sm">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Score Final</p>
                <p className="text-4xl font-bold text-orange-400">{score}</p>
              </div>
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                Réessayer
              </button>
            </div>
          )}

          {gameState === "victory" && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <Sparkles className="w-16 h-16 text-emerald-400 mb-4 animate-pulse" />
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-teal-500 mb-2">
                TITULARISATION ATTEINTE !
              </h2>
              <p className="text-emerald-700 dark:text-emerald-300 text-lg mb-8 max-w-sm">Vous avez triomphé des méandres réglementaires avec brio.</p>
              
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium text-lg transition-all shadow-sm hover:shadow-md"
              >
                <Play className="w-5 h-5 fill-current" />
                Refaire une carrière
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-6 text-slate-500 dark:text-slate-400 text-xs max-w-lg text-center font-light">
          Utilisez les <strong className="text-slate-700 dark:text-slate-200 font-semibold">Flèches du clavier</strong> pour vous déplacer. Sur mobile, utilisez les boutons directionnels en bas à droite de la grille.
        </p>

      </div>
    </div>
  );
};

export default FroggerContractuel;
