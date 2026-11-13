import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Landmark,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Download,
  Copy,
  Sparkles,
  Info,
  Scale,
  PieChart,
  ClipboardList,
  FileCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Layers,
  Stamp,
  Award,
  Hash,
  ArrowRight,
  Check,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import {
  analyserBudgetM57,
  genererNoteDecision,
  genererNoteArbitrageBP2027,
  genererRapportAuditM57,
  PRESETS_COLLECTIVITES,
  DELIBERATIONS_GENNEVILLIERS_2026,
  comparerBP2025et2026,
  type BudgetM57Input,
  type BudgetM57Result,
  type DeliberationBudgetInfo,
  type ChapitreMouvement,
  type ChapitreComparatifRow
} from '../services/budgetM57Engine';
import { BudgetM57Graphiques } from './BudgetM57Graphiques';
import { ForeverGooeyToggle } from './ui/ForeverGooeyToggle';
import { ForeverMagneticButton } from './ui/ForeverMagneticButton';

interface CalculateurBudgetM57Props {
  onClose?: () => void;
}

interface PieceCheckItem {
  id: string;
  domaine: string;
  titre: string;
  statut: 'recu' | 'manquant' | 'non_applicable';
  remarque?: string;
}

const PIECES_CRC_INITIAL: PieceCheckItem[] = [
  { id: 'perim_1', domaine: 'Périmètre & Statut', titre: 'Statut juridique, compétences, délégations et liste des budgets annexes M57', statut: 'recu' },
  { id: 'perim_2', domaine: 'Périmètre & Statut', titre: 'Organigramme général et tableau des délégations de signature du Maire/Président', statut: 'recu' },
  { id: 'budg_1', domaine: 'Budget & Délibérations', titre: 'Budget Primitif (BP 2026 n°2026/S1/001) et Budget Supplémentaire (BS 2026 n°2026/S6/004)', statut: 'recu' },
  { id: 'budg_2', domaine: 'Budget & Délibérations', titre: 'Rapport d’Orientation Budgétaire (ROB) et débat d’orientation budgétaire (DOB)', statut: 'recu' },
  { id: 'budg_3', domaine: 'Budget & Délibérations', titre: 'Tableau des restes à réaliser 2025 (RAR : 15 075 223,80 € dép. / 12 103 104,02 € rec.)', statut: 'recu' },
  { id: 'compt_1', domaine: 'Comptes & Clôture', titre: 'Compte Financier Unique (CFU 2025) et délibération d’affectation du résultat (1068 : 16,40 M€ / R002 : 1,00 M€)', statut: 'recu' },
  { id: 'compt_2', domaine: 'Comptes & Clôture', titre: 'Balance générale des comptes au 31/12 et états de rapprochement trésorerie', statut: 'recu' },
  { id: 'dette_1', domaine: 'Patrimoine & Dette', titre: 'Tableau complet de l’encours de la dette (taux fixes, taux variables, prêts structurés)', statut: 'recu' },
  { id: 'dette_2', domaine: 'Patrimoine & Dette', titre: 'État de l’actif, inventaire physique/comptable M57 et justificatif Chap. 27 (1 120 500 €)', statut: 'manquant' },
  { id: 'dette_3', domaine: 'Patrimoine & Dette', titre: 'Engagements hors bilan, garanties d’emprunt accordées aux bailleurs sociaux', statut: 'recu' },
  { id: 'ctrl_1', domaine: 'Contrôle Interne & Régies', titre: 'Cartographie des risques financiers (DMRA) et manuels de procédures internes', statut: 'manquant' },
  { id: 'ctrl_2', domaine: 'Contrôle Interne & Régies', titre: 'Actes de création des régies de recettes/avances et contrôles sur place effectués', statut: 'recu' },
  { id: 'achats_1', domaine: 'Commande Publique', titre: 'Registre des marchés publics notifiés et dossiers de consultation échantillonnés', statut: 'recu' },
  { id: 'achats_2', domaine: 'Commande Publique', titre: 'Certificats de service fait et circuits de visa dématérialisés (PES v2)', statut: 'recu' },
  { id: 'rh_1', domaine: 'RH & Masse Salariale', titre: 'Rapport Social Unique (RSU), tableau des emplois et lignes directrices de gestion (LDG)', statut: 'recu' },
  { id: 'rh_2', domaine: 'RH & Masse Salariale', titre: 'Délibération cadre RIFSEEP (IFSE + CIA) et critères d’attribution', statut: 'recu' },
  { id: 'rh_3', domaine: 'RH & Masse Salariale', titre: 'Suivi des heures supplémentaires, temps de travail (1 607 heures) et absences', statut: 'manquant' },
];

