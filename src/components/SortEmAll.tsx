import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, Play, Timer, FileText, Inbox, Trophy, Volume2, VolumeX, 
  Flame, Building2, ShieldAlert, Users, HeartPulse, 
  FileSpreadsheet, HelpCircle, RotateCcw, Keyboard
} from "lucide-react";
import confetti from "canvas-confetti";

interface SortEmAllProps {
  onClose: () => void;
}

type TargetBin = "CST" | "F3SCT" | "CAP" | "CM" | "RH";

interface Dossier {
  text: string;
  target: TargetBin;
  urgency?: "HAUTE" | "NORMALE" | "EXTRÊME";
  code?: string;
}

// ─── DOSSIERS EXPANDED DECK ──────────────────────────────────────────────────
const DOSSIERS: Dossier[] = [
  // CST - Comité Social Territorial (Orga, Temps de travail, LDG, Bilan social)
  { text: "Avis sur le projet de règlement intérieur de la collectivité", target: "CST", urgency: "NORMALE" },
  { text: "Aménagement des horaires de travail pour l'ensemble de la police municipale", target: "CST", urgency: "HAUTE" },
  { text: "Projet de réorganisation globale de la Direction Informatique", target: "CST", urgency: "NORMALE" },
  { text: "Adoption des Lignes Directrices de Gestion (LDG) relatives à la promotion", target: "CST", urgency: "NORMALE" },
  { text: "Mise en place de la charte de télétravail pour les services administratifs", target: "CST", urgency: "HAUTE" },
  { text: "Avis sur la suppression d'un poste permanent suite à mutualisation", target: "CST", urgency: "EXTRÊME" },
  { text: "Validation du Rapport Social Unique (RSU) annuel", target: "CST", urgency: "NORMALE" },

  // F3SCT - Formation Spécialisée (Santé, Sécurité, DUERP, Alertes)
  { text: "Droit d'alerte exercé pour Danger Grave et Imminent à la déchèterie", target: "F3SCT", urgency: "EXTRÊME" },
  { text: "Mise à jour du Document Unique d'Évaluation des Risques (DUERP)", target: "F3SCT", urgency: "NORMALE" },
  { text: "Enquête obligatoire suite à un accident de service ayant entraîné un décès", target: "F3SCT", urgency: "EXTRÊME" },
  { text: "Adoption du programme annuel de prévention des risques professionnels", target: "F3SCT", urgency: "NORMALE" },
  { text: "Évaluation de la charge mentale et des risques psychosociaux (RPS) au CCT", target: "F3SCT", urgency: "HAUTE" },
  { text: "Signalement d'insalubrité et d'amiante dans le garage municipal", target: "F3SCT", urgency: "HAUTE" },

  // CAP / CCP - Commission Administrative / Consultative Paritaire (Individuel, Discipline)
  { text: "Refus de titularisation d'un agent stagiaire à l'issue de l'année d'essai", target: "CAP", urgency: "EXTRÊME" },
  { text: "Procédure de licenciement pour insuffisance professionnelle constatée", target: "CAP", urgency: "HAUTE" },
  { text: "Recours formé par un agent contestant son compte-rendu d'évaluation (CREP)", target: "CAP", urgency: "HAUTE" },
  { text: "Sanction disciplinaire du 3ème groupe (Exclusion temporaire de 15 jours)", target: "CAP", urgency: "EXTRÊME" },
  { text: "Deuxième refus successif d'une demande de temps partiel ou de disponibilité", target: "CAP", urgency: "NORMALE" },
  { text: "Refus d'octroi d'un congé pour formation syndicale", target: "CAP", urgency: "NORMALE" },

  // CM - Conseil Médical (Maladie pro, CLM, CLD, Inaptitude)
  { text: "Demande d'octroi d'un Congé de Longue Maladie (CLM) de 6 mois", target: "CM", urgency: "HAUTE" },
  { text: "Saisine pour reconnaissance de maladie professionnelle suite à burn-out", target: "CM", urgency: "HAUTE" },
  { text: "Avis sur l'inaptitude définitive d'un agent à l'exercice de toutes fonctions", target: "CM", urgency: "EXTRÊME" },
  { text: "Prolongation d'un Congé de Longue Durée (CLD) au-delà de 3 ans", target: "CM", urgency: "NORMALE" },
  { text: "Demande de Temps Partiel Thérapeutique après épuisement des droits simples", target: "CM", urgency: "NORMALE" },
  { text: "Dossier de mise à la retraite pour invalidité non imputable au service", target: "CM", urgency: "HAUTE" },

  // RH - Service des Ressources Humaines (Gestion directe)
  { text: "Demande de pose de 3 jours de congés annuels et RTT", target: "RH", urgency: "NORMALE" },
  { text: "Reclamation pour erreur de montant sur la fiche de paie de juillet", target: "RH", urgency: "HAUTE" },
  { text: "Demande d'attestation d'emploi pour la souscription d'un prêt immobilier", target: "RH", urgency: "NORMALE" },
  { text: "Calcul et versement de l'indemnité de fin de contrat (prime de précarité)", target: "RH", urgency: "NORMALE" },
  { text: "Notification de saisie administrative à tiers (SATD) sur traitement", target: "RH", urgency: "EXTRÊME" },
  { text: "Inscription à une session de formation de perfectionnement CNFPT", target: "RH", urgency: "NORMALE" },
];

