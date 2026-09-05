import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Scale,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Gavel,
  Check,
  User,
  Building,
  FileCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { extractTextFromFile } from "../services/statutoryAuditEngine";
import {
  MemoireInputData,
  GeneratedMemoireResult,
  parseUploadedDisciplinaryReport,
  generateMemoireJuridique
} from "../services/memoireJuridiqueEngine";
import { exportToOfficialDocx } from "../utils/docxExport";
import { BorderGlow } from "./ui/BorderGlow";

interface MemoireJuridiqueGeneratorProps {
  onClose?: () => void;
}

export const MemoireJuridiqueGenerator: React.FC<MemoireJuridiqueGeneratorProps> = ({
  onClose
}) => {
  // Step navigation: 1: Formulaire & Upload, 2: Mémoire Généré & Analyses
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<"memoire" | "syllogismes" | "legalite" | "pieces">("memoire");

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<MemoireInputData>({
    collectivite: "Ville de Gennevilliers",
    instanceDestinataire: "conseil_discipline",
    nomAgent: "",
    prenomAgent: "",
    matricule: "",
    statut: "Titulaire",
    cadreEmploi: "Adjoint administratif territorial",
    grade: "Adjoint administratif principal de 2ème classe",
    direction: "Direction Générale des Services",
    service: "Service Administration Générale",
    anciennete: "8 ans de service",
    dateFaits: "",
    dateRapport: new Date().toLocaleDateString("fr-FR"),
    faitsReproches: "",
    sanctionEnvisagee: "Exclusion temporaire de fonctions (15 jours)",
    elementsDefense: {
      contesteMaterialite: true,
      absenceIntentionFautive: true,
      contexteDifficileOuSurcharge: true,
      absenceFormationOuOrdreImprecis: false,
      maniereDeServirIrreprochable: true,
      provocationOuTensionPartagee: false,
      etatDeSanteOuFacteurMedical: false,
      prejudiceReelNulOuMinime: true
    },
    detailsDefense: "",
    piecesJointesDefense: [],
    texteRapportUpload: ""
  });

  // Generated Result
  const [generatedResult, setGeneratedResult] = useState<GeneratedMemoireResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    try {
      const extractedText = await extractTextFromFile(file);
      if (extractedText && extractedText.trim().length > 10) {
        const parsed = parseUploadedDisciplinaryReport(extractedText);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          collectivite: parsed.collectivite || prev.collectivite,
          nomAgent: parsed.nomAgent || prev.nomAgent,
          prenomAgent: parsed.prenomAgent || prev.prenomAgent,
          statut: parsed.statut || prev.statut,
          grade: parsed.grade || prev.grade,
          sanctionEnvisagee: parsed.sanctionEnvisagee || prev.sanctionEnvisagee,
          faitsReproches: parsed.faitsReproches || prev.faitsReproches,
          texteRapportUpload: extractedText
        }));
        setUploadSuccessMessage(
          `Document « ${file.name} » analysé avec succès ! Les données et griefs ont été pré-remplis automatiquement.`
        );
      } else {
        setUploadSuccessMessage(`Fichier « ${file.name} » chargé, complétez les détails ci-dessous.`);
      }
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      setUploadSuccessMessage(`Erreur de lecture du fichier. Veuillez renseigner les champs manuellement.`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCheckboxChange = (key: keyof MemoireInputData["elementsDefense"]) => {
    setFormData((prev) => ({
      ...prev,
      elementsDefense: {
        ...prev.elementsDefense,
        [key]: !prev.elementsDefense[key]
      }
    }));
  };

  // Generate Memoire
  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = generateMemoireJuridique(formData);
    setGeneratedResult(result);
    setCurrentStep(2);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorer si confetti échoue
    }
  };

  // Copy text to clipboard
  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.texteCompletFormate);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Export to Word Docx
  const handleDownloadDocx = async () => {
    if (!generatedResult) return;
    setIsExportingDocx(true);
    try {
      await exportToOfficialDocx({
        title: `MEMOIRE_DEFENSE_${(formData.nomAgent || "AGENT").toUpperCase()}`,
        category: "Contentieux & Discipline",
        content: generatedResult.texteCompletFormate,
        rawText: generatedResult.texteCompletFormate,
        docType: "decision"
      });
    } catch (err) {
      console.error("Erreur d'exportation DOCX:", err);
      toast.error("Erreur lors de l'export Word DOCX.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700">
      {/* Top Header Banner */}
      <section className="relative z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl py-3 text-center border-b border-slate-200/60 dark:border-white/5 shadow-sm transition-colors duration-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                <Gavel className="w-7 h-7 animate-pulse" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Générateur de <span className="text-blue-600 dark:text-blue-400">Mémoire Juridique</span>
                  <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Syllogisme CGFP & CE Dahan
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Défense disciplinaire, analyse de rapport hiérarchique et observations juridiques motivées
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier les données</span>
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {currentStep === 1 ? (
          /* ========================================================================= */
          /* ÉTAPE 1 : FORMULAIRE D'INPUT & UPLOAD DU RAPPORT DISCIPLINAIRE            */
          /* ========================================================================= */
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Zone d'Upload Drag & Drop */}
            <BorderGlow glowColor="from-blue-500 via-indigo-500 to-cyan-400">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[0.99]"
                    : "border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept=".docx,.txt,.md,.pdf,.json"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                    <UploadCloud className={`w-8 h-8 ${isProcessingFile ? "animate-bounce" : ""}`} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                      {uploadedFileName ? (
                        <span className="text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Document chargé : {uploadedFileName}
                        </span>
                      ) : (
                        "Déposez le Rapport Disciplinaire ou la Lettre de Convocation"
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
                      Formats supportés : Word (.docx), PDF, Texte (.txt). L'IA extrait automatiquement le nom de l'agent, les dates, les griefs et la sanction proposée.
                    </p>
                  </div>

                  {uploadSuccessMessage && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      {uploadSuccessMessage}
                    </div>
                  )}
                </div>
              </div>
            </BorderGlow>

            {/* Grille des Détails de l'Agent & Instance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte 1 : Identité & Contexte Administratif */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Identité de l'Agent & Statut</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom de l'agent *</label>
                    <input
                      type="text"
                      required
                      value={formData.nomAgent}
                      onChange={(e) => setFormData({ ...formData, nomAgent: e.target.value })}
                      placeholder="Ex: DUPONT"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenomAgent}
                      onChange={(e) => setFormData({ ...formData, prenomAgent: e.target.value })}
                      placeholder="Ex: Jean"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Statut *</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value as MemoireInputData["statut"] })}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Titulaire">Titulaire (Fonctionnaire)</option>
                      <option value="Stagiaire">Stagiaire</option>
                      <option value="Contractuel">Contractuel (CDD / CDI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ancienneté</label>
                    <input
                      type="text"
                      value={formData.anciennete}
                      onChange={(e) => setFormData({ ...formData, anciennete: e.target.value })}
                      placeholder="Ex: 8 ans de service"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Grade / Cadre d'emplois</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="Ex: Adjoint technique principal de 1ère classe"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Collectivité</label>
                    <input
                      type="text"
                      value={formData.collectivite}
                      onChange={(e) => setFormData({ ...formData, collectivite: e.target.value })}
                      placeholder="Ex: Ville de Gennevilliers"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Direction / Service</label>
                    <input
                      type="text"
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                      placeholder="Ex: Direction des Espaces Verts"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Carte 2 : Instance & Sanction Envisagée */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Instance Cible & Sanction Proposée</h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Instance destinataire du mémoire *</label>
                  <select
                    value={formData.instanceDestinataire}
                    onChange={(e) => setFormData({ ...formData, instanceDestinataire: e.target.value as MemoireInputData["instanceDestinataire"] })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="conseil_discipline">Conseil de Discipline (CIG / CDG)</option>
                    <option value="entretien_prealable">Entretien Préalable / Réponse à l'autorité territoriale</option>
                    <option value="recours_gracieux">Recours Gracieux auprès du Maire / Président</option>
                    <option value="tribunal_administratif">Tribunal Administratif (Requête / Mémoire Contentieux)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sanction proposée par la hiérarchie *</label>
                  <input
                    type="text"
                    required
                    value={formData.sanctionEnvisagee}
                    onChange={(e) => setFormData({ ...formData, sanctionEnvisagee: e.target.value })}
                    placeholder="Ex: Exclusion temporaire de fonctions de 15 jours (2e groupe)"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Rappel des Groupes de Sanctions (Art. L. 533-1 CGFP)
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                    <strong>1er groupe :</strong> Avertissement, Blâme, Exclusion 1-3j (sans Conseil).<br />
                    <strong>2e groupe :</strong> Radiation tableau avancement, Abaissement échelon, Exclusion 4-15j.<br />
                    <strong>3e groupe :</strong> Rétrogradation au grade inférieur, Exclusion 16j-2 ans.<br />
                    <strong>4e groupe :</strong> Mise à la retraite d'office, Révocation.
                  </p>
                </div>
              </div>
            </div>

            {/* Carte 3 : Faits Reprochés & Griefs */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Faits et Manquements Reprochés par l'Administration *</h4>
                </div>
                <span className="text-xs text-slate-400">Décrivez précisément les griefs visés</span>
              </div>

              <textarea
                rows={4}
                required
                value={formData.faitsReproches}
                onChange={(e) => setFormData({ ...formData, faitsReproches: e.target.value })}
                placeholder="Exemple : Il est reproché à l'agent un refus d'exécuter une tâche d'entretien le 12 mai, des propos vifs tenus à l'encontre de son responsable direct, et deux retards en avril..."
                className="w-full p-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            {/* Carte 4 : Moyens de Défense & Circonstances Atténuantes */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Axes de Défense & Circonstances Atténuantes</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "contesteMaterialite", label: "Contestation de la matérialité des faits (Preuves insuffisantes/inexactes)" },
                  { key: "absenceIntentionFautive", label: "Absence d'intention délibérée de nuire ou d'insubordination" },
                  { key: "contexteDifficileOuSurcharge", label: "Contexte de forte surcharge de travail ou de sous-effectif" },
                  { key: "maniereDeServirIrreprochable", label: "Manière de servir exemplaire et aucun antécédent disciplinaire" },
                  { key: "absenceFormationOuOrdreImprecis", label: "Ordres imprécis / Absence de consignes écrites ou de formation" },
                  { key: "provocationOuTensionPartagee", label: "Climat de tension partagé ou attitude provocante de la hiérarchie" },
                  { key: "etatDeSanteOuFacteurMedical", label: "État de santé fragilisé ou certificat médical contemporain" },
                  { key: "prejudiceReelNulOuMinime", label: "Absence de préjudice réel pour la collectivité ou les usagers" }
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.elementsDefense[key as keyof MemoireInputData["elementsDefense"]]}
                      onChange={() => handleCheckboxChange(key as keyof MemoireInputData["elementsDefense"])}
                      className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Précisions factuelles complémentaires pour la défense
                </label>
                <textarea
                  rows={3}
                  value={formData.detailsDefense}
                  onChange={(e) => setFormData({ ...formData, detailsDefense: e.target.value })}
                  placeholder="Détaillez les arguments clés de l'agent : explications sur l'incident, témoignages de collègues, état de service, initiatives positives prises..."
                  className="w-full p-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Bouton de Soumission / Génération */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                <span>Générer le Mémoire Juridique Complet</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* ÉTAPE 2 : AFFICHAGE DU MÉMOIRE GÉNÉRÉ, SYLLOGISMES & EXPORTS              */
          /* ========================================================================= */
          generatedResult && (
            <div className="space-y-6">
              {/* Barre d'Actions & Exports Rapides */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                    {generatedResult.titreOfficiel}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccess ? "Copié !" : "Copier le texte"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    disabled={isExportingDocx}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingDocx ? "Génération Word..." : "Télécharger Word (.docx)"}</span>
                  </button>
                </div>
              </div>

              {/* Onglets d'Exploration */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                {[
                  { id: "memoire", label: "📜 Mémoire en Défense Officiel", icon: FileText },
                  { id: "syllogismes", label: "🧠 Syllogismes & CGFP", icon: Scale },
                  { id: "legalite", label: "⚖️ Contrôle de Proportionnalité (Dahan)", icon: Gavel },
                  { id: "pieces", label: "📁 Bordereau de Pièces", icon: FileCheck }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Contenu de l'Onglet 1 : Mémoire Officiel Formaté */}
              {activeTab === "memoire" && (
                <div className="p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl font-serif text-slate-900 dark:text-slate-100 leading-relaxed space-y-6">
                  {/* En-tête officiel */}
                  <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 text-center space-y-2">
                    <p className="text-xs tracking-widest uppercase font-sans font-bold text-slate-500 dark:text-slate-400">
                      RÉPUBLIQUE FRANÇAISE — LIBERTÉ ÉGALITÉ FRATERNITÉ
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide font-sans">
                      MÉMOIRE JURIDIQUE EN DÉFENSE & OBSERVATIONS DISCIPLINAIRES
                    </h2>
                    <p className="text-sm font-sans font-semibold text-blue-600 dark:text-blue-400">
                      {generatedResult.enTete.instance}
                    </p>
                  </div>

                  {/* Fiche d'identification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-sans text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">POUR :</p>
                      <p><strong>M./Mme :</strong> {generatedResult.enTete.agent}</p>
                      <p><strong>Qualité :</strong> {generatedResult.enTete.qualite}</p>
                      <p><strong>Collectivité :</strong> {generatedResult.enTete.collectivite}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">CONTRE :</p>
                      <p>Le rapport disciplinaire proposant :</p>
                      <p className="font-bold text-red-600 dark:text-red-400">« {formData.sanctionEnvisagee} »</p>
                      <p className="text-xs text-slate-400 mt-1">Réf: {generatedResult.enTete.dossierRef}</p>
                    </div>
                  </div>

                  {/* Exposé des Faits */}
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                      EXPOSÉ DES FAITS ET DU CONTEXTE
                    </h3>
                    <p className="text-sm">
                      {formData.faitsReproches}
                    </p>
                    {formData.detailsDefense && (
                      <p className="text-sm italic text-slate-700 dark:text-slate-300">
                        {formData.detailsDefense}
                      </p>
                    )}
                  </div>

                  {/* Légalité Externe */}
                  <div className="space-y-3">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                      {generatedResult.moyensLégalitéExterne.titre}
                    </h3>
                    {generatedResult.moyensLégalitéExterne.points.map((pt, i) => (
                      <div key={i} className="text-sm space-y-1">
                        <p className="font-bold font-sans text-blue-700 dark:text-blue-300">{pt.intitule}</p>
                        <p>{pt.developpement}</p>
                        <p className="text-xs text-slate-500 font-sans italic">Visa : {pt.viseeCGFP}</p>
                      </div>
                    ))}
                  </div>

                  {/* Légalité Interne */}
                  <div className="space-y-4">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                      II. SUR LA LÉGALITÉ INTERNE ET LA DISPROPORTION MANIFESTE
                    </h3>
                    {generatedResult.moyensLégalitéInterne.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-sm">
                        <p className="font-bold font-sans text-indigo-700 dark:text-indigo-300">{s.titre}</p>
                        <p><strong>Majeure (Règle de droit) :</strong> {s.majeure}</p>
                        <p><strong>Mineure (Application à l'espèce) :</strong> {s.mineure}</p>
                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold"><strong>Conclusion :</strong> {s.conclusion}</p>
                        <div className="text-xs font-sans text-slate-500">
                          <strong>Jurisprudences :</strong> {s.jurisprudences.join(' | ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manière de servir */}
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                      III. SUR LA MANIÈRE DE SERVIR ET LA CARRIÈRE DE L'AGENT
                    </h3>
                    <p className="text-sm">{generatedResult.evaluationManiereDeServir}</p>
                  </div>

                  {/* Conclusions / Par ces motifs */}
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 space-y-3 font-sans">
                    <h3 className="font-bold text-base text-blue-900 dark:text-blue-200 uppercase tracking-wide">
                      PAR CES MOTIFS
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {generatedResult.conclusionsFormelles.principal}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {generatedResult.conclusionsFormelles.subsidiaire}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {generatedResult.conclusionsFormelles.tresSubsidiaire}
                    </p>
                  </div>

                  {/* Signature */}
                  <div className="pt-4 flex justify-between items-end font-sans text-xs text-slate-500">
                    <div>Fait le {generatedResult.dateGeneration}</div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Pour l'agent et sa défense,</p>
                      <p>{generatedResult.enTete.agent}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenu de l'Onglet 2 : Syllogismes & CGFP */}
              {activeTab === "syllogismes" && (
                <div className="grid grid-cols-1 gap-4">
                  {generatedResult.moyensLégalitéInterne.map((s, i) => (
                    <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{s.titre}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Majeure (Norme)</p>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{s.majeure}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Mineure (Faits qualifiés)</p>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{s.mineure}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Conclusion</p>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{s.conclusion}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 mb-1">Jurisprudences de fondement :</p>
                        <div className="flex flex-wrap gap-2">
                          {s.jurisprudences.map((j, idx) => (
                            <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              ⚖️ {j}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contenu de l'Onglet 3 : Contrôle de Légalité (Dahan) */}
              {activeTab === "legalite" && (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl">
                      <Gavel className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        Contrôle de Proportionnalité du Juge Administratif (Arrêt Dahan)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Évaluation du risque d'annulation contentieuse devant le Tribunal Administratif
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Principe jurisprudentiel (*CE Ass., 13 novembre 2013, n° 347704, Dahan*) :
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Le juge de l'excès de pouvoir n'exerce plus un contrôle restreint à l'erreur manifeste d'appréciation mais un <strong>contrôle normal et entier</strong> sur la proportionnalité de la sanction. Il vérifie successivement : 1° l'exactitude matérielle des faits, 2° leur qualification fautive, 3° l'adéquation rigoureuse de la sanction infligée.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                      <p className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Points forts du dossier de l'agent
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-emerald-700 dark:text-emerald-300">
                        <li>Ancienneté et absence totale d'antécédents disciplinaires</li>
                        <li>Contestations circonstanciées sur la matérialité des griefs</li>
                        <li>Circonstances atténuantes de surcharge et tension de service</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs space-y-1.5">
                      <p className="font-bold text-red-800 dark:text-red-200 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" /> Risques pour la collectivité en cas de sanction lourde
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                        <li>Annulation rétroactive avec obligation de reconstitution de carrière</li>
                        <li>Condamnation aux frais irrépétibles (Art. L. 761-1 CJA)</li>
                        <li>Versement de dommages et intérêts pour préjudice moral</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenu de l'Onglet 4 : Bordereau de Pièces */}
              {activeTab === "pieces" && (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Bordereau Récapitulatif des Pièces Produites</h4>
                  </div>
                  <div className="space-y-2">
                    {generatedResult.bordereauPieces.map((piece, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-100 dark:border-slate-700/50">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{piece}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
};