export const CalculateurBudgetM57: React.FC<CalculateurBudgetM57Props> = ({ onClose }) => {
  // Onglet actif : 'graphiques' par défaut, 'deliberations' | 'ratios' | 'pieces' | 'rapport' | 'note'
  const [activeTab, setActiveTab] = useState<'deliberations' | 'graphiques' | 'ratios' | 'pieces' | 'rapport' | 'note'>('graphiques');

  // Budget de délibération sélectionné (BP 2026, BP 2025, BS 2026, Restauration, Cinéma, DM1 2024, CFU 2024 Ville, CFU 2024 Vigo)
  const [selectedDelibKey, setSelectedDelibKey] = useState<'bp_2026' | 'bp_2025' | 'principal' | 'restauration' | 'cinema' | 'dm1_2024' | 'cfu_2024_commune' | 'cfu_2024_cinema'>('bp_2026');
  const deliberationActive: DeliberationBudgetInfo = DELIBERATIONS_GENNEVILLIERS_2026[selectedDelibKey];

  // Calcul comparatif pluriannuel BP 2025 vs BP 2026
  const comparatifBP = useMemo(() => comparerBP2025et2026(), []);
  const [showDetailComparatif, setShowDetailComparatif] = useState<boolean>(false);
  const [sectionComparatifFiltre, setSectionComparatifFiltre] = useState<'tous' | 'fonctionnement' | 'investissement'>('tous');

  // Formulaire budget M57
  const [formData, setFormData] = useState<BudgetM57Input>(PRESETS_COLLECTIVITES.gennevilliers_bp_2026);

  // État interactif des pièces CRC
  const [piecesCRC, setPiecesCRC] = useState<PieceCheckItem[]>(PIECES_CRC_INITIAL);

  // Note de décision personnalisée
  const [noteSignataire, setNoteSignataire] = useState<string>('Direction Générale des Services / Direction des Affaires Financières');
  const [noteObjet, setNoteObjet] = useState<string>('Arbitrage budgétaire M57, exécution du BS 2026 (Délib. n°2026/S6/004) et trajectoire financière 2026');
  const [noteMode, setNoteMode] = useState<'bp2027' | 'bs2026'>('bp2027');
  const [noteObjet2027, setNoteObjet2027] = useState<string>('Orientations et arbitrages pour la préparation du Budget Primitif 2027 (cadrage budgétaire M57, trajectoire financière 2027 et lettre de cadrage aux directions)');

  // Calcul du diagnostic M57
  const resultat: BudgetM57Result = useMemo(() => {
    return analyserBudgetM57(formData);
  }, [formData]);

  // État d'affichage repliable du bloc "Données budgétaires officielles certifiées" (fermé par défaut)
  const [showProfilsOfficiels, setShowProfilsOfficiels] = useState<boolean>(false);

  // Remplacement par un preset
  const chargerPreset = (key: string) => {
    if (PRESETS_COLLECTIVITES[key]) {
      setFormData(PRESETS_COLLECTIVITES[key]);
      toast.success(`Profil « ${PRESETS_COLLECTIVITES[key].collectiviteNom} » chargé !`);
    }
  };

  // Injection directe d'une délibération dans le calculateur de ratios
  const injecterDeliberationDansRatios = (key: 'bp_2026' | 'bp_2025' | 'principal' | 'restauration' | 'cinema') => {
    if (key === 'bp_2026') {
      chargerPreset('gennevilliers_bp_2026');
    } else if (key === 'bp_2025') {
      chargerPreset('gennevilliers_bp_2025');
    } else if (key === 'principal') {
      chargerPreset('gennevilliers_principal_delib_2026');
    } else if (key === 'restauration') {
      chargerPreset('gennevilliers_restauration_2026');
    } else {
      chargerPreset('gennevilliers_cinema_2026');
    }
    setActiveTab('ratios');
    toast.success('Données officielles de la délibération injectées dans le simulateur M57 !');
  };

  // Mise à jour du statut d'une pièce
  const toggleStatutPiece = (id: string, newStatut: 'recu' | 'manquant' | 'non_applicable') => {
    setPiecesCRC(prev =>
      prev.map(item => (item.id === id ? { ...item, statut: newStatut } : item))
    );
  };

  // Markdown de la note d'arbitrage enrichie
  const noteMarkdown = useMemo(() => {
    return genererNoteDecision(resultat, { objet: noteObjet, signataire: noteSignataire });
  }, [resultat, noteObjet, noteSignataire]);

  // Markdown de la note d'arbitrage — préparation du BP 2027
  const noteBP2027Markdown = useMemo(() => {
    return genererNoteArbitrageBP2027({ objet: noteObjet2027, signataire: noteSignataire });
  }, [noteObjet2027, noteSignataire]);

  const noteAffichee = noteMode === 'bp2027' ? noteBP2027Markdown : noteMarkdown;

  // Markdown du rapport d'audit CRC enrichi
  const rapportAuditMarkdown = useMemo(() => {
    return genererRapportAuditM57(resultat, piecesCRC);
  }, [resultat, piecesCRC]);

  const telechargerFichier = (contenu: string, nomFichier: string) => {
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Fichier ${nomFichier} téléchargé !`);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 sm:p-6 lg:p-8">
      {/* FOND COMPLÈTEMENT OPAQUE : bloque à 100% tout arrière-plan, papier peint ou formes géométriques */}
      <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête principal compact et parfaitement équilibré */}
        <div className="space-y-3 pb-3 border-b border-slate-300 dark:border-slate-800">
          {/* Ligne 1 : Navigation retour, Titre principal & Badges réglementaires */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {onClose && (
                <ForeverMagneticButton
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm hover:shadow-md border border-red-500/30 transition-all duration-200 group shrink-0"
                  glowColor="rgba(239, 68, 68, 0.45)"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Retour</span>
                </ForeverMagneticButton>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
                  <Landmark className="w-4 h-4 sm:w-5 h-5" />
                </span>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Finances Locales & Ratios M57 <span className="font-semibold text-slate-500 dark:text-slate-400">— Ville de Gennevilliers</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Instruction M57 (DGCL)
              </span>
              <span className="hidden md:inline-block text-[11px] text-slate-500 dark:text-slate-400">
                CFU 2025 & BS 2026 n°2026/S6/004
              </span>
            </div>
          </div>

          {/* Ligne 2 : Barre d'onglets ForeverGooeyToggle étalée et défilable horizontalement */}
          <div className="w-full overflow-x-auto no-scrollbar pt-1">
            <ForeverGooeyToggle<'deliberations' | 'graphiques' | 'ratios' | 'pieces' | 'rapport' | 'note'>
              size="sm"
              value={activeTab}
              onChange={setActiveTab}
              options={[
                {
                  value: 'deliberations',
                  label: 'Délibérations & CFU (PDFs 2026)',
                  icon: <Stamp className="w-3.5 h-3.5 text-amber-300" />
                },
                {
                  value: 'graphiques',
                  label: '📊 Graphiques & Camemberts',
                  icon: <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                },
                {
                  value: 'ratios',
                  label: 'Ratios & Diagnostics M57',
                  icon: <Scale className="w-3.5 h-3.5" />
                },
                {
                  value: 'pieces',
                  label: 'Pièces CRC',
                  icon: <ClipboardList className="w-3.5 h-3.5" />,
                  badge: `${piecesCRC.filter(p => p.statut === 'recu').length}/${piecesCRC.length}`
                },
                {
                  value: 'rapport',
                  label: "Rapport d'Audit",
                  icon: <FileCheck className="w-3.5 h-3.5" />
                },
                {
                  value: 'note',
                  label: "Note d'Arbitrage",
                  icon: <FileText className="w-3.5 h-3.5" />
                }
              ]}
            />
          </div>
        </div>

        {/* Barre de profils officiels M57 — Cachée par défaut, s'ouvre au clic sur le titre */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowProfilsOfficiels(!showProfilsOfficiels)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Données budgétaires officielles certifiées :</span>
              <span className="text-[10px] font-normal normal-case text-slate-500">
                (cliquez pour {showProfilsOfficiels ? 'replier' : 'afficher les profils certifiés'})
              </span>
            </span>
            <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              <span>{showProfilsOfficiels ? 'Masquer' : 'Afficher'}</span>
              {showProfilsOfficiels ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProfilsOfficiels && (
            <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                onClick={() => chargerPreset('gennevilliers_bp_2026')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  BP 2026 Primitif
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">250,67 M€ • Délib. 2026/S1/001</div>
              </button>
              <button
                onClick={() => chargerPreset('gennevilliers_bp_2025')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  BP 2025 Primitif
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">238,28 M€ • Délib. 12/02/2025</div>
              </button>
              <button
                onClick={() => chargerPreset('gennevilliers_principal_delib_2026')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  BS 2026 Principal
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">27,29 M€ • Délib. 2026/S6/004</div>
              </button>
              <button
                onClick={() => chargerPreset('gennevilliers_cfu_2025')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  CFU 2025 Exécution
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Excédent +17,39 M€ • Compte 1068</div>
              </button>
              <button
                onClick={() => chargerPreset('gennevilliers_restauration_2026')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Annexe Restauration
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">36,19 k€ • Unanimité</div>
              </button>
              <button
                onClick={() => chargerPreset('gennevilliers_cinema_2026')}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Annexe Cinéma Vigo
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">24,58 k€ • Unanimité</div>
              </button>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. ONGLET DÉLIBÉRATIONS & CFU 2026 (DONNÉES DES 6 ACTES PDF)        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'deliberations' && (
          <div className="space-y-6">
            
            {/* Sélecteur de Délibération */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-amber-500" />
                    Actes Officiels du Conseil Municipal de Gennevilliers
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Séances du 12 février 2025, 4 février 2026 et 23 septembre 2026 • Télétransmissions Préfecture certifiées
                  </p>
                </div>

                {/* Sélecteur parmi les délibérations */}
                <div className="inline-flex flex-wrap rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold gap-1">
                  <button
                    onClick={() => setSelectedDelibKey('bp_2026')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'bp_2026'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    BP 2026 (250,67 M€)
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('bp_2025')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'bp_2025'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    BP 2025 (238,28 M€)
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('cfu_2024_commune')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'cfu_2024_commune'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    CFU 2024 Ville (20,55 M€)
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('dm1_2024')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'dm1_2024'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    DM1 2024 (-17,34 M€)
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('principal')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'principal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    BS 2026 & CFU 2025
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('restauration')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'restauration'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Annexe Restauration
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('cinema')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'cinema'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Annexe Cinéma Vigo
                  </button>
                  <button
                    onClick={() => setSelectedDelibKey('cfu_2024_cinema')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      selectedDelibKey === 'cfu_2024_cinema'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    CFU 2024 Vigo
                  </button>
                </div>
              </div>

              {/* Fiche d'identification juridique certifiée */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acte & Référence</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{deliberationActive.numeroDelib}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{deliberationActive.titre}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adoption & Signatures</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      Présidence : {deliberationActive.maire} (Maire)
                      {deliberationActive.secretaireSeance ? ` • Secrétaire : ${deliberationActive.secretaireSeance}` : ''}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Vote : {deliberationActive.typeVote === 'unanimite' ? 'Adopté à l’unanimité' : 'Adopté à la majorité'} ({deliberationActive.votesPour} pour, {deliberationActive.votesContre} contre{deliberationActive.votesAbstention ? `, ${deliberationActive.votesAbstention} abst.` : ''})
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Télétransmission Préfecture</div>
                    <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                      AR : {deliberationActive.arPrefecture}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate" title={deliberationActive.chaineIntegrite}>
                      Empreinte : {deliberationActive.chaineIntegrite}
                    </div>
                  </div>
                </div>

                {/* Détails du quorum & des votes nominatifs */}
                {deliberationActive.detailsVote && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Règle de Quorum : </span>
                      <span className="text-slate-700 dark:text-slate-300">{deliberationActive.detailsVote.quorumTexte}</span>
                    </div>
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Positions exprimées : </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {deliberationActive.detailsVote.contreNoms && deliberationActive.detailsVote.contreNoms.length > 0
                          ? `Vote contre : ${deliberationActive.detailsVote.contreNoms.join(', ')} • `
                          : 'Aucun vote contre • '}
                        {deliberationActive.detailsVote.abstentionNoms && deliberationActive.detailsVote.abstentionNoms.length > 0
                          ? `Abstention(s) : ${deliberationActive.detailsVote.abstentionNoms.join(', ')}`
                          : 'Aucune abstention'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Délégation de gestion Article 2 & Voies de recours */}
                {deliberationActive.delegationArticle2 && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div>
                      <strong className="text-slate-900 dark:text-white">Article 2 (Mouvements de crédits) : </strong>
                      <span className="text-slate-600 dark:text-slate-300">{deliberationActive.delegationArticle2}</span>
                    </div>
                    {deliberationActive.delaiRecours && (
                      <div>
                        <strong className="text-slate-900 dark:text-white">Article 4 (Voies de recours) : </strong>
                        <span className="text-slate-500 dark:text-slate-400">{deliberationActive.delaiRecours}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bouton d'action directe : injecter dans le simulateur */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Visas CGCT L. 2121-12, L. 1612-11, L. 2311-5 & Instruction M57. Acte rendu exécutoire.
                </div>
                <button
                  onClick={() => injecterDeliberationDansRatios(selectedDelibKey)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Calculer les Ratios M57 de ce Budget</span>
                </button>
              </div>
            </div>

            {/* DASHBOARD COMPARATIF BP 2025 vs BP 2026 (Quand on consulte les budgets primitifs) */}
            {(selectedDelibKey === 'bp_2026' || selectedDelibKey === 'bp_2025') && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Comparatif Pluriannuel Officiel : Budget Primitif 2025 ➔ Budget Primitif 2026
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Données consolidées d'après les délibérations certifiées du 12 février 2025 et du 4 février 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Croissance globale : +5,20 % (+12,39 M€)
                    </span>
                    <button
                      onClick={() => setShowDetailComparatif(!showDetailComparatif)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      {showDetailComparatif ? 'Masquer le tableau détaillé' : 'Voir le tableau détaillé par chapitre'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Budget Global Voté</span>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-1">250 668 105 €</div>
                    <div className="text-[11px] text-slate-500">BP 2025 : 238 277 172 €</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">+12,39 M€ (+5,20 %)</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Masse Salariale (Chap. 012)</span>
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">96 063 865 €</div>
                    <div className="text-[11px] text-slate-500">BP 2025 : 91 397 205 €</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">+4,67 M€ (+5,11 %, GVT & carrières)</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section d'Investissement</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">82 517 370 €</div>
                    <div className="text-[11px] text-slate-500">BP 2025 : 66 980 005 €</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">+15,54 M€ (+23,20 %, équipements)</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Équipements & Travaux (21+23)</span>
                    <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1">53 868 283 €</div>
                    <div className="text-[11px] text-slate-500">BP 2025 : 43 451 658 €</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">+10,42 M€ (+23,98 %, chantiers publics)</div>
                  </div>
                </div>

                {/* TABLEAU DÉTAILLÉ COMPARATIF PAR CHAPITRE */}
                {showDetailComparatif && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Évolution détaillée par chapitre M57 (2025 ➔ 2026) :
                      </div>
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                        <button
                          onClick={() => setSectionComparatifFiltre('tous')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            sectionComparatifFiltre === 'tous'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={() => setSectionComparatifFiltre('fonctionnement')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            sectionComparatifFiltre === 'fonctionnement'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Fonctionnement
                        </button>
                        <button
                          onClick={() => setSectionComparatifFiltre('investissement')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            sectionComparatifFiltre === 'investissement'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Investissement
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold">
                          <tr>
                            <th className="p-2.5">Section</th>
                            <th className="p-2.5">Chapitre & Libellé</th>
                            <th className="p-2.5 text-right">BP 2025 (€)</th>
                            <th className="p-2.5 text-right">BP 2026 (€)</th>
                            <th className="p-2.5 text-right">Variation (€)</th>
                            <th className="p-2.5 text-right">Évolution (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono">
                          {[
                            ...(sectionComparatifFiltre !== 'investissement' ? comparatifBP.depensesFonctionnement : []),
                            ...(sectionComparatifFiltre !== 'investissement' ? comparatifBP.recettesFonctionnement : []),
                            ...(sectionComparatifFiltre !== 'fonctionnement' ? comparatifBP.depensesInvestissement : []),
                            ...(sectionComparatifFiltre !== 'fonctionnement' ? comparatifBP.recettesInvestissement : []),
                          ].map((row, idx) => {
                            const isPositive = row.deltaEuros > 0;
                            const isZero = row.deltaEuros === 0;
                            return (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-2.5 font-sans">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    row.section === 'fonctionnement'
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                  }`}>
                                    {row.section === 'fonctionnement' ? 'FCT' : 'INV'} • {row.sens === 'depense' ? 'Dép.' : 'Rec.'}
                                  </span>
                                </td>
                                <td className="p-2.5 font-sans">
                                  <strong className="text-indigo-600 dark:text-indigo-400 mr-1.5">Chap. {row.chapitre}</strong>
                                  <span className="text-slate-700 dark:text-slate-300">{row.libelle}</span>
                                </td>
                                <td className="p-2.5 text-right text-slate-600 dark:text-slate-400">
                                  {row.montant2025.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                </td>
                                <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                                  {row.montant2026.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                </td>
                                <td className={`p-2.5 text-right font-bold ${
                                  isZero
                                    ? 'text-slate-400'
                                    : (row.sens === 'depense' ? (isPositive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400') : (isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'))
                                }`}>
                                  {isPositive ? '+' : ''}{row.deltaEuros.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                </td>
                                <td className="p-2.5 text-right">
                                  {row.deltaPct !== null ? (
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      row.deltaPct > 0
                                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                        : row.deltaPct < 0
                                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                      {row.deltaPct > 0 ? '+' : ''}{row.deltaPct.toFixed(2)} %
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">Nouveau</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Cadre Clôture CFU 2025 & Affectation (Si applicable) */}
            {deliberationActive.cfu2025 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-500" />
                    Clôture du Compte Financier Unique (CFU) 2025 & Affectation Réglementaire du Résultat
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    Instruction M57
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Résultat Fct. Cumulé</span>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {deliberationActive.cfu2025.fonctionnementResultatCumule >= 0 ? '+' : ''}
                      {deliberationActive.cfu2025.fonctionnementResultatCumule.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Excédent de gestion constaté au CFU</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Solde Exécution Invest.</span>
                    <div className={`text-lg font-black mt-1 ${
                      deliberationActive.cfu2025.investissementResultatCumule >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {deliberationActive.cfu2025.investissementResultatCumule.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {deliberationActive.cfu2025.investissementResultatCumule < 0 ? 'Déficit d’exécution à couvrir' : 'Excédent reporté'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Restes à Réaliser (RAR)</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                      Dépenses : {deliberationActive.cfu2025.restesARealiserDepenses.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Recettes : {deliberationActive.cfu2025.restesARealiserRecettes.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      Besoin net RAR : {(deliberationActive.cfu2025.restesARealiserDepenses - deliberationActive.cfu2025.restesARealiserRecettes).toLocaleString('fr-FR')} €
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Besoin Net Total Invest.</span>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {deliberationActive.cfu2025.besoinNetFinancement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Déficit + solde net des restes à réaliser</div>
                  </div>
                </div>

                {/* Affectation votée */}
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Affectation Réglementaire du Résultat Délibérée par le Conseil Municipal :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Compte 1068 (Réserves capitalisées) :</span>
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {deliberationActive.cfu2025.affectationCompte1068.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </div>
                      <span className="text-[10px] text-slate-400">Priorité M57 pour couvrir le besoin d'investissement</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Ligne R002 (Report fonctionnement) :</span>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {deliberationActive.cfu2025.affectationLigneR002.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </div>
                      <span className="text-[10px] text-slate-400">Marge de manœuvre conservée en gestion courante</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {deliberationActive.cfu2025.affectationLigneD001 !== undefined ? 'Ligne D001 (Déficit reporté) :' : 'Ligne R001 (Excédent reporté) :'}
                      </span>
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {(deliberationActive.cfu2025.affectationLigneD001 ?? deliberationActive.cfu2025.affectationLigneR001 ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </div>
                      <span className="text-[10px] text-slate-400">Reprise comptable en section d'investissement</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tableaux Annexes par Chapitre */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Tableaux Officiels par Chapitre ({deliberationActive.titre})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Équilibre budgétaire général voté : <strong className="text-slate-800 dark:text-slate-200">{deliberationActive.montantTotalEquilibre.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    Fonct. : {deliberationActive.sectionFonctionnementTotal.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    Invest. : {deliberationActive.sectionInvestissementTotal.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>

              {/* SECTION FONCTIONNEMENT */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Section de Fonctionnement ({deliberationActive.sectionFonctionnementTotal.toLocaleString('fr-FR')} €)
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Dépenses Fonctionnement */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between">
                      <span>Dépenses de Fonctionnement</span>
                      <span>Montant Voté</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {deliberationActive.depensesFonctionnement.map((c, i) => (
                        <div key={i} className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-2">Chap. {c.chapitre}</span>
                            <span className="text-slate-700 dark:text-slate-300">{c.libelle}</span>
                            <span className="ml-2 text-[10px] text-slate-400 uppercase font-bold">({c.nature})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                            {c.montantBS2026.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      ))}
                      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 font-bold text-xs flex justify-between">
                        <span>Total Dépenses Fonctionnement</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {deliberationActive.sectionFonctionnementTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recettes Fonctionnement */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between">
                      <span>Recettes de Fonctionnement</span>
                      <span>Montant Voté</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {deliberationActive.recettesFonctionnement.map((c, i) => (
                        <div key={i} className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mr-2">Chap. {c.chapitre}</span>
                            <span className="text-slate-700 dark:text-slate-300">{c.libelle}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${c.montantBS2026 < 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                            {c.montantBS2026.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      ))}
                      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 font-bold text-xs flex justify-between">
                        <span>Total Recettes Fonctionnement</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {deliberationActive.sectionFonctionnementTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION INVESTISSEMENT */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    Section d'Investissement ({deliberationActive.sectionInvestissementTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €)
                  </div>
                  {deliberationActive.cfu2025 && deliberationActive.cfu2025.restesARealiserDepenses > 0 && (
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Dépenses : <strong className="text-slate-900 dark:text-white">10 424 375,12 €</strong> nouv. + <strong className="text-indigo-600 dark:text-indigo-400">15 075 223,80 €</strong> RAR • Recettes : <strong className="text-slate-900 dark:text-white">13 396 494,90 €</strong> nouv. + <strong className="text-emerald-600 dark:text-emerald-400">12 103 104,02 €</strong> RAR
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Dépenses Investissement */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                      <span>Dépenses d'Investissement</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {deliberationActive.id === 'principal' ? 'BS 2026 | Reports 2025 | Total BS' : 'Montant Voté'}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {deliberationActive.depensesInvestissement.map((c, i) => (
                        <div key={i} className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-2">Chap. {c.chapitre}</span>
                            <span className="text-slate-700 dark:text-slate-300">{c.libelle}</span>
                            <span className="ml-1.5 text-[10px] text-slate-400 uppercase font-bold">({c.nature})</span>
                            {c.reports2025 !== undefined && (c.reports2025 > 0 || deliberationActive.id === 'principal') ? (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                BS 2026 : <span className={c.montantBS2026 < 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'font-semibold'}>{c.montantBS2026.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span> • Reports 2025 : <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{(c.reports2025 || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                              </div>
                            ) : null}
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${(c.totalBS ?? c.montantBS2026) < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                            {(c.totalBS ?? c.montantBS2026).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      ))}
                      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 font-bold text-xs flex justify-between items-center">
                        <div>
                          <span>Total Dépenses Investissement</span>
                          {deliberationActive.id === 'principal' && (
                            <div className="text-[10px] font-mono font-normal text-slate-500">
                              BS 2026 : 10 424 375,12 € + RAR 2025 : 15 075 223,80 €
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {deliberationActive.sectionInvestissementTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recettes Investissement */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                      <span>Recettes d'Investissement</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {deliberationActive.id === 'principal' ? 'BS 2026 | Reports 2025 | Total BS' : 'Montant Voté'}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {deliberationActive.recettesInvestissement.map((c, i) => (
                        <div key={i} className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mr-2">Chap. {c.chapitre}</span>
                            <span className="text-slate-700 dark:text-slate-300">{c.libelle}</span>
                            <span className="ml-1.5 text-[10px] text-slate-400 uppercase font-bold">({c.nature})</span>
                            {c.reports2025 !== undefined && (c.reports2025 > 0 || deliberationActive.id === 'principal') ? (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                BS 2026 : <span className={c.montantBS2026 < 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'font-semibold'}>{c.montantBS2026.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span> • Reports 2025 : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{(c.reports2025 || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                              </div>
                            ) : null}
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${(c.totalBS ?? c.montantBS2026) < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                            {(c.totalBS ?? c.montantBS2026).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      ))}
                      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 font-bold text-xs flex justify-between items-center">
                        <div>
                          <span>Total Recettes Investissement</span>
                          {deliberationActive.id === 'principal' && (
                            <div className="text-[10px] font-mono font-normal text-slate-500">
                              BS 2026 : 13 396 494,90 € + RAR 2025 : 12 103 104,02 €
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {deliberationActive.sectionInvestissementTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyse Juridique & Points Clés */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Points Clés & Analyse Juridico-Financière M57 :
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {deliberationActive.pointsClesJuridiques.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ONGLET GRAPHIQUES & CAMEMBERTS M57 (RESSOURCES, DÉPENSES, COMPARATIF)*/}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'graphiques' && (
          <BudgetM57Graphiques
            onInjectIntoRatios={(delibKey) => injecterDeliberationDansRatios(delibKey)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. ONGLET RATIOS & DIAGNOSTICS M57 (AVEC NOTE D'ARBITRAGE & AUDIT)  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'ratios' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Colonne gauche : Saisie des agrégats M57 */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Agrégats M57 de la collectivité
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      Exercice {formData.exercice}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom de la collectivité ou établissement
                    </label>
                    <input
                      type="text"
                      value={formData.collectiviteNom}
                      onChange={(e) => setFormData({ ...formData, collectiviteNom: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Type de structure
                      </label>
                      <select
                        value={formData.typeCollectivite}
                        onChange={(e) => setFormData({ ...formData, typeCollectivite: e.target.value as any })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="commune">Commune</option>
                        <option value="epci">EPCI / Interco</option>
                        <option value="departement">Département</option>
                        <option value="region">Région</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Base budgétaire
                      </label>
                      <select
                        value={formData.base}
                        onChange={(e) => setFormData({ ...formData, base: e.target.value as any })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="prevision">Budget Primitif (Prévision)</option>
                        <option value="execution">CFU / BS Consolidé (Exécution)</option>
                      </select>
                    </div>
                  </div>

                  {/* 4 Agrégats fondamentaux */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Recettes Réelles de Fonctionnement (RRF) en € *
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={formData.recettesReellesFonctionnement}
                        onChange={(e) => setFormData({ ...formData, recettesReellesFonctionnement: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">Chapitres 70, 73 (impôts locaux), 74 (dotations), R002...</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dépenses Réelles de Fonctionnement (DRF) en € *
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={formData.depensesReellesFonctionnement}
                        onChange={(e) => setFormData({ ...formData, depensesReellesFonctionnement: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">Chapitres 011 (charges générales), 012 (personnel), 65, 66...</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Remboursement du Capital de la Dette (annuité) en € *
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={formData.remboursementCapitalDette}
                        onChange={(e) => setFormData({ ...formData, remboursementCapitalDette: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">Chapitre 16 (remboursement en capital : 9,63 M€ BP / 9,55 M€ après BS)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Encours Total de la Dette au 31/12 en € *
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={formData.encoursDetteFinExercice}
                        onChange={(e) => setFormData({ ...formData, encoursDetteFinExercice: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-[10px] text-slate-400">Total du stock de dette bancaire et obligataire</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        dont Chapitre 012 (Charges de personnel & primes) en €
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={formData.depensesPersonnel012 || 0}
                        onChange={(e) => setFormData({ ...formData, depensesPersonnel012: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Jauges, Ratios et Seuils d'alerte CRC */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Carte Synthèse Globale (Couleurs opaques et nettes) */}
                <div className={`rounded-2xl p-5 border shadow-sm ${
                  resultat.diagnosticGlobal.statut === 'sain'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700'
                    : resultat.diagnosticGlobal.statut === 'favorable'
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-300 dark:border-teal-700'
                    : resultat.diagnosticGlobal.statut === 'sous_surveillance'
                    ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700'
                    : 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-700'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${
                        resultat.diagnosticGlobal.statut === 'sain'
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-400'
                          : resultat.diagnosticGlobal.statut === 'favorable'
                          ? 'bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border-teal-400'
                          : resultat.diagnosticGlobal.statut === 'sous_surveillance'
                          ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-400'
                          : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-400'
                      }`}>
                        {resultat.diagnosticGlobal.statut === 'sain' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {resultat.diagnosticGlobal.titre}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {resultat.diagnosticGlobal.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {resultat.diagnosticGlobal.pointsVigilance.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Observations & points d'audit identifiés :
                      </div>
                      {resultat.diagnosticGlobal.pointsVigilance.map((pv, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{pv}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4 Indicateurs Clés M57 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* 1. Épargne Brute */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Épargne Brute (CAF)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">RRF - DRF</span>
                    </div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {resultat.epargneBrute.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-xs text-slate-500">
                      Taux d'Épargne Brute : <strong className="text-slate-900 dark:text-white">{resultat.tauxEpargneBrute ?? 'N/A'} %</strong>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {resultat.diagnosticEpargne.message}
                    </div>
                  </div>

                  {/* 2. Capacité de Désendettement */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Capacité Désendettement</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">Dette / CAF</span>
                    </div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {resultat.capaciteDesendettementAns !== null ? `${resultat.capaciteDesendettementAns} ans` : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Seuil prudentiel CRC : <strong className="text-slate-900 dark:text-white">10 à 12 ans max</strong>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {resultat.diagnosticDesendettement.message}
                    </div>
                  </div>

                  {/* 3. Épargne Nette */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Épargne Nette</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">CAF - Capital</span>
                    </div>
                    <div className={`text-xl font-black ${resultat.epargneNette >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {resultat.epargneNette.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-xs text-slate-500">
                      Capital remboursé : {resultat.capitalDette.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      {resultat.epargneNette >= 0 ? 'Remboursement de la dette sécurisé' : 'Déficit d’autofinancement'}
                    </div>
                  </div>

                  {/* 4. Rigidité Masse Salariale */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Poids Personnel (Chap. 012)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">012 / DRF</span>
                    </div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {resultat.poidsChargesPersonnelPct !== null ? `${resultat.poidsChargesPersonnelPct} %` : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Montant 012 : {formData.depensesPersonnel012 ? formData.depensesPersonnel012.toLocaleString('fr-FR') + ' €' : 'Non précisé'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Standard communal : 55% à 65% des DRF
                    </div>
                  </div>

                </div>

                {/* Jauge visuelle de la Capacité de Désendettement */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                      Positionnement sur la jauge de désendettement CRC
                    </span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {resultat.capaciteDesendettementAns !== null ? `${resultat.capaciteDesendettementAns} ans` : 'N/A'}
                    </span>
                  </div>

                  <div className="relative pt-1">
                    <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex text-[10px] font-bold text-white text-center leading-4">
                      <div style={{ width: '40%' }} className="bg-emerald-500" title="Zone saine (< 8 ans)">
                        &lt; 8 ans
                      </div>
                      <div style={{ width: '20%' }} className="bg-amber-500" title="Zone de vigilance (8 à 10 ans)">
                        8-10 ans
                      </div>
                      <div style={{ width: '20%' }} className="bg-orange-500" title="Zone d'alerte CRC (10 à 12 ans)">
                        10-12 ans
                      </div>
                      <div style={{ width: '20%' }} className="bg-red-600" title="Zone critique (> 12 ans)">
                        &gt; 12 ans
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>0 an (Désendettée)</span>
                    <span className="font-bold text-amber-600">8 ans (Vigilance)</span>
                    <span className="font-bold text-orange-600">10 ans (Alerte CRC)</span>
                    <span className="font-bold text-red-600">12 ans (Réseau d'alerte)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────── */}
            {/* SYNTHÈSE INTÉGRÉE SUR LA PAGE RATIOS & DIAGNOSTICS M57 :            */}
            {/* 1) PROJET DE NOTE D'ARBITRAGE À L'AUTORITÉ TERRITORIALE             */}
            {/* 2) RAPPORT DE REVUE PUBLIQUE LOCALE & AUDIT M57 (BS 2026 INTÉGRÉ)   */}
            {/* ─────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* BLOC 1 : PROJET DE NOTE D'ARBITRAGE À L'AUTORITÉ TERRITORIALE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Projet de Note d'Arbitrage à l'Autorité Territoriale
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Synthèse décisionnelle Maire / DGS intégrant le BP 2026 (250,67 M€) et le BS 2026 (27,29 M€ — Délib. n°2026/S6/004)
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold shrink-0">
                      Budget Consolidé : 277,96 M€
                    </span>
                  </div>

                  {/* Consolidation BP 2026 + BS 2026 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Consolidation 2026 (BP + BS n°2026/S6/004) :</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">277 957 913,22 €</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fonctionnement Consolidé</span>
                        <strong className="font-mono text-slate-900 dark:text-white">169 940 944,30 €</strong>
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">+1 790 209,00 € au BS (dont 1 M€ R002)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Investissement Consolidé</span>
                        <strong className="font-mono text-slate-900 dark:text-white">108 016 968,92 €</strong>
                        <span className="block text-[10px] text-indigo-600 dark:text-indigo-400">+25 499 598,92 € au BS (dont 15,08 M€ RAR)</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Scénarios d'arbitrage exécutif */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Options soumises à l'arbitrage de M. le Maire & de la DGS :
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs">
                      <div className="font-bold text-emerald-900 dark:text-emerald-200">
                        Option 1 (Recommandée) — Sanctuarisation du désendettement (-3,06 M€) & Apurement RAR
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Capitalisation au compte 1068 (16,40 M€) substituée à l'emprunt Chap. 16 (-3 063 418,02 €), gel prudentiel de 2 % sur le Chap. 011 au 15/11 et liquidation prioritaire des 15,08 M€ de RAR Dépenses.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70 text-xs">
                      <div className="font-bold text-indigo-900 dark:text-indigo-200">
                        Option 2 — Fongibilité asymétrique M57 (Plafond 7,5 % : {Math.round(resultat.drf * 0.075).toLocaleString('fr-FR')} €) & Dialogue RH
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Mobilisation de la délégation Art. 2 du BP 2026 pour les ajustements de fin d'année hors Chap. 012 (maintenu à 96,06 M€) et hors subventions aux associations (DM requise si abondement du 012).
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs">
                      <div className="font-bold text-amber-900 dark:text-amber-200">
                        Option 3 — Accélération du PPI (Chap. 21 & 23 consolidés à 66,96 M€) & FCTVA 2027
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Mandatement accéléré des 13,11 M€ de RAR travaux (7,14 M€ Chap. 21 + 5,97 M€ Chap. 23) et encaissement prioritaire des 4,10 M€ de subventions reportées au Chap. 13.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(noteMarkdown);
                        toast.success('Note d’arbitrage copiée dans le presse-papiers !');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                    <button
                      onClick={() => telechargerFichier(noteMarkdown, `note-arbitrage-m57-gennevilliers-2026.md`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exporter .md</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveTab('note')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Ouvrir la Note d'Arbitrage complète</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BLOC 2 : RAPPORT DE REVUE PUBLIQUE LOCALE & AUDIT M57 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Rapport de Revue Publique Locale & Audit M57
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Contrôle de régularité CGCT (L. 1612-4, L. 1612-11, L. 2311-5) & 5 Fiches d'observation CRC sur le BS 2026
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                      5 Fiches CRC • AR Certifié
                    </span>
                  </div>

                  {/* Concordance mathématique CFU 2025 -> BS 2026 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Preuve d'audit M57 — Concordance CFU 2025 / BS 2026 :</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Écart : 0,00 €</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-0.5">
                      <div>• Résultat fonct. (+17 399 407,33 €) = Compte 1068 (16 399 407,33 €) + R002 (1 000 000,00 €)</div>
                      <div>• Déficit cumulé (-13 402 616,24 €) = D001 (-10 430 496,46 €) + RAR nets (-2 972 119,78 €)</div>
                      <div>• Virement d'ordre : Chap. 023 Dép. (283 749,59 €) = Chap. 021 Rec. (283 749,59 €)</div>
                    </div>
                  </div>

                  {/* Résumé des 5 Fiches d'observation CRC */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Fiches d'observation normalisées (Méthodologie CRC / DGFiP) :
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-indigo-600 dark:text-indigo-400">OBS-2026-01 (Affectation CFU 2025) :</strong> Couverture intégrale du D001 (10,43 M€) et des RAR nets (2,97 M€) par le compte 1068 (16,40 M€).
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">Conforme</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-indigo-600 dark:text-indigo-400">OBS-2026-02 (Sincérité RAR 2025) :</strong> 15,08 M€ de RAR Dépenses (Chap. 20, 21, 23) et 12,10 M€ de RAR Recettes (dont 8,00 M€ d'emprunts Chap. 16).
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold shrink-0">À documenter</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-indigo-600 dark:text-indigo-400">OBS-2026-03 (Dette & Chap. 66) :</strong> Réduction de -3,06 M€ d'emprunt nouveau Chap. 16 face à +200 k€ d'intérêts Chap. 66 (effet taux).
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold shrink-0">Suivi taux</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-indigo-600 dark:text-indigo-400">OBS-2026-04 & 05 (RH 1607h & Chap. 27) :</strong> Chap. 012 stable (61,45 % DRF) ; opération croisée de 1 120 500 € au Chap. 27 et état de l'actif à joindre.
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold shrink-0">Pièces attendues</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rapportAuditMarkdown);
                        toast.success('Rapport d’audit copié dans le presse-papiers !');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                    <button
                      onClick={() => telechargerFichier(rapportAuditMarkdown, `rapport-audit-m57-gennevilliers-2026.md`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exporter .md</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveTab('rapport')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Ouvrir le Rapport d'Audit complet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 3. ONGLET PIÈCES CRC (CHECKLIST AUDIT)                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'pieces' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Pièces Justificatives pour Audit Interne & Contrôle CRC
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nomenclature standard de contrôle des comptes et de gestion des collectivités territoriales
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPiecesCRC(prev => prev.map(p => ({ ...p, statut: 'recu' })));
                    toast.success('Toutes les pièces marquées comme reçues');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tout valider</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {piecesCRC.map((piece) => (
                <div
                  key={piece.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-400 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {piece.domaine}
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {piece.titre}
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg p-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleStatutPiece(piece.id, 'recu')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        piece.statut === 'recu'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Reçu
                    </button>
                    <button
                      onClick={() => toggleStatutPiece(piece.id, 'manquant')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        piece.statut === 'manquant'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Manquant
                    </button>
                    <button
                      onClick={() => toggleStatutPiece(piece.id, 'non_applicable')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        piece.statut === 'non_applicable'
                          ? 'bg-slate-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. ONGLET RAPPORT D'AUDIT (REVUE PUBLIQUE LOCALE & AUDIT M57)       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'rapport' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-500" />
                  Rapport de Revue Publique Locale & Audit M57 — Ville de Gennevilliers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audit de régularité M57 intégrant la Délibération n°2026/S6/004 du 23/09/2026 (BS 2026 & CFU 2025) • Méthodologie CRC / DGFiP
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rapportAuditMarkdown);
                    toast.success('Rapport d’audit copié !');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier Markdown</span>
                </button>
                <button
                  onClick={() => telechargerFichier(rapportAuditMarkdown, `rapport-audit-m57-${resultat.collectiviteNom.toLowerCase().replace(/\s+/g, '-')}.md`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .md</span>
                </button>
              </div>
            </div>

            {/* Cartes de synthèse des 5 Fiches d'Observation CRC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">OBS-2026-01 • Affectation CFU 2025</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">Concordance exacte au centime</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Compte 1068 (16 399 407,33 €) = Déficit D001 (10 430 496,46 €) + RAR nets (2 972 119,78 €) + surcouverture de 2 996 791,09 € réduisant l'emprunt.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">OBS-2026-02 • Restes à Réaliser</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">15,08 M€ Dép. / 12,10 M€ Rec.</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Justification attendue (Art. R. 2311-11 CGCT) pour les 13,11 M€ de travaux (Chap. 21/23) et les 8,00 M€ d'emprunts reportés au Chap. 16.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">OBS-2026-03 à 05 • Dette, RH & Actif</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">-3,06 M€ d'emprunt • Chap. 27 (1,12 M€)</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Chap. 012 stable (96,06 M€) ; documenter l'opération symétrique de 1 120 500 € au Chap. 27 et l'état de rapprochement de l'actif M57.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[650px] overflow-y-auto border border-slate-300 dark:border-slate-800 leading-relaxed">
              {rapportAuditMarkdown}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 5. ONGLET NOTE D'ARBITRAGE À L'AUTORITÉ TERRITORIALE                */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'note' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Projet de Note d'Arbitrage à l'Autorité Territoriale
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {noteMode === 'bp2027'
                    ? "Note d'aide à la décision pour M. le Maire et la DGS — préparation du Budget Primitif 2027 (hypothèses de cadrage à valider par la DAF / DRH)"
                    : "Note d'aide à la décision pour M. le Maire et la DGS intégrant la Délibération n°2026/S6/004 du 23/09/2026 (BS 2026)"}
                </p>
                <div className="inline-flex mt-2 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setNoteMode('bp2027')}
                    className={`px-3 py-1.5 cursor-pointer transition-colors ${noteMode === 'bp2027' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                  >
                    Budget 2027 (préparation BP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteMode('bs2026')}
                    className={`px-3 py-1.5 cursor-pointer transition-colors ${noteMode === 'bs2026' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                  >
                    BS 2026 / Exécution
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(noteAffichee);
                    toast.success('Note de décision copiée !');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier Markdown</span>
                </button>
                <button
                  onClick={() => telechargerFichier(noteAffichee, noteMode === 'bp2027' ? 'note-arbitrage-bp-2027-gennevilliers.md' : `note-arbitrage-${resultat.collectiviteNom.toLowerCase().replace(/\s+/g, '-')}.md`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .md</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Émetteur / Service
                </label>
                <input
                  type="text"
                  value={noteSignataire}
                  onChange={(e) => setNoteSignataire(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Objet de la note
                </label>
                <input
                  type="text"
                  value={noteMode === 'bp2027' ? noteObjet2027 : noteObjet}
                  onChange={(e) => (noteMode === 'bp2027' ? setNoteObjet2027(e.target.value) : setNoteObjet(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {noteMode === 'bp2027' ? (
              (() => {
                const b = PRESETS_COLLECTIVITES.gennevilliers_principal_delib_2026;
                const rrfRetraite = b.recettesReellesFonctionnement - 1_000_000;
                const ebRetraite = rrfRetraite - b.depensesReellesFonctionnement;
                const drfCible = Math.round(b.depensesReellesFonctionnement * 1.015);
                const f = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Base de départ : Budget Consolidé 2026</span>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">277 957 913,22 €</div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">BP (250,67 M€) + BS (27,29 M€)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Épargne brute 2026 retraitée</span>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{f(ebRetraite)}</div>
                      <span className="text-[10px] text-slate-500">Hors report R002 (1 M€)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Cible DRF 2027 (scénario B, +1,5 %)</span>
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{f(drfCible)}</div>
                      <span className="text-[10px] text-slate-500">Hypothèse de cadrage à valider</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Plafond Fongibilité M57 (7,5%)</span>
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{f(b.depensesReellesFonctionnement * 0.075)}</div>
                      <span className="text-[10px] text-slate-500">Hors Chap. 012 & subventions asso.</span>
                    </div>
                  </div>
                );
              })()
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">Budget Consolidé 2026</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">277 957 913,22 €</div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">BP (250,67 M€) + BS (27,29 M€)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">Affectation Compte 1068</span>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">16 399 407,33 €</div>
                <span className="text-[10px] text-slate-500">+ 1 000 000,00 € en report R002</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">Baisse Emprunt BS (Chap. 16)</span>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">-3 063 418,02 €</div>
                <span className="text-[10px] text-slate-500">et -77 000,00 € sur capital dette</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">Plafond Fongibilité M57 (7,5%)</span>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {Math.round(resultat.drf * 0.075).toLocaleString('fr-FR')} €
                </div>
                <span className="text-[10px] text-slate-500">Hors Chap. 012 & subventions asso.</span>
              </div>
            </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[650px] overflow-y-auto border border-slate-300 dark:border-slate-800 leading-relaxed">
              {noteAffichee}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CalculateurBudgetM57;
