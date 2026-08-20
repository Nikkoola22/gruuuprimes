import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Folder,
  Layers,
  Calendar,
  HardDrive,
  HelpCircle,
  Clock,
  Briefcase,
  Laptop,
  Shield,
  HeartHandshake,
  GraduationCap,
  Scale,
  Users,
  AlertCircle
} from 'lucide-react';
import { searchDocuthequeRAG, RAGSearchResult } from '../utils/docuthequeSearch';
import { GENNEVILLIERS_DOCUTHEQUE, DOCUTHEQUE_CATEGORIES, DocuthequeItem } from '../data/gennevilliersDocutheque';

interface DocuthequeRAGProps {
  onBack: () => void;
  initialQuery?: string;
  theme?: 'light' | 'dark';
}

const QUICK_SUGGESTIONS = [
  { label: "Temps partiel (80% / 50%)", query: "Je veux prendre un temps partiel" },
  { label: "Déclaration accident de travail", query: "Comment déclarer un accident de travail ?" },
  { label: "Forfait vélo & mobilités", query: "Demande de forfait mobilité durable vélo" },
  { label: "Télétravail & matériel 2026", query: "Je veux faire du télétravail" },
  { label: "Entretien CREP & Recours", query: "Modèle et révision de l'entretien professionnel CREP" },
  { label: "Congés bonifiés", query: "Dossier congés bonifiés outre-mer" },
  { label: "Compte Épargne Temps (CET)", query: "Alimenter mon compte épargne temps" },
  { label: "Enfant malade & Absence", query: "Autorisation absence pour enfant malade" },
  { label: "Démission & Mutation", query: "Formulaire de démission ou de mutation" },
  { label: "Procédure disciplinaire", query: "Règles et sanctions procédure disciplinaire" }
];

