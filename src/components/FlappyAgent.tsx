import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Play, Trophy, Feather, Sparkles, Heart, Zap, Shield, Volume2, VolumeX, Coffee, Star } from "lucide-react";

interface FlappyAgentProps {
  onClose: () => void;
}

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 680;

type PipeStyle = "archive" | "tampon" | "carton" | "laser";

interface EnhancedPipe {
  id: number;
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  labelTop: string;
  labelBottom: string;
  style: PipeStyle;
}

type BonusType = "coin" | "ticket" | "vacances" | "cafe" | "shield" | "turbo" | "star";

interface BonusItem {
  id: number;
  type: BonusType;
  x: number;
  y: number;
  collected: boolean;
  rotation: number;
  label: string;
  points: number;
  color: string;
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
  shape?: "circle" | "star" | "square";
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const LABELS_TOP = [
  "CERFA 1607", "ARRÊTÉ RH", "DECRET 2026", "CIRCULAIRE QVT", "NORME CST", 
  "COFFRE RIFSEEP", "DOSSIER TITULARISATION", "AUDIT FINANCIER"
];
const LABELS_BOTTOM = [
  "REFORME 80%", "AUDIT CIG", "INSTANCE CST", "PROMOTION GRADE", "CONTRAT CDI", 
  "PRIME EXCEPTIONNELLE", "FICHE DE PAIE", "CONGÉ BONIFIÉ"
];

// Web Audio API Sound Synthesizer
const playAudioSound = (type: "jump" | "coin" | "powerup" | "hit" | "gameover", isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "jump") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } else if (type === "coin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.22);
    } else if (type === "powerup") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === "hit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else if (type === "gameover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // Ignore audio context errors
  }
};

