import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Shield,
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
  Gavel,
  ExternalLink,
  Clock,
  AlertTriangle
} from "lucide-react";
import { extractTextFromFile, auditStatutoryDocument, FullLegalAuditResult } from "../services/statutoryAuditEngine";
import { OfficialDocumentPreview } from "./OfficialDocumentPreview";
import { MemoireJuridiqueGenerator } from "./MemoireJuridiqueGenerator";
import { exportStatutoryActToDocx } from "../utils/docxExport";
import { queryJurisprudence, JurisprudenceDecision } from "../services/jurisprudence";
import { toast } from "sonner";

interface CoinRHProps {
  onClose: () => void;
  theme?: "light" | "dark";
}

export default function CoinRH({ onClose, theme = "dark" }: CoinRHProps) {
  const isLight = theme === "light";

  const [statutResult, setStatutResult] = useState<FullLegalAuditResult | null>(null);
  const [isStatutLoading, setIsStatutLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [isMemoireOpen, setIsMemoireOpen] = useState<boolean>(false);
  const statutResultRef = useRef<HTMLDivElement>(null);

  // Jurisprudence search state
  const [jurisQuery, setJurisQuery] = useState<string>("");
  const [jurisResults, setJurisResults] = useState<JurisprudenceDecision[] | null>(null);
  const [jurisTotal, setJurisTotal] = useState<number>(0);
  const [jurisError, setJurisError] = useState<string | null>(null);
  const [isJurisLoading, setIsJurisLoading] = useState<boolean>(false);
  const jurisResultRef = useRef<HTMLDivElement>(null);

  const handleJurisSearch = async (queryToUse?: string) => {
    const rawQuery = queryToUse !== undefined ? queryToUse : jurisQuery;
    const effectiveQuery = rawQuery.trim() || "proportionnalité sanction disciplinaire";
    setIsJurisLoading(true);
    setJurisError(null);
    try {
      const res = await queryJurisprudence(effectiveQuery, 5);
      if (res.success) {
        setJurisResults(res.results);
        setJurisTotal(res.totalCount || res.results.length);
      } else {
        setJurisResults(null);
        setJurisError(res.message || "Recherche indisponible");
      }
    } catch (err) {
      console.error("Erreur jurisprudence:", err);
      setJurisError("Service jurisprudence injoignable");
    } finally {
      setIsJurisLoading(false);
      setTimeout(() => { jurisResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

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
                Coin du Défenseur • Actes & Légalité
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

        {/* ─── MODULE 2 : RÉDACTION DE MÉMOIRE EN DÉFENSE ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-2xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-white border-blue-200 shadow-blue-100/50"
            : "bg-[#0E1526] border-blue-500/40 shadow-2xl shadow-black/80"
        }`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-blue-500/20 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-[#101B33] text-blue-400 rounded-2xl border border-blue-500/40 shadow-inner shrink-0">
                  <Gavel className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Rédaction de Mémoire en Défense
                    </h2>
                    <span className="text-[10.5px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-[#101B33] text-blue-300 border border-blue-500/40">
                      Syllogisme CGFP & CE Dahan
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-1 max-w-3xl ${isLight ? "text-slate-500" : "text-slate-300"}`}>
                    Déposez un rapport disciplinaire ou une convocation : l'outil pré-remplit les griefs puis rédige le mémoire en défense complet (légalité externe, syllogismes, proportionnalité, bordereau de pièces) exportable en Word.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMemoireOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 transform hover:scale-[1.03] active:scale-95 self-start md:self-auto"
              >
                <Gavel className="w-4 h-4 text-amber-300" />
                <span>Rédiger un mémoire</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── MODULE 3 : RECHERCHE DE JURISPRUDENCE ─── */}
        <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-xl relative overflow-hidden transition-all ${
          isLight
            ? "bg-white border-indigo-200 shadow-indigo-100/50"
            : "bg-[#0E1526] border-indigo-500/40 shadow-2xl shadow-black/80"
        }`}>
          {/* Header Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-base sm:text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Recherche de Jurisprudence Administrative</h2>
                <p className={`text-xs font-medium mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Fond CETAT Légifrance (PISTE) • Conseil d'État, Cours Administratives d'Appel (CAA), Tribunaux Administratifs (TA)
                </p>
              </div>
            </div>
            {jurisTotal > 0 && (
              <div className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> {jurisTotal.toLocaleString("fr-FR")} arrêts & jugements administratifs indexés
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900/95 border-2 border-indigo-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Interroger le contentieux administratif (Conseil d'État & CAA)</h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Recherchez les arrêts et jugements applicables aux agents et collectivités : sanctions disciplinaires, protection fonctionnelle, primes & IFSE, mutation d'office, droit de retrait…</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 flex items-center">
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={jurisQuery}
                    onChange={(e) => setJurisQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleJurisSearch(); } }}
                    placeholder="Ex: proportionnalité sanction disciplinaire, droit de retrait, prime IFSE…"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border-2 border-indigo-500 rounded-xl text-sm font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md"
                  />
                </div>
                <button
                  onClick={() => handleJurisSearch()}
                  disabled={isJurisLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isJurisLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Rechercher</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-1">Suggested :</span>
                {[
                  { label: "Proportionnalité sanction", query: "proportionnalité sanction disciplinaire" },
                  { label: "Droit de retrait", query: "droit de retrait danger grave imminent fonctionnaire" },
                  { label: "Protection fonctionnelle", query: "protection fonctionnelle agent territorial diffamation" },
                  { label: "Sanction déguisée", query: "mutation changement affectation sanction déguisée" },
                  { label: "Accident / CITIS", query: "imputabilité au service accident trajet CITIS" },
                  { label: "Refus titularisation", query: "refus titularisation stagiaire insuffisance professionnelle" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => { setJurisQuery(chip.query); handleJurisSearch(chip.query); }}
                    disabled={isJurisLoading}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {jurisError && (
            <div className="mt-4 bg-white/95 dark:bg-slate-900/95 border-2 border-red-500/40 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Recherche indisponible</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{jurisError}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {isJurisLoading && !jurisResults && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {[1,2,3].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {jurisResults && !isJurisLoading && (
            <div ref={jurisResultRef} className="mt-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                {jurisResults.length === 0
                  ? "Aucune décision administrative trouvée."
                  : `${jurisResults.length} décision(s) sur ${jurisTotal.toLocaleString("fr-FR")} au total :`}
              </p>
              {jurisResults.map((decision, idx) => (
                <a
                  key={decision.id || idx}
                  href={decision.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">{decision.juridiction}</span>
                      {decision.date && <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" /> {decision.date}</span>}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Légifrance (CETAT)</span><ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-500 transition-colors">{decision.title}</h4>
                  {decision.summary && <p className="text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300 line-clamp-3">{decision.summary}</p>}
                  {!decision.summary && decision.excerpt && <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400 line-clamp-3 italic">{decision.excerpt}</p>}
                </a>
              ))}
            </div>
          )}
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
            {(statutResult.auditHeader) && (
              <div className={`p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#090D1A] border-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400">📅 Analyse :</span>
                  <span>{statutResult.auditHeader.dateAnalyse}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">📍 Champ :</span>
                  <span>{statutResult.auditHeader.champTerritorial}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">⚖️ Ressort :</span>
                  <span>{statutResult.auditHeader.juridictionRecours}</span>
                </div>
              </div>
            )}

            {/* Comprehensive Legal Controls Grid (Légalité Externe vs Légalité Interne) */}
            {(statutResult.controleLegaliteExterne || statutResult.controleLegaliteInterne) && (
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
                    {statutResult.controleLegaliteExterne?.competenceSignataire && (
                      <div className="flex items-start gap-2">
                        <span className={statutResult.controleLegaliteExterne.competenceSignataire.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {statutResult.controleLegaliteExterne.competenceSignataire.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Compétence de l'autorité signataire :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteExterne.competenceSignataire.details}</span>
                        </div>
                      </div>
                    )}
                    {statutResult.controleLegaliteExterne?.regulariteProcedure && (
                      <div className="flex items-start gap-2">
                        <span className={statutResult.controleLegaliteExterne.regulariteProcedure.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {statutResult.controleLegaliteExterne.regulariteProcedure.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Régularité de la procédure (DVE / Avis) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteExterne.regulariteProcedure.details}</span>
                        </div>
                      </div>
                    )}
                    {statutResult.controleLegaliteExterne?.clauseRecoursDelais && (
                      <div className="flex items-start gap-2">
                        <span className={statutResult.controleLegaliteExterne.clauseRecoursDelais.valide ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {statutResult.controleLegaliteExterne.clauseRecoursDelais.valide ? "✓" : "⚠️"}
                        </span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Clause des voies et délais de recours :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteExterne.clauseRecoursDelais.details}</span>
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
                    {statutResult.controleLegaliteInterne?.baseLegaleCGFP && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Base légale statutaire ({ statutResult.controleLegaliteInterne.baseLegaleCGFP.article }) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteInterne.baseLegaleCGFP.details}</span>
                        </div>
                      </div>
                    )}
                    {statutResult.controleLegaliteInterne?.dureeEtPlafonds && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Durée et respect des plafonds d'engagement :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteInterne.dureeEtPlafonds.details}</span>
                        </div>
                      </div>
                    )}
                    {statutResult.controleLegaliteInterne?.periodeEssai && (
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">✓</span>
                        <div>
                          <strong className="block text-slate-900 dark:text-white">Période d'essai & Décret 88-145 (Art. 4) :</strong>
                          <span className={isLight ? "text-slate-600" : "text-slate-300"}>{statutResult.controleLegaliteInterne.periodeEssai.details}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Adversarial Review & Pre-litigation Risks (Auto-critique / Regard Préfecture & TA) */}
            {(statutResult.autoCritiqueAdversariale) && (
              <div className={`p-5 rounded-2xl border-2 flex flex-col gap-4 shadow-xl transition-all ${
                isLight 
                  ? "bg-white border-amber-400/80 shadow-amber-100/60 text-slate-900" 
                  : "bg-[#0B132B] border-amber-400/60 shadow-black/70 text-slate-100"
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-amber-600 dark:text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" /> 3. Auto-Critique Adversariale & Risques Contentieux
                  </span>
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/50 shadow-2xs">
                    🏛️ Contrôle Préfectoral & TA Cergy
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                    isLight 
                      ? "bg-amber-50/70 border-amber-200/90 text-slate-800" 
                      : "bg-[#131D3B] border-slate-700/80 text-slate-200"
                  }`}>
                    <strong className="text-amber-700 dark:text-amber-300 font-black text-xs flex items-center gap-1.5">
                      <span>🏛️ Regard du Préfet (Contrôle de légalité) :</span>
                    </strong>
                    <p className="text-xs font-medium leading-relaxed">
                      {statutResult.autoCritiqueAdversariale.regardPrefecture}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                    isLight 
                      ? "bg-amber-50/70 border-amber-200/90 text-slate-800" 
                      : "bg-[#131D3B] border-slate-700/80 text-slate-200"
                  }`}>
                    <strong className="text-amber-700 dark:text-amber-300 font-black text-xs flex items-center gap-1.5">
                      <span>⚖️ Risque Contentieux Juge Administratif (TA Cergy) :</span>
                    </strong>
                    <p className="text-xs font-medium leading-relaxed">
                      {statutResult.autoCritiqueAdversariale.regardJugeAdministratif}
                    </p>
                  </div>
                </div>

                {statutResult.autoCritiqueAdversariale.recommandationsCorrectives?.length > 0 && (
                  <div className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                    isLight 
                      ? "bg-slate-50 border-slate-200 text-slate-800" 
                      : "bg-[#131D3B] border-slate-700/80 text-slate-200"
                  }`}>
                    <strong className="text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5">
                      <span>📝 Recommandations d'amendements clause par clause :</span>
                    </strong>
                    <ul className="space-y-1.5 text-xs font-medium">
                      {statutResult.autoCritiqueAdversariale.recommandationsCorrectives.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <span className="leading-relaxed">{rec}</span>
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

      {/* ─── OVERLAY : GÉNÉRATEUR DE MÉMOIRE JURIDIQUE ─── */}
      {isMemoireOpen && (
        <MemoireJuridiqueGenerator onClose={() => setIsMemoireOpen(false)} />
      )}
    </div>
  );
}
