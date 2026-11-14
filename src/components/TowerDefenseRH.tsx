import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Play, 
  AlertTriangle, 
  RotateCcw, 
  Trophy, 
  Shield, 
  Coins, 
  Heart, 
  FastForward, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Target,
  Maximize2,
  Minimize2,
  Gamepad2,
  Building2,
  Zap
} from 'lucide-react';

interface TowerDefenseProps {
  onClose: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;
const COLS = CANVAS_WIDTH / TILE_SIZE;
const ROWS = CANVAS_HEIGHT / TILE_SIZE;

// --- RETRO CANVAS GAME DATA ---
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

interface TowerUpgradeDef {
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  splash?: number;
  slowDuration?: number;
  desc: string;
}

const TOWER_UPGRADES: Record<number, Record<number, TowerUpgradeDef>> = {
  1: {
    1: { name: "Chargé de Recrutement", cost: 40, damage: 16, range: 110, fireRate: 28, desc: "Tir de dossiers CV rapides. Efficace contre les petites vagues." },
    2: { name: "Responsable Concours & Postes", cost: 50, damage: 34, range: 145, fireRate: 20, desc: "Double flux de candidatures qualifiées et tir accéléré." },
    3: { name: "Directeur des Ressources Humaines", cost: 85, damage: 64, range: 180, fireRate: 14, desc: "Direction RH d'élite : mitraille de dossiers statutaires prioritaires !" }
  },
  2: {
    1: { name: "Budget Contractuel", cost: 100, damage: 55, range: 135, fireRate: 85, splash: 65, desc: "Tir de pièces d'or lourdes. Dégâts de zone dévastateurs." },
    2: { name: "Ligne Budgétaire Renforcée", cost: 110, damage: 130, range: 165, fireRate: 70, splash: 100, desc: "Double allocation financière avec zone d'impact élargie." },
    3: { name: "Trésorerie Générale Municipale", cost: 160, damage: 250, range: 200, fireRate: 55, splash: 135, desc: "Frappe budgétaire colossale : onde de choc municipale massive !" }
  },
  3: {
    1: { name: "Redéploiement", cost: 60, damage: 6, range: 115, fireRate: 50, slowDuration: 120, desc: "Onde administrative ralentissant fortement les dossiers." },
    2: { name: "Mobilité Interne & Formation", cost: 75, damage: 20, range: 145, fireRate: 38, slowDuration: 180, desc: "Gel prolongé des dossiers et réaffectation ciblée." },
    3: { name: "Guichet Unique Dématérialisé", cost: 125, damage: 50, range: 180, fireRate: 26, slowDuration: 240, splash: 65, desc: "Modernisation totale : ralentit et traite tous les dossiers en zone !" }
  }
};

const MUNICIPAL_BUILDINGS = [
  { id: "mairie", name: "Mairie de Gennevilliers", c: 7, r: 3, wTiles: 5, hTiles: 3 },
  { id: "mediatheque", name: "Médiathèque François-Rabelais", c: 6, r: 8, wTiles: 3, hTiles: 3 },
  { id: "centre_admin", name: "Centre Administratif Waldeck-Rochet", c: 12, r: 8, wTiles: 3, hTiles: 3 }
];

const isBuildingTile = (c: number, r: number) => {
  return MUNICIPAL_BUILDINGS.some(b => 
    c >= b.c && c < b.c + b.wTiles && r >= b.r && r < b.r + b.hTiles
  );
};

const ENEMY_TYPES = {
  cumul: { name: "Cumul d'Emplois", maxHp: 76, speed: 1.12, reward: 5, color: "#f59e0b", radius: 11, label: "DOSSIER CUMUL" },
  retraite: { name: "Départ Retraite Non Anticipé", maxHp: 378, speed: 0.58, reward: 15, color: "#10b981", radius: 15, label: "DOSSIER RETRAITE" },
  saisonnier: { name: "Urgence Pic Saisonnier", maxHp: 58, speed: 2.05, reward: 4, color: "#ec4899", radius: 9, label: "URGENCE RH" }
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

const playTDSound = (type: "shoot" | "place" | "hit" | "damage" | "wave" | "gameover" | "victory" | "upgrade") => {
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
    } else if (type === "upgrade") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.09);
      osc.frequency.setValueAtTime(660, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // --- RETRO CANVAS ENGINE STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [budget, setBudget] = useState(140);
  const [health, setHealth] = useState(22);
  const [wave, setWave] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [selectedTower, setSelectedTower] = useState<number>(1);
  const [hoverTile, setHoverTile] = useState<{ c: number; r: number } | null>(null);
  const [gameSpeed, setGameSpeed] = useState<1 | 2 | 4>(1);
  const [selectedPlacedTower, setSelectedPlacedTower] = useState<{ c: number; r: number } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    isMutedGlobal = isMuted;
  }, [isMuted]);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard Shortcuts for Canvas Mode
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

  // Game Engine Refs (Canvas)
  const towersRef = useRef<Tower[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const enemyIdCounter = useRef(0);
  const textIdCounter = useRef(0);
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

    setBudget(140);
    setHealth(22);
    setWave(0);
    setTotalKills(0);
    setSelectedPlacedTower(null);
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

  // Canvas Grid Interaction handlers
  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return null;
      clientX = touch.clientX;
      clientY = touch.clientY;
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
    if (isBuildingTile(c, r)) return;

    const existingTower = towersRef.current.find(t => t.c === c && t.r === r);
    if (existingTower) return;

    const tType = TOWER_TYPES[selectedTower as keyof typeof TOWER_TYPES];
    if (budget >= tType.cost) {
      setBudget(b => b - tType.cost);
      const px = c * TILE_SIZE + TILE_SIZE / 2;
      const py = r * TILE_SIZE + TILE_SIZE / 2;

      const newTower: Tower = {
        x: px,
        y: py,
        c, r,
        type: selectedTower,
        cooldown: 0,
        level: 1,
        totalKills: 0
      };
      towersRef.current.push(newTower);
      setSelectedPlacedTower({ c, r });
      createParticles(px, py, tType.color, 16);
      addFloatingText(px, py, `-${tType.cost}k€`, "#f59e0b");
      playTDSound("place");
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGridCoords(e);
    if (!coords) return;

    const clickedTower = towersRef.current.find(t => t.c === coords.c && t.r === coords.r);
    if (clickedTower) {
      setSelectedPlacedTower({ c: clickedTower.c, r: clickedTower.r });
      playTDSound("hit");
      return;
    }

    if (selectedPlacedTower) {
      setSelectedPlacedTower(null);
    }
    placeTowerAt(coords.c, coords.r);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getGridCoords(e);
    if (!coords) return;

    const clickedTower = towersRef.current.find(t => t.c === coords.c && t.r === coords.r);
    if (clickedTower) {
      setSelectedPlacedTower({ c: clickedTower.c, r: clickedTower.r });
      playTDSound("hit");
      return;
    }

    if (selectedPlacedTower) {
      setSelectedPlacedTower(null);
    }
    placeTowerAt(coords.c, coords.r);
  };

  const handleUpgradeSelectedTower = () => {
    if (!selectedPlacedTower) return;
    const tower = towersRef.current.find(t => t.c === selectedPlacedTower.c && t.r === selectedPlacedTower.r);
    if (!tower || tower.level >= 3) return;

    const nextLevel = tower.level + 1;
    const upDef = TOWER_UPGRADES[tower.type]?.[nextLevel];
    if (!upDef) return;

    if (budget >= upDef.cost) {
      setBudget(b => b - upDef.cost);
      tower.level = nextLevel;
      createParticles(tower.x, tower.y, "#f59e0b", 26);
      addFloatingText(tower.x, tower.y, `+NIV. ${nextLevel} : ${upDef.name} !`, "#fbbf24");
      playTDSound("upgrade");
    } else {
      addFloatingText(tower.x, tower.y, "Budget insuffisant !", "#ef4444");
      playTDSound("hit");
    }
  };

  const handleSellSelectedTower = () => {
    if (!selectedPlacedTower) return;
    const towerIdx = towersRef.current.findIndex(t => t.c === selectedPlacedTower.c && t.r === selectedPlacedTower.r);
    if (towerIdx === -1) return;

    const tower = towersRef.current[towerIdx];
    let totalInvested = TOWER_UPGRADES[tower.type]?.[1]?.cost || 40;
    if (tower.level >= 2) totalInvested += TOWER_UPGRADES[tower.type]?.[2]?.cost || 50;
    if (tower.level >= 3) totalInvested += TOWER_UPGRADES[tower.type]?.[3]?.cost || 85;

    const refund = Math.floor(totalInvested * 0.65);
    setBudget(b => b + refund);
    createParticles(tower.x, tower.y, "#34d399", 18);
    addFloatingText(tower.x, tower.y, `+${refund}k€ (Vendu)`, "#34d399");
    playTDSound("place");

    towersRef.current.splice(towerIdx, 1);
    setSelectedPlacedTower(null);
  };

  // Canvas Main Game Loop
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
            // Progressive Health Curve (recalibrated -10% difficulty)
            const hpMultiplier = 1.0 + (wave - 1) * 0.25 + Math.pow(Math.max(0, wave - 1), 1.6) * 0.10;
            const enemyHp = Math.round(baseData.maxHp * hpMultiplier);
            const scaledReward = Math.round(baseData.reward * (1 + (wave - 1) * 0.18));

            enemiesRef.current.push({
              id: `enemy_${enemyIdCounter.current++}`,
              x: WAYPOINTS[0].x - TILE_SIZE,
              y: WAYPOINTS[0].y,
              type: eDef.type,
              hp: enemyHp,
              maxHp: enemyHp,
              speed: baseData.speed,
              reward: scaledReward,
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
            const waveBonus = 28 + wave * 4;
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
              // Reached exit
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
            const upDef = TOWER_UPGRADES[t.type]?.[t.level] || TOWER_TYPES[t.type as keyof typeof TOWER_TYPES];

            let target: Enemy | null = null;
            let maxProgress = -1;

            for (const e of enemiesRef.current) {
              const dx = e.x - t.x;
              const dy = e.y - t.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= upDef.range) {
                const progress = e.waypointIndex * 1000 - dist;
                if (progress > maxProgress) {
                  maxProgress = progress;
                  target = e;
                }
              }
            }

            if (target) {
              t.cooldown = upDef.fireRate;
              projectilesRef.current.push({
                x: t.x,
                y: t.y,
                targetId: target.id,
                speed: 9 + (t.level - 1) * 2,
                damage: upDef.damage,
                splash: upDef.splash,
                slowDuration: upDef.slowDuration,
                color: t.type === 1 ? (t.level === 3 ? "#fde047" : "#3b82f6") : (t.type === 2 ? (t.level === 3 ? "#ea580c" : "#ef4444") : (t.level === 3 ? "#67e8f9" : "#a855f7"))
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
      // 1. Lush Green Cartoon Meadow
      ctx.fillStyle = "#60a628";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grassy organic variations
      ctx.fillStyle = "#5ba025";
      ctx.beginPath();
      ctx.arc(180, 200, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(620, 380, 160, 0, Math.PI * 2);
      ctx.fill();

      // Decorative cartoon trees along edges
      const drawTree = (tx: number, ty: number, r: number) => {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(tx, ty + r * 0.7, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trunk
        ctx.fillStyle = "#4a2e16";
        ctx.fillRect(tx - r * 0.18, ty, r * 0.36, r * 0.7);
        // Foliage
        ctx.fillStyle = "#2f6e1b";
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#469622";
        ctx.beginPath();
        ctx.arc(tx, ty - 2, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6cb830";
        ctx.beginPath();
        ctx.arc(tx - r * 0.25, ty - r * 0.25, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      };

      // Top forest line
      for (let x = 30; x < CANVAS_WIDTH; x += 75) drawTree(x, 30, 26);
      // Bottom forest line
      for (let x = 30; x < CANVAS_WIDTH; x += 70) drawTree(x, CANVAS_HEIGHT - 25, 28);
      // Middle grove
      drawTree(360, 240, 26);
      drawTree(390, 260, 22);

      // 2. Sandy Winding Dirt Road Tiles
      PATH_TILES.forEach(pt => {
        // Dark outline
        ctx.fillStyle = "#9e7d3b";
        ctx.fillRect(pt.c * TILE_SIZE - 2, pt.r * TILE_SIZE - 2, TILE_SIZE + 4, TILE_SIZE + 4);
        // Sandy fill
        ctx.fillStyle = "#d4ba7c";
        ctx.fillRect(pt.c * TILE_SIZE, pt.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        // Inner sand highlight
        ctx.fillStyle = "#e5cf96";
        ctx.fillRect(pt.c * TILE_SIZE + 6, pt.r * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      });

      // --- MUNICIPAL BUILDINGS OF GENNEVILLIERS ---
      // 1. Mairie de Gennevilliers (Hôtel de Ville)
      const mx = 7 * TILE_SIZE;
      const my = 3 * TILE_SIZE + 8;
      const mw = 5 * TILE_SIZE;
      const mh = 3 * TILE_SIZE - 12;

      // Paved esplanade / Parvis
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(mx - 8, my + mh - 8, mw + 16, 16);
      ctx.fillStyle = "#cbd5e1";
      for (let px = mx - 4; px < mx + mw + 8; px += 18) {
        ctx.fillRect(px, my + mh - 6, 14, 12);
      }

      // Building Shadow
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(mx + 6, my + 6, mw, mh);

      // Main facade
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mw, mh);

      // Clock Attic
      const atw = 70;
      const ath = 26;
      const atx = mx + (mw - atw) / 2;
      const aty = my - ath;
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(atx, aty, atw, ath);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(atx, aty, atw, ath);

      // Pediment / Fronton Banner
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(mx + 6, my + 3, mw - 12, 16);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MAIRIE DE GENNEVILLIERS", mx + mw / 2, my + 11);

      // Clock on attic
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(atx + atw / 2, aty + 13, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Hands
      ctx.beginPath();
      ctx.moveTo(atx + atw / 2, aty + 13);
      ctx.lineTo(atx + atw / 2 + 3, aty + 9);
      ctx.moveTo(atx + atw / 2, aty + 13);
      ctx.lineTo(atx + atw / 2 - 3, aty + 11);
      ctx.stroke();

      // French Tricolor Flag waving on roof
      const mastX = atx + atw / 2;
      const mastY = aty - 18;
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mastX, aty);
      ctx.lineTo(mastX, mastY);
      ctx.stroke();

      const flagWave = Math.sin(Date.now() * 0.006) * 2;
      const fw = 7;
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(mastX, mastY + flagWave * 0.5, fw, 11);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(mastX + fw, mastY + flagWave * 0.7, fw, 11);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(mastX + fw * 2, mastY + flagWave, fw, 11);

      // Large Glass Windows
      ctx.fillStyle = "#38bdf8";
      for (let wr = 0; wr < 2; wr++) {
        for (let wc = 0; wc < 6; wc++) {
          const wx = mx + 12 + wc * 29;
          const wy = my + 24 + wr * 26;
          ctx.fillRect(wx, wy, 20, 18);
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.fillRect(wx + 2, wy + 2, 7, 14);
          ctx.fillStyle = "#38bdf8";
        }
      }

      // Entrance double glass doors
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(mx + mw / 2 - 16, my + mh - 24, 32, 24);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(mx + mw / 2 - 14, my + mh - 22, 12, 22);
      ctx.fillRect(mx + mw / 2 + 2, my + mh - 22, 12, 22);

      // Planters
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(mx + mw / 2 - 24, my + mh - 6, 6, 0, Math.PI * 2);
      ctx.arc(mx + mw / 2 + 24, my + mh - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Médiathèque François-Rabelais
      const medX = 6 * TILE_SIZE;
      const medY = 8 * TILE_SIZE + 10;
      const medW = 3 * TILE_SIZE;
      const medH = 3 * TILE_SIZE - 20;

      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(medX + 4, medY + 4, medW, medH);
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(medX, medY, medW, medH);
      ctx.strokeStyle = "#9a3412";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(medX, medY, medW, medH);

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(medX + 4, medY + 3, medW - 8, 14);
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 7px system-ui, sans-serif";
      ctx.fillText("MÉDIATHÈQUE RABELAIS", medX + medW / 2, medY + 10);

      // Glass and book shelves
      ctx.fillStyle = "#bae6fd";
      for (let bc = 0; bc < 3; bc++) {
        const bx = medX + 10 + bc * 35;
        const by = medY + 22;
        ctx.fillRect(bx, by, 26, 38);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(bx + 3, by + 10, 4, 12);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(bx + 9, by + 10, 4, 12);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(bx + 15, by + 10, 4, 12);
        ctx.fillStyle = "#bae6fd";
      }

      // 3. Centre Administratif Waldeck-Rochet
      const admX = 12 * TILE_SIZE;
      const admY = 8 * TILE_SIZE + 10;
      const admW = 3 * TILE_SIZE;
      const admH = 3 * TILE_SIZE - 20;

      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(admX + 4, admY + 4, admW, admH);
      ctx.fillStyle = "#334155";
      ctx.fillRect(admX, admY, admW, admH);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(admX, admY, admW, admH);

      ctx.fillStyle = "#0284c7";
      ctx.fillRect(admX + 4, admY + 3, admW - 8, 14);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 7px system-ui, sans-serif";
      ctx.fillText("CENTRE ADM. WALDECK-ROCHET", admX + admW / 2, admY + 10);

      // Grid Windows
      ctx.fillStyle = "#67e8f9";
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(admX + 12 + c * 34, admY + 24 + r * 24, 24, 16);
        }
      }

      // 4. Place Municipale & Fontaine
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(415, 385, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(415, 385, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(415, 385, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(415, 385, 8 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Hover indicator
      if (hoverTile && gameState === "playing") {
        const isPath = PATH_TILES.some(pt => pt.c === hoverTile.c && pt.r === hoverTile.r);
        const hasTower = towersRef.current.some(t => t.c === hoverTile.c && t.r === hoverTile.r);
        const isBuilding = isBuildingTile(hoverTile.c, hoverTile.r);
        const isInvalid = isPath || hasTower || isBuilding;

        ctx.fillStyle = isInvalid ? "rgba(239, 68, 68, 0.4)" : "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.arc(hoverTile.c * TILE_SIZE + TILE_SIZE / 2, hoverTile.r * TILE_SIZE + TILE_SIZE / 2, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isInvalid ? "#ef4444" : "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 3b. Selected Placed Tower Range & Upgrade Indicator
      if (selectedPlacedTower) {
        const selTower = towersRef.current.find(t => t.c === selectedPlacedTower.c && t.r === selectedPlacedTower.r);
        if (selTower) {
          const upDef = TOWER_UPGRADES[selTower.type]?.[selTower.level] || TOWER_TYPES[selTower.type as keyof typeof TOWER_TYPES];
          
          // Active Range circle
          ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
          ctx.beginPath();
          ctx.arc(selTower.x, selTower.y, upDef.range, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated pulsing selection ring
          const ringPulse = 24 + Math.sin(Date.now() * 0.008) * 3;
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(selTower.x, selTower.y, ringPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Floating upgrade badge above the tower
          if (selTower.level < 3) {
            const nextUp = TOWER_UPGRADES[selTower.type]?.[selTower.level + 1];
            if (nextUp) {
              const tagY = selTower.y - 42;
              const tagW = 105;
              ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
              ctx.fillRect(selTower.x - tagW / 2, tagY - 10, tagW, 20);
              ctx.strokeStyle = "#f59e0b";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(selTower.x - tagW / 2, tagY - 10, tagW, 20);

              ctx.fillStyle = "#fef08a";
              ctx.font = "bold 9px system-ui, sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(`⭐ AMÉLIORER (${nextUp.cost}k€)`, selTower.x, tagY);
            }
          }
        }
      }

      // 4. Kingdom Rush Style Towers
      towersRef.current.forEach(t => {
        // Cobblestone pod base
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 10, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = t.level >= 3 ? "#fef08a" : (t.level === 2 ? "#e2e8f0" : "#cfb478");
        ctx.beginPath();
        ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
        ctx.fill();

        if (t.type === 1) {
          // --- CHARGÉ DE RECRUTEMENT / DRH ---
          if (t.level === 1) {
            ctx.fillStyle = "#6b4322";
            ctx.fillRect(t.x - 14, t.y - 14, 28, 22);
            ctx.fillStyle = "#a16839";
            ctx.fillRect(t.x - 16, t.y - 18, 32, 6);
            // 1 Agent
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 22, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 26, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (t.level === 2) {
            // Glass office + 2 Agents + Red Flag
            ctx.fillStyle = "#334155";
            ctx.fillRect(t.x - 16, t.y - 16, 32, 24);
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(t.x - 14, t.y - 14, 28, 6);
            // 2 Agents
            ctx.fillStyle = "#1e40af";
            ctx.beginPath();
            ctx.arc(t.x - 6, t.y - 22, 4.5, 0, Math.PI * 2);
            ctx.arc(t.x + 6, t.y - 22, 4.5, 0, Math.PI * 2);
            ctx.fill();
            // Flag
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(t.x + 12, t.y - 30, 8, 6);
          } else {
            // Level 3: Direction Générale RH (Gold trims, corporate seal)
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(t.x - 18, t.y - 20, 36, 28);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x - 18, t.y - 20, 36, 28);
            // Gold dome
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 22, 10, Math.PI, Math.PI * 2);
            ctx.fill();
            // 3 Advisors
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(t.x - 8, t.y - 26, 4, 0, Math.PI * 2);
            ctx.arc(t.x, t.y - 28, 4.5, 0, Math.PI * 2);
            ctx.arc(t.x + 8, t.y - 26, 4, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (t.type === 2) {
          // --- BUDGET CONTRACTUEL / TRÉSORERIE ---
          if (t.level === 1) {
            ctx.fillStyle = "#713f12";
            ctx.fillRect(t.x - 16, t.y - 6, 32, 12);
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 6, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#d97706";
            ctx.fillRect(t.x + 2, t.y - 10, 8, 8);
          } else if (t.level === 2) {
            // Double cannon
            ctx.fillStyle = "#334155";
            ctx.fillRect(t.x - 18, t.y - 8, 36, 15);
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(t.x - 5, t.y - 8, 7, 0, Math.PI * 2);
            ctx.arc(t.x + 5, t.y - 8, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#b45309";
            ctx.fillRect(t.x - 8, t.y - 14, 6, 8);
            ctx.fillRect(t.x + 2, t.y - 14, 6, 8);
          } else {
            // Level 3: Trésorerie Centrale (Gold Vault + Dragon Cannon)
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(t.x - 20, t.y - 12, 40, 20);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x - 20, t.y - 12, 40, 20);
            // Giant Gold Cannon
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 12, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 12, 5, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (t.type === 3) {
          // --- REDÉPLOIEMENT / GUICHET UNIQUE ---
          if (t.level === 1) {
            ctx.fillStyle = "#64748b";
            ctx.fillRect(t.x - 12, t.y - 12, 24, 20);
            ctx.fillStyle = "#3b82f6";
            ctx.fillRect(t.x - 15, t.y - 16, 30, 5);
            ctx.fillStyle = "#1d4ed8";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 20, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(t.x + 6, t.y - 24, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (t.level === 2) {
            // Purple fiber mast with 2 crystals
            ctx.fillStyle = "#4c1d95";
            ctx.fillRect(t.x - 14, t.y - 16, 28, 24);
            ctx.fillStyle = "#a855f7";
            ctx.fillRect(t.x - 16, t.y - 20, 32, 5);
            // Floating crystals
            const bob = Math.sin(Date.now() * 0.006) * 3;
            ctx.fillStyle = "#c084fc";
            ctx.beginPath();
            ctx.arc(t.x - 18, t.y - 12 + bob, 4, 0, Math.PI * 2);
            ctx.arc(t.x + 18, t.y - 12 - bob, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Level 3: Sovereign Cloud Hub (Floating Diamond)
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(t.x - 16, t.y - 20, 32, 28);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x - 16, t.y - 20, 32, 28);
            // Floating Astral Core
            const coreBob = Math.sin(Date.now() * 0.005) * 4;
            ctx.fillStyle = "#67e8f9";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 36 + coreBob, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 36 + coreBob, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Level Stars
        for (let i = 0; i < t.level; i++) {
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(t.x - 8 + i * 8, t.y - 32, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(t.x - 8 + i * 8, t.y - 32, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Kingdom Rush Cartoon Enemies
      enemiesRef.current.forEach(e => {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + 4, e.radius, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (e.type === "retraite") {
          // Heavy Armored Knight
          ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : "#475569";
          ctx.fillRect(e.x - 6, e.y - 7, 12, 11);
          // Horned Great Helm
          ctx.fillStyle = "#64748b";
          ctx.beginPath();
          ctx.arc(e.x, e.y - 12, 6, 0, Math.PI * 2);
          ctx.fill();
          // Shield
          ctx.fillStyle = "#713f12";
          ctx.beginPath();
          ctx.arc(e.x - 6, e.y - 3, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === "saisonnier") {
          // Bandit with Red Bandana
          ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : "#78350f";
          ctx.fillRect(e.x - 4, e.y - 5, 8, 8);
          ctx.fillStyle = "#fed7aa";
          ctx.beginPath();
          ctx.arc(e.x, e.y - 9, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#dc2626"; // Bandana
          ctx.beginPath();
          ctx.arc(e.x, e.y - 11, 4.5, Math.PI, Math.PI * 2);
          ctx.fill();
        } else {
          // Cartoon Skeleton Grunt
          ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : "#f8fafc";
          ctx.beginPath();
          ctx.arc(e.x, e.y - 8, 5.5, 0, Math.PI * 2); // Skull
          ctx.fill();
          ctx.fillStyle = "#0f172a"; // Eye sockets
          ctx.beginPath();
          ctx.arc(e.x - 2, e.y - 8, 1.5, 0, Math.PI * 2);
          ctx.arc(e.x + 2, e.y - 8, 1.5, 0, Math.PI * 2);
          ctx.fill();
          // Ribs
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(e.x, e.y - 3);
          ctx.lineTo(e.x, e.y + 4);
          ctx.stroke();
        }

        // Kingdom Rush Health bar
        const hpPercent = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = "#000000";
        ctx.fillRect(e.x - 14, e.y - e.radius - 10, 28, 5);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x - 13, e.y - e.radius - 9, 26, 3);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(e.x - 13, e.y - e.radius - 9, 26 * hpPercent, 3);
      });

      // 6. Projectiles (Arrows, Cannonballs, Magic Orbs)
      projectilesRef.current.forEach(p => {
        if (p.splash) {
          // Cannonball
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.slowDuration) {
          // Magic Arcane Orb
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Arrow
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
        }
      });

      // 7. Fiery Cartoon Explosions & Dust Particles
      particlesRef.current.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
      });

      // 8. Floating text
      ctx.font = "bold 13px 'Plus Jakarta Sans', monospace";
      floatingTextsRef.current.forEach(ft => {
        ctx.fillStyle = "#000000";
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1); // Drop shadow
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      });
    };

    const loop = () => {
      updateGame();
      drawGame();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, gameSpeed, hoverTile, selectedTower, selectedPlacedTower, wave]);

  const selectedTowerData = selectedPlacedTower 
    ? towersRef.current.find(t => t.c === selectedPlacedTower.c && t.r === selectedPlacedTower.r)
    : null;
  const currentUpgradeDef = selectedTowerData 
    ? TOWER_UPGRADES[selectedTowerData.type]?.[selectedTowerData.level]
    : null;
  const nextUpgradeDef = selectedTowerData && selectedTowerData.level < 3
    ? TOWER_UPGRADES[selectedTowerData.type]?.[selectedTowerData.level + 1]
    : null;
  const sellRefund = selectedTowerData
    ? Math.floor(
        ((TOWER_UPGRADES[selectedTowerData.type]?.[1]?.cost || 40) +
        (selectedTowerData.level >= 2 ? (TOWER_UPGRADES[selectedTowerData.type]?.[2]?.cost || 50) : 0) +
        (selectedTowerData.level >= 3 ? (TOWER_UPGRADES[selectedTowerData.type]?.[3]?.cost || 85) : 0)) * 0.65
      )
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Espace Jeux</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <h1 className="text-base sm:text-lg font-black tracking-wide uppercase font-mono text-white">
                  Tower Defense RH
                </h1>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Gamepad2 className="w-3 h-3" /> Canvas 2D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Protection du Service Public face aux vagues de dossiers</p>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs active:scale-95"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col items-center">
        
        {/* GAME CONTAINER FRAME */}
        <div 
          ref={gameContainerRef}
          className="w-full max-w-5xl relative bg-slate-900/90 rounded-3xl p-3 sm:p-4 border border-slate-800/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center"
        >

          <div className="w-full flex flex-col lg:flex-row gap-6">
              
              {/* Sidebar Info & Shop (Canvas Mode) */}
              <div className="w-full lg:w-72 flex flex-col gap-2.5">
                
                {/* Status Bar */}
                <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                      <div className="text-[9px] uppercase font-mono text-amber-400 font-bold flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3" /> Budget
                      </div>
                      <div className="text-base font-black font-mono text-white leading-tight">{budget} k€</div>
                    </div>

                    <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                      <div className="text-[9px] uppercase font-mono text-rose-400 font-bold flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" /> Service Public
                      </div>
                      <div className="text-base font-black font-mono text-white leading-tight">{health} SP</div>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 px-1">
                    <span>Vague: <b className="text-sky-400">{wave} / 10</b></span>
                    <span>Traités: <b className="text-emerald-400">{totalKills}</b></span>
                  </div>
                </div>

                {/* Shop Cards (Bureaux RH) - Placed in High Position */}
                <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between px-0.5 mb-0.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" /> Bureaux RH
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">[1, 2, 3]</span>
                  </div>
                  {[1, 2, 3].map(type => {
                    const tData = TOWER_TYPES[type];
                    const isSel = selectedTower === type && !selectedPlacedTower;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedTower(type);
                          setSelectedPlacedTower(null);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                          isSel 
                            ? "bg-slate-800/95 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/40" 
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tData.color }} />
                            <span className="truncate">{tData.name}</span>
                          </span>
                          <span className="text-amber-400 font-mono font-bold text-xs ml-1 whitespace-nowrap">{tData.cost} k€</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{tData.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Tower Upgrade Panel (Compact & High-Visibility) */}
                {selectedTowerData && currentUpgradeDef ? (
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-2.5 rounded-2xl border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] font-black uppercase text-amber-300 font-mono truncate">
                          {currentUpgradeDef.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[9px] font-black border border-amber-400/40">
                          Niv. {selectedTowerData.level}/3
                        </span>
                        <button
                          onClick={() => setSelectedPlacedTower(null)}
                          className="text-slate-400 hover:text-white text-[10px] w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-all font-mono"
                          title="Fermer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-1 text-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 text-[9px] block">DÉGÂTS</span>
                        <strong className="text-white text-xs">{currentUpgradeDef.damage}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">PORTÉE</span>
                        <strong className="text-sky-300 text-xs">{currentUpgradeDef.range}px</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">CADENCE</span>
                        <strong className="text-white text-xs">{Math.round(60 / (currentUpgradeDef.fireRate / 60)) / 10}/s</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">TRAITÉS</span>
                        <strong className="text-emerald-400 text-xs">{selectedTowerData.totalKills}</strong>
                      </div>
                    </div>

                    {/* Upgrade Action or Max Level */}
                    {selectedTowerData.level < 3 && nextUpgradeDef ? (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-amber-300/90 flex items-center justify-between px-0.5">
                          <span>➔ {nextUpgradeDef.name}</span>
                          <span className="text-emerald-400 font-bold">Dmg {currentUpgradeDef.damage}➔{nextUpgradeDef.damage}</span>
                        </div>
                        <button
                          onClick={handleUpgradeSelectedTower}
                          disabled={budget < nextUpgradeDef.cost}
                          className={`w-full py-2 px-2 rounded-xl font-black font-mono text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                            budget >= nextUpgradeDef.cost
                              ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
                              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          {budget >= nextUpgradeDef.cost 
                            ? `Améliorer Niv. ${selectedTowerData.level + 1} (${nextUpgradeDef.cost} k€)` 
                            : `Manque ${nextUpgradeDef.cost - budget} k€ (${nextUpgradeDef.cost} k€)`}
                        </button>
                      </div>
                    ) : (
                      <div className="py-1 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center font-mono font-bold text-[10px] text-emerald-300 flex items-center justify-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                        Niveau Maximum (Niv. 3)
                      </div>
                    )}

                    {/* Sell Button */}
                    <button
                      onClick={handleSellSelectedTower}
                      className="w-full py-1 rounded-lg bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800/80 hover:border-rose-800/60 font-mono text-[10px] transition-all flex items-center justify-center gap-1"
                    >
                      <span>Vendre (+{sellRefund} k€)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 text-center text-slate-500 text-[10px] font-mono">
                    💡 Clic sur un bureau pour l'améliorer
                  </div>
                )}

              </div>

              {/* Canvas Board */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Top Control Bar: Speed Selector & Sound */}
                <div className="flex items-center justify-between bg-slate-900/90 p-2.5 px-4 rounded-2xl border border-slate-800 shadow-md">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <FastForward className="w-3.5 h-3.5 text-sky-400" /> Vitesse :
                    </span>
                    {([1, 2, 4] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setGameSpeed(s)}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          gameSpeed === s
                            ? "bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.5)] font-black"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Hint & Audio */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      💡 Clic sur un bureau pour l'<strong>améliorer</strong>
                    </span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs"
                      title={isMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative">
                  
                  {gameState === "ready" && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
                      <Shield className="w-12 h-12 text-emerald-400 mb-3" />
                      <h2 className="text-2xl font-black text-white font-mono mb-2">TOWER DEFENSE RH</h2>
                      <p className="text-xs text-slate-400 max-w-sm mb-6">Protégez la citadelle du Service Public ! Placez stratégiquement vos bureaux RH le long de la route.</p>
                      <button
                        onClick={initGame}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                      >
                        <Play className="w-4 h-4 fill-current" /> Démarrer la Défense
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
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="w-full h-auto cursor-crosshair block"
                  />
                </div>

                {!waveActiveRef.current && wave < 10 && gameState === "playing" && (
                  <button
                    onClick={startWave}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Lancer Vague {wave + 1} / 10 [Espace]
                  </button>
                )}
              </div>

            </div>

        </div>

      </main>
    </div>
  );
};

export default TowerDefenseRH;
