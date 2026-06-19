import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, AlertTriangle, RotateCcw, Trophy, Shield, Crosshair, Zap, Coins, Heart } from 'lucide-react';

interface TowerDefenseProps {
  onClose: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;
const COLS = CANVAS_WIDTH / TILE_SIZE;
const ROWS = CANVAS_HEIGHT / TILE_SIZE;

// --- GAME DATA ---
const PATH_TILES = [
  { c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 2 }, { c: 5, r: 2 }, { c: 6, r: 2 }, { c: 7, r: 2 }, { c: 8, r: 2 }, { c: 9, r: 2 }, { c: 10, r: 2 }, { c: 11, r: 2 }, { c: 12, r: 2 }, { c: 13, r: 2 }, { c: 14, r: 2 }, { c: 15, r: 2 },
  { c: 15, r: 3 }, { c: 15, r: 4 }, { c: 15, r: 5 }, { c: 15, r: 6 }, { c: 15, r: 7 },
  { c: 14, r: 7 }, { c: 13, r: 7 }, { c: 12, r: 7 }, { c: 11, r: 7 }, { c: 10, r: 7 }, { c: 9, r: 7 }, { c: 8, r: 7 }, { c: 7, r: 7 }, { c: 6, r: 7 }, { c: 5, r: 7 }, { c: 4, r: 7 },
  { c: 4, r: 8 }, { c: 4, r: 9 }, { c: 4, r: 10 }, { c: 4, r: 11 }, { c: 4, r: 12 },
  { c: 5, r: 12 }, { c: 6, r: 12 }, { c: 7, r: 12 }, { c: 8, r: 12 }, { c: 9, r: 12 }, { c: 10, r: 12 }, { c: 11, r: 12 }, { c: 12, r: 12 }, { c: 13, r: 12 }, { c: 14, r: 12 }, { c: 15, r: 12 }, { c: 16, r: 12 }, { c: 17, r: 12 }, { c: 18, r: 12 }, { c: 19, r: 12 }
];

const WAYPOINTS = [
  { x: 0 * TILE_SIZE, y: 2.5 * TILE_SIZE },
  { x: 15.5 * TILE_SIZE, y: 2.5 * TILE_SIZE },
  { x: 15.5 * TILE_SIZE, y: 7.5 * TILE_SIZE },
  { x: 4.5 * TILE_SIZE, y: 7.5 * TILE_SIZE },
  { x: 4.5 * TILE_SIZE, y: 12.5 * TILE_SIZE },
  { x: 20 * TILE_SIZE, y: 12.5 * TILE_SIZE }
];

const TOWER_TYPES = {
  1: { name: "Chargé de Recrutement", cost: 50, range: 100, damage: 15, fireRate: 30, color: "#3b82f6", desc: "Tir rapide, dégâts moyens." },
  2: { name: "Budget Contractuel", cost: 120, range: 120, damage: 50, fireRate: 90, splash: 60, color: "#ef4444", desc: "Tir très lent, gros dégâts de zone." },
  3: { name: "Redéploiement", cost: 80, range: 100, damage: 5, fireRate: 60, slowDuration: 120, color: "#8b5cf6", desc: "Ralentit fortement les cibles." }
};

const ENEMY_TYPES = {
  cumul: { name: "Cumul", maxHp: 81, speed: 1.2, reward: 5, color: "#f59e0b", radius: 10 },
  retraite: { name: "Retraite", maxHp: 405, speed: 0.6, reward: 15, color: "#10b981", radius: 14 },
  saisonnier: { name: "Pic Saisonnier", maxHp: 63, speed: 2.2, reward: 4, color: "#ec4899", radius: 8 }
};

const WAVES = [
  { count: 10, type: "cumul", interval: 60 },
  { count: 15, type: "cumul", interval: 50 },
  { count: 10, type: "cumul", interval: 40 },
  { count: 5, type: "retraite", interval: 100 },
  { count: 20, type: "saisonnier", interval: 30 },
  { count: 10, type: "cumul", interval: 40 }, // wave 6 starts mixing manually in spawner
];

interface Tower { x: number; y: number; c: number; r: number; type: number; cooldown: number; level: number; }
interface Enemy { id: string; x: number; y: number; type: string; hp: number; maxHp: number; speed: number; reward: number; color: string; radius: number; waypointIndex: number; slowTimer: number; }
interface Projectile { x: number; y: number; targetId: string; speed: number; damage: number; splash?: number; slowDuration?: number; color: string; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }

const TowerDefenseRH: React.FC<TowerDefenseProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [budget, setBudget] = useState(150);
  const [health, setHealth] = useState(20);
  const [wave, setWave] = useState(0);
  const [selectedTower, setSelectedTower] = useState<number>(1);
  const [hoverTile, setHoverTile] = useState<{c: number, r: number} | null>(null);

