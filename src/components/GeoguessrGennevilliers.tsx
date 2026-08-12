import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Clock, 
  Compass, 
  Award, 
  RefreshCw, 
  ArrowRight
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Web Audio API Retro Synth Sound generator
const playSynthSound = (type: "click" | "pin" | "perfect" | "good" | "poor" | "gameover", isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else if (type === "pin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === "perfect") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else if (type === "good") {
      const notes = [587.33, 880.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } else if (type === "poor") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === "gameover") {
      const notes = [523.25, 587.33, 659.25, 783.99, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    }
  } catch {
    // Ignore audio failures
  }
};

interface LocationDef {
  id: number;
  title: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  info: string;
}

const locations: LocationDef[] = [
  {
    id: 1,
    title: "Hôtel de Ville (Mairie)",
    description: "Le centre administratif principal et politique de Gennevilliers.",
    image: "mairie.png",
    lat: 48.9258,
    lng: 2.29437,
    info: "L'Hôtel de Ville de Gennevilliers culmine avec ses façades géométriques modernes et abrite l'ensemble des services publics municipaux près des Agnettes."
  },
  {
    id: 2,
    title: "Le Tamanoir",
    description: "Scène mythique de musiques actuelles et de jazz au cœur du quartier du Luth.",
    image: "tamanoir.png",
    lat: 48.93417,
    lng: 2.28667,
    info: "Inauguré pour porter les musiques urbaines et du monde, Le Tamanoir est un actor culturel majeur de Gennevilliers promouvant la diversité artistique."
  },
  {
    id: 3,
    title: "Parc des Chanteraines",
    description: "Le grand poumon vert partagé avec Villeneuve-la-Garenne.",
    image: "chanteraines.png",
    lat: 48.9360,
    lng: 2.3124,
    info: "Avec ses 82 hectares, son lac artificiel, sa ferme pédagogique et son petit train à vapeur historique, c'est le lieu de détente favori des habitants."
  },
  {
    id: 4,
    title: "Port de Gennevilliers",
    description: "Le plus important port fluvial de France et plateforme logistique majeure.",
    image: "port.png",
    lat: 48.94226,
    lng: 2.28111,
    info: "Véritable carrefour industriel s'étendant le long de la Seine, il gère plus de 20 millions de tonnes de marchandises par an et relie la région à l'Europe."
  },
  {
    id: 5,
    title: "Conservatoire Edgar Varèse",
    description: "Un temple architectural dédié à la musique et à la danse près du Village.",
    image: "conservatoire.png",
    lat: 48.926468,
    lng: 2.293444,
    info: "Reconnu pour ses lignes architecturales suspendues ultra-modernes, le conservatoire municipal Edgar Varèse forme des centaines d'artistes locaux chaque année."
  }
];

interface GeoguessrGennevilliersProps {
  onClose: () => void;
}

