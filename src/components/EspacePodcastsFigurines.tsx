import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Play, Pause, Radio, Sparkles, Volume2, VolumeX,
  RefreshCw, Clock, Calendar, ChevronRight
} from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  link: string;
  imageUrl?: string;
  figurineTitle: string;
  figurineRole: string;
  rarity: 'Légendaire 🌟' | 'Rare ⭐' | 'Statutaire 🛡️';
  themeColor: string;
}

interface Props {
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const RSS_FEED_URL = 'https://feed.ausha.co/oa89GCrL2nRk';

// Podcast category metadata presets to enrich RSS items
const FIGURINE_PRESETS = [
  {
    figurineTitle: "Le Protecteur RH 🛡️",
    figurineRole: "Contrôle des Arrêts Maladie & Absentéisme",
    rarity: "Légendaire 🌟" as const,
    themeColor: "from-amber-500 via-rose-500 to-red-600",
  },
  {
    figurineTitle: "L'Expert Statutaire ⚖️",
    figurineRole: "Veille Juridique FPT & Jurisprudence CGFP",
    rarity: "Rare ⭐" as const,
    themeColor: "from-blue-500 via-indigo-600 to-purple-600",
  },
  {
    figurineTitle: "Le Garant de la Paie 💰",
    figurineRole: "Gestion RIFSEEP, Primes & Congés CMO",
    rarity: "Statutaire 🛡️" as const,
    themeColor: "from-emerald-500 via-teal-600 to-cyan-600",
  },
  {
    figurineTitle: "Prévention & Santé 🏥",
    figurineRole: "Qualité de Vie au Travail & Médecine Pro",
    rarity: "Rare ⭐" as const,
    themeColor: "from-purple-500 via-pink-600 to-rose-500",
  },
  {
    figurineTitle: "Décideur Territorial 🏛️",
    figurineRole: "Arbitrages DGS, DRH & Orientations Municipales",
    rarity: "Légendaire 🌟" as const,
    themeColor: "from-yellow-400 via-amber-600 to-orange-600",
  }
];

// Fallback exact episodes extracted from https://feed.ausha.co/oa89GCrL2nRk with their distinct cover artwork
const FALLBACK_EPISODES: Episode[] = [
  {
    id: "ep-1",
    title: "Arrêts maladie des agents publics : le contrôle change, les DRH doivent s’adapter",
    description: "Comment vérifier la justification d’un arrêt de travail ? Jusqu’où une collectivité peut-elle aller ? Quelles obligations pèsent sur l’agent ? Décryptage des nouvelles règles de contrôle des agents publics en congé de maladie.",
    audioUrl: "https://audio.ausha.co/bj4aas8rmn5o.mp3?t=1786459543",
    pubDate: "11 Août 2026",
    duration: "18:40",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com/arrets-maladie-des-agents-publics-le-controle-change-les-drh-doivent-s-adapter",
    imageUrl: "https://image.ausha.co/h7BadjwIkVqrj7OapZYNAjHrpo0LXJIDcaXkdPek_1400x1400.jpeg?t=1786459653",
    figurineTitle: "Le Protecteur RH 🛡️",
    figurineRole: "Contrôle des Arrêts Maladie & Absentéisme",
    rarity: "Légendaire 🌟",
    themeColor: "from-amber-500 via-rose-500 to-red-600"
  },
  {
    id: "ep-2",
    title: "Retraite des territoriaux : vos enfants peuvent augmenter votre pension… mais savez-vous comment ?",
    description: "Bonifications, majorations de durée d’assurance, majoration de pension, périodes d’interruption ou de réduction d’activité… Décryptage des mécanismes qui permettent de prendre en compte les enfants dans les droits à retraite des fonctionnaires territoriaux.",
    audioUrl: "https://audio.ausha.co/bl4aas6pEXOv.mp3?t=1786302911",
    pubDate: "09 Août 2026",
    duration: "13:24",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com/retraite-des-territoriaux-vos-enfants-peuvent-augmenter-votre-pension-mais-savez-vous-comment",
    imageUrl: "https://image.ausha.co/nSKbNid7q5eSMdV8vL6pi8zBoryHgFt9rPZOTHpo_1400x1400.jpeg?t=1786303132",
    figurineTitle: "Le Garant de la Pension 💰",
    figurineRole: "Droits à Retraite, CNRACL & Majorations Enfants",
    rarity: "Rare ⭐",
    themeColor: "from-emerald-500 via-teal-600 to-cyan-600"
  },
  {
    id: "ep-3",
    title: "Réforme de l’encadrement supérieur territorial : l’État demande-t-il l’impossible aux collectivités au 1er juillet 2026 ?",
    description: "Coup de gueule du Président de NAUDRH.COM. Comment les collectivités pourraient-elles appliquer une réforme aussi structurante dans des délais aussi courts ?",
    audioUrl: "https://audio.ausha.co/yJJ44fmJkrgX.mp3?t=1782040627",
    pubDate: "21 Juin 2026",
    duration: "07:27",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com/reforme-de-l-encadrement-superieur-territorial-l-etat-demande-t-il-l-impossible-aux-collectivites-au-1er-juillet",
    imageUrl: "https://image.ausha.co/bmX5Z3tvi17HDEvN4MfedgAelI7KkMf0cRnkdA2y_1400x1400.jpeg?t=1782040910",
    figurineTitle: "L'Expert Statutaire ⚖️",
    figurineRole: "Réforme de l'Encadrement Supérieur Territorial",
    rarity: "Légendaire 🌟",
    themeColor: "from-blue-500 via-indigo-600 to-purple-600"
  },
  {
    id: "ep-4",
    title: "Encadrement supérieur dans la FPT : la carrière automatique appartient-elle au passé ?",
    description: "Analyse des raisons qui expliquent la fin progressive de l’escalator de carrière dans la Fonction Publique Territoriale et les conséquences concrètes pour les cadres et DRH.",
    audioUrl: "https://audio.ausha.co/oa466sQ7Dqng.mp3?t=1781339029",
    pubDate: "13 Juin 2026",
    duration: "11:51",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com/encadrement-superieur-dans-la-fpt-la-carriere-automatique-appartient-elle-au-passe",
    imageUrl: "https://image.ausha.co/gQ8ztBcEabDSgflTbKRVm4LikkGE2GDxopG4IsB1_1400x1400.jpeg?t=1781339291",
    figurineTitle: "Décideur Territorial 🏛️",
    figurineRole: "Parcours Professionnel & Compétences Cadres",
    rarity: "Rare ⭐",
    themeColor: "from-yellow-400 via-amber-600 to-orange-600"
  },
  {
    id: "ep-5",
    title: "Le Débrief RH Territorial du 15 mai 2026 : les actualités RH qu’il ne fallait pas manquer",
    description: "Rendez-vous de veille et d’analyse des grandes actualités RH de la FPT : Livre IV du CGFP, tensions RH, fatigue managériale et recrutement.",
    audioUrl: "https://audio.ausha.co/BqM55s3G4wEE.mp3?t=1778879467",
    pubDate: "15 Mai 2026",
    duration: "12:05",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com/le-debrief-rh-territorial-du-15-mai-2026-les-actualites-rh-qu-il-ne-fallait-pas-manquer",
    imageUrl: "https://image.ausha.co/hoOSxm3YdOBrkZwtPXZZGlDsLNmesoDhZJFBwlRr_1400x1400.jpeg?t=1778873182",
    figurineTitle: "Débrief & Veille RH 📰",
    figurineRole: "Revue de Presse & Synthèse d'Actualités FPT",
    rarity: "Statutaire 🛡️",
    themeColor: "from-purple-500 via-pink-600 to-rose-500"
  },
  {
    id: "ep-6",
    title: "Révolution RH dans la fonction publique : le Livre IV du CGFP change-t-il durablement les collectivités ?",
    description: "Dialogue social, santé et sécurité au travail : pourquoi la publication du Livre IV du CGFP marque un tournant pour les employeurs publics.",
    audioUrl: "https://audio.ausha.co/yk4aasqX1w8m.mp3",
    pubDate: "02 Mai 2026",
    duration: "14:15",
    link: "https://podcast.ausha.co/rdv-technique-la-parole-est-a-www-naudhh-com",
    imageUrl: "https://image.ausha.co/itPbouyiSeJVyNT3aMweAzBm4PUAKCCRnqD5Uu6P_1400x1400.jpeg?t=1615926262",
    figurineTitle: "Code CGFP & Dialogue Social 📜",
    figurineRole: "Santé, Sécurité au Travail & Livre IV CGFP",
    rarity: "Légendaire 🌟",
    themeColor: "from-teal-400 via-emerald-600 to-green-700"
  }
];

export default function EspacePodcastsFigurines({ onClose, theme = 'dark' }: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>(FALLBACK_EPISODES);
  const [loading, setLoading] = useState(false);
  const [searchQuery] = useState('');
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(FALLBACK_EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse Ausha RSS feed with robust XML regex extraction for cover images
  const fetchRssFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(RSS_FEED_URL);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const items = Array.from(xmlDoc.querySelectorAll('item'));
      if (items.length > 0) {
        const parsedEpisodes: Episode[] = items.map((item, idx) => {
          const title = item.querySelector('title')?.textContent || 'Épisode Podcast RH';
          const descriptionRaw = item.querySelector('description')?.textContent || item.querySelector('content\\:encoded')?.textContent || '';
          const description = descriptionRaw.replace(/<[^>]*>?/gm, '').trim();
          const enclosure = item.querySelector('enclosure');
          const audioUrl = enclosure?.getAttribute('url') || '';
          const pubDateRaw = item.querySelector('pubDate')?.textContent || '';
          const pubDate = pubDateRaw ? new Date(pubDateRaw).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          const itunesDuration = item.querySelector('itunes\\:duration, duration')?.textContent || '15:00';
          const link = item.querySelector('link')?.textContent || RSS_FEED_URL;

          // Extract unique artwork URL using XML string regex matching for maximum reliability
          const itemXml = item.outerHTML || new XMLSerializer().serializeToString(item);
          const imgMatch = itemXml.match(/<itunes:image[^>]*href=["']([^"']+)["']/i)
            || itemXml.match(/<googleplay:image[^>]*href=["']([^"']+)["']/i)
            || itemXml.match(/<image[^>]*url=["']([^"']+)["']/i);

          const image = imgMatch ? imgMatch[1] : (FALLBACK_EPISODES[idx % FALLBACK_EPISODES.length]?.imageUrl || 'https://image.ausha.co/itPbouyiSeJVyNT3aMweAzBm4PUAKCCRnqD5Uu6P_1400x1400.jpeg?t=1615926262');

          const preset = FIGURINE_PRESETS[idx % FIGURINE_PRESETS.length];

          return {
            id: `rss-${idx}-${title.substring(0, 10)}`,
            title,
            description,
            audioUrl,
            pubDate,
            duration: itunesDuration,
            link,
            imageUrl: image,
            ...preset
          };
        });

        setEpisodes(parsedEpisodes);
        if (parsedEpisodes.length > 0) {
          setActiveEpisode(parsedEpisodes[0]);
        }
      }
    } catch (err) {
      console.warn('Chargement direct du flux RSS Ausha échoué, utilisation des 6 épisodes officiels avec leurs vignettes uniques:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRssFeed();
  }, []);

  // Audio player handlers
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn('Autoplay bloqué:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeEpisode]);

  const togglePlay = (episode?: Episode) => {
    if (episode && activeEpisode?.id !== episode.id) {
      setActiveEpisode(episode);
      setIsPlaying(true);
      setCurrentTime(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredEpisodes = episodes.filter(ep => 
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.figurineTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-32 pt-6 px-4 select-none relative overflow-x-hidden transition-colors duration-300`}>
      
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-96 h-96 ${isDark ? 'bg-purple-600/15' : 'bg-purple-400/20'} rounded-full blur-[140px]`} />
        <div className={`absolute top-1/2 -right-32 w-96 h-96 ${isDark ? 'bg-amber-500/15' : 'bg-amber-400/20'} rounded-full blur-[140px]`} />
        <div className={`absolute bottom-0 left-1/3 w-96 h-96 ${isDark ? 'bg-rose-600/15' : 'bg-rose-400/20'} rounded-full blur-[140px]`} />
      </div>

      {/* Hidden Audio Element */}
      {activeEpisode && (
        <audio
          ref={audioRef}
          src={activeEpisode.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header navigation bar */}
        <div className={`flex justify-between items-center mb-8 flex-wrap gap-4 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'} pb-5`}>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quitter l'Espace</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 text-white shadow-[0_0_25px_rgba(147,51,234,0.3)] animate-pulse">
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-400/40 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase font-mono tracking-wider">
                  FLUX AUSHA EN DIRECT 🎧
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Édition Speciale
                </span>
              </div>
              <h1 className={`text-2xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight uppercase`}>
                Podcasts RH
              </h1>
            </div>
          </div>

          <button
            onClick={fetchRssFeed}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            } border hover:border-purple-400/50 rounded-xl text-xs font-bold transition-all`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 dark:text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualisation...' : 'Synchro RSS'}
          </button>
        </div>

        {/* Podcasts Grid */}

        {/* Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEpisodes.map((episode) => {
            const isSelected = activeEpisode?.id === episode.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={episode.id}
                className="group relative flex flex-col h-full"
              >
                <div
                  onClick={() => togglePlay(episode)}
                  className={`cursor-pointer h-full ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 hover:border-purple-500/60' 
                      : 'bg-white border-slate-200/80 hover:border-purple-500 shadow-sm hover:shadow-xl'
                  } backdrop-blur-xl border-2 ${
                    isSelected ? (isDark ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.2)]') : ''
                  } rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
                >
                  {/* Glowing header badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r ${episode.themeColor} text-white shadow-md`}>
                      {episode.rarity}
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-amber-400" /> {episode.duration}
                    </span>
                  </div>

                  {/* Showcase Box featuring Podcast Artwork */}
                  <div className={`relative w-full h-48 rounded-2xl ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center overflow-hidden mb-4 shadow-inner group/img`}>
                    
                    {/* Real Podcast Episode Artwork Image */}
                    {episode.imageUrl ? (
                      <img
                        src={episode.imageUrl}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://image.ausha.co/itPbouyiSeJVyNT3aMweAzBm4PUAKCCRnqD5Uu6P_1400x1400.jpeg?t=1615926262';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-100 via-indigo-50 to-amber-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
                        <Radio className="w-12 h-12 text-purple-600 dark:text-amber-400 opacity-60" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-slate-950 via-slate-950/40' : 'from-slate-900/60 via-slate-900/10'} to-transparent`} />

                    {/* Category Badge overlay */}
                    <div className={`absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${
                      isDark ? 'bg-slate-950/85 text-amber-300 border-amber-400/40' : 'bg-white/90 text-purple-700 border-purple-200'
                    } backdrop-blur border text-[10px] font-black tracking-wider uppercase shadow-md`}>
                      <span>{episode.figurineTitle}</span>
                    </div>

                    {/* Animated Equalizer Waves if Playing */}
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center gap-1.5 z-20 backdrop-blur-xs">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-purple-600 dark:bg-amber-400 rounded-full animate-pulse shadow-md"
                            style={{
                              height: `${Math.random() * 60 + 20}%`,
                              animationDuration: `${0.4 + i * 0.15}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Quick Play Floating Overlay Button */}
                    <div className="absolute bottom-3 right-3 z-30">
                      <div className={`p-3 rounded-full ${
                        isThisPlaying 
                          ? 'bg-purple-600 text-white' 
                          : (isDark ? 'bg-slate-900/90 text-white hover:bg-purple-600' : 'bg-white/90 text-slate-800 hover:bg-purple-600 hover:text-white')
                      } border border-purple-400/40 transition-all shadow-lg`}>
                        {isThisPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-purple-600'} mb-2 line-clamp-2 leading-snug transition-colors`}>
                        {episode.title}
                      </h3>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs line-clamp-3 mb-4 leading-relaxed font-medium`}>
                        {episode.description}
                      </p>
                    </div>

                    <div className={`pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex items-center justify-between text-xs`}>
                      <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono text-[11px] flex items-center gap-1`}>
                        <Calendar className="w-3.5 h-3.5" /> {episode.pubDate}
                      </span>
                      <span className="text-purple-600 dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {isThisPlaying ? 'En lecture...' : 'Écouter'} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Audio Player Dock */}
      {activeEpisode && (
        <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-50 animate-fade-in">
          <div className={`${
            isDark 
              ? 'bg-slate-900/95 border-purple-500/50 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
              : 'bg-white/95 border-purple-400/60 text-slate-800 shadow-2xl'
          } backdrop-blur-2xl border-2 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4`}>
            
            {/* Episode Info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeEpisode.themeColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Radio className={`w-6 h-6 text-white ${isPlaying ? 'animate-bounce' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-purple-600 dark:text-amber-400 font-mono uppercase tracking-widest block truncate">
                  {activeEpisode.figurineTitle}
                </span>
                <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} truncate max-w-[280px]`}>
                  {activeEpisode.title}
                </h4>
              </div>
            </div>

            {/* Central Controls & Progress Bar */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="flex items-center gap-4 mb-1">
                <button
                  onClick={changeSpeed}
                  className={`px-2 py-1 rounded-lg ${
                    isDark ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-100 text-purple-700 border-slate-200'
                  } font-mono text-[11px] font-bold border`}
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={() => togglePlay()}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
              </div>

              <div className={`flex items-center gap-2 w-full text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-amber-400"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2 w-32 flex-shrink-0">
              <button onClick={toggleMute} className="text-slate-400 hover:text-purple-600">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-500 dark:text-slate-300" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-amber-400"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
