import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Shield, 
  HeartHandshake, 
  Gavel, 
  Users, 
  GraduationCap, 
  Award, 
  Trophy, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChifoumiRHProps {
  onClose: () => void;
}

type Mode = "mode1" | "mode2";
type MoveId = "A" | "B" | "C";

interface Move {
  id: MoveId;
  name: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  details: string[];
}

interface Rule {
  winner: MoveId;
  loser: MoveId;
  message: string;
}

const MODE1_MOVES: Record<MoveId, Move> = {
  A: {
    id: "A",
    name: "Prévenir",
    description: "Agir en amont pour éliminer ou réduire les risques à la source.",
    icon: Shield,
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/40 hover:border-emerald-400",
    bgClass: "bg-emerald-500/10",
    details: [
      "Analyser la charge de travail et clarifier les rôles.",
      "Repérer les signaux faibles et évaluer les RPS.",
      "Informer les agents et co-construire les règles de vie collective."
    ]
  },
  B: {
    id: "B",
    name: "Accompagner",
    description: "Soutenir l'agent et l'équipe face aux difficultés du quotidien.",
    icon: HeartHandshake,
    colorClass: "text-sky-400",
    borderClass: "border-sky-500/40 hover:border-sky-400",
    bgClass: "bg-sky-500/10",
    details: [
      "Mener des entretiens d'écoute active et réguliers.",
      "Adapter les objectifs et proposer des appuis RH ou médiations.",
      "Mettre en place des formations d'ajustement ou d'accompagnement."
    ]
  },
  C: {
    id: "C",
    name: "Sanctionner",
    description: "Rappeler le cadre disciplinaire en dernier recours pour protéger le service.",
    icon: Gavel,
    colorClass: "text-rose-400",
    borderClass: "border-rose-500/40 hover:border-rose-400",
    bgClass: "bg-rose-500/10",
    details: [
      "Avertissement ou blâme pour recadrer un manquement répété.",
      "Sanctions graduées respectant le principe de proportionnalité.",
      "Garantir le respect de la procédure disciplinaire contradictoire."
    ]
  }
};

const MODE2_MOVES: Record<MoveId, Move> = {
  A: {
    id: "A",
    name: "Recrutement",
    description: "Attirer, sélectionner et intégrer les compétences clés requises.",
    icon: Users,
    colorClass: "text-amber-400",
    borderClass: "border-amber-500/40 hover:border-amber-400",
    bgClass: "bg-amber-500/10",
    details: [
      "Définir des fiches de poste claires et attractives.",
      "Mener un processus d'embauche transparent et équitable.",
      "Soigner le parcours d'intégration (onboarding) des nouveaux agents."
    ]
  },
  B: {
    id: "B",
    name: "Formation",
    description: "Développer et valoriser les compétences professionnelles individuelles et collectives.",
    icon: GraduationCap,
    colorClass: "text-violet-400",
    borderClass: "border-violet-500/40 hover:border-violet-400",
    bgClass: "bg-violet-500/10",
    details: [
      "Élaborer un plan de développement des compétences adapté aux besoins.",
      "Favoriser l'apprentissage continu et le partage interne de connaissances.",
      "Accompagner la mobilité professionnelle et les reconversions."
    ]
  },
  C: {
    id: "C",
    name: "Reconnaissance",
    description: "Valoriser l'engagement, les efforts et les contributions des agents.",
    icon: Award,
    colorClass: "text-orange-400",
    borderClass: "border-orange-500/40 hover:border-orange-400",
    bgClass: "bg-orange-500/10",
    details: [
      "Exprimer de la gratitude verbale et valoriser les réussites collectives.",
      "Adapter le régime indemnitaire ou l'avancement d'échelon au mérite.",
      "Améliorer les conditions matérielles de travail et l'autonomie accordée."
    ]
  }
};

