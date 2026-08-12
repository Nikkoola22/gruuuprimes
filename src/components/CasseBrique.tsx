import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Play, 
  Heart, 
  Sparkles,
  Zap,
  Activity
} from "lucide-react";

interface CasseBriqueProps {
  onClose: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

// ─── Modèles du jeu ──────────────────────────────────────────────────────────
interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  points: number;
  isHit: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}


interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  color: string;
  active: boolean;
}
interface PowerUp {
  x: number;
  y: number;
  type: "life" | "wide" | "slow" | "multiball" | "shoot";
  size: number;
  color: string;
  label: string;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  trail: { x: number; y: number }[];
}

const BRICK_WORDS = [
  // Ligne 1 - Rouge/Orange (Primes & Indemnités)
  ["RIFSEEP", "13e MOIS", "PRIMES", "CIA", "NBI", "GIPA", "HEURES +", "IFSE", "AIF", "IFTS", "IHTS"],
  // Ligne 2 - Orange (Temps de travail & QVT)
  ["TÉLÉTRAVAIL", "DÉCONNEXION", "CET", "RTT", "CONGÉS", "MUTUELLE", "COS", "TICKETS", "CRÈCHE", "SPORT", "AMÉNAG."],
  // Ligne 3 - Orange clair (Carrière & Compétences)
  ["FORMATION", "CPF", "CARRIÈRE", "CONCOURS", "MOBILITÉ", "STAGE", "PROMOTION", "DIF", "BILAN", "VAE", "ÉVAL."],
  // Ligne 4 - Jaune/Blanc (Santé, Sécurité, CFDT)
  ["SÉCURITÉ", "SANTÉ", "CST", "PRÉVOYANCE", "DROITS", "ACCORD", "CFDT", "F3SCT", "CAP", "CCP", "ÉGALITÉ"]
];

const BRICK_COLORS = ["#f472b6", "#38bdf8", "#a78bfa", "#fb923c"];

