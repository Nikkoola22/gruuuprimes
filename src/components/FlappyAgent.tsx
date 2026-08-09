import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Play, Trophy, Feather, Sparkles, Heart, Zap } from "lucide-react";

interface FlappyAgentProps {
  onClose: () => void;
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 650;

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  labelTop: string;
  labelBottom: string;
}

interface Bonus {
  x: number;
  y: number;
  collected: boolean;
  rotation: number;
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

const LABELS_TOP = ["CERFA 1607", "ARRÊTÉ RH", "DECRET 2026", "CIRCULAIRE", "NORME QVT"];
const LABELS_BOTTOM = ["REFORME 80%", "AUDIT RH", "INSTANCE CST", "PROMOTION", "CONTRAT CDI"];

const FlappyAgent: React.FC<FlappyAgentProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Agent State
  const agentRef = useRef({
    x: 110,
    y: 300,
    velocity: 0,
    gravity: 0.35,
    jump: -7.6,
    radius: 19,
    rotation: 0
  });

  const pipesRef = useRef<Pipe[]>([]);
  const bonusesRef = useRef<Bonus[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const frameCountRef = useRef(0);
  const invincibleFramesRef = useRef(0);
  const shakeRef = useRef(0);

  // Gratte-ciels en arrière-plan parallaxe
  const buildingsRef = useRef<{ x: number; width: number; height: number }[]>([]);

  // Initialiser les bâtiments
  useEffect(() => {
    const buildings = [];
    let curX = 0;
    while (curX < CANVAS_WIDTH + 200) {
      const w = Math.floor(Math.random() * 40) + 45;
      const h = Math.floor(Math.random() * 120) + 90;
      buildings.push({ x: curX, width: w, height: h });
      curX += w + 8;
    }
    buildingsRef.current = buildings;
  }, []);

  const startNewGame = useCallback(() => {
    agentRef.current = {
      x: 110,
      y: 300,
      velocity: 0,
      gravity: 0.35,
      jump: -7.6,
      radius: 19,
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
    setGameState("playing");
  }, []);

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

  const handleJump = useCallback(() => {
    if (gameState === "ready") {
      startNewGame();
      return;
    }
    if (gameState === "playing") {
      agentRef.current.velocity = agentRef.current.jump;

      // Flammes et réacteurs sous le Jetpack
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: agentRef.current.x - 12,
          y: agentRef.current.y + 12,
          vx: -Math.random() * 3 - 2,
          vy: Math.random() * 4 + 2,
          color: Math.random() > 0.5 ? "#38bdf8" : "#fb923c",
          size: Math.random() * 5 + 3,
          life: 18,
          maxLife: 18
        });
      }
    }
  }, [gameState, startNewGame]);

  // Événements Clavier
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

      // Screen shake
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
        shakeRef.current -= 0.5;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // === FOND ANIME : CIEL NIGHT SKYLINE ===
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, "#09051d");
      bgGrad.addColorStop(0.4, "#1e1b4b");
      bgGrad.addColorStop(0.85, "#0b0f19");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Halo lune / nébuleuse
      const moonGrad = ctx.createRadialGradient(CANVAS_WIDTH - 80, 80, 5, CANVAS_WIDTH - 80, 80, 140);
      moonGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
      moonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Étoiles de fond
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 35; i++) {
        const sx = (i * 47) % CANVAS_WIDTH;
        const sy = (i * 73) % (CANVAS_HEIGHT - 150);
        const alpha = 0.2 + 0.8 * Math.abs(Math.sin((frameCountRef.current + i * 15) * 0.04));
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, (i % 2) + 1, (i % 2) + 1);
      }
      ctx.globalAlpha = 1;

      // Parallaxe Gratte-Ciels d'arrière-plan
      ctx.fillStyle = "#0c1322";
      buildingsRef.current.forEach(b => {
        if (gameState === "playing") {
          b.x -= 0.6; // Défilement très lent
          if (b.x + b.width < 0) {
            b.x = CANVAS_WIDTH + Math.random() * 20;
          }
        }
        ctx.fillRect(b.x, CANVAS_HEIGHT - b.height - 20, b.width, b.height);

        // Fenêtres éclairées
        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
        for (let wy = CANVAS_HEIGHT - b.height - 10; wy < CANVAS_HEIGHT - 30; wy += 14) {
          for (let wx = b.x + 6; wx < b.x + b.width - 8; wx += 10) {
            if ((wx + wy) % 3 === 0) {
              ctx.fillRect(wx, wy, 4, 6);
            }
          }
        }
        ctx.fillStyle = "#0c1322";
      });

      if (gameState === "playing") {
        if (invincibleFramesRef.current > 0) {
          invincibleFramesRef.current--;
        }

        const agent = agentRef.current;

        // Physique de l'Agent
        agent.velocity += agent.gravity;
        agent.y += agent.velocity;
        agent.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, agent.velocity * 0.07));

        // Particules Jetpack en continu
        particlesRef.current.push({
          x: agent.x - 14,
          y: agent.y + 4,
          vx: -Math.random() * 2 - 1,
          vy: (Math.random() - 0.5) * 2,
          color: Math.random() > 0.4 ? "#38bdf8" : "#e0f2fe",
          size: Math.random() * 3 + 1.5,
          life: 14,
          maxLife: 14
        });

        // Plafond & Sol
        if (agent.y - agent.radius < 0) {
          agent.y = agent.radius;
          agent.velocity = 0;
        }
        if (agent.y + agent.radius > CANVAS_HEIGHT - 20) {
          if (invincibleFramesRef.current === 0) {
            shakeRef.current = 12;
            setLives(l => {
              const nextL = l - 1;
              if (nextL <= 0) {
                setGameState("gameover");
              } else {
                invincibleFramesRef.current = 60;
                agent.y = 300;
                agent.velocity = -5;
              }
              return nextL;
            });
          }
        }

        // Spawn des obstacles (Ouverture large 220px)
        if (frameCountRef.current % 125 === 0) {
          const gap = 220;
          const minHeight = 70;
          const maxHeight = CANVAS_HEIGHT - gap - minHeight - 60;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          const bottomHeight = CANVAS_HEIGHT - topHeight - gap;

          pipesRef.current.push({
            x: CANVAS_WIDTH,
            topHeight,
            bottomHeight,
            passed: false,
            labelTop: LABELS_TOP[Math.floor(Math.random() * LABELS_TOP.length)],
            labelBottom: LABELS_BOTTOM[Math.floor(Math.random() * LABELS_BOTTOM.length)]
          });

          // Bonus Pièce de Prime au milieu
          if (Math.random() > 0.25) {
            bonusesRef.current.push({
              x: CANVAS_WIDTH + 30,
              y: topHeight + gap / 2,
              collected: false,
              rotation: 0
            });
          }
        }

        // Déplacer les obstacles (Vitesse ralentie 2.2px)
        const pipeSpeed = 2.2;
        pipesRef.current.forEach(p => {
          p.x -= pipeSpeed;

          // Détection de score +1
          if (!p.passed && p.x < agent.x) {
            p.passed = true;
            addFloatingText("+1", agent.x, agent.y - 20, "#38bdf8");
            setScore(s => {
              const newS = s + 1;
              setHighScore(h => Math.max(h, newS));
              return newS;
            });
          }

          // Collision Obstacle
          if (invincibleFramesRef.current === 0) {
            const hitTop = agent.x + agent.radius > p.x && agent.x - agent.radius < p.x + 65 && agent.y - agent.radius < p.topHeight;
            const hitBottom = agent.x + agent.radius > p.x && agent.x - agent.radius < p.x + 65 && agent.y + agent.radius > CANVAS_HEIGHT - p.bottomHeight;

            if (hitTop || hitBottom) {
              shakeRef.current = 14;
              setLives(l => {
                const nextL = l - 1;
                if (nextL <= 0) {
                  setGameState("gameover");
                } else {
                  invincibleFramesRef.current = 60;
                  agent.velocity = -6;
                }
                return nextL;
              });
            }
          }
        });

        // Déplacer les bonus (Pièces dorées)
        bonusesRef.current.forEach(b => {
          b.x -= pipeSpeed;
          b.rotation += 0.08;

          if (!b.collected) {
            const dist = Math.hypot(agent.x - b.x, agent.y - b.y);
            if (dist < agent.radius + 14) {
              b.collected = true;
              addFloatingText("+5 PTS", b.x, b.y, "#fbbf24");
              setScore(s => s + 5);

              // Explosion d'étincelles dorées
              for (let i = 0; i < 14; i++) {
                particlesRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  color: "#fbbf24",
                  size: Math.random() * 4 + 2,
                  life: 20,
                  maxLife: 20
                });
              }
            }
          }
        });

        // Nettoyer objets
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

      // === DESSINER LES OBSTACLES (Tours d'Archives Néon RH) ===
      pipesRef.current.forEach(p => {
        const pipeW = 65;

        // Poteau haut
        ctx.save();
        const pGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
        pGrad.addColorStop(0, "#1e293b");
        pGrad.addColorStop(0.5, "#334155");
        pGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = pGrad;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#38bdf8";
        ctx.fillRect(p.x, 0, pipeW, p.topHeight);

        // Bordure néon cyan au bas du poteau haut
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(p.x - 3, p.topHeight - 16, pipeW + 6, 16);

        // Lampe d'avertissement clignotante
        const lampAlpha = 0.5 + 0.5 * Math.sin(frameCountRef.current * 0.15);
        ctx.fillStyle = `rgba(239, 68, 68, ${lampAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ef4444";
        ctx.beginPath();
        ctx.arc(p.x + pipeW / 2, p.topHeight - 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.fillText(p.labelTop, p.x + pipeW / 2, Math.max(20, p.topHeight / 2));
        ctx.restore();

        // Poteau bas
        ctx.save();
        ctx.fillStyle = pGrad;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#38bdf8";
        ctx.fillRect(p.x, CANVAS_HEIGHT - p.bottomHeight, pipeW, p.bottomHeight);

        // Bordure néon cyan au haut du poteau bas
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(p.x - 3, CANVAS_HEIGHT - p.bottomHeight, pipeW + 6, 16);

        // Lampe d'avertissement
        ctx.fillStyle = `rgba(239, 68, 68, ${lampAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ef4444";
        ctx.beginPath();
        ctx.arc(p.x + pipeW / 2, CANVAS_HEIGHT - p.bottomHeight + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.fillText(p.labelBottom, p.x + pipeW / 2, CANVAS_HEIGHT - Math.max(20, p.bottomHeight / 2));
        ctx.restore();
      });

      // === DESSINER LES BONUS (Pièces de Primes 3D) ===
      bonusesRef.current.forEach(b => {
        if (b.collected) return;
        ctx.save();
        ctx.translate(b.x, b.y);

        const scaleX = Math.abs(Math.cos(b.rotation));

        ctx.fillStyle = "#fbbf24";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        ctx.ellipse(0, 0, 12 * scaleX, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflet brillant
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-3 * scaleX, -3, 4 * scaleX, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#78350f";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("€", 0, 1);
        ctx.restore();
      });

      // === DESSINER LES PARTICULES ===
      particlesRef.current.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
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

      // === DESSINER L'AGENT VOLANT (Cyber Jetpack Aviator) ===
      const agent = agentRef.current;
      const isBlinking = invincibleFramesRef.current > 0 && Math.floor(invincibleFramesRef.current / 5) % 2 === 0;

      if (!isBlinking) {
        ctx.save();
        ctx.translate(agent.x, agent.y);
        ctx.rotate(agent.rotation);

        // Jetpack dorsal métallique
        ctx.fillStyle = "#475569";
        ctx.fillRect(-16, -10, 8, 20);
        ctx.fillStyle = "#38bdf8";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#38bdf8";
        ctx.fillRect(-18, -6, 4, 12);

        // Corps / Combinaison de l'agent
        ctx.fillStyle = "#0284c7";
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#38bdf8";
        ctx.beginPath();
        ctx.arc(0, 0, agent.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cravate rouge volante au vent
        const tieAngle = Math.sin(frameCountRef.current * 0.2) * 0.3 + 0.3;
        ctx.save();
        ctx.rotate(tieAngle);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-2, 4, 4, 14);
        ctx.restore();

        // Lunettes d'aviateur / Visière brillante
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(-4, -8, 18, 9, 3);
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#38bdf8";
        ctx.fillRect(-2, -6, 14, 5);

        ctx.restore();
      }

      // === DESSINER LE SOL CYBER ===
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#38bdf8";
      ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 3);

      ctx.restore(); // Restore shake

      animationId = requestAnimationFrame(updateAndDraw);
    };

    animationId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header */}
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
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950/70 border border-cyan-500/30 px-6 py-2 rounded-full backdrop-blur-md text-3xl font-black text-cyan-400 shadow-xl pointer-events-none">
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
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
                Appuyez sur <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-cyan-400">ESPACE</kbd> ou touchez l'écran pour voler. Allumez votre jetpack et esquivez les tours d'archives RH !
              </p>
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
