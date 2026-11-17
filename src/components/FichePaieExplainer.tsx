import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Calculator,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Code,
  ClipboardPaste,
  Layers,
  BarChart3,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import CirilBulletinView from './CirilBulletinView';
import SimulateurImpotRevenu from './SimulateurImpotRevenu';
import {
  computeOpenFiscaPay,
  parseUploadedPaySlipWithMeta,
  FICHE_PAIE_PRESETS,
  OPENFISCA_REPO_URL,
  type CalculParams,
  type FichePaieAnalyseResult,
  type FichePaieLigne,
  type ParseMetadata
} from '../services/openfiscaPayEngine';
import { extractTextFromFile } from '../services/statutoryAuditEngine';

interface FichePaieExplainerProps {
  onClose?: () => void;
}

export default function FichePaieExplainer({ onClose }: FichePaieExplainerProps) {
  // Preset sélectionné par défaut
  const [selectedPresetId, setSelectedPresetId] = useState<string>("cat_c_adjoint");
  const [showSimulateurIR, setShowSimulateurIR] = useState<boolean>(false);

  // Paramètres de calcul dynamiques
  const [params, setParams] = useState<CalculParams>(() => {
    const defaultPreset = FICHE_PAIE_PRESETS[0];
    return {
      indiceMajore: defaultPreset.agent.indiceMajore,
      indiceBrut: defaultPreset.agent.indiceBrut,
      nbiPoints: defaultPreset.primes.nbiPoints,
      ifse: defaultPreset.primes.ifse,
      cia: defaultPreset.primes.cia,
      autresPrimes: defaultPreset.primes.autresPrimes,
      zoneResidence: defaultPreset.agent.zoneResidence,
      nbEnfantsSft: defaultPreset.agent.nbEnfantsSft,
      quotite: defaultPreset.agent.quotite,
      statut: defaultPreset.agent.statut,
      tauxPas: defaultPreset.tauxPas,
      nomAgent: defaultPreset.agent.nom,
      grade: defaultPreset.agent.grade,
      echelon: defaultPreset.agent.echelon
    };
  });

  // Fichier uploadé (le cas échéant)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedRawText, setUploadedRawText] = useState<string | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<ParseMetadata | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingStatus, setParsingStatus] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Mode collage direct de texte
  const [pastedText, setPastedText] = useState<string>('');
  const [showRawTextModal, setShowRawTextModal] = useState<boolean>(false);

  // Mode d'explication : 'simple' (Bulletin Ciril RH avec calques) ou 'complexe' (Synthèse & Audit OpenFisca)
  const [explanationMode, setExplanationMode] = useState<'simple' | 'complexe'>('simple');

  // État des onglets et filtres
  const [activeTab, setActiveTab] = useState<'lignes' | 'conformite' | 'openfisca'>('lignes');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedLignes, setExpandedLignes] = useState<Record<string, boolean>>({
    tib: true,
    ifse: true,
    cnracl: true
  });
  const [showAdvancedTuning, setShowAdvancedTuning] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const synthesisSectionRef = useRef<HTMLDivElement>(null);
  const lecteurRef = useRef<HTMLDivElement>(null);

  // Exécution du moteur de paie OpenFisca
  const result: FichePaieAnalyseResult = useMemo(() => {
    return computeOpenFiscaPay(params, uploadMetadata);
  }, [params, uploadMetadata]);

  // Basculer un preset prérempli
  const handleSelectPreset = (presetId: string) => {
    const preset = FICHE_PAIE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setUploadedFileName(null);
    setUploadedRawText(preset.rawTextPreview);
    setUploadMetadata(null);
    setParams({
      indiceMajore: preset.agent.indiceMajore,
      indiceBrut: preset.agent.indiceBrut,
      indiceRemun: undefined,
      lignesReelles: undefined,
      periode: undefined,
      nbiPoints: preset.primes.nbiPoints,
      ifse: preset.primes.ifse,
      cia: preset.primes.cia,
      autresPrimes: preset.primes.autresPrimes,
      zoneResidence: preset.agent.zoneResidence,
      nbEnfantsSft: preset.agent.nbEnfantsSft,
      quotite: preset.agent.quotite,
      statut: preset.agent.statut,
      tauxPas: preset.tauxPas,
      nomAgent: preset.agent.nom,
      matricule: undefined,
      numeroSecu: undefined,
      positionAdmin: undefined,
      service: undefined,
      poste: undefined,
      grade: preset.agent.grade,
      echelon: preset.agent.echelon,
      appliquerPpcr: false,
      abattementPpcr: undefined,
      remboursementTransport: undefined,
      indemniteCompensatriceCsg: undefined,
      participationMutuelleEmployeur: undefined,
      retenueMutuelleSalarie: undefined,
      montantsReels: undefined
    });

    toast.info(`Profil chargé : ${preset.label}`);

    // Scroll vers le lecteur de fiche (ou la synthèse si le mode complexe est actif)
    setTimeout(() => {
      if (explanationMode === "simple") {
        lecteurRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        synthesisSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  // Traitement d'un fichier uploadé (PDF, Word, TXT, CSV)
  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setParsingStatus(`Lecture du fichier ${file.name}...`);
    try {
      const text = await extractTextFromFile(file, (status) => {
        setParsingStatus(status);
      });

      if (!text || text.trim().length === 0) {
        toast.warning(
          "Aucun texte extrait du fichier. Vous pouvez ajuster vos données via les curseurs ou coller le texte."
        );
        setUploadedFileName(file.name);
        setUploadedRawText("(Fichier image / scan sans texte sélectionnable)");
        setShowAdvancedTuning(true);
        setIsParsing(false);
        return;
      }

      setParsingStatus("Analyse des rubriques de paie selon OpenFisca-France...");
      setUploadedFileName(file.name);
      setUploadedRawText(text);

      const parseResult = parseUploadedPaySlipWithMeta(text);
      setUploadMetadata(parseResult.metadata);
      setParams({
        zoneResidence: 1,
        nbEnfantsSft: 0,
        quotite: 100,
        statut: "titulaire",
        tauxPas: 0,
        ...parseResult.params
      });

      setSelectedPresetId("custom");
      setShowAdvancedTuning(true);

      const nbItems = parseResult.metadata.detectedItems.length;
      if (nbItems > 0) {
        toast.success(`Fiche de paie "${file.name}" analysée avec succès (${nbItems} éléments détectés) !`);
      } else {
        toast.info(`Fichier chargé (${text.length} caractères). Vous pouvez vérifier les paramètres ci-dessous.`);
      }

      setTimeout(() => {
        synthesisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      console.error("Erreur de parsing de fiche de paie:", err);
      toast.error("Erreur lors de la lecture du fichier.");
    } finally {
      setIsParsing(false);
      setParsingStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Traitement du texte collé
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      toast.error("Veuillez coller le texte de votre bulletin de paie.");
      return;
    }

    setIsParsing(true);
    try {
      const parseResult = parseUploadedPaySlipWithMeta(pastedText);
      setUploadedFileName("Texte collé manuellement");
      setUploadedRawText(pastedText);
      setUploadMetadata(parseResult.metadata);
      setParams({
        zoneResidence: 1,
        nbEnfantsSft: 0,
        quotite: 100,
        statut: "titulaire",
        tauxPas: 0,
        ...parseResult.params
      });

      setSelectedPresetId("custom");
      setShowAdvancedTuning(true);
      toast.success(`Texte analysé : ${parseResult.metadata.detectedItems.length} rubriques identifiées !`);

      setTimeout(() => {
        synthesisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const toggleLineExpand = (lineId: string) => {
    setExpandedLignes(prev => {
      const willExpand = !prev[lineId];
      if (willExpand && typeof window !== 'undefined' && window.innerWidth < 1024) {
        setTimeout(() => {
          const el = document.getElementById(`ligne-complexe-${lineId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
      return {
        ...prev,
        [lineId]: willExpand
      };
    });
  };

  // Filtrage des lignes
  const filteredLines = useMemo(() => {
    if (categoryFilter === 'all') return result.lignes;
    return result.lignes.filter(l => l.openFiscaVar.categorie === categoryFilter);
  }, [result.lignes, categoryFilter]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.openFiscaCodeSnippet);
    setCopiedCode(true);
    toast.success("Code Python OpenFisca copié !");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Ratios pour la barre visuelle
  const brut = result.totaux.salaireBrut || 1;
  const pctNet = Math.round((result.totaux.netAPayer / brut) * 100);
  const pctRetraite = Math.round(((result.openFiscaBenchmark.cnraclTheorique + result.openFiscaBenchmark.rafpTheorique) / brut) * 100);
  const pctCsg = Math.round((result.openFiscaBenchmark.csgTheorique / brut) * 100);
  const pctPas = Math.max(0, 100 - pctNet - pctRetraite - pctCsg);

  if (showSimulateurIR) {
    return (
      <SimulateurImpotRevenu
        onClose={() => setShowSimulateurIR(false)}
        initialNetFiscalMensuel={result.totaux.netFiscal}
        initialTauxPas={params.tauxPas}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER HAUTE VISIBILITÉ & BOUTONS D'ACTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comprenez Votre Fiche de Paie
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-3xl">
              Uploadez votre bulletin de paie (PDF, Scan, Word) ou collez son texte.
              Chaque ligne, retenue et prime est décryptée en clair et auditée selon le modèle socio-fiscal officiel OpenFisca.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
              title="Retour aux calculateurs"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. ZONE D'UPLOAD / COLLER & SÉLECTION DE PROFILS TYPES
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Upload et Collage direct */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            {/* Encadré Haute Visibilité : Lien officiel Portail Agent SIRH */}
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border-2 border-teal-500/40 dark:border-teal-500/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-200 block">
                  Téléchargez votre bulletin officiel
                </span>
              </div>

              <a
                href="https://gennevilliers-sirh-portail.ciril.net/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-95"
                title="Ouvrir le portail agent CIRIL RH de la Ville de Gennevilliers"
              >
                <span>Accéder au Portail Agent (Ciril RH)</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-500/10"
                  : "border-slate-300 dark:border-slate-700 hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="p-3 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                {isParsing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isParsing ? (parsingStatus || "Analyse en cours...") : "Glissez votre fiche de paie ici"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Formats acceptés : PDF, Word (.docx), Scan, TXT</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 mb-2 leading-relaxed">
              Ou copiez le texte depuis votre espace RH (Digiposte, ENSAP, etc.) :
            </p>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Collez ici les lignes de votre bulletin (ex: 101 Traitement de base 382...)"
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleProcessPastedText}
              disabled={isParsing || !pastedText.trim()}
              className="mt-2 w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Analyser ce texte</span>
            </button>
          </div>

            {uploadedFileName && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">{uploadedFileName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {uploadedRawText && (
                    <button
                      onClick={() => setShowRawTextModal(!showRawTextModal)}
                      className="text-[11px] underline text-emerald-700 dark:text-emerald-300 font-medium cursor-pointer"
                    >
                      {showRawTextModal ? "Masquer" : "Voir texte"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setUploadedFileName(null);
                      setUploadedRawText(null);
                      setUploadMetadata(null);
                      handleSelectPreset("cat_c_adjoint");
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold ml-1 cursor-pointer"
                    title="Réinitialiser"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {showRawTextModal && uploadedRawText && (
              <pre className="mt-2 max-h-44 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {uploadedRawText}
              </pre>
            )}
          </div>

        {/* Colonne Droite : 4 Profils Types FPT */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Ou testez un profil type prérempli
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Situations réelles modélisées selon la doctrine Ville de Gennevilliers
              </p>
            </div>
            {selectedPresetId !== 'custom' && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Profil actif : {FICHE_PAIE_PRESETS.find(p => p.id === selectedPresetId)?.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FICHE_PAIE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/50 dark:bg-orange-500/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {preset.badge}
                    </span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                      IM {preset.agent.indiceMajore}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {preset.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Ligne de contrôle : curseurs manuels + rappel de la valeur du point */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvancedTuning ? "Masquer les curseurs" : "Ajuster manuellement les valeurs"}</span>
            </button>
            <span className="text-xs text-slate-400">1 pt = 4,92278 €</span>
          </div>

          {/* Panneau des curseurs manuels dépliable */}
          {showAdvancedTuning && (
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Indice Majoré (IM) : <span className="text-orange-600 font-bold">{params.indiceMajore}</span>
                </label>
                <input
                  type="range"
                  min="366"
                  max="830"
                  value={params.indiceMajore}
                  onChange={(e) => setParams(prev => ({ ...prev, indiceMajore: parseInt(e.target.value, 10) }))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  IFSE Mensuelle : <span className="text-orange-600 font-bold">{params.ifse || 0} €</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1800"
                  step="25"
                  value={params.ifse || 0}
                  onChange={(e) => setParams(prev => ({ ...prev, ifse: parseFloat(e.target.value) }))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Enfants à charge (SFT) : <span className="text-orange-600 font-bold">{params.nbEnfantsSft || 0}</span>
                </label>
                <select
                  value={params.nbEnfantsSft || 0}
                  onChange={(e) => setParams(prev => ({ ...prev, nbEnfantsSft: parseInt(e.target.value, 10) }))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={0}>0 enfant (0 €)</option>
                  <option value={1}>1 enfant (2,29 € fixe)</option>
                  <option value={2}>2 enfants (fixe + 3% TIB)</option>
                  <option value={3}>3 enfants (fixe + 8% TIB)</option>
                  <option value={4}>4 enfants (+ 6% par enf. suppl.)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Statut statutaire
                </label>
                <select
                  value={params.statut || "titulaire"}
                  onChange={(e) => setParams(prev => ({ ...prev, statut: e.target.value as "titulaire" | "contractuel" | "stagiaire" }))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="titulaire">Fonctionnaire Titulaire (CNRACL + RAFP)</option>
                  <option value="stagiaire">Fonctionnaire Stagiaire (CNRACL + RAFP)</option>
                  <option value="contractuel">Agent Contractuel (Régime Général + IRCANTEC)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Taux PAS (Prélèvement Source) : <span className="text-orange-600 font-bold">{params.tauxPas || 0}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.1"
                  value={params.tauxPas || 0}
                  onChange={(e) => setParams(prev => ({ ...prev, tauxPas: parseFloat(e.target.value) || 0 }))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quotité de travail : <span className="text-orange-600 font-bold">{params.quotite || 100}%</span>
                </label>
                <select
                  value={params.quotite || 100}
                  onChange={(e) => setParams(prev => ({ ...prev, quotite: parseInt(e.target.value, 10) }))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={100}>Temps plein (100%)</option>
                  <option value={90}>Temps partiel 90%</option>
                  <option value={80}>Temps partiel 80% (payé 85,7%)</option>
                  <option value={50}>Mi-temps (50%)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Abattement PPCR : <span className="text-orange-600 font-bold">{params.abattementPpcr ? `-${params.abattementPpcr} €` : '0 €'}</span>
                </label>
                <select
                  value={params.abattementPpcr || 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setParams(prev => ({ ...prev, abattementPpcr: val, appliquerPpcr: val > 0 }));
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={0}>Aucun (Contractuels ou non-bénéficiaire)</option>
                  <option value={32.42}>32,42 € (Catégorie C & B)</option>
                  <option value={42.17}>42,17 € (Catégorie A)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Navigo 75% : <span className="text-emerald-600 font-bold">{params.remboursementTransport ? `+${params.remboursementTransport} €` : '0 €'}</span>
                </label>
                <select
                  value={params.remboursementTransport || 0}
                  onChange={(e) => setParams(prev => ({ ...prev, remboursementTransport: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={0}>Non (0 €)</option>
                  <option value={64.80}>Oui (64,80 € - 75% mensuel 2024)</option>
                  <option value={66.60}>Oui (66,60 € - 75% mensuel 2025)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Indemnité Compensatrice CSG : <span className="text-purple-600 font-bold">{params.indemniteCompensatriceCsg || 0} €</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={params.indemniteCompensatriceCsg || 0}
                  onChange={(e) => setParams(prev => ({ ...prev, indemniteCompensatriceCsg: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SÉLECTEUR DE MODE : 1. EXPLICATION SIMPLE (CIRIL) vs 2. EXPLICATION COMPLEXE (SYNTHÈSE)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div ref={synthesisSectionRef} className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-1.5 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setExplanationMode('simple')}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-all cursor-pointer ${
                explanationMode === 'simple'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-md scale-[1.01]'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="font-black flex items-center gap-1.5">
                  <span>1. Explication Simple</span>
                  {explanationMode === 'simple' && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />}
                </div>
                <div className="text-xs font-normal opacity-90">Bulletin Ciril RH officiel avec calques interactifs</div>
              </div>
            </button>

            <button
              onClick={() => setExplanationMode('complexe')}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-all cursor-pointer ${
                explanationMode === 'complexe'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-md scale-[1.01]'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="font-black flex items-center gap-1.5">
                  <span>2. Explication Complexe</span>
                  {explanationMode === 'complexe' && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />}
                </div>
                <div className="text-xs font-normal opacity-90">Synthèse mensuelle estimée, KPIs & OpenFisca</div>
              </div>
            </button>
          </div>
        </div>

        {explanationMode === 'simple' ? (
          <div className="space-y-6" ref={lecteurRef}>
            <CirilBulletinView
              params={params}
              result={result}
              onUpdateParam={(key, val) => setParams(prev => ({ ...prev, [key]: val }))}
              onApplyMultiParams={(multi) => setParams(prev => ({ ...prev, ...multi }))}
            />

            {/* Bannière d'accès direct vers l'explication complexe & Simulateur IR */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Net fiscal calculé : <strong>{Math.round(result.totaux.netFiscal || 0)} €/mois</strong> (~ {Math.round((result.totaux.netFiscal || 0) * 12).toLocaleString('fr-FR')} €/an). Voulez-vous vérifier votre impôt sur le revenu et votre prélèvement à la source (PAS) ?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowSimulateurIR(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simuler mon Impôt (IR & PAS) →</span>
                </button>
                <button
                  onClick={() => {
                    setExplanationMode('complexe');
                    setTimeout(() => synthesisSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  Synthèse Complexe →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 3. 5 KPI SYNTHÈSE & BARRE VISUELLE "OÙ VA VOTRE SALAIRE ?" */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Synthèse Mensuelle Estimée</span>
              {uploadedFileName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  ✓ Recalculé d'après votre bulletin
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Décomposition Globale de la Rémunération
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Score de conformité : {result.syntheseConformite.scoreConformite}/100
            </span>
          </div>
        </div>

        {/* 5 Cartes Chiffrées */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {/* Brut Total */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Traitement Brut
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {result.totaux.salaireBrut.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              TIB + Primes + SFT + Résidence
            </span>
          </div>

          {/* Cotisations */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block mb-1">
              Cotisations Salariales
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400">
              -{result.totaux.totalCotisationsSalariales.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 block mt-1">
              CNRACL + RAFP + CSG/CRDS
            </span>
          </div>

          {/* Net avant impôt */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block mb-1">
              Net Avant Impôt
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-300">
              {result.totaux.netAvantImpot.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
            <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 block mt-1">
              Brut déduit des cotisations
            </span>
          </div>

          {/* PAS */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
              Prélèvement Source ({result.totaux.tauxPas}%)
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300">
              -{result.totaux.montantPas.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 block mt-1">
              Sur base imposable : {result.totaux.netFiscal.toFixed(2)} €
            </span>
          </div>

          {/* Net à Payer */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
              Net à Payer (En Banque)
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {result.totaux.netAPayer.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-1 font-semibold">
              Virement effectif en fin de mois
            </span>
          </div>
        </div>

        {/* Barre de répartition proportionnelle */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Où va votre salaire brut ({result.totaux.salaireBrut.toFixed(2)} €) ?</span>
            <span>{pctNet}% viré sur votre compte</span>
          </div>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${pctNet}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Net à payer : ${pctNet}%`}
            />
            <div
              style={{ width: `${pctRetraite}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Retraite CNRACL/RAFP : ${pctRetraite}%`}
            />
            <div
              style={{ width: `${pctCsg}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`CSG & CRDS : ${pctCsg}%`}
            />
            <div
              style={{ width: `${pctPas}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Impôt sur le revenu (PAS) : ${pctPas}%`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Net en poche ({pctNet}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Retraite CNRACL & RAFP ({pctRetraite}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Solidarité & Santé CSG/CRDS ({pctCsg}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Prélèvement à la source ({pctPas}%)</span>
            </div>
          </div>
        </div>

        {/* Mention Patronale */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            <strong>Coût global employeur (Ville de Gennevilliers) :</strong>{" "}
            {result.totaux.coutGlobalEmployeur.toFixed(2)} € (dont{" "}
            {result.totaux.totalCotisationsPatronales.toFixed(2)} € de cotisations patronales CNRACL 31,65%, RAFP 5%, etc.)
          </span>
          <span className="text-slate-400">Réf. CGFP Art. L. 712-1</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. NAVIGATION DES ONGLETS D'EXPLORATION
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('lignes')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'lignes'
              ? 'border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Explication Ligne par Ligne ({result.lignes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conformite')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'conformite'
              ? 'border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Statutaire & Droits CFDT</span>
        </button>

        <button
          onClick={() => setActiveTab('openfisca')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'openfisca'
              ? 'border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Modèle OpenFisca-France (Python)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ONGLET 1 : DÉTAIL LIGNE PAR LIGNE AVEC NOMENCLATURE OPENFISCA
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lignes' && (
        <div className="space-y-4">
          {/* Filtres de catégorie */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'all', label: 'Toutes les lignes' },
              { id: 'traitement', label: 'Traitement & NBI' },
              { id: 'primes', label: 'Primes & RIFSEEP' },
              { id: 'cotisation_retraite', label: 'Retraite (CNRACL / IRCANTEC)' },
              { id: 'csg_crds', label: 'CSG & CRDS' },
              { id: 'fiscalite', label: 'Impôt & Net' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  categoryFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Liste des cartes / lignes interactives */}
          <div className="space-y-3">
            {filteredLines.map((ligne: FichePaieLigne) => {
              const isExpanded = !!expandedLignes[ligne.id];
              const isGain = ligne.montantGain !== undefined;
              const isRetenue = ligne.montantRetenue !== undefined;

              return (
                <div
                  key={ligne.id}
                  id={`ligne-complexe-${ligne.id}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all scroll-mt-20"
                >
                  {/* En-tête de la ligne */}
                  <div
                    onClick={() => toggleLineExpand(ligne.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-10 text-center font-mono text-xs font-bold text-slate-400 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                        {ligne.code || '•'}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            {ligne.libelle}
                          </h3>
                          {ligne.natureDetaillee && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {ligne.natureDetaillee}
                            </span>
                          )}
                          <a
                            href={ligne.openFiscaVar.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
                            title="Voir la définition dans le repo OpenFisca-France"
                          >
                            <span>openfisca: {ligne.openFiscaVar.id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ligne.openFiscaVar.nom} • {ligne.openFiscaVar.legalReference}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        {isGain && (
                          <div className="font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                            +{ligne.montantGain?.toFixed(2)} €
                          </div>
                        )}
                        {isRetenue && (
                          <div className="font-black text-rose-600 dark:text-rose-400 text-base sm:text-lg">
                            -{ligne.montantRetenue?.toFixed(2)} €
                          </div>
                        )}
                        {!isGain && !isRetenue && (
                          <div className="font-bold text-slate-500 text-sm">
                            Information
                          </div>
                        )}
                        {ligne.partPatronale !== undefined && ligne.partPatronale > 0 && (
                          <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                            Patronal: {ligne.partPatronale.toFixed(2)} €
                          </div>
                        )}
                        {ligne.base !== undefined && (
                          <div className="text-[11px] text-slate-400">
                            Base: {ligne.base.toFixed(2)} {ligne.taux !== undefined ? `| Taux: ${(ligne.taux < 1 ? (ligne.taux * 100).toFixed(2) + '%' : ligne.taux)}` : ''}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Corps dépliable d'explication pédagogique */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs sm:text-sm">
                      {/* Barrette synthétique des attributs statutaires / fiscaux / sociaux */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Nature statutaire */}
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Nature</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ligne.natureDetaillee || (ligne.nature === 'remuneration' ? 'Rémunération' : ligne.nature === 'cotisation_salariale' ? 'Cotisation salariale' : ligne.nature === 'cotisation_patronale' ? 'Cotisation patronale' : 'Rubrique statutaire')}
                          </span>
                        </div>

                        {/* Impact Fiscal */}
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Régime Fiscal</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ligne.impactFiscal || 'Conforme législation'}
                          </span>
                        </div>

                        {/* Impact Retraite */}
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Droits Retraite</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ligne.impactRetraite || 'Régime statutaire'}
                          </span>
                        </div>

                        {/* Assiette Sociale */}
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Assiette Sociale</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ligne.assietteSociale || 'Conforme barème'}
                          </span>
                        </div>
                      </div>

                      {/* Décomposition chiffrée détaillée */}
                      {(ligne.base !== undefined || ligne.taux !== undefined || ligne.partPatronale !== undefined) && (
                        <div className="p-3 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-slate-400">Assiette / Base</div>
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                              {ligne.base !== undefined ? `${ligne.base.toFixed(2)} €` : 'Forfait'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-slate-400">Taux Salarié</div>
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                              {ligne.taux !== undefined ? (ligne.taux < 1 ? `${(ligne.taux * 100).toFixed(2)} %` : `${ligne.taux} %`) : '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-slate-400">Part Salariale</div>
                            <div className={`font-mono font-bold text-xs sm:text-sm ${isGain ? 'text-emerald-600 dark:text-emerald-400' : isRetenue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {isGain ? `+${ligne.montantGain?.toFixed(2)} €` : isRetenue ? `-${ligne.montantRetenue?.toFixed(2)} €` : '0,00 €'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-slate-400">Charge Employeur</div>
                            <div className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                              {ligne.partPatronale !== undefined && ligne.partPatronale > 0
                                ? `${ligne.partPatronale.toFixed(2)} €`
                                : '0,00 €'}
                              {ligne.tauxPatronal !== undefined && ligne.tauxPatronal > 0 && (
                                <span className="text-[10px] block font-normal text-purple-500">
                                  ({ligne.tauxPatronal < 1 ? (ligne.tauxPatronal * 100).toFixed(2) + '%' : `${ligne.tauxPatronal}%`})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Qu'est-ce que c'est ? */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                            <Info className="w-4 h-4 text-blue-500" />
                            Qu'est-ce que c'est ?
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {ligne.explicationLigne}
                          </p>
                        </div>

                        {/* Comment c'est calculé ? */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                            <Calculator className="w-4 h-4 text-amber-500" />
                            Formule & Référence Légale
                          </h4>
                          <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-800 dark:text-slate-200 mb-2 overflow-x-auto">
                            {ligne.openFiscaVar.formule}
                          </div>
                          <p className="text-xs text-slate-500">
                            <strong>Base légale :</strong> {ligne.openFiscaVar.legalReference}
                          </p>
                        </div>
                      </div>

                      {/* Bloc explicatif spécifique IFSE Tit. (4 volets) - Strictement réservé à l'IFSE, exclu pour le CIA */}
                      {!ligne.id?.toLowerCase().includes('cia') &&
                       ligne.code !== '1592' &&
                       ligne.code !== '7610' &&
                       !/cia\b/i.test(ligne.libelle || '') &&
                       !/compl.*indemnitaire\s*annuel/i.test(ligne.libelle || '') &&
                       (ligne.id === 'ifse' || ligne.code === '1591' || ligne.code === '2591' || /ifse/i.test(ligne.libelle)) && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              Architecture de votre IFSE Tit. — 4 volets cumulatifs
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                              Rubrique Ciril {ligne.code || '1591'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            Dans votre collectivité territoriale, l'<strong>IFSE Tit.</strong> versée chaque mois résulte de l'addition de <strong>4 composantes distinctes</strong> :
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {/* IFSE 1 */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-mono">IFSE 1</span>
                                <span>Prime de fonctions</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Valorise les responsabilités exercées, l'expertise requise, la technicité et le niveau d'encadrement selon le groupe de fonctions RIFSEEP.
                              </p>
                            </div>

                            {/* IFSE 2 */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 dark:text-orange-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 font-mono">IFSE 2</span>
                                <span>Prime des contraintes de poste</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Compense les sujétions particulières de l'activité, la pénibilité physique, l'exposition aux risques et les conditions d'exercice.
                              </p>
                            </div>

                            {/* IFSE 3 */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-mono">IFSE 3</span>
                                <span>Samedis, dimanches & astreintes</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Rémunère les contraintes horaires atypiques : travail régulier du week-end (samedis/dimanches) et la disponibilité d'astreinte opérationnelle.
                              </p>
                            </div>

                            {/* IFSE 4 */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-mono">IFSE 4</span>
                                <span>Avantages acquis</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Clause de sauvegarde individuelle maintenant le niveau de rémunération et les avantages acquis par l'agent antérieurement au RIFSEEP.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bloc explicatif spécifique CIA Tit. (10% IFSE x 12 mois = 50% manière de servir + 50% jours absents) */}
                      {ligne.code !== '1584' &&
                       ligne.id !== 'montant_net_social' &&
                       !/social/i.test(ligne.libelle || '') &&
                       (ligne.id === 'cia' ||
                        ligne.code === '1592' ||
                        ligne.code === '7610' ||
                        /\bcia\b/i.test(ligne.libelle || '') ||
                        /compl.*indemnitaire\s*annuel/i.test(ligne.libelle || '')) && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-500/30 dark:border-indigo-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-indigo-600" />
                              Architecture de votre CIA Tit. — 2 volets à parité (50% / 50%)
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800">
                              Rubrique Ciril {ligne.code || '1592'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
                            <strong>Formule de calcul statutaire :</strong> Le Complément Indemnitaire Annuel se compose de <strong>10 % de votre IFSE mensuelle × 12 mois</strong> (soit l'équivalent de 1,2 mois d'IFSE annuelle).
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            Cette somme est attribuée selon <strong>deux critères stricts à parité (50 % / 50 %)</strong> :
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {/* Manière de servir */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-mono font-bold">50 %</span>
                                <span>Manière de servir</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Évaluée lors du compte-rendu d'entretien professionnel annuel (CREP) : valeur professionnelle, atteinte des objectifs individuels et collectifs, investissement et implication dans les missions.
                              </p>
                            </div>

                            {/* Nombre de jours d'absence */}
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-mono font-bold">50 %</span>
                                <span>Nombre de jours d'absence</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                Critère d'assiduité et présence effective sur l'année de référence : abattement modulé selon le barème des jours d'absence (hors congés légaux protégés tels que maternité, paternité ou accident de service).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* À vérifier sur votre bulletin */}
                      {ligne.aVerifier && (
                        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                            <strong className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 text-emerald-800 dark:text-emerald-300">
                              À vérifier sur votre bulletin :
                            </strong>
                            {ligne.aVerifier}
                          </div>
                        </div>
                      )}

                      {/* Points de vigilance & Pièges fréquents */}
                      {ligne.attention && (
                        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                            <strong className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 text-amber-800 dark:text-amber-300">
                              Points de vigilance :
                            </strong>
                            {ligne.attention}
                          </div>
                        </div>
                      )}

                      {/* Conseil de l'agent & Impact Retraite */}
                      {ligne.conseilAgent && (
                        <div className="p-3.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50 rounded-xl flex items-start gap-3">
                          <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-orange-900 dark:text-orange-200 leading-relaxed">
                            <strong className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 text-orange-800 dark:text-orange-300">
                              Conseil Syndical CFDT :
                            </strong>
                            {ligne.conseilAgent}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ONGLET 2 : AUDIT STATUTAIRE & CONFORMITÉ LÉGALE
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'conformite' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points de contrôle validés */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Points de Contrôle Validés ({result.syntheseConformite.pointsForts.length})
              </h3>
              <div className="space-y-3">
                {result.syntheseConformite.pointsForts.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations et Vigilance CFDT */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Vigilances & Recommandations CFDT
              </h3>
              <div className="space-y-3">
                {result.syntheseConformite.recommandationsCFDT.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-xs sm:text-sm text-orange-900 dark:text-orange-200">
                    <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benchmark théorique OpenFisca vs Réel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-500" />
              Benchmark Microsimulation OpenFisca-France
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Comparaison entre les retenues appliquées et les montants théoriques calculés selon le modèle open-source national.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-1">Brut Théorique</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">
                  {result.openFiscaBenchmark.brutTheorique.toFixed(2)} €
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-1">CNRACL Retraite</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">
                  {result.openFiscaBenchmark.cnraclTheorique.toFixed(2)} €
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-1">RAFP (Plafond 20%)</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">
                  {result.openFiscaBenchmark.rafpTheorique.toFixed(2)} €
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-1">CSG / CRDS</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">
                  {result.openFiscaBenchmark.csgTheorique.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ONGLET 3 : CODE PYTHON REPRODUCTIBLE OPENFISCA
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'openfisca' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-500" />
                Script Python Reproductible OpenFisca-France
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ce code peut être exécuté directement dans un environnement Python avec <code className="text-orange-600">pip install OpenFisca-France</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié !' : 'Copier le script'}</span>
              </button>
              <a
                href={OPENFISCA_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{result.openFiscaCodeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Bannière de retour vers le bulletin Ciril simple */}
      <div className="p-4 rounded-2xl bg-orange-50 dark:bg-slate-900 border border-orange-200 dark:border-orange-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Vous préférez une lecture visuelle directement sur la maquette officielle de paie Ciril RH ?</span>
        </div>
        <button
          onClick={() => {
            setExplanationMode('simple');
            setTimeout(() => synthesisSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          }}
          className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 cursor-pointer shadow-sm transition-all"
        >
          ← Retour à la fiche Ciril RH avec calques
        </button>
      </div>
    </div>
  )}
</div>
    </div>
  );
}