const LEVEL_LAYOUTS = [
  // Niveau 1 : Grille complète (4 lignes x 11 colonnes)
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Niveau 2 : Forme spatiale de bouclier invader (11 colonnes)
  [
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
  ]
];

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CasseBrique: React.FC<CasseBriqueProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // États React pour l'affichage de l'interface
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [level, setLevelState] = useState(1);
  
  const levelRef = useRef(1);
  const setLevel = (val: number) => {
    levelRef.current = val;
    setLevelState(val);
  };

  // Refs de physique pour éviter les saccades dues au rafraîchissement d'état React
  const paddleRef = useRef({ x: 270, y: 382, width: 100, height: 18 });
  const ballsRef = useRef<Ball[]>([{ x: 320, y: 360, vx: 7, vy: -8, radius: 6, active: true, trail: [] }]);
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const shakeRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number; speed: number }[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const shootModeRef = useRef(false);

  // Timers des power-ups
  const powerupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthèse sonore Web Audio
  const playSound = useCallback((type: 'paddle' | 'wall' | 'brick' | 'powerup' | 'death' | 'victory') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ac = audioCtxRef.current;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    const now = ac.currentTime;
    if (type === 'paddle') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'wall') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now); osc.stop(now + 0.07);
    } else if (type === 'brick') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'death') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now); osc.stop(now + 0.55);
    } else if (type === 'victory') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.12);
      osc.frequency.setValueAtTime(784, now + 0.24);
      osc.frequency.setValueAtTime(1046, now + 0.36);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
    }
  }, []);

  // Réinitialiser les briques
  const initBricks = useCallback((lvl: number) => {
    const bricks: Brick[] = [];
    const rows = 4;
    const cols = 11;
    const brickW = 60;
    const brickH = 16;
    const gap = 8;
    const offsetTop = 40;
    const totalW = cols * brickW + (cols - 1) * gap;
    const offsetLeft = (CANVAS_WIDTH - totalW) / 2;

    const layout = LEVEL_LAYOUTS[lvl - 1] || LEVEL_LAYOUTS[0];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (layout[r][c] === 1) {
          bricks.push({
            x: offsetLeft + c * (brickW + gap),
            y: offsetTop + r * (brickH + gap),
            width: brickW,
            height: brickH,
            text: BRICK_WORDS[r][c],
            color: BRICK_COLORS[r],
            points: (rows - r) * 10,
            isHit: false
          });
        }
      }
    }
    bricksRef.current = bricks;
  }, []);

  // Initialiser une nouvelle partie
  const startNewGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setActivePowerUp(null);
    if (powerupTimerRef.current) clearTimeout(powerupTimerRef.current);

          paddleRef.current = { x: 360, y: 560, width: 80, height: 16 };
    ballsRef.current = [{ x: 400, y: 540, vx: 7, vy: -8, radius: 6, active: true, trail: [] }];
    particlesRef.current = [];
    powerupsRef.current = [];
    
    initBricks(1);
    setGameState("playing");
  }, [initBricks]);

  // Déclencher un effet de particules d'explosion
  const createExplosion = (x: number, y: number, color: string) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color,
        alpha: 1,
        life: Math.random() * 20 + 20
      });
    }
    particlesRef.current = [...particlesRef.current, ...particles];
  };

  // Activer un bonus
  const applyPowerUp = (type: "life" | "wide" | "slow" | "multiball") => {
    if (type === "life") {
      setLives((l) => l + 1);
    } else if (type === "wide") {
      paddleRef.current.width = 145;
      setActivePowerUp("Raquette Large");
      if (powerupTimerRef.current) clearTimeout(powerupTimerRef.current);
      powerupTimerRef.current = setTimeout(() => {
        paddleRef.current.width = 100;
        setActivePowerUp(null);
      }, 8000);
    } else if (type === "slow") {
      ballsRef.current.forEach((b) => {
        b.vx *= 0.65;
        b.vy *= 0.65;
      });
      setActivePowerUp("Balle Ralentie");
      if (powerupTimerRef.current) clearTimeout(powerupTimerRef.current);
      powerupTimerRef.current = setTimeout(() => {
        ballsRef.current.forEach((b) => {
          b.vx /= 0.65;
          b.vy /= 0.65;
        });
        setActivePowerUp(null);
      }, 8000);
    
    } else if (type === "shoot") {
      shootModeRef.current = true;
      setActivePowerUp("Mode Tir 🔫");
      if (powerupTimerRef.current) clearTimeout(powerupTimerRef.current);
      powerupTimerRef.current = setTimeout(() => {
        shootModeRef.current = false;
        setActivePowerUp(null);
      }, 8000);
    } else if (type === "multiball") {
      const mainBall = ballsRef.current[0];
      if (mainBall) {
        ballsRef.current.push({
          x: mainBall.x,
          y: mainBall.y,
          vx: -mainBall.vx,
          vy: mainBall.vy,
          radius: mainBall.radius,
          active: true,
          trail: []
        });
      }
      setActivePowerUp("Multi-Balles");
    }
  };

  // Clavier & Souris et initialisation des étoiles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;

      if (e.code === "Space" && shootModeRef.current) {
        e.preventDefault();
        bulletsRef.current.push({
          x: paddleRef.current.x + paddleRef.current.width / 2 - 2,
          y: paddleRef.current.y,
          width: 4,
          height: 12,
          vy: -8,
          color: "#f43f5e",
          active: true
        });
      }

    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Initialiser les étoiles spatiales
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1)
      });
    }
    starsRef.current = stars;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Déplacement souris relatif
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    // Ajuster au centre de la raquette
    const halfWidth = paddleRef.current.width / 2;
    let newX = (relativeX / rect.width) * CANVAS_WIDTH - halfWidth;
    
    if (newX < 0) newX = 0;
    if (newX > CANVAS_WIDTH - paddleRef.current.width) newX = CANVAS_WIDTH - paddleRef.current.width;
    paddleRef.current.x = newX;
  };

  // Déplacement tactile
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing" || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const halfWidth = paddleRef.current.width / 2;
    let newX = (relativeX / rect.width) * CANVAS_WIDTH - halfWidth;

    if (newX < 0) newX = 0;
    if (newX > CANVAS_WIDTH - paddleRef.current.width) newX = CANVAS_WIDTH - paddleRef.current.width;
    paddleRef.current.x = newX;
  };

  // Boucle de jeu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const updateGame = () => {
      if (gameState !== "playing") return;

      // 1. Déplacer la raquette au clavier
      const paddleSpeed = 8;
      if (keysRef.current.left) {
        paddleRef.current.x = Math.max(0, paddleRef.current.x - paddleSpeed);
      }
      if (keysRef.current.right) {
        paddleRef.current.x = Math.min(CANVAS_WIDTH - paddleRef.current.width, paddleRef.current.x + paddleSpeed);
      }

      
      // 1.5 Update Bullets
      bulletsRef.current.forEach(bullet => {
        if (!bullet.active) return;
        bullet.y += bullet.vy;
        if (bullet.y < 0) bullet.active = false;
        
        bricksRef.current.forEach(brick => {
          if (brick.isHit || !bullet.active) return;
          if (
            bullet.x < brick.x + brick.width &&
            bullet.x + bullet.width > brick.x &&
            bullet.y < brick.y + brick.height &&
            bullet.y + bullet.height > brick.y
          ) {
            brick.isHit = true;
            bullet.active = false;
            setScore(s => s + brick.points);
            createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
            shakeRef.current = Math.max(shakeRef.current, 5);
          }
        });
      });
      bulletsRef.current = bulletsRef.current.filter(b => b.active);

      // 2. Déplacer et vérifier les balles
      let activeBalls = ballsRef.current.filter((b) => b.active);
      
      activeBalls.forEach((ball) => {
        // Enregistrer la traînée de la balle
        ball.trail = ball.trail || [];
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 8) {
          ball.trail.shift();
        }

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Rebond murs latéraux
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
          shakeRef.current = Math.max(shakeRef.current, 3);
          playSound('wall');
        }
        if (ball.x + ball.radius > CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius;
          ball.vx = -ball.vx;
          shakeRef.current = Math.max(shakeRef.current, 3);
          playSound('wall');
        }

        // Rebond plafond
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
          shakeRef.current = Math.max(shakeRef.current, 3);
          playSound('wall');
        }

        // Perte de balle (bas de l'écran)
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
          ball.active = false;
          return;
        }

        // Rebond sur la raquette
        const pad = paddleRef.current;
        if (
          ball.y + ball.radius >= pad.y &&
          ball.y - ball.radius <= pad.y + pad.height &&
          ball.x >= pad.x &&
          ball.x <= pad.x + pad.width
        ) {
          // Angle de rebond selon le point d'impact sur la raquette
          const impact = ball.x - (pad.x + pad.width / 2);
          const ratio = impact / (pad.width / 2); // Entre -1 et 1
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          
          ball.vy = -Math.abs(ball.vy);
          ball.vx = ratio * speed * 0.9;
          // Sécurité anti-balles infiniment horizontales
          if (Math.abs(ball.vx) > speed * 0.95) ball.vx = Math.sign(ball.vx) * speed * 0.95;
          ball.y = pad.y - ball.radius;
          shakeRef.current = Math.max(shakeRef.current, 4);
          playSound('paddle');
        }

        // Collision briques
        bricksRef.current.forEach((brick) => {
          if (brick.isHit) return;

          // Box collision simple
          if (
            ball.x + ball.radius >= brick.x &&
            ball.x - ball.radius <= brick.x + brick.width &&
            ball.y + ball.radius >= brick.y &&
            ball.y - ball.radius <= brick.y + brick.height
          ) {
            brick.isHit = true;
            setScore((s) => s + brick.points);
            createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
            shakeRef.current = Math.max(shakeRef.current, 8);
            playSound('brick');

            // Physique de rebond sur la brique
            const overlapX = Math.min(ball.x + ball.radius - brick.x, brick.x + brick.width - (ball.x - ball.radius));
            const overlapY = Math.min(ball.y + ball.radius - brick.y, brick.y + brick.height - (ball.y - ball.radius));

            if (overlapX < overlapY) {
              ball.vx = -ball.vx;
            } else {
              ball.vy = -ball.vy;
            }

            // Génération de Power-up (16% de chance)
            if (Math.random() < 0.16) {
              const types: ("life" | "wide" | "slow" | "multiball" | "shoot")[] = ["life", "wide", "slow", "multiball", "shoot"];
              const selectedType = types[Math.floor(Math.random() * types.length)];
              let pColor = "#ff7900";
              let pLabel = "🔋";
              if (selectedType === "life") { pColor = "#ef4444"; pLabel = "❤️"; }
              else if (selectedType === "wide") { pColor = "#3b82f6"; pLabel = "↔️"; }
              else if (selectedType === "slow") { pColor = "#10b981"; pLabel = "⏳"; }
              else if (selectedType === "multiball") { pColor = "#a855f7"; pLabel = "🔮"; }
              else if (selectedType === "shoot") { pColor = "#f43f5e"; pLabel = "🔫"; }

              powerupsRef.current.push({
                x: brick.x + brick.width / 2,
                y: brick.y + brick.height,
                type: selectedType,
                size: 14,
                color: pColor,
                label: pLabel
              });
            }
          }
        });
      });

      // Mettre à jour la liste des balles actives
      ballsRef.current = ballsRef.current.filter((b) => b.active);

      // Si plus de balles actives
      if (ballsRef.current.length === 0) {
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            playSound('death');
            setGameState("gameover");
          } else {
            playSound('death');
            // Remettre une balle sur la raquette
            ballsRef.current = [{
              x: paddleRef.current.x + paddleRef.current.width / 2,
              y: paddleRef.current.y - 10,
              vx: 7,
              vy: -8,
              radius: 6,
              active: true,
              trail: []
            }];
          }
          return nextL;
        });
      }

      // Déplacer les power-ups
      powerupsRef.current.forEach((pup) => {
        pup.y += 4; // vitesse de chute rapide

        // Collision raquette
        const pad = paddleRef.current;
        if (
          pup.y + pup.size >= pad.y &&
          pup.y <= pad.y + pad.height &&
          pup.x >= pad.x &&
          pup.x <= pad.x + pad.width
        ) {
          applyPowerUp(pup.type);
          playSound('powerup');
          pup.y = 9999; // Supprimer
        }
      });
      powerupsRef.current = powerupsRef.current.filter((pup) => pup.y < CANVAS_HEIGHT);

      // Mettre à jour les particules
      particlesRef.current.forEach((part) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        part.alpha = Math.max(0, part.life / 30);
      });
      particlesRef.current = particlesRef.current.filter((part) => part.life > 0);

      // Condition de victoire ou passage au niveau suivant
      const activeBricks = bricksRef.current.filter((b) => !b.isHit);
      if (activeBricks.length === 0) {
        if (levelRef.current === 1) {
          setLevel(2);
          initBricks(2);
                paddleRef.current = { x: 360, y: 560, width: 80, height: 16 };
          ballsRef.current = [{ x: 400, y: 540, vx: 7, vy: -8, radius: 6, active: true, trail: [] }];
          powerupsRef.current = [];
          shakeRef.current = 15;
        } else {
          playSound('victory');
          setGameState("victory");
        }
      }
    };

    const drawGame = () => {
      ctx.save();
      // Effet de secousse de l'écran (camera shake)
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * 4;
        const dy = (Math.random() - 0.5) * 4;
        ctx.translate(dx, dy);
        shakeRef.current--;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // === FOND SPATIAL ===
      // Dégradé espace profond
      const spaceGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      spaceGrad.addColorStop(0, '#000510');
      spaceGrad.addColorStop(0.4, '#020020');
      spaceGrad.addColorStop(0.8, '#050005');
      spaceGrad.addColorStop(1, '#000008');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Nébuleuse violette
      const nebula1 = ctx.createRadialGradient(520, 140, 0, 520, 140, 240);
      nebula1.addColorStop(0, 'rgba(130,0,200,0.09)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Nébuleuse bleue
      const nebula2 = ctx.createRadialGradient(140, 420, 0, 140, 420, 180);
      nebula2.addColorStop(0, 'rgba(0,60,180,0.07)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Nébuleuse rose
      const nebula3 = ctx.createRadialGradient(680, 480, 0, 680, 480, 160);
      nebula3.addColorStop(0, 'rgba(200,0,100,0.06)');
      nebula3.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Étoiles scintillantes
      starsRef.current.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1) { star.alpha = 1; star.speed = -star.speed; }
        if (star.alpha < 0.08) { star.alpha = 0.08; star.speed = -star.speed; }
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = star.size > 1.2 ? 6 : 2;
        ctx.shadowColor = star.size > 1.2 ? '#aaccff' : '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Bordure néon violette (murs arcade)
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#cc00ff';
      ctx.strokeStyle = 'rgba(180,0,255,0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, CANVAS_WIDTH - 3, CANVAS_HEIGHT - 3);
      ctx.restore();

      bricksRef.current.forEach((brick) => {
        if (brick.isHit) return;

        ctx.save();
        // Gradient arcade (style Arkanoid)
        const bGrad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        bGrad.addColorStop(0, brick.color);
        bGrad.addColorStop(1, brick.color + '99');
        ctx.fillStyle = bGrad;
        ctx.shadowBlur = 16;
        ctx.shadowColor = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x + 1, brick.y + 1, brick.width - 2, brick.height - 2, 2);
        ctx.fill();

        // Reflet haut (3D arcade)
        ctx.fillStyle = 'rgba(255,255,255,0.40)';
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 2);

        // Ombre bas
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(brick.x + 2, brick.y + brick.height - 4, brick.width - 4, 2);
        ctx.restore();

        // Texte monospace arcade
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fff';
        ctx.fillText(brick.text, brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
        ctx.restore();
      });

      // Raquette style arcade néon orange
      const pad = paddleRef.current;
      ctx.save();
      const padGrad = ctx.createLinearGradient(pad.x, pad.y, pad.x, pad.y + pad.height);
      padGrad.addColorStop(0, '#ffffff');
      padGrad.addColorStop(0.3, '#ffaa33');
      padGrad.addColorStop(1, '#cc5500');
      ctx.fillStyle = padGrad;
      ctx.shadowBlur = 28;
      ctx.shadowColor = '#ff7900';
      ctx.beginPath();
      ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 5);
      ctx.fill();

      // Reflet haut
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(pad.x + 3, pad.y + 1, pad.width - 6, 2);

      // Texte CFDT
      ctx.shadowBlur = 0;
      ctx.font = '900 8px monospace';
      ctx.fillStyle = '#551500';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CFDT', pad.x + pad.width / 2, pad.y + pad.height / 2 + 0.5);
      ctx.restore();

      // Dessiner les balles (Orbes lumineuses dont la couleur s'adapte aux bonus actifs)
      ballsRef.current.forEach((ball) => {
        if (!ball.active) return;

        // Choix de la couleur selon le bonus actif
        let ballGlowColor = "#ff7900"; // Orange par défaut
        let ballCoreColor = "#ff9a3c";
        let trailColor = "#ffaa44";

        if (activePowerUp === "Raquette Large") {
          ballGlowColor = "#3b82f6"; // Bleu
          ballCoreColor = "#60a5fa";
          trailColor = "#93c5fd";
        } else if (activePowerUp === "Balle Ralentie") {
          ballGlowColor = "#10b981"; // Vert
          ballCoreColor = "#34d399";
          trailColor = "#6ee7b7";
        } else if (activePowerUp === "Multi-Balles") {
          ballGlowColor = "#a855f7"; // Violet
          ballCoreColor = "#c084fc";
          trailColor = "#d8b4fe";
        }
        
        // Trainée de la balle
        const trail = ball.trail || [];
        trail.forEach((pos, index) => {
          const alpha = (index + 1) / trail.length * 0.4;
          const radius = ball.radius * (0.3 + (0.7 * (index + 1) / trail.length));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = trailColor;
          ctx.shadowBlur = 6;
          ctx.shadowColor = ballGlowColor;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Balle principale
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = ballGlowColor;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = ballCoreColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      
      // Dessiner les tirs (bullets)
      bulletsRef.current.forEach(b => {
        if (!b.active) return;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 2);
        ctx.fill();
        ctx.restore();
      });

      // Dessiner les power-ups
      powerupsRef.current.forEach((pup) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = pup.color;
        ctx.fillStyle = pup.color;
        
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pup.label, pup.x, pup.y + 0.5);
        ctx.restore();
      });

      // Dessiner les particules
      particlesRef.current.forEach((part) => {
        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // === POST-PROCESSING & SHADER PASS (ReShade / SweetFX CRT & Vignette Glow Style) ===
      ctx.save();
      
      // 1. Vignette optique (Ambient Occlusion aux bords du canvas)
      const vignetteGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.35,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.65
      );
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
      vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Scanlines CRT (Lignes horizontales rétro émulateur arcade)
      ctx.fillStyle = 'rgba(10, 15, 30, 0.08)';
      for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 1.5);
      }

      // 3. Bloom / Chromatic Aberration Subtile (Lueur globale arcade)
      const bloomGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bloomGrad.addColorStop(0, 'rgba(204,0,255,0.03)');
      bloomGrad.addColorStop(0.5, 'rgba(255,121,0,0.02)');
      bloomGrad.addColorStop(1, 'rgba(0,200,255,0.03)');
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.restore();

      ctx.restore(); // pour le Screen Shake
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
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden font-sans" style={{background: 'linear-gradient(180deg, #050014 0%, #0a0028 100%)'}}>
      {/* Fond néon ambiant */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(180,0,255,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        
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
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-black tracking-widest mb-2 uppercase" style={{fontFamily: 'monospace', color: '#ff7900', textShadow: '0 0 25px rgba(255,121,0,0.6), 0 0 60px rgba(255,121,0,0.3)'}}>
            CASSE-BRIQUE <span style={{color: '#cc00ff', textShadow: '0 0 25px rgba(204,0,255,0.7)'}}>CFDT</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold max-w-lg mx-auto mb-6 tracking-widest" style={{color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace'}}>
            LIBÉREZ VOS ACQUIS SOCIAUX — DÉTRUISEZ LES BRIQUES !
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm font-bold">
            <span className="px-4 py-2 rounded-xl font-mono text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,10,35,0.85)', border: '1px solid rgba(180,0,255,0.5)', color: '#d8b4fe', letterSpacing: '0.1em'}}>
              LEVEL <span className="text-white text-base font-black ml-1">0{level}</span>
            </span>
            <span className="px-4 py-2 rounded-xl font-mono text-xs shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,10,35,0.85)', border: '1px solid rgba(255,121,0,0.5)', color: '#fdba74', letterSpacing: '0.1em'}}>
              SCORE <span className="text-amber-400 text-base font-black ml-1">{String(score).padStart(6, '0')}</span>
            </span>
            <span className="px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{background: 'rgba(15,10,35,0.85)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', letterSpacing: '0.1em'}}>
              VIES
              <span className="flex gap-1">
                {Array.from({ length: Math.max(0, lives) }).map((_, idx) => (
                  <Heart key={idx} className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                ))}
                {lives <= 0 && <span className="text-rose-500 font-bold text-xs">---</span>}
              </span>
            </span>
            {activePowerUp && (
              <span className="px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-1.5 animate-bounce shadow-[0_0_20px_rgba(255,121,0,0.4)]" style={{background: 'rgba(255,121,0,0.2)', border: '1px solid rgba(255,121,0,0.6)', color: '#ff7900', letterSpacing: '0.08em'}}>
                <Zap className="w-3.5 h-3.5 fill-current" />
                {activePowerUp}
              </span>
            )}
          </div>
        </div>

        {/* Game Area Container */}
        <div className="max-w-5xl mx-auto backdrop-blur-2xl rounded-3xl p-4 sm:p-6 relative overflow-hidden" style={{background: 'rgba(5,2,20,0.9)', border: '1px solid rgba(180,0,255,0.4)', boxShadow: '0 0 50px rgba(180,0,255,0.2), inset 0 0 60px rgba(0,0,0,0.8)'}}>
          
          {gameState === "ready" && (
            <div className="text-center py-16 relative z-10 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform" style={{background: 'linear-gradient(135deg, rgba(255,121,0,0.3), rgba(204,0,255,0.3))', border: '2px solid rgba(255,121,0,0.6)', boxShadow: '0 0 35px rgba(255,121,0,0.4)'}}>
                <Activity className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(255,121,0,0.8)]" />
              </div>
              <h2 className="text-3xl font-black mb-3 tracking-widest uppercase" style={{fontFamily: 'monospace', color: '#ff7900', textShadow: '0 0 20px rgba(255,121,0,0.7)'}}>PRESS START</h2>
              <p className="max-w-md mx-auto mb-8 text-sm leading-relaxed" style={{color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace'}}>
                Dirigez la raquette <span style={{color: '#ff7900', fontWeight: 800}}>CFDT</span> avec la souris, le doigt ou les flèches du clavier. Attrapez les capsules bonus !
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-10 py-4 font-black rounded-full text-base tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(255,121,0,0.6)]"
                style={{fontFamily: 'monospace', background: 'linear-gradient(135deg, #ff7900, #e65c00)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)'}}
              >
                <Play className="w-6 h-6 fill-white" />
                DÉMARRER LA PARTIE
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="text-center py-16 relative z-10 animate-scale-up">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)', boxShadow: '0 0 30px rgba(239,68,68,0.3)'}}>
                <Heart className="w-10 h-10" style={{color: '#ef4444'}} />
              </div>
              <h2 className="text-3xl font-black mb-3 tracking-widest uppercase" style={{fontFamily: 'monospace', color: '#ef4444', textShadow: '0 0 20px #ef444466'}}>GAME OVER</h2>
              <p className="max-w-sm mx-auto mb-8 text-sm" style={{color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace'}}>
                SCORE FINAL : <span style={{color: '#ff7900', fontWeight: 700}}>{String(score).padStart(6, '0')}</span>
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-10 py-3 font-black rounded text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                style={{fontFamily: 'monospace', background: 'linear-gradient(135deg, #ef4444, #991b1b)', color: '#fff', boxShadow: '0 0 30px rgba(239,68,68,0.4)', border: '1px solid rgba(239,68,68,0.5)'}}
              >
                <RotateCcw className="w-5 h-5" />
                TRY AGAIN
              </button>
            </div>
          )}

          {gameState === "victory" && (
            <div className="text-center py-16 relative z-10 animate-scale-up">
              <Trophy className="w-20 h-20 mx-auto mb-6 animate-bounce" style={{color: '#facc15', filter: 'drop-shadow(0 0 20px #facc1588)'}} />
              <h2 className="text-3xl font-black mb-3 tracking-widest uppercase" style={{fontFamily: 'monospace', color: '#facc15', textShadow: '0 0 20px #facc1566'}}>VICTOIRE !</h2>
              <p className="max-w-sm mx-auto mb-8 text-sm" style={{color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace'}}>
                SCORE FINAL : <span style={{color: '#22c55e', fontWeight: 700}}>{String(score).padStart(6, '0')}</span>
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-10 py-3 font-black rounded text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                style={{fontFamily: 'monospace', background: 'linear-gradient(135deg, #facc15, #ca8a04)', color: '#000', boxShadow: '0 0 30px rgba(250,204,21,0.4)', border: '1px solid rgba(250,204,21,0.6)'}}
              >
                <RotateCcw className="w-5 h-5" />
                PLAY AGAIN
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="relative flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="rounded-xl cursor-none max-w-full block"
                style={{border: '2px solid rgba(180,0,255,0.35)', boxShadow: '0 0 30px rgba(180,0,255,0.2)'}}
              />
            </div>
          )}

        </div>

        {/* Game Instructions */}
        <div className="mt-6 p-4 rounded-xl text-xs font-mono flex items-start gap-3 max-w-2xl mx-auto" style={{background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,121,0,0.2)', color: 'rgba(255,255,255,0.4)'}}>
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{color: '#ff7900'}} />
          <div>
            <strong className="block mb-1" style={{color: '#ff7900', letterSpacing: '0.08em'}}>CONTROLS :</strong>
            SOURIS / DOIGT / FLÈCHES ←→ — ESPACE = TIR | &#x2764; vie | ⇔ raquette large | ⏳ balle lente | 🔮 multi-balles | 🔫 mode tir
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CasseBrique;
