import React, { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, RotateCcw, Users, Heart, Wallet, Scale, Skull, Volume2, VolumeX, Undo2, Redo2 } from "lucide-react";

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
  21: '/scenarios/scenario_21.jpg',
  22: '/scenarios/scenario_22.jpg',
  23: '/scenarios/scenario_23.jpg',
  24: '/scenarios/scenario_24.jpg',
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
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

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
    }, 750);
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

  // ─── Gauge Header Component ──────────────────────────────────────────────────
  const GaugeHeader = () => (
    <div className="flex justify-center items-center gap-2 sm:gap-6 w-full max-w-2xl mx-auto px-2">
      {gaugeConfig.map(g => {
        const val = gauges[g.key];
        const isWarning = val <= 15 || val >= 85;
        const isDanger = val <= 5 || val >= 95;
        const delta = showEffect ? showEffect[g.key] : null;
        return (
          <div key={g.key} className="flex flex-col items-center relative group">
            <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full border-2 ${isDanger ? "border-red-500 animate-pulse" : isWarning ? "border-amber-400" : "border-white/40"} shadow-lg`}>
              <span className="text-lg sm:text-xl drop-shadow-md">{g.emoji}</span>
              {/* Circular progress overlay could go here, but simple fill is fine */}
              <div className="absolute -bottom-1 -right-1 bg-teal-900 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-teal-500/50">
                {val}%
              </div>
              {delta !== null && delta !== 0 && (
                <div className={`absolute -top-4 font-black text-[12px] sm:text-xs drop-shadow-lg animate-[bounce_1s_infinite] ${delta > 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {delta > 0 ? `+${delta}` : delta}
                </div>
              )}
            </div>
            <span className="text-[9px] text-teal-100 font-bold uppercase tracking-wider mt-1.5 hidden sm:block drop-shadow-md">{g.label}</span>
          </div>
        );
      })}
    </div>
  );

  // ─── MENU ───────────────────────────────────────────────────────────────────
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-400 via-teal-500 to-teal-700 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Underwater/Xmas background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bubbles / snow */}
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute bg-white/20 rounded-full" style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float-up ${Math.random() * 5 + 5}s infinite linear`
            }} />
          ))}
          {/* Seaweed / Coral bottom silhouettes */}
          <div className="absolute bottom-0 inset-x-0 h-48 opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-900 to-transparent" />
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 border border-white/30 backdrop-blur-md transition-all duration-200 absolute top-6 left-6 z-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quitter</span>
        </button>

        <button onClick={() => setIsMuted(!isMuted)} className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-block px-4 py-1.5 mb-6 border-2 border-dashed border-teal-200/50 rounded-lg transform -rotate-2 bg-teal-800/30 backdrop-blur-sm">
            <span className="text-teal-100 font-bold tracking-widest text-sm uppercase">Caledonian Style</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-2 tracking-tight drop-shadow-xl" style={{ fontFamily: 'Impact, sans-serif' }}>
            DÉFI DU
          </h1>
          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-100 to-white mb-6 drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
            RESPONSABLE
          </h1>
          
          <p className="text-teal-100 text-lg mb-8 max-w-md mx-auto font-medium drop-shadow-md">
            Découvrez les défis du management RH !<br/>Swipez à droite si vous acceptez, ou à gauche pour refuser.
          </p>

          <button
            onClick={startGame}
            className="px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white font-black text-xl rounded-full shadow-[0_8px_0_rgba(13,148,136,1)] hover:shadow-[0_4px_0_rgba(13,148,136,1)] hover:translate-y-1 transition-all duration-200 uppercase tracking-wider border-2 border-white/20"
          >
            Jouer maintenant
          </button>
        </div>
      </div>
    );
  }

  // ─── GAME OVER ──────────────────────────────────────────────────────────────
  if (gameState === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-teal-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-lg bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="text-8xl mb-6"><Skull className="w-24 h-24 mx-auto text-red-400 drop-shadow-lg" /></div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Fin de mandat.</h2>
          {gameOverReason && <p className="text-amber-300 font-semibold text-sm mb-4 px-2">{gameOverReason}</p>}
          <p className="text-teal-200 mb-8 font-medium">Vous avez tenu <span className="text-white font-black text-xl">{cardsPlayed}</span> décision{cardsPlayed > 1 ? "s" : ""}.</p>

          <div className="flex gap-4 justify-center">
            <button onClick={startGame} className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wide">
              <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/30 transition-all active:scale-95">
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
    <div className="min-h-screen bg-gradient-to-b from-teal-400 via-teal-500 to-teal-700 flex flex-col relative overflow-hidden select-none">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute bg-white/20 rounded-full" style={{
            width: Math.random() * 8 + 4 + 'px',
            height: Math.random() * 8 + 4 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float-up ${Math.random() * 5 + 5}s infinite linear`
          }} />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes float-up {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }
      `}} />

      {/* Top bar */}
      <div className="relative z-20 flex flex-col items-center pt-6 pb-2 w-full">
        <div className="flex justify-between items-center w-full px-4 mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow-md hover:scale-105 active:scale-95 border border-white/30 backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <span className="bg-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/30 shadow-sm backdrop-blur-md">
              Score: {cardsPlayed}
            </span>
          </div>

          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Gauges Header */}
        <GaugeHeader />
      </div>

      {/* Main play area */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 relative z-10 w-full max-w-4xl mx-auto">
        
        {/* The Card & Side Buttons Container */}
        <div className="flex items-center justify-center w-full gap-4 sm:gap-12">
          
          {/* Left Button (Refuser) */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <button 
              onClick={() => !swipeDir && applyChoice("left")}
              className={`w-16 h-16 rounded-full bg-teal-900 border-4 border-teal-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${previewDir === 'left' ? 'scale-110 bg-teal-800' : ''}`}
            >
              <div className="text-white text-3xl font-black">✕</div>
            </button>
            <div className="flex items-center gap-2">
              <Undo2 className="w-6 h-6 text-teal-800 shrink-0" />
              <span className="text-teal-950 font-bold text-xs sm:text-sm text-center w-36 sm:w-48 leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                {currentCard?.choiceLeft}
              </span>
            </div>
          </div>

          {/* Center Card */}
          <div className="relative w-full max-w-[290px] sm:max-w-sm">
            {currentCard && (
              <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`relative w-full cursor-grab active:cursor-grabbing touch-none transition-all ${swipeDir ? "duration-700 ease-in-out" : "duration-0"}`}
                style={{
                  transform: swipeDir
                    ? `translateX(${swipeDir === "left" ? -600 : 600}px) rotate(${swipeDir === "left" ? -30 : 30}deg)`
                    : `translateX(${dragOffset}px) rotate(${rotation}deg)`,
                  opacity: swipeDir ? 0 : opacity,
                }}
              >
                {/* Polaroid styling */}
                <div className="bg-white p-3.5 pb-5 rounded-sm shadow-2xl shadow-teal-900/50 relative">
                  
                  {/* Image Area */}
                  <div className="aspect-[4/3.8] sm:aspect-[4/5] bg-slate-100 mb-3 overflow-hidden relative border border-slate-200">
                    {imageMap[currentCard.id] && !imgErrorMap[currentCard.id] ? (
                      <img
                        src={imageMap[currentCard.id]}
                        alt="Scenario"
                        className="w-full h-full object-cover"
                        onError={() => setImgErrorMap(prev => ({ ...prev, [currentCard.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-700 p-4 text-center text-white relative shadow-inner">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-lg border border-white/30">
                          <span className="text-4xl sm:text-5xl drop-shadow-md">{currentCard.characterEmoji}</span>
                        </div>
                        <span className="text-sm sm:text-base font-extrabold tracking-wide uppercase drop-shadow-md">{currentCard.character}</span>
                      </div>
                    )}
                    
                    {/* Stamps overlay */}
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-150"
                      style={{ opacity: previewDir === "left" ? Math.min(1, Math.abs(dragOffset) / 120) : (swipeDir === "left" ? 1 : 0) }}
                    >
                      <div className="border-4 border-red-500 rounded-lg px-4 py-2 -rotate-12 bg-white/80 backdrop-blur-sm shadow-lg">
                        <p className="text-red-500 font-black text-2xl uppercase tracking-wider">Refusé</p>
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-150"
                      style={{ opacity: previewDir === "right" ? Math.min(1, Math.abs(dragOffset) / 120) : (swipeDir === "right" ? 1 : 0) }}
                    >
                      <div className="border-4 border-emerald-500 rounded-lg px-4 py-2 rotate-12 bg-white/80 backdrop-blur-sm shadow-lg">
                        <p className="text-emerald-500 font-black text-2xl uppercase tracking-wider">Accepté</p>
                      </div>
                    </div>
                  </div>

                  {/* Text content under image (Polaroid bottom area) */}
                  <div className="text-center">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm mb-1 uppercase tracking-wide border-b border-slate-200 pb-1.5">
                      {currentCard.character}
                    </p>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mt-1.5 font-medium" style={{ fontFamily: "'Caveat', cursive, sans-serif" }}>
                      "{currentCard.situation}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Button (Accepter) */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <button 
              onClick={() => !swipeDir && applyChoice("right")}
              className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${previewDir === 'right' ? 'scale-110 shadow-xl' : ''}`}
            >
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-teal-950 font-bold text-xs sm:text-sm text-center w-36 sm:w-48 leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                {currentCard?.choiceRight}
              </span>
              <Redo2 className="w-6 h-6 text-teal-800 shrink-0" />
            </div>
          </div>
        </div>

        {/* Mobile action choices (Full readable decision cards) */}
        <div className="flex flex-col sm:hidden items-stretch gap-2.5 mt-4 w-full max-w-[340px] px-1">
          {/* Refuser / Left Choice */}
          <button 
            onClick={() => !swipeDir && applyChoice("left")}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-teal-950/90 border-2 transition-all active:scale-[0.98] shadow-lg text-left ${previewDir === 'left' ? 'border-red-400 bg-red-950/70 ring-2 ring-red-400/50' : 'border-red-500/50 hover:border-red-400'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 text-base font-black shrink-0 shadow-inner">
              ✕
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-red-300 uppercase tracking-wider block">Glisser à gauche / Refuser :</span>
              <span className="text-xs font-bold text-white leading-snug block mt-0.5">
                {currentCard?.choiceLeft}
              </span>
            </div>
          </button>

          {/* Accepter / Right Choice */}
          <button 
            onClick={() => !swipeDir && applyChoice("right")}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-white border-2 transition-all active:scale-[0.98] shadow-lg text-left ${previewDir === 'right' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50' : 'border-emerald-500/50 hover:border-emerald-500'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Glisser à droite / Accepter :</span>
              <span className="text-xs font-bold text-slate-900 leading-snug block mt-0.5">
                {currentCard?.choiceRight}
              </span>
            </div>
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default DirectRH;
