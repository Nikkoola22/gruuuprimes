import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Activity, RotateCcw, Trophy, Heart, Shield, Ghost, AlertTriangle } from 'lucide-react';

interface PacManProps {
  onClose: () => void;
}

const TILE_SIZE = 24;
const ROWS = 21;
const COLS = 21;
const CANVAS_WIDTH = COLS * TILE_SIZE;
const CANVAS_HEIGHT = ROWS * TILE_SIZE;

const INITIAL_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
  [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1,1],
  [2,2,2,2,2,2,0,0,1,0,0,0,1,0,0,2,2,2,2,2,2],
  [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  nextVx: number;
  nextVy: number;
  speed: number;
}

interface Ghost extends Entity {
  color: string;
  isVulnerable: boolean;
  startX: number;
  startY: number;
  name: string;
  lastTileX?: number;
  lastTileY?: number;
}

const PacManPaie: React.FC<PacManProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState("");

  const mazeRef = useRef<number[][]>([]);
  const playerRef = useRef<Entity>({ x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: 0, vy: 0, nextVx: 0, nextVy: 0, speed: 2 });
  const ghostsRef = useRef<Ghost[]>([]);
  const powerModeTimerRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  const initGame = useCallback(() => {
    mazeRef.current = INITIAL_MAZE.map(row => [...row]);
    playerRef.current = { x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: 0, vy: 0, nextVx: 0, nextVy: 0, speed: 2 };
    
    ghostsRef.current = [
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#ef4444", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Indu", lastTileX: 10, lastTileY: 10 },
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#3b82f6", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Absence", lastTileX: 10, lastTileY: 10 },
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#f59e0b", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Erreur CM", lastTileX: 10, lastTileY: 10 },
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#ec4899", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Surcharge", lastTileX: 10, lastTileY: 10 },
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#10b981", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Retard", lastTileX: 10, lastTileY: 10 },
    ];
    
    setScore(0);
    setLives(3);
    setGameState("playing");
    powerModeTimerRef.current = 0;
  }, []);

  const resetPositions = () => {
    playerRef.current = { x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: 0, vy: 0, nextVx: 0, nextVy: 0, speed: 2 };
    ghostsRef.current.forEach(g => {
      g.x = g.startX;
      g.y = g.startY;
      g.isVulnerable = false;
      g.vx = 0;
      g.vy = -g.speed;
      g.lastTileX = 10;
      g.lastTileY = 10;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
      
      const p = playerRef.current;
      if (e.key === "ArrowLeft") { p.nextVx = -p.speed; p.nextVy = 0; }
      if (e.key === "ArrowRight") { p.nextVx = p.speed; p.nextVy = 0; }
      if (e.key === "ArrowUp") { p.nextVx = 0; p.nextVy = -p.speed; }
      if (e.key === "ArrowDown") { p.nextVx = 0; p.nextVy = p.speed; }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const checkCollisionWithWall = (x: number, y: number) => {
      const topRow = Math.floor(y / TILE_SIZE);
      const bottomRow = Math.floor((y + TILE_SIZE - 1) / TILE_SIZE);

      // Allow wrapping ONLY in the tunnel rows (8 and 12)
      if (x < 0 || x + TILE_SIZE > CANVAS_WIDTH) {
        if ((topRow === 8 && bottomRow === 8) || (topRow === 12 && bottomRow === 12)) {
          return false;
        }
        return true; // Wall everywhere else outside
      }
      
      const leftCol = Math.floor(x / TILE_SIZE);
      const rightCol = Math.floor((x + TILE_SIZE - 1) / TILE_SIZE);

      if (topRow < 0 || bottomRow >= ROWS || leftCol < 0 || rightCol >= COLS) return true;

      return (
        mazeRef.current[topRow][leftCol] === 1 ||
        mazeRef.current[topRow][rightCol] === 1 ||
        mazeRef.current[bottomRow][leftCol] === 1 ||
        mazeRef.current[bottomRow][rightCol] === 1
      );
    };

    const updateGame = () => {
      if (gameState !== "playing") return;

      const p = playerRef.current;
      const maze = mazeRef.current;

      // Les fantômes accélèrent au fur et à mesure (vitesse de base de 1.4, augmente jusqu'à 2.8 avec le score)
      const currentBaseSpeed = Math.min(2.8, 1.4 + (score / 1500) * 1.4);
      ghostsRef.current.forEach(g => {
        g.speed = currentBaseSpeed;
        const speed = g.isVulnerable ? currentBaseSpeed * 0.6 : currentBaseSpeed;
        if (g.vx !== 0) g.vx = Math.sign(g.vx) * speed;
        if (g.vy !== 0) g.vy = Math.sign(g.vy) * speed;
      });

      // Try applying next direction if centered roughly
      if (
        (p.x % TILE_SIZE < p.speed || p.x % TILE_SIZE > TILE_SIZE - p.speed) &&
        (p.y % TILE_SIZE < p.speed || p.y % TILE_SIZE > TILE_SIZE - p.speed)
      ) {
        // Snap to grid slightly to turn cleanly
        const snappedX = Math.round(p.x / TILE_SIZE) * TILE_SIZE;
        const snappedY = Math.round(p.y / TILE_SIZE) * TILE_SIZE;
        
        if (!checkCollisionWithWall(snappedX + Math.sign(p.nextVx) * TILE_SIZE, snappedY + Math.sign(p.nextVy) * TILE_SIZE)) {
          p.x = snappedX;
          p.y = snappedY;
          p.vx = p.nextVx;
          p.vy = p.nextVy;
        }
      }

      // Move player
      if (!checkCollisionWithWall(p.x + p.vx, p.y + p.vy)) {
        p.x += p.vx;
        p.y += p.vy;
      }

      // Tunnel wrapping
      if (p.x < -TILE_SIZE) p.x = CANVAS_WIDTH;
      if (p.x > CANVAS_WIDTH) p.x = -TILE_SIZE;

      // Eat dots
      const centerCol = Math.floor((p.x + TILE_SIZE / 2) / TILE_SIZE);
      const centerRow = Math.floor((p.y + TILE_SIZE / 2) / TILE_SIZE);
      
      if (centerRow >= 0 && centerRow < ROWS && centerCol >= 0 && centerCol < COLS) {
        if (maze[centerRow][centerCol] === 2) {
          maze[centerRow][centerCol] = 0; // Dot eaten
          setScore(s => s + 10);
        } else if (maze[centerRow][centerCol] === 3) {
          maze[centerRow][centerCol] = 0; // Power pellet eaten
          setScore(s => s + 50);
          setMessage("DÉLIBÉRATION VALIDÉE !");
          setTimeout(() => setMessage(""), 2000);
          powerModeTimerRef.current = 400; // ~6-7 seconds at 60fps
          ghostsRef.current.forEach(g => { g.isVulnerable = true; });
        }
      }

      // Decrement power mode
      if (powerModeTimerRef.current > 0) {
        powerModeTimerRef.current--;
        if (powerModeTimerRef.current === 0) {
          ghostsRef.current.forEach(g => { g.isVulnerable = false; });
        }
      }

      // Update Ghosts
      ghostsRef.current.forEach(g => {
        // Tunnel wrapping
        if (g.x < -TILE_SIZE) g.x = CANVAS_WIDTH;
        if (g.x > CANVAS_WIDTH) g.x = -TILE_SIZE;

        const actualSpeed = g.isVulnerable ? g.speed * 0.6 : g.speed;

        const currentTileX = Math.round(g.x / TILE_SIZE);
        const currentTileY = Math.round(g.y / TILE_SIZE);
        const hasMovedTile = g.lastTileX === undefined || g.lastTileY === undefined || currentTileX !== g.lastTileX || currentTileY !== g.lastTileY;

        // Si le fantôme est dans la maison de départ (avec une marge de sécurité), on le guide vers la sortie
        const inHouse = g.y >= 9 * TILE_SIZE && g.y <= 11 * TILE_SIZE && g.x >= 9 * TILE_SIZE && g.x <= 12 * TILE_SIZE;

        if (hasMovedTile) {
          g.x = currentTileX * TILE_SIZE;
          g.y = currentTileY * TILE_SIZE;
          g.lastTileX = currentTileX;
          g.lastTileY = currentTileY;

          if (inHouse) {
            if (currentTileX < 10) {
              g.vx = actualSpeed;
              g.vy = 0;
            } else if (currentTileX > 10) {
              g.vx = -actualSpeed;
              g.vy = 0;
            } else {
              g.vx = 0;
              g.vy = -actualSpeed; // Se déplacer vers le haut pour sortir
            }
          } else {
            // Decide new direction at intersections
            const possibleMoves = [];
            const directions = [
              { vx: 0, vy: -actualSpeed }, // Up
              { vx: 0, vy: actualSpeed },  // Down
              { vx: -actualSpeed, vy: 0 }, // Left
              { vx: actualSpeed, vy: 0 },  // Right
            ];

            directions.forEach(dir => {
              // Don't reverse direction immediately unless trapped
              if (Math.sign(dir.vx) === -Math.sign(g.vx) && Math.sign(dir.vy) === -Math.sign(g.vy) && (g.vx !== 0 || g.vy !== 0)) return;
              if (!checkCollisionWithWall(g.x + Math.sign(dir.vx) * TILE_SIZE, g.y + Math.sign(dir.vy) * TILE_SIZE)) {
                possibleMoves.push(dir);
              }
            });

            if (possibleMoves.length > 0) {
              const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
              g.vx = move.vx;
              g.vy = move.vy;
            } else {
              // Reverse if trapped
              g.vx = -g.vx;
              g.vy = -g.vy;
            }
          }
        }

        if (!checkCollisionWithWall(g.x + g.vx, g.y + g.vy)) {
          g.x += Math.sign(g.vx) * actualSpeed;
          g.y += Math.sign(g.vy) * actualSpeed;
        } else {
          g.lastTileX = undefined; // Force re-evaluation on next frame if blocked
        }

        // Collision with player
        const dx = (p.x + TILE_SIZE / 2) - (g.x + TILE_SIZE / 2);
        const dy = (p.y + TILE_SIZE / 2) - (g.y + TILE_SIZE / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < TILE_SIZE * 0.8) {
          if (g.isVulnerable) {
            // Eat ghost
            setScore(s => s + 200);
            g.x = g.startX;
            g.y = g.startY;
            g.isVulnerable = false;
            g.lastTileX = 10;
            g.lastTileY = 10;
            g.vx = 0;
            g.vy = -g.speed;
            setMessage("ANOMALIE RÉSOLUE !");
            setTimeout(() => setMessage(""), 1000);
          } else {
            // Lose life
            setLives(l => {
              const nextL = l - 1;
              if (nextL <= 0) {
                setGameState("gameover");
              } else {
                resetPositions();
              }
              return nextL;
            });
          }
        }
      });

      // Check victory
      let dotsLeft = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (maze[r][c] === 2 || maze[r][c] === 3) dotsLeft++;
        }
      }
      if (dotsLeft === 0) {
        setGameState("victory");
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Maze
      const maze = mazeRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = maze[r][c];
          if (tile === 1) {
            // Wall
            ctx.fillStyle = "rgba(59, 130, 246, 0.4)"; // Neon blue walls
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#3b82f6";
            ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.shadowBlur = 0;
          } else if (tile === 2) {
            // Dot (Bonus Dollar)
            ctx.fillStyle = "#fbbf24"; // Gold
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
          } else if (tile === 3) {
            // Power Pellet (Billet de paie / Grosse Prime)
            ctx.fillStyle = "#10b981"; // Green
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#10b981";
            
            // Draw a small paycheck bill
            const x = c * TILE_SIZE + 4;
            const y = r * TILE_SIZE + 5;
            const w = TILE_SIZE - 8;
            const h = TILE_SIZE - 10;
            ctx.fillRect(x, y, w, h);
            
            // Draw tiny details on bill
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
            ctx.shadowBlur = 0;
          }
        }
      }
 
      // Draw Player (Bulletin de Salaire)
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x + TILE_SIZE / 2, p.y + TILE_SIZE / 2);
      
      // Draw a document sheet representing the Paycheck
      ctx.fillStyle = "#a855f7"; // Neon purple document
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#a855f7";
      
      // Main sheet shape
      ctx.beginPath();
      // Draw a rounded rectangle for a document
      ctx.roundRect(-TILE_SIZE / 2 + 3, -TILE_SIZE / 2 + 2, TILE_SIZE - 6, TILE_SIZE - 4, 3);
      ctx.fill();

      // Lines of text on the paycheck
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Line 1
      ctx.moveTo(-TILE_SIZE / 2 + 6, -TILE_SIZE / 2 + 6);
      ctx.lineTo(TILE_SIZE / 2 - 6, -TILE_SIZE / 2 + 6);
      // Line 2
      ctx.moveTo(-TILE_SIZE / 2 + 6, -TILE_SIZE / 2 + 10);
      ctx.lineTo(TILE_SIZE / 2 - 6, -TILE_SIZE / 2 + 10);
      // Line 3
      ctx.moveTo(-TILE_SIZE / 2 + 6, -TILE_SIZE / 2 + 14);
      ctx.lineTo(TILE_SIZE / 2 - 10, -TILE_SIZE / 2 + 14);
      ctx.stroke();

      // Gold seal badge
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(TILE_SIZE / 2 - 7, TILE_SIZE / 2 - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Ghosts
      ghostsRef.current.forEach(g => {
        ctx.save();
        ctx.translate(g.x + TILE_SIZE / 2, g.y + TILE_SIZE / 2);
        
        ctx.fillStyle = g.isVulnerable ? (powerModeTimerRef.current < 100 && Math.floor(Date.now() / 200) % 2 === 0 ? "#ffffff" : "#60a5fa") : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        // Ghost body
        ctx.arc(0, -2, TILE_SIZE / 2 - 2, Math.PI, 0);
        ctx.lineTo(TILE_SIZE / 2 - 2, TILE_SIZE / 2 - 2);
        // Wavy bottom
        ctx.lineTo(TILE_SIZE / 4, TILE_SIZE / 2 - 4);
        ctx.lineTo(0, TILE_SIZE / 2 - 2);
        ctx.lineTo(-TILE_SIZE / 4, TILE_SIZE / 2 - 4);
        ctx.lineTo(-TILE_SIZE / 2 + 2, TILE_SIZE / 2 - 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-4, -4, 3, 0, Math.PI * 2);
        ctx.arc(4, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = g.isVulnerable ? "#ef4444" : "#1e293b";
        const pupilDx = g.isVulnerable ? 0 : Math.sign(g.vx);
        const pupilDy = g.isVulnerable ? 0 : Math.sign(g.vy);
        ctx.beginPath();
        ctx.arc(-4 + pupilDx, -4 + pupilDy, 1.5, 0, Math.PI * 2);
        ctx.arc(4 + pupilDx, -4 + pupilDy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    };

    const loop = () => {
      updateGame();
      drawGame();
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [gameState]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500  sm: px-4 sm:px-6 lg:px-8 font-sans text-slate-800 dark:text-slate-100">
      
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Retour button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-full transition-all text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Title & Stats */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-black tracking-widest mb-2 uppercase" style={{fontFamily: 'monospace', color: '#eab308', textShadow: '0 0 25px rgba(234,179,8,0.6), 0 0 60px rgba(234,179,8,0.3)'}}>
            PAC-MAN <span style={{color: '#38bdf8', textShadow: '0 0 25px rgba(56,189,248,0.7)'}}>PAIE</span>
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm font-bold mt-4">
            <span className="px-4 py-2 rounded-xl font-mono text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(234,179,8,0.5)', color: '#fef08a', letterSpacing: '0.1em'}}>
              SCORE <span className="text-amber-400 text-base font-black ml-1">{score}</span>
            </span>
            <span className="px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', letterSpacing: '0.1em'}}>
              VIES
              <span className="flex gap-1">
                {Array.from({ length: Math.max(0, lives) }).map((_, idx) => (
                  <Heart key={idx} className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                ))}
              </span>
            </span>
            {message && (
              <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/50 font-mono text-xs animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                {message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto bg-slate-950/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-800 relative overflow-hidden min-h-[480px]">
          
          {gameState === "ready" && (
            <div className="text-center self-center relative z-10 w-full animate-fade-in py-10">
              <div className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_35px_rgba(234,179,8,0.4)] transform -rotate-3 hover:rotate-0 transition-transform">
                <Ghost className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-bounce" />
              </div>
              <h2 className="text-3xl font-black mb-3 text-white tracking-wide uppercase" style={{fontFamily: 'monospace'}}>PRÊT À GÉRER LA PAIE ?</h2>
              <p className="text-slate-300 max-w-sm mx-auto mb-8 text-sm font-medium leading-relaxed">
                Mangez les <span className="text-yellow-400 font-bold">Crédits</span> et attrapez les <span className="text-rose-400 font-bold">Délibérations</span> pour pouvoir chasser les Erreurs RH (Fantômes) !
              </p>
              <button 
                onClick={initGame} 
                className="mx-auto px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] border border-yellow-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-wider text-base"
              >
                <Play className="w-6 h-6 fill-current" /> Jouer
              </button>
            </div>
          )}

          {(gameState === "gameover" || gameState === "victory") && (
            <div className="text-center self-center relative z-10 w-full animate-scale-up py-10">
              {gameState === "victory" ? (
                <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                  <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-rose-500/20 border border-rose-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(244,63,94,0.5)]">
                  <AlertTriangle className="w-10 h-10 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-white tracking-wide uppercase" style={{fontFamily: 'monospace'}}>
                {gameState === "victory" ? "PAIE VALIDÉE ! 🎉" : "CATASTROPHE RH ! 😢"}
              </h2>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl max-w-xs mx-auto mb-8">
                <p className="text-slate-400 text-xs font-mono uppercase mb-1">Score Final</p>
                <p className="text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">{score}</p>
              </div>
              <button 
                onClick={initGame} 
                className="mx-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-full shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider text-base"
              >
                <RotateCcw className="w-5 h-5" /> Rejouer
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-slate-950 rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] border border-slate-800 max-w-full h-auto block"
              />
            </div>
          )}

          {/* D-pad mobile — visible uniquement sur écran tactile */}
          {gameState === "playing" && (
            <div className="mt-4 flex flex-col items-center gap-1 md:hidden select-none">
              <button
                onTouchStart={(e) => { e.preventDefault(); const p = playerRef.current; p.nextVx = 0; p.nextVy = -p.speed; }}
                className="w-16 h-16 bg-slate-800/90 border border-slate-600 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-slate-600 shadow-lg"
                aria-label="Haut"
              >▲</button>
              <div className="flex gap-1">
                <button
                  onTouchStart={(e) => { e.preventDefault(); const p = playerRef.current; p.nextVx = -p.speed; p.nextVy = 0; }}
                  className="w-16 h-16 bg-slate-800/90 border border-slate-600 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-slate-600 shadow-lg"
                  aria-label="Gauche"
                >◀</button>
                <div className="w-16 h-16" />
                <button
                  onTouchStart={(e) => { e.preventDefault(); const p = playerRef.current; p.nextVx = p.speed; p.nextVy = 0; }}
                  className="w-16 h-16 bg-slate-800/90 border border-slate-600 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-slate-600 shadow-lg"
                  aria-label="Droite"
                >▶</button>
              </div>
              <button
                onTouchStart={(e) => { e.preventDefault(); const p = playerRef.current; p.nextVx = 0; p.nextVy = p.speed; }}
                className="w-16 h-16 bg-slate-800/90 border border-slate-600 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-slate-600 shadow-lg"
                aria-label="Bas"
              >▼</button>
            </div>
          )}

        </div>
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-light max-w-2xl mx-auto w-full flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <strong className="block mb-1 font-semibold">Conseil RH :</strong>
            Utilisez les flèches directionnelles du clavier pour vous déplacer. Mangez une <b>Délibération Modificative</b> (les gros points rouges) pour rendre les erreurs (Indus, Absences) vulnérables et les corriger en leur fonçant dessus !
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default PacManPaie;
