import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Activity, RotateCcw, Trophy, Heart, Shield, Ghost, AlertTriangle, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from 'lucide-react';

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
}

interface BonusItem {
  id: number;
  row: number;
  col: number;
  type: "SEGUR" | "MEDAILLE" | "CAFE" | "DELIBERATION";
  label: string;
  symbol: string;
  color: string;
  points: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const BONUS_TYPES = [
  { type: "SEGUR", label: "PRIME SÉGUR", symbol: "🪙", color: "#f59e0b", points: 300 },
  { type: "MEDAILLE", label: "MÉDAILLE QVT", symbol: "🏆", color: "#10b981", points: 500 },
  { type: "CAFE", label: "PAUSE CAFÉ", symbol: "☕", color: "#38bdf8", points: 200 },
  { type: "DELIBERATION", label: "DÉLIBÉRATION", symbol: "📜", color: "#a855f7", points: 400 }
];

const PacManPaie: React.FC<PacManProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState("");

  const mazeRef = useRef<number[][]>([]);
  const playerRef = useRef<Entity>({ x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: -2, vy: 0, nextVx: -2, nextVy: 0, speed: 2 });
  const ghostsRef = useRef<Ghost[]>([]);
  const activeBonusRef = useRef<BonusItem | null>(null);
  const bonusTimerRef = useRef<number>(0);
  const speedBoostTimerRef = useRef<number>(0);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const powerModeTimerRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const changeDirection = useCallback((dir: "left" | "right" | "up" | "down") => {
    const p = playerRef.current;
    const speed = speedBoostTimerRef.current > 0 ? 3 : 2;
    if (dir === "left") { p.nextVx = -speed; p.nextVy = 0; }
    if (dir === "right") { p.nextVx = speed; p.nextVy = 0; }
    if (dir === "up") { p.nextVx = 0; p.nextVy = -speed; }
    if (dir === "down") { p.nextVx = 0; p.nextVy = speed; }
  }, []);
  
