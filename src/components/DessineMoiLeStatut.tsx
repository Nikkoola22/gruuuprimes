import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowLeft,
  X,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  Palette,
  Layers,
  CheckCircle2,
  Stethoscope,
  BookOpen,
  Coins,
  Calendar,
  Shield,
  Briefcase,
  Monitor,
  HeartHandshake,
  Maximize2
} from "lucide-react";
import initialInfographiesData from "../data/cdg-infographies.json";

export interface InfographyItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  cdg: string;
  dept?: string;
  date?: string;
  link: string;
  pdfUrl: string;
  imageUrl: string;
  icon?: string;
  badge?: string;
  tags?: string[];
}

interface DessineMoiLeStatutProps {
  onClose: () => void;
  theme?: "light" | "dark";
}

interface CategoryConfig {
  name: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  hoverBorder: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    name: "Tous",
    icon: <Layers className="w-4 h-4" />,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-orange-500/25",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700/60",
    description: "Toutes les synthèses et infographies"
  },
  {
    name: "Santé & Arrêts",
    icon: <Stethoscope className="w-4 h-4" />,
    gradient: "from-rose-600 to-red-600",
    glow: "shadow-rose-500/25",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60",
    description: "CMO, CLD, accidents, Conseil Médical"
  },
  {
    name: "Statut & Procédures RH",
    icon: <BookOpen className="w-4 h-4" />,
    gradient: "from-purple-600 to-indigo-600",
    glow: "shadow-purple-500/25",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700/60",
    description: "Titularisation, discipline, fin de contrat"
  },
  {
    name: "Rémunération & Carrière",
    icon: <Coins className="w-4 h-4" />,
    gradient: "from-emerald-600 to-teal-600",
    glow: "shadow-emerald-500/25",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
    description: "RIFSEEP, avancements, temps partiel"
  },
  {
    name: "Congés & Absences",
    icon: <Calendar className="w-4 h-4" />,
    gradient: "from-cyan-600 to-blue-600",
    glow: "shadow-cyan-500/25",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-700/60",
    description: "Parentalité, maternité, autorisations"
  },
  {
    name: "Instances & Déontologie",
    icon: <Shield className="w-4 h-4" />,
    gradient: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/25",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60",
    description: "Médiation préalable MPO, CST, éthique"
  },
  {
    name: "Retraite & CNRACL",
    icon: <HeartHandshake className="w-4 h-4" />,
    gradient: "from-violet-600 to-purple-600",
    glow: "shadow-violet-500/25",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700/60",
    description: "Départ retraite, bonifications, invalidité"
  },
  {
    name: "Recrutement & Direction",
    icon: <Briefcase className="w-4 h-4" />,
    gradient: "from-amber-600 to-yellow-600",
    glow: "shadow-amber-500/25",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700/60",
    description: "Postes d'encadrement, contractuels"
  },
  {
    name: "Numérique & RGPD",
    icon: <Monitor className="w-4 h-4" />,
    gradient: "from-slate-700 to-slate-900",
    glow: "shadow-slate-500/25",
    hoverBorder: "hover:border-slate-400 dark:hover:border-slate-600",
    description: "Sécurité informatique, données agents"
  }
];

