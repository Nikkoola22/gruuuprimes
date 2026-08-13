import React, { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Users, Heart, Wallet, Scale, Crown, Skull, Volume2, VolumeX, Undo2, Redo2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CardDef {
  id: number;
  character: string;
  characterEmoji: string;
  situation: string;
  choiceLeft: string;
  choiceRight: string;
  effectLeft: { usagers: number; qvt: number; budget: number; conformite: number };
  effectRight: { usagers: number; qvt: number; budget: number; conformite: number };
}

interface Gauges {
  usagers: number;
  qvt: number;
  budget: number;
  conformite: number;
}

// ─── Card Deck ────────────────────────────────────────────────────────────────
const allCards: CardDef[] = [
  {
    id: 1,
    character: "Marie, agente de votre service",
    characterEmoji: "👩‍💼",
    situation: "Marie vous demande de passer en télétravail 3 jours par semaine. Son poste le permet, mais l'équipe est déjà en tension sur les permanences.",
    choiceLeft: "Refuser : l'équipe ne peut pas absorber son absence",
    choiceRight: "Accepter 2 jours et réorganiser le planning",
    effectLeft: { usagers: 5, qvt: -15, budget: 0, conformite: 5 },
    effectRight: { usagers: -5, qvt: 15, budget: 0, conformite: 5 }
  },
  {
    id: 2,
    character: "Deux agents de votre équipe",
    characterEmoji: "⚡",
    situation: "Un conflit éclate entre deux agents à propos du planning des congés d'été. L'un accuse l'autre de passe-droit. L'ambiance se dégrade.",
    choiceLeft: "Laisser couler : ils finiront par s'arranger",
    choiceRight: "Convoquer les deux et arbitrer le planning ensemble",
    effectLeft: { usagers: -5, qvt: -20, budget: 0, conformite: -10 },
    effectRight: { usagers: 0, qvt: 10, budget: 0, conformite: 10 }
  },
  {
    id: 3,
    character: "Votre DGS",
    characterEmoji: "🏛️",
    situation: "Le DGS vous demande de réduire de 20 % les heures supplémentaires de votre service dès le mois prochain.",
    choiceLeft: "Appliquer la consigne sans discuter",
    choiceRight: "Négocier un étalement et expliquer l'impact sur le terrain",
    effectLeft: { usagers: -10, qvt: -15, budget: 15, conformite: 10 },
    effectRight: { usagers: 0, qvt: 5, budget: 5, conformite: 5 }
  },
  {
    id: 4,
    character: "Sébastien, adjoint technique",
    characterEmoji: "🔧",
    situation: "Sébastien vous informe qu'il part en formation CNFPT pendant 5 jours en pleine période de surcharge. Personne ne peut le remplacer.",
    choiceLeft: "Lui demander de reporter la formation",
    choiceRight: "L'y envoyer et répartir sa charge sur l'équipe",
    effectLeft: { usagers: 5, qvt: -10, budget: 0, conformite: -10 },
    effectRight: { usagers: -5, qvt: 10, budget: -5, conformite: 10 }
  },
  {
    id: 5,
    character: "Un usager mécontent",
    characterEmoji: "😤",
    situation: "Un usager se plaint vivement à l'accueil du temps d'attente et exige de voir le responsable. Votre agente d'accueil est en larmes.",
    choiceLeft: "Défendre votre agente et recadrer l'usager",
    choiceRight: "Recevoir l'usager pour calmer la situation",
    effectLeft: { usagers: -15, qvt: 15, budget: 0, conformite: 5 },
    effectRight: { usagers: 10, qvt: -5, budget: 0, conformite: 0 }
  },
  {
    id: 6,
    character: "La DRH",
    characterEmoji: "📋",
    situation: "La DRH vous informe qu'un de vos agents contractuels ne peut pas être renouvelé car son poste n'est plus au tableau des effectifs.",
    choiceLeft: "Accepter et chercher un autre profil en interne",
    choiceRight: "Monter un dossier pour justifier le maintien du poste",
    effectLeft: { usagers: -5, qvt: -10, budget: 10, conformite: 15 },
    effectRight: { usagers: 5, qvt: 5, budget: -10, conformite: -5 }
  },
  {
    id: 7,
    character: "Votre équipe au complet",
    characterEmoji: "👥",
    situation: "Votre équipe demande une réunion de service hebdomadaire pour mieux communiquer. Vous n'avez que peu de créneaux disponibles.",
    choiceLeft: "Refuser : on communique déjà assez par mail",
    choiceRight: "Instaurer un point de 30 min chaque lundi matin",
    effectLeft: { usagers: 0, qvt: -10, budget: 5, conformite: 0 },
    effectRight: { usagers: 5, qvt: 15, budget: -5, conformite: 5 }
  },
  {
    id: 8,
    character: "Nathalie, agente en arrêt",
    characterEmoji: "🤒",
    situation: "Nathalie est en arrêt maladie depuis 3 mois. Son médecin propose un mi-temps thérapeutique mais vous n'avez pas de poste adapté.",
    choiceLeft: "Attendre qu'elle reprenne à temps plein",
    choiceRight: "Aménager un poste temporaire pour faciliter son retour",
    effectLeft: { usagers: 0, qvt: -15, budget: 5, conformite: -5 },
    effectRight: { usagers: 0, qvt: 15, budget: -10, conformite: 10 }
  },
  {
    id: 9,
    character: "Votre N+1",
    characterEmoji: "👔",
    situation: "Votre directeur vous demande les entretiens professionnels de vos 12 agents pour la fin de semaine. Vous n'en avez fait que 3.",
    choiceLeft: "Bâcler les 9 restants pour respecter le délai",
    choiceRight: "Demander un délai supplémentaire pour des entretiens de qualité",
    effectLeft: { usagers: 0, qvt: -10, budget: 0, conformite: -15 },
    effectRight: { usagers: 0, qvt: 10, budget: 0, conformite: 5 }
  },
  {
    id: 10,
    character: "Ahmed, agent d'accueil",
    characterEmoji: "🧑‍💻",
    situation: "Ahmed refuse de porter le badge et la tenue de service. Il invoque sa liberté individuelle.",
    choiceLeft: "Le laisser faire pour éviter le conflit",
    choiceRight: "Lui rappeler le règlement intérieur par écrit",
    effectLeft: { usagers: -5, qvt: 5, budget: 0, conformite: -15 },
    effectRight: { usagers: 5, qvt: -5, budget: 0, conformite: 15 }
  },
  {
    id: 11,
    character: "Un parent d'élève",
    characterEmoji: "📞",
    situation: "Un parent d'élève appelle pour se plaindre du comportement d'une ATSEM de votre service envers son enfant.",
    choiceLeft: "Défendre l'agente sans enquêter",
    choiceRight: "Écouter le parent, enquêter et convoquer l'agente",
    effectLeft: { usagers: -15, qvt: 5, budget: 0, conformite: -10 },
    effectRight: { usagers: 10, qvt: -5, budget: 0, conformite: 10 }
  },
  {
    id: 12,
    character: "Le service informatique",
    characterEmoji: "💻",
    situation: "Le service IT veut déployer un nouveau logiciel métier dans votre service. Vos agents ne sont pas formés et redoutent le changement.",
    choiceLeft: "Refuser tant que les agents ne sont pas formés",
    choiceRight: "Accepter et organiser des sessions de formation",
    effectLeft: { usagers: -5, qvt: 5, budget: 0, conformite: -5 },
    effectRight: { usagers: 10, qvt: -5, budget: -10, conformite: 10 }
  },
  {
    id: 13,
    character: "L'élu de secteur",
    characterEmoji: "🎖️",
    situation: "L'élu vous demande d'affecter un agent sur une mission ponctuelle en dehors de ses attributions. L'agent n'est pas volontaire.",
    choiceLeft: "Obéir à l'élu et imposer la mission",
    choiceRight: "Expliquer qu'il faut l'accord de l'agent et de la DRH",
    effectLeft: { usagers: 5, qvt: -15, budget: 0, conformite: -20 },
    effectRight: { usagers: -5, qvt: 10, budget: 0, conformite: 15 }
  },
  {
    id: 14,
    character: "Votre assistante de direction",
    characterEmoji: "✍️",
    situation: "Votre assistante vous signale qu'un agent pointe régulièrement en retard depuis 3 semaines. Les collègues s'en plaignent.",
    choiceLeft: "Fermer les yeux : c'est peut-être passager",
    choiceRight: "Convoquer l'agent pour un entretien de recadrage",
    effectLeft: { usagers: 0, qvt: -10, budget: 0, conformite: -10 },
    effectRight: { usagers: 0, qvt: 5, budget: 0, conformite: 15 }
  },
  {
    id: 15,
    character: "Le CHSCT / F3SCT",
    characterEmoji: "🛡️",
    situation: "La formation spécialisée relève un risque de TMS pour vos agents qui portent des charges lourdes. Il faudrait du matériel adapté.",
    choiceLeft: "Répondre que le budget est épuisé cette année",
    choiceRight: "Commander le matériel ergonomique en urgence",
    effectLeft: { usagers: 0, qvt: -15, budget: 10, conformite: -15 },
    effectRight: { usagers: 0, qvt: 15, budget: -15, conformite: 15 }
  },
  {
    id: 16,
    character: "Clara, nouvelle recrue",
    characterEmoji: "🌱",
    situation: "Clara, stagiaire depuis 2 mois, vous demande un bilan d'étape. Elle se sent perdue et mal intégrée dans l'équipe.",
    choiceLeft: "Lui dire d'être patiente, ça viendra",
    choiceRight: "Organiser un tutorat avec un agent expérimenté",
    effectLeft: { usagers: 0, qvt: -15, budget: 0, conformite: -5 },
    effectRight: { usagers: 5, qvt: 15, budget: -5, conformite: 10 }
  },
  {
    id: 17,
    character: "Le représentant syndical",
    characterEmoji: "✊",
    situation: "Le représentant syndical vous reproche de ne pas avoir consulté les agents avant de modifier les horaires d'ouverture au public.",
    choiceLeft: "Maintenir votre décision : c'est votre prérogative",
    choiceRight: "Reconnaître l'erreur et organiser une concertation",
    effectLeft: { usagers: 5, qvt: -15, budget: 0, conformite: -10 },
    effectRight: { usagers: -5, qvt: 15, budget: 0, conformite: 10 }
  },
  {
    id: 18,
    character: "Un collègue responsable d'un autre service",
    characterEmoji: "🤝",
    situation: "Un collègue vous demande de lui « prêter » un agent pendant 2 semaines pour un projet urgent. Votre service est déjà chargé.",
    choiceLeft: "Refuser : votre service ne peut pas se le permettre",
    choiceRight: "Accepter en posant des conditions de retour précises",
    effectLeft: { usagers: 5, qvt: 0, budget: 0, conformite: 0 },
    effectRight: { usagers: -5, qvt: -5, budget: 0, conformite: 5 }
  },
  {
    id: 19,
    character: "Un agent en difficulté personnelle",
    characterEmoji: "😔",
    situation: "Un agent fiable habituellement vous confie traverser des problèmes personnels graves. Sa productivité a chuté.",
    choiceLeft: "Rester distant : ce n'est pas votre rôle d'intervenir",
    choiceRight: "L'orienter vers l'assistante sociale et aménager ses horaires",
    effectLeft: { usagers: 0, qvt: -15, budget: 0, conformite: -5 },
    effectRight: { usagers: -5, qvt: 15, budget: -5, conformite: 10 }
  },
  {
    id: 20,
    character: "La Directrice des Finances",
    characterEmoji: "📊",
    situation: "On vous annonce que votre enveloppe de fournitures est amputée de 40 %. Vos agents manquent déjà de matériel.",
    choiceLeft: "Accepter et rationner le matériel",
    choiceRight: "Rédiger une note argumentée pour défendre votre enveloppe",
    effectLeft: { usagers: -10, qvt: -10, budget: 15, conformite: 5 },
    effectRight: { usagers: 5, qvt: 5, budget: -5, conformite: 0 }
  },
  {
    id: 21,
    character: "Votre meilleur agent",
    characterEmoji: "⭐",
    situation: "Votre agent le plus performant vous annonce qu'il a reçu une offre dans une autre collectivité. Il veut savoir si vous pouvez l'aider à évoluer ici.",
    choiceLeft: "Lui souhaiter bonne chance : on ne peut rien promettre",
    choiceRight: "Monter un dossier de promotion interne avec la DRH",
    effectLeft: { usagers: -10, qvt: -15, budget: 5, conformite: 0 },
    effectRight: { usagers: 5, qvt: 15, budget: -10, conformite: 5 }
  },
  {
    id: 22,
    character: "Un groupe d'agents",
    characterEmoji: "☕",
    situation: "Plusieurs agents vous demandent d'aménager un espace de pause convivial. La salle actuelle est vétuste et sombre.",
    choiceLeft: "Ce n'est pas prioritaire avec le budget actuel",
    choiceRight: "Proposer un petit aménagement avec les moyens du service",
    effectLeft: { usagers: 0, qvt: -10, budget: 5, conformite: 0 },
    effectRight: { usagers: 0, qvt: 15, budget: -10, conformite: 0 }
  },
  {
    id: 23,
    character: "Le médecin de prévention",
    characterEmoji: "🩺",
    situation: "Le médecin de prévention signale que 3 agents de votre service montrent des signes d'épuisement professionnel.",
    choiceLeft: "Prendre note, mais ne rien changer à l'organisation",
    choiceRight: "Revoir la charge de travail et proposer un plan QVT",
    effectLeft: { usagers: 0, qvt: -20, budget: 0, conformite: -10 },
    effectRight: { usagers: -5, qvt: 15, budget: -5, conformite: 10 }
  },
  {
    id: 24,
    character: "Le Maire en visite",
    characterEmoji: "🏅",
    situation: "Le Maire visite votre service et remarque un agent qui consulte son téléphone. Il vous demande de sévir.",
    choiceLeft: "Faire un rappel général devant toute l'équipe",
    choiceRight: "Traiter le sujet en privé avec l'agent concerné",
    effectLeft: { usagers: 0, qvt: -15, budget: 0, conformite: 5 },
    characterEmoji: "🎒",
    situation: "Un stagiaire collégien arrive lundi. Aucun programme n'a été préparé et vos agents sont débordés.",
    choiceLeft: "Le mettre dans un coin avec de la documentation",
    choiceRight: "Préparer un planning avec des agents volontaires",
    effectLeft: { usagers: -5, qvt: 0, budget: 0, conformite: -10 },
    effectRight: { usagers: 10, qvt: -5, budget: -5, conformite: 10 }
  }
];

// ─── Gauge Config ─────────────────────────────────────────────────────────────
const gaugeConfig = [
  { key: "usagers" as const, label: "Usagers", icon: Users, color: "from-blue-500 to-cyan-400", textColor: "text-blue-400", bgColor: "bg-blue-500", emoji: "👥" },
  { key: "qvt" as const, label: "Bien-être", icon: Heart, color: "from-rose-500 to-pink-400", textColor: "text-rose-400", bgColor: "bg-rose-500", emoji: "💚" },
  { key: "budget" as const, label: "Budget", icon: Wallet, color: "from-amber-500 to-yellow-400", textColor: "text-amber-400", bgColor: "bg-amber-500", emoji: "💰" },
  { key: "conformite" as const, label: "Conformité", icon: Scale, color: "from-emerald-500 to-green-400", textColor: "text-emerald-400", bgColor: "bg-emerald-500", emoji: "⚖️" },
];

const imageMap: Record<number, string> = {
  1: '/scenarios/scenario_1.png',
  2: '/scenarios/scenario_2.png',
  3: '/scenarios/scenario_3.png',
  4: '/scenarios/scenario_4.png',
  5: '/scenarios/scenario_5.png',
  6: '/scenarios/scenario_6.jpg',
  7: '/scenarios/scenario_7.png',
  8: '/scenarios/scenario_8.jpg',
  9: '/scenarios/scenario_9.jpg',
  10: '/scenarios/scenario_10.png',
  11: '/scenarios/scenario_11.jpg',
  12: '/scenarios/scenario_12.jpg',
  13: '/scenarios/scenario_13.jpg',
  14: '/scenarios/scenario_14.jpg',
  15: '/scenarios/scenario_15.png',
  16: '/scenarios/scenario_16.jpg',
  17: '/scenarios/scenario_17.jpg',
  18: '/scenarios/scenario_18.jpg',
  19: '/scenarios/scenario_19.jpg',
  20: '/scenarios/scenario_20.png',
};

// ─── Helper: shuffle array ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface DirectRHProps {
  onClose: () => void;
}

