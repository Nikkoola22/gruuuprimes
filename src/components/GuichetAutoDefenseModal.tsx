import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Printer,
  Sparkles,
  UploadCloud,
  FileCheck,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Info,
  AlertOctagon,
  FileCode,
  Users
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  calculateRecevabiliteCja,
  generateRecoursGracieux,
  generateDemandeProtectionFonctionnelle,
  generateSaisineInstanceParitaire,
  getDefaultSaisineContent,
  generateRequeteTa,
  generateBordereauPieces,
  generateDocassembleYamlPackage,
  MotifRefus,
  RecoursGracieuxFormData,
  TypeAtteinteProtection,
  ProtectionFonctionnelleFormData,
  TypeInstanceParitaire,
  MotifSaisineCap,
  MotifSaisineCcp,
  MotifSaisineF3sct,
  SaisineInstanceFormData,
  SaisineInstanceResult,
  RequeteContentieuseFormData,
  PieceTeleRecours
} from "../services/docassembleAutoDefenseEngine";
import { exportToOfficialDocx } from "../utils/docxExport";

interface GuichetAutoDefenseModalProps {
  onClose: () => void;
  defaultTab?: "recours" | "protection" | "instances" | "requete" | "bordereau" | "docassemble";
}

export const GuichetAutoDefenseModal: React.FC<GuichetAutoDefenseModalProps> = ({
  onClose,
  defaultTab = "recours"
}) => {
  const [activeTab, setActiveTab] = useState<"recours" | "protection" | "instances" | "requete" | "bordereau" | "docassemble">(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 1 : RECOURS GRACIEUX & CONTRÔLE DE RECEVABILITÉ
  // ─────────────────────────────────────────────────────────────
  const [recoursData, setRecoursData] = useState<RecoursGracieuxFormData>({
    motifRefus: "teletravail",
    nomAgent: "DUPONT",
    prenomAgent: "Alexandre",
    matricule: "GEN-84920",
    grade: "Adjoint administratif principal de 1ère classe",
    directionService: "Direction de l'Éducation et de l'Enfance",
    collectivite: "Ville de Gennevilliers",
    autoriteSignataire: "Monsieur le Maire de Gennevilliers",
    dateNotificationArrete: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().split("T")[0], // il y a 14 jours
    mentionVoiesRecours: true,
    dateRecoursGracieux: new Date().toISOString().split("T")[0],
    referenceArrete: "Arrêté n° 2026-RH-849",
    motifsInvoquesParAdministration: "Nécessité de service liée à la continuité de l'accueil physique du public.",
    argumentsAgent: "L'agent effectue des missions de gestion administrative dématérialisée qui ne nécessitent pas une présence sur site les jeudis et vendredis. Les collègues du même pôle bénéficient déjà de 2 jours de télétravail.",
    demandeEntretien: true,
    piecesJointes: ["Fiche de poste", "Planning d'activité", "Échanges de courriels avec le chef de service"]
  });

  const [dateRecoursGracieuxInterruption] = useState<string>("");

  // Calcul dynamique de recevabilité en temps réel
  const recevabiliteInfo = calculateRecevabiliteCja(
    recoursData.dateNotificationArrete,
    recoursData.mentionVoiesRecours,
    dateRecoursGracieuxInterruption || undefined
  );

  const [generatedRecours, setGeneratedRecours] = useState<{
    titre: string;
    texteCourt: string;
    texteOfficiel: string;
    fondementsJuridiques: string[];
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 2 : PROTECTION FONCTIONNELLE
  // ─────────────────────────────────────────────────────────────
  const [protectionData, setProtectionData] = useState<ProtectionFonctionnelleFormData>({
    nomAgent: "DUPONT",
    prenomAgent: "Alexandre",
    grade: "Adjoint technique principal de 2ème classe",
    service: "Pôle Espaces Verts et Cadre de Vie",
    collectivite: "Ville de Gennevilliers",
    autoriteDestinataire: "Monsieur le Maire de Gennevilliers",
    dateDemande: new Date().toISOString().split("T")[0],
    typeAtteinte: "agression_physique",
    chronologieFaits: "Le lundi 28 septembre 2026 vers 10h15, lors d'une intervention sur la voie publique rue Louis-Calmel, un individu s'est approché de l'équipe et a proféré des menaces de mort réitérées à mon encontre avant de me porter un coup de poing au visage.",
    temoinsIdentifies: "Collègue M. Jean D. (Agent technique) et Mme Sarah K. (Adjointe technique), présents lors de l'agression.",
    depotPlainteOuMainCourante: true,
    referencePlainte: "Plainte pénale n° 2026/04812 déposée au Commissariat de Police de Gennevilliers le 28/09/2026",
    arretTravailOuItt: true,
    dureeItt: "6 jours d'ITT délivrés par le médecin des Urgences Médico-Judiciaires de Nanterre",
    mesuresUrgenceDemandeess: {
      priseEnChargeFraisAvocat: true,
      changementAffectationConservatoire: false,
      signalementArt40Cpp: true,
      soutienPsychologique: true
    },
    detailsPrejudice: "Traumatisme crânien sans perte de connaissance, contusion faciale sévère, stress post-traumatique aigu entraînant insomnies et anxiété réactionnelle."
  });

  const [generatedProtection, setGeneratedProtection] = useState<{
    titre: string;
    texteOfficiel: string;
    miseEnDemeureDate: string;
    fondementsJuridiques: string[];
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 3 : SAISINE DES INSTANCES PARITAIRES (CAP, CCP, F3SCT)
  // ─────────────────────────────────────────────────────────────
  const initialCapCrep = getDefaultSaisineContent("cap", "crep");
  const initialSaisineState: SaisineInstanceFormData = {
    instance: "cap",
    nomAgent: "DUPONT",
    prenomAgent: "Alexandre",
    matricule: "GEN-84920",
    statutAgent: "titulaire",
    grade: "Adjoint administratif principal de 1ère classe",
    directionService: "Direction de l'Éducation et de l'Enfance",
    collectivite: "Ville de Gennevilliers",
    cigRattachement: "CIG Petite Couronne (92-93-94)",
    destinataireInstance: initialCapCrep.destinataireInstance || "Monsieur le Président de la Commission Administrative Paritaire compétente - CIG Petite Couronne (92-93-94)",
    motifCap: "crep",
    motifCcp: "licenciement_contractuel_insuffisance",
    motifF3sct: "danger_grave_imminent",
    dateNotificationDecision: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
    dateRecoursPrealable: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
    dateDecisionRecoursPrealable: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
    dateIncidentDanger: new Date().toISOString().split("T")[0],
    lieuIncidentDanger: "Ateliers municipaux / Bâtiment principal",
    faitsEtContexte: initialCapCrep.faitsEtContexte,
    motifsInvoquesAdministration: initialCapCrep.motifsInvoquesAdministration,
    argumentsAgent: initialCapCrep.argumentsAgent,
    demandesAgent: initialCapCrep.demandesAgent,
    assistanceSyndicale: true,
    nomRepresentantSyndical: "Délégation Syndicale CFDT Territoriaux de Gennevilliers",
    piecesJointes: initialCapCrep.piecesJointes
  };
  const [saisineData, setSaisineData] = useState<SaisineInstanceFormData>(initialSaisineState);
  const [generatedSaisine, setGeneratedSaisine] = useState<SaisineInstanceResult | null>(() => generateSaisineInstanceParitaire(initialSaisineState));

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 4 : REQUÊTE CONTENTIEUSE TA & RÉFÉRÉ
  // ─────────────────────────────────────────────────────────────
  const [requeteData, setRequeteData] = useState<RequeteContentieuseFormData>({
    typeRequete: "rep_et_refere",
    juridiction: "Tribunal Administratif de Cergy-Pontoise",
    nomAgent: "DUPONT",
    prenomAgent: "Alexandre",
    adresseAgent: "14 rue des Agnettes",
    codePostalAgent: "92230",
    villeAgent: "Gennevilliers",
    telephoneAgent: "06 12 34 56 78",
    emailAgent: "a.dupont@email.fr",
    gradeAgent: "Adjoint administratif principal de 1ère classe",
    collectiviteDefendeuse: "Ville de Gennevilliers",
    adresseCollectivite: "177 avenue Gabriel-Péri, 92230 Gennevilliers",
    dateDecisionAttaquee: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
    referenceDecisionAttaquee: "Arrêté municipal n° 2026-RH-849",
    dateNotificationDecision: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split("T")[0],
    mentionVoiesRecours: true,
    recoursGracieuxPrealable: true,
    dateRecoursGracieux: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
    dateRejetRecoursGracieux: "",
    typeRejetRecoursGracieux: "implicite",
    moyensLegaliteExterne: {
      incompetenceAuteur: true,
      detailsIncompetence: "Absence de délégation de signature publiée pour le Directeur Général Adjoint signataire de l'arrêté.",
      viceProcedureCapCst: true,
      detailsViceProcedure: "Refus consécutif de télétravail et de temps partiel sans saisine de la CAP compétente.",
      viceFormeMotivation: true,
      detailsViceForme: "Absence de motivation factuelle personnalisée (Art. L. 211-2 CRPA)."
    },
    moyensLegaliteInterne: {
      erreurDeDroit: true,
      detailsErreurDeDroit: "Méconnaissance de l'article L. 611-1 du CGFP et du décret n° 2016-151 du 11 février 2016.",
      erreurManifesteAppreciation: true,
      detailsErreurManifeste: "Inadéquation flagrante entre la prétendue désorganisation du service et la réalité des tâches télétravaillables.",
      detournementPouvoir: false,
      detailsDetournement: "",
      disproportionSanctionOuMesure: true,
      detailsDisproportion: ""
    },
    elementsRefereSuspension: {
      justificationUrgence: "Urgence caractérisée : la décision porte une atteinte grave et immédiate à la situation de santé de l'agent qui doit assurer des soins réguliers nécessitant un aménagement de son temps de travail.",
      impactFinancierOuSante: "Perte de traitement et risque avéré d'aggravation de l'état de santé justifié par certificats médicaux.",
      douteSerieuxResume: "L'incompétence de l'auteur de l'acte et la méconnaissance directe du décret n° 2016-151 créent un doute extrêmement sérieux sur la légalité."
    },
    conclusionsAnnulation: "Annulation pour excès de pouvoir de l'arrêté de refus d'autorisation de télétravail",
    montantFraisIrrepetibles: 1500,
    demandeInjonctionSousAstreinte: true,
    delaiInjonctionJours: 15
  });

  const [generatedRequete, setGeneratedRequete] = useState<{
    titre: string;
    texteRep: string;
    texteRefere?: string;
    fondementsJuridiques: string[];
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 4 : BORDEREAU DE PIÈCES TÉLÉRECOURS
  // ─────────────────────────────────────────────────────────────
  const [piecesList, setPiecesList] = useState<PieceTeleRecours[]>([
    {
      id: "pj-1",
      numero: 1,
      titre: "Arrêté municipal portant refus attaqué",
      nomFichier: "arrete_refus_2026.pdf",
      nomNormalise: "PJ1_Arrete_Refus_Attaque.pdf",
      datePiece: "15/09/2026",
      nbPages: 2,
      categorie: "decision"
    },
    {
      id: "pj-2",
      numero: 2,
      titre: "Recours gracieux préalable adressé au Maire",
      nomFichier: "recours_gracieux_lrar.pdf",
      nomNormalise: "PJ2_Recours_Gracieux_Prealable.pdf",
      datePiece: "22/09/2026",
      nbPages: 3,
      categorie: "recours"
    },
    {
      id: "pj-3",
      numero: 3,
      titre: "Accusé de réception postal (LRAR)",
      nomFichier: "accuse_reception_lrar.pdf",
      nomNormalise: "PJ3_Accuse_Reception_LRAR.pdf",
      datePiece: "24/09/2026",
      nbPages: 1,
      categorie: "recours"
    },
    {
      id: "pj-4",
      numero: 4,
      titre: "Fiche de poste officielle de l'agent",
      nomFichier: "fiche_de_poste_2026.pdf",
      nomNormalise: "PJ4_Fiche_De_Poste.pdf",
      datePiece: "01/01/2026",
      nbPages: 4,
      categorie: "echange"
    },
    {
      id: "pj-5",
      numero: 5,
      titre: "Certificats médicaux et avis du médecin de prévention",
      nomFichier: "avis_medecin_prevention.pdf",
      nomNormalise: "PJ5_Avis_Medecin_Prevention.pdf",
      datePiece: "10/09/2026",
      nbPages: 2,
      categorie: "medical"
    }
  ]);

  const [nouvellePiece, setNouvellePiece] = useState<{
    titre: string;
    nomFichier: string;
    datePiece: string;
    nbPages: number;
    categorie: "decision" | "recours" | "echange" | "medical" | "temoignage" | "autre";
  }>({
    titre: "",
    nomFichier: "",
    datePiece: new Date().toLocaleDateString("fr-FR"),
    nbPages: 1,
    categorie: "autre"
  });

  const [generatedBordereau, setGeneratedBordereau] = useState<{
    titre: string;
    texteBordereau: string;
    totalPages: number;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ÉTAT DU VOLET 6 : DOCASSEMBLE (.YML)
  // ─────────────────────────────────────────────────────────────
  const [docassembleScenario, setDocassembleScenario] = useState<"recours_gracieux" | "requete_ta" | "protection_fonctionnelle" | "saisine_instances">("recours_gracieux");
  const docassembleYaml = generateDocassembleYamlPackage(docassembleScenario);

  // Initialisation par défaut
  useEffect(() => {
    handleGenerateRecours();
    handleGenerateSaisine();
  }, []);

  const handleGenerateRecours = () => {
    const res = generateRecoursGracieux(recoursData);
    setGeneratedRecours(res);
  };

  const handleGenerateProtection = () => {
    const res = generateDemandeProtectionFonctionnelle(protectionData);
    setGeneratedProtection(res);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  const applyMotifDefaults = (
    newInstance: TypeInstanceParitaire,
    newMotif: MotifSaisineCap | MotifSaisineCcp | MotifSaisineF3sct
  ) => {
    const defaults = getDefaultSaisineContent(newInstance, newMotif, saisineData.collectivite, saisineData.cigRattachement);
    const updated: SaisineInstanceFormData = {
      ...saisineData,
      instance: newInstance,
      statutAgent: defaults.statutAgent || saisineData.statutAgent,
      destinataireInstance: defaults.destinataireInstance || saisineData.destinataireInstance,
      motifCap: newInstance === "cap" ? (newMotif as MotifSaisineCap) : saisineData.motifCap,
      motifCcp: newInstance === "ccp" ? (newMotif as MotifSaisineCcp) : saisineData.motifCcp,
      motifF3sct: newInstance === "f3sct_cst" ? (newMotif as MotifSaisineF3sct) : saisineData.motifF3sct,
      faitsEtContexte: defaults.faitsEtContexte,
      motifsInvoquesAdministration: defaults.motifsInvoquesAdministration,
      argumentsAgent: defaults.argumentsAgent,
      demandesAgent: defaults.demandesAgent,
      piecesJointes: defaults.piecesJointes
    };
    setSaisineData(updated);
    const res = generateSaisineInstanceParitaire(updated);
    setGeneratedSaisine(res);
    toast.success(`Formulaire CGFP généré : ${res.titre}`);
  };

  // Synchronisation continue du formulaire officiel conforme CGFP dès toute modification
  useEffect(() => {
    const res = generateSaisineInstanceParitaire(saisineData);
    setGeneratedSaisine(res);
  }, [saisineData]);

  const handleGenerateSaisine = () => {
    const res = generateSaisineInstanceParitaire(saisineData);
    setGeneratedSaisine(res);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    toast.success("Formulaire de saisine actualisé !");
  };

  const handleGenerateRequete = () => {
    const res = generateRequeteTa(requeteData);
    setGeneratedRequete(res);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
  };

  const handleGenerateBordereau = () => {
    const res = generateBordereauPieces(
      piecesList,
      `${requeteData.nomAgent} c/ ${requeteData.collectiviteDefendeuse}`,
      requeteData.juridiction
    );
    setGeneratedBordereau(res);
  };

  const handleAjouterPiece = () => {
    if (!nouvellePiece.titre.trim()) {
      toast.error("Veuillez saisir un intitulé pour la pièce jointe.");
      return;
    }
    const nextNum = piecesList.length + 1;
    const cleanTitre = nouvellePiece.titre.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const pieceNormalisee: PieceTeleRecours = {
      id: `pj-${Date.now()}`,
      numero: nextNum,
      titre: nouvellePiece.titre.trim(),
      nomFichier: nouvellePiece.nomFichier.trim() || `piece_${nextNum}.pdf`,
      nomNormalise: `PJ${nextNum}_${cleanTitre}.pdf`,
      datePiece: nouvellePiece.datePiece || new Date().toLocaleDateString("fr-FR"),
      nbPages: Number(nouvellePiece.nbPages) || 1,
      categorie: nouvellePiece.categorie
    };
    setPiecesList([...piecesList, pieceNormalisee]);
    setNouvellePiece({
      titre: "",
      nomFichier: "",
      datePiece: new Date().toLocaleDateString("fr-FR"),
      nbPages: 1,
      categorie: "autre"
    });
    toast.success(`Pièce PJ n°${nextNum} ajoutée et indexée.`);
  };

  const handleSupprimerPiece = (id: string) => {
    const filtered = piecesList.filter((p) => p.id !== id).map((p, idx) => ({
      ...p,
      numero: idx + 1,
      nomNormalise: `PJ${idx + 1}_${p.nomNormalise.replace(/^PJ\d+_/, "")}`
    }));
    setPiecesList(filtered);
    toast.info("Pièce retirée du bordereau.");
  };

  const handleExportDocx = (title: string, rawText: string) => {
    exportToOfficialDocx({
      title,
      content: rawText,
      rawText,
      docType: "arrete"
    });
    toast.success("Document Word (.docx) généré et téléchargé !");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texte copié dans le presse-papier !");
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ─── TOP HEADER ─── */}
      <header className="shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Fermer le guichet</span>
          </button>

          <div className="h-6 w-px bg-slate-700 shrink-0"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Gavel className="w-4 h-4" />
                </span>
                <span>Guichet d'Auto-Défense Syndicale & Requêtes Contentieuses</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Docassemble Legal Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Permanence numérique des agents : recours gracieux, délais CJA R. 421-5, protection fonctionnelle et requêtes TA
            </p>
          </div>
        </div>

        {/* Badge Docassemble & GitHub */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a
            href="https://github.com/jhpyle/docassemble"
            target="_blank"
            rel="noopener noreferrer"
            title="Consulter le dépôt GitHub Docassemble"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            <span>jhpyle/docassemble</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* ─── NAVIGATION DES 6 ONGLETS DU GUICHET ─── */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            {
              id: "recours",
              label: "1. Recours Gracieux & Délais CJA",
              icon: Clock,
              color: "text-amber-400",
              badge: "R. 421-5 CJA"
            },
            {
              id: "protection",
              label: "2. Protection Fonctionnelle",
              icon: Shield,
              color: "text-emerald-400",
              badge: "L. 134-1 CGFP"
            },
            {
              id: "instances",
              label: "3. Saisine Instances (CAP, CCP, F3SCT)",
              icon: Users,
              color: "text-rose-400",
              badge: "CAP • CCP • F3SCT"
            },
            {
              id: "requete",
              label: "4. Requête TA & Référé L. 521-1",
              icon: Gavel,
              color: "text-indigo-400",
              badge: "REP + Référé"
            },
            {
              id: "bordereau",
              label: "5. Bordereau Télérecours",
              icon: FileCheck,
              color: "text-blue-400",
              badge: "Norme CJA"
            },
            {
              id: "docassemble",
              label: "6. Script Docassemble (YAML/Python)",
              icon: FileCode,
              color: "text-purple-400",
              badge: ".yml Export"
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as "recours" | "protection" | "instances" | "requete" | "bordereau" | "docassemble");
                  if (tab.id === "recours" && !generatedRecours) handleGenerateRecours();
                  if (tab.id === "protection" && !generatedProtection) handleGenerateProtection();
                  if (tab.id === "instances" && !generatedSaisine) handleGenerateSaisine();
                  if (tab.id === "requete" && !generatedRequete) handleGenerateRequete();
                  if (tab.id === "bordereau" && !generatedBordereau) handleGenerateBordereau();
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-white border-2 border-orange-500 shadow-md shadow-orange-500/10"
                    : "bg-slate-950/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CORPS DU GUICHET D'AUTO-DÉFENSE ─── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 1 : RECOURS GRACIEUX & DÉLAIS CJA
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "recours" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Bannière de contrôle de recevabilité CJA */}
            <div className={`p-5 rounded-2xl border-2 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              recevabiliteInfo.statut === "valide"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : recevabiliteInfo.statut === "urgent"
                ? "bg-amber-950/50 border-amber-500/50 text-amber-200 animate-pulse"
                : recevabiliteInfo.statut === "inopposable_czabaj"
                ? "bg-blue-950/40 border-blue-500/40 text-blue-200"
                : "bg-red-950/40 border-red-500/40 text-red-200"
            }`}>
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 shrink-0">
                  {recevabiliteInfo.statut === "valide" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                  {recevabiliteInfo.statut === "urgent" && <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />}
                  {recevabiliteInfo.statut === "inopposable_czabaj" && <Scale className="w-6 h-6 text-blue-400" />}
                  {recevabiliteInfo.statut === "forclos" && <AlertOctagon className="w-6 h-6 text-red-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm uppercase tracking-wider">
                      Contrôle Automatique de Recevabilité (CJA R. 421-5) :
                    </span>
                    <span className="font-extrabold px-2.5 py-0.5 rounded-md text-xs bg-slate-900 border border-white/20">
                      {recevabiliteInfo.libelleStatut}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
                    {recevabiliteInfo.explicationJuridique}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      📅 Notification : <strong>{recevabiliteInfo.dateNotification}</strong>
                    </span>
                    <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      ⏳ Échéance légale (+2 mois) : <strong>{recevabiliteInfo.dateLimiteProrogee}</strong>
                    </span>
                    {recevabiliteInfo.dateLimiteCzabaj && (
                      <span className="bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-200">
                        ⚖️ Délai Czabaj (+1 an) : <strong>{recevabiliteInfo.dateLimiteCzabaj}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono font-bold text-slate-300">
                  {recevabiliteInfo.regleAppliquee}
                </span>
              </div>
            </div>

            {/* Formulaire à deux colonnes : Paramétrage du Recours & Rendu Prévisualisé */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Colonne gauche : Formulaire (5 colonnes) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>Paramètres du Recours Gracieux</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    5 Minutes
                  </span>
                </div>

                {/* Choix du refus — Visibilité Renforcée */}
                <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent border-2 border-orange-500/70 rounded-2xl p-4 shadow-lg shadow-orange-500/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-orange-500 text-slate-950 font-black shadow-xs">
                        <Scale className="w-4 h-4" />
                      </span>
                      <span>Nature de la décision défavorable contestée :</span>
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500 text-slate-950 font-bold animate-pulse">
                      Étape Clé
                    </span>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={recoursData.motifRefus}
                      onChange={(e) => setRecoursData({ ...recoursData, motifRefus: e.target.value as MotifRefus })}
                      className="w-full bg-slate-900 border-2 border-orange-400/80 hover:border-orange-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                    >
                      <option value="teletravail">🏢 Refus d'autorisation de télétravail (Décret 2016-151)</option>
                      <option value="temps_partiel">⏱️ Refus de travail à temps partiel (L. 612-1 CGFP)</option>
                      <option value="rupture_conventionnelle">🤝 Refus de rupture conventionnelle (NON AUTORISÉ À GENNEVILLIERS)</option>
                      <option value="disponibilite">✈️ Refus de mise en disponibilité (L. 514-1 CGFP)</option>
                      <option value="crep">📊 Contestation du Compte-Rendu d'Entretien (CREP Décret 2014-1526)</option>
                    </select>
                  </div>

                  <p className="text-[11px] font-semibold text-amber-200/90 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Sélectionnez le motif pour adapter instantanément les visas CGFP et la stratégie d'argumentation.</span>
                  </p>
                </div>

                {/* Dates & Mention R. 421-5 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Date de notification :
                    </label>
                    <input
                      type="date"
                      value={recoursData.dateNotificationArrete}
                      onChange={(e) => setRecoursData({ ...recoursData, dateNotificationArrete: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Voies et délais mentionnés ?
                    </label>
                    <select
                      value={recoursData.mentionVoiesRecours ? "oui" : "non"}
                      onChange={(e) => setRecoursData({ ...recoursData, mentionVoiesRecours: e.target.value === "oui" })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="oui">Oui (délai 2 mois opposable)</option>
                      <option value="non">Non / Incomplets (Czabaj 1 an)</option>
                    </select>
                  </div>
                </div>

                {/* Identité de l'agent */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nom :</label>
                    <input
                      type="text"
                      value={recoursData.nomAgent}
                      onChange={(e) => setRecoursData({ ...recoursData, nomAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Prénom :</label>
                    <input
                      type="text"
                      value={recoursData.prenomAgent}
                      onChange={(e) => setRecoursData({ ...recoursData, prenomAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Grade :</label>
                    <input
                      type="text"
                      value={recoursData.grade}
                      onChange={(e) => setRecoursData({ ...recoursData, grade: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Service / Pôle :</label>
                    <input
                      type="text"
                      value={recoursData.directionService}
                      onChange={(e) => setRecoursData({ ...recoursData, directionService: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Autorité destinataire (Maire / Président) :
                  </label>
                  <input
                    type="text"
                    value={recoursData.autoriteSignataire}
                    onChange={(e) => setRecoursData({ ...recoursData, autoriteSignataire: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Motifs invoqués par l'administration */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Motifs énoncés dans la lettre de refus :
                  </label>
                  <textarea
                    rows={2}
                    value={recoursData.motifsInvoquesParAdministration}
                    onChange={(e) => setRecoursData({ ...recoursData, motifsInvoquesParAdministration: e.target.value })}
                    placeholder="Ex: Nécessité de service, effectifs insuffisants, continuité..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Arguments de l'agent */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Vos arguments de contestation (Faits & Justifications) :
                  </label>
                  <textarea
                    rows={3}
                    value={recoursData.argumentsAgent}
                    onChange={(e) => setRecoursData({ ...recoursData, argumentsAgent: e.target.value })}
                    placeholder="Détaillez pourquoi ce refus est infondé..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-entretien"
                    checked={recoursData.demandeEntretien}
                    onChange={(e) => setRecoursData({ ...recoursData, demandeEntretien: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="chk-entretien" className="text-xs text-slate-300 cursor-pointer">
                    Demander formellement un entretien assisté d'un représentant syndical CFDT
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRecours}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Générer le Recours Officiel</span>
                </button>
              </div>

              {/* Colonne droite : Prévisualisation A4 & Actions (7 colonnes) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Courrier Officiel Prêt à l'Envoi (LRAR)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportDocx(generatedRecours?.titre || "Recours_Gracieux", generatedRecours?.texteOfficiel || "")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Word (.docx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedRecours?.texteOfficiel || "")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                      title="Imprimer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Zone de prévisualisation textuelle A4 */}
                <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 font-serif text-xs sm:text-sm leading-relaxed border-4 border-slate-800 shadow-2xl overflow-x-auto min-h-[540px]">
                  <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                    {generatedRecours?.texteOfficiel || "Chargement du modèle..."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 2 : PROTECTION FONCTIONNELLE (L. 134-1 CGFP)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "protection" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Bannière de cadrage juridique */}
            <div className="bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Obligation Légale de Protection Fonctionnelle (Art. L. 134-1 à L. 134-12 CGFP)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    La collectivité publique est <strong>légalement tenue</strong> de protéger tout agent victime d'agressions, menaces, diffamations, outrages ou harcèlement. L'administration dispose d'un <strong>délai strict de 2 mois</strong> pour statuer, sous peine de refus implicite attaquable devant le juge administratif avec astreinte.
                  </p>
                </div>
              </div>
              <div className="shrink-0 bg-slate-900 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-300">
                Mise en demeure sous 2 mois : <strong>{generatedProtection?.miseEnDemeureDate || "Calculée automatiquement"}</strong>
              </div>
            </div>

            {/* Formulaire & Prévisualisation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Dossier Circonstancié de la Victime</span>
                </h3>

                {/* Qualification des Atteintes — Visibilité Renforcée */}
                <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border-2 border-emerald-500/70 rounded-2xl p-4 shadow-lg shadow-emerald-500/10 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black shadow-xs">
                        <Shield className="w-4 h-4" />
                      </span>
                      <span>Nature des atteintes subies :</span>
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold animate-pulse">
                      Art. L. 134-1 CGFP
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={protectionData.typeAtteinte}
                      onChange={(e) => setProtectionData({ ...protectionData, typeAtteinte: e.target.value as TypeAtteinteProtection })}
                      className="w-full bg-slate-900 border-2 border-emerald-400/80 hover:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                    >
                      <option value="agression_physique">🚨 Violences physiques volontaires au travail</option>
                      <option value="menaces_intimidations">⚠️ Menaces de mort, intimidations verbales graves</option>
                      <option value="diffamation_injures">📢 Diffamation, outrages, propos injurieux publics</option>
                      <option value="harcelement_moral">🛑 Harcèlement moral répété (Art. L. 133-2 CGFP)</option>
                      <option value="harcelement_sexuel">⛔ Harcèlement sexuel ou sexiste (Art. L. 133-1 CGFP)</option>
                    </select>
                  </div>

                  <p className="text-[11px] font-semibold text-emerald-200/90 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Déclenche la protection statutaire obligatoire et la prise en charge des frais de justice.</span>
                  </p>
                </div>

                {/* Identité */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nom :</label>
                    <input
                      type="text"
                      value={protectionData.nomAgent}
                      onChange={(e) => setProtectionData({ ...protectionData, nomAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Prénom :</label>
                    <input
                      type="text"
                      value={protectionData.prenomAgent}
                      onChange={(e) => setProtectionData({ ...protectionData, prenomAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Grade :</label>
                    <input
                      type="text"
                      value={protectionData.grade}
                      onChange={(e) => setProtectionData({ ...protectionData, grade: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Service :</label>
                    <input
                      type="text"
                      value={protectionData.service}
                      onChange={(e) => setProtectionData({ ...protectionData, service: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Chronologie des faits */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Chronologie détaillée des faits (Date, heure, lieu, paroles) :
                  </label>
                  <textarea
                    rows={3}
                    value={protectionData.chronologieFaits}
                    onChange={(e) => setProtectionData({ ...protectionData, chronologieFaits: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Témoins */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Témoins identifiés (Collègues, tiers) :
                  </label>
                  <input
                    type="text"
                    value={protectionData.temoinsIdentifies}
                    onChange={(e) => setProtectionData({ ...protectionData, temoinsIdentifies: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Dépôt de plainte & ITT */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={protectionData.depotPlainteOuMainCourante}
                        onChange={(e) => setProtectionData({ ...protectionData, depotPlainteOuMainCourante: e.target.checked })}
                        className="rounded text-emerald-500"
                      />
                      Plainte / Main courante
                    </label>
                    {protectionData.depotPlainteOuMainCourante && (
                      <input
                        type="text"
                        placeholder="Réf. plainte..."
                        value={protectionData.referencePlainte}
                        onChange={(e) => setProtectionData({ ...protectionData, referencePlainte: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={protectionData.arretTravailOuItt}
                        onChange={(e) => setProtectionData({ ...protectionData, arretTravailOuItt: e.target.checked })}
                        className="rounded text-emerald-500"
                      />
                      Arrêt de travail / ITT
                    </label>
                    {protectionData.arretTravailOuItt && (
                      <input
                        type="text"
                        placeholder="Ex: 5 jours ITT..."
                        value={protectionData.dureeItt}
                        onChange={(e) => setProtectionData({ ...protectionData, dureeItt: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                    )}
                  </div>
                </div>

                {/* Mesures sollicitées */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Mesures de protection obligatoires sollicitées :
                  </span>
                  {[
                    { key: "priseEnChargeFraisAvocat", label: "Prise en charge intégrale des frais d'avocat" },
                    { key: "signalementArt40Cpp", label: "Signalement Procureur Art. 40 CPP par la Mairie" },
                    { key: "changementAffectationConservatoire", label: "Mesure d'éloignement / changement de poste conservatoire" },
                    { key: "soutienPsychologique", label: "Accompagnement psychologique d'urgence" }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(protectionData.mesuresUrgenceDemandeess as Record<string, boolean>)[item.key]}
                        onChange={(e) => setProtectionData({
                          ...protectionData,
                          mesuresUrgenceDemandeess: {
                            ...protectionData.mesuresUrgenceDemandeess,
                            [item.key]: e.target.checked
                          }
                        })}
                        className="rounded text-emerald-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateProtection}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Générer la Demande de Protection</span>
                </button>
              </div>

              {/* Prévisualisation */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Courrier Officiel de Mise en Demeure (2 Mois)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportDocx(generatedProtection?.titre || "Protection_Fonctionnelle", generatedProtection?.texteOfficiel || "")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Word (.docx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedProtection?.texteOfficiel || "")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 font-serif text-xs sm:text-sm leading-relaxed border-4 border-slate-800 shadow-2xl overflow-x-auto min-h-[540px]">
                  <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                    {generatedProtection?.texteOfficiel || "Chargement..."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 3 : SAISINE DES INSTANCES PARITAIRES (CAP, CCP, F3SCT)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "instances" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header info instances */}
            <div className="bg-rose-950/40 border-2 border-rose-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                      Saisine des Instances Paritaires Territoriales
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      CAP • CCP • F3SCT / CST
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Génération des formulaires de saisine : CAP, CCP et F3SCT
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                    Sécurisez vos démarches statutaires : recours évaluation (CREP) et refus de formation (CAP), contestation du licenciement d'un contractuel (CCP), et droit d'alerte, droit de retrait et inscription au registre spécial DGI (F3SCT).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-rose-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-rose-500/30 font-bold">
                  Code Général de la Fonction Publique
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Colonne gauche : Formulaire de Saisine */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Sélection de l'Instance Paritaire */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    1. Sélection de l'instance paritaire compétente
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "cap",
                        title: "CAP",
                        desc: "Fonctionnaires titulaires & stagiaires",
                        badge: "CREP • Formation"
                      },
                      {
                        id: "ccp",
                        title: "CCP",
                        desc: "Agents contractuels de droit public",
                        badge: "Licenciement • Droits"
                      },
                      {
                        id: "f3sct_cst",
                        title: "F3SCT / CST",
                        desc: "Santé, Sécurité & Conditions de travail",
                        badge: "DGI • Retrait • RPS"
                      }
                    ].map((inst) => {
                      const isChosen = saisineData.instance === inst.id;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => {
                            const targetMotif = inst.id === "cap"
                              ? saisineData.motifCap || "crep"
                              : inst.id === "ccp"
                                ? saisineData.motifCcp || "licenciement_contractuel_insuffisance"
                                : saisineData.motifF3sct || "danger_grave_imminent";
                            applyMotifDefaults(inst.id as TypeInstanceParitaire, targetMotif);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isChosen
                              ? "bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/10"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm">{inst.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isChosen ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                            }`}>
                              {inst.badge}
                            </span>
                          </div>
                          <p className="text-[11px] leading-tight line-clamp-2">{inst.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Objet précis de la Saisine selon l'instance */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-rose-300 block">
                    2. Objet et motif de la saisine
                  </label>

                  {/* Options CAP */}
                  {saisineData.instance === "cap" && (
                    <div className="space-y-2">
                      {[
                        {
                          id: "crep",
                          label: "Recours révision Compte-Rendu d'Entretien Professionnel (CREP)",
                          ref: "Art. L. 543-1 CGFP & Décret 2014-1526"
                        },
                        {
                          id: "refus_formation",
                          label: "Refus réitéré de formation professionnelle ou compte CPF",
                          ref: "Art. L. 422-1 CGFP & Décret 2007-1845"
                        },
                        {
                          id: "refus_temps_partiel",
                          label: "Refus d'autorisation de temps partiel ou télétravail",
                          ref: "Art. L. 612-1 CGFP & Décret 2004-777"
                        },
                        {
                          id: "licenciement_insuffisance",
                          label: "Défense en cas de licenciement pour insuffisance professionnelle",
                          ref: "Art. L. 553-1 CGFP & Décret 89-229"
                        }
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            saisineData.motifCap === item.id
                              ? "bg-rose-500/10 border-rose-500/60 text-white"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="motifCap"
                            checked={saisineData.motifCap === item.id}
                            onChange={() => applyMotifDefaults("cap", item.id as MotifSaisineCap)}
                            className="mt-0.5 text-rose-500"
                          />
                          <div>
                            <span className="font-bold block">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.ref}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Options CCP */}
                  {saisineData.instance === "ccp" && (
                    <div className="space-y-2">
                      {[
                        {
                          id: "licenciement_contractuel_insuffisance",
                          label: "Mémoire en défense : Licenciement pour insuffisance professionnelle",
                          ref: "Décret n° 88-145 Art. 39-1 & Art. L. 553-1 CGFP"
                        },
                        {
                          id: "licenciement_contractuel_suppression",
                          label: "Licenciement pour suppression d'emploi (Manquement obligation de reclassement)",
                          ref: "Décret n° 88-145 Art. 39-3 & Jurisprudence CE 2013"
                        },
                        {
                          id: "licenciement_contractuel_inaptitude",
                          label: "Licenciement pour inaptitude physique (Reclassement non proposé)",
                          ref: "Décret n° 88-145 Art. 13 & Art. L. 826-1 CGFP"
                        },
                        {
                          id: "recours_crep_contractuel",
                          label: "Recours en révision de l'évaluation professionnelle du contractuel",
                          ref: "Décret n° 88-145 Art. 1-4"
                        },
                        {
                          id: "non_renouvellement",
                          label: "Contestation du non-renouvellement abusif de contrat",
                          ref: "Jurisprudence Conseil d'État"
                        }
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            saisineData.motifCcp === item.id
                              ? "bg-rose-500/10 border-rose-500/60 text-white"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="motifCcp"
                            checked={saisineData.motifCcp === item.id}
                            onChange={() => applyMotifDefaults("ccp", item.id as MotifSaisineCcp)}
                            className="mt-0.5 text-rose-500"
                          />
                          <div>
                            <span className="font-bold block">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.ref}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Options F3SCT / CST */}
                  {saisineData.instance === "f3sct_cst" && (
                    <div className="space-y-2">
                      {[
                        {
                          id: "danger_grave_imminent",
                          label: "Signalement Danger Grave et Imminent (DGI) - Inscription au Registre spécial",
                          ref: "Décret 85-603 Art. 5-2 & Enquête conjointe obligatoire"
                        },
                        {
                          id: "droit_alerte_retrait",
                          label: "Constat d'exercice du Droit de Retrait et Droit d'Alerte",
                          ref: "Art. L. 136-1 CGFP & Décret 85-603 Art. 5-1 (Protection contre sanction)"
                        },
                        {
                          id: "souffrance_travail_rps",
                          label: "Risques Psychosociaux (RPS), harcèlement et souffrance au travail",
                          ref: "Décret 2021-571 Art. 61 & Délégation d'enquête paritaire"
                        },
                        {
                          id: "insalubrite_visite_locaux",
                          label: "Insalubrité, amiante, risques matériels et demande de visite d'inspection",
                          ref: "Décret 2021-571 Art. 62 (Droit de visite des membres F3SCT)"
                        }
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            saisineData.motifF3sct === item.id
                              ? "bg-rose-500/10 border-rose-500/60 text-white"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="motifF3sct"
                            checked={saisineData.motifF3sct === item.id}
                            onChange={() => applyMotifDefaults("f3sct_cst", item.id as MotifSaisineF3sct)}
                            className="mt-0.5 text-rose-500"
                          />
                          <div>
                            <span className="font-bold block">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.ref}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Encadré d'alerte procédurale */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      {saisineData.instance === "cap" && saisineData.motifCap === "crep" && (
                        <span><strong>Délai strict de saisine :</strong> La saisine de la CAP doit impérativement intervenir dans le <strong>délai d'un mois</strong> suivant la notification du refus de votre recours hiérarchique (ou après 2 mois de rejet implicite).</span>
                      )}
                      {saisineData.instance === "cap" && saisineData.motifCap === "refus_formation" && (
                        <span><strong>Garantie légale :</strong> Le 2ème refus consécutif d'une formation de perfectionnement ou de préparation concours ne peut être légalement opposé qu'après avis obligatoire de la CAP.</span>
                      )}
                      {saisineData.instance === "ccp" && (
                        <span><strong>Obligation préalable de reclassement :</strong> L'employeur doit obligatoirement justifier devant la CCP de recherches écrites et loyales de reclassement (Art. 39-3 décret 88-145).</span>
                      )}
                      {saisineData.instance === "f3sct_cst" && (
                        <span><strong>Procédure d'urgence DGI :</strong> L'inscription au registre spécial est un droit fondamental. Elle oblige l'autorité à mener une <strong>enquête conjointe immédiate</strong> avec le représentant désigné de la F3SCT.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Données administratives de l'agent & rattachement */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    3. Informations de l'agent & Instance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Nom :</span>
                      <input
                        type="text"
                        value={saisineData.nomAgent}
                        onChange={(e) => setSaisineData({ ...saisineData, nomAgent: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Prénom :</span>
                      <input
                        type="text"
                        value={saisineData.prenomAgent}
                        onChange={(e) => setSaisineData({ ...saisineData, prenomAgent: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Grade / Fonction :</span>
                      <input
                        type="text"
                        value={saisineData.grade}
                        onChange={(e) => setSaisineData({ ...saisineData, grade: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Direction / Service :</span>
                      <input
                        type="text"
                        value={saisineData.directionService}
                        onChange={(e) => setSaisineData({ ...saisineData, directionService: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Collectivité employeur :</span>
                      <input
                        type="text"
                        value={saisineData.collectivite}
                        onChange={(e) => setSaisineData({ ...saisineData, collectivite: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">CIG / CDG de rattachement :</span>
                      <input
                        type="text"
                        value={saisineData.cigRattachement}
                        onChange={(e) => setSaisineData({ ...saisineData, cigRattachement: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Dates spécifiques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {saisineData.instance === "f3sct_cst" ? "Date du constat du danger :" : "Date décision / notification :"}
                      </span>
                      <input
                        type="date"
                        value={saisineData.dateNotificationDecision}
                        onChange={(e) => setSaisineData({ ...saisineData, dateNotificationDecision: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    {saisineData.instance === "cap" && saisineData.motifCap === "crep" && (
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Date recours préalable :</span>
                        <input
                          type="date"
                          value={saisineData.dateRecoursPrealable || ""}
                          onChange={(e) => setSaisineData({ ...saisineData, dateRecoursPrealable: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    )}

                    {saisineData.instance === "f3sct_cst" && (
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Lieu précis du danger :</span>
                        <input
                          type="text"
                          value={saisineData.lieuIncidentDanger || ""}
                          onChange={(e) => setSaisineData({ ...saisineData, lieuIncidentDanger: e.target.value })}
                          placeholder="Atelier, quai de chargement, bureau..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Faits, motifs et arguments */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    4. Exposé des faits et moyens de défense
                  </label>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Circonstances factuelles détaillées :</span>
                    <textarea
                      rows={3}
                      value={saisineData.faitsEtContexte}
                      onChange={(e) => setSaisineData({ ...saisineData, faitsEtContexte: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Motifs allégués par l'administration :</span>
                    <textarea
                      rows={2}
                      value={saisineData.motifsInvoquesAdministration}
                      onChange={(e) => setSaisineData({ ...saisineData, motifsInvoquesAdministration: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Arguments de l'agent (violation des textes, disproportion) :</span>
                    <textarea
                      rows={3}
                      value={saisineData.argumentsAgent}
                      onChange={(e) => setSaisineData({ ...saisineData, argumentsAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Mesures et conclusions demandées à l'instance :</span>
                    <textarea
                      rows={2}
                      value={saisineData.demandesAgent}
                      onChange={(e) => setSaisineData({ ...saisineData, demandesAgent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                    />
                  </div>

                  {/* Assistance syndicale CFDT */}
                  <label className="flex items-center gap-2 pt-2 border-t border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saisineData.assistanceSyndicale}
                      onChange={(e) => setSaisineData({ ...saisineData, assistanceSyndicale: e.target.checked })}
                      className="rounded text-rose-500"
                    />
                    <span className="text-xs text-slate-200 font-bold">
                      Assistance de la délégation syndicale CFDT lors de la séance
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSaisine}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Générer le Dossier Officiel de Saisine</span>
                </button>
              </div>

              {/* Colonne droite : Aperçu Officiel A4 et Pièces */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                {/* Barre d'action rapide */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Formulaire Officiel Conforme CGFP</h4>
                      <p className="text-[10px] text-slate-400">Prêt pour notification à l'instance et à l'autorité</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedSaisine?.texteOfficiel || "")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportDocx(generatedSaisine?.titre || "Saisine_Instance_Paritaire", generatedSaisine?.texteOfficiel || "")}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exporter (.docx)</span>
                    </button>
                  </div>
                </div>

                {/* Encadré d'information légale & pièces requises */}
                {generatedSaisine && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" /> Textes & Procédure applicables
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {generatedSaisine.delaisEtProcedure.autoriteCompetente}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      <strong>Délai légal :</strong> {generatedSaisine.delaisEtProcedure.delaiLegal}
                    </p>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Pièces obligatoires à joindre au dossier :
                      </span>
                      <ul className="space-y-1">
                        {generatedSaisine.piecesRequises.map((piece, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                            <span>{piece}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Aperçu Feuille A4 */}
                <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 font-serif text-xs sm:text-sm leading-relaxed border-4 border-slate-800 shadow-2xl overflow-x-auto min-h-[540px]">
                  <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                    {generatedSaisine?.texteOfficiel || "Chargement du formulaire de saisine..."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 4 : REQUÊTE TRIBUNAL ADMINISTRATIF & RÉFÉRÉ L. 521-1
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "requete" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header info contentieux */}
            <div className="bg-indigo-950/40 border-2 border-indigo-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-400 shrink-0">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Génération de Requête Contentieuse TA & Référé-Suspension
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Formalisme strict du <strong>Code de justice administrative</strong>. Sélection guidée des moyens de légalité externe et interne, articulation conjointe d'un <strong>Référé-suspension (Art. L. 521-1 CJA)</strong> en cas d'urgence avec doute sérieux, et conclusions aux fins d'injonction sous astreinte (L. 911-1 CJA).
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Prêt pour Télérecours Citoyens
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Formulaire contentieux */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>Cadre du Litige & Moyens de Droit</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Type de saisine contentieuse :
                  </label>
                  <select
                    value={requeteData.typeRequete}
                    onChange={(e) => setRequeteData({ ...requeteData, typeRequete: e.target.value as "rep_seul" | "rep_et_refere" })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="rep_et_refere">Requête au Fond (REP) + Référé-Suspension (L. 521-1 CJA)</option>
                    <option value="rep_seul">Requête au Fond seule (Recours pour Excès de Pouvoir)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tribunal Administratif territorialement compétent :
                  </label>
                  <select
                    value={requeteData.juridiction}
                    onChange={(e) => setRequeteData({ ...requeteData, juridiction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tribunal Administratif de Cergy-Pontoise">TA de Cergy-Pontoise (Hauts-de-Seine 92, Val-d'Oise 95)</option>
                    <option value="Tribunal Administratif de Paris">TA de Paris (Paris 75)</option>
                    <option value="Tribunal Administratif de Montreuil">TA de Montreuil (Seine-Saint-Denis 93)</option>
                    <option value="Tribunal Administratif de Versailles">TA de Versailles (Yvelines 78, Essonne 91)</option>
                  </select>
                </div>

                {/* Acte attaqué */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Date arrêté attaqué :</label>
                    <input
                      type="date"
                      value={requeteData.dateDecisionAttaquee}
                      onChange={(e) => setRequeteData({ ...requeteData, dateDecisionAttaquee: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Réf. arrêté :</label>
                    <input
                      type="text"
                      value={requeteData.referenceDecisionAttaquee}
                      onChange={(e) => setRequeteData({ ...requeteData, referenceDecisionAttaquee: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Moyens Légalité Externe */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-indigo-400 block uppercase tracking-wider">
                    1. Moyens de Légalité Externe (Forme & Procédure) :
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteExterne.incompetenceAuteur}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteExterne: { ...requeteData.moyensLegaliteExterne, incompetenceAuteur: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Incompétence de l'auteur (défaut de délégation publiée)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteExterne.viceProcedureCapCst}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteExterne: { ...requeteData.moyensLegaliteExterne, viceProcedureCapCst: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Vice de procédure (absence de saisine de la CAP ou du CST)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteExterne.viceFormeMotivation}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteExterne: { ...requeteData.moyensLegaliteExterne, viceFormeMotivation: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Défaut de motivation en droit et en fait (Art. L. 211-2 CRPA)</span>
                  </label>
                </div>

                {/* Moyens Légalité Interne */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-indigo-400 block uppercase tracking-wider">
                    2. Moyens de Légalité Interne (Fond & Qualification) :
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteInterne.erreurDeDroit}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteInterne: { ...requeteData.moyensLegaliteInterne, erreurDeDroit: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Erreur de droit (violation directe des textes statutaires CGFP)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteInterne.erreurManifesteAppreciation}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteInterne: { ...requeteData.moyensLegaliteInterne, erreurManifesteAppreciation: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Erreur manifeste d'appréciation (inadéquation disproportionnée)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requeteData.moyensLegaliteInterne.detournementPouvoir}
                      onChange={(e) => setRequeteData({
                        ...requeteData,
                        moyensLegaliteInterne: { ...requeteData.moyensLegaliteInterne, detournementPouvoir: e.target.checked }
                      })}
                      className="rounded text-indigo-500"
                    />
                    <span>Détournement de pouvoir (animosité ou motifs extra-professionnels)</span>
                  </label>
                </div>

                {/* Si Référé-Suspension demandé */}
                {requeteData.typeRequete === "rep_et_refere" && (
                  <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 space-y-2">
                    <span className="text-xs font-black text-amber-400 block uppercase tracking-wider">
                      3. Volet Référé-Suspension (L. 521-1 CJA) :
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Caractérisation de l'urgence impérieuse :
                      </label>
                      <textarea
                        rows={2}
                        value={requeteData.elementsRefereSuspension?.justificationUrgence}
                        onChange={(e) => setRequeteData({
                          ...requeteData,
                          elementsRefereSuspension: {
                            ...requeteData.elementsRefereSuspension!,
                            justificationUrgence: e.target.value
                          }
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateRequete}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Générer les Requêtes Contentieuses</span>
                </button>
              </div>

              {/* Rendu des requêtes */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-400" />
                    Requête au Fond (REP) {requeteData.typeRequete === "rep_et_refere" ? "+ Requête en Référé (L. 521-1)" : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportDocx("Requete_TA_REP", generatedRequete?.texteRep || "")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Word (.docx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy((generatedRequete?.texteRep || "") + (generatedRequete?.texteRefere ? "\n\n=== REQUÊTE EN RÉFÉRÉ-SUSPENSION ===\n\n" + generatedRequete.texteRefere : ""))}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 font-serif text-xs sm:text-sm leading-relaxed border-4 border-slate-800 shadow-2xl overflow-x-auto min-h-[540px] space-y-8">
                  <div>
                    <h4 className="font-bold text-center border-b pb-2 mb-4 text-indigo-900">
                      I. REQUÊTE AU FOND : RECOURS POUR EXCÈS DE POUVOIR (REP)
                    </h4>
                    <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                      {generatedRequete?.texteRep || "Chargement..."}
                    </pre>
                  </div>

                  {generatedRequete?.texteRefere && (
                    <div className="pt-6 border-t-2 border-dashed border-slate-300">
                      <h4 className="font-bold text-center border-b pb-2 mb-4 text-amber-800">
                        II. REQUÊTE EN RÉFÉRÉ-SUSPENSION (ARTICLE L. 521-1 DU CJA)
                      </h4>
                      <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                        {generatedRequete.texteRefere}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 4 : BORDEREAU DE PIÈCES (TÉLÉRECOURS CITOYENS)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "bordereau" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-blue-950/40 border-2 border-blue-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30 text-blue-400 shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Bordereau Récapitulatif Numéroté Conforme Télérecours Citoyens
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Norme de l'article <strong>R. 414-5 du CJA</strong> et de l'arrêté du 14 décembre 2018 : chaque pièce doit être un fichier distinct numéroté (<code>PJ1_...pdf</code>, <code>PJ2_...pdf</code>) accompagné d'un bordereau d'inventaire détaillé précisant la date et la pagination.
                  </p>
                </div>
              </div>
              <div className="shrink-0 bg-slate-900 px-3.5 py-2 rounded-xl border border-blue-500/30 text-xs font-mono text-blue-300">
                {piecesList.length} pièces indexées • Total {piecesList.reduce((acc, p) => acc + p.nbPages, 0)} pages
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Liste et ajout des pièces (5 colonnes) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    <span>Pièces Justificatives à Déposer</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({piecesList.length} PJ)</span>
                </h3>

                {/* Formulaire ajout rapide de pièce */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">
                    Ajouter une nouvelle pièce probante :
                  </span>
                  <div>
                    <input
                      type="text"
                      placeholder="Intitulé de la pièce (ex: Attestation de témoin...)"
                      value={nouvellePiece.titre}
                      onChange={(e) => setNouvellePiece({ ...nouvellePiece, titre: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom du fichier (ex: certif.pdf)"
                      value={nouvellePiece.nomFichier}
                      onChange={(e) => setNouvellePiece({ ...nouvellePiece, nomFichier: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Nb pages"
                      min={1}
                      value={nouvellePiece.nbPages}
                      onChange={(e) => setNouvellePiece({ ...nouvellePiece, nbPages: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <select
                      value={nouvellePiece.categorie}
                      onChange={(e) => setNouvellePiece({ ...nouvellePiece, categorie: e.target.value as "decision" | "recours" | "echange" | "medical" | "temoignage" | "autre" })}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="decision">Décision administrative</option>
                      <option value="recours">Recours préalable / LRAR</option>
                      <option value="echange">Courriel / Note de service</option>
                      <option value="medical">Certificat médical / ITT</option>
                      <option value="temoignage">Attestation de témoin</option>
                      <option value="autre">Autre pièce probante</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAjouterPiece}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Liste des pièces numérotées */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {piecesList.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                            PJ n°{p.numero}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {p.nomNormalise}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{p.titre}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {p.datePiece} • {p.nbPages} page(s)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSupprimerPiece(p.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                        title="Supprimer la pièce"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateBordereau}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Actualiser le Bordereau d'Inventaire</span>
                </button>
              </div>

              {/* Rendu du Bordereau officiel (7 colonnes) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    Bordereau Récapitulatif Conforme R. 414-5 CJA
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportDocx("Bordereau_Pieces_TeleRecours", generatedBordereau?.texteBordereau || "")}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Word (.docx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedBordereau?.texteBordereau || "")}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 font-serif text-xs sm:text-sm leading-relaxed border-4 border-slate-800 shadow-2xl overflow-x-auto min-h-[540px]">
                  <pre className="whitespace-pre-wrap font-serif text-slate-900 select-text">
                    {generatedBordereau?.texteBordereau || "Génération en cours..."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ONGLET 5 : CODE & PACKAGE DOCASSEMBLE (.YML & PYTHON)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "docassemble" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-400 shrink-0">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Intégration & Export Docassemble (Jonathan Pyle)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Ce module génère le script officiel d'interview <strong>Docassemble</strong> en format YAML avec ses blocs logiques Python (calculs de recevabilité R. 421-5 CJA, champs conditionnels, templates docx). Vous pouvez le déployer directement sur votre instance Docker Docassemble ou l'intégrer à un guichet juridique autonome.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://docassemble.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Documentation Docassemble</span>
                </a>
              </div>
            </div>

            {/* Sélecteur de scénario Docassemble */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">Scénario de l'interview :</span>
                <select
                  value={docassembleScenario}
                  onChange={(e) => setDocassembleScenario(e.target.value as "recours_gracieux" | "requete_ta" | "protection_fonctionnelle" | "saisine_instances")}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="recours_gracieux">Interview 1 : Recours Gracieux & Calcul R. 421-5 CJA</option>
                  <option value="saisine_instances">Interview 2 : Saisine Instances Paritaires (CAP, CCP, F3SCT)</option>
                  <option value="requete_ta">Interview 3 : Requête Contentieuse Tribunal Administratif</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(docassembleYaml)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le YAML</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([docassembleYaml], { type: "text/yaml;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `docassemble_${docassembleScenario}.yml`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Fichier Docassemble .yml téléchargé !");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .yml</span>
                </button>
              </div>
            </div>

            {/* Visualiseur de code YAML Docassemble */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 font-mono text-xs text-slate-200 overflow-x-auto shadow-2xl max-h-[600px]">
              <pre className="whitespace-pre select-text">
                {docassembleYaml}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