// ─── BINS CONFIGURATION ──────────────────────────────────────────────────────
const BINS: { 
  id: TargetBin; 
  label: string; 
  title: string; 
  desc: string; 
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: {
    bg: string;
    border: string;
    text: string;
    glow: string;
    keyColor: string;
  }
}[] = [
  { 
    id: "CST", 
    label: "CST", 
    title: "Comité Social Territorial",
    desc: "Organisation, temps de travail, LDG, règlements collectifs", 
    badge: "[1] ou [C]",
    icon: Building2,
    theme: {
      bg: "bg-gradient-to-b from-blue-900/60 to-slate-900/80 hover:from-blue-800/80 hover:to-slate-800/90",
      border: "border-blue-500/40 hover:border-blue-400",
      text: "text-blue-300",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      keyColor: "bg-blue-500/20 text-blue-300 border-blue-400/40"
    }
  },
  { 
    id: "F3SCT", 
    label: "F3SCT", 
    title: "Santé, Sécurité & Conditions",
    desc: "DUERP, danger grave, enquêtes accidents, risques pro", 
    badge: "[2] ou [F]",
    icon: ShieldAlert,
    theme: {
      bg: "bg-gradient-to-b from-red-900/60 to-slate-900/80 hover:from-red-800/80 hover:to-slate-800/90",
      border: "border-red-500/40 hover:border-red-400",
      text: "text-red-300",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      keyColor: "bg-red-500/20 text-red-300 border-red-400/40"
    }
  },
  { 
    id: "CAP", 
    label: "CAP / CCP", 
    title: "Instances Paritaires",
    desc: "Discipline, licenciement, recours CREP, titularisation", 
    badge: "[3] ou [A]",
    icon: Users,
    theme: {
      bg: "bg-gradient-to-b from-purple-900/60 to-slate-900/80 hover:from-purple-800/80 hover:to-slate-800/90",
      border: "border-purple-500/40 hover:border-purple-400",
      text: "text-purple-300",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      keyColor: "bg-purple-500/20 text-purple-300 border-purple-400/40"
    }
  },
  { 
    id: "CM", 
    label: "C. Médical", 
    title: "Conseil Médical",
    desc: "CLM, CLD, inaptitude définitive, maladie professionnelle", 
    badge: "[4] ou [M]",
    icon: HeartPulse,
    theme: {
      bg: "bg-gradient-to-b from-emerald-900/60 to-slate-900/80 hover:from-emerald-800/80 hover:to-slate-800/90",
      border: "border-emerald-500/40 hover:border-emerald-400",
      text: "text-emerald-300",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      keyColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
    }
  },
  { 
    id: "RH", 
    label: "Service RH", 
    title: "Gestion RH Directe",
    desc: "Congés, erreurs paie, attestations, prime de précarité", 
    badge: "[5] ou [R]",
    icon: FileSpreadsheet,
    theme: {
      bg: "bg-gradient-to-b from-amber-900/60 to-slate-900/80 hover:from-amber-800/80 hover:to-slate-800/90",
      border: "border-amber-500/40 hover:border-amber-400",
      text: "text-amber-300",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      keyColor: "bg-amber-500/20 text-amber-300 border-amber-400/40"
    }
  },
];

// ─── WEB AUDIO SOUND SYNTHESIZER ─────────────────────────────────────────────
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Sound enabled by default, initialized on first user click
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playCardSlide() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio context fallbacks
    }
  }

  playStampSuccess(multiplier: number = 1) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const baseFreq = 520 + Math.min(multiplier * 60, 400);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio context fallbacks
    }
  }

  playStampError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio context fallbacks
    }
  }

  playGameOverFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.1);
        osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.3);
      });
    } catch {
      // Audio context fallbacks
    }
  }
}