  const initGame = useCallback(() => {
    mazeRef.current = INITIAL_MAZE.map(row => [...row]);
    playerRef.current = { x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: -2, vy: 0, nextVx: -2, nextVy: 0, speed: 2 };
    
    ghostsRef.current = [
      { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#ef4444", isVulnerable: false, startX: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Indu" },
      { x: 9 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#3b82f6", isVulnerable: false, startX: 9 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Absence" },
      { x: 11 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#f59e0b", isVulnerable: false, startX: 11 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Erreur CM" },
      { x: 9 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#ec4899", isVulnerable: false, startX: 9 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Surcharge" },
      { x: 11 * TILE_SIZE, y: 10 * TILE_SIZE, vx: 0, vy: -1.5, nextVx: 0, nextVy: 0, speed: 1.5, color: "#10b981", isVulnerable: false, startX: 11 * TILE_SIZE, startY: 10 * TILE_SIZE, name: "Retard" },
    ];
    
    activeBonusRef.current = null;
    bonusTimerRef.current = 0;
    speedBoostTimerRef.current = 0;
    floatingTextsRef.current = [];
    setScore(0);
    setLives(3);
    setGameState("playing");
    powerModeTimerRef.current = 0;
  }, []);

  const resetPositions = () => {
    playerRef.current = { x: 10 * TILE_SIZE, y: 16 * TILE_SIZE, vx: -2, vy: 0, nextVx: -2, nextVy: 0, speed: 2 };
    ghostsRef.current.forEach(g => {
      g.x = g.startX;
      g.y = g.startY;
      g.isVulnerable = false;
      g.vx = 0;
      g.vy = -1.5;
    });
  };

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      life: 30
    });
  };

  // Événements Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;

      if (
        key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" ||
        code === "ArrowLeft" || code === "ArrowRight" || code === "ArrowUp" || code === "ArrowDown"
      ) {
        e.preventDefault();
      }

      if (key === "ArrowLeft" || code === "ArrowLeft" || key === "q" || key === "Q" || key === "a" || key === "A" || code === "KeyA" || code === "KeyQ") {
        changeDirection("left");
      } else if (key === "ArrowRight" || code === "ArrowRight" || key === "d" || key === "D" || code === "KeyD") {
        changeDirection("right");
      } else if (key === "ArrowUp" || code === "ArrowUp" || key === "z" || key === "Z" || key === "w" || key === "W" || code === "KeyW" || code === "KeyZ") {
        changeDirection("up");
      } else if (key === "ArrowDown" || code === "ArrowDown" || key === "s" || key === "S" || code === "KeyS") {
        changeDirection("down");
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [changeDirection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const checkCollisionWithWall = (x: number, y: number) => {
      const topRow = Math.floor(y / TILE_SIZE);
      const bottomRow = Math.floor((y + TILE_SIZE - 1) / TILE_SIZE);

      if (x < 0 || x + TILE_SIZE > CANVAS_WIDTH) {
        if ((topRow === 8 && bottomRow === 8) || (topRow === 12 && bottomRow === 12)) {
          return false;
        }
        return true;
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

    const spawnRandomBonus = () => {
      if (activeBonusRef.current !== null) return;

      const validCells: { r: number; c: number }[] = [];
      const maze = mazeRef.current;
      for (let r = 2; r < ROWS - 2; r++) {
        for (let c = 2; c < COLS - 2; c++) {
          if (maze[r][c] === 0 || maze[r][c] === 2) {
            if (!(r >= 8 && r <= 12 && c >= 8 && c <= 12)) {
              validCells.push({ r, c });
            }
          }
        }
      }

      if (validCells.length > 0) {
        const cell = validCells[Math.floor(Math.random() * validCells.length)];
        const bonusDef = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];

        activeBonusRef.current = {
          id: Date.now(),
          row: cell.r,
          col: cell.c,
          type: bonusDef.type as any,
          label: bonusDef.label,
          symbol: bonusDef.symbol,
          color: bonusDef.color,
          points: bonusDef.points,
          life: 480,
          maxLife: 480
        };

        setMessage(`BONUS RH EN APPROCHE : ${bonusDef.label} !`);
        setTimeout(() => setMessage(""), 2000);
      }
    };

    const updateGame = () => {
      if (gameState !== "playing") return;
      frameCountRef.current++;

      const p = playerRef.current;
      const maze = mazeRef.current;

      const pSpeed = speedBoostTimerRef.current > 0 ? 3 : 2;
      if (speedBoostTimerRef.current > 0) {
        speedBoostTimerRef.current--;
      }
      p.speed = pSpeed;

      // Virage Arcade Tampon
      const isReverse = (Math.sign(p.nextVx) === -Math.sign(p.vx) && p.vx !== 0) ||
                        (Math.sign(p.nextVy) === -Math.sign(p.vy) && p.vy !== 0);

      if (isReverse) {
        p.vx = Math.sign(p.nextVx) * pSpeed;
        p.vy = Math.sign(p.nextVy) * pSpeed;
      } else if (p.nextVx !== 0 || p.nextVy !== 0) {
        const TURN_BUFFER = 10;

        if (p.nextVx !== 0) {
          const targetRow = Math.round(p.y / TILE_SIZE);
          const distY = Math.abs(p.y - targetRow * TILE_SIZE);

          if (distY <= TURN_BUFFER) {
            const targetY = targetRow * TILE_SIZE;
            const targetCol = Math.floor((p.x + TILE_SIZE / 2) / TILE_SIZE) + Math.sign(p.nextVx);
            
            if (targetCol >= 0 && targetCol < COLS && targetRow >= 0 && targetRow < ROWS) {
              if (maze[targetRow][targetCol] !== 1) {
                p.y = targetY;
                p.vx = Math.sign(p.nextVx) * pSpeed;
                p.vy = 0;
              }
            }
          }
        } else if (p.nextVy !== 0) {
          const targetCol = Math.round(p.x / TILE_SIZE);
          const distX = Math.abs(p.x - targetCol * TILE_SIZE);

          if (distX <= TURN_BUFFER) {
            const targetX = targetCol * TILE_SIZE;
            const targetRow = Math.floor((p.y + TILE_SIZE / 2) / TILE_SIZE) + Math.sign(p.nextVy);

            if (targetRow >= 0 && targetRow < ROWS && targetCol >= 0 && targetCol < COLS) {
              if (maze[targetRow][targetCol] !== 1) {
                p.x = targetX;
                p.vx = 0;
                p.vy = Math.sign(p.nextVy) * pSpeed;
              }
            }
          }
        }
      }

      if (p.vx !== 0) p.vx = Math.sign(p.vx) * pSpeed;
      if (p.vy !== 0) p.vy = Math.sign(p.vy) * pSpeed;

      // Déplacement du Joueur
      if (!checkCollisionWithWall(p.x + p.vx, p.y + p.vy)) {
        p.x += p.vx;
        p.y += p.vy;
      } else {
        p.vx = 0;
        p.vy = 0;
      }

      // Tunnel wrapping
      if (p.x < -TILE_SIZE) p.x = CANVAS_WIDTH;
      if (p.x > CANVAS_WIDTH) p.x = -TILE_SIZE;

      // Manger les pastilles & Délibérations
      const centerCol = Math.floor((p.x + TILE_SIZE / 2) / TILE_SIZE);
      const centerRow = Math.floor((p.y + TILE_SIZE / 2) / TILE_SIZE);
      
      if (centerRow >= 0 && centerRow < ROWS && centerCol >= 0 && centerCol < COLS) {
        if (maze[centerRow][centerCol] === 2) {
          maze[centerRow][centerCol] = 0;
          setScore(s => s + 10);
        } else if (maze[centerRow][centerCol] === 3) {
          maze[centerRow][centerCol] = 0;
          setScore(s => s + 50);
          setMessage("DÉLIBÉRATION VALIDÉE !");
          setTimeout(() => setMessage(""), 2000);
          powerModeTimerRef.current = 400;
          ghostsRef.current.forEach(g => { g.isVulnerable = true; });
        }
      }

      // Timer Mode Vulnérable
      if (powerModeTimerRef.current > 0) {
        powerModeTimerRef.current--;
        if (powerModeTimerRef.current === 0) {
          ghostsRef.current.forEach(g => { g.isVulnerable = false; });
        }
      }

      // Spawn périodique des bonus éphémères (toutes les 12s)
      bonusTimerRef.current++;
      if (bonusTimerRef.current >= 720) {
        bonusTimerRef.current = 0;
        spawnRandomBonus();
      }

      // Mise à jour du Bonus Actif
      if (activeBonusRef.current) {
        const bonus = activeBonusRef.current;
        bonus.life--;

        const bonusX = bonus.col * TILE_SIZE;
        const bonusY = bonus.row * TILE_SIZE;
        const distToBonus = Math.hypot(p.x - bonusX, p.y - bonusY);

        if (distToBonus < TILE_SIZE * 0.85) {
          setScore(s => s + bonus.points);
          addFloatingText(`+${bonus.points} PTS`, bonusX + 12, bonusY, bonus.color);

          if (bonus.type === "CAFE") {
            speedBoostTimerRef.current = 360;
            setMessage("BOOST DE VITESSE : PAUSE CAFÉ ☕ !");
          } else if (bonus.type === "DELIBERATION") {
            powerModeTimerRef.current = 350;
            ghostsRef.current.forEach(g => { g.isVulnerable = true; });
            setMessage("DÉLIBÉRATION EXPRESS 📜 !");
          } else {
            setMessage(`RÉCOLTE : ${bonus.label} (${bonus.symbol}) !`);
          }

          setTimeout(() => setMessage(""), 2000);
          activeBonusRef.current = null;
        } else if (bonus.life <= 0) {
          activeBonusRef.current = null;
        }
      }

      // === DEPLACEMENT DES FANTOMES GARANTI SANS AUCUN IMMOBILISME (SNAP AUTO ET AUTO-UNBLOCK) ===
      ghostsRef.current.forEach(g => {
        if (g.x < -TILE_SIZE) g.x = CANVAS_WIDTH;
        if (g.x > CANVAS_WIDTH) g.x = -TILE_SIZE;

        const currentSpeed = g.isVulnerable ? 1 : 1.5;
        g.speed = currentSpeed;

        const gridX = Math.round(g.x / TILE_SIZE) * TILE_SIZE;
        const gridY = Math.round(g.y / TILE_SIZE) * TILE_SIZE;

        // Détecte la proximité du centre de case OU si le fantôme est à l'arrêt
        const isNearCenter = (Math.abs(g.x - gridX) < currentSpeed && Math.abs(g.y - gridY) < currentSpeed) || (g.vx === 0 && g.vy === 0);

        if (isNearCenter) {
          // Snap exact pour éliminer les décalages de sous-pixels
          g.x = gridX;
          g.y = gridY;

          const col = Math.round(gridX / TILE_SIZE);
          const row = Math.round(gridY / TILE_SIZE);

          const inHouse = row >= 9 && row <= 10 && col >= 9 && col <= 11;

          if (inHouse) {
            if (col < 10) { g.vx = currentSpeed; g.vy = 0; }
            else if (col > 10) { g.vx = -currentSpeed; g.vy = 0; }
            else { g.vx = 0; g.vy = -currentSpeed; }
          } else {
            const possibleMoves: { vx: number; vy: number }[] = [];
            const dirs = [
              { vx: 0, vy: -currentSpeed },
              { vx: 0, vy: currentSpeed },
              { vx: -currentSpeed, vy: 0 },
              { vx: currentSpeed, vy: 0 }
            ];

            dirs.forEach(d => {
              const isReverse = Math.sign(d.vx) === -Math.sign(g.vx) && Math.sign(d.vy) === -Math.sign(g.vy) && (g.vx !== 0 || g.vy !== 0);
              const testX = gridX + Math.sign(d.vx) * TILE_SIZE;
              const testY = gridY + Math.sign(d.vy) * TILE_SIZE;

              if (!isReverse && !checkCollisionWithWall(testX, testY)) {
                possibleMoves.push(d);
              }
            });

            if (possibleMoves.length === 0) {
              dirs.forEach(d => {
                const testX = gridX + Math.sign(d.vx) * TILE_SIZE;
                const testY = gridY + Math.sign(d.vy) * TILE_SIZE;
                if (!checkCollisionWithWall(testX, testY)) {
                  possibleMoves.push(d);
                }
              });
            }

            if (possibleMoves.length > 0) {
              const chosen = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
              g.vx = chosen.vx;
              g.vy = chosen.vy;
            }
          }
        }

        // Déplacement effectif avec déblocage automatique immédiat
        if (!checkCollisionWithWall(g.x + Math.sign(g.vx) * currentSpeed, g.y + Math.sign(g.vy) * currentSpeed)) {
          g.x += Math.sign(g.vx) * currentSpeed;
          g.y += Math.sign(g.vy) * currentSpeed;
        } else {
          // Si bloqué, forcer le réalignement et le choix de direction immédiat à la trame suivante
          g.vx = 0;
          g.vy = 0;
        }

        // Collision Joueur - Fantôme
        const dx = (p.x + TILE_SIZE / 2) - (g.x + TILE_SIZE / 2);
        const dy = (p.y + TILE_SIZE / 2) - (g.y + TILE_SIZE / 2);
        const dist = Math.hypot(dx, dy);
        
        if (dist < TILE_SIZE * 0.8) {
          if (g.isVulnerable) {
            setScore(s => s + 200);
            addFloatingText("+200 PTS", g.x + 12, g.y, "#38bdf8");
            g.x = g.startX;
            g.y = g.startY;
            g.isVulnerable = false;
            g.vx = 0;
            g.vy = -1.5;
            setMessage("ANOMALIE RÉSOLUE !");
            setTimeout(() => setMessage(""), 1000);
          } else {
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

      // Mettre à jour les textes flottants
      floatingTextsRef.current.forEach(ft => {
        ft.y -= 1.2;
        ft.life--;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

      // Victoire
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

      // Fond Labyrinthe Cyber
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Dessiner les murs & pastilles
      const maze = mazeRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;
          const val = maze[r][c];

          if (val === 1) {
            // Murs Néon Bleu Cyber
            ctx.fillStyle = "#1e1b4b";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#38bdf8";
            ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            ctx.shadowBlur = 0;
          } else if (val === 2) {
            // Pastille Paie Standard
            ctx.fillStyle = "#fbbf24";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#fbbf24";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (val === 3) {
            // Super Délibération (Power Pellet)
            const pulse = 6 + Math.sin(frameCountRef.current * 0.15) * 2;
            ctx.fillStyle = "#a855f7";
            ctx.shadowBlur = 14;
            ctx.shadowColor = "#a855f7";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // === DESSINER LE BONUS ÉPHÉMÈRE ACTIF ===
      if (activeBonusRef.current) {
        const bonus = activeBonusRef.current;
        const bx = bonus.col * TILE_SIZE + TILE_SIZE / 2;
        const by = bonus.row * TILE_SIZE + TILE_SIZE / 2;

        ctx.save();
        const pulseSize = 13 + Math.sin(frameCountRef.current * 0.2) * 3;
        ctx.fillStyle = `${bonus.color}33`;
        ctx.strokeStyle = bonus.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = bonus.color;

        ctx.beginPath();
        ctx.arc(bx, by, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const lifeRatio = bonus.life / bonus.maxLife;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bx, by, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
        ctx.stroke();

        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillText(bonus.symbol, bx, by + 1);
        ctx.restore();
      }

      // === DESSINER LE JOUEUR (Gestionnaire RH Paie) ===
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x + TILE_SIZE / 2, p.y + TILE_SIZE / 2);

      let angle = 0;
      if (p.vx > 0) angle = 0;
      if (p.vx < 0) angle = Math.PI;
      if (p.vy > 0) angle = Math.PI / 2;
      if (p.vy < 0) angle = -Math.PI / 2;
      ctx.rotate(angle);

      // Traînée du Boost Café
      if (speedBoostTimerRef.current > 0) {
        ctx.fillStyle = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#38bdf8";
        ctx.beginPath();
        ctx.arc(-8, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pac-Man Paie Jaune Doré
      const mouthAngle = (p.vx === 0 && p.vy === 0) ? 0.05 : 0.2 + Math.abs(Math.sin(frameCountRef.current * 0.2)) * 0.25;
      ctx.fillStyle = speedBoostTimerRef.current > 0 ? "#38bdf8" : "#fbbf24";
      ctx.shadowBlur = 14;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(0, 0, TILE_SIZE / 2 - 2, mouthAngle, Math.PI * 2 - mouthAngle);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();

      // === DESSINER LES FANTÔMES D'ANOMALIES ===
      ghostsRef.current.forEach(g => {
        ctx.save();
        ctx.translate(g.x + TILE_SIZE / 2, g.y + TILE_SIZE / 2);

        const gColor = g.isVulnerable ? (powerModeTimerRef.current < 100 && frameCountRef.current % 10 < 5 ? "#ffffff" : "#3b82f6") : g.color;

        ctx.fillStyle = gColor;
        ctx.shadowBlur = 12;
        ctx.shadowColor = gColor;

        // Corps du Fantôme
        ctx.beginPath();
        ctx.arc(0, -2, TILE_SIZE / 2 - 2, Math.PI, 0, false);
        ctx.lineTo(TILE_SIZE / 2 - 2, TILE_SIZE / 2 - 2);

        const wave = Math.sin(frameCountRef.current * 0.3) * 2;
        ctx.lineTo(TILE_SIZE / 4, TILE_SIZE / 2 - 4 + wave);
        ctx.lineTo(0, TILE_SIZE / 2 - 2);
        ctx.lineTo(-TILE_SIZE / 4, TILE_SIZE / 2 - 4 - wave);
        ctx.lineTo(-TILE_SIZE / 2 + 2, TILE_SIZE / 2 - 2);
        ctx.closePath();
        ctx.fill();

        // Yeux
        if (!g.isVulnerable) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(-4, -4, 3, 0, Math.PI * 2);
          ctx.arc(4, -4, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(-4 + Math.sign(g.vx), -4 + Math.sign(g.vy), 1.5, 0, Math.PI * 2);
          ctx.arc(4 + Math.sign(g.vx), -4 + Math.sign(g.vy), 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-5, -4, 3, 3);
          ctx.fillRect(2, -4, 3, 3);
        }

        ctx.restore();
      });

      // === DESSINER LES TEXTES FLOTTANTS ===
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life / 30;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Message Toast
      if (message) {
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.roundRect(CANVAS_WIDTH / 2 - 130, CANVAS_HEIGHT / 2 - 20, 260, 40, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.restore();
      }
    };

    const loop = () => {
      updateGame();
      drawGame();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, score, message, changeDirection]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-500/10 via-amber-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 flex-wrap gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-full font-bold transition-all text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            Retour
          </button>

          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400 animate-pulse" />
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Labyrinthe Paie
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < lives ? "text-rose-500 fill-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-slate-700"
                  }`}
                />
              ))}
            </div>
            <div className="bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-mono font-bold text-slate-300">
              Score : <span className="text-amber-400 font-black">{score}</span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-3 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-2xl border border-slate-800 block shadow-inner tab-index-0 focus:outline-none"
            tabIndex={0}
          />

          {/* Overlay Start */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 bg-amber-500/20 border border-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Activity className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Sécurisez la Paie</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
                Utilisez les <strong>flèches du clavier</strong> ou les <strong>boutons à l'écran</strong> pour vous déplacer. Récoltez les pastilles et débloquez les bonus !
              </p>
              <button
                onClick={initGame}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                Lancer la Paie
              </button>
            </div>
          )}

          {/* Overlay Game Over */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-2 animate-bounce" />
              <h2 className="text-3xl font-black text-rose-500 mb-1">ANOMALIES CRITIQUES !</h2>
              <p className="text-slate-300 text-xs mb-4">Les erreurs de paie ont submergé le service.</p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 w-48 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Score Obtenu</span>
                <p className="text-4xl font-black text-amber-400">{score}</p>
              </div>

              <button
                onClick={initGame}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                Relancer la Paie
              </button>
            </div>
          )}

          {/* Overlay Victory */}
          {gameState === "victory" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <Trophy className="w-14 h-14 text-yellow-400 mb-2 animate-bounce" />
              <h2 className="text-3xl font-black text-emerald-400 mb-1">PAIE CLÔTURÉE AVEC SUCCÈS !</h2>
              <p className="text-slate-300 text-xs mb-4">Toutes les paies de la collectivité ont été sécurisées !</p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 w-48 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Score Total</span>
                <p className="text-4xl font-black text-emerald-400">{score}</p>
              </div>

              <button
                onClick={initGame}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                Recommencer
              </button>
            </div>
          )}
        </div>

        {/* Virtuels Controls / On-screen D-Pad */}
        {gameState === "playing" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={() => changeDirection("up")}
              className="w-14 h-14 bg-slate-900 hover:bg-amber-500/20 active:bg-amber-500 border-2 border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90"
              aria-label="Haut"
            >
              <ArrowUp className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDirection("left")}
                className="w-14 h-14 bg-slate-900 hover:bg-amber-500/20 active:bg-amber-500 border-2 border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90"
                aria-label="Gauche"
              >
                <ArrowLeftIcon className="w-7 h-7" />
              </button>
              <button
                onClick={() => changeDirection("down")}
                className="w-14 h-14 bg-slate-900 hover:bg-amber-500/20 active:bg-amber-500 border-2 border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90"
                aria-label="Bas"
              >
                <ArrowDown className="w-7 h-7" />
              </button>
              <button
                onClick={() => changeDirection("right")}
                className="w-14 h-14 bg-slate-900 hover:bg-amber-500/20 active:bg-amber-500 border-2 border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90"
                aria-label="Droite"
              >
                <ArrowRight className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacManPaie;
