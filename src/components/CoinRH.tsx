import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  Shield, 
  FileSignature, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Scale, 
  Download, 
  Copy, 
  Printer, 
  ExternalLink,
  BookOpen,
  Briefcase,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { queryStatutoryEngine, StatutoryQueryResult } from "../services/legifrance";
import { OfficialDocumentPreview } from "./OfficialDocumentPreview";
import { ALL_THEMES_TEMPLATES } from "../data/allThemesTemplatesRegistry";
import { exportStatutoryActToDocx } from "../utils/docxExport";
import { toast } from "sonner";

interface CoinRHProps {
  onClose: () => void;
  theme?: "light" | "dark";
}

export default function CoinRH({ onClose, theme = "dark" }: CoinRHProps) {
  const isLight = theme === "light";

  const [statutInput, setStatutInput] = useState<string>("");
  const [statutResult, setStatutResult] = useState<StatutoryQueryResult | null>(null);
  const [isStatutLoading, setIsStatutLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const statutResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleExecuteStatut = async (queryToUse?: string) => {
    const rawQuery = queryToUse !== undefined ? queryToUse : statutInput;
    const effectiveQuery = rawQuery.trim() || "Contrat CDD sur Emploi Permanent (CGFP Art. L. 332-8 2°)";

    setIsStatutLoading(true);
    try {
      const res = await queryStatutoryEngine("contrats", effectiveQuery);
      setStatutResult(res);
      setTimeout(() => {
        statutResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error("Erreur génération acte:", err);
      toast.error("Erreur lors de la génération de l'acte statutaire.");
    } finally {
      setIsStatutLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: file.size,
        content: text || ""
      });
      toast.success(`Fichier "${file.name}" chargé pour audit.`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return;
    setIsStatutLoading(true);
    try {
      const prompt = `Audit et contrôle de légalité du document : ${uploadedFile.name}\n${uploadedFile.content.substring(0, 1500)}`;
      const res = await queryStatutoryEngine("arretes", prompt);
      setStatutResult(res);
      toast.success("Audit documentaire CGFP terminé !");
      setTimeout(() => {
        statutResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error("Erreur audit fichier:", err);
      toast.error("Échec de l'audit documentaire.");
    } finally {
      setIsStatutLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${
      isLight 
        ? "bg-slate-50 text-slate-900" 
        : "bg-slate-950 text-slate-100"
    }`}>
      {/* Top Header Sticky */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
        isLight
          ? "bg-white/90 border-slate-200 shadow-sm"
          : "bg-slate-950/80 border-slate-800/80 shadow-md"
      }`}>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
            }`}
            title="Retour au menu principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Coin RH • Actes & Légalité
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ville de Gennevilliers
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Contrôle de conformité statutaire et rédaction automatisée d'actes officiels CGFP & CGCT
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> 38 Modèles Certifiés
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── MODULE 1 : VÉRIFICATION DE LÉGALITÉ ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border-emerald-300 shadow-emerald-100/50"
            : "bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/95 border-emerald-500/30 shadow-2xl shadow-emerald-950/30"
        }`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-emerald-800/40 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Vérifier la Légalité d'un Document Administratif
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      CGFP & CGCT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 max-w-3xl">
                    Contrôlez instantanément la conformité statutaire de vos arrêtés, contrats ou décisions (visas obligatoires, motifs, délais et recours TA Cergy-Pontoise).
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Contrôle Visas & MPO CIG
              </span>
            </div>

            {/* Dropzone & Direct verification */}
            <div className="bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2.5 bg-white dark:bg-slate-900 text-emerald-500 rounded-xl shrink-0 border border-slate-200 dark:border-slate-800">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {uploadedFile ? uploadedFile.name : "Glissez un projet d'acte (.docx, .doc, .pdf, .txt) pour audit CGFP"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {uploadedFile 
                      ? `${Math.round(uploadedFile.size / 1024)} ko chargé • Cliquez sur 'Auditer la légalité'` 
                      : "Ou tapez un projet d'acte dans le module de création ci-dessous"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  id="coinrh-file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.doc,.docx,.pdf"
                />
                <label
                  htmlFor="coinrh-file-upload"
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{uploadedFile ? "Changer de fichier" : "Parcourir un fichier"}</span>
                </label>
                <button
                  onClick={() => {
                    if (uploadedFile) {
                      handleAnalyzeFile();
                    } else {
                      handleExecuteStatut("Vérifier la conformité d'un arrêté de refus d'autorisation d'absence");
                    }
                  }}
                  disabled={isStatutLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 transform active:scale-98"
                >
                  {isStatutLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scale className="w-4 h-4" />
                  )}
                  <span>{uploadedFile ? "Auditer la légalité" : "Tester la légalité d'un acte"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODULE 2 : CRÉATION & GÉNÉRATION D'ACTES OFFICIELS ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-2xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-white/95 border-indigo-200 shadow-indigo-100/50"
            : "bg-slate-900/95 border-indigo-500/30 shadow-black/80"
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-inner shrink-0">
                  <FileSignature className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Création & Génération d'Actes Officiels
                    </h2>
                    <span className="text-[10.5px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      WORD (.DOCX) • VILLE DE GENNEVILLIERS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1 max-w-3xl">
                    Rédigez immédiatement un arrêté du Maire, un contrat CDD de droit public, un ordre de service ou une décision municipale conforme.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                <Sparkles className="w-3.5 h-3.5" /> 38 Modèles Thématiques
              </span>
            </div>

            {/* Input Bar & Actions */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5 bg-slate-50/90 dark:bg-slate-950/70 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={statutInput}
                    onChange={(e) => setStatutInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleExecuteStatut();
                      }
                    }}
                    placeholder="Ex: Contrat CDD L. 332-8 permanent, Arrêté nomination stagiaire, Remplacement L. 332-13, Arrêté IFSE..."
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                  {statutInput && (
                    <button
                      type="button"
                      onClick={() => setStatutInput("")}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-xs font-bold">✕</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleExecuteStatut()}
                  disabled={isStatutLoading}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 transform active:scale-98"
                >
                  {isStatutLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Générer l'acte officiel</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9.5px] font-mono bg-white/20 rounded-md text-white">↵</kbd>
                </button>
              </div>

              {/* Fast Inspiration Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                  Suggestions rapides :
                </span>
                {[
                  { label: "CDD Emploi Permanent (L. 332-8)", query: "Contrat CDD sur Emploi Permanent (CGFP Art. L. 332-8 2°)", icon: "📑" },
                  { label: "CDD Remplacement (L. 332-13)", query: "Contrat CDD : Remplacement Temporaire d'un Agent Indisponible (L. 332-13)", icon: "👥" },
                  { label: "CDD Accroissement (L. 332-23)", query: "Contrat CDD : Engagement pour Accroissement Temporaire d'Activité (L. 332-23 1°)", icon: "⚡" },
                  { label: "Médecin Vacataire", query: "Contrat Portant Engagement d'un Médecin Vacataire (Permanence des Soins)", icon: "🩺" },
                  { label: "Arrêté IFSE Mensuelle", query: "Arrêté du Maire : Attribution de l'IFSE Mensuelle", icon: "💰" },
                  { label: "Nomination Stagiaire", query: "Arrêté du Maire : Nomination en Qualité de Fonctionnaire Stagiaire", icon: "📜" },
                  { label: "Sanction Blâme", query: "Arrêté du Maire : Sanction Disciplinaire du 1er Groupe (Blâme)", icon: "⚖️" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setStatutInput(chip.query);
                      handleExecuteStatut(chip.query);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Browser with Dual Filtering */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedThemeFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedThemeFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>Tous les thèmes</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedThemeFilter === "all" ? "bg-indigo-700 text-indigo-100" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {ALL_THEMES_TEMPLATES.reduce((acc, t) => acc + t.templates.length, 0)}
                  </span>
                </button>

                {ALL_THEMES_TEMPLATES.map((thm) => {
                  const isActive = selectedThemeFilter === thm.id;
                  return (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => setSelectedThemeFilter(thm.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>{thm.icon || "📌"} {thm.title.split("&")[0].trim()}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? "bg-indigo-700 text-indigo-100" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                        {thm.templates.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Filters: Type Filter + Live Keyword Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mr-1.5">Typologie :</span>
                  {[
                    { id: "all", label: "Tous types" },
                    { id: "arrete", label: "📜 Arrêtés" },
                    { id: "contrat", label: "📑 Contrats" },
                    { id: "decision", label: "🏛️ Décisions" },
                    { id: "courrier", label: "✉️ Courriers" },
                    { id: "circulaire", label: "📋 Notes & Circulaires" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTypeFilter(t.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedTypeFilter === t.id
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder="Rechercher parmi les modèles..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {templateSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTemplateSearchQuery("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1 py-1 custom-scrollbar">
                {(() => {
                  const allRaw = selectedThemeFilter === "all"
                    ? ALL_THEMES_TEMPLATES.flatMap(t => t.templates.map(tpl => ({ ...tpl, themeTitle: t.title })))
                    : (ALL_THEMES_TEMPLATES.find(t => t.id === selectedThemeFilter)?.templates || []).map(tpl => ({ ...tpl, themeTitle: ALL_THEMES_TEMPLATES.find(t => t.id === selectedThemeFilter)?.title }));

                  const filtered = allRaw.filter(tpl => {
                    const matchType = selectedTypeFilter === "all" || tpl.type === selectedTypeFilter;
                    const matchSearch = !templateSearchQuery.trim() || 
                      tpl.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                      tpl.cgfpRef.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                      tpl.summary.toLowerCase().includes(templateSearchQuery.toLowerCase());
                    return matchType && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-full py-8 text-center flex flex-col items-center justify-center gap-2">
                        <p className="text-sm font-bold text-slate-400">Aucun modèle ne correspond à vos critères de recherche.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedThemeFilter("all");
                            setSelectedTypeFilter("all");
                            setTemplateSearchQuery("");
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800"
                        >
                          Réinitialiser tous les filtres
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((tpl) => {
                    const typeStyles: Record<string, { badge: string; border: string }> = {
                      arrete: {
                        badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80",
                        border: "hover:border-emerald-400 dark:hover:border-emerald-600"
                      },
                      decision: {
                        badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80",
                        border: "hover:border-rose-400 dark:hover:border-rose-600"
                      },
                      contrat: {
                        badge: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80",
                        border: "hover:border-indigo-400 dark:hover:border-indigo-600"
                      },
                      circulaire: {
                        badge: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80",
                        border: "hover:border-sky-400 dark:hover:border-sky-600"
                      },
                      courrier: {
                        badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80",
                        border: "hover:border-amber-400 dark:hover:border-amber-600"
                      }
                    };

                    const currentStyle = typeStyles[tpl.type] || typeStyles.arrete;

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setStatutInput(tpl.name);
                          handleExecuteStatut(tpl.name);
                        }}
                        className={`group relative flex flex-col justify-between p-3.5 bg-slate-50/90 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 ${currentStyle.border} rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${currentStyle.badge}`}>
                              {tpl.type}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[130px]" title={tpl.cgfpRef}>
                              {tpl.cgfpRef.split("&")[0].trim()}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 transition-colors">
                            {tpl.name}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                            {tpl.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate max-w-[140px]">
                            {tpl.themeTitle || "Gennevilliers"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                            <span>Générer</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RÉSULTAT ET PRÉVISUALISATION OFFICIELLE A4 ─── */}
        {statutResult && (
          <div 
            ref={statutResultRef} 
            className={`border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-200 min-w-0 ${
              isLight
                ? "bg-white border-emerald-300 shadow-emerald-100/50"
                : "bg-slate-900 border-emerald-500/40 shadow-black/80"
            }`}
          >
            {/* Header Result */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  {statutResult.category}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {statutResult.title}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                  Fondement juridique : {statutResult.cgfpRef}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {statutResult.sampleDocument && (
                  <button
                    onClick={() => exportStatutoryActToDocx(statutResult)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger (.docx Word)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(statutResult.sampleDocument || "");
                    toast.success("Texte de l'acte copié dans le presse-papier !");
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            {/* Analysis Grid (Visas & Conformité) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Analyse de Forme & Visas
                </span>
                <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  {statutResult.analyseForme?.mentionsObligatoires.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>{m.name} ({m.note})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Conformité de Fond & Recommandations
                </span>
                <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  {statutResult.analyseFond?.remarquesFond.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* A4 High-Fidelity Preview */}
            <div className="mt-2">
              <OfficialDocumentPreview 
                documentText={statutResult.sampleDocument || ""}
                title={statutResult.title}
                theme={theme}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
