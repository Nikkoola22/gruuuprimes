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
  Printer
} from "lucide-react";
import { queryStatutoryEngine, StatutoryQueryResult } from "../services/legifrance";
import { extractTextFromFile, auditStatutoryDocument } from "../services/statutoryAuditEngine";
import { OfficialDocumentPreview } from "./OfficialDocumentPreview";
import { ALL_THEMES_TEMPLATES } from "../data/allThemesTemplatesRegistry";
import { exportStatutoryActToDocx } from "../utils/docxExport";
import { GennevilliersLogo } from "./GennevilliersLogo";
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromFile(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        content: text || ""
      });
      toast.success(`Fichier "${file.name}" chargé pour audit.`);
    } catch (err) {
      console.error("Erreur lecture fichier:", err);
      toast.error("Échec de la lecture du fichier.");
    }
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return;
    setIsStatutLoading(true);
    try {
      const res = auditStatutoryDocument(uploadedFile.name, uploadedFile.content);
      setStatutResult(res);
      toast.success("Audit juridique et conformité CGFP terminés !");
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
    <div className={`w-full min-h-screen pb-24 relative z-20 transition-colors duration-300 ${
      isLight 
        ? "bg-slate-100 text-slate-900" 
        : "bg-[#060913] text-slate-100"
    }`}>
      {/* Top Header Sticky */}
      <div className={`sticky top-0 z-40 border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
        isLight
          ? "bg-white border-slate-200 shadow-sm"
          : "bg-[#0A0F1D] border-slate-800 shadow-lg shadow-black/50"
      }`}>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            title="Retour au menu principal"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Coin RH • Actes & Légalité
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ville de Gennevilliers
              </span>
            </div>
            <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Contrôle de conformité statutaire et rédaction automatisée d'actes officiels CGFP & CGCT
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#131C33] text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> 38 Modèles Certifiés
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── MODULE 1 : VÉRIFICATION DE LÉGALITÉ ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-white border-emerald-300 shadow-emerald-100/50"
            : "bg-[#0E1526] border-emerald-500/40 shadow-2xl shadow-black/80"
        }`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-[#11241D] text-emerald-400 rounded-2xl border border-emerald-500/40 shrink-0">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Vérifier la Légalité d'un Document Administratif
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#11241D] text-emerald-300 border border-emerald-500/40">
                      CGFP & CGCT
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-1 max-w-3xl ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    Contrôlez instantanément la conformité statutaire de vos arrêtés, contrats ou décisions (visas obligatoires, motifs, délais et recours TA Cergy-Pontoise).
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-300 bg-[#11241D] px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Contrôle Visas & MPO CIG
              </span>
            </div>

            {/* Dropzone & Direct verification */}
            <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-[#060913] border-slate-800"
            }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 border ${
                  isLight ? "bg-white text-emerald-600 border-slate-200" : "bg-[#10192E] text-emerald-400 border-slate-700"
                }`}>
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {uploadedFile ? uploadedFile.name : "Glissez un projet d'acte (.docx, .doc, .pdf, .txt) pour audit CGFP"}
                  </p>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
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
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs ${
                    isLight 
                      ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                      : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-200 border-slate-700"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{uploadedFile ? "Changer de fichier" : "Parcourir un fichier"}</span>
                </label>
                <button
                  onClick={() => {
                    if (uploadedFile) {
                      handleAnalyzeFile();
                    } else if (statutInput.trim()) {
                      setIsStatutLoading(true);
                      try {
                        const res = auditStatutoryDocument("Saisie Utilisateur", statutInput);
                        setStatutResult(res);
                        toast.success("Audit juridique et conformité CGFP terminés !");
                        setTimeout(() => {
                          statutResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 150);
                      } finally {
                        setIsStatutLoading(false);
                      }
                    } else {
                      setIsStatutLoading(true);
                      try {
                        const res = auditStatutoryDocument("Contrat CDD sur Emploi Permanent (Modèle CGFP)", "Contrat d'engagement à durée déterminée sur emploi permanent article L. 332-8 du Code Général de la Fonction Publique, Ville de Gennevilliers.");
                        setStatutResult(res);
                        toast.success("Audit de conformité CGFP généré !");
                        setTimeout(() => {
                          statutResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 150);
                      } finally {
                        setIsStatutLoading(false);
                      }
                    }
                  }}
                  disabled={isStatutLoading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 border border-emerald-400/40 hover:border-emerald-300 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shrink-0 transform hover:scale-[1.03] active:scale-95"
                >
                  {isStatutLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scale className="w-4 h-4 text-emerald-200" />
                  )}
                  <span>{uploadedFile ? `Auditer la légalité (${uploadedFile.name.length > 20 ? uploadedFile.name.slice(0, 18) + '…' : uploadedFile.name})` : "Tester la légalité de l'acte"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODULE 2 : SIMULATION D'ACTES ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-2xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-white border-indigo-200 shadow-indigo-100/50"
            : "bg-[#0E1526] border-indigo-500/40 shadow-2xl shadow-black/80"
        }`}>
          <div className="relative z-10 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-indigo-500/20 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-[#171F38] text-indigo-400 rounded-2xl border border-indigo-500/40 shadow-inner shrink-0">
                  <FileSignature className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Simulation d'Actes <span className="text-sm font-semibold text-amber-400/90">(non officiels)</span>
                    </h2>
                    <span className="text-[10.5px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-[#182348] text-indigo-300 border border-indigo-500/40">
                      WORD (.DOCX) • VILLE DE GENNEVILLIERS
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-1 max-w-3xl ${isLight ? "text-slate-500" : "text-slate-300"}`}>
                    Rédigez immédiatement un arrêté du Maire, un contrat CDD de droit public, un ordre de service ou une décision municipale conforme.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-indigo-300 bg-[#171F38] px-3 py-1.5 rounded-xl border border-indigo-500/40 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 38 Modèles Thématiques
              </span>
            </div>

            {/* Input Bar & Actions */}
            <div className="flex flex-col gap-2.5">
              <div className={`flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl border shadow-inner ${
                isLight ? "bg-slate-50 border-slate-300 focus-within:border-indigo-500" : "bg-[#060913] border-slate-700 focus-within:border-indigo-400"
              }`}>
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
                  <span>Générer la simulation</span>
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
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isLight
                        ? "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300 shadow-2xs"
                        : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-200 hover:text-indigo-300 border-slate-700 hover:border-indigo-500/50"
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Browser with Dual Filtering */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedThemeFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedThemeFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : isLight 
                        ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-300 border border-slate-700"
                  }`}
                >
                  <span>Tous les thèmes</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedThemeFilter === "all" ? "bg-indigo-700 text-indigo-100" : isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"
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
                          : isLight
                            ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-300 border border-slate-700"
                      }`}
                    >
                      <span>{thm.icon || "📌"} {thm.title.split("&")[0].trim()}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? "bg-indigo-700 text-indigo-100" : isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"
                      }`}>
                        {thm.templates.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Filters: Type Filter + Live Keyword Filter */}
              <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl border ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#060913] border-slate-800"
              }`}>
                <div className="flex flex-wrap items-center gap-1">
                  <span className={`text-[11px] font-bold mr-1.5 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Typologie :</span>
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
                          : isLight 
                            ? "text-slate-600 hover:bg-slate-200"
                            : "text-slate-300 hover:bg-[#151F38]"
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
                    className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 border ${
                      isLight 
                        ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                        : "bg-[#0E1526] border-slate-700 text-white placeholder-slate-400"
                    }`}
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
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                            isLight
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : "bg-[#151F38] text-indigo-300 border-indigo-500/40"
                          }`}
                        >
                          Réinitialiser tous les filtres
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((tpl) => {
                    const typeStyles: Record<string, { badge: string; border: string }> = {
                      arrete: {
                        badge: "bg-[#11241D] text-emerald-300 border-emerald-500/40",
                        border: "hover:border-emerald-400 dark:hover:border-emerald-500"
                      },
                      decision: {
                        badge: "bg-[#2A151C] text-rose-300 border-rose-500/40",
                        border: "hover:border-rose-400 dark:hover:border-rose-500"
                      },
                      contrat: {
                        badge: "bg-[#171F38] text-indigo-300 border-indigo-500/40",
                        border: "hover:border-indigo-400 dark:hover:border-indigo-500"
                      },
                      circulaire: {
                        badge: "bg-[#102334] text-sky-300 border-sky-500/40",
                        border: "hover:border-sky-400 dark:hover:border-sky-500"
                      },
                      courrier: {
                        badge: "bg-[#2A2012] text-amber-300 border-amber-500/40",
                        border: "hover:border-amber-400 dark:hover:border-amber-500"
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
                        className={`group relative flex flex-col justify-between p-3.5 border ${currentStyle.border} rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 ${
                          isLight
                            ? "bg-white hover:bg-indigo-50/40 border-slate-200"
                            : "bg-[#131C33] hover:bg-[#1A2645] border-slate-700"
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${currentStyle.badge}`}>
                              {tpl.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]" title={tpl.cgfpRef}>
                              {tpl.cgfpRef.split("&")[0].trim()}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-400 line-clamp-1 transition-colors">
                            {tpl.name}
                          </h4>
                          <p className={`text-[11px] line-clamp-2 leading-relaxed font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                            {tpl.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-700/60">
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[140px]">
                            {tpl.themeTitle || "Gennevilliers"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
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
                : "bg-[#0E1526] border-emerald-500/40 shadow-2xl shadow-black/80"
            }`}
          >
            {/* Header Result */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block mb-1">
                  {statutResult.category}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {statutResult.title}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
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
                  className={`px-3.5 py-2.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-200 border-slate-700"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-2.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-[#151F38] hover:bg-[#1E2D52] text-slate-200 border-slate-700"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            {/* Traceability & Legal Audit Context Header */}
            {((statutResult as any).auditHeader) && (
              <div className={`p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#090D1A] border-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400">📅 Analyse :</span>
                  <span>{(statutResult as any).auditHeader.dateAnalyse}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">📍 Champ :</span>
                  <span>{(statutResult as any).auditHeader.champTerritorial}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">⚖️ Ressort :</span>
                  <span>{(statutResult as any).auditHeader.juridictionRecours}</span>
                </div>
              </div>
            )}

            {/* Comprehensive Legal Controls Grid (Légalité Externe vs Légalité Interne) */}
            {((statutResult as any).controleLegaliteExterne || (statutResult as any).controleLegaliteInterne) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Contrôle de Légalité Externe (Forme, Compétence, Procédure) */}
                <div className={`p-4.5 rounded-2xl border flex flex-col gap-3 ${
                  isLight ? "bg-emerald-50/70 border-emerald-200" : "bg-[#081512] border-emerald-500/40"
                }`}>
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> 1. Contrôle de Légalité Externe
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Compétence & Forme
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(statutResult as any).controleLegaliteExterne?.competenceSignataire && (
                      <div className="flex items-start gap-2">
                        <span className={(statutResult as any).controleLegaliteExterne.competenceSignataire.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {(statutResult as any).controleLegaliteExterne.competenceSignataire.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Compétence de l'autorité signataire :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteExterne.competenceSignataire.details}</span>
                        </div>
                      </div>
                    )}
                    {(statutResult as any).controleLegaliteExterne?.regulariteProcedure && (
                      <div className="flex items-start gap-2">
                        <span className={(statutResult as any).controleLegaliteExterne.regulariteProcedure.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {(statutResult as any).controleLegaliteExterne.regulariteProcedure.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Régularité de la procédure (DVE / Avis) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteExterne.regulariteProcedure.details}</span>
                        </div>
                      </div>
                    )}
                    {(statutResult as any).controleLegaliteExterne?.clauseRecoursDelais && (
                      <div className="flex items-start gap-2">
                        <span className={(statutResult as any).controleLegaliteExterne.clauseRecoursDelais.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {(statutResult as any).controleLegaliteExterne.clauseRecoursDelais.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Clause des voies et délais de recours :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteExterne.clauseRecoursDelais.details}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Contrôle de Légalité Interne (Fond, Qualification, Plafonds) */}
                <div className={`p-4.5 rounded-2xl border flex flex-col gap-3 ${
                  isLight ? "bg-indigo-50/70 border-indigo-200" : "bg-[#0A1024] border-indigo-500/40"
                }`}>
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> 2. Contrôle de Légalité Interne
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      Fond & Qualification CGFP
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(statutResult as any).controleLegaliteInterne?.baseLegaleCGFP && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Base légale statutaire ({ (statutResult as any).controleLegaliteInterne.baseLegaleCGFP.article }) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteInterne.baseLegaleCGFP.details}</span>
                        </div>
                      </div>
                    )}
                    {(statutResult as any).controleLegaliteInterne?.dureeEtPlafonds && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Durée et respect des plafonds d'engagement :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteInterne.dureeEtPlafonds.details}</span>
                        </div>
                      </div>
                    )}
                    {(statutResult as any).controleLegaliteInterne?.periodeEssai && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Période d'essai & Décret 88-145 (Art. 4) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{(statutResult as any).controleLegaliteInterne.periodeEssai.details}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Adversarial Review & Pre-litigation Risks (Auto-critique / Regard Préfecture & TA) */}
            {((statutResult as any).autoCritiqueAdversariale) && (
              <div className={`p-4.5 rounded-2xl border flex flex-col gap-3 ${
                isLight ? "bg-amber-50/70 border-amber-300" : "bg-[#1C1408] border-amber-500/40"
              }`}>
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 3. Auto-Critique Adversariale & Risques Contentieux
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/30">
                    Contrôle Préfectoral & TA
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong className="block text-amber-300 mb-1">🏛️ Regard du Préfet (Contrôle de légalité) :</strong>
                    <p className={isLight ? "text-slate-700" : "text-slate-300"}>
                      {(statutResult as any).autoCritiqueAdversariale.regardPrefecture}
                    </p>
                  </div>
                  <div>
                    <strong className="block text-amber-300 mb-1">⚖️ Risque Contentieux Juge Administratif (TA Cergy) :</strong>
                    <p className={isLight ? "text-slate-700" : "text-slate-300"}>
                      {(statutResult as any).autoCritiqueAdversariale.regardJugeAdministratif}
                    </p>
                  </div>
                </div>
                {(statutResult as any).autoCritiqueAdversariale.recommandationsCorrectives?.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/20">
                    <strong className="block text-amber-300 text-xs mb-1.5">📝 Recommandations d'amendements clause par clause :</strong>
                    <ul className="space-y-1 text-xs">
                      {(statutResult as any).autoCritiqueAdversariale.recommandationsCorrectives.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Grid (Visas & Conformité) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                isLight ? "bg-emerald-50 border-emerald-200" : "bg-[#091713] border-emerald-500/40"
              }`}>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Analyse de Forme & Visas
                </span>
                <ul className={`text-xs space-y-1.5 font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {statutResult.analyseForme?.mentionsObligatoires.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{m.name} ({m.note})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                isLight ? "bg-indigo-50 border-indigo-200" : "bg-[#0F142A] border-indigo-500/40"
              }`}>
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Conformité de Fond & Recommandations
                </span>
                <ul className={`text-xs space-y-1.5 font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {statutResult.analyseFond?.remarquesFond.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* A4 High-Fidelity Preview (Only if sampleDocument is present) */}
            {statutResult.sampleDocument && (
              <div className="mt-2">
                <OfficialDocumentPreview 
                  documentText={statutResult.sampleDocument}
                  title={statutResult.title}
                  category={statutResult.category}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
