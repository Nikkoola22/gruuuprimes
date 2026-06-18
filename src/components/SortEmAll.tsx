import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Timer, FileText, CheckCircle, XCircle, Inbox } from "lucide-react";

interface SortEmAllProps {
  onClose: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

type TargetBin = "CST" | "F3SCT" | "CAP" | "CM" | "RH";

interface Dossier {
  text: string;
  target: TargetBin;
}

const DOSSIERS: Dossier[] = [
  // CST
  { text: "Avis sur le règlement intérieur", target: "CST" },
  { text: "Aménagement d'horaires pour tout un service", target: "CST" },
  { text: "Avis sur la réorganisation de la direction informatique", target: "CST" },
  { text: "Avis sur la charte du télétravail", target: "CST" },
  { text: "Lignes directrices de gestion (LDG)", target: "CST" },
  
  // F3SCT
  { text: "Droit d'alerte pour danger grave et imminent", target: "F3SCT" },
  { text: "Rapport annuel sur la santé au travail", target: "F3SCT" },
  { text: "Document Unique d'Évaluation des Risques (DUERP)", target: "F3SCT" },
  { text: "Avis suite à un accident du travail mortel", target: "F3SCT" },
  { text: "Programme annuel de prévention", target: "F3SCT" },
  
  // CAP
  { text: "Refus de titularisation", target: "CAP" },
  { text: "Licenciement pour insuffisance professionnelle", target: "CAP" },
  { text: "Recours contre un compte-rendu d'entretien professionnel", target: "CAP" },
  { text: "Sanction disciplinaire (exclusion temporaire)", target: "CAP" },
  { text: "Refus de temps partiel (disponibilité)", target: "CAP" },
  
  // CM (Conseil Médical)
  { text: "Demande de temps partiel thérapeutique suite à un accident", target: "CM" },
  { text: "Prolongation d'un congé de longue maladie (CLM)", target: "CM" },
  { text: "Saisine pour inaptitude définitive", target: "CM" },
  { text: "Reconnaissance de maladie professionnelle", target: "CM" },
  { text: "Avis pour un congé de longue durée (CLD)", target: "CM" },
  
  // RH (Ressources Humaines)
  { text: "Demande de prime de précarité", target: "RH" },
  { text: "Erreur de montant sur la fiche de paie", target: "RH" },
  { text: "Demande de congés annuels", target: "RH" },
  { text: "Demande d'attestation employeur", target: "RH" },
  { text: "Saisie sur salaire (information)", target: "RH" },
];

const BINS: { id: TargetBin; label: string; color: string; desc: string }[] = [
  { id: "CST", label: "CST", desc: "Comité Social Territorial (Orga, Temps de travail)", color: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100" },
  { id: "F3SCT", label: "F3SCT", desc: "Santé, Sécurité, Conditions (DUERP, Alertes)", color: "bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100" },
  { id: "CAP", label: "CAP / CCP", desc: "Individuel (Discipline, Titularisation)", color: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-100" },
  { id: "CM", label: "Cons. Médical", desc: "Santé (Maladie pro, Inaptitude, Temps partiel th.)", color: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-100" },
  { id: "RH", label: "Service RH", desc: "Demandes courantes (Paie, Congés)", color: "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100" },
];

const SortEmAll: React.FC<SortEmAllProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [deck, setDeck] = useState<Dossier[]>([]);
  const [currentDossier, setCurrentDossier] = useState<Dossier | null>(null);
  
  const [feedback, setFeedback] = useState<{ id: number, text: string, type: 'success' | 'error' }[]>([]);
  const feedbackIdRef = useRef(0);
  
  const [animateCard, setAnimateCard] = useState<TargetBin | null>(null);

  // Timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState("gameover");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    // Shuffle dossiers
    const shuffled = [...DOSSIERS].sort(() => Math.random() - 0.5);
    // Double it to have a big stack
    const fullDeck = [...shuffled, ...shuffled.sort(() => Math.random() - 0.5)];
    
    setDeck(fullDeck);
    setCurrentDossier(fullDeck[0]);
    setScore(0);
    setTimeLeft(60);
    setGameState("playing");
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    const id = feedbackIdRef.current++;
    setFeedback(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  const handleSort = (binId: TargetBin) => {
    if (gameState !== "playing" || !currentDossier || animateCard) return;

    // Déclencher l'animation
    setAnimateCard(binId);

    setTimeout(() => {
      if (currentDossier.target === binId) {
        // Correct
        setScore(s => s + 1);
        setTimeLeft(t => Math.min(t + 1, 99)); // Bonus time +1s
        showFeedback("APPROUVÉ", "success");
      } else {
        // Incorrect
        setTimeLeft(t => Math.max(t - 5, 0)); // Malus time -5s
        showFeedback(`ERREUR ! C'était ${currentDossier.target}`, "error");
      }

      // Next dossier
      const newDeck = deck.slice(1);
      if (newDeck.length === 0) {
        // Refill deck if empty
        const shuffled = [...DOSSIERS].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
        setCurrentDossier(shuffled[0]);
      } else {
        setDeck(newDeck);
        setCurrentDossier(newDeck[0]);
      }
      setAnimateCard(null);
    }, 300); // Durée de l'animation
  };

  return (
    <div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500 font-sans text-slate-800 dark:text-slate-100 touch-none select-none flex flex-col">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />
      
      <div className="flex-1 w-full max-w-5xl mx-auto relative z-10 flex flex-col p-4 sm:p-6">
        
        {/* Header (Score & Timer) */}
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-all text-sm border border-slate-200 dark:border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dossiers Triés</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{score}</span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft <= 10 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'}`}>
              <Timer className="w-6 h-6" />
              <span className="text-2xl font-black font-mono">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Espace de travail central (Le Bureau) */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full mb-8">
          
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-30 flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-xl">
              <Inbox className="w-20 h-20 text-blue-400 mb-6" />
              <h1 className="text-4xl font-bold mb-4 text-slate-800 dark:text-white">
                Sort'em All : Instances
              </h1>
              <p className="text-slate-600 dark:text-slate-300 max-w-lg mb-8 text-lg">
                Le tri du courrier est une urgence absolue ! Lisez la question de l'agent et envoyez le dossier dans la <strong>bonne bannette</strong>.
                <br/><br/>
                <span className="text-sm font-light text-slate-400">
                  Temps alloué : 60 secondes.<br/>
                  Bonne réponse : +1s <br/>
                  Erreur d'instance : -5s
                </span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-xl transition-all shadow-md hover:shadow-lg"
              >
                <Play className="w-6 h-6 fill-current" />
                Prendre son service
              </button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-30 flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-xl">
              <h2 className="text-5xl font-black text-red-500 mb-2">FIN DE SERVICE</h2>
              <p className="text-slate-600 dark:text-slate-400 text-xl mb-8">La pile de courrier vous a submergé.</p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 shadow-sm w-64">
                <p className="text-sm text-slate-500 font-bold uppercase mb-2">Score de tri</p>
                <p className="text-6xl font-black text-emerald-400">{score}</p>
                <p className="text-xs text-slate-400 mt-2">Dossiers traités</p>
              </div>

              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-medium transition-all shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                Recommencer le tri
              </button>
            </div>
          )}

          {/* Pile de dossiers (Le Dossier Actuel) */}
          {gameState === "playing" && currentDossier && (
            <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              
              {/* Fake dossiers underneath to show a stack */}
              <div className="absolute w-[95%] h-full bg-orange-100 rounded-sm shadow-sm rotate-3 translate-y-2 opacity-50 border border-orange-200" />
              <div className="absolute w-[98%] h-full bg-yellow-50 rounded-sm shadow-sm -rotate-2 translate-y-1 opacity-70 border border-yellow-200" />
              
              {/* Top Dossier */}
              <div 
                className={`relative w-full h-full bg-white rounded-sm shadow-2xl border border-slate-200 p-8 flex flex-col transition-all duration-300 transform 
                  ${animateCard ? 'scale-50 opacity-0 translate-y-[200px]' : 'scale-100 opacity-100'}`}
              >
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-6 h-6" />
                    <span className="font-mono text-xs font-bold tracking-widest">DOSSIER #{(score + 1).toString().padStart(4, '0')}</span>
                  </div>
                  <div className="text-red-500 font-black border-2 border-red-500 rounded p-1 text-xs rotate-12 opacity-80">
                    URGENT
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                    "{currentDossier.text}"
                  </h3>
                </div>

                {/* Feedbacks animation on top of the card */}
                {feedback.map(f => (
                  <div 
                    key={f.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-stamp"
                  >
                    <div className={`transform -rotate-12 border-8 rounded-xl px-6 py-4 font-black text-4xl sm:text-5xl uppercase tracking-widest 
                      ${f.type === 'success' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}
                    >
                      {f.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Les 5 Bannettes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 relative z-20">
          {BINS.map((bin) => (
            <button
              key={bin.id}
              disabled={gameState !== "playing" || animateCard !== null}
              onClick={() => handleSort(bin.id)}
              className={`relative flex flex-col p-4 rounded-2xl border active:scale-95 transition-all shadow-md group overflow-hidden
                ${bin.color} ${gameState !== "playing" ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
            >
              {/* Effet reflet 3D */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 dark:bg-white/5 rounded-t-xl" />
              
              <div className="relative z-10 flex flex-col h-full justify-between items-center text-center gap-2">
                <span className="text-2xl font-black tracking-wider drop-shadow-md">
                  {bin.label}
                </span>
                <span className="text-[10px] sm:text-xs font-medium leading-tight opacity-80 pb-2">
                  {bin.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes stamp {
          0% { transform: scale(3) rotate(-20deg); opacity: 0; }
          20% { transform: scale(1) rotate(-12deg); opacity: 1; }
          80% { transform: scale(1) rotate(-12deg); opacity: 1; }
          100% { transform: scale(0.8) rotate(-12deg); opacity: 0; }
        }
        .animate-stamp {
          animation: stamp 0.8s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SortEmAll;
