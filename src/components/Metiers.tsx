import React, { useState } from "react";
import { 
  ArrowLeft, FileSignature, FileBadge, Baby, UserCheck, UserPlus, 
  Briefcase, LayoutList, Award, Clock, 
  Search, Landmark, TrendingUp, Laptop, CalendarOff,
  ArrowRightLeft, ExternalLink, RotateCcw, Scale, Calculator
} from "lucide-react";
import { SimulationActeModule } from "./SimulationActeModule";

interface ActeCardProps {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  toolId: string;
  onOpen: (id: string) => void;
  badge?: string;
  gradient?: string;
  shadow?: string;
  accentColor?: string;
  hoverBorder?: string;
  badgeStyle?: string;
}

const ActeCard: React.FC<ActeCardProps> = ({ 
  title, 
  description, 
  category, 
  icon, 
  toolId, 
  onOpen, 
  badge,
  gradient = "from-purple-500 to-indigo-600",
  shadow = "shadow-purple-500/20",
  accentColor = "text-purple-600 dark:text-purple-400",
  hoverBorder = "hover:border-purple-400 dark:hover:border-purple-500",
  badgeStyle = "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-700"
}) => {
  return (
    <div 
      className={`group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-slate-200/80 dark:border-slate-700/80 ${hoverBorder} cursor-pointer flex flex-col h-full relative`}
      onClick={() => onOpen(toolId)}
    >
      {badge && (
        <span className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}>
          {badge}
        </span>
      )}
      <div className={`mb-4 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-md ${shadow}`}>
        {icon}
      </div>
      <div className={`mb-1 text-[11px] font-bold uppercase tracking-wider ${accentColor}`}>
        {category}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">{description}</p>
      <button className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold ${accentColor} transition-all mt-auto group-hover:translate-x-1`}>
        <span>{toolId.startsWith("delib-") ? "Générer la délibération" : "Générer l'arrêté"}</span>
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
};

interface ActeItem {
  id: string;
  title: string;
  description: string;
  category: "carriere" | "temps" | "mobilite" | "deliberation";
  categoryLabel: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: string;
  shadow: string;
  accentColor: string;
  hoverBorder: string;
  badgeStyle?: string;
}

const ACTES_CATALOG: ActeItem[] = [
  // 1. CARRIÈRE & PROMOTION
  {
    id: "arr-nomination",
    title: "Nomination stagiaire",
    description: "Arrêté de mise en stage après concours ou promotion interne",
    category: "carriere",
    categoryLabel: "Carrière & Progression",
    icon: <UserPlus className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/25",
    accentColor: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
    badgeStyle: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200",
  },
  {
    id: "arr-titularisation",
    title: "Titularisation",
    description: "Arrêté de titularisation de l'agent après la période de stage",
    category: "carriere",
    categoryLabel: "Carrière & Progression",
    icon: <FileBadge className="w-6 h-6" />,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeStyle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200",
  },
  {
    id: "arr-echelon",
    title: "Avancement d'échelon",
    description: "Arrêté d'avancement d'échelon à l'ancienneté avec indices IB/IM",
    category: "carriere",
    categoryLabel: "Carrière & Progression",
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-500/25",
    accentColor: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-400 dark:hover:border-violet-500",
    badgeStyle: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200",
  },
  {
    id: "arr-grade",
    title: "Avancement de grade",
    description: "Arrêté de promotion au grade supérieur (tableau d'avancement / examen pro)",
    category: "carriere",
    categoryLabel: "Carrière & Progression",
    icon: <Award className="w-6 h-6" />,
    badge: "Essentiel",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/25",
    accentColor: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    badgeStyle: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200",
  },

  // 2. TEMPS DE TRAVAIL & ABSENCES
  {
    id: "arr-teletravail",
    title: "Télétravail",
    description: "Arrêté portant autorisation d'exercice en télétravail",
    category: "temps",
    categoryLabel: "Temps de travail & Absences",
    icon: <Laptop className="w-6 h-6" />,
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/25",
    accentColor: "text-sky-600 dark:text-sky-400",
    hoverBorder: "hover:border-sky-400 dark:hover:border-sky-500",
    badgeStyle: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200",
  },
  {
    id: "arr-temps-partiel",
    title: "Temps partiel",
    description: "Arrêté autorisant le travail à temps partiel (de droit ou sur autorisation)",
    category: "temps",
    categoryLabel: "Temps de travail & Absences",
    icon: <Clock className="w-6 h-6" />,
    badge: "Essentiel",
    gradient: "from-teal-500 to-emerald-600",
    shadow: "shadow-teal-500/25",
    accentColor: "text-teal-600 dark:text-teal-400",
    hoverBorder: "hover:border-teal-400 dark:hover:border-teal-500",
    badgeStyle: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200",
  },
  {
    id: "arr-conge-parental",
    title: "Congé Parental",
    description: "Arrêté portant placement ou renouvellement en congé parental",
    category: "temps",
    categoryLabel: "Temps de travail & Absences",
    icon: <Baby className="w-6 h-6" />,
    gradient: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/25",
    accentColor: "text-pink-600 dark:text-pink-400",
    hoverBorder: "hover:border-pink-400 dark:hover:border-pink-500",
    badgeStyle: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200",
  },
  {
    id: "arr-disponibilite",
    title: "Mise en disponibilité",
    description: "Arrêté portant mise en disponibilité ou renouvellement (CGFP & décret 86-68)",
    category: "temps",
    categoryLabel: "Temps de travail & Absences",
    icon: <CalendarOff className="w-6 h-6" />,
    badge: "Essentiel",
    gradient: "from-fuchsia-600 to-purple-600",
    shadow: "shadow-fuchsia-500/25",
    accentColor: "text-fuchsia-600 dark:text-fuchsia-400",
    hoverBorder: "hover:border-fuchsia-400 dark:hover:border-fuchsia-500",
    badgeStyle: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 border-fuchsia-200",
  },

  // 3. MOBILITÉS & MOUVEMENTS
  {
    id: "arr-mutation-interne",
    title: "Mutation Interne",
    description: "Arrêté de changement d'affectation interne au sein de la collectivité",
    category: "mobilite",
    categoryLabel: "Mobilités & Affectations",
    icon: <ArrowRightLeft className="w-6 h-6" />,
    gradient: "from-indigo-600 to-violet-700",
    shadow: "shadow-indigo-500/25",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
    badgeStyle: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200",
  },
  {
    id: "arr-mutation-externe",
    title: "Mutation Externe",
    description: "Arrêté de mutation externe (entrant ou sortant d'une autre collectivité)",
    category: "mobilite",
    categoryLabel: "Mobilités & Affectations",
    icon: <ExternalLink className="w-6 h-6" />,
    gradient: "from-orange-500 to-red-600",
    shadow: "shadow-orange-500/25",
    accentColor: "text-orange-600 dark:text-orange-400",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500",
    badgeStyle: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200",
  },
  {
    id: "arr-detachement",
    title: "Détachement",
    description: "Arrêté de détachement entrant ou sortant (autre fonction publique / corps)",
    category: "mobilite",
    categoryLabel: "Mobilités & Affectations",
    icon: <Briefcase className="w-6 h-6" />,
    gradient: "from-lime-600 to-emerald-600",
    shadow: "shadow-lime-500/25",
    accentColor: "text-lime-700 dark:text-lime-400",
    hoverBorder: "hover:border-lime-400 dark:hover:border-lime-500",
    badgeStyle: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300 border-lime-200",
  },
  {
    id: "arr-integration",
    title: "Intégration après détachement",
    description: "Arrêté portant intégration définitive dans le cadre d'emplois d'accueil",
    category: "mobilite",
    categoryLabel: "Mobilités & Affectations",
    icon: <UserCheck className="w-6 h-6" />,
    gradient: "from-emerald-600 to-cyan-600",
    shadow: "shadow-emerald-600/25",
    accentColor: "text-emerald-700 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200",
  },
  {
    id: "arr-reintegration",
    title: "Réintégration / Reprise",
    description: "Arrêté de réintégration après disponibilité, congé parental ou détachement",
    category: "mobilite",
    categoryLabel: "Mobilités & Affectations",
    icon: <RotateCcw className="w-6 h-6" />,
    badge: "Essentiel",
    gradient: "from-yellow-500 to-amber-600",
    shadow: "shadow-yellow-500/25",
    accentColor: "text-amber-700 dark:text-amber-400",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    badgeStyle: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200",
  },

  // 4. DÉLIBÉRATIONS COLLECTIVES (CONSEIL MUNICIPAL / CST)
  {
    id: "delib-poste",
    title: "Délibération — Tableau des emplois",
    description: "Création, modification ou suppression d'emploi permanent au tableau des effectifs (art. L. 313-1 CGFP)",
    category: "deliberation",
    categoryLabel: "Délibérations Collectives",
    icon: <Landmark className="w-6 h-6" />,
    badge: "Conseil Municipal",
    gradient: "from-indigo-600 to-blue-700",
    shadow: "shadow-indigo-500/25",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
    badgeStyle: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200",
  },
  {
    id: "delib-rifseep",
    title: "Délibération — Régime RIFSEEP",
    description: "Instauration ou actualisation des groupes de fonctions IFSE et plafonds CIA après avis du CST",
    category: "deliberation",
    categoryLabel: "Délibérations Collectives",
    icon: <Scale className="w-6 h-6" />,
    badge: "CST & Primes",
    gradient: "from-rose-600 to-orange-600",
    shadow: "shadow-rose-500/25",
    accentColor: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-400 dark:hover:border-rose-500",
    badgeStyle: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200",
  },
];

interface MetiersProps {
  onClose: () => void;
  onOpenCalculator: (id: string) => void;
  onOpenM57?: () => void;
  onOpenCoinRH?: () => void;
  onOpenCalculators?: () => void;
  theme?: 'light' | 'dark';
}

const Metiers: React.FC<MetiersProps> = ({ onClose, onOpenCalculator, onOpenM57, onOpenCoinRH, onOpenCalculators, theme = 'dark' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredActes = ACTES_CATALOG.filter((acte) => {
    const matchCategory = selectedCategory === "all" || acte.category === selectedCategory;
    const matchSearch = searchQuery.trim() === "" || 
      acte.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acte.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acte.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-900">
      
      {/* HEADER GLOBAL OUTILS RH */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 hidden xs:flex sm:flex">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">Aides aux Gestionnaires</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Arrêtés administratifs pré-remplis, délibérations & simulateurs RH</p>
            </div>
          </div>

          {/* Raccourcis de liaison inter-pages */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {onOpenM57 && (
              <button
                type="button"
                onClick={onOpenM57}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Budget M57</span>
              </button>
            )}
            {onOpenCoinRH && (
              <button
                type="button"
                onClick={onOpenCoinRH}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Coin du Défenseur</span>
              </button>
            )}
            {onOpenCalculators && (
              <button
                type="button"
                onClick={onOpenCalculators}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Boîte à Outils</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Module 1 : Actes RH (Arrêtés) — Thème Violet / Pourpre */}
        <section className="rounded-3xl p-6 sm:p-8 bg-purple-50/50 dark:bg-purple-950/15 border-2 border-purple-200/80 dark:border-purple-800/50 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-md shadow-purple-500/20">
                <LayoutList className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                    Bloc 1 • Arrêtés Individuels
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Actes RH (Arrêtés)</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Générez rapidement vos arrêtés administratifs pré-remplis (CGFP, LDG, CIG Petite Couronne)</p>
              </div>
            </div>

            {/* Barre de recherche rapide */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un arrêté..."
                className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
          </div>

          {/* Onglets / Filtres par catégorie */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-purple-200/70 dark:border-purple-800/50 pb-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700"
              }`}
            >
              Tous les arrêtés ({ACTES_CATALOG.length})
            </button>
            <button
              onClick={() => setSelectedCategory("carriere")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "carriere"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700"
              }`}
            >
              Carrière & Progression (4)
            </button>
            <button
              onClick={() => setSelectedCategory("temps")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "temps"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700"
              }`}
            >
              Temps de travail & Absences (4)
            </button>
            <button
              onClick={() => setSelectedCategory("mobilite")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "mobilite"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700"
              }`}
            >
              Mobilités & Affectations (5)
            </button>
            <button
              onClick={() => setSelectedCategory("deliberation")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "deliberation"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700"
              }`}
            >
              Délibérations Collectives (2)
            </button>
          </div>

          {/* Grille des arrêtés */}
          {filteredActes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredActes.map((acte) => (
                <ActeCard
                  key={acte.id}
                  title={acte.title}
                  description={acte.description}
                  category={acte.categoryLabel}
                  icon={acte.icon}
                  toolId={acte.id}
                  onOpen={onOpenCalculator}
                  badge={acte.badge}
                  gradient={acte.gradient}
                  shadow={acte.shadow}
                  accentColor={acte.accentColor}
                  hoverBorder={acte.hoverBorder}
                  badgeStyle={acte.badgeStyle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun arrêté ne correspond à votre recherche "{searchQuery}".</p>
              <button 
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                className="mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        {/* Module 2 : Simulation d'Actes RH — Thème Émeraude / Teal */}
        <section className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-cyan-50/60 dark:from-teal-950/25 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-teal-300/80 dark:border-teal-800/60 shadow-sm">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-600 text-white shadow-xs">
              Bloc 2 • Ingénierie Juridique & Contrats CGFP
            </span>
          </div>
          <SimulationActeModule theme={theme} />
        </section>
        
      </div>
    </div>
  );
};

export default Metiers;
