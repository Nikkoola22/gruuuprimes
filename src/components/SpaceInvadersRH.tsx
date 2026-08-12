import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Play, Trophy, Rocket, Sparkles, Shield, ArrowLeft as LeftIcon, ArrowRight as RightIcon, Crosshair, Zap, Volume2, VolumeX } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const invaderDirRef = useRef<number>(1);
  const invaderMoveTimerRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);

  // Initialiser les envahisseurs et boucliers
  const initWave = useCallback((currentWave: number) => {
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
      { color: "#ef4444", glowColor: "#f87171", label: "BUG PAIE", pts: 40 },
      { color: "#f59e0b", glowColor: "#fbbf24", label: "RETARD", pts: 30 },
      { color: "#a855f7", glowColor: "#c084fc", label: "CERFA 404", pts: 20 },
      { color: "#06b6d4", glowColor: "#22d3ee", label: "REFUS", pts: 10 },
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
          label: typeDefs[r].label,
          points: typeDefs[r].pts,
          alive: true,
          animFrame: Math.floor(Math.random() * 60)
        });
      }
    }
    invadersRef.current = invaders;

    // Dialogue Social Bunkers with destructible block grid
    const bunkers: Bunker[] = [];
    const numBunkers = 3;
    const bunkW = 96; // Slightly wider for better protection
    const bunkH = 28;
    const bunkGap = (CANVAS_WIDTH - (numBunkers * bunkW)) / (numBunkers + 1);

    const brickCols = 8;
    const brickRows = 4;
    const brickW = bunkW / brickCols;
    const brickH = bunkH / brickRows;

    for (let i = 0; i < numBunkers; i++) {
      const startX = bunkGap + i * (bunkW + bunkGap);
      const startY = CANVAS_HEIGHT - 140;
      const bricks: BunkerBrick[] = [];

      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          // Hollow arch at bottom-middle of each bunker
          const isArch = r >= 2 && c >= 2 && c <= 5;
          if (!isArch) {
            bricks.push({
              x: startX + c * brickW,
              y: startY + r * brickH,
              width: brickW,
              height: brickH,
              alive: true
            });
          }
        }
      }

      bunkers.push({
        x: startX,
        y: startY,
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
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
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
    if (playerLasers.length >= 3) return;

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
      const spaceGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      spaceGrad.addColorStop(0, "#03040c");
      spaceGrad.addColorStop(0.5, "#0b061e");
      spaceGrad.addColorStop(1, "#020108");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Halo nébuleuse violette
      const nebula1 = ctx.createRadialGradient(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.4, 10, CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.4, 280);
      nebula1.addColorStop(0, "rgba(168,85,247,0.12)");
      nebula1.addColorStop(1, "transparent");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Halo nébuleuse bleue
      const nebula2 = ctx.createRadialGradient(CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.7, 10, CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.7, 240);
      nebula2.addColorStop(0, "rgba(56,189,248,0.10)");
      nebula2.addColorStop(1, "transparent");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grille cyber perspective (Lignes de sol)
      ctx.strokeStyle = "rgba(168, 85, 247, 0.08)";
      ctx.lineWidth = 1;
      const gridOffset = (frameCountRef.current * 0.5) % 40;
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset);
        ctx.lineTo(CANVAS_WIDTH, y + gridOffset);
        ctx.stroke();
      }
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

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
         const baseInterval = Math.max(8, 40 - wave * 4);
         const timeAcceleration = Math.min(6, Math.floor(frameCountRef.current / 350));
         const moveInterval = Math.max(2, Math.floor(baseInterval * speedRatio) - timeAcceleration);
 
         if (invaderMoveTimerRef.current > moveInterval) {
          invaderMoveTimerRef.current = 0;
          let shiftDown = false;

          for (let inv of aliveInvaders) {
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

          // Tirs ennemis périodiques
          if (aliveInvaders.length > 0 && Math.random() < 0.4) {
            const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
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

        // Mise à jour des Lasers
        lasersRef.current.forEach(laser => {
          laser.y += laser.vy;

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

      // === DESSINER LES BOUCLIERS (Dialogue Social Hexagonal & Destructible) ===
      bunkersRef.current.forEach(b => {
        b.bricks.forEach(brick => {
          if (!brick.alive) return;
          ctx.save();
          ctx.fillStyle = "rgba(34, 197, 94, 0.85)";
          ctx.strokeStyle = "rgba(74, 222, 128, 1)";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#22c55e";
          ctx.lineWidth = 1;

          // Draw individual brick block
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.width - 1, brick.height - 1);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        // Overlay text "DIALOGUE SOCIAL" in center if the bunker is still standing (at least some bricks alive)
        const aliveCount = b.bricks.filter(brick => brick.alive).length;
        if (aliveCount > 4) {
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#000000";
          ctx.fillText("DIALOGUE SOCIAL", b.x + b.width / 2, b.y + b.height / 2);
          ctx.restore();
        }
      });

      // === DESSINER LES ENVAHISSEURS CYBER ===
      invadersRef.current.forEach(inv => {
        if (!inv.alive) return;
        inv.animFrame++;
        ctx.save();
        ctx.translate(inv.x + inv.width / 2, inv.y + inv.height / 2);

        const pulse = Math.sin(inv.animFrame * 0.1) * 2;

        ctx.fillStyle = inv.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = inv.glowColor;

        if (inv.type === 0) {
          // TYPE 0 : Cyber Skull Bug Paie (Rouge)
          ctx.beginPath();
          ctx.arc(0, -2, 12 + pulse * 0.5, Math.PI, 0);
          ctx.lineTo(10, 8);
          ctx.lineTo(-10, 8);
          ctx.closePath();
          ctx.fill();

          // Yeux lumineux
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-6, -4, 4, 4);
          ctx.fillRect(2, -4, 4, 4);
        } else if (inv.type === 1) {
          // TYPE 1 : Mecha Chrono Retard (Doré)
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(14, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(-14, 0);
          ctx.closePath();
          ctx.fill();

          // Noyau d'énergie
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 4 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (inv.type === 2) {
          // TYPE 2 : Portails Cerfa 404 (Violet)
          ctx.beginPath();
          ctx.roundRect(-14, -10, 28, 20, 6);
          ctx.fill();

          // Anneaux de distorsion
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 6 + pulse, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // TYPE 3 : Plasma Orb Refus (Cyan)
          ctx.beginPath();
          ctx.arc(0, 0, 11 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Satellites tournants
          const angle = inv.animFrame * 0.08;
          const satX = Math.cos(angle) * 16;
          const satY = Math.sin(angle) * 16;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(satX, satY, 3, 0, Math.PI * 2);
          ctx.arc(-satX, -satY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Libellé de texte
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(inv.label, 0, 12);
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
        <div className="relative bg-slate-900/90 border-2 border-purple-500/30 rounded-3xl p-3 shadow-[0_0_50px_rgba(168,85,247,0.25)]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-2xl border border-slate-800 block shadow-inner"
          />

          {/* HUD Score */}
          {gameState === "playing" && (
            <div className="absolute top-6 left-6 bg-slate-950/70 border border-purple-500/30 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-mono font-bold text-purple-300 shadow-xl pointer-events-none">
              Score : {score}
            </div>
          )}

          {/* Overlay Start */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 bg-purple-500/20 border border-purple-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Rocket className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Chasse aux Bureaucraties</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
                Dirigez votre chasseur spatial avec les flèches et désintégrez les vagues de bugs avec la touche <kbd className="px-2 py-1 bg-slate-800 rounded text-purple-400">ESPACE</kbd> !
              </p>
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                Lancer l'assaut
              </button>
            </div>
          )}

          {/* Overlay Game Over */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
              <h2 className="text-3xl font-black text-rose-500 mb-1">DÉBORDEMENT BUREAUCRATIQUE !</h2>
              <p className="text-slate-300 text-xs mb-4">Vos défenses ont été franchies par les anomalies.</p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 w-48 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Score Final</span>
                <p className="text-4xl font-black text-purple-400">{score}</p>
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
        <div className="flex gap-4 mt-4 w-full max-w-[400px]">
          <button
            onPointerDown={() => { keysRef.current["ArrowLeft"] = true; }}
            onPointerUp={() => { keysRef.current["ArrowLeft"] = false; }}
            className="flex-1 py-4 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl flex items-center justify-center active:scale-95"
          >
            <LeftIcon className="w-6 h-6 text-purple-400" />
          </button>
          <button
            onClick={fireLaser}
            className="flex-1 py-4 bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-300 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider text-xs shadow-lg"
          >
            <Crosshair className="w-5 h-5 text-pink-400" /> Tir Double
          </button>
          <button
            onPointerDown={() => { keysRef.current["ArrowRight"] = true; }}
            onPointerUp={() => { keysRef.current["ArrowRight"] = false; }}
            className="flex-1 py-4 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl flex items-center justify-center active:scale-95"
          >
            <RightIcon className="w-6 h-6 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceInvadersRH;