export const DocuthequeRAG: React.FC<DocuthequeRAGProps> = ({
  onBack,
  initialQuery = "",
  theme = 'dark'
}) => {
  const isLight = theme === 'light';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes les rubriques");
  const [ragResult, setRagResult] = useState<RAGSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Scroll en haut de page à l'ouverture du composant
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Exécuter la recherche RAG lors de la saisie
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setRagResult(null);
      setHasSearched(false);
      return;
    }
    const result = searchDocuthequeRAG(searchQuery);
    setRagResult(result);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSelectSuggestion = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    handleSearch(suggestedQuery);
  };

  // Liste filtrée pour le mode explorateur par catégorie
  const explorerDocuments = useMemo(() => {
    return GENNEVILLIERS_DOCUTHEQUE.filter(doc => {
      const matchCat = selectedCategory === "Toutes les rubriques" || doc.category === selectedCategory;
      if (!matchCat) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, query]);

  const getFormatBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30"><FileText className="w-3 h-3 text-rose-400" /> PDF</span>;
      case 'docx':
      case 'doc':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"><FileText className="w-3 h-3 text-blue-400" /> Word</span>;
      case 'xlsx':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><FileSpreadsheet className="w-3 h-3 text-emerald-400" /> Excel</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30"><FileText className="w-3 h-3 text-slate-400" /> Doc</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Temps de travail, congés, absences":
        return <Clock className="w-4 h-4 text-sky-400" />;
      case "Télétravail":
        return <Laptop className="w-4 h-4 text-indigo-400" />;
      case "Rémunération":
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "Santé et sécurité au travail":
        return <Shield className="w-4 h-4 text-amber-400" />;
      case "Formation":
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case "Droits syndicaux":
        return <Users className="w-4 h-4 text-red-400" />;
      case "Procédure disciplinaire":
        return <Scale className="w-4 h-4 text-rose-400" />;
      case "Prestations sociales":
        return <HeartHandshake className="w-4 h-4 text-pink-400" />;
      default:
        return <Folder className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0E17] text-slate-100'
    }`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
        isLight
          ? 'bg-white/85 border-slate-200 shadow-sm'
          : 'bg-[#0B0E17]/85 border-slate-800 shadow-black/40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2.5 rounded-xl transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
              }`}
              title="Retour au menu principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Docuthèque RH RAG
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Bot className="w-3.5 h-3.5 text-blue-400" /> Mode IA Génératif
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                111 documents et formulaires officiels • Ville de Gennevilliers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Intranet Connecté 🟢
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search & Question Hero Box */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-slate-200/50'
            : 'bg-gradient-to-b from-slate-900/90 to-[#0F1423]/95 border-slate-800/80 shadow-black/80'
        }`}>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Recherche Statutaire & RAG Intelligent
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Posez votre question RH en langage naturel
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              L’IA identifie automatiquement votre besoin statutaire, vous explique les démarches et vous fournit directement le formulaire officiel à télécharger.
            </p>
          </div>

          {/* Formulaire de recherche */}
          <form onSubmit={handleQuerySubmit} className="max-w-3xl mx-auto relative z-10">
            <div className={`flex items-center rounded-2xl border p-2 shadow-inner transition-all ${
              isLight
                ? 'bg-slate-50 border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10'
                : 'bg-slate-950/80 border-slate-700/80 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20'
            }`}>
              <Search className="w-5 h-5 ml-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Ex : Je veux prendre un temps partiel ? Comment déclarer un accident de travail ?"
                className="w-full bg-transparent px-4 py-3 text-sm sm:text-base focus:outline-none placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all shrink-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trouver</span>
              </button>
            </div>
          </form>

          {/* Suggestions rapides */}
          <div className="max-w-4xl mx-auto mt-6">
            <p className={`text-xs font-semibold mb-2.5 flex items-center gap-1.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <HelpCircle className="w-3.5 h-3.5" /> Exemples de questions fréquentes :
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item.query)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      : 'bg-slate-800/60 hover:bg-blue-500/20 text-slate-300 border-slate-700 hover:border-blue-400/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION RAG : Réponse Contextuelle et Formulaires Recommandés */}
        {hasSearched && ragResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Carte de Synthèse Explicative RAG */}
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl ${
              isLight
                ? 'bg-white border-blue-100 shadow-blue-500/5'
                : 'bg-slate-900/90 border-blue-500/30 shadow-blue-950/40'
            }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-400">
                      {ragResult.categoryHighlighted || "Synthèse & Documents Officiels"}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Conforme Statut Gennevilliers
                    </span>
                  </div>
                  <p className={`mt-2 text-sm sm:text-base leading-relaxed ${
                    isLight ? 'text-slate-700' : 'text-slate-200'
                  }`}>
                    {ragResult.explanation}
                  </p>
                </div>
              </div>

              {/* Points Clés Statutaires */}
              {ragResult.keyPoints && ragResult.keyPoints.length > 0 && (
                <div className={`mt-5 p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Règles & Démarches à retenir :
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {ragResult.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Grille des formulaires et documents identifiés */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Documents & Formulaires correspondants ({ragResult.matchedDocuments.length})
                </h3>
              </div>

              {ragResult.matchedDocuments.length === 0 ? (
                <div className={`text-center py-10 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Aucun document exact pour cette recherche</p>
                  <p className="text-xs text-slate-500 mt-1">Essayez avec un mot-clé plus général ou explorez les rubriques ci-dessous.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ragResult.matchedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50 hover:bg-slate-850'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 truncate">
                            {getCategoryIcon(doc.category)}
                            {doc.category} {doc.subCategory ? `› ${doc.subCategory}` : ''}
                          </span>
                          {getFormatBadge(doc.type)}
                        </div>

                        <h4 className="text-base font-bold group-hover:text-blue-400 transition-colors leading-snug">
                          {doc.title}
                        </h4>

                        <p className={`text-xs line-clamp-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {doc.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {doc.size}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {doc.date}</span>
                        </div>

                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-600/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION EXPLORATEUR : Naviguer dans les 111 documents par rubrique */}
        <div className="pt-8 border-t border-slate-800/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-400" />
                Explorateur Complet de la Docuthèque RH
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Consultez l'ensemble des 111 documents municipaux classés par thématiques
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium self-start">
              {explorerDocuments.length} document{explorerDocuments.length > 1 ? 's' : ''} affiché{explorerDocuments.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Filtres par Catégorie */}
          <div className="flex flex-wrap gap-2 pb-2">
            {DOCUTHEQUE_CATEGORIES.map((cat) => {
              const count = cat === "Toutes les rubriques"
                ? GENNEVILLIERS_DOCUTHEQUE.length
                : GENNEVILLIERS_DOCUTHEQUE.filter(d => d.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Liste Explorer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {explorerDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-blue-400'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 truncate">
                      {doc.category}
                    </span>
                    {getFormatBadge(doc.type)}
                  </div>
                  <h4 className="text-sm font-bold leading-snug line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {doc.summary}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{doc.date}</span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-medium transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>Télécharger</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
