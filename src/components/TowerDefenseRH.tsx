import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, AlertTriangle, RotateCcw, Trophy, Shield, Coins, Heart, FastForward, Sparkles, Volume2, VolumeX, Target } from 'lucide-react';

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

interface TowerTypeDef {
  id: number;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: string;
  glowColor: string;
  desc: string;
  splash?: number;
  slowDuration?: number;
}

const TOWER_TYPES: Record<number, TowerTypeDef> = {
  1: { id: 1, name: "Chargé de Recrutement", cost: 40, range: 110, damage: 16, fireRate: 28, color: "#3b82f6", glowColor: "rgba(59, 130, 246, 0.6)", desc: "Tir rapide de dossiers CV. Efficace contre les petites vagues." },
  2: { id: 2, name: "Budget Contractuel", cost: 100, range: 135, damage: 55, fireRate: 85, splash: 65, color: "#ef4444", glowColor: "rgba(239, 68, 68, 0.6)", desc: "Tir de pièces d'or lourdes. Dégâts de zone dévastateurs." },
  3: { id: 3, name: "Redéploiement", cost: 60, range: 115, damage: 6, fireRate: 50, slowDuration: 120, color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.6)", desc: "Onde de choc administrative. Ralentit fortement les cibles." }
};

const ENEMY_TYPES = {
  cumul: { name: "Cumul d'Emplois", maxHp: 85, speed: 1.25, reward: 5, color: "#f59e0b", radius: 11, label: "DOSSIER CUMUL" },
  retraite: { name: "Départ Retraite Non Anticipé", maxHp: 420, speed: 0.65, reward: 15, color: "#10b981", radius: 15, label: "DOSSIER RETRAITE" },
  saisonnier: { name: "Urgence Pic Saisonnier", maxHp: 65, speed: 2.3, reward: 4, color: "#ec4899", radius: 9, label: "URGENCE RH" }
};

const WAVES = [
  { count: 10, type: "cumul", interval: 60 },
  { count: 16, type: "cumul", interval: 48 },
  { count: 12, type: "cumul", interval: 38 },
  { count: 6, type: "retraite", interval: 95 },
  { count: 22, type: "saisonnier", interval: 28 },
  { count: 12, type: "cumul", interval: 35 },
  { count: 15, type: "saisonnier", interval: 25 },
  { count: 12, type: "retraite", interval: 80 },
  { count: 25, type: "saisonnier", interval: 22 },
  { count: 35, type: "mixed", interval: 20 },
];

interface Tower { x: number; y: number; c: number; r: number; type: number; cooldown: number; level: number; totalKills: number; }
interface Enemy { id: string; x: number; y: number; type: string; hp: number; maxHp: number; speed: number; reward: number; color: string; radius: number; waypointIndex: number; slowTimer: number; hitFlash: number; }
interface Projectile { x: number; y: number; targetId: string; speed: number; damage: number; splash?: number; slowDuration?: number; color: string; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }
interface FloatingText { id: string; x: number; y: number; text: string; color: string; life: number; vy: number; }

let isMutedGlobal = false;

const playTDSound = (type: "shoot" | "place" | "hit" | "damage" | "wave" | "gameover" | "victory") => {
  if (isMutedGlobal) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "shoot") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "place") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(360, now + 0.07);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "hit") {
      osc.type = "square";
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "damage") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(70, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "wave") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "gameover") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.8);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === "victory") {
      osc.type = "triangle";
      const notes = [262, 330, 392, 523, 659, 784];
      notes.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      });
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch {
    // Ignore audio policy errors
  }
};