  // Game Engine Refs
  const towersRef = useRef<Tower[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const enemyIdCounter = useRef(0);
  
  // Wave Logic Refs
  const waveActiveRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const enemiesToSpawnRef = useRef<{type: string}[]>([]);

  const initGame = useCallback(() => {
    towersRef.current = [];
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    waveActiveRef.current = false;
    enemiesToSpawnRef.current = [];
    
    setBudget(150);
    setHealth(20);
    setWave(0);
    setGameState("playing");
  }, []);

  const startWave = () => {
    if (waveActiveRef.current || wave >= 10 || gameState !== "playing") return;
    
    const wIdx = Math.min(wave, WAVES.length - 1);
    const waveData = WAVES[wIdx];
    
    let toSpawn: {type: string}[] = [];
    
    // Custom logic for later waves
    if (wave === 5) {
      toSpawn = Array(10).fill({type: "saisonnier"}).concat(Array(3).fill({type: "retraite"}));
    } else if (wave === 6) {
      toSpawn = Array(20).fill({type: "cumul"}).concat(Array(5).fill({type: "retraite"}));
    } else if (wave === 7) {
      toSpawn = Array(30).fill({type: "saisonnier"});
    } else if (wave === 8) {
      toSpawn = Array(10).fill({type: "retraite"}).concat(Array(10).fill({type: "cumul"}));
    } else if (wave === 9) {
      toSpawn = Array(20).fill({type: "retraite"}).concat(Array(20).fill({type: "saisonnier"}));
    } else {
      toSpawn = Array(waveData.count).fill({type: waveData.type});
    }

    enemiesToSpawnRef.current = toSpawn;
    spawnTimerRef.current = waveData.interval || 60;
    waveActiveRef.current = true;
    setWave(w => w + 1);
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: Math.random() * 20 + 10,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  // Interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);
    setHoverTile({c, r});
  };

  const handleMouseLeave = () => setHoverTile(null);

  const handleClick = () => {
    if (gameState !== "playing" || !hoverTile) return;
    
    const {c, r} = hoverTile;
    
    // Check if on path
    const onPath = PATH_TILES.some(pt => pt.c === c && pt.r === r);
    if (onPath) return;

    // Check if tower exists
    const existingTower = towersRef.current.find(t => t.c === c && t.r === r);
    if (existingTower) return; // Upgrade logic could go here

    const tType = TOWER_TYPES[selectedTower as keyof typeof TOWER_TYPES];
    if (budget >= tType.cost) {
      setBudget(b => b - tType.cost);
      towersRef.current.push({
        x: c * TILE_SIZE + TILE_SIZE / 2,
        y: r * TILE_SIZE + TILE_SIZE / 2,
        c, r,
        type: selectedTower,
        cooldown: 0,
        level: 1
      });
      createParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, "#ffffff", 10);
    }
  };

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const updateGame = () => {
      if (gameState !== "playing") return;

      // Spawning
      if (waveActiveRef.current) {
        if (spawnTimerRef.current <= 0 && enemiesToSpawnRef.current.length > 0) {
          const eDef = enemiesToSpawnRef.current.shift()!;
          const baseData = ENEMY_TYPES[eDef.type as keyof typeof ENEMY_TYPES];
          
          // Slight hp scaling per wave
          const hpMultiplier = 1 + (wave * 0.15);

          enemiesRef.current.push({
            id: `enemy_${enemyIdCounter.current++}`,
            x: WAYPOINTS[0].x - TILE_SIZE, // Start offscreen
            y: WAYPOINTS[0].y,
            type: eDef.type,
            hp: baseData.maxHp * hpMultiplier,
            maxHp: baseData.maxHp * hpMultiplier,
            speed: baseData.speed,
            reward: baseData.reward,
            color: baseData.color,
            radius: baseData.radius,
            waypointIndex: 1,
            slowTimer: 0
          });
          spawnTimerRef.current = WAVES[Math.min(wave - 1, WAVES.length - 1)].interval || 60;
        } else if (enemiesToSpawnRef.current.length > 0) {
          spawnTimerRef.current--;
        } else if (enemiesRef.current.length === 0) {
          // Wave complete
          waveActiveRef.current = false;
          setBudget(b => b + 25); // Wave clear bonus
          if (wave >= 10) {
            setGameState("victory");
          }
        }
      }

      // Update Enemies
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        
        // Effects
        let currentSpeed = e.speed;
        if (e.slowTimer > 0) {
          e.slowTimer--;
          currentSpeed *= 0.4;
        }

        const targetWp = WAYPOINTS[e.waypointIndex];
        const dx = targetWp.x - e.x;
        const dy = targetWp.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < currentSpeed) {
          e.x = targetWp.x;
          e.y = targetWp.y;
          e.waypointIndex++;
          if (e.waypointIndex >= WAYPOINTS.length) {
            // Reached end!
            enemiesRef.current.splice(i, 1);
            setHealth(h => {
              const nextH = h - 1;
              if (nextH <= 0) setGameState("gameover");
              return nextH;
            });
            continue;
          }
        } else {
          e.x += (dx / dist) * currentSpeed;
          e.y += (dy / dist) * currentSpeed;
        }
      }

      // Update Towers
      towersRef.current.forEach(t => {
        if (t.cooldown > 0) t.cooldown--;
        
        if (t.cooldown <= 0) {
          const tType = TOWER_TYPES[t.type as keyof typeof TOWER_TYPES];
          
          // Find target (first in range)
          let target: Enemy | null = null;
          let minDist = tType.range;
          
          // Prioritize enemies further along the path
          let maxProgress = -1;

          for (const e of enemiesRef.current) {
            const dx = e.x - t.x;
            const dy = e.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= tType.range) {
              const progress = e.waypointIndex * 1000 - dist; // Heuristic
              if (progress > maxProgress) {
                maxProgress = progress;
                target = e;
              }
            }
          }

          if (target) {
            t.cooldown = tType.fireRate;
            projectilesRef.current.push({
              x: t.x,
              y: t.y,
              targetId: target.id,
              speed: 8,
              damage: tType.damage,
              splash: tType.splash,
              slowDuration: tType.slowDuration,
              color: tType.color
            });
          }
        }
      });

      // Update Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        const target = enemiesRef.current.find(e => e.id === p.targetId);
        
        if (!target) {
          projectilesRef.current.splice(i, 1);
          continue;
        }

        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.speed) {
          // Hit!
          projectilesRef.current.splice(i, 1);
          
          if (p.splash) {
            createParticles(target.x, target.y, p.color, 15);
            enemiesRef.current.forEach(e => {
              const ddx = e.x - target.x;
              const ddy = e.y - target.y;
              if (Math.sqrt(ddx * ddx + ddy * ddy) <= p.splash!) {
                e.hp -= p.damage;
              }
            });
          } else {
            createParticles(target.x, target.y, p.color, 5);
            target.hp -= p.damage;
            if (p.slowDuration) {
              target.slowTimer = p.slowDuration;
            }
          }
        } else {
          p.x += (dx / dist) * p.speed;
          p.y += (dy / dist) * p.speed;
        }
      }

      // Check dead enemies
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        if (e.hp <= 0) {
          setBudget(b => b + e.reward);
          createParticles(e.x, e.y, "#ffffff", 12);
          enemiesRef.current.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) particlesRef.current.splice(i, 1);
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Environment Scenery
      
      // 1. Little Lake (Bottom Right)
      ctx.save();
      ctx.fillStyle = "#0369a1"; // Deep blue
      ctx.beginPath();
      ctx.moveTo(600, 400);
      ctx.bezierCurveTo(700, 380, 750, 450, 780, 480);
      ctx.bezierCurveTo(800, 500, 750, 580, 650, 550);
      ctx.bezierCurveTo(550, 520, 580, 420, 600, 400);
      ctx.fill();
      
      // Water ripples
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(680, 480, 20, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(700, 450, 15, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(650, 510, 25, 0, Math.PI); ctx.stroke();
      ctx.restore();

      // 2. Houses (Mairie / Annexes)
      const drawHouse = (x: number, y: number, color: string) => {
        ctx.save();
        ctx.translate(x, y);
        // Base
        ctx.fillStyle = color;
        ctx.fillRect(-20, -15, 40, 30);
        // Roof
        ctx.fillStyle = "#b91c1c"; // Red roof
        ctx.beginPath();
        ctx.moveTo(-25, -15);
        ctx.lineTo(0, -35);
        ctx.lineTo(25, -15);
        ctx.fill();
        // Door
        ctx.fillStyle = "#475569";
        ctx.fillRect(-6, 0, 12, 15);
        // Windows
        ctx.fillStyle = "#fbbf24"; // Lit windows
        ctx.fillRect(-15, -5, 6, 6);
        ctx.fillRect(9, -5, 6, 6);
        ctx.restore();
      };
      
      drawHouse(120, 80, "#e2e8f0");
      drawHouse(300, 450, "#cbd5e1");
      drawHouse(520, 150, "#f1f5f9");

      // 3. Trees
      const drawTree = (x: number, y: number, scale: number = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        // Trunk
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 0, 8, 15);
        // Leaves
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.arc(0, -5, 12, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-8, 5, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, 5, 10, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      };

      // Forest clumps
      const treePositions = [
        [40, 40], [70, 30], [20, 80], [60, 90], // Top Left
        [700, 80], [740, 60], [760, 100], [720, 120], // Top Right
        [40, 500], [80, 530], [30, 560], [100, 480], // Bottom Left
        [380, 200], [420, 220], [390, 250], // Middle Island
      ];
      treePositions.forEach(pos => drawTree(pos[0], pos[1], 1 + Math.random() * 0.4));


      // Draw Grid & Path
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * TILE_SIZE); ctx.lineTo(CANVAS_WIDTH, j * TILE_SIZE); ctx.stroke();
      }

      // Draw Path
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      PATH_TILES.forEach(pt => {
        ctx.fillRect(pt.c * TILE_SIZE, pt.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      });

      // Draw connection lines for path
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 15;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
      for (let i = 1; i < WAYPOINTS.length; i++) {
        ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
      }
      ctx.stroke();
      
      // Start/End markers
      ctx.fillStyle = "#34d399";
      ctx.beginPath(); ctx.arc(WAYPOINTS[0].x, WAYPOINTS[0].y, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#f87171";
      ctx.beginPath(); ctx.arc(WAYPOINTS[WAYPOINTS.length-1].x, WAYPOINTS[WAYPOINTS.length-1].y, 12, 0, Math.PI*2); ctx.fill();

      // Draw hover indicator
      if (hoverTile && !PATH_TILES.some(pt => pt.c === hoverTile.c && pt.r === hoverTile.r)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(hoverTile.c * TILE_SIZE, hoverTile.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Show range preview
        const tType = TOWER_TYPES[selectedTower as keyof typeof TOWER_TYPES];
        ctx.beginPath();
        ctx.arc(hoverTile.c * TILE_SIZE + TILE_SIZE/2, hoverTile.r * TILE_SIZE + TILE_SIZE/2, tType.range, 0, Math.PI*2);
        ctx.fillStyle = budget >= tType.cost ? "rgba(59, 130, 246, 0.15)" : "rgba(239, 68, 68, 0.15)";
        ctx.fill();
        ctx.strokeStyle = budget >= tType.cost ? "rgba(59, 130, 246, 0.5)" : "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Towers
      towersRef.current.forEach(t => {
        const tType = TOWER_TYPES[t.type as keyof typeof TOWER_TYPES];
        
        ctx.save();
        ctx.translate(t.x, t.y);
        
        // Find target to rotate towards
        let angle = -Math.PI / 2; // Default facing up
        let target: Enemy | null = null;
        let maxProgress = -1;
        for (const e of enemiesRef.current) {
          const dx = e.x - t.x;
          const dy = e.y - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= tType.range) {
            const progress = e.waypointIndex * 1000 - dist;
            if (progress > maxProgress) {
              maxProgress = progress;
              target = e;
            }
          }
        }
        if (target) {
          angle = Math.atan2(target.y - t.y, target.x - t.x);
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = tType.color;

        if (t.type === 1) {
          // Type 1: Chargé de Recrutement (Radar/Turret)
          // Base
          ctx.fillStyle = "#334155";
          ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#475569";
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
          
          // Turret Head
          ctx.rotate(angle);
          ctx.fillStyle = tType.color;
          ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, 10); ctx.lineTo(-8, -10); ctx.fill();
          
          // Glow core
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(-2, 0, 4, 0, Math.PI*2); ctx.fill();

        } else if (t.type === 2) {
          // Type 2: Budget (Heavy Cannon / Coin Stack)
          // Base
          ctx.fillStyle = "#1e293b";
          ctx.beginPath(); ctx.rect(-14, -14, 28, 28); ctx.fill();
          
          // Turret Head
          ctx.rotate(angle);
          ctx.fillStyle = tType.color;
          // Barrel
          ctx.fillRect(0, -6, 20, 12);
          // Body
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
          
          // Details
          ctx.fillStyle = "#fbbf24"; // Gold ring
          ctx.fillRect(16, -7, 4, 14);
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();

        } else if (t.type === 3) {
          // Type 3: Redéploiement (Magic Crystal / Antenna)
          // Base
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.moveTo(0, -16); ctx.lineTo(14, 8); ctx.lineTo(-14, 8);
          ctx.fill();
          
          // Rotating Aura
          const spin = Date.now() / 500;
          ctx.rotate(spin);
          
          // Crystals
          ctx.fillStyle = tType.color;
          for(let i=0; i<3; i++) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.moveTo(0, -18); ctx.lineTo(4, -8); ctx.lineTo(-4, -8);
            ctx.fill();
          }
          
          // Core
          ctx.fillStyle = "#e0e7ff";
          ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.restore();
      });

      // Draw Enemies
      enemiesRef.current.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        
        const isFrozen = e.slowTimer > 0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = isFrozen ? "#60a5fa" : e.color;
        
        // Wobble effect
        const wobble = Math.sin(Date.now() / 150 + e.x) * 2;
        
        if (e.type === "cumul") {
          // Normal Folder
          ctx.fillStyle = isFrozen ? "#93c5fd" : e.color;
          ctx.beginPath();
          ctx.roundRect(-e.radius, -e.radius + wobble, e.radius * 2, e.radius * 1.5, 2);
          ctx.fill();
          // Folder Tab
          ctx.fillRect(-e.radius, -e.radius - 3 + wobble, e.radius, 4);
          // Paper inside
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-e.radius + 2, -e.radius - 2 + wobble, e.radius * 2 - 4, 2);
          
        } else if (e.type === "retraite") {
          // Heavy Box / Safe
          ctx.fillStyle = isFrozen ? "#60a5fa" : e.color;
          // Main body
          ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
          // Straps / details
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-e.radius + 4, -e.radius, 4, e.radius * 2);
          ctx.fillRect(-e.radius, -e.radius + 4, e.radius * 2, 4);
          
          // Heavy bobbing
          ctx.translate(0, Math.sin(Date.now() / 300 + e.x) * 1.5);
          
        } else if (e.type === "saisonnier") {
          // Fast Envelope / Paper Airplane
          // Determine direction
          const targetWp = WAYPOINTS[e.waypointIndex];
          if (targetWp) {
             const angle = Math.atan2(targetWp.y - e.y, targetWp.x - e.x);
             ctx.rotate(angle);
          }
          
          ctx.fillStyle = isFrozen ? "#bfdbfe" : e.color;
          ctx.beginPath();
          ctx.moveTo(e.radius + 2, 0); // Tip
          ctx.lineTo(-e.radius, e.radius); // Bottom wing
          ctx.lineTo(-e.radius / 2, 0); // Inner center
          ctx.lineTo(-e.radius, -e.radius); // Top wing
          ctx.closePath();
          ctx.fill();
          
          // Speed trail
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillRect(-e.radius - 6, -1, 4, 2);
        }
        
        // HP Bar
        ctx.rotate(-ctx.getTransform().e); // reset rotation for HP bar (hacky but works if we just restore)
        ctx.restore(); 
        
        ctx.save();
        const hpPercent = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius * 2, 3);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius * 2 * hpPercent, 3);
        ctx.restore();
      });

      // Draw Projectiles
      projectilesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.splash ? 6 : 4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Particles
      particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / 30;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    const loop = () => {
      updateGame();
      drawGame();
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [gameState, selectedTower, hoverTile, wave, budget]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500  px-4 font-sans text-slate-800 dark:text-slate-100">
      
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 1000, height: 1000, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-6">
          <button onClick={onClose} className="flex items-center gap-2 px-4  bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-md">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          
          <div className="flex gap-4">
            <div className="bg-slate-800/80 backdrop-blur-md px-6  rounded-2xl border border-slate-700 flex items-center gap-2 text-yellow-400 font-bold shadow-lg">
              <Coins className="w-5 h-5" /> Budget : {budget}k€
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md px-6  rounded-2xl border border-slate-700 flex items-center gap-2 text-red-400 font-bold shadow-lg">
              <Heart className="w-5 h-5 fill-red-400" /> Continuité SP : {health}
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md px-6  rounded-2xl border border-slate-700 flex items-center gap-2 text-blue-400 font-bold shadow-lg">
              <Shield className="w-5 h-5" /> Vague : {wave}/10
            </div>
          </div>
        </div>

        <div className="flex w-full gap-6 items-start">
          
          {/* Toolbar */}
          <div className="w-64 flex flex-col gap-4">
            <div className="bg-slate-800/60 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Défenses RH</h3>
              
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(type => {
                  const tData = TOWER_TYPES[type as keyof typeof TOWER_TYPES];
                  const canAfford = budget >= tData.cost;
                  const isSelected = selectedTower === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTower(type)}
                      className={`p-3 rounded-2xl border text-left transition-all ${isSelected ? 'border-white bg-white/10 scale-105' : 'border-slate-600 bg-slate-800 hover:bg-slate-700'} ${!canAfford && 'opacity-50 grayscale'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white text-sm flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: tData.color, boxShadow: `0 0 10px ${tData.color}`}} />
                          {tData.name}
                        </span>
                        <span className="text-yellow-400 text-xs font-bold">{tData.cost}k€</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-tight">{tData.desc}</p>
                    </button>
                  );
                })}
              </div>

              {!waveActiveRef.current && wave < 10 && gameState === "playing" && (
                <button 
                  onClick={startWave}
                  className="w-full mt-6  bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 flex justify-center items-center gap-2 transition-all animate-pulse"
                >
                  <Play className="w-5 h-5 fill-white" /> Lancer Vague {wave + 1}
                </button>
              )}
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 shadow-xl text-xs text-slate-300">
              <h4 className="font-bold text-white mb-2">Instructions</h4>
              <p className="mb-2">1. Sélectionnez une défense RH.</p>
              <p className="mb-2">2. Cliquez sur la grille (hors du chemin) pour la construire.</p>
              <p>3. Lancez la vague pour traiter les dossiers (ennemis).</p>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 relative">
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-slate-700/50 inline-block overflow-hidden relative">
              
              {gameState === "ready" && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <Shield className="w-20 h-20 text-emerald-500 mb-6" />
                  <h2 className="text-3xl font-bold text-white mb-4">Tower Defense : Effectifs</h2>
                  <p className="text-slate-300 max-w-md text-center mb-8">
                    Les dossiers s'accumulent ! Placez stratégiquement vos chargés de recrutement et vos budgets pour traiter les demandes avant qu'elles ne saturent le service public.
                  </p>
                  <button onClick={initGame} className="px-8  bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-lg flex items-center gap-2">
                    <Play className="w-6 h-6 fill-white" /> Démarrer
                  </button>
                </div>
              )}

              {(gameState === "gameover" || gameState === "victory") && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-scale-up">
                  {gameState === "victory" ? (
                    <Trophy className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  ) : (
                    <AlertTriangle className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  )}
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {gameState === "victory" ? "Service Public Sauvé !" : "Rupture du Service..."}
                  </h2>
                  <p className="text-slate-300 mb-8 text-lg">Vous avez survécu à {wave} vagues.</p>
                  <button onClick={initGame} className="px-8  bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-lg flex items-center gap-2">
                    <RotateCcw className="w-6 h-6" /> Rejouer
                  </button>
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                className={`bg-[#0b1121] rounded-2xl cursor-crosshair border border-slate-800 ${gameState !== "playing" ? 'opacity-30' : ''}`}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default TowerDefenseRH;
