import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Smile, 
  Heart, 
  TrendingUp, 
  Coffee, 
  Sparkles, 
  Copy, 
  Check,
  RotateCcw
} from "lucide-react";

interface RouletteQVTProps {
  onClose: () => void;
}

interface Idea {
  category: "qvt" | "management" | "carriere" | "detente";
  text: string;
}

const BASE_URL = import.meta.env.BASE_URL;

const IDEAS: Record<string, Idea[]> = {
  qvt: [
    { category: "qvt", text: "Je planifie mes temps de déconnexion le soir pour préserver ma vie de famille." },
    { category: "qvt", text: "Je fais une pause de 5 minutes toutes les heures pour étirer mes jambes et mes bras." },
    { category: "qvt", text: "Je prends 10 minutes aujourd'hui pour échanger avec un collègue d'un autre service." },
    { category: "qvt", text: "Je bois un grand verre d'eau toutes les 2 heures pour rester bien hydraté." },
    { category: "qvt", text: "J'organise mon bureau ce matin pour avoir un espace de travail clair et inspirant." },
    { category: "qvt", text: "Je prends ma pause déjeuner à l'extérieur ou dans un parc pour changer d'air." },
    { category: "qvt", text: "Je désactive les notifications d'emails professionnels sur mon téléphone en dehors du travail." },
    { category: "qvt", text: "J'aère mon bureau pendant 5 minutes matin et après-midi pour renouveler l'air." },
    { category: "qvt", text: "Je prends le temps d'écrire ma to-do list en fin de journée pour partir l'esprit léger." },
    { category: "qvt", text: "Je range les dossiers terminés pour libérer visuellement mon espace de travail." },
    { category: "qvt", text: "J'adopte une plante verte sur mon bureau pour apporter une touche naturelle apaisante." },
    { category: "qvt", text: "Je règle la hauteur de mon écran et de ma chaise pour une posture ergonomique optimale." },
    { category: "qvt", text: "Je partage un fruit ou un encas sain avec mes collègues à la pause." },
    { category: "qvt", text: "Je programme un rendez-vous \"marché\" (walking meeting) avec un collègue pour discuter d'un projet." },
    { category: "qvt", text: "Je consacre la première heure de ma journée aux tâches complexes avant d'ouvrir mes e-mails." }
  ],
  management: [
    { category: "management", text: "Je remercie chaleureusement un collaborateur ou un collègue pour son aide aujourd'hui." },
    { category: "management", text: "Je demande à mon équipe comment s'est passée leur semaine, au-delà des dossiers en cours." },
    { category: "management", text: "Je valorise une initiative positive ou une bonne idée lors de notre prochaine réunion." },
    { category: "management", text: "J'accorde un temps d'écoute active à un collègue en difficulté, sans regarder mes notifications." },
    { category: "management", text: "Je clarifie les objectifs de la semaine pour enlever toute ambiguïté sur les priorités." },
    { category: "management", text: "Je célèbre un succès collectif avec un petit déjeuner ou un café d'équipe." },
    { category: "management", text: "Je prends des nouvelles d'un collaborateur de retour de congé ou d'absence." },
    { category: "management", text: "J'encourage le droit à l'erreur au sein de mon équipe en dédramatisant un petit loupé." },
    { category: "management", text: "Je planifie un entretien individuel informel pour prendre la météo d'un collaborateur." },
    { category: "management", text: "Je délègue une tâche valorisante en accordant ma pleine confiance et autonomie." },
    { category: "management", text: "Je sollicite les avis de chacun lors d'une prise de décision impactant l'équipe." },
    { category: "management", text: "Je partage de manière transparente les informations reçues de la direction." },
    { category: "management", text: "Je demande à mon équipe comment je peux les aider ou lever un point de blocage aujourd'hui." },
    { category: "management", text: "J'évite d'envoyer des e-mails en dehors des heures de travail pour respecter le repos de chacun." },
    { category: "management", text: "J'anime un court atelier de feedback positif pour que chacun exprime sa reconnaissance mutuelle." }
  ],
  carriere: [
    { category: "carriere", text: "Je mets à jour mon profil de compétences sur mon compte formation (CPF)." },
    { category: "carriere", text: "Je note trois réussites personnelles de la semaine pour enrichir mon entretien annuel." },
    { category: "carriere", text: "Je discute d'une opportunité de formation ou de mobilité avec mon conseiller RH." },
    { category: "carriere", text: "Je prends le temps de lire un article ou un document sur les évolutions futures de mon métier." },
    { category: "carriere", text: "J'identifie une nouvelle compétence technique ou humaine que j'aimerais acquérir cette année." },
    { category: "carriere", text: "Je demande un feedback constructif à un collègue de confiance pour m'améliorer." },
    { category: "carriere", text: "Je rejoins ou je participe activement à un groupe de travail transverse de la collectivité." },
    { category: "carriere", text: "Je planifie une rencontre de 15 minutes avec un collègue dont le parcours m'inspire." },
    { category: "carriere", text: "Je range et organise mes projets passés pour créer mon portfolio interne de réalisations." },
    { category: "carriere", text: "Je me fixe un micro-défi professionnel cette semaine pour sortir de ma zone de confort." },
    { category: "carriere", text: "Je rédige une note de synthèse claire sur un projet complexe pour valoriser mon expertise." },
    { category: "carriere", text: "Je propose de former ou d'accompagner un nouveau collègue lors de son intégration." },
    { category: "carriere", text: "Je prépare des propositions d'amélioration concrètes pour le fonctionnement de mon service." },
    { category: "carriere", text: "Je consulte régulièrement la bourse à l'emploi interne pour suivre les opportunités." },
    { category: "carriere", text: "Je m'inscrits à une conférence, un webinaire ou une formation courte en ligne." }
  ],
  detente: [
    { category: "detente", text: "Je ferme les yeux pendant 1 minute et je prends 5 grandes inspirations profondes." },
    { category: "detente", text: "Je fais tourner mes épaules doucement vers l'arrière pour relâcher les tensions du cou." },
    { category: "detente", text: "J'écoute une chanson inspirante ou joyeuse pour recharger mes batteries de bonne humeur." },
    { category: "detente", text: "Je m'éloigne de tous les écrans (PC et smartphone) pendant 15 minutes complètes." },
    { category: "detente", text: "Je prends conscience de ma posture physique et je redresse mon dos sur ma chaise." },
    { category: "detente", text: "Je souris volontairement en pensant à un projet ou un moment agréable récent." },
    { category: "detente", text: "Je m'étire de tout mon long en levant les bras au ciel comme au réveil." },
    { category: "detente", text: "Je regarde par la fenêtre le point le plus éloigné possible pendant 30 secondes pour reposer mes yeux." },
    { category: "detente", text: "Je me prépare une tisane ou un bon thé chaud et je le déguste en pleine conscience." },
    { category: "detente", text: "Je masse mes tempes et ma mâchoire doucement pour relâcher le stress accumulé." },
    { category: "detente", text: "Je fais un exercice de respiration de cohérence cardiaque (5 secondes d'inspiration, 5 secondes d'expiration) pendant 2 minutes." },
    { category: "detente", text: "J'écris sur un carnet trois choses pour lesquelles j'ai de la gratitude aujourd'hui." },
    { category: "detente", text: "Je dessine des gribouillages libres sur une feuille de papier pendant 3 minutes." },
    { category: "detente", text: "Je marche d'un pas tranquille dans les couloirs ou à l'extérieur sans but précis." },
    { category: "detente", text: "Je me lève et je fais quelques mouvements de rotation doux du bassin." }
  ]
};


