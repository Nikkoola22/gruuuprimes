import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Play, Trophy, Layers, Sparkles, ArrowDown, RotateCw, ArrowLeft as LeftIcon, ArrowRight as RightIcon } from "lucide-react";

interface TetrisRHProps {
  onClose: () => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 26; // px per tile

// Définition des pièces (Tetriminos RH)
const TETROMINOS = {
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#38bdf8", name: "Dossier Paie" },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#3b82f6", name: "Arrêté Grade" },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#f97316", name: "Prime RIFSEEP" },
  O: { shape: [[1,1],[1,1]], color: "#eab308", name: "Compte CET" },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#22c55e", name: "Formation CPF" },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#a855f7", name: "Télétravail" },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#ef4444", name: "Risque RPS" },
};

type TetrominoKey = keyof typeof TETROMINOS;

const getRandomPiece = () => {
  const keys = Object.keys(TETROMINOS) as TetrominoKey[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return {
    key: randKey,
    shape: TETROMINOS[randKey].shape.map(row => [...row]),
    color: TETROMINOS[randKey].color,
    name: TETROMINOS[randKey].name,
  };
};

const TetrisRH: React.FC<TetrisRHProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);

  // Matrice de jeu (0 = vide, sinon hex color string)
  const boardRef = useRef<(string | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const currentPieceRef = useRef<{
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const nextPieceRef = useRef<{
    shape: number[][];
    color: string;
    name: string;
  } | null>(null);

  const dropCounterRef = useRef(0);
  const lastTimeRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Démarrer une nouvelle partie
  const startNewGame = useCallback(() => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    particlesRef.current = [];

    const p1 = getRandomPiece();
    const p2 = getRandomPiece();

    currentPieceRef.current = {
      shape: p1.shape,
      color: p1.color,
      x: Math.floor(COLS / 2) - Math.floor(p1.shape[0].length / 2),
      y: 0
    };

    nextPieceRef.current = {
      shape: p2.shape,
      color: p2.color,
      name: p2.name
    };

    dropCounterRef.current = 0;
    lastTimeRef.current = performance.now();
    setGameState("playing");
  }, []);

  // Détection des collisions
  const checkCollision = useCallback((shape: number[][], offsetX: number, offsetY: number) => {
    const board = boardRef.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newX = offsetX + c;
          const newY = offsetY + r;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && board[newY][newX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Rotation d'une matrice 2D
  const rotateMatrix = (matrix: number[][]) => {
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        result[c][N - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  const handleRotate = useCallback(() => {
    if (gameState !== "playing" || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;
    const rotated = rotateMatrix(piece.shape);

    if (!checkCollision(rotated, piece.x, piece.y)) {
      piece.shape = rotated;
    } else if (!checkCollision(rotated, piece.x - 1, piece.y)) {
      piece.x -= 1;
      piece.shape = rotated;
    } else if (!checkCollision(rotated, piece.x + 1, piece.y)) {
      piece.x += 1;
      piece.shape = rotated;
    }
  }, [gameState, checkCollision]);

  const moveLeft = useCallback(() => {
    if (gameState !== "playing" || !currentPieceRef.current) return;
    const p = currentPieceRef.current;
    if (!checkCollision(p.shape, p.x - 1, p.y)) {
      p.x -= 1;
    }
  }, [gameState, checkCollision]);

  const moveRight = useCallback(() => {
    if (gameState !== "playing" || !currentPieceRef.current) return;
    const p = currentPieceRef.current;
    if (!checkCollision(p.shape, p.x + 1, p.y)) {
      p.x += 1;
    }
  }, [gameState, checkCollision]);

  const lockPiece = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p) return;

    // Placer la pièce sur le plateau
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c] !== 0) {
          const boardY = p.y + r;
          const boardX = p.x + c;
          if (boardY < 0) {
            setGameState("gameover");
            return;
          }
          boardRef.current[boardY][boardX] = p.color;
        }
      }
    }

    // Vérifier les lignes complétées
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (boardRef.current[r].every(cell => cell !== null)) {
        // Générer des particules pour cette ligne
        for (let c = 0; c < COLS; c++) {
          const color = boardRef.current[r][c] || "#3b82f6";
          for (let i = 0; i < 4; i++) {
            particlesRef.current.push({
              x: c * BLOCK_SIZE + BLOCK_SIZE / 2,
              y: r * BLOCK_SIZE + BLOCK_SIZE / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: color,
              life: 25
            });
          }
        }

        boardRef.current.splice(r, 1);
        boardRef.current.unshift(Array(COLS).fill(null));
        cleared++;
        r++; // Re-tester la même ligne descendue
      }
    }

    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][cleared] * level;
      setScore(s => s + pts);
      setLinesCleared(l => {
        const nextLines = l + cleared;
        setLevel(Math.floor(nextLines / 10) + 1);
        return nextLines;
      });
    }

    // Nouvelles pièces
    const nextP = nextPieceRef.current || getRandomPiece();
    const newNext = getRandomPiece();

    currentPieceRef.current = {
      shape: nextP.shape,
      color: nextP.color,
      x: Math.floor(COLS / 2) - Math.floor(nextP.shape[0].length / 2),
      y: 0
    };

    nextPieceRef.current = {
      shape: newNext.shape,
      color: newNext.color,
      name: newNext.name
    };

    if (checkCollision(currentPieceRef.current.shape, currentPieceRef.current.x, currentPieceRef.current.y)) {
      setGameState("gameover");
    }
  }, [level, checkCollision]);

  const moveDown = useCallback(() => {
    if (gameState !== "playing" || !currentPieceRef.current) return;
    const p = currentPieceRef.current;
    if (!checkCollision(p.shape, p.x, p.y + 1)) {
      p.y += 1;
    } else {
      lockPiece();
    }
  }, [gameState, checkCollision, lockPiece]);

  const hardDrop = useCallback(() => {
    if (gameState !== "playing" || !currentPieceRef.current) return;
    const p = currentPieceRef.current;
    while (!checkCollision(p.shape, p.x, p.y + 1)) {
      p.y += 1;
    }
    lockPiece();
  }, [gameState, checkCollision, lockPiece]);

  // Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
      if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
      if (e.key === "ArrowUp") { e.preventDefault(); handleRotate(); }
      if (e.code === "Space") { e.preventDefault(); hardDrop(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, moveLeft, moveRight, moveDown, handleRotate, hardDrop]);

  // Game Loop
  useEffect(() => {
    let animationId: number;

    const update = (time: number) => {
      if (gameState === "playing") {
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dropCounterRef.current += delta;

        // Vitesse selon le niveau
        const dropInterval = Math.max(100, 800 - (level - 1) * 70);

        if (dropCounterRef.current > dropInterval) {
          moveDown();
          dropCounterRef.current = 0;
        }

        // Particules
        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      }

      // Draw Main Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

          // Fond Grille Néon
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

          // Lignes de grille discrètes
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * BLOCK_SIZE);
            ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
            ctx.stroke();
          }
          for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * BLOCK_SIZE, 0);
            ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            ctx.stroke();
          }

          // Dessiner le plateau
          const board = boardRef.current;
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (board[r][c]) {
                const color = board[r][c]!;
                ctx.save();
                ctx.fillStyle = color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;
                ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.fillRect(c * BLOCK_SIZE + 2, r * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 3);
                ctx.restore();
              }
            }
          }

          // Dessiner la pièce courante
          if (currentPieceRef.current) {
            const p = currentPieceRef.current;
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.color;

            for (let r = 0; r < p.shape.length; r++) {
              for (let c = 0; c < p.shape[r].length; c++) {
                if (p.shape[r][c] !== 0) {
                  const drawX = (p.x + c) * BLOCK_SIZE;
                  const drawY = (p.y + r) * BLOCK_SIZE;
                  if (drawY >= 0) {
                    ctx.fillRect(drawX + 1, drawY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                    ctx.fillStyle = "rgba(255,255,255,0.4)";
                    ctx.fillRect(drawX + 2, drawY + 2, BLOCK_SIZE - 4, 3);
                    ctx.fillStyle = p.color;
                  }
                }
              }
            }
            ctx.restore();
          }

          // Dessiner les particules
          particlesRef.current.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life / 25;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.random() * 3 + 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      // Draw Next Piece Canvas
      const nextCanvas = nextCanvasRef.current;
      if (nextCanvas && nextPieceRef.current) {
        const nCtx = nextCanvas.getContext("2d");
        if (nCtx) {
          nCtx.clearRect(0, 0, 100, 100);
          nCtx.fillStyle = "#0f172a";
          nCtx.fillRect(0, 0, 100, 100);

          const np = nextPieceRef.current;
          const tileSize = 20;
          const offsetX = (100 - np.shape[0].length * tileSize) / 2;
          const offsetY = (100 - np.shape.length * tileSize) / 2;

          nCtx.save();
          nCtx.fillStyle = np.color;
          nCtx.shadowBlur = 10;
          nCtx.shadowColor = np.color;

          for (let r = 0; r < np.shape.length; r++) {
            for (let c = 0; c < np.shape[r].length; c++) {
              if (np.shape[r][c] !== 0) {
                nCtx.fillRect(offsetX + c * tileSize + 1, offsetY + r * tileSize + 1, tileSize - 2, tileSize - 2);
              }
            }
          }
          nCtx.restore();
        }
      }

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, level, moveDown]);

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 flex-wrap gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-full font-bold transition-all text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            Retour
          </button>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400 animate-pulse" />
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tetris RH
            </h1>
          </div>
        </div>

        {/* Game Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-center w-full">
          {/* Main Board */}
          <div className="relative bg-slate-900/90 border-2 border-sky-500/30 rounded-3xl p-3 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
            <canvas
              ref={canvasRef}
              width={COLS * BLOCK_SIZE}
              height={ROWS * BLOCK_SIZE}
              className="rounded-2xl border border-slate-800 block shadow-inner"
            />

            {/* Overlays */}
            {gameState === "ready" && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 bg-sky-500/20 border border-sky-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Layers className="w-8 h-8 text-sky-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Empileur de Dossiers RH</h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
                  Organisez les dossiers statutaires, complétez les lignes pour les archiver et évitez le surmenage !
                </p>
                <button
                  onClick={startNewGame}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Commencer
                </button>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
                <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
                <h2 className="text-3xl font-black text-rose-500 mb-1">SURCHARGE RH !</h2>
                <p className="text-slate-300 text-xs mb-4">Le bureau a débordé de dossiers non traités.</p>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 w-48 shadow-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Score Final</span>
                  <p className="text-4xl font-black text-sky-400">{score}</p>
                </div>

                <button
                  onClick={startNewGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 text-xs uppercase"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Stats & Next Piece */}
          <div className="flex flex-col gap-4 w-full max-w-[240px]">
            {/* Next Piece */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-lg">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Suivant
              </span>
              <canvas ref={nextCanvasRef} width={100} height={100} className="rounded-xl border border-slate-800 bg-slate-950 mb-2" />
              <span className="text-xs font-bold text-sky-300 text-center">
                {nextPieceRef.current?.name || "---"}
              </span>
            </div>

            {/* Score & Level */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                <p className="text-2xl font-black text-sky-400">{score}</p>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Lignes</span>
                  <p className="text-lg font-bold text-emerald-400">{linesCleared}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Niveau</span>
                  <p className="text-lg font-bold text-purple-400">{level}</p>
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={moveLeft}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-xl flex items-center justify-center active:scale-95"
              >
                <LeftIcon className="w-5 h-5 text-sky-400" />
              </button>
              <button
                onClick={handleRotate}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl flex items-center justify-center active:scale-95"
              >
                <RotateCw className="w-5 h-5 text-purple-400" />
              </button>
              <button
                onClick={moveRight}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-xl flex items-center justify-center active:scale-95"
              >
                <RightIcon className="w-5 h-5 text-sky-400" />
              </button>
              <button
                onClick={moveDown}
                className="col-span-1 p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl flex items-center justify-center active:scale-95"
              >
                <ArrowDown className="w-5 h-5 text-emerald-400" />
              </button>
              <button
                onClick={hardDrop}
                className="col-span-2 p-3 bg-sky-500/20 border border-sky-500/50 hover:bg-sky-500/30 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center active:scale-95 uppercase tracking-wider"
              >
                Drop ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisRH;