const MODE1_RULES: Rule[] = [
  {
    winner: "A",
    loser: "C",
    message: "Tu as misé sur la prévention : tu cherches à éviter que la situation ne dégénère et qu'on doive en venir à la sanction."
  },
  {
    winner: "B",
    loser: "A",
    message: "Tu as choisi l'accompagnement : tu donnes du soutien concret et tu transformes la prévention en action personnalisée."
  },
  {
    winner: "C",
    loser: "B",
    message: "Tu as choisi la sanction : quand la prévention et l'accompagnement ne suffisent plus, la sanction rappelle le cadre et protège le service public."
  }
];

const MODE2_RULES: Rule[] = [
  {
    winner: "A",
    loser: "C",
    message: "Tu as misé sur le recrutement : sans ressources suffisantes, même une bonne reconnaissance ne compense pas un manque d'effectifs ou de compétences."
  },
  {
    winner: "B",
    loser: "A",
    message: "Tu as misé sur la formation : tu développes les compétences des personnes déjà en poste et tu valorises le potentiel interne."
  },
  {
    winner: "C",
    loser: "B",
    message: "Tu as misé sur la reconnaissance : sans reconnaissance, la formation et les efforts fournis risquent de ne pas être durables."
  }
];

const ChifoumiRH: React.FC<ChifoumiRHProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"menu" | "intro" | "playing" | "results">("menu");
  const [selectedMode, setSelectedMode] = useState<Mode>("mode1");
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<MoveId | null>(null);
  const [computerChoice, setComputerChoice] = useState<MoveId | null>(null);
  const [isAnimatingChoice, setIsAnimatingChoice] = useState(false);
  const [activeAnimCard, setActiveAnimCard] = useState<MoveId>("A");
  const [roundOutcome, setRoundOutcome] = useState<"win" | "lose" | "draw" | null>(null);
  const [playedHistory, setPlayedHistory] = useState<MoveId[]>([]);
  const [showMoveDetails, setShowMoveDetails] = useState<MoveId | null>(null);

  const maxRounds = 5;
  const currentMoves = selectedMode === "mode1" ? MODE1_MOVES : MODE2_MOVES;
  const currentRules = selectedMode === "mode1" ? MODE1_RULES : MODE2_RULES;

  // Animation de choix aléatoire de l'ordinateur
  useEffect(() => {
    let intervalId: any;
    if (isAnimatingChoice) {
      const cards: MoveId[] = ["A", "B", "C"];
      let counter = 0;
      intervalId = setInterval(() => {
        setActiveAnimCard(cards[counter % 3]);
        counter++;
      }, 150);
    }
    return () => clearInterval(intervalId);
  }, [isAnimatingChoice]);

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
    setGameState("intro");
  };

  const handleReset = () => {
    setRound(1);
    setPlayerScore(0);
    setComputerScore(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setRoundOutcome(null);
    setPlayedHistory([]);
    setGameState("menu");
  };

  const handlePlayMove = (move: MoveId) => {
    if (isAnimatingChoice || playerChoice !== null) return;

    setPlayerChoice(move);
    setPlayedHistory((prev) => [...prev, move]);
    setIsAnimatingChoice(true);

    // Attendre 1.5s pour simuler le choix de l'ordi
    setTimeout(() => {
      setIsAnimatingChoice(false);
      const moves: MoveId[] = ["A", "B", "C"];
      const randomMove = moves[Math.floor(Math.random() * 3)];
      setComputerChoice(randomMove);
      determineWinner(move, randomMove);
    }, 1500);
  };

  const determineWinner = (player: MoveId, computer: MoveId) => {
    if (player === computer) {
      setRoundOutcome("draw");
      return;
    }

    const winningRule = currentRules.find(
      (r) => r.winner === player && r.loser === computer
    );

    if (winningRule) {
      setRoundOutcome("win");
      setPlayerScore((prev) => prev + 1);
    } else {
      setRoundOutcome("lose");
      setComputerScore((prev) => prev + 1);
    }
  };

  const handleNextRound = () => {
    if (round >= maxRounds) {
      setGameState("results");
    } else {
      setRound((prev) => prev + 1);
      setPlayerChoice(null);
      setComputerChoice(null);
      setRoundOutcome(null);
    }
  };

  // Obtenir la phrase interprétative de coup joué par le joueur
  const getPlayerChoiceInterpretation = (moveId: MoveId) => {
    if (selectedMode === "mode1") {
      if (moveId === "A") {
        return "Tu as misé sur la prévention : tu agis en amont sur l'organisation et les conditions de travail pour limiter les risques.";
      } else if (moveId === "B") {
        return "Tu as misé sur l'accompagnement : tu prends en compte la situation de la personne ou de l'équipe et tu proposes un soutien adapté.";
      } else {
        return "Tu as misé sur la sanction : tu rappelles le cadre des obligations, ce qui peut être nécessaire, mais à utiliser avec mesure et après analyse des faits.";
      }
    } else {
      if (moveId === "A") {
        return "Tu as misé sur le recrutement : tu cherches à attirer de nouveaux talents et renforcer les effectifs de ton équipe.";
      } else if (moveId === "B") {
        return "Tu as misé sur la formation : tu investis dans la montée en compétences et l'adaptabilité de tes collaborateurs.";
      } else {
        return "Tu as misé sur la reconnaissance : tu valorises l'engagement et le travail accompli pour fidéliser tes agents.";
      }
    }
  };

  // Obtenir le message de la règle de combat
  const getRuleMessage = () => {
    if (!playerChoice || !computerChoice || playerChoice === computerChoice) {
      if (selectedMode === "mode1") {
        return "Vous avez fait le même choix : dans la réalité, l'enjeu est souvent de combiner prévention et accompagnement.";
      } else {
        return "Vous avez fait le même choix : dans la réalité, l'enjeu est souvent de combiner les actions de recrutement, de formation et de reconnaissance.";
      }
    }

    const winRule = currentRules.find(
      (r) => r.winner === playerChoice && r.loser === computerChoice
    );
    if (winRule) return winRule.message;

    const loseRule = currentRules.find(
      (r) => r.winner === computerChoice && r.loser === playerChoice
    );
    return loseRule ? loseRule.message : "";
  };

  // Obtenir le message générique suite au gain/perte
  const getGenericFeedback = () => {
    if (roundOutcome === "win") {
      if (selectedMode === "mode1") {
        return "Ta stratégie est cohérente dans cette situation : elle est alignée avec un management responsable et une démarche QVT.";
      } else {
        return "Tu as aligné ta décision avec une logique de gestion durable des compétences et de motivation.";
      }
    } else if (roundOutcome === "lose") {
      if (selectedMode === "mode1") {
        return "Cette stratégie existe, mais dans cette situation, un autre levier aurait mieux servi la prévention ou l'accompagnement.";
      } else {
        return "Cette action peut être utile, mais elle n'est pas suffisante à elle seule : dans certains contextes, un autre levier RH est plus pertinent.";
      }
    } else {
      if (selectedMode === "mode1") {
        return "Vous avez fait le même choix : souvent utile, mais parfois il faut combiner plusieurs leviers (prévention + accompagnement, par exemple).";
      } else {
        return "Vous avez fait le même choix : souvent utile, mais parfois il faut combiner plusieurs leviers (formation + reconnaissance, par exemple).";
      }
    }
  };

  // Calcul du profil final
  const getFinalSynthesis = () => {
    const counts = playedHistory.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<MoveId, number>);

    const maxVal = Math.max(counts.A || 0, counts.B || 0, counts.C || 0);
    const primaryChoices: MoveId[] = [];
    if (counts.A === maxVal) primaryChoices.push("A");
    if (counts.B === maxVal) primaryChoices.push("B");
    if (counts.C === maxVal) primaryChoices.push("C");

    const preferred = primaryChoices[0];

    if (selectedMode === "mode1") {
      if (preferred === "A") {
        return {
          profile: "Le Préventif Vigilant",
          synthesis: "Tu as souvent privilégié la prévention : c'est le socle fondamental d'une politique QVT saine pour préserver la santé physique et mentale des agents en collectivité. En agissant en amont, tu limites l'apparition de conflits ou de dérives professionnelles."
        };
      } else if (preferred === "B") {
        return {
          profile: "L'Accompagnateur Empathique",
          synthesis: "Tu as souvent privilégié l'accompagnement : c'est indispensable pour guider les agents au quotidien, les écouter activement et les soutenir lorsqu'ils traversent des difficultés. Cela renforce grandement la confiance réciproque."
        };
      } else {
        return {
          profile: "Le Cadreur Rigoureux",
          synthesis: "Tu as souvent privilégié la sanction : bien que nécessaire pour rappeler le cadre légal et protéger le service public en cas de manquement grave, garde à l'esprit que la prévention et l'accompagnement doivent idéalement être explorés en priorité."
        };
      }
    } else {
      if (preferred === "A") {
        return {
          profile: "Le Bâtisseur d'Équipe",
          synthesis: "Tu as souvent privilégié le recrutement : attirer et intégrer des forces vives est capital pour soulager l'équipe en place, mais prends garde à ce que la formation et la reconnaissance suivent afin de fidéliser ces recrues sur le long terme."
        };
      } else if (preferred === "B") {
        return {
          profile: "Le Développeur de Talents",
          synthesis: "Tu as souvent privilégié la formation : tu as compris que le capital humain est la plus grande force d'une organisation publique. Développer le potentiel existant valorise les agents et favorise l'adaptabilité globale."
        };
      } else {
        return {
          profile: "Le Fédérateur Motivateur",
          synthesis: "Tu as souvent privilégié la reconnaissance : reconnaître l'investissement et célébrer le travail accompli est le plus puissant levier d'engagement et de fidélisation dans la fonction publique. Les efforts ne sont durables que s'ils sont perçus !"
        };
      }
    }
  };

  const getMoveIcon = (moveId: MoveId) => {
    const move = currentMoves[moveId];
    const Icon = move.icon;
    return <Icon className={`w-8 h-8 ${move.colorClass}`} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100 font-sans min-h-screen flex flex-col justify-between">
      
      {/* HEADER SECTION */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full transition-all text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'Espace Jeux
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Jeu Éducatif</span>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3 shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 text-shimmer bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">
            Chifoumi RH
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-light">
            Découvrez comment équilibrer les différents leviers de la gestion des ressources humaines de manière ludique et pédagogique.
          </p>
        </div>
      </div>

      {/* GAME WORKSPACE */}
      <div className="flex-grow flex items-center justify-center my-6">
        
        {/* VIEW 1: MENU (SELECT MODE) */}
        {gameState === "menu" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* CARD MODE 1 */}
            <div 
              onClick={() => handleModeSelect("mode1")}
              className="group cursor-pointer p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] h-96"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-300 mb-2">Prévenir • Accompagner • Sanctionner</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Misez sur la prévention et l'accompagnement face aux difficultés managériales, tout en comprenant la place de la sanction disciplinaire en dernier recours.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-6 group-hover:translate-x-1.5 transition-transform">
                <span>Commencer le mode Management & QVT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* CARD MODE 2 */}
            <div 
              onClick={() => handleModeSelect("mode2")}
              className="group cursor-pointer p-8 rounded-3xl bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] h-96"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-colors"></div>
              <div>
                <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-2xl w-fit text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-violet-300 mb-2">Recrutement • Formation • Reconnaissance</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Explorez le pipeline de développement des compétences des agents en équilibrant l'attraction de talents, la formation continue et la fidélisation.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mt-6 group-hover:translate-x-1.5 transition-transform">
                <span>Commencer le mode Développement & Carrière</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: MODE INTRO */}
        {gameState === "intro" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md"
          >
            <h2 className="text-2xl font-black mb-4 text-center text-orange-400">
              {selectedMode === "mode1" ? "Univers : Prévenir / Accompagner / Sanctionner" : "Univers : Recrutement / Formation / Reconnaissance"}
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
              {selectedMode === "mode1" 
                ? "Dans ce mode, tu explores trois leviers fondamentaux du management : la prévention, l'accompagnement et la sanction. Le but pédagogique est de comprendre l'ordre et le rôle de ces leviers dans la vie de la collectivité. La sanction disciplinaire reste nécessaire pour poser le cadre légal du service public, mais elle intervient en dernier recours lorsque la prévention et l'accompagnement ont échoué ou s'avèrent insuffisants."
                : "Dans ce mode, tu gères le parcours d'apprentissage et de développement des effectifs. Recruter de nouveaux agents est capital, mais cela s'avère vain sans plan de formation continue et sans reconnaissance concrète des efforts fournis pour retenir et motiver les collaborateurs."
              }
            </p>

            <div className="border border-slate-800 bg-slate-950/50 rounded-2xl p-5 mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                Règles de confrontation (Chifoumi)
              </h4>
              <div className="space-y-2 text-sm text-slate-300">
                {selectedMode === "mode1" ? (
                  <>
                    <p className="flex items-center gap-2"><span className="font-semibold text-emerald-400">Prévenir</span> bat <span className="font-semibold text-rose-400">Sanctionner</span> (on résout à la source sans punir)</p>
                    <p className="flex items-center gap-2"><span className="font-semibold text-sky-400">Accompagner</span> bat <span className="font-semibold text-emerald-400">Prévenir</span> (on agit concrètement sur le terrain)</p>
                    <p className="flex items-center gap-2"><span className="font-semibold text-rose-400">Sanctionner</span> bat <span className="font-semibold text-sky-400">Accompagner</span> (quand le cadre est brisé de façon injustifiée)</p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2"><span className="font-semibold text-amber-400">Recrutement</span> bat <span className="font-semibold text-orange-400">Reconnaissance</span> (sans personnel au départ, la reconnaissance ne suffit pas)</p>
                    <p className="flex items-center gap-2"><span className="font-semibold text-violet-400">Formation</span> bat <span className="font-semibold text-amber-400">Recrutement</span> (mieux vaut développer et valoriser le potentiel interne)</p>
                    <p className="flex items-center gap-2"><span className="font-semibold text-orange-400">Reconnaissance</span> bat <span className="font-semibold text-violet-400">Formation</span> (former sans valoriser mène au départ des compétences)</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setGameState("playing")}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 transition-all"
              >
                C'est parti ! (Jouer en 5 manches)
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: PLAYING BOARD */}
        {gameState === "playing" && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            
            {/* SCOREBOARD & STATUS */}
            <div className="grid grid-cols-3 items-center bg-slate-900/60 border border-slate-800 rounded-3xl px-6 py-4 backdrop-blur-md">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Décisions RH (Toi)</span>
                <span className="text-3xl font-black text-orange-400 mt-1">{playerScore}</span>
              </div>
              <div className="text-center flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-light">Manche</span>
                <span className="text-xl font-bold text-white mt-1">{round} / {maxRounds}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Ordi (Situation)</span>
                <span className="text-3xl font-black text-slate-400 mt-1">{computerScore}</span>
              </div>
            </div>

            {/* STAGE AREA (CHOICES INTERACTION) */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 min-h-[220px] flex items-center justify-center relative overflow-hidden">
              
              {/* background light indicators based on outcome */}
              <AnimatePresence>
                {roundOutcome === "win" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-emerald-500 pointer-events-none" />
                )}
                {roundOutcome === "lose" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-rose-500 pointer-events-none" />
                )}
              </AnimatePresence>

              {playerChoice === null ? (
                <div className="text-center">
                  <p className="text-slate-300 font-light text-sm mb-2">Sélectionnez votre levier RH ci-dessous pour répondre à la situation.</p>
                  <div className="w-12 h-1.5 bg-orange-500/30 rounded-full mx-auto animate-pulse"></div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  
                  {/* Cards confrontation */}
                  <div className="flex items-center justify-center gap-8 md:gap-16 w-full mb-6">
                    {/* Player Choice Reveal */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, x: -30 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      className={`w-32 md:w-40 p-4 rounded-2xl bg-slate-950 border-2 ${currentMoves[playerChoice].colorClass === "text-emerald-400" ? "border-emerald-500/50" : currentMoves[playerChoice].colorClass === "text-sky-400" ? "border-sky-500/50" : currentMoves[playerChoice].colorClass === "text-rose-400" ? "border-rose-500/50" : currentMoves[playerChoice].colorClass === "text-amber-400" ? "border-amber-500/50" : currentMoves[playerChoice].colorClass === "text-violet-400" ? "border-violet-500/50" : "border-orange-500/50"} flex flex-col items-center justify-center shadow-lg text-center`}
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Ton Action</span>
                      {getMoveIcon(playerChoice)}
                      <h4 className="font-bold text-white text-base mt-2">{currentMoves[playerChoice].name}</h4>
                    </motion.div>

                    {/* VS divider */}
                    <div className="text-slate-600 font-black text-xl italic select-none">VS</div>

                    {/* Computer Choice Reveal or Animating */}
                    <div className="w-32 md:w-40 flex items-center justify-center">
                      {isAnimatingChoice ? (
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="w-full p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-center opacity-60"
                        >
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Analyse...</span>
                          {getMoveIcon(activeAnimCard)}
                          <h4 className="font-bold text-slate-400 text-base mt-2">?</h4>
                        </motion.div>
                      ) : (
                        computerChoice && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0, x: 30 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            className={`w-32 md:w-40 p-4 rounded-2xl bg-slate-950 border-2 ${currentMoves[computerChoice].colorClass === "text-emerald-400" ? "border-emerald-500/50" : currentMoves[computerChoice].colorClass === "text-sky-400" ? "border-sky-500/50" : currentMoves[computerChoice].colorClass === "text-rose-400" ? "border-rose-500/50" : currentMoves[computerChoice].colorClass === "text-amber-400" ? "border-amber-500/50" : currentMoves[computerChoice].colorClass === "text-violet-400" ? "border-violet-500/50" : "border-orange-500/50"} flex flex-col items-center justify-center shadow-lg text-center`}
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Situation</span>
                            {getMoveIcon(computerChoice)}
                            <h4 className="font-bold text-white text-base mt-2">{currentMoves[computerChoice].name}</h4>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Outcome details (after choice complete) */}
                  {!isAnimatingChoice && roundOutcome !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-xl text-center flex flex-col items-center border-t border-slate-800/80 pt-4"
                    >
                      <div className="mb-2">
                        {roundOutcome === "win" && (
                          <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold text-xs uppercase tracking-wider">
                            Décision Gagnante !
                          </span>
                        )}
                        {roundOutcome === "lose" && (
                          <span className="px-3.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full font-bold text-xs uppercase tracking-wider">
                            Levier Moins Efficace
                          </span>
                        )}
                        {roundOutcome === "draw" && (
                          <span className="px-3.5 py-1 bg-slate-500/20 text-slate-300 border border-slate-700 rounded-full font-bold text-xs uppercase tracking-wider">
                            Égalité de Vision
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium text-slate-300 max-w-md mb-2 italic">
                        {getRuleMessage()}
                      </p>
                      
                      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl mb-4 max-w-lg text-xs leading-relaxed text-slate-400 text-left font-light">
                        <strong className="text-slate-300 block mb-1">💡 Regard Pédagogique :</strong>
                        {getGenericFeedback()}
                      </div>

                      <button
                        onClick={handleNextRound}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold text-xs border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                      >
                        <span>{round >= maxRounds ? "Voir le Bilan Final" : "Manche Suivante"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}

                </div>
              )}
            </div>

            {/* THREE CARDS INPUT BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(currentMoves) as MoveId[]).map((moveId) => {
                const move = currentMoves[moveId];
                const Icon = move.icon;
                const isSelected = playerChoice === moveId;
                const isDisabled = playerChoice !== null || isAnimatingChoice;

                return (
                  <div key={moveId} className="flex flex-col h-full">
                    <button
                      disabled={isDisabled}
                      onClick={() => handlePlayMove(moveId)}
                      className={`flex-grow p-5 rounded-2xl border transition-all text-left relative overflow-hidden h-40 flex flex-col justify-between ${
                        isSelected 
                          ? "bg-slate-900 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
                          : "bg-slate-900/60 " + move.borderClass + " " + (isDisabled ? "opacity-40 cursor-default" : "hover:bg-slate-900/90")
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`p-2 bg-slate-950 rounded-xl border border-slate-800 ${move.colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoveDetails(showMoveDetails === moveId ? null : moveId);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                          title="Plus d'informations"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3">
                        <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                          {move.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-light mt-1 leading-snug">
                          {move.description}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* OVERLAY DETAILS PANEL */}
            <AnimatePresence>
              {showMoveDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
                >
                  <button
                    onClick={() => setShowMoveDetails(null)}
                    className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Fermer [x]
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    {getMoveIcon(showMoveDetails)}
                    <h4 className="text-lg font-bold text-white">{currentMoves[showMoveDetails].name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 font-light italic">
                    {getPlayerChoiceInterpretation(showMoveDetails)}
                  </p>
                  <div className="border-t border-slate-800 pt-3">
                    <h5 className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mb-2">Exemples et Actions concrètes dans la FPT :</h5>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside font-light">
                      {currentMoves[showMoveDetails].details.map((detail, idx) => (
                        <li key={idx} className="leading-relaxed">{detail}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* VIEW 4: RESULTS & PROFILE SYNTHESIS */}
        {gameState === "results" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md text-center"
          >
            <div className="inline-flex p-4 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-4 shadow-lg">
              <Trophy className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2">
              Bilan des décisions RH
            </h2>
            
            <p className="text-slate-400 text-sm font-light mb-6">
              Tu as complété les 5 manches pédagogiques de confrontation. Voici ton diagnostic comportemental.
            </p>

            {/* Score Summary */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="px-5 py-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tes points</span>
                <span className="text-2xl font-black text-emerald-400 block mt-0.5">{playerScore}</span>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Points Ordi</span>
                <span className="text-2xl font-black text-rose-400 block mt-0.5">{computerScore}</span>
              </div>
            </div>

            {/* Profile Analysis Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-orange-500/20 text-left relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Ton profil managérial :</span>
              </div>

              <h4 className="text-xl font-bold text-white mb-3">
                {getFinalSynthesis().profile}
              </h4>
              
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                {getFinalSynthesis().synthesis}
              </p>
            </div>

            {/* Actions button */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setGameState("playing")}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rejouer ce mode
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-xs border border-slate-700 hover:border-slate-600 transition-all"
              >
                Changer d'univers RH
              </button>
            </div>

          </motion.div>
        )}

      </div>

      {/* FOOTER PAYSAGE (SYNTHESE EN BULLES) */}
      <div className="text-center border-t border-slate-900/60 pt-6">
        <p className="text-[10px] text-slate-500 font-light">
          Chifoumi RH • Application de sensibilisation ludique aux rôles managériaux dans la FPT.
        </p>
      </div>

    </div>
  );
};

export default ChifoumiRH;