const sfx = new SoundEffects();

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const SortEmAll: React.FC<SortEmAllProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("sortemall_highscore") || "0", 10);
    } catch {
      return 0;
    }
  });

  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const [deck, setDeck] = useState<Dossier[]>([]);
  const [currentDossier, setCurrentDossier] = useState<Dossier | null>(null);

  const [feedback, setFeedback] = useState<{ id: number; text: string; subText?: string; type: "success" | "error" }[]>([]);
  const feedbackIdRef = useRef(0);

  const [animateCard, setAnimateCard] = useState<{ binId: TargetBin; direction: "left" | "right" | "down" } | null>(null);

  // Sync sound toggle
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState("gameover");
            sfx.playGameOverFanfare();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Save High Score & trigger celebration
  useEffect(() => {
    if (gameState === "gameover") {
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem("sortemall_highscore", score.toString());
        } catch {
          // localStorage disabled
        }
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  }, [gameState, score, highScore]);

  // Start game function
  const startGame = useCallback(() => {
    const shuffleList = (arr: Dossier[]) => [...arr].sort(() => Math.random() - 0.5);
    // Double shuffle to make 60+ dossier stack
    const initialDeck = [...shuffleList(DOSSIERS), ...shuffleList(DOSSIERS)].map((d, i) => ({
      ...d,
      code: `REF-2026/FPT-${Math.floor(1000 + Math.random() * 9000)}-${i + 1}`
    }));

    setDeck(initialDeck);
    setCurrentDossier(initialDeck[0]);
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setMaxCombo(0);
    setProcessedCount(0);
    setCorrectCount(0);
    setGameState("playing");
    sfx.playCardSlide();
  }, []);

  const showFeedback = (text: string, subText: string | undefined, type: "success" | "error") => {
    const id = feedbackIdRef.current++;
    setFeedback((prev) => [...prev, { id, text, subText, type }]);
    setTimeout(() => {
      setFeedback((prev) => prev.filter((f) => f.id !== id));
    }, 750);
  };

  const handleSort = useCallback((binId: TargetBin) => {
    if (gameState !== "playing" || !currentDossier || animateCard) return;

    // Card exit direction mapping
    const direction = binId === "CST" || binId === "F3SCT" ? "left" : binId === "CAP" ? "down" : "right";
    setAnimateCard({ binId, direction });

    const isCorrect = currentDossier.target === binId;

    setTimeout(() => {
      setProcessedCount(p => p + 1);

      if (isCorrect) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        const multiplier = Math.min(Math.floor(newCombo / 3) + 1, 5);
        const points = 100 * multiplier;

        setScore((s) => s + points);
        setCorrectCount((c) => c + 1);

        // Time bonus (+1s normally, +2s on combo streak >= 5)
        const timeAdd = newCombo >= 5 ? 2 : 1;
        setTimeLeft((t) => Math.min(t + timeAdd, 99));

        sfx.playStampSuccess(multiplier);
        showFeedback("TRANSFÉRÉ ✅", multiplier > 1 ? `COMBO x${multiplier} (+${points} pts)` : `+${points} pts`, "success");

        if (newCombo % 5 === 0) {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        }
      } else {
        setCombo(0);
        setTimeLeft((t) => Math.max(t - 5, 0));
        sfx.playStampError();
        showFeedback("ERREUR DE TRI ❌", `Rediriger vers : ${currentDossier.target} (-5s)`, "error");
      }

      // Draw next dossier
      const newDeck = deck.slice(1);
      if (newDeck.length === 0) {
        const shuffleList = (arr: Dossier[]) => [...arr].sort(() => Math.random() - 0.5);
        const refilled = shuffleList(DOSSIERS).map((d, i) => ({
          ...d,
          code: `REF-2026/FPT-${Math.floor(1000 + Math.random() * 9000)}-R${i + 1}`
        }));
        setDeck(refilled);
        setCurrentDossier(refilled[0]);
      } else {
        setDeck(newDeck);
        setCurrentDossier(newDeck[0]);
      }

      setAnimateCard(null);
      sfx.playCardSlide();
    }, 220);
  }, [gameState, currentDossier, animateCard, combo, maxCombo, deck]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (gameState === "ready" || gameState === "gameover") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (gameState === "playing") {
        const key = e.key.toLowerCase();
        if (key === "1" || key === "c") handleSort("CST");
        else if (key === "2" || key === "f") handleSort("F3SCT");
        else if (key === "3" || key === "a") handleSort("CAP");
        else if (key === "4" || key === "m") handleSort("CM");
        else if (key === "5" || key === "r") handleSort("RH");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleSort, onClose, startGame]);

  // Rank title generator based on score
  const getRankTitle = (pts: number) => {
    if (pts >= 2500) return { title: "DGS Super-Star", color: "text-amber-400", desc: "Tri éclair sans aucune faille ! Le ministère de la FPT vous demande en conseil." };
    if (pts >= 1600) return { title: "DRH d'Élite", color: "text-purple-400", desc: "Une maîtrise parfaite des compétences et des instances paritaires." };
    if (pts >= 1000) return { title: "Gestionnaire Confirmé", color: "text-emerald-400", desc: "Le courrier circule fluide et aucun dossier ne traîne sur les bureaux." };
    if (pts >= 500) return { title: "Agent RH Polyvalent", color: "text-blue-400", desc: "Bon début ! Les bases du statut territorial sont assimilées." };
    return { title: "Stagiaire au Courrier", color: "text-slate-400", desc: "Attention aux réorientations tardives ! Consultez le guide des instances." };
  };

  const accuracy = processedCount > 0 ? Math.round((correctCount / processedCount) * 100) : 0;
  const rank = getRankTitle(score);

  return (
    <div className="relative z-30 isolate min-h-[100dvh] flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 font-sans select-none">
      
      {/* Dynamic Animated Ambient Background Glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-all duration-700"
        style={{
          background: combo >= 5 
            ? "radial-gradient(circle at 50% 40%, rgba(245,158,11,0.25) 0%, rgba(15,23,42,0) 70%)" 
            : "radial-gradient(circle at 50% 30%, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)"
        }}
      />

      {/* Grid Pattern overlay for tech office vibe */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-3 sm:p-6 pb-28 sm:pb-8 relative z-10">
        
        {/* ─── HEADER BAR ─────────────────────────────────────────────────── */}
        <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          
          {/* Left Actions: Back & Sound & Help */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Couper le son" : "Activer le son"}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all active:scale-95"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              title="Guide des instances"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-blue-950/80 text-blue-300 font-semibold text-xs border border-slate-800 hover:border-blue-500/50 transition-all active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Guide Instances</span>
            </button>
          </div>

          {/* Center/Right Status Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            
            {/* High Score Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>REC : <strong>{highScore}</strong></span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center bg-slate-900/90 px-4 py-1.5 rounded-2xl border border-slate-800 shadow-lg">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Score</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">{score}</span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 backdrop-blur-md shadow-lg transition-all ${
              timeLeft <= 10 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]' 
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-400' : 'text-blue-400'}`} />
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* ─── COMBO STREAK BAR ───────────────────────────────────────────── */}
        {gameState === "playing" && (
          <div className="w-full max-w-md mx-auto mb-4 flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center gap-1 shrink-0">
              <Flame className={`w-4 h-4 ${combo >= 3 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-xs font-black font-mono text-amber-300 uppercase tracking-wider">
                COMBO x{Math.min(Math.floor(combo / 3) + 1, 5)}
              </span>
            </div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((combo % 3) * 33.3 + (combo > 0 ? 10 : 0), 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{combo} d'affilée</span>
          </div>
        )}

        {/* ─── CENTRAL WORKSPACE (LE BUREAU) ─────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto min-h-[300px] sm:min-h-[340px]">
          
          {/* ─── READY STATE OVERLAY ─────────────────────────────────────── */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center rounded-3xl border border-slate-800 p-6 sm:p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in max-w-2xl mx-auto my-auto">
              
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(59,130,246,0.3)] transform -rotate-3 hover:rotate-0 transition-transform">
                <Inbox className="w-10 h-10 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 uppercase tracking-wide font-mono">
                SORT 'EM ALL RH
              </h1>
              
              <p className="text-slate-300 max-w-lg mb-6 text-xs sm:text-sm leading-relaxed font-medium">
                Le courrier de la collectivité déborde ! Analysez chaque dossier et aiguillez-le en un temps record vers la bonne instance statutaire : 
                <strong className="text-blue-300"> CST</strong>, 
                <strong className="text-red-300"> F3SCT</strong>, 
                <strong className="text-purple-300"> CAP</strong>, 
                <strong className="text-emerald-300"> Conseil Médical</strong> ou 
                <strong className="text-amber-300"> Service RH</strong>.
              </p>

              {/* Règle synthétique */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
                  ⏱️ Temps : <strong>60s</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-mono">
                  ✅ Succès : <strong>+100 pts</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-amber-400 font-mono">
                  🔥 Combos : <strong>Jusqu'à x5</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-rose-400 font-mono">
                  ❌ Erreur : <strong>-5 sec</strong>
                </span>
              </div>

              {/* Control Hint */}
              <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 bg-blue-950/40 border border-blue-900/50 px-4 py-2 rounded-xl">
                <Keyboard className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Jouez aux <strong>Touches [1..5]</strong> ou <strong>[C, F, A, M, R]</strong> pour trier ultra-vite !</span>
              </div>

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-base sm:text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Prendre son service (Espace)</span>
              </button>
            </div>
          )}

          {/* ─── GAMEOVER SUMMARY MODAL ──────────────────────────────────── */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center rounded-3xl border border-slate-800 p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-fade-in max-w-xl mx-auto my-auto">
              
              <div className="inline-block bg-rose-500/10 border border-rose-500/30 px-4 py-1.5 rounded-full mb-3 text-xs font-extrabold text-rose-400 font-mono uppercase tracking-widest">
                FIN DE SERVICE
              </div>

              <h2 className={`text-2xl sm:text-4xl font-black mb-1 ${rank.color} uppercase tracking-tight`}>
                {rank.title}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">
                {rank.desc}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full mb-6">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Score Final</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">{score}</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Précision</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono mt-1">{accuracy}%</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Max Combo</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">x{maxCombo}</span>
                </div>
              </div>

              {score >= highScore && score > 0 && (
                <div className="mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold font-mono animate-bounce flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>NOUVEAU RECORD PERSONNEL BATTU !</span>
                </div>
              )}

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-base transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Recommencer le tri</span>
              </button>
            </div>
          )}

          {/* ─── ACTIVE DOSSIER CARD (MANILA FOLDER STYLE) ───────────────── */}
          {gameState === "playing" && currentDossier && (
            <div className="relative w-full max-w-lg aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center my-1 sm:my-2">
              
              {/* Stacked background cards for 3D depth */}
              <div className="absolute w-[92%] h-[94%] bg-amber-900/40 rounded-2xl shadow-sm rotate-3 translate-y-3 opacity-40 border border-amber-700/30 pointer-events-none" />
              <div className="absolute w-[96%] h-[97%] bg-amber-800/50 rounded-2xl shadow-md -rotate-2 translate-y-1.5 opacity-60 border border-amber-600/30 pointer-events-none" />
              
              {/* Main Physical Manila Folder */}
              <div 
                className={`relative w-full h-full rounded-2xl p-4 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-200 transform border
                  bg-gradient-to-br from-[#fbf4db] via-[#f7e9be] to-[#eed89d] text-slate-900 border-[#d4be80]
                  ${animateCard 
                    ? animateCard.direction === 'left'
                      ? '-translate-x-[250px] -rotate-12 opacity-0 scale-75'
                      : animateCard.direction === 'right'
                        ? 'translate-x-[250px] rotate-12 opacity-0 scale-75'
                        : 'translate-y-[200px] opacity-0 scale-75'
                    : 'scale-100 opacity-100 rotate-0'
                  }`}
                style={{
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.8)"
                }}
              >
                {/* Folder Top Tab */}
                <div className="absolute -top-4 right-6 bg-[#eed89d] border-t border-l border-r border-[#d4be80] px-4 py-1 rounded-t-lg text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider shadow-sm">
                  {currentDossier.code}
                </div>

                {/* Card Header */}
                <div className="flex justify-between items-start border-b border-amber-900/20 pb-2 sm:pb-3">
                  <div className="flex items-center gap-2 text-amber-900/70">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest uppercase">RÉPUBLIQUE FRANÇAISE</span>
                      <span className="text-[8px] sm:text-[9px] font-semibold opacity-75">DIRECTION DES RESSOURCES HUMAINES</span>
                    </div>
                  </div>

                  <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-mono font-black text-[9px] sm:text-[10px] uppercase border rotate-6 shadow-sm ${
                    currentDossier.urgency === "EXTRÊME"
                      ? "bg-red-600 text-white border-red-700 animate-pulse"
                      : currentDossier.urgency === "HAUTE"
                        ? "bg-amber-600 text-white border-amber-700"
                        : "bg-amber-900/10 text-amber-950 border-amber-900/20"
                  }`}>
                    {currentDossier.urgency || "CONFIDENTIEL"}
                  </div>
                </div>

                {/* Card Body Text */}
                <div className="my-auto py-1 sm:py-2 text-center flex items-center justify-center">
                  <h3 className="text-base sm:text-2xl font-black text-amber-950 leading-snug tracking-tight">
                    "{currentDossier.text}"
                  </h3>
                </div>

                {/* Card Footer info */}
                <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-amber-900/60 border-t border-amber-900/15 pt-1.5 sm:pt-2">
                  <span>Dossier #{(processedCount + 1).toString().padStart(4, '0')}</span>
                  <span>Statut : En attente d'orientation</span>
                </div>

                {/* Stamp Feedback Animation */}
                {feedback.map((f) => (
                  <div 
                    key={f.id}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 animate-stamp"
                  >
                    <div className={`transform -rotate-12 border-4 sm:border-8 rounded-2xl px-6 py-2 font-black text-2xl sm:text-4xl uppercase tracking-widest shadow-2xl backdrop-blur-xs ${
                      f.type === "success" 
                        ? "border-emerald-600 text-emerald-600 bg-emerald-100/90 shadow-emerald-500/30" 
                        : "border-rose-600 text-rose-600 bg-rose-100/90 shadow-rose-500/30"
                    }`}>
                      {f.text}
                      {f.subText && (
                        <div className="text-xs sm:text-sm font-mono font-bold tracking-normal normal-case opacity-90 mt-1">
                          {f.subText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

        </div>

        {/* ─── 5 BANNETTES DE TRI (TARGET BINS) ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5 relative z-20 mt-auto pt-2 pb-6 sm:pb-0">
          {BINS.map((bin) => {
            const Icon = bin.icon;
            const isDisabled = gameState !== "playing" || animateCard !== null;

            return (
              <button
                key={bin.id}
                disabled={isDisabled}
                onClick={() => handleSort(bin.id)}
                className={`relative flex flex-col p-2.5 sm:p-4 rounded-2xl border transition-all duration-200 group overflow-hidden cursor-pointer select-none
                  ${bin.id === "RH" ? "col-span-2 sm:col-span-1" : ""}
                  ${bin.theme.bg} ${bin.theme.border} ${isDisabled ? 'opacity-40 cursor-not-allowed' : `${bin.theme.glow} hover:scale-[1.02] active:scale-95`}`}
              >
                {/* 3D Glass Light reflection */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10 rounded-t-2xl pointer-events-none" />

                {/* Keyboard Badge Header */}
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={`text-[10px] font-mono font-black px-1.5 sm:px-2 py-0.5 rounded-md border ${bin.theme.keyColor}`}>
                    {bin.badge}
                  </span>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bin.theme.text} opacity-80 group-hover:scale-110 transition-transform`} />
                </div>

                {/* Bin Label */}
                <div className="relative z-10 flex flex-col items-start text-left mt-0.5 sm:mt-1">
                  <span className={`text-sm sm:text-lg font-black tracking-wider ${bin.theme.text}`}>
                    {bin.label}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-slate-300 opacity-85 mt-0.5 line-clamp-2">
                    {bin.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Keyboard Helper Banner */}
        <div className="text-center mt-3 text-[11px] font-mono text-slate-500 hidden sm:block">
          💡 Raccourcis clavier : Pressez <span className="text-slate-300 font-bold">[1..5]</span> ou <span className="text-slate-300 font-bold">[C, F, A, M, R]</span> pour trier instantanément.
        </div>

      </div>

      {/* ─── CHEAT SHEET / HELP GUIDE MODAL ─────────────────────────────── */}
      {showCheatSheet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Guide des Instances Statutaires FPT</h3>
              </div>
              <button 
                onClick={() => setShowCheatSheet(false)}
                className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg bg-slate-800"
              >
                Fermer ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              {BINS.map((b) => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${b.theme.keyColor}`}>
                    <b.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${b.theme.text}`}>{b.label} — {b.title}</h4>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style>{`
        @keyframes stamp {
          0% { transform: scale(2.5) rotate(-25deg); opacity: 0; }
          25% { transform: scale(1) rotate(-12deg); opacity: 1; }
          75% { transform: scale(1) rotate(-12deg); opacity: 1; }
          100% { transform: scale(0.9) rotate(-12deg); opacity: 0; }
        }
        .animate-stamp {
          animation: stamp 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

    </div>
  );
};

export default SortEmAll;

