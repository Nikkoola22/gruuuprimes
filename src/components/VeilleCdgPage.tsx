import React, { useState, useMemo, useEffect, useTransition } from "react";
import {
  Building2,
  Search,
  ExternalLink,
  LayoutGrid,
  Table as TableIcon,
  Image as ImageIcon,
  Download,
  Flame,
  X,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Sparkles,
  ChevronRight,
  ZoomIn,
  Clock,
  ArrowLeft,
  ArrowUpRight,
  Scale,
  Compass,
  Check,
  FileText,
  Newspaper
} from "lucide-react";
import initialNewsData from "../data/cdg-news.json";
import initialInfographiesData from "../data/cdg-infographies.json";
import initialMetadata from "../data/cdg-metadata.json";

export interface CDGNewsItem {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
  description?: string;
  imageUrl?: string;
}

export interface CDGEntry {
  cdg: string;
  dept: string;
  officialUrl: string;
  logo?: string;
  news: CDGNewsItem[];
}

export interface InfographyItem {
  id?: string | number;
  title: string;
  category: string;
  imageUrl: string;
  source: string;
  description?: string;
  date?: string;
}

interface TrendingTopicDef {
  key: string;
  label: string;
  icon: string;
  keywords: string[];
  gradient: string;
  glow: string;
  hoverBorder: string;
  activeText: string;
}

const TRENDING_TOPICS: TrendingTopicDef[] = [
  {
    key: "rupture",
    label: "Rupture conventionnelle",
    icon: "⚖️",
    keywords: ["rupture", "conventionnelle", "conventionnement", "indemnité de rupture"],
    gradient: "from-indigo-600 to-violet-600",
    glow: "shadow-indigo-500/30",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700/60",
    activeText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    key: "election",
    label: "Élections 2026",
    icon: "🗳️",
    keywords: ["élection", "election", "élections", "elections", "scrutin", "pré-liste", "pre-liste", "vote", "syndic", "représentativité"],
    gradient: "from-emerald-600 to-teal-600",
    glow: "shadow-emerald-500/30",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
    activeText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    key: "retraite",
    label: "Retraite & CNRACL",
    icon: "⏳",
    keywords: ["retraite", "retraites", "cnracl", "pension", "pensions", "liquidation", "carrière longue"],
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700/60",
    activeText: "text-amber-600 dark:text-amber-400"
  },
  {
    key: "sante",
    label: "Santé & Arrêts",
    icon: "🩺",
    keywords: ["santé", "sante", "maladie", "médical", "medical", "thérapeutique", "therapeutique", "inaptitude", "reclassement", "temps partiel thérapeutique", "conseil médical", "cmo", "clm", "cld", "asa"],
    gradient: "from-rose-500 to-red-600",
    glow: "shadow-rose-500/30",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60",
    activeText: "text-rose-600 dark:text-rose-400"
  },
  {
    key: "conges",
    label: "Congés & RSU",
    icon: "🏖️",
    keywords: ["congé", "conge", "congés", "conges", "rsu", "absence", "report", "données sociales", "donnees sociales", "bilan social"],
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/30",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-700/60",
    activeText: "text-cyan-600 dark:text-cyan-400"
  },
  {
    key: "emploi",
    label: "Recrutement & Concours",
    icon: "💼",
    keywords: ["recrutement", "emploi", "concours", "examen", "candidat", "lauréat", "laureat", "stage", "apprentissage", "mobilité", "mobilite", "intérim", "interim", "contractuel", "cdi", "cdd"],
    gradient: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/30",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60",
    activeText: "text-blue-600 dark:text-blue-400"
  },
  {
    key: "remuneration",
    label: "Rémunération & Primes",
    icon: "💰",
    keywords: ["smic", "rémunération", "remuneration", "prime", "indemnité", "indemnite", "salaire", "cotisation", "paie", "rifseep", "pouvoir d'achat", "indice", "nbi", "gipa"],
    gradient: "from-emerald-600 to-green-600",
    glow: "shadow-emerald-500/30",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
    activeText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    key: "protection",
    label: "Protection Sociale & PSC",
    icon: "🛡️",
    keywords: ["psc", "protection sociale", "mutuelle", "prévoyance", "prevoyance", "contrat groupe", "assurance statutaire"],
    gradient: "from-purple-600 to-pink-600",
    glow: "shadow-purple-500/30",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700/60",
    activeText: "text-purple-600 dark:text-purple-400"
  },
  {
    key: "prevention",
    label: "Prévention & Canicule",
    icon: "🌡️",
    keywords: ["canicule", "chaleur", "prévention", "prevention", "sécurité", "securite", "document unique", "duerp", "f3sct", "risques psychosociaux", "rps", "ergonomie", "fortes chaleurs"],
    gradient: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/30",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700/60",
    activeText: "text-orange-600 dark:text-orange-400"
  },
  {
    key: "instances",
    label: "Instances & Déontologie",
    icon: "🏛️",
    keywords: ["cst", "cap", "ccp", "conseil de discipline", "instance", "instances", "déontologie", "deontologie", "laïcité", "laicite", "comité social", "instances consultatives"],
    gradient: "from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800",
    glow: "shadow-slate-500/30",
    hoverBorder: "hover:border-slate-400 dark:hover:border-slate-600",
    activeText: "text-slate-700 dark:text-slate-300"
  }
];

