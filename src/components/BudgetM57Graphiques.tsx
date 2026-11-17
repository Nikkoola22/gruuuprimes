import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
  Building2,
  Landmark,
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Percent,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  Wrench,
  Lightbulb,
  HeartHandshake,
  RefreshCw,
  Coins,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DELIBERATIONS_GENNEVILLIERS_2026,
  comparerBP2025et2026,
  analyserBudgetM57,
  PRESETS_COLLECTIVITES,
  type DeliberationBudgetInfo,
  type ChapitreMouvement
} from '../services/budgetM57Engine';
import { ForeverMagneticButton } from './ui/ForeverMagneticButton';
import { ForeverGooeyToggle } from './ui/ForeverGooeyToggle';

interface BudgetM57GraphiquesProps {
  onInjectIntoRatios?: (delibKey: 'bp_2026' | 'bp_2025' | 'principal' | 'restauration' | 'cinema') => void;
  onNavigateToTab?: (tab: 'deliberations' | 'ratios' | 'pieces' | 'rapport' | 'note') => void;
}

// Couleurs harmonieuses modernes pour les chapitres M57
const PALETTE_RESSOURCES: Record<string, { bg: string; fill: string; border: string; text: string }> = {
  '73': { bg: 'bg-emerald-500/15', fill: '#10b981', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  '731': { bg: 'bg-teal-500/15', fill: '#14b8a6', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-300' },
  '74': { bg: 'bg-sky-500/15', fill: '#0284c7', border: 'border-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  '70': { bg: 'bg-indigo-500/15', fill: '#6366f1', border: 'border-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  '75': { bg: 'bg-violet-500/15', fill: '#8b5cf6', border: 'border-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  '013': { bg: 'bg-amber-500/15', fill: '#f59e0b', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  '77': { bg: 'bg-pink-500/15', fill: '#ec4899', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300' },
  '16': { bg: 'bg-cyan-500/15', fill: '#06b6d4', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
  '13': { bg: 'bg-blue-500/15', fill: '#3b82f6', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  '10': { bg: 'bg-lime-500/15', fill: '#84cc16', border: 'border-lime-500', text: 'text-lime-700 dark:text-lime-300' },
  '024': { bg: 'bg-orange-500/15', fill: '#f97316', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  '021': { bg: 'bg-purple-500/15', fill: '#a855f7', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  '040': { bg: 'bg-slate-500/15', fill: '#64748b', border: 'border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
  '041': { bg: 'bg-stone-500/15', fill: '#78716c', border: 'border-stone-500', text: 'text-stone-700 dark:text-stone-300' },
  '45': { bg: 'bg-zinc-500/15', fill: '#71717a', border: 'border-zinc-500', text: 'text-zinc-700 dark:text-zinc-300' },
  default: { bg: 'bg-slate-500/15', fill: '#64748b', border: 'border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
};

const PALETTE_DEPENSES: Record<string, { bg: string; fill: string; border: string; text: string }> = {
  '012': { bg: 'bg-rose-500/15', fill: '#f43f5e', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  '011': { bg: 'bg-amber-500/15', fill: '#f59e0b', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  '65': { bg: 'bg-purple-500/15', fill: '#a855f7', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  '66': { bg: 'bg-red-500/15', fill: '#ef4444', border: 'border-red-500', text: 'text-red-700 dark:text-red-300' },
  '67': { bg: 'bg-fuchsia-500/15', fill: '#d946ef', border: 'border-fuchsia-500', text: 'text-fuchsia-700 dark:text-fuchsia-300' },
  '68': { bg: 'bg-zinc-500/15', fill: '#71717a', border: 'border-zinc-500', text: 'text-zinc-700 dark:text-zinc-300' },
  '022': { bg: 'bg-yellow-500/15', fill: '#eab308', border: 'border-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' },
  '023': { bg: 'bg-indigo-500/15', fill: '#6366f1', border: 'border-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  '042': { bg: 'bg-slate-500/15', fill: '#64748b', border: 'border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
  '21': { bg: 'bg-blue-500/15', fill: '#3b82f6', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  '23': { bg: 'bg-cyan-500/15', fill: '#06b6d4', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
  '204': { bg: 'bg-emerald-500/15', fill: '#10b981', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  '16': { bg: 'bg-orange-500/15', fill: '#f97316', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  '20': { bg: 'bg-teal-500/15', fill: '#14b8a6', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-300' },
  '27': { bg: 'bg-violet-500/15', fill: '#8b5cf6', border: 'border-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  '041': { bg: 'bg-stone-500/15', fill: '#78716c', border: 'border-stone-500', text: 'text-stone-700 dark:text-stone-300' },
  '45': { bg: 'bg-neutral-500/15', fill: '#737373', border: 'border-neutral-500', text: 'text-neutral-700 dark:text-neutral-300' },
  default: { bg: 'bg-slate-500/15', fill: '#64748b', border: 'border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
};

// Fonctions trigonométriques pour le tracé précis des camemberts/donuts SVG
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const adjustedEndAngle = endAngle - startAngle >= 359.999 ? startAngle + 359.99 : endAngle;
  const startOuter = polarToCartesian(x, y, outerRadius, adjustedEndAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, startAngle);
  const endInner = polarToCartesian(x, y, innerRadius, adjustedEndAngle);

  const arcSweep = adjustedEndAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, arcSweep, 0, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerRadius, innerRadius, 0, arcSweep, 1, endInner.x, endInner.y,
    'Z'
  ].join(' ');
}

interface SliceItem {
  id: string;
  chapitre: string;
  libelle: string;
  montant: number;
  pourcentage: number;
  startAngle: number;
  endAngle: number;
  color: { bg: string; fill: string; border: string; text: string };
  nature: 'REEL' | 'ORDRE';
}

export const BudgetM57Graphiques: React.FC<BudgetM57GraphiquesProps> = ({
  onInjectIntoRatios,
  onNavigateToTab
}) => {
  // Sélection du budget de référence (2026, 2025, 2024)
  const [selectedDelibKey, setSelectedDelibKey] = useState<'bp_2026' | 'bp_2025' | 'principal' | 'restauration' | 'cinema' | 'dm1_2024' | 'cfu_2024_commune' | 'cfu_2024_cinema'>('bp_2026');
  
  // Section visualisée dans les camemberts : 'consolide' par défaut (budget total 250,67 M€), 'fonctionnement' | 'investissement'
  const [sectionCamembert, setSectionCamembert] = useState<'fonctionnement' | 'investissement' | 'consolide'>('consolide');
  
  // Unité d'affichage : 'millions' ou 'euros'
  const [uniteAffichage, setUniteAffichage] = useState<'millions' | 'euros'>('millions');

  // Filtre pour la vue comparative BP 2025 vs BP 2026
  const [comparatifFiltre, setComparatifFiltre] = useState<'tous' | 'fonctionnement' | 'investissement' | 'agregats'>('agregats');

  // Tranche active au survol
  const [hoveredRessource, setHoveredRessource] = useState<SliceItem | null>(null);
  const [hoveredDepense, setHoveredDepense] = useState<SliceItem | null>(null);

  // État du bandeau de contrôle supérieur : masqué par défaut, s'ouvre au clic sur le titre
  const [showTableauBord, setShowTableauBord] = useState<boolean>(false);

  // Copie de synthèse
  const [copied, setCopied] = useState<boolean>(false);

  // Simulateur interactif Pédagogie 100 €
  const [basePedagoCitoyen, setBasePedagoCitoyen] = useState<number>(100);
  const [hoveredPoste100, setHoveredPoste100] = useState<string | null>(null);

  // Décomposition unitaire des 100 € dépensés (Budget consolidé 2026 de 250,67 M€)
  const postes100Euros = useMemo(() => {
    const ratio = basePedagoCitoyen / 100;
    return [
      {
        id: 'personnel',
        icon: Users,
        titre: 'Personnel & Services Publics de Proximité',
        montantBase: 38.32,
        montantCalcule: 38.32 * ratio,
        pourcentage: 38.32,
        montantGlobal: '96,06 M€',
        chapitre: 'Chapitre 012',
        color: {
          bg: 'bg-rose-500',
          fill: '#f43f5e',
          bgLight: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
        },
        description: 'Maintien de la qualité des services en gestion directe : crèches municipales, écoles, animateurs périscolaires, voirie, propreté urbaine et police municipale.',
        exemples: ['1 800+ agents territoriaux', 'Accueils de loisirs & crèches', 'Police municipale 7j/7']
      },
      {
        id: 'travaux',
        icon: Wrench,
        titre: 'Travaux, Écoles, Rénovation & Chantiers',
        montantBase: 21.49,
        montantCalcule: 21.49 * ratio,
        pourcentage: 21.49,
        montantGlobal: '53,87 M€',
        chapitre: 'Chapitres 21 + 23',
        color: {
          bg: 'bg-blue-500',
          fill: '#3b82f6',
          bgLight: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
        },
        description: 'Programme Pluriannuel d’Investissement (PPI) : modernisation des groupes scolaires, rénovation énergétique des bâtiments, végétalisation et nouveaux équipements.',
        exemples: ['Rénovation énergétique écoles', 'Voirie & mobilités douces', 'Équipements sportifs & jeunesse']
      },
      {
        id: 'gestion',
        icon: Lightbulb,
        titre: 'Vie Quotidienne, Énergie & Fournitures',
        montantBase: 16.38,
        montantCalcule: 16.38 * ratio,
        pourcentage: 16.38,
        montantGlobal: '41,06 M€',
        chapitre: 'Chapitre 011',
        color: {
          bg: 'bg-amber-500',
          fill: '#f59e0b',
          bgLight: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
        },
        description: 'Dépenses courantes de fonctionnement : chauffage urbain géothermie, électricité des bâtiments, repas bio de la restauration municipale et entretien du domaine.',
        exemples: ['Restauration scolaire locale', 'Fluides & géothermie', 'Maintenance informatique']
      },
      {
        id: 'solidarite',
        icon: HeartHandshake,
        titre: 'Solidarité, CCAS & Associations',
        montantBase: 10.82,
        montantCalcule: 10.82 * ratio,
        pourcentage: 10.82,
        montantGlobal: '27,11 M€',
        chapitre: 'Chapitres 65 + 204',
        color: {
          bg: 'bg-purple-500',
          fill: '#a855f7',
          bgLight: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-700 dark:text-purple-300',
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
        },
        description: 'Soutien direct aux acteurs locaux : subventions aux associations sportives, culturelles et d’entraide, action sociale du CCAS et secours aux ménages fragiles.',
        exemples: ['150+ associations subventionnées', 'Action sociale & urgence CCAS', 'Vacances & séjours jeunes']
      },
      {
        id: 'dette',
        icon: Landmark,
        titre: 'Dette Communale (Capital & Intérêts)',
        montantBase: 4.54,
        montantCalcule: 4.54 * ratio,
        pourcentage: 4.54,
        montantGlobal: '11,38 M€',
        chapitre: 'Chapitres 16 + 66',
        color: {
          bg: 'bg-cyan-500',
          fill: '#06b6d4',
          bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
          border: 'border-cyan-200 dark:border-cyan-800',
          text: 'text-cyan-700 dark:text-cyan-300',
          badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200'
        },
        description: 'Remboursement de la dette : 3,84 € de capital amorti (désendettement actif) et seulement 0,70 € de frais financiers d’intérêts grâce à une dette 100 % taux fixe.',
        exemples: ['Amortissement capital : 3,84 €', 'Intérêts résiduels : 0,70 €', '100 % charte Gissler 1A']
      },
      {
        id: 'ordre',
        icon: RefreshCw,
        titre: 'Amortissements & Provisions M57',
        montantBase: 8.45,
        montantCalcule: 8.45 * ratio,
        pourcentage: 8.45,
        montantGlobal: '21,19 M€',
        chapitre: 'Chapitres 021, 040, 042, 68',
        color: {
          bg: 'bg-slate-500',
          fill: '#64748b',
          bgLight: 'bg-slate-50 dark:bg-slate-800/40',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
        },
        description: 'Écritures d’ordre réglementaires de la nomenclature M57 : garantissent la sincérité des comptes, constatent l’usure du patrimoine et provisionnent les risques futurs.',
        exemples: ['Amortissement du patrimoine', 'Transfert investissement', 'Provisions pour risques']
      }
    ];
  }, [basePedagoCitoyen]);

  // Données du budget actif
  const budgetActif: DeliberationBudgetInfo = DELIBERATIONS_GENNEVILLIERS_2026[selectedDelibKey];

  // Comparatif complet BP 2025 vs BP 2026
  const comparatifData = useMemo(() => comparerBP2025et2026(), []);

  // Formatage monétaire
  const formatMontant = (valeur: number, forceUnite?: 'millions' | 'euros') => {
    const mode = forceUnite || uniteAffichage;
    if (mode === 'millions') {
      const millions = valeur / 1000000;
      return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M€`;
    }
    return `${Math.round(valeur).toLocaleString('fr-FR')} €`;
  };

  // Préparation des tranches pour les RESSOURCES
  const slicesRessources: { items: SliceItem[]; total: number } = useMemo(() => {
    let sourceList: ChapitreMouvement[] = [];
    if (sectionCamembert === 'fonctionnement') {
      sourceList = budgetActif.recettesFonctionnement;
    } else if (sectionCamembert === 'investissement') {
      sourceList = budgetActif.recettesInvestissement;
    } else {
      sourceList = [...budgetActif.recettesFonctionnement, ...budgetActif.recettesInvestissement];
    }

    const total = sourceList.reduce((acc, c) => acc + (c.totalBS ?? c.montantBS2026), 0);
    if (total <= 0) return { items: [], total: 0 };

    let currentAngle = 0;
    const items: SliceItem[] = sourceList.map((chap, idx) => {
      const montant = chap.totalBS ?? chap.montantBS2026;
      const pct = (montant / total) * 100;
      const angleSpan = (montant / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      currentAngle = endAngle;

      const color = PALETTE_RESSOURCES[chap.chapitre] || PALETTE_RESSOURCES.default;

      return {
        id: `res_${chap.chapitre}_${idx}`,
        chapitre: chap.chapitre,
        libelle: chap.libelle,
        montant,
        pourcentage: Math.round(pct * 10) / 10,
        startAngle,
        endAngle,
        color,
        nature: chap.nature
      };
    });

    return { items, total };
  }, [budgetActif, sectionCamembert]);

  // Préparation des tranches pour les DÉPENSES
  const slicesDepenses: { items: SliceItem[]; total: number } = useMemo(() => {
    let sourceList: ChapitreMouvement[] = [];
    if (sectionCamembert === 'fonctionnement') {
      sourceList = budgetActif.depensesFonctionnement;
    } else if (sectionCamembert === 'investissement') {
      sourceList = budgetActif.depensesInvestissement;
    } else {
      sourceList = [...budgetActif.depensesFonctionnement, ...budgetActif.depensesInvestissement];
    }

    const total = sourceList.reduce((acc, c) => acc + (c.totalBS ?? c.montantBS2026), 0);
    if (total <= 0) return { items: [], total: 0 };

    let currentAngle = 0;
    const items: SliceItem[] = sourceList.map((chap, idx) => {
      const montant = chap.totalBS ?? chap.montantBS2026;
      const pct = (montant / total) * 100;
      const angleSpan = (montant / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      currentAngle = endAngle;

      const color = PALETTE_DEPENSES[chap.chapitre] || PALETTE_DEPENSES.default;

      return {
        id: `dep_${chap.chapitre}_${idx}`,
        chapitre: chap.chapitre,
        libelle: chap.libelle,
        montant,
        pourcentage: Math.round(pct * 10) / 10,
        startAngle,
        endAngle,
        color,
        nature: chap.nature
      };
    });

    return { items, total };
  }, [budgetActif, sectionCamembert]);

  // Ratios calculés du budget actif
  const diagnosticActif = useMemo(() => {
    // Adapter selon le preset de la délibération
    let preset = PRESETS_COLLECTIVITES.gennevilliers_bp_2026;
    if (selectedDelibKey === 'bp_2025') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_bp_2025;
    } else if (selectedDelibKey === 'principal') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_principal_delib_2026;
    } else if (selectedDelibKey === 'restauration') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_restauration_2026;
    } else if (selectedDelibKey === 'cinema') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_cinema_2026;
    } else if (selectedDelibKey === 'cfu_2024_commune') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_cfu_2024;
    } else if (selectedDelibKey === 'dm1_2024') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_dm1_2024;
    } else if (selectedDelibKey === 'cfu_2024_cinema') {
      preset = PRESETS_COLLECTIVITES.gennevilliers_cinema_2024;
    }
    return analyserBudgetM57(preset);
  }, [selectedDelibKey]);

  // Copier la synthèse dans le presse-papier
  const copierSynthese = () => {
    const texte = `SYNTHÈSE BUDGÉTAIRE M57 — VILLE DE GENNEVILLIERS (${budgetActif.titre})
- Montant Total Équilibré : ${formatMontant(budgetActif.montantTotalEquilibre, 'millions')} (${formatMontant(budgetActif.montantTotalEquilibre, 'euros')})
- Section de Fonctionnement : ${formatMontant(budgetActif.sectionFonctionnementTotal, 'millions')}
- Section d'Investissement : ${formatMontant(budgetActif.sectionInvestissementTotal, 'millions')}
- Masse salariale (Chap. 012) : ${formatMontant(diagnosticActif.drf * (diagnosticActif.poidsChargesPersonnelPct || 62) / 100, 'millions')} (${diagnosticActif.poidsChargesPersonnelPct}% des dépenses réelles de fonctionnement)
- Épargne Brute calculée : ${formatMontant(diagnosticActif.epargneBrute, 'millions')} (Taux : ${diagnosticActif.tauxEpargneBrute} %)
- Capacité de désendettement : ${diagnosticActif.capaciteDesendettementAns} années (Seuil d'alerte CRC : 12 ans)`;
    navigator.clipboard.writeText(texte);
    setCopied(true);
    toast.success('Synthèse financière M57 copiée dans le presse-papier !');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* BANNIÈRE SUPÉRIEURE DE CONTRÔLE ET SÉLECTION (CACHÉE PAR DÉFAUT)    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* En-tête cliquable : s'ouvre au clic sur le titre */}
        <button
          type="button"
          onClick={() => setShowTableauBord(!showTableauBord)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative z-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <PieChart className="w-3.5 h-3.5" />
              <span>Tableau de Bord Graphique & Visualisations M57</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              (cliquez pour {showTableauBord ? 'replier' : 'afficher les contrôles & actes budgétaires'})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            <span className="hidden sm:inline">{showTableauBord ? 'Replier le tableau de bord' : 'Ouvrir le tableau de bord'}</span>
            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
              {showTableauBord ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Contenu dépliable au clic sur le titre */}
        {showTableauBord && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-200 dark:border-slate-800 relative z-10 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <span>Camemberts Budgétaires & Ratios Financiers</span>
                  <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/50">
                    Gennevilliers 2025-2026
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                  Analyse visuelle certifiée des ressources (recettes) et des emplois (dépenses), décomposition par chapitres M57, comparatifs pluriannuels et trajectoire de désendettement CRC.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Bascule unité millions / euros avec ForeverGooeyToggle */}
                <ForeverGooeyToggle<'millions' | 'euros'>
                  size="sm"
                  value={uniteAffichage}
                  onChange={setUniteAffichage}
                  options={[
                    { value: 'millions', label: 'En Millions (€)' },
                    { value: 'euros', label: 'En Euros précis (€)' }
                  ]}
                />

                {/* Bouton de copie rapide avec ForeverMagneticButton */}
                <ForeverMagneticButton
                  onClick={copierSynthese}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
                  <span>{copied ? 'Copié !' : 'Copier chiffres'}</span>
                </ForeverMagneticButton>
              </div>
            </div>

            {/* Sélecteur de délibération budgétaire */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Sélectionner l'acte budgétaire officiel à visualiser :</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'bp_2026', label: 'BP 2026 (250,67 M€)', badge: 'Principal Actif' },
                  { key: 'bp_2025', label: 'BP 2025 (238,28 M€)', badge: 'Historique N-1' },
                  { key: 'cfu_2024_commune', label: 'CFU 2024 Ville (20,55 M€)', badge: 'Clôture 2024' },
                  { key: 'dm1_2024', label: 'DM1 2024 (-17,34 M€)', badge: 'Déc. Modif.' },
                  { key: 'principal', label: 'BS 2026 (+16,84 M€)', badge: 'Suppléant' },
                  { key: 'restauration', label: 'Annexe Restauration (36 k€)', badge: 'Service' },
                  { key: 'cinema', label: 'Annexe Vigo 2025 (24 k€)', badge: 'Culture' },
                  { key: 'cfu_2024_cinema', label: 'CFU Vigo 2024 (745 k€)', badge: 'Clôture Vigo' }
                ].map(b => (
                  <button
                    key={b.key}
                    onClick={() => setSelectedDelibKey(b.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      selectedDelibKey === b.key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1 : LES CAMEMBERTS DES RESSOURCES & DES DÉPENSES            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <span>Camemberts Interactifs : Ressources (Recettes) vs Dépenses</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Survolez une tranche pour inspecter les détails du chapitre M57 et son poids dans l'équilibre financier
            </p>
          </div>

          {/* Filtre de section pour les camemberts avec ForeverGooeyToggle */}
          <ForeverGooeyToggle<'fonctionnement' | 'investissement' | 'consolide'>
            size="sm"
            value={sectionCamembert}
            onChange={setSectionCamembert}
            options={[
              { value: 'fonctionnement', label: 'Fonctionnement (Gestion)' },
              { value: 'investissement', label: 'Investissement (Équipement)' },
              { value: 'consolide', label: 'Total Consolidé' }
            ]}
          />
        </div>

        {/* Double grille de camemberts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ──── CAMEMBERT 1 : RESSOURCES (RECETTES) ──── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Ressources (Recettes)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total recettes :</span>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatMontant(slicesRessources.total)}
                  </div>
                </div>
              </div>

              {/* Vue SVG Donut & Centre */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <svg className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-md overflow-visible" viewBox="0 0 260 260">
                  <g transform="translate(130, 130)">
                    {slicesRessources.items.map((slice) => {
                      const isHovered = hoveredRessource?.id === slice.id;
                      const outerR = isHovered ? 116 : 108;
                      const innerR = 64;
                      const d = describeDonutSlice(0, 0, innerR, outerR, slice.startAngle, slice.endAngle);

                      return (
                        <path
                          key={slice.id}
                          d={d}
                          fill={slice.color.fill}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? '2.5' : '1.5'}
                          className="transition-all duration-150 cursor-pointer hover:opacity-95 dark:stroke-slate-900 focus:outline-none"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.45))' : 'none',
                            pointerEvents: 'auto'
                          }}
                          onMouseEnter={() => setHoveredRessource(slice)}
                          onMouseLeave={() => setHoveredRessource(null)}
                          onPointerEnter={() => setHoveredRessource(slice)}
                          onPointerLeave={() => setHoveredRessource(null)}
                          onClick={() => setHoveredRessource(hoveredRessource?.id === slice.id ? null : slice)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Chapitre ${slice.chapitre} : ${slice.libelle}, ${formatMontant(slice.montant)} (${slice.pourcentage}%)`}
                        />
                      );
                    })}

                    {/* Centre du Donut avec informations dynamiques */}
                    <circle r="60" className="fill-white dark:fill-slate-900 transition-colors pointer-events-none" />
                    <text
                      textAnchor="middle"
                      dy="-10"
                      className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-widest pointer-events-none select-none"
                    >
                      {hoveredRessource ? `Chap. ${hoveredRessource.chapitre}` : 'Ressources'}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="14"
                      className="text-base sm:text-lg font-black fill-slate-900 dark:fill-white pointer-events-none select-none"
                    >
                      {hoveredRessource ? `${hoveredRessource.pourcentage} %` : formatMontant(slicesRessources.total, 'millions')}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="32"
                      className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300 pointer-events-none select-none"
                    >
                      {hoveredRessource ? formatMontant(hoveredRessource.montant) : `${slicesRessources.items.length} chapitres`}
                    </text>
                  </g>
                </svg>

                {/* Infobulle contextuelle au survol */}
                <div className="h-10 mt-2 flex items-center justify-center text-center">
                  {hoveredRessource ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredRessource.color.fill }} />
                      <span className="font-bold">Chapitre {hoveredRessource.chapitre} :</span>
                      <span>{hoveredRessource.libelle}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">({formatMontant(hoveredRessource.montant)})</span>
                    </motion.div>
                  ) : (
                    <span className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Passez votre curseur ou cliquez sur une part pour inspecter
                    </span>
                  )}
                </div>
              </div>

              {/* Légende interactive des chapitres */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {slicesRessources.items.map((slice) => {
                  const isHovered = hoveredRessource?.id === slice.id;
                  return (
                    <div
                      key={slice.id}
                      onMouseEnter={() => setHoveredRessource(slice)}
                      onMouseLeave={() => setHoveredRessource(null)}
                      onPointerEnter={() => setHoveredRessource(slice)}
                      onPointerLeave={() => setHoveredRessource(null)}
                      onClick={() => setHoveredRessource(hoveredRessource?.id === slice.id ? null : slice)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                        isHovered
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: slice.color.fill }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">
                          Chap. {slice.chapitre}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[240px]">
                          {slice.libelle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatMontant(slice.montant)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                          {slice.pourcentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note d'analyse ressources Gennevilliers */}
            <div className="mt-4 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Point clé des ressources : </span>
                La fiscalité directe et indirecte (chapitres 73 & 731) représente le socle prépondérant des recettes avec plus de 123,6 M€, conférant une forte autonomie fiscale territoriale à Gennevilliers.
              </div>
            </div>
          </div>

          {/* ──── CAMEMBERT 2 : DÉPENSES (EMPLOIS) ──── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Dépenses (Emplois & Charges)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total dépenses :</span>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400">
                    {formatMontant(slicesDepenses.total)}
                  </div>
                </div>
              </div>

              {/* Vue SVG Donut & Centre */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <svg className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-md overflow-visible" viewBox="0 0 260 260">
                  <g transform="translate(130, 130)">
                    {slicesDepenses.items.map((slice) => {
                      const isHovered = hoveredDepense?.id === slice.id;
                      const outerR = isHovered ? 116 : 108;
                      const innerR = 64;
                      const d = describeDonutSlice(0, 0, innerR, outerR, slice.startAngle, slice.endAngle);

                      return (
                        <path
                          key={slice.id}
                          d={d}
                          fill={slice.color.fill}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? '2.5' : '1.5'}
                          className="transition-all duration-150 cursor-pointer hover:opacity-95 dark:stroke-slate-900 focus:outline-none"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(244, 63, 94, 0.45))' : 'none',
                            pointerEvents: 'auto'
                          }}
                          onMouseEnter={() => setHoveredDepense(slice)}
                          onMouseLeave={() => setHoveredDepense(null)}
                          onPointerEnter={() => setHoveredDepense(slice)}
                          onPointerLeave={() => setHoveredDepense(null)}
                          onClick={() => setHoveredDepense(hoveredDepense?.id === slice.id ? null : slice)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Chapitre ${slice.chapitre} : ${slice.libelle}, ${formatMontant(slice.montant)} (${slice.pourcentage}%)`}
                        />
                      );
                    })}

                    {/* Centre du Donut avec informations dynamiques */}
                    <circle r="60" className="fill-white dark:fill-slate-900 transition-colors pointer-events-none" />
                    <text
                      textAnchor="middle"
                      dy="-10"
                      className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-widest pointer-events-none select-none"
                    >
                      {hoveredDepense ? `Chap. ${hoveredDepense.chapitre}` : 'Dépenses'}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="14"
                      className="text-base sm:text-lg font-black fill-slate-900 dark:fill-white pointer-events-none select-none"
                    >
                      {hoveredDepense ? `${hoveredDepense.pourcentage} %` : formatMontant(slicesDepenses.total, 'millions')}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="32"
                      className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300 pointer-events-none select-none"
                    >
                      {hoveredDepense ? formatMontant(hoveredDepense.montant) : `${slicesDepenses.items.length} chapitres`}
                    </text>
                  </g>
                </svg>

                {/* Infobulle contextuelle au survol */}
                <div className="h-10 mt-2 flex items-center justify-center text-center">
                  {hoveredDepense ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredDepense.color.fill }} />
                      <span className="font-bold">Chapitre {hoveredDepense.chapitre} :</span>
                      <span>{hoveredDepense.libelle}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">({formatMontant(hoveredDepense.montant)})</span>
                    </motion.div>
                  ) : (
                    <span className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Passez votre curseur ou cliquez sur une part pour inspecter
                    </span>
                  )}
                </div>
              </div>

              {/* Légende interactive des dépenses */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {slicesDepenses.items.map((slice) => {
                  const isHovered = hoveredDepense?.id === slice.id;
                  return (
                    <div
                      key={slice.id}
                      onMouseEnter={() => setHoveredDepense(slice)}
                      onMouseLeave={() => setHoveredDepense(null)}
                      onPointerEnter={() => setHoveredDepense(slice)}
                      onPointerLeave={() => setHoveredDepense(null)}
                      onClick={() => setHoveredDepense(hoveredDepense?.id === slice.id ? null : slice)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                        isHovered
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: slice.color.fill }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">
                          Chap. {slice.chapitre}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[240px]">
                          {slice.libelle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatMontant(slice.montant)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                          {slice.pourcentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note d'analyse dépenses RH Gennevilliers */}
            <div className="mt-4 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Masse Salariale (Chapitre 012) : </span>
                Avec 96,06 M€ (62,05% des dépenses réelles de fonctionnement), elle illustre l'effort territorial constant dédié aux services municipaux, aux crèches, aux écoles et à la solidarité locale.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1 BIS : TRANSPARENCE & PÉDAGOGIE BUDGÉTAIRE (100 € DÉPENSÉS) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* En-tête pédagogique et sélecteur de base de calcul */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Transparence & Pédagogie Budgétaire</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Où vont {basePedagoCitoyen} € dépensés par la Ville en 2026 ?</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/50">
                Budget consolidé 250,67 M€
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Décomposition concrète et unitaire de chaque euro voté au Conseil municipal. Visualisez l'affectation directe des recettes publiques et des impôts locaux dans la vie quotidienne, les écoles et les grands chantiers.
            </p>
          </div>

          {/* Simulateur interactif de montant */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simuler :</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs">
              {[
                { val: 100, label: '100 € (Base unitaire)' },
                { val: 500, label: '500 €' },
                { val: 1000, label: '1 000 € (Ex. taxe)' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setBasePedagoCitoyen(opt.val)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    basePedagoCitoyen === opt.val
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Barre segmentée interactive (Stacked Bar) sur 100 % de la largeur */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Répartition unitaire sur {basePedagoCitoyen} € (100 %) :</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Total équilibré = {basePedagoCitoyen},00 €
            </span>
          </div>

          {/* Barre stacked animée */}
          <div className="h-6 sm:h-7 rounded-xl overflow-hidden flex p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
            {postes100Euros.map(p => {
              const isHovered = hoveredPoste100 === p.id;
              return (
                <div
                  key={p.id}
                  style={{ width: `${p.pourcentage}%` }}
                  onMouseEnter={() => setHoveredPoste100(p.id)}
                  onMouseLeave={() => setHoveredPoste100(null)}
                  className={`h-full transition-all duration-200 cursor-pointer relative flex items-center justify-center text-white font-mono text-[10px] font-black first:rounded-l-lg last:rounded-r-lg ${p.color.bg} ${
                    isHovered ? 'brightness-110 scale-y-105 shadow-md z-20' : 'opacity-90 hover:opacity-100'
                  }`}
                  title={`${p.titre} : ${p.montantCalcule.toFixed(2)} € (${p.pourcentage} %)`}
                >
                  {p.pourcentage >= 10 && (
                    <span className="drop-shadow-xs truncate px-1">
                      {p.pourcentage}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Micro-légende interactive des pourcentages */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            {postes100Euros.map(p => (
              <button
                key={p.id}
                onMouseEnter={() => setHoveredPoste100(p.id)}
                onMouseLeave={() => setHoveredPoste100(null)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  hoveredPoste100 === p.id
                    ? `${p.color.badge} font-bold ring-1 ring-slate-400`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${p.color.bg}`} />
                <span className="truncate max-w-[140px]">{p.titre.split('&')[0]}</span>
                <span className="font-mono font-bold">({p.pourcentage}%)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grille des 6 cartes thématiques enrichies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {postes100Euros.map(p => {
            const Icon = p.icon;
            const isHovered = hoveredPoste100 === p.id;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredPoste100(p.id)}
                onMouseLeave={() => setHoveredPoste100(null)}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isHovered
                    ? `${p.color.bgLight} ${p.color.border} shadow-md scale-[1.01]`
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Ligne d'en-tête de la carte */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl text-white ${p.color.bg} shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {p.titre}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {p.chapitre}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.color.badge} shrink-0`}>
                      {p.pourcentage} %
                    </span>
                  </div>

                  {/* Chiffre clé percutant */}
                  <div className="pt-1 flex items-baseline justify-between border-t border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Sur {basePedagoCitoyen} € :
                      </span>
                      <div className={`text-2xl font-black ${p.color.text} font-mono tracking-tight`}>
                        {p.montantCalcule.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400">Budget Ville 2026 :</span>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {p.montantGlobal}
                      </div>
                    </div>
                  </div>

                  {/* Micro barre de progression */}
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full ${p.color.bg}`} style={{ width: `${p.pourcentage}%` }} />
                  </div>

                  {/* Explication concrète */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Exemples concrets de réalisations */}
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Concrètement pour la commune :
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.exemples.map((ex, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-500" />
                        <span>{ex}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthèse citoyenne & Règle d'or de transparence */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-indigo-950 dark:text-indigo-200 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-indigo-900 dark:text-indigo-100">
                L'essentiel à retenir sur l'utilisation des deniers publics à Gennevilliers :
              </span>
              <p className="text-[11px] text-indigo-800/90 dark:text-indigo-300/90 mt-0.5">
                Plus de <strong>60 € sur 100 €</strong> sont directement consacrés aux services aux habitants (écoles, petite enfance, voirie) et à la construction d'équipements pérennes. La dette ne pèse que <strong>4,54 €</strong> (dont 0,70 € seulement d'intérêts), garantissant la solvabilité de la collectivité.
              </p>
            </div>
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Autonomie financière</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">95,46 %</span>
            <span className="text-[9px] text-slate-400 block">hors charge de dette</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2 : COMPARATIF PLURIANNUEL GRAPHIQUE (2024 vs 2025 vs 2026)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analyse Pluriannuelle Certifiée (3 Exercices)</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Comparatif Graphique : 2024 vs 2025 vs 2026</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Trajectoire financière triennale : 2024 (226,71 M€) ➔ BP 2025 (238,28 M€) ➔ BP 2026 (250,67 M€, +10,57 %)
            </p>
          </div>

          {/* Filtres de la vue comparative */}
          {/* Filtres de la vue comparative avec ForeverGooeyToggle */}
          <ForeverGooeyToggle<'agregats' | 'fonctionnement' | 'investissement'>
            size="sm"
            value={comparatifFiltre === 'tous' ? 'agregats' : comparatifFiltre}
            onChange={(val) => setComparatifFiltre(val)}
            options={[
              { value: 'agregats', label: 'Grands Agrégats' },
              { value: 'fonctionnement', label: 'Dépenses Gestion' },
              { value: 'investissement', label: 'Investissement & PPI' }
            ]}
          />
        </div>

        {/* 3 Cartes de totaux comparatifs triennaux */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/40 dark:to-slate-800/40 border border-indigo-200 dark:border-indigo-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Total Budget Équilibré
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  250,67 M€ (2026)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  2024: 226,71 M€ • 2025: 238,28 M€
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +10,57 %
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/40 dark:from-sky-950/40 dark:to-slate-800/40 border border-sky-200 dark:border-sky-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Section Fonctionnement
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  168,15 M€ (2026)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  2024: 170,04 M€ • 2025: 171,30 M€
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                -1,11 %
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/40 dark:from-purple-950/40 dark:to-slate-800/40 border border-purple-200 dark:border-purple-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Section Investissement
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  82,52 M€ (2026)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  2024: 56,67 M€ • 2025: 66,98 M€
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +45,61 %
              </span>
            </div>
          </div>
        </div>

        {/* Barres graphiques comparatives triennales : 2 blocs par ligne */}
        <div className="pt-2">
          {comparatifFiltre === 'agregats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'Masse Salariale & Personnel (Chap. 012)',
                  val24: 88500000.00,
                  val25: 91397205.00,
                  val26: 96063865.00,
                  color: 'from-rose-500 to-rose-600',
                  commentaire: 'Progression continue : GVT statutaire, revalorisation du point d’indice et renfort des services municipaux (+8,5 % sur 2 ans)'
                },
                {
                  label: 'Charges Générales & Fluides (Chap. 011)',
                  val24: 39500000.00,
                  val25: 41126918.97,
                  val26: 41058892.92,
                  color: 'from-amber-500 to-amber-600',
                  commentaire: 'Maîtrise remarquable et stabilisation des coûts après le choc énergétique de 2023-2024'
                },
                {
                  label: 'Subventions & CCAS (Chap. 65)',
                  val24: 14200000.00,
                  val25: 14803771.43,
                  val26: 15754288.25,
                  color: 'from-purple-500 to-purple-600',
                  commentaire: 'Soutien amplifié au tissu associatif gennevillois et aux politiques de solidarité communale (+10,9 %)'
                },
                {
                  label: 'Équipements & Chantiers Municipaux (Chap. 21 + 23)',
                  val24: 49090000.00,
                  val25: 43451658.00,
                  val26: 53868283.00,
                  color: 'from-blue-500 to-blue-600',
                  commentaire: 'Accélération majeure des investissements en 2026 (53,87 M€) : rénovation thermique des écoles, Agnettes et Chanteraines'
                },
                {
                  label: 'Fiscalité Directe & Impôts Locaux (Chap. 73 + 731)',
                  val24: 120500000.00,
                  val25: 124435640.00,
                  val26: 123622709.00,
                  color: 'from-teal-500 to-teal-600',
                  commentaire: 'Stabilité des ressources fiscales avec maintien des taux après le rattrapage de 2024'
                },
                {
                  label: 'Dotations & Participations de l’État (Chap. 74)',
                  val24: 31200000.00,
                  val25: 30380700.00,
                  val26: 27757477.00,
                  color: 'from-sky-500 to-sky-600',
                  commentaire: 'Érosion continue des dotations de l’État (-11,0 % en 2 ans) compensée par la gestion locale'
                }
              ].map((item, idx) => {
                const maxVal = Math.max(item.val24, item.val25, item.val26) * 1.15;
                const pct24 = (item.val24 / maxVal) * 100;
                const pct25 = (item.val25 / maxVal) * 100;
                const pct26 = (item.val26 / maxVal) * 100;
                const deltaEurosTriennal = item.val26 - item.val24;
                const deltaPctTriennal = Math.round(((deltaEurosTriennal / item.val24) * 100) * 10) / 10;
                const isPositive = deltaPctTriennal >= 0;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                        {item.label}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{deltaPctTriennal}% ({formatMontant(deltaEurosTriennal)})
                        </span>
                      </div>
                    </div>

                    {/* 3 Barres comparatives superposées : 2024, 2025, 2026 */}
                    <div className="space-y-1.5 pt-1">
                      {/* Ligne 2024 */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-mono text-[11px] text-slate-500 shrink-0">
                          2024
                        </span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct24}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.04 }}
                            className="h-full bg-slate-400/80 dark:bg-slate-500/80 rounded-full"
                          />
                        </div>
                        <span className="w-24 text-right font-mono text-[11px] text-slate-500 shrink-0">
                          {formatMontant(item.val24)}
                        </span>
                      </div>

                      {/* Ligne 2025 */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-mono font-medium text-slate-600 dark:text-slate-400 shrink-0">
                          2025
                        </span>
                        <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct25}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className="h-full bg-slate-500 dark:bg-slate-400 rounded-full"
                          />
                        </div>
                        <span className="w-24 text-right font-mono text-slate-700 dark:text-slate-300 shrink-0 font-medium">
                          {formatMontant(item.val25)}
                        </span>
                      </div>

                      {/* Ligne 2026 */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-mono font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                          2026
                        </span>
                        <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct26}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.07 }}
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-xs`}
                          />
                        </div>
                        <span className="w-24 text-right font-mono font-black text-slate-900 dark:text-white shrink-0">
                          {formatMontant(item.val26)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      💡 {item.commentaire}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {comparatifFiltre === 'fonctionnement' && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 pb-1">
                Détail chapitre par chapitre des dépenses de fonctionnement :
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comparatifData.depensesFonctionnement.map((row, i) => {
                  const max = Math.max(row.montant2025, row.montant2026) * 1.1 || 1;
                  const isPos = (row.deltaPct ?? 0) >= 0;

                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] shrink-0">
                            Chap. {row.chapitre}
                          </span>
                          <span className="truncate">{row.libelle}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">2025 : {formatMontant(row.montant2025)}</div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">{formatMontant(row.montant2026)}</div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isPos
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {row.deltaPct !== null ? `${isPos ? '+' : ''}${row.deltaPct}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {comparatifFiltre === 'investissement' && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 pb-1">
                Détail chapitre par chapitre des dépenses d'investissement :
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comparatifData.depensesInvestissement.map((row, i) => {
                  const isPos = (row.deltaPct ?? 0) >= 0;

                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] shrink-0">
                            Chap. {row.chapitre}
                          </span>
                          <span className="truncate">{row.libelle}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">2025 : {formatMontant(row.montant2025)}</div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">{formatMontant(row.montant2026)}</div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isPos
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {row.deltaPct !== null ? `${isPos ? '+' : ''}${row.deltaPct}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ──── TABLEAU DE TRAJECTOIRE FINANCIÈRE TRI-ANNUELLE 2024 ➔ 2025 ➔ 2026 ──── */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Trajectoire Financière Triennale Certifiée (2024 · 2025 · 2026)
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Sources : Délib. DM1 2024 n°2, CFU 2024 n°4, BP 2025 & BP 2026 n°2026/S1/001
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Agrégat Budgétaire Stratégique</th>
                  <th className="p-3 text-right">Exercice 2024 (Exécution)</th>
                  <th className="p-3 text-right">Exercice 2025 (BP Révisé)</th>
                  <th className="p-3 text-right">Exercice 2026 (BP Voté)</th>
                  <th className="p-3 text-right">Évolution 2024 ➔ 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                    🎯 Budget Total Équilibré
                  </td>
                  <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                    226,71 M€
                  </td>
                  <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                    238,28 M€
                  </td>
                  <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    250,67 M€
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +10,57 % (+23,96 M€)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200 pl-6">
                    • Section de Fonctionnement (Gestion)
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    170,04 M€
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    171,30 M€
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    168,15 M€
                  </td>
                  <td className="p-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                    -1,11 % (Maîtrise stricte)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200 pl-6">
                    • Section d'Investissement (Équipement)
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    56,67 M€
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    66,98 M€
                  </td>
                  <td className="p-3 text-right font-bold text-purple-600 dark:text-purple-400">
                    82,52 M€
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +45,61 % (+25,85 M€)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-rose-50/30 dark:bg-rose-950/20">
                  <td className="p-3 font-sans font-bold text-rose-700 dark:text-rose-300">
                    👨‍💼 Masse Salariale & Personnel (Chap. 012)
                  </td>
                  <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-semibold">
                    88,50 M€
                  </td>
                  <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-semibold">
                    91,40 M€
                  </td>
                  <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                    96,06 M€
                  </td>
                  <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    +8,54 % (GVT & primes)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                    🏗️ Chantiers & Équipements Bruts (Chap. 21 + 23)
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    49,09 M€
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    43,45 M€
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    53,87 M€
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +9,74 % (Pic du mandat)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-emerald-50/40 dark:bg-emerald-950/25">
                  <td className="p-3 font-sans font-bold text-emerald-800 dark:text-emerald-300">
                    ✨ Épargne Brute Dégagée (Autofinancement)
                  </td>
                  <td className="p-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">
                    +21,37 M€
                  </td>
                  <td className="p-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">
                    +21,73 M€
                  </td>
                  <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    +13,32 M€
                  </td>
                  <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                    Taux : 7,92 % (Amortissement chocs)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                    🏦 Encours Dette au 31/12
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    80,42 M€
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    68,50 M€
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    72,40 M€
                  </td>
                  <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    -9,97 % (Désendettement net)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                    ⏱️ Délai de Désendettement
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    4,49 ans
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                    3,15 ans
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    5,44 ans
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    Conforme CRC (&lt; 10 ans)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3 : JAUGES DES RATIOS M57 & SEUILS CRC                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Grille de Régulation & Chambres Régionales des Comptes</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Jauges Ratios M57 & Zones de Sécurité Financière</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Évaluation dynamique de la solvabilité de Gennevilliers selon les normes officielles de la DGCL et de la CRC
            </p>
          </div>

          {onInjectIntoRatios && (
            <button
              onClick={() => onInjectIntoRatios(selectedDelibKey)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Simuler dans le calculateur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grille des 4 indicateurs et jauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* JAUGE 1 : CAPACITÉ DE DÉSENDETTEMENT */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Capacité de Désendettement
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {diagnosticActif.capaciteDesendettementAns !== null
                    ? `${diagnosticActif.capaciteDesendettementAns} ans`
                    : 'N/A'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60">
                Situation Saine (&lt; 8 ans)
              </span>
            </div>

            {/* Barre de seuil avec zones de couleurs */}
            <div className="space-y-1.5">
              <div className="relative h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex">
                <div className="w-[53%] bg-emerald-500" title="Zone saine (< 8 ans)" />
                <div className="w-[13%] bg-amber-400" title="Zone de vigilance (8-10 ans)" />
                <div className="w-[14%] bg-orange-500" title="Zone d'alerte (10-12 ans)" />
                <div className="w-[20%] bg-red-600" title="Seuil critique (> 12 ans)" />
              </div>

              {/* Repères chiffrés */}
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                <span>0 an</span>
                <span className="text-emerald-600 font-bold">8 ans (Confort)</span>
                <span className="text-amber-600 font-bold">10 ans</span>
                <span className="text-red-600 font-bold">12 ans (Alerte CRC)</span>
                <span>15+ ans</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              L’encours total de la dette peut être intégralement amorti en moins de 8 années d'autofinancement brut, maintenant la commune très en dessous du seuil critique CRC de 12 ans.
            </p>
          </div>

          {/* JAUGE 2 : TAUX D'ÉPARGNE BRUTE */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Taux d'Épargne Brute (Autofinancement)
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {diagnosticActif.tauxEpargneBrute !== null ? `${diagnosticActif.tauxEpargneBrute} %` : 'N/A'}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                (diagnosticActif.tauxEpargneBrute ?? 0) >= 10
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/60'
                  : (diagnosticActif.tauxEpargneBrute ?? 0) >= 8
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300/60'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300/60'
              }`}>
                {(diagnosticActif.tauxEpargneBrute ?? 0) >= 8 ? 'Conforme CRC' : 'Sous Vigilance'}
              </span>
            </div>

            {/* Barre de jauge */}
            <div className="space-y-1.5">
              <div className="relative h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((diagnosticActif.tauxEpargneBrute ?? 0) / 20) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                <span>0 %</span>
                <span className="text-red-500 font-bold">Alerte CRC &lt; 8%</span>
                <span className="text-amber-500 font-bold">10% Cible</span>
                <span className="text-emerald-500 font-bold">15%+ Excellent</span>
                <span>20 %</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              L’autofinancement brut dégagé ({formatMontant(diagnosticActif.epargneBrute)}) permet de payer le capital de la dette ({formatMontant(diagnosticActif.capitalDette)}) avec une épargne nette positive.
            </p>
          </div>

          {/* JAUGE 3 : POIDS DE LA MASSE SALARIALE */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Part de la Masse Salariale (Chap. 012 / DRF)
                </span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {diagnosticActif.poidsChargesPersonnelPct !== null ? `${diagnosticActif.poidsChargesPersonnelPct} %` : '62.0 %'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold border border-indigo-300/60">
                Régie Municipale Forte
              </span>
            </div>

            {/* Barre de jauge */}
            <div className="space-y-1.5">
              <div className="relative h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${diagnosticActif.poidsChargesPersonnelPct || 62}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                <span>0 %</span>
                <span>50% (Moyenne nat.)</span>
                <span className="font-bold text-rose-500">62% (Gennevilliers)</span>
                <span>80 %</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Choix politique de gestion directe des services à la population (restauration scolaire, centres de loisirs, crèches, propreté, police municipale).
            </p>
          </div>

          {/* JAUGE 4 : EFFORT D'INVESTISSEMENT RÉEL */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Équipements Bruts Réels (Chap. 21 + 23)
                </span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  53,87 M€
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold border border-blue-300/60">
                65,3% de la Section
              </span>
            </div>

            {/* Barre de jauge */}
            <div className="space-y-1.5">
              <div className="relative h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65.3%' }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                <span>0 %</span>
                <span>35% (Moyenne)</span>
                <span className="font-bold text-blue-500">65,3% (PPI Gennevilliers)</span>
                <span>100 %</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Le programme pluriannuel d'investissement (PPI) consacre près des deux tiers de ses crédits aux réalisations matérielles et chantiers scolaires/urbains.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3 BIS : CASCADE D'AUTOFINANCEMENT M57 (WATERFALL)          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Diagramme en Cascade M57 (Autofinancement)</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              De la Recette de Gestion à l'Épargne Nette
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Comment se forme l'autofinancement réel qui finance les investissements sans emprunter :
            </p>
          </div>
        </div>

        {/* Étapes de la cascade visuelle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            {/* Étape 1 : Recettes Réelles de Fonctionnement (RRF) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  1. Recettes Réelles de Gestion (RRF)
                </span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatMontant(diagnosticActif.rrf)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>
            </div>

            {/* Étape 2 : Dépenses Réelles de Fonctionnement (DRF) */}
            <div className="space-y-1 pl-3 border-l-2 border-dashed border-rose-300 dark:border-rose-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  — Dépenses Réelles de Gestion (DRF)
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  -{formatMontant(diagnosticActif.drf)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (diagnosticActif.drf / (diagnosticActif.rrf || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                Dont masse salariale (012) : 96,06 M€ & charges courantes (011) : 41,06 M€
              </div>
            </div>

            {/* Étape 3 : Épargne Brute résultante */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/80 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  = Épargne Brute (Autofinancement Brut)
                </span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                  +{formatMontant(diagnosticActif.epargneBrute)}
                </span>
              </div>
              <div className="text-[10px] text-emerald-800 dark:text-emerald-300/90">
                Taux d'épargne brute de {diagnosticActif.tauxEpargneBrute ?? '8.0'} % (Seuil de sécurité CRC &gt; 8 %)
              </div>
            </div>

            {/* Étape 4 : Remboursement du capital de la dette */}
            <div className="space-y-1 pl-3 border-l-2 border-dashed border-orange-300 dark:border-orange-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  — Remboursement Annuité Dette (Capital)
                </span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                  -{formatMontant(diagnosticActif.capitalDette)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, (diagnosticActif.capitalDette / (diagnosticActif.epargneBrute || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Étape 5 : Épargne Nette finale */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              diagnosticActif.epargneNette >= 0
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300/80 dark:border-blue-700/80 text-blue-900 dark:text-blue-200'
                : 'bg-red-50/80 dark:bg-red-950/40 border-red-300/80 dark:border-red-700/80 text-red-900 dark:text-red-200'
            }`}>
              <div>
                <div className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>= Épargne Nette (Financement direct chantiers)</span>
                </div>
                <div className="text-[10px] text-blue-800 dark:text-blue-300/90 mt-0.5">
                  Excédent propre disponible sans nouvel endettement
                </div>
              </div>
              <div className="font-mono font-black text-base text-blue-700 dark:text-blue-300">
                +{formatMontant(diagnosticActif.epargneNette)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Règle d'or de la comptabilité M57</span>
              </div>
              <p>
                L'épargne brute positive (+13,32 M€) absorbe la totalité de l'échéance en capital de la dette (+9,63 M€), dégageant une marge d'investissement nette sécurisante pour la Ville.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between">
                <span>Couverture annuité capital :</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">138,3 %</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Effet levier sur l'investissement : </span>
                L'épargne nette positive de 3,70 M€ est directement injectée au chapitre 021 pour financer en fonds propres les équipements publics sans alourdir la dette.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3 TER : OBSERVATOIRE DE L'ENDETTEMENT & CHARGE DE LA DETTE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-1.5">
              <Landmark className="w-3.5 h-3.5" />
              <span>Audit & Soutenabilité de la Dette (M57 & Charte Gissler 1A)</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Observatoire de la Dette : Encours, Taux d'Intérêt & Annuité</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Trajectoire de l'encours au 31/12, structure par type de taux (fixe vs variable), et coût annuel réel du crédit
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100 % Produits Sans Risque (1A Gissler)</span>
            </span>
          </div>
        </div>

        {/* 4 Indicateurs Clés de la Dette Gennevilloise */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Encours Dette au 31/12
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatMontant(diagnosticActif.encoursDette)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Dette par hab. : ~1 414 € (Inférieur à la moyenne strate 92)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Taux Moyen Global
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              2,09 %
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              Fixe à 1,36 % (57,8 M€) • Variable à 3,65 %
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Annuité Totale (Capital + Intérêts)
            </span>
            <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
              {formatMontant(diagnosticActif.capitalDette + 1750000)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Capital : {formatMontant(diagnosticActif.capitalDette)} • Intérêts : 1,75 M€
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Durée Résiduelle Moyenne
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              11 ans 10 mois
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              50% remboursé en 2029 • Extinction en 2043
            </div>
          </div>
        </div>

        {/* Double panneau graphique : Répartition par taux & Évolution pluriannuelle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PANNEAU A : STRUCTURE PAR TYPE DE TAUX & PRÊTEURS */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-cyan-500" />
                <span>Structure du Capital Restant Dû par Taux</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Source : ROB 2025 Ville</span>
            </div>

            {/* Barre segmentée visuelle du type de taux */}
            <div className="space-y-1.5">
              <div className="h-6 rounded-xl overflow-hidden flex shadow-xs border border-slate-200 dark:border-slate-700">
                <div
                  style={{ width: '68.6%' }}
                  className="bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center text-[10px] font-black text-white cursor-pointer"
                  title="Taux fixe : 68,6 % (57,76 M€) — Taux moyen sécurisé à 1,36 %"
                >
                  Fixe 68,6 %
                </div>
                <div
                  style={{ width: '23.6%' }}
                  className="bg-sky-500 hover:bg-sky-600 transition-colors flex items-center justify-center text-[10px] font-black text-white cursor-pointer"
                  title="Indexé Livret A : 23,6 % (14,00 M€)"
                >
                  Livret A 23,6 %
                </div>
                <div
                  style={{ width: '7.8%' }}
                  className="bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center text-[9px] font-black text-white cursor-pointer"
                  title="Taux variable classique : 7,8 % (4,00 M€)"
                >
                  Var. 7,8%
                </div>
              </div>

              <div className="flex flex-wrap justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Taux Fixe : 68,6 % (1,36 % moy.)
                </span>
                <span className="flex items-center gap-1 text-sky-700 dark:text-sky-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Index Livret A : 23,6 %
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Variable Euribor : 7,8 %
                </span>
              </div>
            </div>

            {/* Répartition par prêteurs institutionnels */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Principaux Établissements Prêteurs (Partenaires Publics) :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">AFL (Banque Publique)</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">36 %</div>
                  <div className="text-[10px] text-slate-500">Ville actionnaire fondateur</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Caisse d'Épargne</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">23 %</div>
                  <div className="text-[10px] text-slate-500">Prêts classiques & fixes</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">SFIL Banque Postale</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">14 %</div>
                  <div className="text-[10px] text-slate-500">Financement territorial</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Arkéa Banque</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">11 %</div>
                  <div className="text-[10px] text-slate-500">Lignes d'équipement</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Caisse des Dépôts</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">9 %</div>
                  <div className="text-[10px] text-slate-500">Prêts sur fonds d'épargne</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Autres banques</div>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">7 %</div>
                  <div className="text-[10px] text-slate-500">Société Générale, Dexia</div>
                </div>
              </div>
            </div>
          </div>

          {/* PANNEAU B : HISTORIQUE ET SOUTENABILITÉ (2022 ➔ 2027 PROSPECTIVE) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Trajectoire de l'Encours & Délai de Désendettement</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">2022 ➔ 2027</span>
              </div>

              {/* Barres historiques et prévisionnelles */}
              <div className="space-y-2 mt-3">
                {[
                  { annee: '2022', encours: 74.2, ratio: 3.27, statut: 'excellent' },
                  { annee: '2023', encours: 82.5, ratio: 4.86, statut: 'excellent' },
                  { annee: '2024', encours: 80.4, ratio: 4.49, statut: 'excellent' },
                  { annee: '2025 (BP)', encours: 68.5, ratio: 3.15, statut: 'excellent' },
                  { annee: '2026 (BP)', encours: 72.4, ratio: 5.44, statut: 'excellent' },
                  { annee: '2027 (Proj.)', encours: 152.0, ratio: 8.32, statut: 'vigilance' },
                ].map((row, idx) => {
                  const maxEncours = 160;
                  const pctWidth = (row.encours / maxEncours) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {row.annee}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {row.encours.toFixed(1)} M€
                          </span>
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] font-mono ${
                            row.ratio < 6
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {row.ratio} ans
                          </span>
                        </div>
                      </div>

                      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pctWidth}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.04 }}
                          className={`h-full rounded-full ${
                            row.annee.includes('2026')
                              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                              : row.annee.includes('2027')
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-slate-400 dark:bg-slate-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 text-[11px] text-cyan-900 dark:text-cyan-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zéro prêt toxique :</strong> La quasi-totalité de la dette à taux fixe a été contractée lors de la période de taux bas (1,36 %). Malgré la remontée des taux de la BCE, le ratio de désendettement (5,44 ans) reste très sécurisé et moitié inférieur au plafond d'alerte de la Chambre Régionale des Comptes (12 ans).
              </span>
            </div>
          </div>

        </div>
      </div>
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base">
              Approfondir l'analyse financière & juridique M57
            </h4>
            <p className="text-xs text-slate-400">
              Accédez aux textes intégraux des délibérations, au simulateur de prospective financière, ou au dossier des 14 pièces de contrôle CRC.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToTab && (
            <>
              <ForeverMagneticButton
                onClick={() => onNavigateToTab('deliberations')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all border border-slate-700 shadow-xs"
              >
                📜 Actes & Délibérations
              </ForeverMagneticButton>
              <ForeverMagneticButton
                onClick={() => onNavigateToTab('ratios')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/25"
                glowColor="rgba(99, 102, 241, 0.6)"
              >
                🧮 Simulateur M57
              </ForeverMagneticButton>
              <ForeverMagneticButton
                onClick={() => onNavigateToTab('pieces')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all border border-slate-700 shadow-xs"
              >
                📑 Pièces CRC
              </ForeverMagneticButton>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
