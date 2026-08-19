import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Play, Trophy, Rocket, ArrowLeft as LeftIcon, ArrowRight as RightIcon, Crosshair, Zap, Volume2, VolumeX } from "lucide-react";

interface SpaceInvadersRHProps {
  onClose: () => void;
}

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 640;

interface Invader {
  x: number;
  y: number;
  width: number;
  height: number;
  type: number; // 0, 1, 2, 3
  color: string;
  glowColor: string;
  label: string;
  points: number;
  alive: boolean;
  animFrame: number;
}

interface Laser {
  x: number;
  y: number;
  vx?: number;
  vy: number;
  isEnemy: boolean;
  color: string;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
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

interface BunkerBrick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  alive: boolean;
}

interface Bunker {
  x: number;
  y: number;
  width: number;
  height: number;
  bricks: BunkerBrick[];
}

// Web Audio API Sound Synthesizer
const playAudioSound = (type: "shoot" | "explosion" | "hit" | "gameover" | "victory" | "shield", isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "shoot") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(147, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } else if (type === "hit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === "explosion") {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.25);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(); noise.stop(ctx.currentTime + 0.25);
    } else if (type === "shield") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else if (type === "gameover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === "victory") {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    }
  } catch {
    // Ignore audio context errors
  }
};

const SpaceInvadersRH: React.FC<SpaceInvadersRHProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover" | "victory">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [doubleShootTimer, setDoubleShootTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  const doubleShootTimerRef = useRef(doubleShootTimer);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    doubleShootTimerRef.current = doubleShootTimer;
  }, [doubleShootTimer]);

  // Player Ship
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 60,
    width: 50,
    height: 32,
    speed: 7
  });

  const invadersRef = useRef<Invader[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bunkersRef = useRef<Bunker[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const invaderDirRef = useRef<number>(1);
  const invaderMoveTimerRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);

  // Initialiser les envahisseurs et boucliers
  const initWave = useCallback((_currentWave?: number) => {
    void _currentWave;
    const invaders: Invader[] = [];
    const rows = 4;
    const cols = 8;
    const invW = 46;
    const invH = 30;
    const gapX = 18;
    const gapY = 16;
    const startX = (CANVAS_WIDTH - (cols * (invW + gapX) - gapX)) / 2;
    const startY = 70;

    
    const typeDefs = [
      { color: "#e11d48", glowColor: "#fb7185", pts: 40 }, // Red
      { color: "#f59e0b", glowColor: "#fbbf24", pts: 30 }, // Orange
      { color: "#a855f7", glowColor: "#c084fc", pts: 20 }, // Purple
      { color: "#a855f7", glowColor: "#c084fc", pts: 10 }, // Purple
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        invaders.push({
          x: startX + c * (invW + gapX),
          y: startY + r * (invH + gapY),
          width: invW,
          height: invH,
          type: r,
          color: typeDefs[r].color,
          glowColor: typeDefs[r].glowColor,
          label: "",
          points: typeDefs[r].pts,
          alive: true,
          animFrame: Math.floor(Math.random() * 60)
        });
      }
    }

    invadersRef.current = invaders;

    // Bunkers CFDT en briques
    const bunkers: Bunker[] = [];
    const numBunkers = 3;
    const bunkerMatrix = [
      "  11111111111111111111111111111111  ",
      " 1111111111111111111111111111111111 ",
      "111111111111111111111111111111111111",
      "111111111111111111111111111111111111",
      "11    1111   111111   11111  1111111",
      "11   11  11  11       11  11   11   ",
      "11   11      11111    11  11   11   ",
      "11   11  11  11       11  11   11   ",
      "11    1111   11       11111    11   "
    ];
    
    const brickW = 4;
    const brickH = 4;
    const bCols = bunkerMatrix[0].length;
    const bRows = bunkerMatrix.length;
    const bunkW = bCols * brickW;
    const bunkH = bRows * brickH;
    
    const spacing = (CANVAS_WIDTH - (numBunkers * bunkW)) / (numBunkers + 1);
    
    for (let i = 0; i < numBunkers; i++) {
      const bx = spacing + i * (bunkW + spacing);
      const by = CANVAS_HEIGHT - 120;
      const bricks: BunkerBrick[] = [];
      
      for (let r = 0; r < bRows; r++) {
        for (let c = 0; c < bCols; c++) {
          if (bunkerMatrix[r][c] === '1') {
            bricks.push({
              x: bx + c * brickW,
              y: by + r * brickH,
              width: brickW,
              height: brickH,
              alive: true
            });
          }
        }
      }
      
      bunkers.push({
        x: bx,
        y: by,
        width: bunkW,
        height: bunkH,
        bricks
      });
    }

    bunkersRef.current = bunkers;
  }, []);

  const startNewGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setWave(1);
    setDoubleShootTimer(0);
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    powerUpsRef.current = [];
    playerRef.current.x = CANVAS_WIDTH / 2 - 25;
    initWave(1);
    setGameState("playing");
  }, [initWave]);

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

  const fireLaser = useCallback(() => {
    if (gameState !== "playing") return;
    const player = playerRef.current;

    const playerLasers = lasersRef.current.filter(l => !l.isEnemy);
    
    // Allow up to 3 active lasers on screen (if double tir, allow up to 4 to ensure clean pairs)
    const limit = doubleShootTimerRef.current > 0 ? 4 : 3;
    if (playerLasers.length >= limit) return;

    if (doubleShootTimerRef.current > 0) {
      // Double tir laser plasma
      lasersRef.current.push({
        x: player.x + 8,
        y: player.y - 4,
        vy: -12,
        isEnemy: false,
        color: "#38bdf8",
        width: 4
      });
      lasersRef.current.push({
        x: player.x + player.width - 12,
        y: player.y - 4,
        vy: -12,
        isEnemy: false,
        color: "#38bdf8",
        width: 4
      });
    } else {
      // Tir simple
      lasersRef.current.push({
        x: player.x + player.width / 2 - 2,
        y: player.y - 4,
        vy: -12,
        isEnemy: false,
        color: "#f43f5e",
        width: 4
      });
    }
    playAudioSound("shoot", isMutedRef.current);
  }, [gameState]);

  // Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.code === "Space") {
        e.preventDefault();
        fireLaser();
      }
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
  }, [fireLaser]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const updateAndDraw = () => {
      frameCountRef.current++;
      ctx.save();

      // Screen shake
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
        shakeRef.current -= 0.5;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // === FOND PARALLAX CYBERSPACE & NÉBULEUSE ===
      ctx.fillStyle = "#020108";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Étoiles scintillantes
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 43) % CANVAS_WIDTH;
        const sy = (i * 71 + frameCountRef.current * 0.2) % CANVAS_HEIGHT;
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin((frameCountRef.current + i * 10) * 0.05));
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, (i % 2) + 1, (i % 2) + 1);
      }
      ctx.globalAlpha = 1;

      if (gameState === "playing") {
        const player = playerRef.current;

        // Déplacement du Joueur
        if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) {
          player.x = Math.max(10, player.x - player.speed);
        }
        if (keysRef.current["ArrowRight"] || keysRef.current["d"]) {
          player.x = Math.min(CANVAS_WIDTH - player.width - 10, player.x + player.speed);
        }

        // Flammes du réacteur (Particules du joueur)
        particlesRef.current.push({
          x: player.x + player.width / 2 + (Math.random() - 0.5) * 8,
          y: player.y + player.height - 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 3 + 2,
          color: Math.random() > 0.5 ? "#38bdf8" : "#f43f5e",
          size: Math.random() * 4 + 2,
          life: 12,
          maxLife: 12
        });

         // Déplacement de la horde d'envahisseurs (S'accélère au fur et à mesure)
         invaderMoveTimerRef.current++;
         const aliveInvaders = invadersRef.current.filter(i => i.alive);
         const aliveCount = aliveInvaders.length;
         const speedRatio = Math.max(0.06, aliveCount / 32);
         const waveSpeedBonus = wave > 1 ? 12 : 0;
         const baseInterval = Math.max(4, 40 - wave * 4 - waveSpeedBonus);
         const timeAcceleration = Math.min(6, Math.floor(frameCountRef.current / 350));
         const moveInterval = Math.max(2, Math.floor(baseInterval * speedRatio) - timeAcceleration);
 
         if (invaderMoveTimerRef.current > moveInterval) {
          invaderMoveTimerRef.current = 0;
          let shiftDown = false;

          for (const inv of aliveInvaders) {
            if (
              (invaderDirRef.current === 1 && inv.x + inv.width >= CANVAS_WIDTH - 20) ||
              (invaderDirRef.current === -1 && inv.x <= 20)
            ) {
              shiftDown = true;
              break;
            }
          }

          if (shiftDown) {
            invaderDirRef.current *= -1;
            aliveInvaders.forEach(inv => {
              inv.y += 16;
              if (inv.y + inv.height >= player.y) {
                setGameState("gameover");
              }
            });
          } else {
            aliveInvaders.forEach(inv => {
              inv.x += invaderDirRef.current * 9;
            });
          }

          // Tirs ennemis périodiques (Plus fréquents et différents en vague 2+)
          const shootProb = wave > 1 ? 0.62 : 0.4;
          if (aliveInvaders.length > 0 && Math.random() < shootProb) {
            const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
            
            if (wave > 1) {
              const shotType = Math.random();
              if (shotType < 0.4) {
                // Tir diagonal vert émeraude
                lasersRef.current.push({
                  x: shooter.x + shooter.width / 2 - 2,
                  y: shooter.y + shooter.height,
                  vx: (Math.random() - 0.5) * 4,
                  vy: 4.5 + wave * 0.8,
                  isEnemy: true,
                  color: "#10b981",
                  width: 5
                });
              } else if (shotType < 0.7) {
                // Tir double fuchsia
                lasersRef.current.push({
                  x: shooter.x + 4,
                  y: shooter.y + shooter.height,
                  vy: 5 + wave * 0.8,
                  isEnemy: true,
                  color: "#d946ef",
                  width: 3
                });
                lasersRef.current.push({
                  x: shooter.x + shooter.width - 8,
                  y: shooter.y + shooter.height,
                  vy: 5 + wave * 0.8,
                  isEnemy: true,
                  color: "#d946ef",
                  width: 3
                });
              } else {
                // Tir rapide jaune
                lasersRef.current.push({
                  x: shooter.x + shooter.width / 2 - 1.5,
                  y: shooter.y + shooter.height,
                  vy: 7.5 + wave * 0.8,
                  isEnemy: true,
                  color: "#fbbf24",
                  width: 3
                });
              }
            } else {
              // Tir classique vague 1
              lasersRef.current.push({
                x: shooter.x + shooter.width / 2 - 2,
                y: shooter.y + shooter.height,
                vy: 5 + wave * 0.8,
                isEnemy: true,
                color: "#ef4444",
                width: 5
              });
            }
          }
        }

        // Mise à jour des Lasers
        lasersRef.current.forEach(laser => {
          laser.y += laser.vy;
          if (laser.vx) {
            laser.x += laser.vx;
          }

          if (!laser.isEnemy) {
            // Collision Laser Joueur -> Envahisseurs
            invadersRef.current.forEach(inv => {
              if (inv.alive && laser.y <= inv.y + inv.height && laser.y >= inv.y && laser.x >= inv.x - 4 && laser.x <= inv.x + inv.width + 4) {
                inv.alive = false;
                laser.y = -999;
                setScore(s => s + inv.points);
                addFloatingText(`+${inv.points}`, inv.x + inv.width / 2, inv.y, inv.glowColor);
                shakeRef.current = Math.max(shakeRef.current, 6);
                playAudioSound("explosion", isMutedRef.current);

                // Spawn falling bonus (22% chance)
                if (Math.random() < 0.22) {
                  powerUpsRef.current.push({
                    id: Date.now() + Math.random(),
                    x: inv.x + inv.width / 2 - 10,
                    y: inv.y + inv.height,
                    vy: 2.2,
                    width: 20,
                    height: 20,
                    alive: true
                  });
                }

                // Explosions lumineuses
                for (let i = 0; i < 18; i++) {
                  particlesRef.current.push({
                    x: inv.x + inv.width / 2,
                    y: inv.y + inv.height / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    color: inv.glowColor,
                    size: Math.random() * 5 + 2,
                    life: 25,
                    maxLife: 25
                  });
                }
              }
            });
          } else {
            // Collision Laser Ennemi -> Joueur
            if (laser.y >= player.y && laser.y <= player.y + player.height && laser.x >= player.x && laser.x <= player.x + player.width) {
              laser.y = 999;
              shakeRef.current = 14;
              playAudioSound("hit", isMutedRef.current);
              setLives(l => {
                const nextL = l - 1;
                if (nextL <= 0) {
                  playAudioSound("gameover", isMutedRef.current);
                  setGameState("gameover");
                }
                return nextL;
              });

              // Particules de dégâts
              for (let i = 0; i < 15; i++) {
                particlesRef.current.push({
                  x: player.x + player.width / 2,
                  y: player.y,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  color: "#ef4444",
                  size: 4,
                  life: 20,
                  maxLife: 20
                });
              }
            }
          }

          // Collision Lasers -> Briques de Dialogue Social (Destructible)
          bunkersRef.current.forEach(b => {
            b.bricks.forEach(brick => {
              if (brick.alive && laser.x >= brick.x && laser.x <= brick.x + brick.width && laser.y >= brick.y && laser.y <= brick.y + brick.height) {
                brick.alive = false;
                laser.y = laser.isEnemy ? 999 : -999;
                playAudioSound("shield", isMutedRef.current);

                // Étincelles du bouclier
                for (let i = 0; i < 6; i++) {
                  particlesRef.current.push({
                    x: laser.x,
                    y: brick.y + (laser.isEnemy ? 0 : brick.height),
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: "#22c55e",
                    size: 3,
                    life: 15,
                    maxLife: 15
                  });
                }
              }
            });
          });
        });

        // Decrement double shoot powerup timer
        if (doubleShootTimerRef.current > 0) {
          setDoubleShootTimer(t => Math.max(0, t - 1));
        }

        // Update Falling PowerUps
        powerUpsRef.current.forEach(pu => {
          pu.y += pu.vy;

          // Check collision with player ship
          if (pu.alive && pu.y + pu.height >= player.y && pu.y <= player.y + player.height && pu.x + pu.width >= player.x && pu.x <= player.x + player.width) {
            pu.alive = false;
            setDoubleShootTimer(600); // 600 frames = 10 seconds @ 60fps
            playAudioSound("shield", isMutedRef.current);
            addFloatingText("TIR DOUBLE ! ⚡", player.x + player.width / 2, player.y - 20, "#38bdf8");

            // Sparkle effects
            for (let i = 0; i < 15; i++) {
              particlesRef.current.push({
                x: pu.x + pu.width / 2,
                y: pu.y + pu.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: "#38bdf8",
                size: Math.random() * 4 + 2,
                life: 20,
                maxLife: 20
              });
            }
          }
        });

        // Cleanup out-of-screen or dead powerups
        powerUpsRef.current = powerUpsRef.current.filter(pu => pu.alive && pu.y < CANVAS_HEIGHT + 20);

        // Nettoyer objets
        lasersRef.current = lasersRef.current.filter(l => l.y > -20 && l.y < CANVAS_HEIGHT + 20);
        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);

        floatingTextsRef.current.forEach(ft => {
          ft.y -= 1.2;
          ft.life--;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

        // Passage à la vague suivante
        if (invadersRef.current.every(i => !i.alive)) {
          playAudioSound("victory", isMutedRef.current);
          setWave(w => {
            const nextW = w + 1;
            initWave(nextW);
            return nextW;
          });
        }
      }

      // === DESSINER LES BOUCLIERS ===
      bunkersRef.current.forEach(b => {
        ctx.save();
        ctx.shadowBlur = 0; // Disable shadow for bricks for performance
        ctx.lineWidth = 1;
        
        // Draw all bases
        ctx.beginPath();
        b.bricks.forEach(brick => {
          if (brick.alive) ctx.rect(brick.x, brick.y, brick.width - 1, brick.height - 1);
        });
        ctx.fillStyle = "#dbb831";
        ctx.fill();
        ctx.strokeStyle = "#b3911b";
        ctx.stroke();
        
        // Draw all textures
        ctx.beginPath();
        b.bricks.forEach(brick => {
          if (brick.alive) ctx.rect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height - 4);
        });
        ctx.fillStyle = "#e5c54d";
        ctx.fill();
        
        ctx.restore();
      });

      // === DESSINER LES ENVAHISSEURS CYBER ===
      const drawPixelSprite = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        sprite: number[][],
        color: string
      ) => {
        const rows = sprite.length;
        const cols = sprite[0].length;
        const pixelW = width / cols;
        const pixelH = height / rows;
        
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (sprite[r][c]) {
              ctx.rect(x + c * pixelW, y + r * pixelH, pixelW, pixelH);
            }
          }
        }
        ctx.fillStyle = color;
        ctx.fill();
        
        // Highlights
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (sprite[r][c]) {
              ctx.rect(x + c * pixelW, y + r * pixelH, pixelW, Math.max(1, pixelH * 0.2));
            }
          }
        }
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fill();
        
        // Shadows
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (sprite[r][c]) {
              ctx.rect(x + c * pixelW, y + r * pixelH + pixelH * 0.8, pixelW, Math.max(1, pixelH * 0.2));
            }
          }
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();
      };

      const squidSprite = [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,0,1,0,0,1,0,1]
      ];
      
      const squidSprite2 = [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,0,0,0,1,0],
        [0,0,1,0,0,1,0,0]
      ];

      const crabSprite = [
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,1],
        [0,0,0,1,1,0,1,1,0,0,0]
      ];
      const crabSprite2 = [
        [0,0,1,0,0,0,0,0,1,0,0],
        [1,0,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,1,1,0,1,1,1,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,1,0,0,0,0,0,0,0,1,0]
      ];

      const octopusSprite = [
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,1,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,1,1,1,0,0,1,1,1,0,0],
        [0,1,1,0,0,1,1,0,0,1,1,0],
        [0,0,1,1,0,0,0,0,1,1,0,0]
      ];
      const octopusSprite2 = [
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,1,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,1,1,0,0,1,1,0,0,0],
        [0,0,1,1,0,1,1,0,1,1,0,0],
        [1,1,0,0,0,0,0,0,0,0,1,1]
      ];

      invadersRef.current.forEach(inv => {
        if (!inv.alive) return;
        inv.animFrame++;
        ctx.save();
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = inv.glowColor;
        
        const isFrame2 = Math.floor(inv.animFrame / 15) % 2 === 0;
        
        let spriteToDraw;
        if (inv.type === 0) {
          spriteToDraw = isFrame2 ? squidSprite2 : squidSprite;
        } else if (inv.type === 1) {
          spriteToDraw = isFrame2 ? crabSprite2 : crabSprite;
        } else {
          spriteToDraw = isFrame2 ? octopusSprite2 : octopusSprite;
        }

        drawPixelSprite(ctx, inv.x, inv.y, inv.width, inv.height, spriteToDraw, inv.color);
        
        // Ecrire RH dans l'ennemi
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // Semi-transparent black for contrast
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RH", inv.x + inv.width / 2, inv.y + inv.height / 2 + 1);

        

        ctx.restore();
      });

      // === DESSINER LES LASERS ===
      lasersRef.current.forEach(l => {
        ctx.save();
        ctx.fillStyle = l.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = l.color;
        ctx.fillRect(l.x, l.y, l.width, 14);

        // Noyau blanc brillant
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(l.x + 1, l.y + 2, l.width - 2, 10);
        ctx.restore();
      });

      // === DESSINER LES PARTICULES ===
      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // === DESSINER LES BONUS TOMBANTS ===
      powerUpsRef.current.forEach(pu => {
        if (!pu.alive) return;
        ctx.save();
        ctx.translate(pu.x + pu.width / 2, pu.y + pu.height / 2);
        
        const angle = (frameCountRef.current * 0.08) % (Math.PI * 2);
        ctx.rotate(angle);

        ctx.fillStyle = "#38bdf8";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#38bdf8";

        ctx.beginPath();
        ctx.roundRect(-pu.width / 2, -pu.height / 2, pu.width, pu.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillText("⚡", 0, 0);

        ctx.restore();
      });

      // === DESSINER LES TEXTES FLOTTANTS ===
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life / 30;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.font = "black 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // === DESSINER LE VAISSEAU DU JOUEUR (Chasseur Cyber Futursiste) ===
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

      // Aura néon sous le vaisseau
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#38bdf8";

      // Wings / Fuselage principal
      ctx.beginPath();
      ctx.moveTo(0, -18); // Nez du vaisseau
      ctx.lineTo(24, 14); // Aile droite
      ctx.lineTo(12, 10); // Renfoncement droit
      ctx.lineTo(0, 14);  // Centre bas
      ctx.lineTo(-12, 10); // Renfoncement gauche
      ctx.lineTo(-24, 14); // Aile gauche
      ctx.closePath();
      ctx.fill();

      // Canon double néon
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-18, -8, 3, 10);
      ctx.fillRect(15, -8, 3, 10);

      // Cockpit en verre lumineux
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore(); // Restore shake translation

      animationId = requestAnimationFrame(updateAndDraw);
    };

    animationId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, wave, initWave]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 flex-wrap gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400 animate-pulse" />
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">
              Space Invaders RH
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-mono font-bold text-slate-300">
              Vague : <span className="text-purple-400 font-black">{wave}</span>
            </span>
            <span className="bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-mono font-bold text-slate-300">
              Vies : <span className="text-rose-400 font-black">{lives}</span>
            </span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-all text-slate-300 hover:text-white"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative w-full max-w-[min(94vw,560px)] aspect-square bg-slate-900/90 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl border border-slate-800 block shadow-inner touch-none select-none"
          />

          {/* HUD Score */}
          {gameState === "playing" && (
            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex flex-col gap-1.5 sm:gap-2 pointer-events-none z-10">
              <div className="bg-slate-950/80 border border-purple-500/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-md text-xs sm:text-sm font-mono font-bold text-purple-300 shadow-xl">
                Score : {score}
              </div>
              {doubleShootTimer > 0 && (
                <div className="flex items-center gap-1.5 bg-cyan-950/90 border border-cyan-400/50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-300 shadow-xl animate-pulse">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  <span>TIR DOUBLE : {(doubleShootTimer / 60).toFixed(1)}s</span>
                </div>
              )}
            </div>
          )}

          {/* Overlay Start */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-4 sm:p-6 text-center z-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 border border-purple-400 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Chasse aux Bureaucraties</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-5 leading-relaxed">
                Dirigez votre chasseur avec les boutons tactiles ou le clavier et éliminez les bugs !
              </p>
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                Lancer l'assaut
              </button>
            </div>
          )}

          {/* Overlay Game Over */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-4 sm:p-6 text-center z-20">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mb-2 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-black text-rose-500 mb-1">DÉBORDEMENT !</h2>
              <p className="text-slate-300 text-xs mb-4">Vos défenses ont été franchies par les anomalies.</p>

              <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl mb-5 w-44 sm:w-48 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Score Final</span>
                <p className="text-3xl sm:text-4xl font-black text-purple-400">{score}</p>
              </div>

              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                Recommencer l'assaut
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex gap-2.5 sm:gap-4 mt-3 sm:mt-4 w-full max-w-[min(94vw,480px)] px-1">
          <button
            onPointerDown={(e) => { e.preventDefault(); keysRef.current["ArrowLeft"] = true; }}
            onPointerUp={() => { keysRef.current["ArrowLeft"] = false; }}
            onPointerLeave={() => { keysRef.current["ArrowLeft"] = false; }}
            className="flex-1 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl flex items-center justify-center active:scale-95 touch-none select-none shadow-lg active:bg-slate-800"
            aria-label="Gauche"
          >
            <LeftIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
          </button>
          <button
            onClick={fireLaser}
            onPointerDown={(e) => { e.preventDefault(); fireLaser(); }}
            className="flex-1.5 py-3.5 sm:py-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 hover:bg-purple-500/40 text-purple-200 font-black rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 uppercase tracking-wider text-xs sm:text-sm shadow-lg active:bg-purple-600/50 touch-none select-none"
            aria-label="Tirer"
          >
            <Crosshair className="w-5 h-5 text-pink-400" /> TIRER
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); keysRef.current["ArrowRight"] = true; }}
            onPointerUp={() => { keysRef.current["ArrowRight"] = false; }}
            onPointerLeave={() => { keysRef.current["ArrowRight"] = false; }}
            className="flex-1 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl flex items-center justify-center active:scale-95 touch-none select-none shadow-lg active:bg-slate-800"
            aria-label="Droite"
          >
            <RightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceInvadersRH;