const SECTORS = [
  { name: "QVT 🧘", color: "#60a5fa", category: "qvt" },         // Soft Blue
  { name: "MANAGEMENT 🤝", color: "#f472b6", category: "management" }, // Soft Pink
  { name: "CARRIÈRE 🚀", color: "#a78bfa", category: "carriere" },   // Soft Purple
  { name: "DÉTENTE ☕", color: "#34d399", category: "detente" },     // Soft Green
  { name: "QVT 🧘", color: "#93c5fd", category: "qvt" },         
  { name: "MANAGEMENT 🤝", color: "#fbcfe8", category: "management" }, 
  { name: "CARRIÈRE 🚀", color: "#c4b5fd", category: "carriere" },   
  { name: "DÉTENTE ☕", color: "#6ee7b7", category: "detente" }      
];

const RouletteQVT: React.FC<RouletteQVTProps> = ({ onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<"all" | "qvt" | "management" | "carriere" | "detente">("all");

  const wheelRef = useRef<SVGSVGElement | null>(null);

  // Génération des secteurs SVG
  const renderSectors = () => {
    return SECTORS.map((sector, i) => {
      const a1 = -90 + i * 45;
      const a2 = -90 + (i + 1) * 45;
      const a1Rad = (a1 * Math.PI) / 180;
      const a2Rad = (a2 * Math.PI) / 180;
      
      const x1 = 150 + 140 * Math.cos(a1Rad);
      const y1 = 150 + 140 * Math.sin(a1Rad);
      const x2 = 150 + 140 * Math.cos(a2Rad);
      const y2 = 150 + 140 * Math.sin(a2Rad);

      const pathData = `M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`;

      // Position de l'icône emoji
      const textAngle = -90 + i * 45 + 22.5;
      const textRad = (textAngle * Math.PI) / 180;
      const tx = 150 + 90 * Math.cos(textRad);
      const ty = 150 + 90 * Math.sin(textRad);
      const textRotation = textAngle + 90;

      // Déterminer l'icône emoji basée sur la catégorie
      let icon = "🧘";
      if (sector.category === "management") icon = "🤝";
      else if (sector.category === "carriere") icon = "🚀";
      else if (sector.category === "detente") icon = "☕";

      return (
        <g key={i} className="select-none pointer-events-none">
          <path 
            d={pathData} 
            fill={sector.color} 
            stroke="rgba(255,255,255,0.25)" 
            strokeWidth="2.5"
            className="transition-colors duration-200"
          />
          <text
            x={tx}
            y={ty}
            transform={`rotate(${textRotation}, ${tx}, ${ty})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
          >
            {icon}
          </text>
        </g>
      );
    });
  };

  const spinWheel = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedIdea(null);
    setCopied(false);

    let targetCategory: "qvt" | "management" | "carriere" | "detente";
    if (currentFilter === "all") {
      const categories: ("qvt" | "management" | "carriere" | "detente")[] = ["qvt", "management", "carriere", "detente"];
      targetCategory = categories[Math.floor(Math.random() * categories.length)];
    } else {
      targetCategory = currentFilter;
    }

    const matchingSectorIndices = SECTORS.reduce<number[]>((acc, s, index) => {
      if (s.category === targetCategory) acc.push(index);
      return acc;
    }, []);

    const targetSectorIndex = matchingSectorIndices[Math.floor(Math.random() * matchingSectorIndices.length)];

    const sectorCenter = targetSectorIndex * 45 + 22.5;
    const targetOffset = 360 - sectorCenter;

    const baseSpins = 4;
    const finalRotation = rotation + (360 - (rotation % 360)) + baseSpins * 360 + targetOffset;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const categoryIdeas = IDEAS[targetCategory];
      const randomIdea = categoryIdeas[Math.floor(Math.random() * categoryIdeas.length)];
      setSelectedIdea(randomIdea);
    }, 4000);
  }, [isSpinning, rotation, currentFilter]);

  const handleCopy = () => {
    if (!selectedIdea) return;
    navigator.clipboard.writeText(selectedIdea.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (cat: "qvt" | "management" | "carriere" | "detente") => {
    switch (cat) {
      case "qvt": return <Smile className="w-5 h-5 text-blue-400" />;
      case "management": return <Heart className="w-5 h-5 text-emerald-400" />;
      case "carriere": return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case "detente": return <Coffee className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCategoryLabel = (cat: "qvt" | "management" | "carriere" | "detente") => {
    switch (cat) {
      case "qvt": return { text: "Idée QVT", bg: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
      case "management": return { text: "Geste Managérial", bg: "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800" };
      case "carriere": return { text: "Astuce Carrière", bg: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800" };
      case "detente": return { text: "Minute Détente", bg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" };
    }
  };

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900  sm: px-4 sm:px-6 lg:px-8 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 z-20">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-bold transition-all text-sm shadow-[0_0_20px_rgba(219,39,119,0.4)] hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-black tracking-widest uppercase bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm" style={{fontFamily: 'monospace'}}>
              ROULETTE QVT
            </h1>
          </div>

          <div className="w-20" />
        </div>

        {/* Title Subtext */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light max-w-lg mx-auto">
            Lancez la roulette pour découvrir une action concrète bien-être, management positif ou conseil carrière.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-slide-up">
          <button
            onClick={() => !isSpinning && setCurrentFilter("all")}
            disabled={isSpinning}
            className={`px-4  text-xs sm:text-sm font-medium rounded-full border transition-all duration-200 ${
              currentFilter === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm"
                : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            }`}
          >
            🎡 Aléatoire
          </button>
          <button
            onClick={() => !isSpinning && setCurrentFilter("qvt")}
            disabled={isSpinning}
            className={`px-4  text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 ${
              currentFilter === "qvt"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-slate-900/60 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 disabled:opacity-50"
            }`}
          >
            🧘 Idée QVT
          </button>
          <button
            onClick={() => !isSpinning && setCurrentFilter("management")}
            disabled={isSpinning}
            className={`px-4  text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 ${
              currentFilter === "management"
                ? "bg-emerald-600 text-white border-emerald-600 shadow"
                : "bg-slate-900/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 disabled:opacity-50"
            }`}
          >
            🤝 Bon Geste Managérial
          </button>
          <button
            onClick={() => !isSpinning && setCurrentFilter("carriere")}
            disabled={isSpinning}
            className={`px-4  text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 ${
              currentFilter === "carriere"
                ? "bg-purple-600 text-white border-purple-600 shadow"
                : "bg-slate-900/60 text-purple-400 border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50"
            }`}
          >
            🚀 Astuce Carrière
          </button>
          <button
            onClick={() => !isSpinning && setCurrentFilter("detente")}
            disabled={isSpinning}
            className={`px-4  text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 ${
              currentFilter === "detente"
                ? "bg-amber-600 text-white border-amber-600 shadow"
                : "bg-slate-900/60 text-amber-400 border-amber-500/30 hover:bg-amber-500/10 disabled:opacity-50"
            }`}
          >
            ☕ Minute Détente
          </button>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Wheel Container */}
          <div className="flex flex-col items-center justify-center relative ">
            {/* Enlarged and glowing responsive container */}
            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[410px] md:h-[410px] mx-auto select-none">
              
              {/* Multi-layered futuristic glow behind the wheel */}
              <div className="absolute -inset-6 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 rounded-full opacity-80 blur-2xl animate-pulse" style={{ animationDuration: "6s" }} />
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full opacity-30 blur-md" />
              
              {/* Outer dark metal-neon framed border overlay */}
              <div className="absolute inset-[-10px] rounded-full border-[10px] border-[#040009] shadow-[0_0_50px_rgba(14,165,233,0.5)] z-20 pointer-events-none ring-4 ring-cyan-500/50" />
              
              {/* Top pointer indicator - neon arrowhead */}
              <div className="absolute top-[-18px] left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] animate-bounce-slow">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-red-500" />
                <div className="w-2 h-3 bg-red-500 mx-auto -mt-0.5 rounded-b shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </div>
              
              {/* SVG Wheel element */}
              <svg
                ref={wheelRef}
                viewBox="0 0 300 300"
                className="w-full h-full relative z-10 select-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none",
                  willChange: "transform",
                }}
              >
                {renderSectors()}
              </svg>

              {/* Center pointer hub button - styled like a premium starting reactor button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-950 flex flex-col items-center justify-center font-bold transition-all duration-300 ${
                  isSpinning 
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 cursor-not-allowed scale-95 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border-slate-800 text-slate-500" 
                    : "bg-gradient-to-br from-[#040009] via-slate-900 to-[#040009] hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-pink-500/40 hover:ring-cyan-500/60 shadow-[0_0_20px_rgba(219,39,119,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] text-white"
                }`}
              >
                <span className={`tracking-widest text-[10px] sm:text-[11px] font-bold ${isSpinning ? 'text-slate-500' : 'text-pink-400 group-hover:text-cyan-300 animate-pulse'}`}>
                  {isSpinning ? "SPIN..." : "LANCER"}
                </span>
              </button>
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="mt-8 px-8  bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-900/40 hover:opacity-95 hover:scale-[1.02] transition-all duration-150 active:scale-98 disabled:opacity-50 flex items-center gap-2 btn-shine relative z-20"
            >
              <Sparkles className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>Je lance la roulette</span>
            </button>
          </div>

          {/* Idea Display card */}
          <div className="flex flex-col justify-center min-h-[220px]">
            {isSpinning && (
              <div className="text-center  animate-pulse">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-300 font-medium">Sélection de votre idée du jour en cours...</p>
                <p className="text-xs text-slate-400 mt-1">La roulette tourne ! 🎡</p>
              </div>
            )}

            {!isSpinning && !selectedIdea && (
              <div className="text-center  border-2 border-dashed border-purple-500/20 rounded-2xl p-6 bg-slate-900/30">
                <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-200 font-semibold text-sm">Prêt à booster votre journée ?</p>
                <p className="text-slate-400 text-xs mt-1">Cliquez sur "LANCER" ou sur le bouton pour obtenir une action concrète.</p>
              </div>
            )}

            {!isSpinning && selectedIdea && (
              <div className="animate-slide-in">
                <div className="bg-gradient-to-br from-slate-900/80 to-purple-950/40 border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  
                  {/* Category badge */}
                  {(() => {
                    const badge = getCategoryLabel(selectedIdea.category);
                    return (
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3  rounded-full text-xs font-bold border ${badge.bg} flex items-center gap-1.5`}>
                          {getCategoryIcon(selectedIdea.category)}
                          {badge.text}
                        </span>
                        
                        <button
                          onClick={handleCopy}
                          className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors duration-150"
                          title="Copier la phrase"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Phrase Text */}
                  <blockquote className="text-lg font-bold text-slate-100 leading-relaxed mb-4 pl-4 border-l-4 border-purple-500">
                    "{selectedIdea.text}"
                  </blockquote>

                  {/* Copy Alert bubble if clicked */}
                  {copied && (
                    <p className="text-xs text-green-400 font-semibold text-right flex items-center justify-end gap-1 animate-pulse">
                      ✓ Copié dans le presse-papiers
                    </p>
                  )}
                </div>

                {/* Feedback cards footer */}
                <div className="mt-4 p-3 bg-purple-950/40 text-purple-200 rounded-2xl text-xs leading-snug flex items-start gap-2 border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Astuce :</strong> Essayez de réaliser cette action aujourd'hui ou préparez-la pour cette semaine ! C'est bon pour votre bien-être au bureau.</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -4px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.6s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default RouletteQVT;