const FlappyAgent: React.FC<FlappyAgentProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isMuted, setIsMuted] = useState(false);

  // Active Power-ups State
  const [hasShield, setHasShield] = useState(false);
  const [turboTimer, setTurboTimer] = useState(0);
  const [doubleScoreTimer, setDoubleScoreTimer] = useState(0);

  // Agent State
  const agentRef = useRef({
    x: 110,
    y: 310,
    velocity: 0,
    gravity: 0.35,
    jump: -7.8,
    radius: 20,
    rotation: 0
  });

  const pipesRef = useRef<EnhancedPipe[]>([]);
  const bonusesRef = useRef<BonusItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const frameCountRef = useRef(0);
  const invincibleFramesRef = useRef(0);
  const shakeRef = useRef(0);

  // Parallax Buildings & Clouds
  const buildingsRef = useRef<{ x: number; width: number; height: number; color: string }[]>([]);
  const cloudsRef = useRef<{ x: number; y: number; scale: number; speed: number }[]>([]);

  // Initialize Background Scenery
  useEffect(() => {
    const buildings = [];
    const colors = ["#0c1322", "#111827", "#1e1b4b", "#0f172a"];
    let curX = 0;
    while (curX < CANVAS_WIDTH + 300) {
      const w = Math.floor(Math.random() * 45) + 50;
      const h = Math.floor(Math.random() * 140) + 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      buildings.push({ x: curX, width: w, height: h, color });
      curX += w + 6;
    }
    buildingsRef.current = buildings;

    const clouds = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * 220 + 30,
        scale: Math.random() * 0.6 + 0.7,
        speed: Math.random() * 0.4 + 0.2
      });
    }
    cloudsRef.current = clouds;
  }, []);

  const startNewGame = useCallback(() => {
    agentRef.current = {
      x: 110,
      y: 310,
      velocity: 0,
      gravity: 0.35,
      jump: -7.8,
      radius: 20,
      rotation: 0
    };
    pipesRef.current = [];
    bonusesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    frameCountRef.current = 0;
    invincibleFramesRef.current = 0;
    shakeRef.current = 0;
    setScore(0);
    setLives(3);
    setHasShield(false);
    setTurboTimer(0);
    setDoubleScoreTimer(0);
    setGameState("playing");
  }, []);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      life: 35
    });
  };

  const handleJump = useCallback(() => {
    if (gameState === "ready") {
      startNewGame();
      return;
    }
    if (gameState === "playing") {
      agentRef.current.velocity = agentRef.current.jump;
      playAudioSound("jump", isMuted);

      // Jetpack Thruster Burst FX
      const particleColor = turboTimer > 0 ? "#f59e0b" : "#38bdf8";
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: agentRef.current.x - 14,
          y: agentRef.current.y + 10,
          vx: -Math.random() * 4 - 2,
          vy: Math.random() * 5 + 2,
          color: Math.random() > 0.5 ? particleColor : "#fb923c",
          size: Math.random() * 5 + 3,
          life: 20,
          maxLife: 20
        });
      }
    }
  }, [gameState, isMuted, startNewGame, turboTimer]);

  // Keyboard Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleJump]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const updateAndDraw = () => {
      frameCountRef.current++;
      ctx.save();

      // Screen Shake
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
        shakeRef.current -= 0.5;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // === 1. PARALLAX SKYLINE & ATMOSPHERE ===
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, "#090d1a");
      bgGrad.addColorStop(0.35, "#131b2e");
      bgGrad.addColorStop(0.75, "#0d1424");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Nebula Glow
      const moonGrad = ctx.createRadialGradient(CANVAS_WIDTH - 90, 90, 5, CANVAS_WIDTH - 90, 90, 160);
      moonGrad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      moonGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.1)");
      moonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Twinkling Stars
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 53) % CANVAS_WIDTH;
        const sy = (i * 79) % (CANVAS_HEIGHT - 180);
        const alpha = 0.25 + 0.75 * Math.abs(Math.sin((frameCountRef.current + i * 12) * 0.05));
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, (i % 2) + 1.2, (i % 2) + 1.2);
      }
      ctx.globalAlpha = 1;

      // Parallax Clouds
      cloudsRef.current.forEach(c => {
        if (gameState === "playing") {
          c.x -= c.speed;
          if (c.x < -100) c.x = CANVAS_WIDTH + 50;
        }
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 25 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 20 * c.scale, c.y - 10 * c.scale, 20 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 40 * c.scale, c.y, 22 * c.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Parallax City Buildings
      buildingsRef.current.forEach(b => {
        if (gameState === "playing") {
          b.x -= 0.65;
          if (b.x + b.width < 0) {
            b.x = CANVAS_WIDTH + Math.random() * 25;
          }
        }
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, CANVAS_HEIGHT - b.height - 25, b.width, b.height);

        // Windows Pattern
        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
        for (let wy = CANVAS_HEIGHT - b.height - 15; wy < CANVAS_HEIGHT - 35; wy += 15) {
          for (let wx = b.x + 7; wx < b.x + b.width - 9; wx += 11) {
            if ((wx + wy) % 4 !== 0) {
              ctx.fillRect(wx, wy, 4, 7);
            }
          }
        }
      });


      // === 2. GAME LOGIC UPDATES ===
      if (gameState === "playing") {
        if (invincibleFramesRef.current > 0) invincibleFramesRef.current--;
        if (turboTimer > 0) setTurboTimer(t => t - 1);
        if (doubleScoreTimer > 0) setDoubleScoreTimer(t => t - 1);

        const agent = agentRef.current;

        // Auto-pilot Turbo mode elevation
        if (turboTimer > 0) {
          agent.velocity = -0.8;
        } else {
          agent.velocity += agent.gravity;
        }

        agent.y += agent.velocity;
        agent.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, agent.velocity * 0.07));

        // Jetpack Exhaust Particles
        particlesRef.current.push({
          x: agent.x - 14,
          y: agent.y + 4,
          vx: -Math.random() * 2.5 - 1,
          vy: (Math.random() - 0.5) * 2,
          color: turboTimer > 0 ? "#f59e0b" : Math.random() > 0.4 ? "#38bdf8" : "#e0f2fe",
          size: Math.random() * 3.5 + 1.5,
          life: 16,
          maxLife: 16
        });

        // Ceiling & Floor Bounding
        if (agent.y - agent.radius < 0) {
          agent.y = agent.radius;
          agent.velocity = 0;
        }
        if (agent.y + agent.radius > CANVAS_HEIGHT - 25) {
          if (invincibleFramesRef.current === 0 && turboTimer === 0) {
            playAudioSound("hit", isMuted);
            shakeRef.current = 12;
            if (hasShield) {
              setHasShield(false);
              invincibleFramesRef.current = 60;
              agent.velocity = -6;
              addFloatingText("BOUCLIER BRISÉ !", agent.x, agent.y - 20, "#38bdf8");
            } else {
              setLives(l => {
                const nextL = l - 1;
                if (nextL <= 0) {
                  playAudioSound("gameover", isMuted);
                  setGameState("gameover");
                } else {
                  invincibleFramesRef.current = 60;
                  agent.y = 310;
                  agent.velocity = -5;
                }
                return nextL;
              });
            }
          }
        }

        // Spawn Obstacles & Collectibles
        if (frameCountRef.current % 120 === 0) {
          const gap = 220; // Generous 220px gap
          const minHeight = 70;
          const maxHeight = CANVAS_HEIGHT - gap - minHeight - 60;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          const bottomHeight = CANVAS_HEIGHT - topHeight - gap;

          const styles: PipeStyle[] = ["archive", "tampon", "carton", "laser"];
          const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

          pipesRef.current.push({
            id: Date.now() + Math.random(),
            x: CANVAS_WIDTH,
            topHeight,
            bottomHeight,
            passed: false,
            labelTop: LABELS_TOP[Math.floor(Math.random() * LABELS_TOP.length)],
            labelBottom: LABELS_BOTTOM[Math.floor(Math.random() * LABELS_BOTTOM.length)],
            style: selectedStyle
          });

          // Spawn Rich Variety of Collectibles inside gap
          const bonusRoll = Math.random();
          let bType: BonusType = "coin";
          let bLabel = "+5 PTS";
          let bPts = 5;
          let bColor = "#fbbf24";

          if (bonusRoll < 0.35) {
            bType = "coin"; bLabel = "+5 PTS"; bPts = 5; bColor = "#fbbf24";
          } else if (bonusRoll < 0.55) {
            bType = "ticket"; bLabel = "TITRE RESTO +10"; bPts = 10; bColor = "#34d399";
          } else if (bonusRoll < 0.70) {
            bType = "vacances"; bLabel = "VACANCES +15"; bPts = 15; bColor = "#38bdf8";
          } else if (bonusRoll < 0.82) {
            bType = "cafe"; bLabel = "PAUSE CAFÉ +20"; bPts = 20; bColor = "#a7f3d0";
          } else if (bonusRoll < 0.90 && !hasShield) {
            bType = "shield"; bLabel = "BOUCLIER QVT"; bPts = 10; bColor = "#60a5fa";
          } else if (bonusRoll < 0.96) {
            bType = "turbo"; bLabel = "TURBO JETPACK ⚡"; bPts = 15; bColor = "#f59e0b";
          } else {
            bType = "star"; bLabel = "AGENT STAR x2 🌟"; bPts = 25; bColor = "#f43f5e";
          }

          bonusesRef.current.push({
            id: Date.now() + Math.random(),
            type: bType,
            x: CANVAS_WIDTH + 35,
            y: topHeight + gap / 2 + (Math.random() - 0.5) * 40,
            collected: false,
            rotation: 0,
            label: bLabel,
            points: bPts,
            color: bColor
          });
        }

        // Move Pipes & Check Collision
        const pipeSpeed = 2.3;
        pipesRef.current.forEach(p => {
          p.x -= pipeSpeed;

          // Score Pass
          if (!p.passed && p.x < agent.x) {
            p.passed = true;
            const multiplier = doubleScoreTimer > 0 ? 2 : 1;
            const ptsGained = 1 * multiplier;
            addFloatingText(`+${ptsGained}`, agent.x, agent.y - 20, doubleScoreTimer > 0 ? "#f43f5e" : "#38bdf8");
            playAudioSound("coin", isMuted);
            setScore(s => {
              const newS = s + ptsGained;
              setHighScore(h => Math.max(h, newS));
              return newS;
            });
          }

          // Collision Check
          if (invincibleFramesRef.current === 0 && turboTimer === 0) {
            const hitTop = agent.x + agent.radius > p.x && agent.x - agent.radius < p.x + 65 && agent.y - agent.radius < p.topHeight;
            const hitBottom = agent.x + agent.radius > p.x && agent.x - agent.radius < p.x + 65 && agent.y + agent.radius > CANVAS_HEIGHT - p.bottomHeight;

            if (hitTop || hitBottom) {
              playAudioSound("hit", isMuted);
              shakeRef.current = 14;
              if (hasShield) {
                setHasShield(false);
                invincibleFramesRef.current = 60;
                agent.velocity = -6;
                addFloatingText("BOUCLIER PROTECTEUR !", agent.x, agent.y - 20, "#38bdf8");
              } else {
                setLives(l => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    playAudioSound("gameover", isMuted);
                    setGameState("gameover");
                  } else {
                    invincibleFramesRef.current = 60;
                    agent.velocity = -6;
                  }
                  return nextL;
                });
              }
            }
          }
        });

        // Move & Collect Bonus Items
        bonusesRef.current.forEach(b => {
          b.x -= pipeSpeed;
          b.rotation += 0.06;

          // Turbo Magnet Effect
          if (turboTimer > 0 && !b.collected) {
            const dx = agent.x - b.x;
            const dy = agent.y - b.y;
            b.x += dx * 0.08;
            b.y += dy * 0.08;
          }

          if (!b.collected) {
            const dist = Math.hypot(agent.x - b.x, agent.y - b.y);
            if (dist < agent.radius + 16) {
              b.collected = true;
              const multiplier = doubleScoreTimer > 0 ? 2 : 1;
              const earnedPts = b.points * multiplier;

              addFloatingText(b.label, b.x, b.y, b.color);
              setScore(s => s + earnedPts);

              if (b.type === "shield") {
                setHasShield(true);
                playAudioSound("powerup", isMuted);
              } else if (b.type === "turbo") {
                setTurboTimer(180); // 3 sec turbo
                playAudioSound("powerup", isMuted);
              } else if (b.type === "star") {
                setDoubleScoreTimer(300); // 5 sec double score
                playAudioSound("powerup", isMuted);
              } else {
                playAudioSound("coin", isMuted);
              }

              // Sparkle Burst
              for (let i = 0; i < 16; i++) {
                particlesRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: b.color,
                  size: Math.random() * 4 + 2,
                  life: 22,
                  maxLife: 22
                });
              }
            }
          }
        });

        // Cleanup
        pipesRef.current = pipesRef.current.filter(p => p.x > -80);
        bonusesRef.current = bonusesRef.current.filter(b => b.x > -40);

        particlesRef.current.forEach(pt => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
        });
        particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

        floatingTextsRef.current.forEach(ft => {
          ft.y -= 1.2;
          ft.life--;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);
      }


      // === 3. RENDER OBSTACLES (4 RICH ARCHITECTURAL STYLES) ===
      pipesRef.current.forEach(p => {
        const pipeW = 65;

        ctx.save();
        if (p.style === "tampon") {
          // Stamp/Seal Style (Red/Gold)
          const topGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
          topGrad.addColorStop(0, "#7f1d1d"); topGrad.addColorStop(0.5, "#b91c1c"); topGrad.addColorStop(1, "#450a0a");
          ctx.fillStyle = topGrad;
          ctx.shadowBlur = 12; ctx.shadowColor = "#ef4444";
          ctx.fillRect(p.x, 0, pipeW, p.topHeight);
          ctx.fillRect(p.x, CANVAS_HEIGHT - p.bottomHeight, pipeW, p.bottomHeight);

          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(p.x - 3, p.topHeight - 16, pipeW + 6, 16);
          ctx.fillRect(p.x - 3, CANVAS_HEIGHT - p.bottomHeight, pipeW + 6, 16);
        } else if (p.style === "carton") {
          // Carton/Boxes Style (Orange/Brown)
          const topGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
          topGrad.addColorStop(0, "#78350f"); topGrad.addColorStop(0.5, "#d97706"); topGrad.addColorStop(1, "#451a03");
          ctx.fillStyle = topGrad;
          ctx.shadowBlur = 10; ctx.shadowColor = "#f59e0b";
          ctx.fillRect(p.x, 0, pipeW, p.topHeight);
          ctx.fillRect(p.x, CANVAS_HEIGHT - p.bottomHeight, pipeW, p.bottomHeight);

          // Caution Stripes
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(p.x - 2, p.topHeight - 14, pipeW + 4, 14);
          ctx.fillRect(p.x - 2, CANVAS_HEIGHT - p.bottomHeight, pipeW + 4, 14);
        } else if (p.style === "laser") {
          // Laser Cyber Gate Style (Silver/Violet)
          const topGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
          topGrad.addColorStop(0, "#4c1d95"); topGrad.addColorStop(0.5, "#7c3aed"); topGrad.addColorStop(1, "#2e1065");
          ctx.fillStyle = topGrad;
          ctx.shadowBlur = 15; ctx.shadowColor = "#a855f7";
          ctx.fillRect(p.x, 0, pipeW, p.topHeight);
          ctx.fillRect(p.x, CANVAS_HEIGHT - p.bottomHeight, pipeW, p.bottomHeight);

          ctx.fillStyle = "#c084fc";
          ctx.fillRect(p.x - 4, p.topHeight - 18, pipeW + 8, 18);
          ctx.fillRect(p.x - 4, CANVAS_HEIGHT - p.bottomHeight, pipeW + 8, 18);
        } else {
          // Classic Archive Tower Style (Slate/Cyan)
          const topGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
          topGrad.addColorStop(0, "#1e293b"); topGrad.addColorStop(0.5, "#334155"); topGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = topGrad;
          ctx.shadowBlur = 14; ctx.shadowColor = "#38bdf8";
          ctx.fillRect(p.x, 0, pipeW, p.topHeight);
          ctx.fillRect(p.x, CANVAS_HEIGHT - p.bottomHeight, pipeW, p.bottomHeight);

          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(p.x - 3, p.topHeight - 16, pipeW + 6, 16);
          ctx.fillRect(p.x - 3, CANVAS_HEIGHT - p.bottomHeight, pipeW + 6, 16);
        }

        // Pipe Warning Light & Labels
        const lampAlpha = 0.5 + 0.5 * Math.sin(frameCountRef.current * 0.15);
        ctx.fillStyle = `rgba(239, 68, 68, ${lampAlpha})`;
        ctx.beginPath(); ctx.arc(p.x + pipeW / 2, p.topHeight - 8, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x + pipeW / 2, CANVAS_HEIGHT - p.bottomHeight + 8, 4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(p.labelTop, p.x + pipeW / 2, Math.max(22, p.topHeight / 2));
        ctx.fillText(p.labelBottom, p.x + pipeW / 2, CANVAS_HEIGHT - Math.max(22, p.bottomHeight / 2));

        ctx.restore();
      });


      // === 4. RENDER COLLECTIBLES & POWERUPS ===
      bonusesRef.current.forEach(b => {
        if (b.collected) return;
        ctx.save();
        ctx.translate(b.x, b.y);

        const scaleX = Math.abs(Math.cos(b.rotation));

        if (b.type === "shield") {
          // Shield Blue Orb
          ctx.fillStyle = "#3b82f6"; ctx.shadowBlur = 18; ctx.shadowColor = "#60a5fa";
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🛡️", 0, 0);
        } else if (b.type === "turbo") {
          // Lightning Turbo Bolt
          ctx.fillStyle = "#f59e0b"; ctx.shadowBlur = 20; ctx.shadowColor = "#fbbf24";
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("⚡", 0, 0);
        } else if (b.type === "star") {
          // Double Points Star
          ctx.fillStyle = "#f43f5e"; ctx.shadowBlur = 20; ctx.shadowColor = "#fb7185";
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🌟", 0, 0);
        } else if (b.type === "ticket") {
          // Titre Resto Ticket
          ctx.fillStyle = "#10b981"; ctx.shadowBlur = 14; ctx.shadowColor = "#34d399";
          ctx.fillRect(-12 * scaleX, -8, 24 * scaleX, 16);
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🎫", 0, 0);
        } else if (b.type === "vacances") {
          // Chèques Vacances
          ctx.fillStyle = "#0284c7"; ctx.shadowBlur = 14; ctx.shadowColor = "#38bdf8";
          ctx.fillRect(-12 * scaleX, -8, 24 * scaleX, 16);
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🏖️", 0, 0);
        } else if (b.type === "cafe") {
          // Pause Café
          ctx.fillStyle = "#14b8a6"; ctx.shadowBlur = 14; ctx.shadowColor = "#2dd4bf";
          ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("☕", 0, 0);
        } else {
          // Gold Prime Coin
          ctx.fillStyle = "#fbbf24"; ctx.shadowBlur = 16; ctx.shadowColor = "#f59e0b";
          ctx.beginPath(); ctx.ellipse(0, 0, 13 * scaleX, 13, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(-3 * scaleX, -3, 4 * scaleX, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#78350f"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("€", 0, 1);
        }

        ctx.restore();
      });


      // === 5. RENDER PARTICLES & FLOATING TEXTS ===
      particlesRef.current.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 8; ctx.shadowColor = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life / 35;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 12; ctx.shadowColor = ft.color;
        ctx.font = "black 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });


      // === 6. RENDER AGENT (CYBER JETPACK AVIATOR 2.5D) ===
      const agent = agentRef.current;
      const isBlinking = invincibleFramesRef.current > 0 && Math.floor(invincibleFramesRef.current / 5) % 2 === 0;

      if (!isBlinking) {
        ctx.save();
        ctx.translate(agent.x, agent.y);
        ctx.rotate(agent.rotation);

        // Shield Energy Bubble
        if (hasShield) {
          ctx.fillStyle = "rgba(59, 130, 246, 0.25)";
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 18; ctx.shadowColor = "#3b82f6";
          ctx.beginPath(); ctx.arc(0, 0, agent.radius + 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        // Turbo Golden Glow
        if (turboTimer > 0) {
          ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
          ctx.shadowBlur = 25; ctx.shadowColor = "#f59e0b";
          ctx.beginPath(); ctx.arc(0, 0, agent.radius + 12, 0, Math.PI * 2); ctx.fill();
        }

        // Jetpack Backpack
        ctx.fillStyle = "#475569";
        ctx.fillRect(-17, -10, 8, 20);
        ctx.fillStyle = turboTimer > 0 ? "#f59e0b" : "#38bdf8";
        ctx.shadowBlur = 10; ctx.shadowColor = turboTimer > 0 ? "#f59e0b" : "#38bdf8";
        ctx.fillRect(-19, -6, 4, 12);

        // Suit Body
        ctx.fillStyle = "#0284c7";
        ctx.shadowBlur = 16; ctx.shadowColor = "#38bdf8";
        ctx.beginPath(); ctx.arc(0, 0, agent.radius, 0, Math.PI * 2); ctx.fill();

        // Flying Necktie
        const tieAngle = Math.sin(frameCountRef.current * 0.25) * 0.35 + 0.35;
        ctx.save();
        ctx.rotate(tieAngle);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-2, 4, 4, 15);
        ctx.restore();

        // Aviator Goggles
        ctx.fillStyle = "#0f172a";
        ctx.beginPath(); ctx.roundRect(-4, -8, 18, 9, 3); ctx.fill();

        ctx.fillStyle = turboTimer > 0 ? "#fbbf24" : "#38bdf8";
        ctx.shadowBlur = 8; ctx.shadowColor = turboTimer > 0 ? "#fbbf24" : "#38bdf8";
        ctx.fillRect(-2, -6, 14, 5);

        ctx.restore();
      }

      // High-Tech Cyber Ground
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 12; ctx.shadowColor = "#38bdf8";
      ctx.fillRect(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 3);

      ctx.restore(); // Restore shake
      animationId = requestAnimationFrame(updateAndDraw);
    };

    animationId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, doubleScoreTimer, hasShield, isMuted, turboTimer]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full flex justify-between items-center mb-4 flex-wrap gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-full font-bold transition-all text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            Retour
          </button>

          <div className="flex items-center gap-2">
            <Feather className="w-6 h-6 text-cyan-400 animate-bounce" />
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Flappy Agent
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-300 transition-all"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Lives Indicator */}
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
              Record : <span className="text-amber-400 font-black">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Active Power-up Badges Bar */}
        {(hasShield || turboTimer > 0 || doubleScoreTimer > 0) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
            {hasShield && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Bouclier Actif
              </span>
            )}
            {turboTimer > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Turbo Autopilot ({Math.ceil(turboTimer / 60)}s)
              </span>
            )}
            {doubleScoreTimer > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <Star className="w-3.5 h-3.5 text-rose-400" /> Points x2 ({Math.ceil(doubleScoreTimer / 60)}s)
              </span>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div 
          className="relative bg-slate-900/90 border-2 border-cyan-500/30 rounded-3xl p-3 shadow-[0_0_50px_rgba(6,182,212,0.25)] cursor-pointer"
          onClick={handleJump}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-2xl border border-slate-800 block shadow-inner"
          />

          {/* HUD Score */}
          {gameState === "playing" && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-cyan-500/40 px-7 py-2 rounded-full backdrop-blur-md text-3xl font-black text-cyan-400 shadow-2xl pointer-events-none flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              {score}
            </div>
          )}

          {/* Overlay Start */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Feather className="w-8 h-8 text-cyan-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Envol de Carrière</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-4 leading-relaxed">
                Appuyez sur <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-cyan-400">ESPACE</kbd> ou touchez l'écran pour voler. Allumez votre jetpack et esquivez les tours d'archives RH !
              </p>

              {/* Bonus Items Guide */}
              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl mb-6 max-w-xs">
                <div className="flex items-center gap-1 text-amber-300">🪙 Prime (+5)</div>
                <div className="flex items-center gap-1 text-emerald-300">🎫 Resto (+10)</div>
                <div className="flex items-center gap-1 text-sky-300">🏖️ Vacances (+15)</div>
                <div className="flex items-center gap-1 text-teal-300">☕ Café (+20)</div>
                <div className="flex items-center gap-1 text-blue-300">🛡️ Bouclier</div>
                <div className="flex items-center gap-1 text-amber-400">⚡ Turbo</div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); startNewGame(); }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                Décoller au Jetpack
              </button>
            </div>
          )}

          {/* Overlay Game Over */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
              <h2 className="text-3xl font-black text-rose-500 mb-1">FIN DE PARCOURS !</h2>
              <p className="text-slate-300 text-xs mb-4">Vos opportunités de carrière ont été consommées.</p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 w-48 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Score Obtenu</span>
                <p className="text-4xl font-black text-cyan-400">{score}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); startNewGame(); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                Recommencer l'envol
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlappyAgent;