const DirectRH: React.FC<DirectRHProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [gauges, setGauges] = useState<Gauges>({ usagers: 50, qvt: 50, budget: 50, conformite: 50 });
  const [deck, setDeck] = useState<CardDef[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [previewDir, setPreviewDir] = useState<"left" | "right" | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [showEffect, setShowEffect] = useState<{ usagers: number; qvt: number; budget: number; conformite: number } | null>(null);

  // Drag state
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: "swipe" | "gameover" | "start") => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "swipe") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "gameover") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.3);
      }
    } catch { /* silent */ }
  }, [isMuted, getAudioCtx]);

  const startGame = useCallback(() => {
    setGauges({ usagers: 50, qvt: 50, budget: 50, conformite: 50 });
    setDeck(shuffle(allCards));
    setCardIndex(0);
    setCardsPlayed(0);
    setSwipeDir(null);
    setPreviewDir(null);
    setShowEffect(null);
    setGameOverReason("");
    setGameState("playing");
    playSound("start");
  }, [playSound]);

  const checkGameOver = useCallback((g: Gauges): string | null => {
    for (const gc of gaugeConfig) {
      if (g[gc.key] <= 0) return `${gc.emoji} ${gc.label} est tombé à zéro !`;
      // Ne pas perdre si la conformité ou le bien-être atteint 100%
      if (gc.key !== 'conformite' && gc.key !== 'qvt' && g[gc.key] >= 100) return `${gc.emoji} ${gc.label} a explosé !`;
    }
    return null;
  }, []);

  const applyChoice = useCallback((direction: "left" | "right") => {
    const card = deck[cardIndex];
    if (!card) return;

    const effect = direction === "left" ? card.effectLeft : card.effectRight;
    setShowEffect(effect);
    setSwipeDir(direction);
    playSound("swipe");

    setTimeout(() => {
      const newGauges: Gauges = {
        usagers: Math.max(0, Math.min(100, gauges.usagers + effect.usagers)),
        qvt: Math.max(0, Math.min(100, gauges.qvt + effect.qvt)),
        budget: Math.max(0, Math.min(100, gauges.budget + effect.budget)),
        conformite: Math.max(0, Math.min(100, gauges.conformite + effect.conformite)),
      };

      setGauges(newGauges);
      setCardsPlayed(prev => prev + 1);

      const reason = checkGameOver(newGauges);
      if (reason) {
        setGameOverReason(reason);
        setGameState("gameover");
        playSound("gameover");
        return;
      }

      // Next card
      let nextIndex = cardIndex + 1;
      let nextDeck = deck;
      if (nextIndex >= deck.length) {
        nextDeck = shuffle(allCards);
        nextIndex = 0;
        setDeck(nextDeck);
      }
      setCardIndex(nextIndex);
      setSwipeDir(null);
      setPreviewDir(null);
      setShowEffect(null);
      setDragOffset(0);
    }, 350);
  }, [deck, cardIndex, gauges, checkGameOver, playSound]);

  // ─── Touch / Mouse drag ─────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (swipeDir) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [swipeDir]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    dragCurrentX.current = e.clientX;
    const offset = dragCurrentX.current - dragStartX.current;
    setDragOffset(offset);
    if (Math.abs(offset) > 30) {
      setPreviewDir(offset < 0 ? "left" : "right");
    } else {
      setPreviewDir(null);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = dragCurrentX.current - dragStartX.current;
    if (Math.abs(offset) > 80) {
      applyChoice(offset < 0 ? "left" : "right");
    } else {
      setDragOffset(0);
      setPreviewDir(null);
    }
  }, [applyChoice]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") applyChoice("left");
      if (e.key === "ArrowRight") applyChoice("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, applyChoice]);

  const currentCard = deck[cardIndex];

  // ─── Gauge bar component ────────────────────────────────────────────────────
  const GaugeBarVertical = ({ label, color, textColor, emoji, value, delta }: { label: string; color: string; textColor: string; emoji: string; value: number; delta: number | null }) => {
    const isWarning = value <= 15 || value >= 85;
    const isDanger = value <= 5 || value >= 95;
    return (
      <div className="flex flex-col items-center gap-1.5 w-14">
        <span className="text-lg">{emoji}</span>
        <div className={`relative w-5 h-28 rounded-full overflow-hidden bg-slate-800/80 border ${isDanger ? "border-red-500 animate-pulse" : isWarning ? "border-amber-500/60" : "border-slate-700/50"}`}>
          <div
            className={`absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t ${color} transition-all duration-500 ease-out`}
            style={{ height: `${Math.max(2, value)}%` }}
          />
          {delta !== null && delta !== 0 && (
            <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-black ${delta > 0 ? "text-emerald-300" : "text-red-300"} drop-shadow-lg animate-bounce`}>
              {delta > 0 ? `+${delta}` : delta}
            </div>
          )}
        </div>
        <span className={`text-[10px] font-mono font-bold ${textColor}`}>{value}%</span>
        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide leading-tight text-center">{label}</span>
      </div>
    );
  };

  // ─── MENU ───────────────────────────────────────────────────────────────────
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[150px]" />
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer absolute top-6 left-6 z-50"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>

        <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 z-50 p-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="relative z-10 text-center max-w-lg">
          <div className="text-7xl mb-6 animate-bounce">👔</div>
          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-4 tracking-tight">
            Défi du Responsable
          </h1>
          <p className="text-slate-400 text-lg mb-2">Jeu de choix narratif — Style Reigns</p>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Incarnez un responsable de service dans une collectivité. Des situations concrètes défilent : swipez à gauche ou à droite pour décider. Maintenez vos 4 jauges en équilibre ou c'est la fin !
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
            {gaugeConfig.map(g => (
              <div key={g.key} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <span className="text-lg">{g.emoji}</span>
                <span className="text-xs text-slate-400 font-medium">{g.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Crown className="w-5 h-5 inline mr-2" />
            Prendre ses fonctions
          </button>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-600">
            <span>← Gauche pour refuser</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span>Droite pour accepter →</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME OVER ──────────────────────────────────────────────────────────────
  if (gameState === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="text-8xl mb-6"><Skull className="w-24 h-24 mx-auto text-red-400 animate-pulse" /></div>
          <h2 className="text-4xl sm:text-5xl font-black text-red-300 mb-3">Vous êtes convoqué par votre directeur.</h2>
          <p className="text-slate-500 mb-8">Vous avez survécu <span className="text-white font-bold">{cardsPlayed}</span> décision{cardsPlayed > 1 ? "s" : ""}.</p>

          <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
            {gaugeConfig.map(g => (
              <div key={g.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${gauges[g.key] <= 0 || gauges[g.key] >= 100 ? "bg-red-900/30 border-red-500/50" : "bg-slate-800/50 border-slate-700/30"}`}>
                <span className="text-lg">{g.emoji}</span>
                <span className="text-xs text-slate-400 font-medium">{g.label}</span>
                <span className={`ml-auto text-sm font-bold ${gauges[g.key] <= 0 || gauges[g.key] >= 100 ? "text-red-400" : "text-slate-300"}`}>{gauges[g.key]}%</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95">
              <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
            </button>
            <button onClick={onClose} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700/50 transition-all active:scale-95 cursor-pointer">
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ────────────────────────────────────────────────────────────────
  const rotation = dragOffset * 0.08;
  const opacity = Math.max(0.3, 1 - Math.abs(dragOffset) / 400);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 flex flex-col relative overflow-hidden select-none">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-800/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-800/10 rounded-full blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Décision #{cardsPlayed + 1}</span>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-sm font-bold text-indigo-300">👔 Défi du Responsable</span>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-slate-400 hover:text-white transition-colors hover:scale-110 active:scale-95 cursor-pointer">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main play area: gauges flanking card */}
      <div className="flex-1 flex items-center justify-center px-2 py-4 relative z-10">

        {/* Left gauges (Usagers + Bien-être) */}
        <div className="flex flex-col items-center gap-6 mr-2 sm:mr-4">
          {gaugeConfig.slice(0, 2).map(g => (
            <GaugeBarVertical
              key={g.key}
              label={g.label}
              color={g.color}
              textColor={g.textColor}
              emoji={g.emoji}
              value={gauges[g.key]}
              delta={showEffect ? showEffect[g.key] : null}
            />
          ))}
        </div>

        {/* Center: card + choices */}
        <div className="flex flex-col items-center flex-1 max-w-sm relative">
          {/* Direction hints */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 transition-all duration-300 pointer-events-none z-20 ${previewDir === "left" ? "opacity-100 scale-125" : "opacity-80 animate-[bounce_2s_infinite]"}`}>
            <div className="px-2 py-2 bg-indigo-500/30 border border-indigo-400/60 rounded-full shadow-lg shadow-indigo-500/40">
              <Undo2 className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 transition-all duration-300 pointer-events-none z-20 ${previewDir === "right" ? "opacity-100 scale-125" : "opacity-80 animate-[bounce_2s_infinite_0.5s]"}`}>
            <div className="px-2 py-2 bg-emerald-500/30 border border-emerald-400/60 rounded-full shadow-lg shadow-emerald-500/40">
              <Redo2 className="w-5 h-5 text-emerald-300" />
            </div>
          </div>

          {currentCard && (
            <div
              ref={cardRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`relative w-full cursor-grab active:cursor-grabbing touch-none transition-transform ${swipeDir ? "duration-300" : "duration-0"}`}
              style={{
                transform: swipeDir
                  ? `translateX(${swipeDir === "left" ? -600 : 600}px) rotate(${swipeDir === "left" ? -30 : 30}deg)`
                  : `translateX(${dragOffset}px) rotate(${rotation}deg)`,
                opacity: swipeDir ? 0 : opacity,
              }}
            >
              {/* Card */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/40 backdrop-blur-md overflow-hidden relative">

                {/* ── Swipe overlay stamps ── */}
                {currentCard && (
                  <>
                    {/* LEFT swipe stamp */}
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-150"
                      style={{ opacity: previewDir === "left" ? Math.min(1, Math.abs(dragOffset) / 120) : 0 }}
                    >
                      <div className="bg-indigo-500/90 backdrop-blur-sm rounded-2xl px-5 py-3 -rotate-12 border-2 border-indigo-300 shadow-2xl shadow-indigo-500/40 max-w-[80%]">
                        <p className="text-white font-black text-sm sm:text-base text-center leading-snug">{currentCard.choiceLeft}</p>
                      </div>
                    </div>
                    {/* RIGHT swipe stamp */}
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-150"
                      style={{ opacity: previewDir === "right" ? Math.min(1, Math.abs(dragOffset) / 120) : 0 }}
                    >
                      <div className="bg-emerald-500/90 backdrop-blur-sm rounded-2xl px-5 py-3 rotate-12 border-2 border-emerald-300 shadow-2xl shadow-emerald-500/40 max-w-[80%]">
                        <p className="text-white font-black text-sm sm:text-base text-center leading-snug">{currentCard.choiceRight}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Character header */}
                <div className="px-5 pt-5 pb-3 border-b border-slate-700/30 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentCard.characterEmoji}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{currentCard.character}</p>
                      <p className="text-indigo-400/70 text-xs">vous interpelle...</p>
                    </div>
                  </div>
                </div>

                {/* Situation */}
                <div className="px-5 py-4">
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{currentCard.situation}</p>
                  {imageMap[currentCard.id] && (
                    <img src={imageMap[currentCard.id]} alt={`Scenario ${currentCard.id}`} className="mt-3 rounded-lg max-w-full" />
                  )}
                </div>

                {/* Choices — side by side */}
                <div className="px-3 pb-4 flex gap-2">
                  <button
                    onClick={() => !swipeDir && applyChoice("left")}
                    disabled={!!swipeDir}
                    className={`flex-1 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-center leading-snug transition-all duration-200 disabled:opacity-40 active:scale-[0.97]
                      ${previewDir === "left"
                        ? "bg-indigo-500/25 border-2 border-indigo-400/60 text-indigo-200 shadow-lg shadow-indigo-500/10 scale-[1.03]"
                        : "bg-slate-800/60 border-2 border-slate-700/40 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-200"}`}
                  >
                    <ChevronLeft className="w-4 h-4 mx-auto mb-1 opacity-60" />
                    {currentCard.choiceLeft}
                  </button>
                  <button
                    onClick={() => !swipeDir && applyChoice("right")}
                    disabled={!!swipeDir}
                    className={`flex-1 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-center leading-snug transition-all duration-200 disabled:opacity-40 active:scale-[0.97]
                      ${previewDir === "right"
                        ? "bg-emerald-500/25 border-2 border-emerald-400/60 text-emerald-200 shadow-lg shadow-emerald-500/10 scale-[1.03]"
                        : "bg-slate-800/60 border-2 border-slate-700/40 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-200"}`}
                  >
                    <ChevronRight className="w-4 h-4 mx-auto mb-1 opacity-60" />
                    {currentCard.choiceRight}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-slate-600 text-xs mt-4">Swipez la carte ou cliquez un choix</p>
        </div>

        {/* Right gauges (Budget + Conformité) */}
        <div className="flex flex-col items-center gap-6 ml-2 sm:ml-4">
          {gaugeConfig.slice(2, 4).map(g => (
            <GaugeBarVertical
              key={g.key}
              label={g.label}
              color={g.color}
              textColor={g.textColor}
              emoji={g.emoji}
              value={gauges[g.key]}
              delta={showEffect ? showEffect[g.key] : null}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default DirectRH;