interface VeilleCdgPageProps {
  onClose: () => void;
  onNavigateToJuridique?: () => void;
  initialMode?: "table" | "grid" | "infographies";
  theme?: "light" | "dark";
}

export const VeilleCdgPage: React.FC<VeilleCdgPageProps> = ({
  onClose,
  onNavigateToJuridique,
  initialMode = "table",
  theme
}) => {
  const [data, setData] = useState<CDGEntry[]>(initialNewsData as unknown as CDGEntry[]);
  const [infographies] = useState<InfographyItem[]>(initialInfographiesData as unknown as InfographyItem[]);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "infographies">(initialMode);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeInfographyCat, setActiveInfographyCat] = useState<string>("Tous");
  const [selectedInfography, setSelectedInfography] = useState<InfographyItem | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Try to load fresh data from API asynchronously
  useEffect(() => {
    fetch("/api/news")
      .then((res) => (res.ok ? res.json() : null))
      .then((fresh) => {
        if (fresh && Array.isArray(fresh) && fresh.length > 0) {
          setData(fresh);
        }
      })
      .catch(() => {
        // static fallback used
      });
  }, []);

  // Compute live counts per trending topic
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const topic of TRENDING_TOPICS) {
      let count = 0;
      for (const entry of data) {
        for (const item of entry.news) {
          const text = `${item.title} ${item.description || ""}`.toLowerCase();
          if (topic.keywords.some((k) => text.includes(k.toLowerCase()))) {
            count++;
          }
        }
      }
      counts[topic.key] = count;
    }
    return counts;
  }, [data]);

  // Filter CDGs and articles based on search & topic
  const filteredCDGs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const topicDef = activeTopic ? TRENDING_TOPICS.find((t) => t.key === activeTopic) : null;

    if (!query && !topicDef) {
      return data;
    }

    return data
      .map((entry) => {
        const cdgMatches =
          (query && (entry.cdg.toLowerCase().includes(query) || entry.dept.toLowerCase().includes(query))) || false;

        const matchingNews = entry.news.filter((item) => {
          const itemText = `${item.title} ${item.description || ""}`.toLowerCase();
          const matchesQuery = !query || cdgMatches || itemText.includes(query);
          const matchesTopic =
            !topicDef || topicDef.keywords.some((k) => itemText.includes(k.toLowerCase()));
          return matchesQuery && matchesTopic;
        });

        if (cdgMatches && matchingNews.length === 0 && !topicDef) {
          return entry;
        }

        if (matchingNews.length > 0) {
          return {
            ...entry,
            news: matchingNews
          };
        }

        return null;
      })
      .filter(Boolean) as CDGEntry[];
  }, [data, searchQuery, activeTopic]);

  // Filter infographies
  const filteredInfographies = useMemo(() => {
    return infographies.filter((item) => {
      const matchesCat = activeInfographyCat === "Tous" || item.category === activeInfographyCat;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      return matchesCat && matchesQuery;
    });
  }, [infographies, activeInfographyCat, searchQuery]);

  const infographyCategories = useMemo(() => {
    const cats = new Set<string>(infographies.map((i) => i.category));
    return ["Tous", ...Array.from(cats)];
  }, [infographies]);

  // Statistics
  const totalNewsCount = useMemo(() => {
    return filteredCDGs.reduce((acc, curr) => acc + curr.news.length, 0);
  }, [filteredCDGs]);

  // Formatted last updated date
  const formattedLastUpdated = useMemo(() => {
    try {
      const date = initialMetadata?.lastUpdated ? new Date(initialMetadata.lastUpdated) : new Date();
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return "20 août 2026";
    }
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [["Département", "Centre de Gestion", "Titre de l'actualité", "Date", "Lien officiel", "Lien CDG"]];
    for (const entry of filteredCDGs) {
      for (const item of entry.news) {
        rows.push([
          `"${entry.dept}"`,
          `"${entry.cdg.replace(/"/g, '""')}"`,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.pubDate || ""}"`,
          `"${item.link}"`,
          `"${entry.officialUrl}"`
        ]);
      }
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `veille_cdg_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredCDGs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", `veille_cdg_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Split table entries into 2 columns for compact scanning
  const halfLength = Math.ceil(filteredCDGs.length / 2);
  const leftColEntries = filteredCDGs.slice(0, halfLength);
  const rightColEntries = filteredCDGs.slice(halfLength);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Background Ambient Glow Mesh */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation Bar with full responsive wrapping */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl py-3 sm:py-5 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-2xl shrink-0 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          
          {/* Title, CFDT Logo & Badge */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo CFDT agrandi à la place de l'icône */}
            <div className="relative shrink-0 flex items-center">
              <img
                src="/images/cfdt_logo_texte.png"
                alt="Logo CFDT"
                className="h-14 sm:h-20 w-auto object-contain hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                  Veille CDG & CIG
                </h1>

                {/* Badge Indexation quotidienne mis en valeur */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Indexation quotidienne</span>
                  <span className="text-emerald-400 dark:text-emerald-500 hidden sm:inline">•</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-semibold hidden sm:inline">Dernière MAJ : {formattedLastUpdated}</span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5 leading-snug break-words">
                Intelligence territoriale & RH : arrêtés, circulaires, concours et actualités statutaires.
              </p>
            </div>
          </div>

          {/* Action Header Tools with flexible wrap */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto pt-1 lg:pt-0">
            {/* View Switcher Toggle */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 flex items-center shadow-inner shrink-0 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Vue Tableau 2 colonnes"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tableau</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Vue Grille de cartes"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grille</span>
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Exporter</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Format CSV (Excel)</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Format JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Back Button to ATLAS */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 min-w-0">
        
        {/* ========================================================= */}
        {/* RADAR DES TENDANCES RH - HERO SPOTLIGHT                    */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-blue-50/40 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs dark:shadow-2xl backdrop-blur-xl min-w-0 transition-colors">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col gap-4 min-w-0">
            {/* Header of Radar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                      Radar des Tendances RH & Statutaires
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                      En direct
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug break-words">
                    Explorez les 10 thématiques d'actualité les plus publiées par l'ensemble des Centres de Gestion (CDG / CIG).
                  </p>
                </div>
              </div>

              {/* Active Filter Pill or Reset Action */}
              {activeTopic && (
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setActiveTopic(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Réinitialiser le filtre</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grid of 10 Interactive Spotlight Trend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5 pt-1 min-w-0">
              {TRENDING_TOPICS.map((topic) => {
                const isActive = activeTopic === topic.key;
                const count = topicCounts[topic.key] || 0;

                return (
                  <button
                    key={topic.key}
                    type="button"
                    onClick={() => setActiveTopic(isActive ? null : topic.key)}
                    className={`group relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px] sm:min-h-[105px] min-w-0 ${
                      isActive
                        ? `bg-gradient-to-br ${topic.gradient} text-white border-transparent shadow-lg ${topic.glow} scale-[1.02] ring-2 ring-white/50 dark:ring-white/30`
                        : `bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-1 ${topic.hoverBorder}`
                    }`}
                  >
                    {/* Top Row: Icon & Count Badge */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                      }`}>
                        {topic.icon}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-tight shrink-0 transition-colors ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      }`}>
                        {count} {count > 1 ? "actus" : "actu"}
                      </span>
                    </div>

                    {/* Bottom: Label */}
                    <div className="mt-2 min-w-0">
                      <span className={`text-xs sm:text-sm font-bold leading-snug break-words block ${
                        isActive ? "text-white" : "group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      }`}>
                        {topic.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RECHERCHE & STATISTIQUES GLOBALES                         */}
        {/* ========================================================= */}
        <div className="bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-xs dark:shadow-xl flex flex-col gap-4 transition-colors min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{filteredCDGs.length} Centres indexés</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{totalNewsCount} publications</span>
              </div>
            </div>

            {/* Encadré mis en valeur Indexation quotidienne */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs shrink-0">
              <Clock className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300">Indexation quotidienne active</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">• Mis à jour le {formattedLastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Search Box with proper inner padding for icon and clear button */}
          <div className="relative w-full min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  setSearchQuery(val);
                });
              }}
              placeholder="Rechercher (ex: rupture, prime, congés, retraite, canicule, 92, 75, Versailles)..."
              className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden text-sm transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* --- VIEW MODE 1 : TABLEAU 2 COLONNES --- */}
        {viewMode === "table" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 min-w-0">
            {/* Left Column Table */}
            <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs dark:shadow-xl transition-colors min-w-0">
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {leftColEntries.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">Aucun Centre de Gestion correspondant.</div>
                )}
                {leftColEntries.map((entry, idx) => (
                  <CDGTableRow key={entry.cdg} entry={entry} isEven={idx % 2 === 0} />
                ))}
              </div>
            </div>

            {/* Right Column Table */}
            <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs dark:shadow-xl transition-colors min-w-0">
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {rightColEntries.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">Aucun Centre de Gestion correspondant.</div>
                )}
                {rightColEntries.map((entry, idx) => (
                  <CDGTableRow key={entry.cdg} entry={entry} isEven={idx % 2 === 0} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW MODE 2 : GRILLE DE CARTES --- */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 min-w-0">
            {filteredCDGs.length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-400 bg-white/80 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
                Aucun résultat trouvé pour votre recherche.
              </div>
            )}
            {filteredCDGs.map((entry) => (
              <div
                key={entry.cdg}
                className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/40 rounded-3xl p-4 sm:p-5 backdrop-blur-sm shadow-xs hover:shadow-lg dark:shadow-xl flex flex-col justify-between transition-all duration-200 group min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-extrabold text-xs rounded-xl border border-blue-200 dark:border-blue-500/30 shrink-0">
                        {entry.dept}
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                        {entry.cdg}
                      </h3>
                    </div>
                    <a
                      href={entry.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                      title="Visiter le site officiel"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2 min-w-0">
                    {entry.news.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-50/80 dark:bg-slate-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/50 rounded-2xl transition-all group/item flex flex-col gap-1 min-w-0"
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors line-clamp-2 break-words flex-1">
                            {item.title}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 dark:group-hover/item:text-blue-400 shrink-0 transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5" />
                        </div>
                        {item.pubDate && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono shrink-0">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(item.pubDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 min-w-0">
                  <span className="shrink-0">{entry.news.length} publication{entry.news.length > 1 ? "s" : ""}</span>
                  <a
                    href={entry.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium shrink-0"
                  >
                    Accès portail <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW MODE 3 : INFOGRAPHIES & GUIDES RH --- */}
        {viewMode === "infographies" && (
          <div className="flex flex-col gap-5 sm:gap-6 min-w-0">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 -mx-1 px-1">
              {infographyCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveInfographyCat(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                    activeInfographyCat === cat
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Infographies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 min-w-0">
              {filteredInfographies.map((info, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg dark:shadow-xl flex flex-col justify-between group transition-all duration-200 min-w-0"
                >
                  <div
                    className="relative aspect-16/10 bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedInfography(info)}
                  >
                    <img
                      src={info.imageUrl}
                      alt={info.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                        <ZoomIn className="w-3.5 h-3.5" />
                        Agrandir
                      </span>
                    </div>
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 dark:bg-slate-900/90 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-[10px] font-bold rounded-full backdrop-blur-md shadow-xs">
                      {info.category}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1 justify-between min-w-0">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug line-clamp-2 break-words group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {info.title}
                      </h4>
                      {info.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 break-words">{info.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 min-w-0">
                      <span className="font-medium text-slate-600 dark:text-slate-400 truncate">{info.source}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedInfography(info)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        Voir le guide <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal for Infographies with responsive bounds */}
      {selectedInfography && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedInfography(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{selectedInfography.category}</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight break-words">{selectedInfography.title}</h3>
              </div>
              <button
                onClick={() => setSelectedInfography(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 sm:p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              <img
                src={selectedInfography.imageUrl}
                alt={selectedInfography.title}
                className="max-h-[60vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-white/95 dark:bg-slate-900/90 text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate">Source : {selectedInfography.source}</span>
              <a
                href={selectedInfography.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for compact row in 2-column table view with rich clickable article cards
const CDGTableRow: React.FC<{ entry: CDGEntry; isEven?: boolean }> = ({ entry, isEven }) => {
  return (
    <div
      className={`p-3.5 sm:p-4 transition-colors flex flex-col md:flex-row md:items-start gap-3 sm:gap-4 min-w-0 ${
        isEven
          ? "bg-white dark:bg-slate-900/90 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
          : "bg-slate-100/70 dark:bg-slate-950/75 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
      }`}
    >
      {/* CDG Header / Badge */}
      <div className="md:w-52 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 md:w-full">
          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-extrabold text-xs rounded-lg border border-blue-200 dark:border-blue-500/30 shrink-0">
            {entry.dept}
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs break-words">{entry.cdg}</span>
        </div>
        <a
          href={entry.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 font-medium shrink-0"
        >
          <span>Site officiel</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* News List as Clickable Cards */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {entry.news.length === 0 ? (
          <span className="text-xs text-slate-400 italic py-1">Aucune publication récente indexée.</span>
        ) : (
          entry.news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group/item relative flex items-start justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl border shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer min-w-0 ${
                isEven
                  ? "bg-slate-50/90 dark:bg-slate-950/70 hover:bg-blue-50/90 dark:hover:bg-blue-950/60 border-slate-200/70 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60"
                  : "bg-white dark:bg-slate-900/90 hover:bg-blue-50/90 dark:hover:bg-blue-950/60 border-slate-200/80 dark:border-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700/60"
              }`}
              title="Cliquer pour lire l'article complet"
            >
              {/* Left icon with hover color shift */}
              <div className="p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 group-hover/item:border-blue-300 dark:group-hover/item:border-blue-700/60 shrink-0 mt-0.5 shadow-2xs transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors leading-snug break-words block">
                  {item.title}
                </span>
                {item.pubDate && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(item.pubDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                )}
              </div>

              {/* Right side: Click / Open indication */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 opacity-60 sm:opacity-0 group-hover/item:opacity-100 transition-all duration-200 translate-x-0 group-hover/item:translate-x-0.5 shrink-0 self-center">
                <span className="hidden sm:inline text-[10px]">Lire</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default VeilleCdgPage;