const TowerDefenseRH: React.FC<TowerDefenseProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [budget, setBudget] = useState(125);
  const [health, setHealth] = useState(20);
  const [wave, setWave] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [selectedTower, setSelectedTower] = useState<number>(1);
  const [hoverTile, setHoverTile] = useState<{ c: number; r: number } | null>(null);
  const [gameSpeed, setGameSpeed] = useState<1 | 2>(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sync global mute
  useEffect(() => {
    isMutedGlobal = isMuted;
  }, [isMuted]);

  // Keyboard Shortcuts (1, 2, 3 to pick tower, Space to launch wave)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "1") setSelectedTower(1);
      if (e.key === "2") setSelectedTower(2);
      if (e.key === "3") setSelectedTower(3);
      if (e.code === "Space") {
        e.preventDefault();
        startWave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, wave]);

  // Game Engine Refs
  const towersRef = useRef<Tower[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const enemyIdCounter = useRef(0);
  const textIdCounter = useRef(0);

  // Wave Logic Refs
  const waveActiveRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const enemiesToSpawnRef = useRef<{ type: string }[]>([]);

  const initGame = useCallback(() => {
    towersRef.current = [];
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    waveActiveRef.current = false;
    enemiesToSpawnRef.current = [];

    setBudget(125);
    setHealth(20);
    setWave(0);
    setTotalKills(0);
    setGameState("playing");
  }, []);

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: `txt_${textIdCounter.current++}`,
      x: x + (Math.random() - 0.5) * 12,
      y: y - 10,
      text,
      color,
      life: 35,
      vy: -1.2
    });
  };

  const startWave = () => {
    if (waveActiveRef.current || wave >= 10 || gameState !== "playing") return;

    const wIdx = Math.min(wave, WAVES.length - 1);
    const waveData = WAVES[wIdx];

    let toSpawn: { type: string }[] = [];

    if (wave === 5) {
      toSpawn = Array(12).fill({ type: "saisonnier" }).concat(Array(4).fill({ type: "retraite" }));
    } else if (wave === 6) {
      toSpawn = Array(22).fill({ type: "cumul" }).concat(Array(6).fill({ type: "retraite" }));
    } else if (wave === 7) {
      toSpawn = Array(32).fill({ type: "saisonnier" });
    } else if (wave === 8) {
      toSpawn = Array(12).fill({ type: "retraite" }).concat(Array(12).fill({ type: "cumul" }));
    } else if (wave === 9) {
      toSpawn = Array(25).fill({ type: "retraite" }).concat(Array(25).fill({ type: "saisonnier" }));
    } else {
      toSpawn = Array(waveData.count).fill({ type: waveData.type });
    }

    enemiesToSpawnRef.current = toSpawn;
    spawnTimerRef.current = waveData.interval || 60;
    waveActiveRef.current = true;
    setWave(w => w + 1);
    playTDSound("wave");
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 0.5;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Math.random() * 25 + 15,
        maxLife: 40,
        color,
        size: Math.random() * 3.5 + 1.5
      });
    }
  };

  // Interaction handlers
  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);

    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
    return { c, r, x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;
    const coords = getGridCoords(e);
    setHoverTile(coords ? { c: coords.c, r: coords.r } : null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;
    const coords = getGridCoords(e);
    setHoverTile(coords ? { c: coords.c, r: coords.r } : null);
  };

  const handleMouseLeave = () => setHoverTile(null);

  const placeTowerAt = (c: number, r: number) => {
    if (gameState !== "playing") return;
    const onPath = PATH_TILES.some(pt => pt.c === c && pt.r === r);
    if (onPath) return;

    const existingTower = towersRef.current.find(t => t.c === c && t.r === r);
    if (existingTower) return;

    const tType = TOWER_TYPES[selectedTower as keyof typeof TOWER_TYPES];
    if (budget >= tType.cost) {
      setBudget(b => b - tType.cost);
      const px = c * TILE_SIZE + TILE_SIZE / 2;
      const py = r * TILE_SIZE + TILE_SIZE / 2;

      towersRef.current.push({
        x: px,
        y: py,
        c, r,
        type: selectedTower,
        cooldown: 0,
        level: 1,
        totalKills: 0
      });
      createParticles(px, py, tType.color, 16);
      addFloatingText(px, py, `-${tType.cost}k€`, "#f59e0b");
      playTDSound("place");
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGridCoords(e);
    if (coords) placeTowerAt(coords.c, coords.r);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (hoverTile) placeTowerAt(hoverTile.c, hoverTile.r);
  };

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const updateGame = () => {
      if (gameState !== "playing") return;

      const ticks = gameSpeed;

      for (let tick = 0; tick < ticks; tick++) {
        // Spawning
        if (waveActiveRef.current) {
          if (spawnTimerRef.current <= 0 && enemiesToSpawnRef.current.length > 0) {
            const eDef = enemiesToSpawnRef.current.shift()!;
            const baseData = ENEMY_TYPES[eDef.type as keyof typeof ENEMY_TYPES];
            const hpMultiplier = 1 + (wave * 0.16);

            enemiesRef.current.push({
              id: `enemy_${enemyIdCounter.current++}`,
              x: WAYPOINTS[0].x - TILE_SIZE,
              y: WAYPOINTS[0].y,
              type: eDef.type,
              hp: baseData.maxHp * hpMultiplier,
              maxHp: baseData.maxHp * hpMultiplier,
              speed: baseData.speed,
              reward: baseData.reward,
              color: baseData.color,
              radius: baseData.radius,
              waypointIndex: 1,
              slowTimer: 0,
              hitFlash: 0
            });
            spawnTimerRef.current = WAVES[Math.min(wave - 1, WAVES.length - 1)].interval || 60;
          } else if (enemiesToSpawnRef.current.length > 0) {
            spawnTimerRef.current--;
          } else if (enemiesRef.current.length === 0) {
            waveActiveRef.current = false;
            const waveBonus = 25 + wave * 3;
            setBudget(b => b + waveBonus);
            addFloatingText(CANVAS_WIDTH / 2, 80, `+${waveBonus}k€ BONUS VAGUE CLAIRE !`, "#34d399");

            if (wave >= 10) {
              setGameState("victory");
              playTDSound("victory");
            }
          }
        }

        // Update Enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i];
          if (e.hitFlash > 0) e.hitFlash--;

          let currentSpeed = e.speed;
          if (e.slowTimer > 0) {
            e.slowTimer--;
            currentSpeed *= 0.42;
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
              // Reached exit!
              enemiesRef.current.splice(i, 1);
              createParticles(e.x, e.y, "#ef4444", 20);
              addFloatingText(e.x, e.y, "-1 SP", "#f87171");
              setHealth(h => {
                const nextH = h - 1;
                if (nextH <= 0) {
                  setGameState("gameover");
                  playTDSound("gameover");
                } else {
                  playTDSound("damage");
                }
                return nextH;
              });
              continue;
            }
          } else {
            e.x += (dx / dist) * currentSpeed;
            e.y += (dy / dist) * currentSpeed;
          }
        }

        // Update Towers & Firing
        towersRef.current.forEach(t => {
          if (t.cooldown > 0) t.cooldown--;

          if (t.cooldown <= 0) {
            const tType = TOWER_TYPES[t.type as keyof typeof TOWER_TYPES];

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
              t.cooldown = tType.fireRate;
              projectilesRef.current.push({
                x: t.x,
                y: t.y,
                targetId: target.id,
                speed: 9,
                damage: tType.damage,
                splash: tType.splash,
                slowDuration: tType.slowDuration,
                color: tType.color
              });
              playTDSound("shoot");
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
            projectilesRef.current.splice(i, 1);
            playTDSound("hit");

            if (p.splash) {
              createParticles(target.x, target.y, p.color, 18);
              enemiesRef.current.forEach(e => {
                const ddx = e.x - target.x;
                const ddy = e.y - target.y;
                if (Math.sqrt(ddx * ddx + ddy * ddy) <= p.splash!) {
                  e.hp -= p.damage;
                  e.hitFlash = 6;
                  addFloatingText(e.x, e.y, `-${p.damage}`, "#f87171");
                }
              });
            } else {
              createParticles(target.x, target.y, p.color, 6);
              target.hp -= p.damage;
              target.hitFlash = 6;
              addFloatingText(target.x, target.y, `-${p.damage}`, p.color);
              if (p.slowDuration) {
                target.slowTimer = p.slowDuration;
              }
            }
          } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;

            // Particle Motion Trail Behind Projectiles
            if (Math.random() < 0.75) {
              particlesRef.current.push({
                x: p.x + (Math.random() - 0.5) * 4,
                y: p.y + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                life: 14,
                maxLife: 14,
                color: p.color,
                size: Math.random() * 2.5 + 1
              });
            }
          }
        }

        // Check dead enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i];
          if (e.hp <= 0) {
            setBudget(b => b + e.reward);
            setTotalKills(k => k + 1);
            addFloatingText(e.x, e.y, `+${e.reward}k€`, "#f59e0b");
            createParticles(e.x, e.y, "#fbbf24", 15);
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

        // Update floating text
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y += ft.vy;
          ft.life--;
          if (ft.life <= 0) floatingTextsRef.current.splice(i, 1);
        }
      }
    };

    const drawGame = () => {
      const time = Date.now();

      // --- 1. Vibrant Cartoon Grass Terrain ---
      ctx.fillStyle = "#84cc16"; // Bright lime green base
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Cartoonish Grass Texture Pattern
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const isPath = PATH_TILES.some(pt => pt.c === c && pt.r === r);
          if (!isPath) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#65a30d" : "#84cc16";
            ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            // Small bright grass blades / flowers
            if ((r * 7 + c * 13) % 5 === 0) {
              ctx.fillStyle = "#a3e635";
              ctx.fillRect(c * TILE_SIZE + 8, r * TILE_SIZE + 12, 4, 6);
              ctx.fillRect(c * TILE_SIZE + 14, r * TILE_SIZE + 10, 4, 8);
              // tiny white flower
              ctx.fillStyle = "#ffffff";
              ctx.beginPath(); ctx.arc(c * TILE_SIZE + 24, r * TILE_SIZE + 24, 2, 0, Math.PI * 2); ctx.fill();
            }
          }
        }
      }

      // --- 2. Bright Stone Paved Road Path (Bloons Style) ---

      // 1. Dirt / Sand Foundation Border
      ctx.strokeStyle = "#84cc16"; // Blend with grass
      ctx.lineWidth = TILE_SIZE + 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
      for (let i = 1; i < WAYPOINTS.length; i++) {
        ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
      }
      ctx.stroke();

      // 2. Light Stone Path Border
      ctx.strokeStyle = "#94a3b8"; // Darker slate for stone border
      ctx.lineWidth = TILE_SIZE + 4;
      ctx.stroke();

      // 3. Light Stone Path Bed
      ctx.strokeStyle = "#cbd5e1"; // Light slate for path
      ctx.lineWidth = TILE_SIZE;
      ctx.stroke();

      // 4. Cobblestone segments (cross lines)
      ctx.save();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.setLineDash([TILE_SIZE, TILE_SIZE]);
      ctx.beginPath();
      ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
      for (let i = 1; i < WAYPOINTS.length; i++) {
        ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // Grid Overlay (Subtle tactical lines)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * TILE_SIZE); ctx.lineTo(CANVAS_WIDTH, j * TILE_SIZE); ctx.stroke();
      }


      // --- 3. Realistic Natural Lake & Shoreline ---
      ctx.save();
      // Dirt/Sand Shoreline Border
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.moveTo(575, 405);
      ctx.bezierCurveTo(705, 375, 775, 425, 790, 485);
      ctx.bezierCurveTo(800, 555, 740, 595, 630, 575);
      ctx.bezierCurveTo(545, 545, 555, 425, 575, 405);
      ctx.fill();

      // Deep Blue Natural Water Body
      const lakeGrad = ctx.createRadialGradient(680, 480, 10, 680, 480, 95);
      lakeGrad.addColorStop(0, "#38bdf8");
      lakeGrad.addColorStop(0.5, "#0284c7");
      lakeGrad.addColorStop(1, "#0369a1");
      ctx.fillStyle = lakeGrad;
      ctx.beginPath();
      ctx.moveTo(580, 410);
      ctx.bezierCurveTo(700, 380, 770, 430, 785, 490);
      ctx.bezierCurveTo(795, 550, 735, 590, 635, 570);
      ctx.bezierCurveTo(550, 540, 560, 430, 580, 410);
      ctx.fill();

      // Water Ripples & Shore Reflection
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const rippleOffset = (time / 700) % 20;
      ctx.beginPath(); ctx.arc(670, 470, 10 + rippleOffset, 0, Math.PI * 1.2); ctx.stroke();

      // Natural Lily Pads
      ctx.fillStyle = "#15803d";
      ctx.beginPath(); ctx.arc(630, 460, 6, 0, Math.PI * 1.8); ctx.fill();
      ctx.beginPath(); ctx.arc(710, 520, 5, 0, Math.PI * 1.8); ctx.fill();
      ctx.beginPath(); ctx.arc(660, 530, 7, 0, Math.PI * 1.8); ctx.fill();
      ctx.restore();


      // --- 4. Realistic French Municipal Buildings (Drawn OVER the Road) ---
      const drawFrenchFlag = (bx: number, by: number, w = 12, h = 8) => {
        ctx.save();
        ctx.translate(bx, by);
        const colW = w / 3;
        ctx.fillStyle = "#002395"; ctx.fillRect(-w / 2, -h / 2, colW, h);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(-w / 2 + colW, -h / 2, colW, h);
        ctx.fillStyle = "#ed2939"; ctx.fillRect(-w / 2 + colW * 2, -h / 2, colW, h);
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      };

      // Mairie de Gennevilliers (Hôtel de Ville classique)
      const drawRealisticMairie = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);

        // Soft Drop Shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(0, 24, 40, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Stone Facade
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(-34, -22, 68, 44);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.strokeRect(-34, -22, 68, 44);

        // Side Wings / Columns
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(-38, -22, 6, 44);
        ctx.fillRect(32, -22, 6, 44);

        // Pediment Roof
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(-38, -22);
        ctx.lineTo(0, -44);
        ctx.lineTo(38, -22);
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Clock Tower Belfry
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(-11, -58, 22, 16);
        ctx.strokeStyle = "#475569";
        ctx.strokeRect(-11, -58, 22, 16);

        // Clock Face
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(0, -50, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, -53); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(2, -50); ctx.stroke();

        // Flag Pole at top
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(0, -70); ctx.stroke();
        drawFrenchFlag(7, -66, 12, 8);

        // Arched Windows
        for (let row = 0; row < 2; row++) {
          for (let col = -2; col <= 2; col++) {
            if (row === 1 && col === 0) continue;
            const wx = col * 13;
            const wy = -14 + row * 16;
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(wx - 4, wy, 8, 10);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.strokeRect(wx - 4, wy, 8, 10);
          }
        }

        // Entrance Steps & Double Door
        ctx.fillStyle = "#64748b";
        ctx.fillRect(-14, 14, 28, 8);
        ctx.fillRect(-16, 18, 32, 4);

        ctx.fillStyle = "#451a03";
        ctx.fillRect(-6, 2, 12, 14);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, 2, 12, 14);

        // Label Banner
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(-40, 26, 80, 16);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1;
        ctx.strokeRect(-40, 26, 80, 16);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 8.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("MAIRIE DE GENNEVILLIERS", 0, 37);

        ctx.restore();
      };

      // Annexe RH & Pôle Social Buildings
      const drawRealisticAdminBuilding = (x: number, y: number, label: string, accentColor: string) => {
        ctx.save();
        ctx.translate(x, y);

        // Drop Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.ellipse(0, 18, 32, 10, 0, 0, Math.PI * 2); ctx.fill();

        // Brick/Stone Facade Body
        ctx.fillStyle = "#334155";
        ctx.fillRect(-26, -20, 52, 36);
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.strokeRect(-26, -20, 52, 36);

        // Roof Trim Accent
        ctx.fillStyle = accentColor;
        ctx.fillRect(-28, -24, 56, 5);
        ctx.fillRect(-28, -20, 4, 36);

        // Windows Grid
        ctx.fillStyle = "#7dd3fc";
        for (let r = 0; r < 2; r++) {
          for (let c = -1; c <= 1; c++) {
            ctx.fillRect(c * 15 - 4, -14 + r * 14, 8, 9);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 0.8;
            ctx.strokeRect(c * 15 - 4, -14 + r * 14, 8, 9);
          }
        }

        // Awning & Door
        ctx.fillStyle = accentColor;
        ctx.fillRect(-9, -2, 18, 3);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-7, 1, 14, 15);

        // Flag
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, -24); ctx.lineTo(20, -34); ctx.stroke();
        drawFrenchFlag(25, -31, 10, 6);

        // Label Badge
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(-30, 20, 60, 15);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(-30, 20, 60, 15);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, 0, 30.5);

        ctx.restore();
      };

      // Position buildings in open green spaces clear of the road!
      drawRealisticAdminBuilding(280, 45, "ANNEXE RH", "#0284c7");       // Top open park (above Row 2 road)
      drawRealisticAdminBuilding(75, 420, "PÔLE SOCIAL", "#8b5cf6");      // Lower left park (clear of left road)
      drawRealisticMairie(380, 190);                                     // Center Plaza (inside upper loop)

      // Realistic Park Trees
      const drawRealisticTree = (x: number, y: number, scale = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Realistic Drop Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(2, 12, 14, 6, 0, 0, Math.PI * 2); ctx.fill();

        // Bark Trunk
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-3, 0, 6, 14);
        ctx.fillStyle = "#451a03";
        ctx.fillRect(-1, 0, 2, 14);

        // Multi-toned Natural Leaf Clusters
        ctx.fillStyle = "#14532d"; ctx.beginPath(); ctx.arc(0, -6, 15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(-6, 2, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, 2, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(-2, -8, 8, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
      };

      const treePositions = [
        [35, 45], [75, 30], [25, 85], [65, 95],
        [710, 75], [750, 55], [765, 95], [725, 125],
        [45, 490], [85, 535], [35, 565], [105, 475],
        [480, 210], [520, 230], [495, 260]
      ];
      treePositions.forEach(pos => drawRealisticTree(pos[0], pos[1], 1.15));


      // --- 4. Sci-Fi Entrance Vortex Portal & Exit Shield Citadel ---

      // Entrance Portal (Waypoint 0)
      const spawnWp = WAYPOINTS[0];
      ctx.save();
      ctx.translate(spawnWp.x + 15, spawnWp.y);
      const portalAngle = time / 250;
      ctx.rotate(portalAngle);
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(192, 132, 252, 0.35)";
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 3;
      ctx.strokeRect(-14, -14, 28, 28);
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "#f0abfc";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 8;
      ctx.fillText("ENTRÉE RH", spawnWp.x + 18, spawnWp.y - 24);
      ctx.restore();

      // Exit Citadel Base (Last Waypoint)
      const exitWp = WAYPOINTS[WAYPOINTS.length - 1];
      ctx.save();
      ctx.translate(exitWp.x - 15, exitWp.y);
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#064e3b";
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Pulsing Defense Shield Dome Radius
      const shieldPulse = Math.sin(time / 400) * 4 + 24;
      ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, shieldPulse, 0, Math.PI * 2); ctx.stroke();

      // Shield Crest Icon
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(9, -5);
      ctx.lineTo(9, 4);
      ctx.lineTo(0, 11);
      ctx.lineTo(-9, 4);
      ctx.lineTo(-9, -5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ecfdf5";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("CITADELLE SP", 0, -28);
      ctx.restore();


      // --- 5. Hover & Placement Preview ---
      if (hoverTile && !PATH_TILES.some(pt => pt.c === hoverTile.c && pt.r === hoverTile.r)) {
        const hx = hoverTile.c * TILE_SIZE;
        const hy = hoverTile.r * TILE_SIZE;
        const cx = hx + TILE_SIZE / 2;
        const cy = hy + TILE_SIZE / 2;

        const tType = TOWER_TYPES[selectedTower as keyof typeof TOWER_TYPES];
        const canAfford = budget >= tType.cost;

        // Hover Cell Outline
        ctx.fillStyle = canAfford ? "rgba(52, 211, 153, 0.25)" : "rgba(239, 68, 68, 0.25)";
        ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = canAfford ? "#34d399" : "#f87171";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(hx, hy, TILE_SIZE, TILE_SIZE);

        // Range Circle Preview
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, tType.range, 0, Math.PI * 2);
        ctx.fillStyle = canAfford ? "rgba(52, 211, 153, 0.14)" : "rgba(239, 68, 68, 0.14)";
        ctx.fill();
        ctx.strokeStyle = canAfford ? "rgba(52, 211, 153, 0.7)" : "rgba(239, 68, 68, 0.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // Existing Tower Hover Range
      if (hoverTile) {
        const existingTower = towersRef.current.find(t => t.c === hoverTile.c && t.r === hoverTile.r);
        if (existingTower) {
          const tType = TOWER_TYPES[existingTower.type as keyof typeof TOWER_TYPES];
          ctx.save();
          ctx.beginPath();
          ctx.arc(existingTower.x, existingTower.y, tType.range, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }


      // --- 6. Draw 3D Cartoon Towers (Bureaux RH) ---
      towersRef.current.forEach(t => {
        const tType = TOWER_TYPES[t.type as keyof typeof TOWER_TYPES];

        ctx.save();
        ctx.translate(t.x, t.y);

        // --- 3D Base (Shadow & Pedestal) ---
        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(0, 10, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pedestal Cylinder (Base)
        const pedestalColor = "#334155";
        const pedestalTopColor = "#475569";
        const pedestalHeight = 8;
        
        // Cylinder body
        ctx.fillStyle = pedestalColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI); // Bottom curve
        ctx.lineTo(18, -pedestalHeight);
        ctx.ellipse(0, -pedestalHeight, 18, 12, 0, 0, Math.PI, true); // Top curve
        ctx.lineTo(-18, 0);
        ctx.fill();
        
        // Cylinder top
        ctx.fillStyle = pedestalTopColor;
        ctx.beginPath();
        ctx.ellipse(0, -pedestalHeight, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = tType.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Power Ring
        const ringAngle = time / 600;
        ctx.save();
        ctx.translate(0, -pedestalHeight);
        ctx.scale(1, 0.6); // isometric squash for ring
        ctx.rotate(ringAngle);
        ctx.strokeStyle = tType.glowColor;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 1.5); ctx.stroke();
        ctx.restore();

        // Find Target Angle
        let angle = -Math.PI / 2;
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
          // Angle includes a slight perspective tweak, but simple 2D angle works for top-down turret
          angle = Math.atan2(target.y - t.y, target.x - t.x);
        }

        // Move up to draw turret body
        ctx.translate(0, -pedestalHeight - 4);

        if (t.type === 1) {
          // TYPE 1: Chargé de Recrutement (Dual Plasma Turret in 3D)
          ctx.rotate(angle);

          // Turret Body (Rounded Box with 3D depth)
          ctx.fillStyle = "#1d4ed8"; // dark blue side
          ctx.fillRect(-10, -6, 20, 18);
          
          ctx.fillStyle = "#3b82f6"; // light blue top
          ctx.beginPath();
          ctx.roundRect(-12, -12, 24, 20, 6);
          ctx.fill();
          
          // Dual Barrels (Cylinders)
          ctx.fillStyle = "#1e40af"; // dark blue
          ctx.fillRect(8, -8, 16, 4);
          ctx.fillRect(8, 4, 16, 4);
          ctx.fillStyle = "#60a5fa"; // light blue highlight
          ctx.fillRect(8, -9, 16, 2);
          ctx.fillRect(8, 3, 16, 2);
          
          // Muzzle glow
          ctx.fillStyle = "#93c5fd";
          ctx.beginPath(); ctx.ellipse(24, -7, 2, 4, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(24, 5, 2, 4, 0, 0, Math.PI*2); ctx.fill();

          // Radar Dome
          ctx.fillStyle = "#93c5fd";
          ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(-2, -2, 2, 0, Math.PI * 2); ctx.fill(); // specular highlight

        } else if (t.type === 2) {
          // TYPE 2: Budget Contractuel (Heavy Red Cannon in 3D)
          ctx.rotate(angle);

          // Massive Cannon Base
          ctx.fillStyle = "#7f1d1d"; // dark red side
          ctx.beginPath(); ctx.roundRect(-14, -8, 28, 24, 4); ctx.fill();
          
          ctx.fillStyle = "#ef4444"; // bright red top
          ctx.beginPath(); ctx.roundRect(-16, -14, 32, 24, 4); ctx.fill();

          // Heavy Barrel
          ctx.fillStyle = "#450a0a";
          ctx.fillRect(8, -6, 18, 12);
          ctx.fillStyle = "#b91c1c";
          ctx.fillRect(8, -7, 18, 5); // highlight

          // Gold Blast Tip
          ctx.fillStyle = "#b45309";
          ctx.fillRect(26, -8, 8, 16);
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(26, -9, 8, 6); // gold highlight

          // Power Core Pulse
          ctx.fillStyle = "#fef08a";
          ctx.beginPath(); ctx.arc(0, -2, 5, 0, Math.PI * 2); ctx.fill();

        } else if (t.type === 3) {
          // TYPE 3: Redéploiement (Quantum EMP Spire in 3D)
          const pulse = Math.abs(Math.sin(time / 200)) * 12 + 16;

          // Expanding EMP Ring (squashed for isometric perspective)
          ctx.save();
          ctx.scale(1, 0.6);
          ctx.strokeStyle = "rgba(216, 180, 254, 0.6)";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, pulse, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();

          // Floating Crystal Spire
          const floatY = Math.sin(time / 300) * 4;
          ctx.translate(0, floatY - 8);
          
          const spin = time / 400;
          ctx.rotate(spin);
          
          // 3D Crystal (Two overlapping polygons)
          ctx.shadowColor = "#d8b4fe";
          ctx.shadowBlur = 15;
          
          // Back/Darker facet
          ctx.fillStyle = "#7e22ce";
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(10, 0);
          ctx.lineTo(0, 18);
          ctx.lineTo(-10, 0);
          ctx.fill();

          // Front/Lighter facet
          ctx.fillStyle = "#c084fc";
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(6, 4);
          ctx.lineTo(0, 18);
          ctx.lineTo(-6, 4);
          ctx.fill();
          
          // Core bright highlight
          ctx.fillStyle = "#f3e8ff";
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(2, 2);
          ctx.lineTo(0, 10);
          ctx.lineTo(-2, 2);
          ctx.fill();
        }

        ctx.restore();
      });


      // --- 7. Draw Enemies (Dossiers RH Animés) ---
      enemiesRef.current.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        const isFrozen = e.slowTimer > 0;
        const wobble = Math.sin(time / 120 + e.x) * 2.5;

        // Shadow under enemy
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath(); ctx.ellipse(0, e.radius * 0.9, e.radius * 1.1, e.radius * 0.45, 0, 0, Math.PI * 2); ctx.fill();

        ctx.shadowBlur = e.hitFlash > 0 ? 25 : 12;
        ctx.shadowColor = e.hitFlash > 0 ? "#ffffff" : (isFrozen ? "#60a5fa" : e.color);

        if (e.type === "cumul") {
          // ENEMY 1: CUMUL D'EMPLOIS (Glowing Gold Briefcase/Folder with Warning Emblem)
          const baseColor = e.hitFlash > 0 ? "#ffffff" : (isFrozen ? "#93c5fd" : e.color);
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.roundRect(-e.radius, -e.radius + wobble, e.radius * 2, e.radius * 1.6, 4);
          ctx.fill();
          ctx.fillRect(-e.radius * 0.6, -e.radius - 4 + wobble, e.radius * 1.2, 5);

          // Warning Symbol Inner Mark
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("!", 0, wobble);

        } else if (e.type === "retraite") {
          // ENEMY 2: DÉPART RETRAITE (Heavy Steel Armored Tank Vault)
          const baseColor = e.hitFlash > 0 ? "#ffffff" : (isFrozen ? "#60a5fa" : e.color);
          ctx.fillStyle = baseColor;
          ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);

          // Reinforced Armor Plates & Wheel Treads
          ctx.fillStyle = "#064e3b";
          ctx.fillRect(-e.radius - 2, -e.radius, 3, e.radius * 2);
          ctx.fillRect(e.radius - 1, -e.radius, 3, e.radius * 2);

          // Safe Dial Wheel
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.arc(0, 0, e.radius * 0.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#34d399";
          ctx.fillRect(-1, -e.radius * 0.4, 2, e.radius * 0.8);

        } else if (e.type === "saisonnier") {
          // ENEMY 3: URGENCE PIC SAISONNIER (Hyper-Speed Jet Interceptor)
          const targetWp = WAYPOINTS[e.waypointIndex];
          if (targetWp) {
            const angle = Math.atan2(targetWp.y - e.y, targetWp.x - e.x);
            ctx.rotate(angle);
          }

          // Jet Engine Thruster Flame
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.moveTo(-e.radius - 2, -3);
          ctx.lineTo(-e.radius - 10, 0);
          ctx.lineTo(-e.radius - 2, 3);
          ctx.fill();

          // Delta Wing Body
          const baseColor = e.hitFlash > 0 ? "#ffffff" : (isFrozen ? "#bfdbfe" : e.color);
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.moveTo(e.radius + 4, 0);
          ctx.lineTo(-e.radius, e.radius + 2);
          ctx.lineTo(-e.radius / 2, 0);
          ctx.lineTo(-e.radius, -e.radius - 2);
          ctx.closePath();
          ctx.fill();
        }

        // Frozen Ice Aura Shield Effect
        if (isFrozen) {
          ctx.strokeStyle = "rgba(96, 165, 250, 0.8)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // High-Contrast Segmented Health Bar
        ctx.save();
        const hpPercent = Math.max(0, e.hp / e.maxHp);
        const barW = e.radius * 2.4;
        const barH = 5;
        const barX = e.x - barW / 2;
        const barY = e.y - e.radius - 12;

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

        ctx.fillStyle = hpPercent > 0.5 ? "#10b981" : (hpPercent > 0.25 ? "#f59e0b" : "#ef4444");
        ctx.fillRect(barX, barY, barW * hpPercent, barH);
        ctx.restore();
      });


      // --- 8. Draw Projectiles ---
      projectilesRef.current.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        if (p.color === "#3b82f6") {
          // White Flying CV Document
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-6, -4, 12, 8);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 1;
          ctx.strokeRect(-6, -4, 12, 8);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-4, -1.5, 8, 1);
          ctx.fillRect(-4, 1, 6, 1);
        } else if (p.color === "#ef4444") {
          // Spinning Gold Coin
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#d97706";
          ctx.font = "bold 8px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("€", 0, 0);
        } else {
          // Purple Orb
          ctx.fillStyle = "#c084fc";
          ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(-1.5, -1.5, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });


      // --- 9. Draw Particles ---
      particlesRef.current.forEach(pt => {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });


      // --- 10. Draw Floating Text ---
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.font = "black 11px monospace";
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.max(0, ft.life / 35);
        ctx.fillText(ft.text, ft.x, ft.y);
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
  }, [gameState, selectedTower, hoverTile, wave, budget, gameSpeed]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-8 pb-10 overflow-x-hidden bg-slate-950 transition-colors duration-500 px-3 sm:px-6 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950">

      {/* Cyberpunk Radial Backdrop */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 rounded-full"
        style={{
          width: 1100, height: 1100,
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center w-full">

        {/* --- Top Header Navigation Bar --- */}
        <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-5 z-20 bg-slate-900/90 backdrop-blur-2xl px-5 py-3 rounded-3xl border border-emerald-500/20 shadow-[0_0_35px_rgba(16,185,129,0.15)]">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>

            <h1 className="hidden md:flex items-center gap-2 font-mono font-black text-sm tracking-wider uppercase text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
              Tower Defense RH <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-sans font-normal">v2.0 Sci-Fi Edition</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Speed Toggle */}
            <button
              onClick={() => setGameSpeed(s => (s === 1 ? 2 : 1))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${gameSpeed === 2 ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              title="Vitesse de jeu"
            >
              <FastForward className="w-3.5 h-3.5" />
              {gameSpeed}X
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all hover:scale-105"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Budget Stat */}
            <div className="bg-slate-950/90 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-amber-400 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Budget:</span>
              <span className="text-amber-300 font-mono text-sm">{budget}k€</span>
            </div>

            {/* Health Stat */}
            <div className="bg-slate-950/90 border border-rose-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-rose-400 font-black text-xs shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <span>SP:</span>
              <span className="text-rose-300 font-mono text-sm">{health}</span>
            </div>

            {/* Wave Stat */}
            <div className="bg-slate-950/90 border border-sky-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-sky-400 font-black text-xs shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Vague:</span>
              <span className="text-sky-300 font-mono text-sm">{wave}/10</span>
            </div>
          </div>
        </div>

        {/* --- Main Dashboard Container --- */}
        <div className="flex flex-col lg:flex-row w-full gap-5 items-start">

          {/* Column 1 (On mobile: Tower shop at top. On desktop: Tower shop + Legend) */}
          <div className="w-full lg:w-80 flex flex-col gap-4 order-1 lg:order-1">
            
            {/* Tower Selection Card */}
            <div className="bg-slate-900/90 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-[0_0_35px_rgba(0,0,0,0.5)]">
              <h3 className="text-xs font-black text-slate-300 mb-3 uppercase tracking-wider font-mono flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-400">
                  <Target className="w-4 h-4" /> Bureaux de Défense
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Sélectionnez</span>
              </h3>

              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map(type => {
                  const tData = TOWER_TYPES[type as keyof typeof TOWER_TYPES];
                  const canAfford = budget >= tData.cost;
                  const isSelected = selectedTower === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTower(type)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'border-emerald-400 bg-gradient-to-r from-emerald-950/60 to-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.02]'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/90'
                      } ${!canAfford ? 'opacity-50 grayscale' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-white text-xs flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">[{type}]</span>
                          <div
                            className="w-3 h-3 rounded-full shadow-lg shrink-0"
                            style={{ backgroundColor: tData.color, boxShadow: `0 0 10px ${tData.color}` }}
                          />
                          {tData.name}
                        </span>
                        <span className="text-amber-400 text-xs font-black font-mono bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          {tData.cost}k€
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug font-medium mb-1.5">{tData.desc}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                        <span>Portée: <b className="text-slate-200">{tData.range}</b></span>
                        <span>Dégâts: <b className="text-slate-200">{tData.damage}</b></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Guide / Legend Card (Visible on desktop sidebar) */}
            <div className="hidden lg:block bg-slate-900/90 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 text-xs text-slate-300 font-medium">
              <h4 className="font-extrabold text-white mb-2 uppercase tracking-wide font-mono text-[11px] flex items-center gap-1.5 text-sky-400">
                <Sparkles className="w-3.5 h-3.5" /> Légende & Ennemis
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Cumul d'Emplois</span>
                  <span className="font-mono text-slate-500">Moyen</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Départ Retraite</span>
                  <span className="font-mono text-slate-500">Lourd</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500 inline-block" /> Pic Saisonnier</span>
                  <span className="font-mono text-slate-500">Rapide</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Column 2: Game Canvas Frame + Wave Button + Legend (on mobile) */}
          <div className="flex-1 w-full relative order-2 lg:order-2 flex flex-col gap-4">
            
            {/* Game Canvas Box */}
            <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-2.5 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800 relative overflow-hidden">
              
              {/* Ready Screen Overlay */}
              {gameState === "ready" && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] transform -rotate-3 hover:rotate-0 transition-transform">
                    <Shield className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                    TOWER DEFENSE RH
                  </h2>
                  <p className="text-slate-300 max-w-md mx-auto mb-8 font-medium text-sm leading-relaxed">
                    Protégez la citadelle du Service Public ! Placez stratégiquement vos bureaux RH le long de la route pour neutraliser les flux de dossiers complexes.
                  </p>
                  <button
                    onClick={initGame}
                    className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-full text-base transition-all shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center gap-3"
                  >
                    <Play className="w-6 h-6 fill-current" /> Démarrer la Défense
                  </button>
                </div>
              )}

              {/* Game Over / Victory Modal */}
              {(gameState === "gameover" || gameState === "victory") && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-6 text-center animate-scale-up">
                  {gameState === "victory" ? (
                    <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                      <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                      <AlertTriangle className="w-10 h-10 text-rose-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    </div>
                  )}

                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono">
                    {gameState === "victory" ? "SERVICE PUBLIC SAUVÉ !" : "RUPTURE DU SERVICE..."}
                  </h2>
                  <p className="text-slate-300 mb-6 text-sm max-w-sm">
                    {gameState === "victory"
                      ? "Félicitations ! Vous avez repoussé les 10 vagues de dossiers administratifs avec succès."
                      : `Vous avez tenu jusqu'à la vague ${wave}/10 avec ${totalKills} dossiers traités.`}
                  </p>

                  <div className="flex items-center gap-4 mb-8 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <div className="text-center px-4 border-r border-slate-800">
                      <div className="text-xs text-slate-400">Dossiers gérés</div>
                      <div className="text-lg font-black font-mono text-emerald-400">{totalKills}</div>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-xs text-slate-400">Budget final</div>
                      <div className="text-lg font-black font-mono text-amber-400">{budget}k€</div>
                    </div>
                  </div>

                  <button
                    onClick={initGame}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all text-sm flex items-center gap-2 uppercase tracking-wider"
                  >
                    <RotateCcw className="w-5 h-5" /> Rejouer une partie
                  </button>
                </div>
              )}

              {/* Game Canvas */}
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`w-full h-auto max-h-[600px] bg-slate-950 rounded-2xl cursor-crosshair border border-slate-800 touch-none shadow-2xl ${
                  gameState !== "playing" ? 'opacity-20' : ''
                }`}
                style={{ imageRendering: 'pixelated' }}
              />

            </div>

            {/* Start Next Wave Button: Entre l'écran de jeu et la fenêtre des légendes */}
            {!waveActiveRef.current && wave < 10 && gameState === "playing" && (
              <button
                onClick={startWave}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 transition-all uppercase tracking-wider text-sm hover:scale-[1.01] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-current" /> Lancer Vague {wave + 1} / 10 <span className="opacity-70 text-xs font-mono">[Espace]</span>
              </button>
            )}

            {/* Tactical Guide / Legend Card on Mobile: Placé sous le jeu et le bouton lancer la vague */}
            <div className="block lg:hidden bg-slate-900/90 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 text-xs text-slate-300 font-medium">
              <h4 className="font-extrabold text-white mb-2 uppercase tracking-wide font-mono text-[11px] flex items-center gap-1.5 text-sky-400">
                <Sparkles className="w-3.5 h-3.5" /> Légende & Ennemis
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Cumul d'Emplois</span>
                  <span className="font-mono text-slate-500">Moyen</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Départ Retraite</span>
                  <span className="font-mono text-slate-500">Lourd</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500 inline-block" /> Pic Saisonnier</span>
                  <span className="font-mono text-slate-500">Rapide</span>
                </li>
              </ul>
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
