import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  HelpCircle, 
  Check, 
  Sparkles
} from "lucide-react";

interface MemoryRHProps {
  onClose: () => void;
}

interface Card {
  id: string;      // Unique card ID e.g., "term-1" or "def-1"
  pairId: number;  // ID of the pair (1 to 6)
  type: "term" | "definition";
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const BASE_URL = import.meta.env.BASE_URL;

const ALL_PAIRS = [
  { id: 1, term: "Temps Partiel Thérapeutique 🩺", def: "Reprise progressive du travail après maladie 📈" },
  { id: 2, term: "Compte Épargne-Temps (CET) 📅", def: "Épargner des congés non pris pour plus tard 💾" },
  { id: 3, term: "Protection Fonctionnelle 🛡️", def: "Défense juridique de l'agent par l'employeur 🤝" },
  { id: 4, term: "Régime du RIFSEEP 💰", def: "Indemnités liées aux fonctions, à l'expertise et aux résultats 💵" },
  { id: 5, term: "Droit à la Déconnexion 📵", def: "Aucune sollicitation pro en dehors des heures de travail 🕰️" },
  { id: 6, term: "Télétravail à Gennevilliers 🏠", def: "Autorisé jusqu'à 2 jours par semaine par défaut 💻" },
  { id: 7, term: "NBI (Bonification Indiciaire) 📈", def: "Points d'indice en plus pour responsabilités ou technicité 🎯" },
  { id: 8, term: "Détachement Administratif ✈️", def: "Exercer temporairement dans une autre administration 🔄" },
  { id: 9, term: "Disponibilité de l'Agent ⏳", def: "Cesser ses fonctions sans traitement pour convenance personnelle 🛑" },
  { id: 10, term: "Entretien Professionnel Annuel 📋", def: "Bilan annuel d'activité et fixation d'objectifs avec le N+1 🎯" },
  { id: 11, term: "Droit de Retrait ⚠️", def: "Quitter son poste face à un danger grave et imminent 🚨" },
  { id: 12, term: "Comité Social Territorial (CST) 🤝", def: "Instance paritaire pour le dialogue social et la sécurité 🏛️" },
  { id: 13, term: "Compte Personnel de Formation (CPF) 📚", def: "Crédit d'heures annuel pour financer des formations pro 🎓" },
  { id: 14, term: "Promotion de Grade 🚀", def: "Progression de carrière au sein de son cadre d'emplois 🏆" },
  { id: 15, term: "Congé Parental 🍼", def: "Cesser de travailler sans solde pour élever son jeune enfant 🧸" },
  { id: 16, term: "Comité des Œuvres Sociales (COS) 🎭", def: "Prestations sociales, culturelles et loisirs des agents 🎫" }
];

const shuffleCards = (): Card[] => {
  // Sélectionner 6 paires aléatoires uniques de la liste
  const shuffledPairs = [...ALL_PAIRS].sort(() => Math.random() - 0.5).slice(0, 6);

  const cards: Card[] = [];
  shuffledPairs.forEach((p) => {
    cards.push({
      id: `term-${p.id}`,
      pairId: p.id,
      type: "term",
      content: p.term,
      isFlipped: false,
      isMatched: false
    });
    cards.push({
      id: `def-${p.id}`,
      pairId: p.id,
      type: "definition",
      content: p.def,
      isFlipped: false,
      isMatched: false
    });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

// ─── Effet Confettis pour la Victoire ─────────────────────────────────────────
const VictoryConfetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || 600);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.offsetWidth || 600;
      height = canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const colors = ["#FFC107", "#FF5722", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4", "#4CAF50", "#8BC34A"];

    // Confetti bursts from both corners
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: 0,
        y: height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 8 + 4,
        speedY: -(Math.random() * 12 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        opacity: 1
      });
      particles.push({
        x: width,
        y: height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: -(Math.random() * 8 + 4),
        speedY: -(Math.random() * 12 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        opacity: 1
      });
    }

    const gravity = 0.35;
    const friction = 0.98;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let active = false;

      particles.forEach((p) => {
        p.speedY += gravity;
        p.speedX *= friction;
        p.speedY *= friction;
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.opacity > 0 && p.y < height + 50) {
          active = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full rounded-3xl z-0"
    />
  );
};

const getTextSizeClass = (text: string) => {
  if (text.length > 55) return "text-xs sm:text-xs md:text-sm leading-snug font-medium";
  if (text.length > 30) return "text-xs sm:text-sm md:text-base leading-snug font-semibold";
  return "text-sm sm:text-base md:text-lg font-bold leading-snug";
};

// ─── Composant Principal MemoryRH ─────────────────────────────────────────────
const MemoryRH: React.FC<MemoryRHProps> = ({ onClose }) => {
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [victory, setVictory] = useState(false);

  // Gérer le clic sur une carte
  const handleCardClick = (idx: number) => {
    if (locked || cards[idx].isFlipped || cards[idx].isMatched) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[idx].isFlipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedIndices, idx];
    setSelectedIndices(newSelected);

    // Si on a retourné 2 cartes
    if (newSelected.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);

      const firstCard = cards[newSelected[0]];
      const secondCard = cards[idx];

      // Vérifier la correspondance
      if (firstCard.pairId === secondCard.pairId) {
        // MATCH !
        setTimeout(() => {
          setCards((prev) => {
            const temp = [...prev];
            temp[newSelected[0]].isMatched = true;
            temp[idx].isMatched = true;
            return temp;
          });
          setMatches((m) => m + 1);
          setSelectedIndices([]);
          setLocked(false);
        }, 400);
      } else {
        // NO MATCH ! Retourner les cartes après 1.2s
        setTimeout(() => {
          setCards((prev) => {
            const temp = [...prev];
            temp[newSelected[0]].isFlipped = false;
            temp[idx].isFlipped = false;
            return temp;
          });
          setSelectedIndices([]);
          setLocked(false);
        }, 1200);
      }
    }
  };

  // Détecter la victoire
  useEffect(() => {
    if (matches === 6) {
      setVictory(true);
    }
  }, [matches]);

  // Recommencer une partie
  const handleRestart = () => {
    setCards(shuffleCards());
    setSelectedIndices([]);
    setLocked(false);
    setMoves(0);
    setMatches(0);
    setVictory(false);
  };
  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-3 sm:pt-5 pb-3 overflow-x-hidden bg-slate-950 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 transition-colors duration-500">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 z-20 flex-wrap gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>

          <div className="flex gap-3 items-center">
            <span className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              Coups : <span className="text-purple-400 font-black text-sm">{moves}</span>
            </span>
            <span className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              Paires : <span className="text-emerald-400 font-black text-sm">{matches} / 6</span>
            </span>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all text-xs border border-purple-500 backdrop-blur-md flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-purple-500/20 relative">
          {victory && <VictoryConfetti />}

          {victory ? (
            // Victory Screen
            <div className="text-center relative z-10 animate-scale-up py-8">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-black text-white mb-2">Félicitations ! 🎉</h2>
              <p className="text-slate-300 max-w-sm mx-auto mb-6 text-sm sm:text-base font-normal">
                Vous avez associé toutes les paires RH avec brio en seulement <span className="font-bold text-purple-400">{moves} coups</span> !
              </p>

              <button
                onClick={handleRestart}
                className="mx-auto px-7 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-xl hover:opacity-95 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wider"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recommencer une partie</span>
              </button>
            </div>
          ) : (
            // Cards game board
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 justify-center items-stretch">
                {cards.map((card, idx) => {
                  const isFlipped = card.isFlipped || card.isMatched;
                  const isTerm = card.type === "term";
                  
                  return (
                    <div 
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      className="h-32 sm:h-36 md:h-40 w-full perspective cursor-pointer select-none"
                    >
                      <div 
                        className={`w-full h-full relative duration-500 transform-style-3d ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}
                      >
                        {/* Card Back (Face cachée) */}
                        <div className="absolute inset-0 bg-slate-950 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] rounded-2xl flex flex-col items-center justify-center text-purple-400 backface-hidden transition-all duration-300">
                          <HelpCircle className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-300/80 mt-2 font-mono">DÉFI MÉMOIRE</span>
                        </div>

                        {/* Card Front (Face visible) */}
                        <div className={`absolute inset-0 border-2 rounded-2xl p-3 flex flex-col items-center justify-between text-center backface-hidden rotate-y-180 transition-all duration-300 shadow-2xl ${
                          card.isMatched
                            ? "bg-slate-900/95 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/50 scale-[1.02] animate-pulse"
                            : isTerm
                              ? "bg-slate-900/95 border-cyan-400/90 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:border-cyan-300"
                              : "bg-slate-900/95 border-purple-400/90 shadow-[0_0_20px_rgba(192,132,252,0.35)] hover:border-purple-300"
                        }`}>
                          {/* Type Badge */}
                          <div className="w-full flex justify-center">
                            {card.isMatched ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                                <Check className="w-3 h-3 text-emerald-300" /> Pairé ! <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                              </span>
                            ) : isTerm ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
                                Terme RH
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/60 text-purple-300">
                                Définition
                              </span>
                            )}
                          </div>

                          {/* Content Text */}
                          <div className="flex-1 flex items-center justify-center my-1 w-full">
                            <p className={`break-words max-w-full text-slate-100 ${getTextSizeClass(card.content)}`}>
                              {card.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
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

export default MemoryRH;


