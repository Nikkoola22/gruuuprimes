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
  const paddleRef = useRef({ x: 270, y: 382, width: 100, height: 12 });
  const ballsRef = useRef<Ball[]>([{ x: 320, y: 360, vx: 3, vy: -4, radius: 6, active: true, trail: [] }]);
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

    paddleRef.current = { x: 360, y: 560, width: 80, height: 10 };
    ballsRef.current = [{ x: 400, y: 540, vx: 3, vy: -4, radius: 6, active: true, trail: [] }];
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
    for (let i = 0; i < 50; i++) {
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
        }
        if (ball.x + ball.radius > CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius;
          ball.vx = -ball.vx;
          shakeRef.current = Math.max(shakeRef.current, 3);
        }

        // Rebond plafond
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
          shakeRef.current = Math.max(shakeRef.current, 3);
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
            setGameState("gameover");
          } else {
            // Remettre une balle sur la raquette
            ballsRef.current = [{
              x: paddleRef.current.x + paddleRef.current.width / 2,
              y: paddleRef.current.y - 10,
              vx: 3,
              vy: -4,
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
        pup.y += 2; // vitesse de chute

        // Collision raquette
        const pad = paddleRef.current;
        if (
          pup.y + pup.size >= pad.y &&
          pup.y <= pad.y + pad.height &&
          pup.x >= pad.x &&
          pup.x <= pad.x + pad.width
        ) {
          applyPowerUp(pup.type);
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
          paddleRef.current = { x: 360, y: 560, width: 80, height: 10 };
          ballsRef.current = [{ x: 400, y: 540, vx: 3, vy: -4, radius: 6, active: true, trail: [] }];
          powerupsRef.current = [];
          shakeRef.current = 15;
        } else {
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

      // Minimalist background
      ctx.save();
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      // Dessiner les briques
      bricksRef.current.forEach((brick) => {
        if (brick.isHit) return;

        // Fond brique
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = brick.color;
        ctx.fillStyle = brick.color;
        
        // Tracé arrondi de la brique
        ctx.beginPath();
        const r = 4; // radius
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, r);
        ctx.fill();

        // Ajout d'un léger reflet blanc translucide en haut de la brique
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.roundRect(brick.x + 1, brick.y + 1, brick.width - 2, 3, 2);
        ctx.fill();
        
        ctx.restore();

        // Texte sur la brique
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(brick.text, brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
        ctx.restore();
      });

      // Dessiner la raquette aux couleurs de la CFDT (Orange avec bande blanche et bordure brillante)
      const pad = paddleRef.current;
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff7900";
      ctx.fillStyle = "#ff7900";
      ctx.beginPath();
      ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 6);
      ctx.fill();
      
      // Bordure blanche pour la faire ressortir
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Bande blanche centrale logo style
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pad.x + pad.width / 2 - 12, pad.y + 1, 24, pad.height - 2);
      
      // Petit texte CFDT
      ctx.font = "900 8px sans-serif";
      ctx.fillStyle = "#c2410c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CFDT", pad.x + pad.width / 2, pad.y + pad.height / 2 + 0.5);
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

      ctx.restore(); // for screen shake
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
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Retour button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4  bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Title & Stats */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-2 text-slate-800 dark:text-slate-100">
            Casse-brique RH <span className="text-orange-500 font-semibold font-sans text-2xl sm:text-4xl">CFDT</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light max-w-lg mx-auto mb-6">
            Libérez vos acquis sociaux et droits de la fonction publique en détruisant les briques !
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm font-bold">
            <span className="bg-white/50 dark:bg-slate-800/50 px-4  rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Niveau : <span className="text-purple-400 text-base font-extrabold">{level}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4  rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Score : <span className="text-orange-400 text-base font-extrabold">{score}</span>
            </span>
            <span className="bg-white/50 dark:bg-slate-800/50 px-4  rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-sm flex items-center gap-2">
              Vies : 
              <span className="flex items-center gap-1">
                {Array.from({ length: Math.max(0, lives) }).map((_, idx) => (
                  <Heart key={idx} className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                ))}
                {lives <= 0 && <span className="text-red-500 font-bold text-xs">Aucune</span>}
              </span>
            </span>
            {activePowerUp && (
              <span className="bg-orange-500/20 text-orange-300 px-4  rounded-full border border-orange-500/40 text-xs font-semibold flex items-center gap-1.5 animate-bounce">
                <Zap className="w-3.5 h-3.5" />
                {activePowerUp}
              </span>
            )}
          </div>
        </div>

        {/* Game Area Container */}
        <div className="max-w-5xl mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
          
          {gameState === "ready" && (
            <div className="text-center  relative z-10 animate-fade-in">
              <Activity className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Prêt à briser les briques des acquis ?</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 text-sm font-light leading-relaxed">
                Utilisez votre souris ou glissez votre doigt sur l'écran pour diriger la raquette aux couleurs de la <span className="text-orange-400 font-bold">CFDT</span>. Collectez les bonus qui tombent pour vous aider !
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-8  bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-2xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Commencer la partie</span>
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="text-center  relative z-10 animate-scale-up">
              <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Heart className="w-8 h-8 opacity-70" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 font-light">Partie terminée ! 😢</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 text-sm font-light">
                Vous avez bien défendu les droits, mais vous n'avez plus de vies ! Votre score final est de <span className="font-bold text-orange-400">{score} points</span>.
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-8  bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-2xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          {gameState === "victory" && (
            <div className="text-center  relative z-10 animate-scale-up">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 font-light">Victoire complète ! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 text-sm font-light">
                Bravo ! Vous avez libéré tous les acquis sociaux de la fonction publique territoriale avec un score de <span className="font-bold text-green-400">{score} points</span> !
              </p>
              <button
                onClick={startNewGame}
                className="mx-auto px-8  bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-2xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Rejouer</span>
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
                className="bg-transparent rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner cursor-none max-w-full block"
              />
            </div>
          )}

        </div>

        {/* Game Instructions */}
        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-light text-slate-600 dark:text-slate-300 flex items-start gap-3 max-w-2xl mx-auto">
          <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 dark:text-slate-100 font-semibold block mb-1">Comment jouer :</strong>
            Déplacez la raquette <span className="text-orange-400 font-semibold">CFDT</span> horizontalement avec votre souris, votre doigt ou les flèches directionnelles <kbd className="bg-white dark:bg-slate-800 px-1 .5 rounded border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs shadow-sm">←</kbd> <kbd className="bg-white dark:bg-slate-800 px-1 .5 rounded border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs shadow-sm">→</kbd> pour faire rebondir la balle. Récupérez les capsules bonus pour obtenir des avantages (❤️ = vie, ↔️ = raquette large, ⏳ = balle lente, 🔮 = multi-balles, 🔫 = mode tir avec Espace).
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
