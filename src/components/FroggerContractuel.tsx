import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Sparkles, Activity } from "lucide-react";

interface FroggerContractuelProps {
  onClose: () => void;
}

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

const playRetroSound = (type: "jump" | "collision" | "success" | "gameover" | "victory") => {
  try {
    // @ts-expect-error — webkitAudioContext est l'ancien préfixe Safari, absent des types DOM
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "jump") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "collision") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "success") {
      osc.type = "square";
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      });
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.24);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "gameover") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.7);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === "victory") {
      osc.type = "square";
      const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      melody.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      });
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.setValueAtTime(0.1, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    }
  } catch (e) {
    console.warn("Audio Context blocked or not supported", e);
  }
};

const FroggerContractuel: React.FC<FroggerContractuelProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [, setLevelState] = useState(1);

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
    playRetroSound("collision");
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setGameState("gameover");
        playRetroSound("gameover");
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
        if (p.y > 0) { p.y -= GRID; setScore(s => s + 10); playRetroSound("jump"); }
      } else if (e.key === "ArrowDown") {
        if (p.y < (ROWS - 1) * GRID) { p.y += GRID; playRetroSound("jump"); }
      } else if (e.key === "ArrowLeft") {
        if (p.x > 0) { p.x -= GRID; playRetroSound("jump"); }
      } else if (e.key === "ArrowRight") {
        if (p.x < (COLS - 1) * GRID) { p.x += GRID; playRetroSound("jump"); }
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
      if (p.y > 0) { p.y -= GRID; setScore(s => s + 10); playRetroSound("jump"); }
    } else if (dir === "down") {
      if (p.y < (ROWS - 1) * GRID) { p.y += GRID; playRetroSound("jump"); }
    } else if (dir === "left") {
      if (p.x > 0) { p.x -= GRID; playRetroSound("jump"); }
    } else if (dir === "right") {
      if (p.x < (COLS - 1) * GRID) { p.x += GRID; playRetroSound("jump"); }
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
            if (!goalsRef.current.every((g) => g.isFilled)) {
              playRetroSound("success");
            }
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
            playRetroSound("success");
          } else {
            setScore(s => s + 2000);
            setGameState("victory");
            playRetroSound("victory");
          }
        }
      }
    };

    const drawPixelSprite = (ctx: CanvasRenderingContext2D, x: number, y: number, sprite: string[], color: string, pSize: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
          if (sprite[r][c] !== ' ' && sprite[r][c] !== '0') {
             if (sprite[r][c] === '2') {
                 // Alternate color (e.g. white for eyes/details)
                 ctx.fillStyle = "#ffffff";
                 ctx.fillRect(x + c * pSize, y + r * pSize, pSize, pSize);
                 ctx.fillStyle = color;
             } else if (sprite[r][c] === '3') {
                 // Black for tires/eyes
                 ctx.fillStyle = "#000000";
                 ctx.fillRect(x + c * pSize, y + r * pSize, pSize, pSize);
                 ctx.fillStyle = color;
             } else {
                 ctx.rect(x + c * pSize, y + r * pSize, pSize, pSize);
             }
          }
        }
      }
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Fond de base (Trottoir bas) - Herbe verte
      ctx.fillStyle = "#166534"; // dark green grass
      ctx.fillRect(0, 12 * GRID, CANVAS_WIDTH, 2 * GRID);
      
      // Route (Asphalte)
      ctx.fillStyle = "#1e293b"; // dark slate for road
      ctx.fillRect(0, 7 * GRID, CANVAS_WIDTH, 5 * GRID);
      
      // Lignes de route pointillées blanches
      ctx.fillStyle = "#cbd5e1";
      for (let i = 8; i <= 11; i++) {
        for (let j = 0; j < CANVAS_WIDTH; j += 60) {
          ctx.fillRect(j, i * GRID - 2, 30, 4);
        }
      }

      // Trottoir intermédiaire - Herbe
      ctx.fillStyle = "#166534";
      ctx.fillRect(0, 6 * GRID, CANVAS_WIDTH, GRID);

      // Rivière - Eau bleue avec un peu de texture
      ctx.fillStyle = "#1e3a8a"; // deep blue
      ctx.fillRect(0, 1 * GRID, CANVAS_WIDTH, 5 * GRID);
      ctx.fillStyle = "#2563eb"; // lighter blue
      for(let r = 1; r < 6; r++) {
         for(let c = 0; c < CANVAS_WIDTH; c+=40) {
             ctx.fillRect(c + (r%2)*20, r * GRID + 20, 15, 4);
         }
      }

      // Zone des buts (Buissons et Criques d'eau)
      ctx.fillStyle = "#14532d"; // very dark green bushes
      ctx.fillRect(0, 0, CANVAS_WIDTH, GRID);
      
      goalsRef.current.forEach(g => {
        // Crique d'eau (trou dans les buissons)
        ctx.fillStyle = "#1e3a8a"; 
        ctx.fillRect(g.x, g.y, g.width, g.height);
        
        if (g.isFilled) {
          // Grenouille arrivée
          const frogSprite = [
            "  11   11  ",
            " 111111111 ",
            " 123111321 ",
            " 111111111 ",
            " 111111111 ",
            " 1 11111 1 ",
            " 111   111 ",
            "111     111"
          ];
          drawPixelSprite(ctx, g.x + 10, g.y + 10, frogSprite, "#22c55e", 4);
        }
      });

      // Entities (Voitures, Camions, Rondins, Tortues)
      entitiesRef.current.forEach(ent => {
        if (ent.type === "car") {
            // Draw pixel art car
            const carSpriteRight = [
              "  33    33  ",
              " 1111111112 ",
              " 1111111112 ",
              " 1111111112 ",
              "  33    33  "
            ];
            const carSpriteLeft = [
              "  33    33  ",
              " 2111111111 ",
              " 2111111111 ",
              " 2111111111 ",
              "  33    33  "
            ];
            const pSize = ent.height / 5;
            const sprite = ent.speed > 0 ? carSpriteRight : carSpriteLeft;
            drawPixelSprite(ctx, ent.x, ent.y, sprite, ent.color, pSize);
            
            // Draw length for trucks (stretch middle)
            if (ent.width > GRID * 1.5) {
               ctx.fillStyle = ent.color;
               ctx.fillRect(ent.x + pSize*4, ent.y + pSize, ent.width - pSize*8, pSize*3);
               // White stripe removed for better text readability
            }
        } else {
            // Log or Turtle
            if (ent.label.includes("1 an") || ent.label.includes("2 ans")) {
                // Draw Turtle
                const turtleSprite = [
                  "  11  ",
                  " 1111 ",
                  "311113",
                  " 1111 ",
                  "  11  "
                ];
                // Draw multiple turtles to fill the length
                const tSize = ent.height / 5;
                for(let tx = ent.x; tx < ent.x + ent.width - tSize*4; tx += tSize*7) {
                    drawPixelSprite(ctx, tx, ent.y, turtleSprite, "#166534", tSize); // dark green shell
                    // Turtle head
                    ctx.fillStyle = "#65a30d"; // light green head
                    ctx.fillRect(tx + (ent.speed > 0 ? tSize*6 : -tSize*2), ent.y + tSize*2, tSize*2, tSize);
                }
            } else {
                // Draw Log
                ctx.fillStyle = "#78350f"; // brown
                ctx.fillRect(ent.x, ent.y + 10, ent.width, ent.height - 20);
                // Mossy ends
                ctx.fillStyle = "#4d7c0f";
                ctx.fillRect(ent.x, ent.y + 10, 15, ent.height - 20);
                ctx.fillRect(ent.x + ent.width - 15, ent.y + 10, 15, ent.height - 20);
                
                // Wood grains
                ctx.fillStyle = "#451a03";
                ctx.fillRect(ent.x + 20, ent.y + 15, ent.width - 40, 2);
                ctx.fillRect(ent.x + 30, ent.y + 30, ent.width - 60, 2);
            }
        }
        
        // Texte RH demandé
        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        let text = "";
        let textX = ent.x + ent.width / 2;
        
        if (ent.type === "car") {
            const pSize = ent.height / 5;
            // The car sprite is 12 pixels wide, we center relative to the drawn sprite width
            textX = ent.x + (12 * pSize) / 2;
            
            if (ent.width > GRID * 1.5) {
                text = "Fin de contrat";
                textX = ent.x + ent.width / 2; // Trucks stretch to full ent.width
            } else {
                // Use a static property (ent.label) so it doesn't flicker while moving!
                text = (ent.label.length % 2 === 0) ? "ARE" : "Précarité";
            }
        } else {
            text = "CDD";
        }
        ctx.fillText(text, textX, ent.y + ent.height / 2 + 1);
        ctx.shadowBlur = 0;
      });

      // Player (Agent Grenouille)
      const p = playerRef.current;
      if (!p.isDead) {
        const frogSprite = [
          "  11   11  ",
          " 111111111 ",
          " 123111321 ",
          " 111111111 ",
          " 111111111 ",
          " 1 11111 1 ",
          " 111   111 ",
          "111     111"
        ];
        drawPixelSprite(ctx, p.x + 4, p.y + 8, frogSprite, p.color, 4);
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
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500  sm: px-4 font-sans text-slate-800 dark:text-slate-100">
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

        {/* Title & Stats */}
        <div className="text-center mb-6 w-full animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-black tracking-widest mb-2 uppercase" style={{fontFamily: 'monospace', color: '#4ade80', textShadow: '0 0 25px rgba(74,222,128,0.6)'}}>
            CHASSE AU <span style={{color: '#38bdf8', textShadow: '0 0 25px rgba(56,189,248,0.7)'}}>CDI</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold max-w-lg mx-auto mb-6 tracking-widest text-slate-300" style={{fontFamily: 'monospace'}}>
            ÉVITEZ LA PRÉCARITÉ — REJOIGNEZ LA FONCTION PUBLIQUE !
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm font-bold">
            <span className="px-4 py-2 rounded-xl font-mono text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(74,222,128,0.5)', color: '#86efac', letterSpacing: '0.1em'}}>
              VIES <span className="text-emerald-400 text-base font-black ml-1">{lives}</span>
            </span>
            <span className="px-4 py-2 rounded-xl font-mono text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(56,189,248,0.5)', color: '#7dd3fc', letterSpacing: '0.1em'}}>
              POSTES VALIDÉS <span className="text-sky-400 text-base font-black ml-1">{score} / 5</span>
            </span>
          </div>
        </div>

        {/* Canvas & Overlays */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl bg-slate-950/80">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block max-w-full h-auto mx-auto"
          />

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(16,185,129,0.4)] transform -rotate-3 hover:rotate-0 transition-transform">
                <Activity className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-wider" style={{fontFamily: 'monospace'}}>CHASSE AU CDI</h2>
              <p className="text-slate-300 max-w-md mx-auto mb-8 font-medium text-sm leading-relaxed">
                Évitez les pièges de la précarité (voitures) et naviguez sur les contrats CDD légaux (bûches) pour atteindre les 5 postes de Titularisation !
              </p>
              <button
                onClick={startNewGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-full text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" />
                Démarrer la partie
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h2 className="text-4xl sm:text-6xl font-black text-rose-500 mb-2 uppercase tracking-wider drop-shadow-[0_0_25px_rgba(244,63,94,0.5)]" style={{fontFamily: 'monospace'}}>
                FIN DE CONTRAT !
              </h2>
              <p className="text-slate-300 text-base mb-6">Motif : Rupture ou non-renouvellement de contrat.</p>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-8 min-w-[200px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <p className="text-slate-400 text-xs font-mono uppercase mb-1">Score Final</p>
                <p className="text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">{score}</p>
              </div>
              <button
                onClick={startNewGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-full text-base transition-all shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                <ArrowLeft className="w-5 h-5" />
                Réessayer
              </button>
            </div>
          )}

          {gameState === "victory" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-emerald-400 mb-2 uppercase tracking-wider drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]" style={{fontFamily: 'monospace'}}>
                TITULARISATION ATTEINTE !
              </h2>
              <p className="text-slate-300 text-base mb-8 max-w-sm">Vous avez franchi tous les obstacles statutaires avec succès !</p>
              
              <button
                onClick={startNewGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-full text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" />
                Refaire une carrière
              </button>
            </div>
          )}
        </div>

        {/* Console de contrôle rétro (Visible uniquement sur mobile / tablette) */}
        <div className="w-full max-w-xs sm:max-w-sm mt-6 p-4 bg-slate-800/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl md:hidden flex justify-between items-center select-none touch-none backdrop-blur-md">
          {/* Croix directionnelle (D-PAD) */}
          <div className="relative w-28 h-28 flex items-center justify-center bg-slate-700/40 rounded-full border border-slate-600/50 shadow-inner">
            <div className="absolute w-20 h-7 bg-slate-900 rounded-md flex justify-between px-0.5">
              <button 
                onPointerDown={(e) => { e.preventDefault(); handleTouch("left"); }} 
                className="w-6 h-full text-slate-400 font-bold active:text-white active:scale-90 text-sm flex items-center justify-center"
              >
                ◀
              </button>
              <button 
                onPointerDown={(e) => { e.preventDefault(); handleTouch("right"); }} 
                className="w-6 h-full text-slate-400 font-bold active:text-white active:scale-90 text-sm flex items-center justify-center"
              >
                ▶
              </button>
            </div>
            <div className="absolute w-7 h-20 bg-slate-900 rounded-md flex flex-col justify-between py-0.5 items-center">
              <button 
                onPointerDown={(e) => { e.preventDefault(); handleTouch("up"); }} 
                className="w-full h-6 text-slate-400 font-bold active:text-white active:scale-90 text-sm flex items-center justify-center"
              >
                ▲
              </button>
              <button 
                onPointerDown={(e) => { e.preventDefault(); handleTouch("down"); }} 
                className="w-full h-6 text-slate-400 font-bold active:text-white active:scale-90 text-sm flex items-center justify-center"
              >
                ▼
              </button>
            </div>
            <div className="absolute w-7 h-7 bg-slate-800 rounded-full border border-slate-950 shadow pointer-events-none" />
          </div>

          {/* Bouton d'action rouge (START/RESTART) */}
          <div className="flex flex-col items-center gap-1 pr-2">
            <button 
              onPointerDown={(e) => { 
                e.preventDefault(); 
                if (gameState === "ready" || gameState === "gameover" || gameState === "victory") {
                  startNewGame();
                }
              }}
              className="w-12 h-12 bg-red-600 active:bg-red-800 rounded-full border-4 border-slate-900 shadow-md flex items-center justify-center active:scale-90 transition-all text-white font-extrabold text-[10px]"
            >
              START
            </button>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Action</span>
          </div>
        </div>
        
        <p className="mt-6 text-slate-500 dark:text-slate-400 text-xs max-w-lg text-center font-light">
          Utilisez les <strong className="text-slate-700 dark:text-slate-200 font-semibold">Flèches du clavier</strong> pour vous déplacer. Sur mobile, utilisez la manette virtuelle ci-dessus.
        </p>

      </div>
    </div>
  );
};

export default FroggerContractuel;
