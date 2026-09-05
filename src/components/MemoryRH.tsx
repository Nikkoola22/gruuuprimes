import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Trophy
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
    <div className="relative z-30 isolate min-h-screen flex flex-col overflow-x-hidden bg-[#1e133c] text-white touch-none select-none font-sans">
      
      {/* --- Serene Night Landscape Background --- */}
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b103c] via-[#2b1f5c] to-[#1e1b4b] z-0" />
      
      {/* Stars */}
      <div className="absolute top-10 left-[20%] w-1 h-1 bg-white rounded-full opacity-50 z-0" />
      <div className="absolute top-32 left-[10%] w-1 h-1 bg-white rounded-full opacity-30 z-0" />
      <div className="absolute top-20 right-[30%] w-1.5 h-1.5 bg-white rounded-full opacity-70 blur-[1px] z-0" />
      <div className="absolute top-40 right-[15%] w-1 h-1 bg-white rounded-full opacity-40 z-0" />
      <div className="absolute top-64 left-[40%] w-1 h-1 bg-white rounded-full opacity-60 z-0" />

      {/* Back Mountains (Lighter Purple) */}
      <div className="absolute bottom-[30%] w-full h-[40%] bg-[#362663] z-0" 
           style={{ clipPath: 'polygon(0% 100%, 0% 60%, 15% 40%, 30% 70%, 45% 20%, 65% 50%, 80% 30%, 100% 60%, 100% 100%)' }} />
      
      {/* Mid Mountains (Mid Purple) */}
      <div className="absolute bottom-[15%] w-full h-[35%] bg-[#2a1a52] z-0" 
           style={{ clipPath: 'polygon(0% 100%, 0% 40%, 25% 10%, 45% 50%, 75% 15%, 100% 45%, 100% 100%)' }} />

      {/* Lake Reflection (Darker) */}
      <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-b from-[#1c123b] to-[#0f0a24] z-0" />
      <div className="absolute bottom-[15%] w-full h-2 bg-[#2a1a52] opacity-30 blur-sm z-0" />

      {/* Foreground Trees (Silhouettes) */}
      <div className="absolute bottom-0 left-0 w-full h-[25%] bg-[#0e091a] z-0" 
           style={{ clipPath: 'polygon(0% 100%, 0% 30%, 5% 20%, 10% 40%, 15% 10%, 20% 40%, 25% 25%, 30% 50%, 40% 50%, 50% 60%, 60% 60%, 70% 30%, 75% 10%, 80% 40%, 85% 20%, 90% 40%, 95% 15%, 100% 35%, 100% 100%)' }} />
      <div className="absolute bottom-0 right-[20%] w-12 h-32 bg-[#0e091a] z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute bottom-0 left-[25%] w-16 h-40 bg-[#0e091a] z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />


      {/* --- Main Content --- */}
      <div className="max-w-4xl mx-auto relative z-10 w-full h-full flex flex-col">
        
        {/* Top UI Bar */}
        <div className="w-full flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6">
          
          {/* Bouton Retour */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>

          {/* Energy/Coups Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <div className="absolute -left-4 z-10 text-yellow-400 text-3xl font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse">
                ⚡
              </div>
              <div className="w-32 sm:w-40 h-6 sm:h-8 bg-blue-900/50 rounded-r-full border-2 border-blue-400/30 overflow-hidden pl-4 shadow-inner relative backdrop-blur-sm">
                {/* Fill bar representing moves left / progress */}
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 w-[60%] rounded-r-full shadow-[0_0_10px_#a855f7]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black drop-shadow-md">{moves}</span>
          </div>

          {/* Score & Multiplier */}
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black drop-shadow-md">{matches * 100}</span>
            <button onClick={handleRestart} className="relative w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform" title="Recommencer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700 opacity-90 shadow-[0_0_15px_rgba(168,85,247,0.6)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
              <div className="absolute inset-1 bg-gradient-to-br from-purple-300 to-purple-600 opacity-90" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
              <div className="absolute -top-1 -right-1 text-yellow-300 animate-pulse">✨</div>
              <span className="relative z-10 text-white font-black text-sm sm:text-base">1X</span>
            </button>
          </div>

        </div>

        {/* Card Grid Area */}
        <div className="flex-1 flex items-center justify-center py-4 relative">
          {victory && <VictoryConfetti />}

          {victory ? (
            // Victory Screen
            <div className="text-center relative z-10 animate-scale-up py-8 bg-black/40 backdrop-blur-md px-10 rounded-3xl border border-white/10 shadow-2xl">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-lg">Victoire !</h2>
              <p className="text-slate-200 max-w-sm mx-auto mb-8 text-lg font-medium drop-shadow-md">
                Toutes les paires ont été trouvées en <span className="font-black text-yellow-400">{moves} coups</span> !
              </p>

              <button
                onClick={handleRestart}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-black rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-lg"
              >
                Rejouer
              </button>
            </div>
          ) : (
            // Cards game board (Diamond-like centering if possible, else nice grid)
            <div className="w-full max-w-3xl px-4 flex justify-center">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5 justify-center items-center">
                {cards.map((card, idx) => {
                  const isFlipped = card.isFlipped || card.isMatched;
                  const isTerm = card.type === "term";
                  
                  return (
                    <div 
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      className="h-28 sm:h-36 md:h-40 aspect-square mx-auto perspective cursor-pointer select-none group"
                    >
                      <div 
                        className={`w-full h-full relative duration-500 transform-style-3d ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}
                      >
                        {/* Card Back (Face cachée - GOLD Trophies) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ffd86a] to-[#e49b29] rounded-xl shadow-[0_6px_15px_rgba(0,0,0,0.5)] flex items-center justify-center backface-hidden group-hover:scale-105 group-active:scale-95 transition-transform border border-yellow-200/50">
                          {/* Inner white outline border */}
                          <div className="absolute inset-[6px] border border-white/40 rounded-lg flex items-center justify-center pointer-events-none">
                            <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-white opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" strokeWidth={1.5} />
                          </div>
                        </div>

                        {/* Card Front (Face visible - WHITE with black/gold text) */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.6)] border-2 ${
                          card.isMatched
                            ? "border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] scale-110 z-20"
                            : "border-gray-200"
                        }`}>
                          {/* Sparkles if matched */}
                          {card.isMatched && (
                            <>
                              <div className="absolute -top-3 -right-3 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }}>✨</div>
                              <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-pulse text-sm">✨</div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400/20 rounded-xl blur-md pointer-events-none" />
                            </>
                          )}

                          <div className="p-2 w-full h-full flex flex-col justify-center items-center">
                            <p className={`break-words max-w-full font-black drop-shadow-sm ${getTextSizeClass(card.content)} ${isTerm ? 'text-[#e49b29]' : 'text-slate-800'}`}>
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

        {/* Bottom Glowing Banner */}
        <div className="w-full flex justify-center pb-8 sm:pb-12 z-20">
          <div className="relative">
            <h3 className="text-lg sm:text-2xl font-medium tracking-wide text-white drop-shadow-[0_0_15px_rgba(168,85,247,1)] relative z-10 px-6 py-2">
              Associez les Termes RH avec leurs Définitions
            </h3>
            {/* Glowing line underneath */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[2px]" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
        </div>

      </div>

      <style>{`
        .perspective {
          perspective: 1200px;
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
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default MemoryRH;