const DessineMoiLeStatut: React.FC<DessineMoiLeStatutProps> = ({ onClose }) => {
  const [infographies] = useState<InfographyItem[]>(initialInfographiesData as unknown as InfographyItem[]);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInfography, setSelectedInfography] = useState<InfographyItem | null>(null);

  // Dynamic category counting
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: infographies.length };
    for (const item of infographies) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [infographies]);

  // Filtered infographies
  const filteredInfographies = useMemo(() => {
    return infographies.filter((item) => {
      const matchesCat = activeCategory === "Tous" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.cdg && item.cdg.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
        (item.badge && item.badge.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [infographies, activeCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* ========================================================= */}
      {/* HEADER / BANNER                                           */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl py-3.5 sm:py-5 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-2xl shrink-0 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-6 min-w-0">
          
          {/* Logo CFDT & Titre */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0 flex items-center">
              <img
                src="/images/cfdt_logo_texte.png"
                alt="Logo CFDT"
                className="h-14 sm:h-20 w-auto object-contain hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words flex items-center gap-2">
                  <span>Dessine-moi le statut</span>
                  <span className="text-xl sm:text-2xl">🎨</span>
                </h1>
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full uppercase tracking-wider shrink-0 shadow-xs">
                  Infographies & Schémas RH
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-300 text-xs sm:text-sm font-medium mt-0.5 leading-snug break-words">
                Le statut de la fonction publique territoriale expliqué en schémas clairs, parcours et infographies officielles.
              </p>
            </div>
          </div>

          {/* Action: Retour accueil */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* CONTENU PRINCIPAL                                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 min-w-0">
        
        {/* HERO SPOTLIGHT : RADAR DES THÉMATIQUES VISUELLES */}
        <div className="relative z-10 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs dark:shadow-2xl backdrop-blur-xl min-w-0 transition-colors">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col gap-4 min-w-0">
            {/* Titre du Radar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                      Thématiques & Parcours Dessinés
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 shrink-0">
                      {infographies.length} schémas disponibles
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug break-words">
                    Cliquez sur un domaine pour filtrer les synthèses visuelles et fiches mémo.
                  </p>
                </div>
              </div>

              {/* Reset Filter Button */}
              {activeCategory !== "Tous" && (
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setActiveCategory("Tous")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Réinitialiser ({activeCategory})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grid des Catégories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 pt-1 min-w-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.name;
                const count = categoryCounts[cat.name] || 0;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={`group relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[95px] sm:min-h-[105px] min-w-0 ${
                      isActive
                        ? `bg-gradient-to-br ${cat.gradient} text-white border-transparent shadow-lg ${cat.glow} scale-[1.02] ring-2 ring-white/50 dark:ring-white/30`
                        : `bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-1 ${cat.hoverBorder}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40"
                      }`}>
                        {cat.icon}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-tight shrink-0 transition-colors ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      }`}>
                        {count}
                      </span>
                    </div>

                    <div className="mt-2 min-w-0">
                      <span className={`text-xs sm:text-sm font-bold leading-snug break-words block ${
                        isActive ? "text-white" : "group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors"
                      }`}>
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARRE DE RECHERCHE & COMPTEUR                             */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white/95 dark:bg-slate-900/95 p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl backdrop-blur-xl transition-colors min-w-0">
          <div className="relative flex-grow w-full min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 dark:text-orange-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher une infographie (ex: CMO, temps partiel, discipline, reclassement, retraite)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden text-slate-900 dark:text-white placeholder-slate-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="shrink-0 text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 px-4 py-2.5 rounded-2xl border border-orange-200 dark:border-orange-500/30">
            {filteredInfographies.length} infographie{filteredInfographies.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRILLE D'INFOGRAPHIES                                     */}
        {/* ========================================================= */}
        {filteredInfographies.length === 0 ? (
          <div className="w-full py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4 shadow-xs">
            <Palette className="w-12 h-12 text-slate-300 dark:text-slate-600 animate-bounce" />
            <div>
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucune infographie trouvée</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                Nous n'avons pas trouvé de schéma correspondant à votre recherche. Essayez d'autres mots-clés.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Tous");
              }}
              className="px-4 py-2 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs rounded-full border border-orange-200 dark:border-orange-800 transition-all cursor-pointer"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-16 min-w-0">
            {filteredInfographies.map((info) => (
              <div
                key={info.id}
                className="group relative bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between min-w-0"
              >
                <div>
                  {/* Image Preview with Zoom Overlay */}
                  <div
                    onClick={() => setSelectedInfography(info)}
                    className="relative w-full h-56 sm:h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center group-hover:brightness-95 transition-all"
                  >
                    <img
                      src={info.imageUrl}
                      alt={info.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://www.cig929394.fr/wp-content/uploads/2025/09/info_ppr_2024_06_vf-179x252.jpg";
                      }}
                    />

                    {/* Badge Catégorie flottant */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 text-orange-600 dark:text-orange-400 shadow-md border border-orange-200/60 dark:border-orange-800/60 backdrop-blur-xs">
                        {info.category}
                      </span>
                    </div>

                    {/* Badge Source flottant */}
                    {info.cdg && (
                      <div className="absolute bottom-3 left-3 z-10 max-w-[80%]">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white truncate block backdrop-blur-xs shadow-xs">
                          {info.cdg}
                        </span>
                      </div>
                    )}

                    {/* Hover Zoom Overlay Icon */}
                    <div className="absolute inset-0 bg-orange-950/20 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white/95 dark:bg-slate-900/95 text-orange-600 dark:text-orange-400 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs transform scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 className="w-4 h-4" />
                        <span>Agrandir le schéma</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="p-4 sm:p-5 flex flex-col gap-2 min-w-0">
                    <h3
                      onClick={() => setSelectedInfography(info)}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer break-words"
                      title={info.title}
                    >
                      {info.title}
                    </h3>

                    {info.badge && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold truncate">{info.badge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedInfography(info)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {info.pdfUrl && (
                      <a
                        href={info.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 transition-colors shadow-2xs"
                        title="Ouvrir le document PDF original"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {info.link && (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                        title="Voir la page source sur le site du CIG / CDG"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL : PLEIN ÉCRAN POUR L'INFOGRAPHIE           */}
      {/* ========================================================= */}
      {selectedInfography && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedInfography(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {selectedInfography.category}
                  </span>
                  {selectedInfography.cdg && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {selectedInfography.cdg}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1 truncate">
                  {selectedInfography.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedInfography(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body with Scrolling */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/90 flex items-center justify-center">
              <img
                src={selectedInfography.imageUrl}
                alt={selectedInfography.title}
                className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Document officiel CIG / CDG</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedInfography.pdfUrl && (
                  <a
                    href={selectedInfography.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger le PDF</span>
                  </a>
                )}
                {selectedInfography.link && (
                  <a
                    href={selectedInfography.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Page Source</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DessineMoiLeStatut;