const GeoguessrGennevilliers: React.FC<GeoguessrGennevilliersProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "results" | "summary">("menu");
  const [difficulty, setDifficulty] = useState<"novice" | "urbanist" | "cartographer">("urbanist");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Guess tracking
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundStats, setRoundStats] = useState<{
    distance: number;
    score: number;
    timeSpent: number;
  } | null>(null);

  // History track for summary screen
  const [history, setHistory] = useState<{
    location: LocationDef;
    guess: { lat: number; lng: number } | null;
    distance: number;
    score: number;
  }[]>([]);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const actualMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baseScorePerDifficulty = { novice: 1000, urbanist: 1500, cartographer: 2000 };

  const startNewGame = (diff: typeof difficulty) => {
    setDifficulty(diff);
    setRound(0);
    setScore(0);
    setHistory([]);
    setGuess(null);
    setShowAnswer(false);
    setRoundStats(null);
    setGameState("playing");
    loadRound(0);
  };

  const loadRound = (roundIdx: number) => {
    setRound(roundIdx);
    setGuess(null);
    setShowAnswer(false);
    setRoundStats(null);
    setTimeLeft(difficulty === "novice" ? 45 : difficulty === "urbanist" ? 30 : 15);
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === "playing" && !showAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleValidateGuess(true); // Auto validate on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showAnswer]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "results") {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        guessMarkerRef.current = null;
        actualMarkerRef.current = null;
        polylineRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [48.933, 2.298], // Center of Gennevilliers
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Standard colored OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      map.on("click", (e: L.LeafletMouseEvent) => {
        if (showAnswer) return;
        const { lat, lng } = e.latlng;

        playSynthSound("click", isMuted);

        if (guessMarkerRef.current) {
          map.removeLayer(guessMarkerRef.current);
        }

        // Custom pulsing rose colored pin
        guessMarkerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'bg-transparent border-none',
            html: `
              <div class="relative flex items-center justify-center -translate-y-2">
                <div class="absolute w-8 h-8 bg-rose-500/40 rounded-full animate-ping"></div>
                <div class="relative w-8 h-8 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-rose-500/50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 24]
          })
        }).addTo(map);

        setGuess({ lat, lng });
      });

      mapRef.current = map;
    }
  }, [gameState]);

  // Leaflet Map Updates for answers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous actual marker and line
    if (actualMarkerRef.current) {
      map.removeLayer(actualMarkerRef.current);
      actualMarkerRef.current = null;
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (showAnswer) {
      const currentLocation = locations[round];
      
      // Actual location marker (emerald green with pulse animation)
      actualMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: L.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div class="relative flex items-center justify-center -translate-y-2">
              <div class="absolute w-10 h-10 bg-emerald-500/40 rounded-full animate-ping"></div>
              <div class="relative w-9 h-9 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white">
                  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 26]
        })
      }).addTo(map);

      if (guess) {
        // Draw dashed connecting polyline
        polylineRef.current = L.polyline([
          [guess.lat, guess.lng],
          [currentLocation.lat, currentLocation.lng]
        ], {
          color: '#fbbf24',
          weight: 3,
          dashArray: '5, 10'
        }).addTo(map);

        // Fit map bounds to show both pins
        const bounds = L.latLngBounds([
          [guess.lat, guess.lng],
          [currentLocation.lat, currentLocation.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // Reset map view for next round
      if (guessMarkerRef.current) {
        map.removeLayer(guessMarkerRef.current);
        guessMarkerRef.current = null;
      }
      map.setView([48.933, 2.298], 13);
    }
  }, [showAnswer, round, guess]);

  const handleValidateGuess = (isTimeout = false) => {
    if (showAnswer) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const currentLocation = locations[round];
    
    let computedDistance = 9999;
    let computedScore = 0;
    const initialTime = difficulty === "novice" ? 45 : difficulty === "urbanist" ? 30 : 15;
    const timeSpent = initialTime - timeLeft;

    if (guess && !isTimeout) {
      // Calculate real geodesic distance using Leaflet map distance helper
      if (mapRef.current) {
        computedDistance = Math.round(mapRef.current.distance(
          [guess.lat, guess.lng],
          [currentLocation.lat, currentLocation.lng]
        ));
      } else {
        const dx = guess.lat - currentLocation.lat;
        const dy = guess.lng - currentLocation.lng;
        computedDistance = Math.round(Math.sqrt(dx * dx + dy * dy) * 111000);
      }

      // Score logic: exponential drop as distance increases
      const maxPossibleScore = baseScorePerDifficulty[difficulty];
      const distanceFactor = Math.exp(-computedDistance / 350); // decay constant 350m
      const timeFactor = Math.max(0.4, (timeLeft / initialTime)); // speed bonus

      computedScore = Math.round(maxPossibleScore * distanceFactor * timeFactor);
      
      if (computedDistance < 50) {
        playSynthSound("perfect", isMuted);
      } else if (computedScore > maxPossibleScore * 0.6) {
        playSynthSound("good", isMuted);
      } else {
        playSynthSound("poor", isMuted);
      }
    } else {
      // Time's up or no guess made
      playSynthSound("poor", isMuted);
    }

    setScore(prev => prev + computedScore);
    setRoundStats({
      distance: computedDistance,
      score: computedScore,
      timeSpent
    });
    
    setHistory(prev => [
      ...prev,
      {
        location: currentLocation,
        guess,
        distance: computedDistance,
        score: computedScore
      }
    ]);

    setShowAnswer(true);
  };

  const handleNextRound = () => {
    if (round < locations.length - 1) {
      loadRound(round + 1);
    } else {
      setGameState("summary");
      playSynthSound("gameover", isMuted);
    }
  };

  const BASE_URL = import.meta.env.BASE_URL;

  return (
    <div className="relative min-h-screen flex flex-col pt-4 sm:pt-6 pb-6 overflow-x-hidden bg-slate-950 px-4 font-sans text-slate-100 select-none">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-sky-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col items-center flex-1">
        
        {/* Header toolbar */}
        <div className="w-full flex justify-between items-center mb-6 flex-wrap gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quitter</span>
          </button>

          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Geoguessr Gennevilliers
            </h1>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-all text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 1. MENU SCREEN */}
        {gameState === "menu" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full text-center py-12 px-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl my-auto">
            <div className="w-20 h-20 bg-sky-500/20 border border-sky-400/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
              <MapPin className="w-10 h-10 text-sky-400 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">
              Cartographie Interactive
            </h2>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              Une photo d'un bâtiment municipal, d'un parc ou d'un équipement culturel de la ville est présentée. Pointez son emplacement exact sur le plan de Gennevilliers. Serez-vous précis ?
            </p>

            <div className="w-full flex flex-col gap-4">
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                Choisissez votre difficulté
              </span>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => startNewGame("novice")}
                  className="flex flex-col items-center py-3 px-2 bg-slate-950/80 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 rounded-xl transition-all"
                >
                  <span className="text-xs font-bold text-sky-300">Novice</span>
                  <span className="text-[9px] text-slate-400 mt-1">45s | Aide</span>
                </button>
                <button
                  onClick={() => startNewGame("urbanist")}
                  className="flex flex-col items-center py-3 px-2 bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all"
                >
                  <span className="text-xs font-bold text-indigo-300">Urbaniste</span>
                  <span className="text-[9px] text-slate-400 mt-1">30s | Normal</span>
                </button>
                <button
                  onClick={() => startNewGame("cartographer")}
                  className="flex flex-col items-center py-3 px-2 bg-slate-950/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all"
                >
                  <span className="text-xs font-bold text-purple-300">Cartographe</span>
                  <span className="text-[9px] text-slate-400 mt-1">15s | Sans aide</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PLAYING / RESULTS SCREEN */}
        {(gameState === "playing" || gameState === "results") && (
          <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch flex-1">
            
            {/* Clue Left Card */}
            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-slate-950 text-sky-400 border border-slate-850 rounded-full text-xs font-bold font-mono">
                    Manche {round + 1} / 5
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full font-mono font-bold text-sm">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>{timeLeft}s</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-mono font-bold text-sm">
                      <Trophy className="w-4 h-4" />
                      <span>{score} pts</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white mb-1 uppercase tracking-wide">
                  Où se trouve cet équipement ?
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-4">
                  Explorez le détail de l'image pour estimer son emplacement.
                </p>

                {/* Location Image View */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-850 bg-slate-950 shadow-inner group">
                  <img
                    src={`${BASE_URL}images/${locations[round].image}`}
                    alt="Clue location"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
                      Détails de l'indice
                    </span>
                    <p className="text-white text-sm font-semibold mt-1">
                      {locations[round].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reveal info / Result details bottom area */}
              {showAnswer ? (
                <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-850 animate-fade-in flex-1 flex flex-col justify-between mt-auto">
                  <div>
                    <h4 className="text-sm font-black text-sky-300 uppercase tracking-wider mb-1">
                      {locations[round].title}
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                      {locations[round].info}
                    </p>
                  </div>

                  {roundStats && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-900 text-center bg-slate-900/30 rounded-xl px-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Erreur</span>
                        <span className="text-base font-black text-rose-400 font-mono">
                          {roundStats.distance === 9999 ? "Temps écoulé" : `${roundStats.distance} m`}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Temps</span>
                        <span className="text-base font-black text-indigo-400 font-mono">
                          {roundStats.timeSpent}s
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Score gagné</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          +{roundStats.score}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleNextRound}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3">
                  <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 leading-relaxed">
                    👉 **Instructions** : Cliquez ou touchez sur le plan de droite à l'endroit présumé du bâtiment, puis cliquez sur le bouton de validation ci-dessous.
                  </div>
                  <button
                    onClick={() => handleValidateGuess(false)}
                    disabled={!guess}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-xl transition-all uppercase tracking-wide text-xs"
                  >
                    <MapPin className="w-4 h-4" />
                    Valider mon placement
                  </button>
                </div>
              )}
            </div>

            {/* Map Right Card - Now using REAL Leaflet interactive map */}
            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col shadow-2xl backdrop-blur-xl min-h-[450px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
                  Plan de la commune de Gennevilliers
                </span>
                
                {difficulty === "novice" && (
                  <span className="text-[10px] bg-sky-500/10 border border-sky-400/20 px-2 py-0.5 rounded text-sky-300">
                    Mode Novice : Zoom & repères actifs
                  </span>
                )}
              </div>

              {/* Leaflet container */}
              <div className="relative flex-1 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-inner min-h-[400px]">
                <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-10" />
              </div>
            </div>

          </div>
        )}

        {/* 3. SUMMARY SCREEN */}
        {gameState === "summary" && (
          <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-xl my-auto animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_35px_rgba(16,185,129,0.25)]">
              <Award className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-wide">
              Exploration Terminée !
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Voici votre bilan pour la session cartographique en mode **{difficulty === "novice" ? "Novice" : difficulty === "urbanist" ? "Urbaniste" : "Cartographe"}**.
            </p>

            {/* Score box */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl mb-8 w-full max-w-xs shadow-inner">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Score Final</span>
              <p className="text-5xl font-black text-sky-400 mt-1 font-mono tracking-tight">{score}</p>
              <span className="text-[9px] text-slate-500 block mt-2">
                Score maximum théorique : {baseScorePerDifficulty[difficulty] * 5} pts
              </span>
            </div>

            {/* Rounds summary table */}
            <div className="w-full bg-slate-950/50 border border-slate-850 rounded-2xl p-4 mb-8 text-left">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                Détail des manches
              </h3>

              <div className="flex flex-col gap-2">
                {history.map((hist, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 px-3 bg-slate-900/50 border border-slate-850/60 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-850 rounded-full flex items-center justify-center font-mono font-bold text-slate-400 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{hist.location.title}</span>
                    </div>

                    <div className="flex gap-4 font-mono font-bold">
                      <span className="text-rose-400">
                        {hist.distance === 9999 ? "Non placé" : `${hist.distance}m`}
                      </span>
                      <span className="text-emerald-400">
                        +{hist.score} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setGameState("menu")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all border border-slate-700 text-xs sm:text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rejouer</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-xl transition-all shadow-lg text-xs sm:text-sm"
              >
                <span>Retour aux jeux</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GeoguessrGennevilliers;
