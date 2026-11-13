/**
 * Moteur d'Analyse Financière M57 & Ratios de Gestion Territoriale
 * Conforme à l'instruction budgétaire et comptable M57 (DGCL)
 * et aux seuils de contrôle des Chambres Régionales des Comptes (CRC)
 *
 * Formules officielles :
 * - Épargne Brute (Autofinancement brut) = RRF - DRF
 * - Épargne Nette = Épargne Brute - Remboursement Capital Dette
 * - Taux d'Épargne Brute (%) = (Épargne Brute / RRF) * 100
 * - Capacité de Désendettement (années) = Encours Dette / Épargne Brute
 */

export interface BudgetM57Input {
  collectiviteNom: string;
  typeCollectivite: 'commune' | 'epci' | 'departement' | 'region';
  population?: number;
  exercice: number; // ex: 2025 ou 2026
  base: 'prevision' | 'execution';
  // 4 agrégats M57 fondamentaux
  recettesReellesFonctionnement: number; // RRF (chapitre 70, 73, 74...)
  depensesReellesFonctionnement: number; // DRF (chapitres 011, 012, 65...)
  remboursementCapitalDette: number; // Chapitre 16 amortissement capital
  encoursDetteFinExercice: number; // Dette au 31/12
  // Agrégats complémentaires utiles (optionnels)
  depensesPersonnel012?: number; // Chapitre 012 charges de personnel
  depensesReellesInvestissement?: number; // DRI (hors dette)
}

export interface RatioStatus {
  niveau: 'excellent' | 'bon' | 'vigilance' | 'alerte' | 'critique';
  badgeColor: string;
  message: string;
  recommandation: string;
}

export interface BudgetM57Result {
  collectiviteNom: string;
  exercice: number;
  base: 'prevision' | 'execution';
  // Données de base
  rrf: number;
  drf: number;
  capitalDette: number;
  encoursDette: number;
  // Indicateurs clés M57
  epargneBrute: number;
  epargneNette: number;
  tauxEpargneBrute: number | null; // %
  capaciteDesendettementAns: number | null; // Années
  poidsChargesPersonnelPct: number | null; // Chapitre 012 / DRF en %
  // Diagnostics & seuils CRC
  diagnosticEpargne: RatioStatus;
  diagnosticDesendettement: RatioStatus;
  diagnosticGlobal: {
    statut: 'sain' | 'favorable' | 'sous_surveillance' | 'risque_tutelle';
    titre: string;
    description: string;
    pointsVigilance: string[];
  };
}

export interface ChapitreMouvement {
  nature: 'REEL' | 'ORDRE';
  chapitre: string;
  libelle: string;
  montantBS2026: number;
  reports2025?: number;
  totalBS?: number;
}

export interface DeliberationBudgetInfo {
  id: string;
  numeroDelib: string;
  titre: string;
  budgetType: 'bp_2026' | 'bp_2025' | 'principal' | 'annexe_restauration' | 'annexe_cinema';
  dateConseil: string;
  dateTransmissionPrefecture: string;
  chaineIntegrite: string;
  arPrefecture: string;
  maire: string;
  secretaireSeance?: string;
  votesPour: number;
  votesContre: number;
  votesAbstention?: number;
  typeVote: 'unanimite' | 'majorite';
  montantTotalEquilibre: number;
  sectionFonctionnementTotal: number;
  sectionInvestissementTotal: number;
  cfu2025?: {
    fonctionnementResultatCumule: number;
    investissementResultatCumule: number;
    restesARealiserDepenses: number;
    restesARealiserRecettes: number;
    besoinNetFinancement: number;
    affectationCompte1068: number;
    affectationLigneR002: number;
    affectationLigneD001?: number;
    affectationLigneR001?: number;
  };
  depensesFonctionnement: ChapitreMouvement[];
  recettesFonctionnement: ChapitreMouvement[];
  depensesInvestissement: ChapitreMouvement[];
  recettesInvestissement: ChapitreMouvement[];
  pointsClesJuridiques: string[];
  detailsVote?: {
    quorumTexte?: string;
    votantsTotal?: number;
    contreNoms?: string[];
    abstentionNoms?: string[];
  };
  delegationArticle2?: string;
  delaiRecours?: string;
}

export const DELIBERATIONS_GENNEVILLIERS_2026: Record<string, DeliberationBudgetInfo> = {
  bp_2026: {
    id: 'bp_2026',
    numeroDelib: 'Délibération n°2026/S1/001',
    titre: 'Vote du Budget Primitif 2026 de la Commune (250,67 M€)',
    budgetType: 'bp_2026',
    dateConseil: '4 février 2026',
    dateTransmissionPrefecture: '10 février 2026',
    chaineIntegrite: '0B 57 E3 DD 19 FF FA 5A DD F0 12 85 D4 45 84 87',
    arPrefecture: '092-219200367-20260209-deliberation1-DE',
    maire: 'Patrice LECLERC',
    secretaireSeance: 'Khalid DAMOUN',
    votesPour: 35,
    votesContre: 1,
    votesAbstention: 1,
    typeVote: 'majorite',
    detailsVote: {
      quorumTexte: "Quorum atteint (Art. L.2121-17 CGCT) — 29 présents, 8 représentés, 6 absents excusés",
      votantsTotal: 37,
      contreNoms: ["Laëtitia GHIRARDI"],
      abstentionNoms: ["Sinan KARAKUS"]
    },
    delegationArticle2: "Autorise Monsieur le Maire à procéder à des mouvements de crédits de chapitre à chapitre (hors personnel et concours aux associations) dans une limite de 7,5 % des dépenses réelles de chaque section à compter du 1er janvier 2026.",
    delaiRecours: "Recours pour excès de pouvoir (REP) devant le Tribunal administratif de Cergy-Pontoise dans un délai de 2 mois à compter de la publication.",
    montantTotalEquilibre: 250668105.30,
    sectionFonctionnementTotal: 168150735.30,
    sectionInvestissementTotal: 82517370.00,
    depensesFonctionnement: [
      { nature: 'ORDRE', chapitre: '023', libelle: "Virement à la section d'investissement", montantBS2026: 2452764.65, totalBS: 2452764.65 },
      { nature: 'ORDRE', chapitre: '042', libelle: "Opérations d'ordre de transfert entre sections", montantBS2026: 10869724.48, totalBS: 10869724.48 },
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: 41058892.92, totalBS: 41058892.92 },
      { nature: 'REEL', chapitre: '012', libelle: 'Charges de personnel et frais assimilés', montantBS2026: 96063865.00, totalBS: 96063865.00 },
      { nature: 'REEL', chapitre: '65', libelle: 'Autres charges de gestion courante', montantBS2026: 15754288.25, totalBS: 15754288.25 },
      { nature: 'REEL', chapitre: '66', libelle: 'Charges financières (intérêts dette)', montantBS2026: 1750000.00, totalBS: 1750000.00 },
      { nature: 'REEL', chapitre: '67', libelle: 'Charges spécifiques', montantBS2026: 201200.00, totalBS: 201200.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '013', libelle: 'Atténuations de charges', montantBS2026: 935000.00, totalBS: 935000.00 },
      { nature: 'REEL', chapitre: '70', libelle: 'Produits des services, domaine et ventes diverses', montantBS2026: 11284661.00, totalBS: 11284661.00 },
      { nature: 'REEL', chapitre: '731', libelle: 'Fiscalité locale', montantBS2026: 56456741.00, totalBS: 56456741.00 },
      { nature: 'REEL', chapitre: '73', libelle: 'Impôts et taxes', montantBS2026: 67165968.00, totalBS: 67165968.00 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: 27757477.00, totalBS: 27757477.00 },
      { nature: 'REEL', chapitre: '75', libelle: 'Autres produits de gestion courante', montantBS2026: 4350888.30, totalBS: 4350888.30 },
      { nature: 'REEL', chapitre: '77', libelle: 'Produits spécifiques', montantBS2026: 200000.00, totalBS: 200000.00 },
    ],
    depensesInvestissement: [
      { nature: 'ORDRE', chapitre: '041', libelle: 'Opérations patrimoniales', montantBS2026: 2000000.00, totalBS: 2000000.00 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées (remboursement capital)', montantBS2026: 9626700.00, totalBS: 9626700.00 },
      { nature: 'REEL', chapitre: '204', libelle: "Subventions d'équipement versées", montantBS2026: 11356002.00, totalBS: 11356002.00 },
      { nature: 'REEL', chapitre: '20', libelle: 'Immobilisations incorporelles', montantBS2026: 4776385.00, totalBS: 4776385.00 },
      { nature: 'REEL', chapitre: '21', libelle: 'Immobilisations corporelles (équipements)', montantBS2026: 26790927.00, totalBS: 26790927.00 },
      { nature: 'REEL', chapitre: '23', libelle: 'Immobilisations en cours (chantiers pluriannuels)', montantBS2026: 27077356.00, totalBS: 27077356.00 },
      { nature: 'REEL', chapitre: '27', libelle: 'Autres immobilisations financières', montantBS2026: 650000.00, totalBS: 650000.00 },
      { nature: 'REEL', chapitre: '45', libelle: 'Opérations pour compte de tiers', montantBS2026: 240000.00, totalBS: 240000.00 },
    ],
    recettesInvestissement: [
      { nature: 'ORDRE', chapitre: '041', libelle: 'Opérations patrimoniales', montantBS2026: 2000000.00, totalBS: 2000000.00 },
      { nature: 'ORDRE', chapitre: '021', libelle: 'Virement de la section de fonctionnement', montantBS2026: 2452764.65, totalBS: 2452764.65 },
      { nature: 'ORDRE', chapitre: '040', libelle: "Opérations d'ordre de transfert entre sections", montantBS2026: 10869724.48, totalBS: 10869724.48 },
      { nature: 'REEL', chapitre: '024', libelle: "Produits des cessions d'immobilisations", montantBS2026: 2640000.00, totalBS: 2640000.00 },
      { nature: 'REEL', chapitre: '10', libelle: 'Dotations, fonds divers et réserves (FCTVA, TLE)', montantBS2026: 5989673.00, totalBS: 5989673.00 },
      { nature: 'REEL', chapitre: '13', libelle: "Subventions d'investissement", montantBS2026: 13276991.65, totalBS: 13276991.65 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées', montantBS2026: 45048216.22, totalBS: 45048216.22 },
      { nature: 'REEL', chapitre: '45', libelle: 'Opérations pour compte de tiers', montantBS2026: 240000.00, totalBS: 240000.00 },
    ],
    pointsClesJuridiques: [
      "Budget Primitif 2026 voté le 4 février 2026 équilibré à 250 668 105,30 € (hausse de +5,20 % par rapport au BP 2025).",
      "Section d'investissement majeure à 82,52 M€ (+23,20 %) avec 53,87 M€ de travaux d'équipement (chapitres 21 et 23).",
      "Charges de personnel (012) à 96,06 M€ (62,05 % des dépenses réelles de gestion), reflétant le maintien du service public territorial.",
      "Autofinancement brut dégagé : 13,32 M€ d'épargne brute permettant de couvrir l'annuité en capital (9,63 M€) avec une épargne nette positive (+3,70 M€).",
      "Adopté à la majorité (35 pour, 1 contre, 1 abstention), télétransmis le 10/02/2026 (AR 092-219200367-20260209-deliberation1-DE)."
    ],
  },
  bp_2025: {
    id: 'bp_2025',
    numeroDelib: 'Délibération du 12 février 2025',
    titre: 'Vote du Budget Primitif 2025 de la Commune (238,28 M€)',
    budgetType: 'bp_2025',
    dateConseil: '12 février 2025',
    dateTransmissionPrefecture: '17 février 2025',
    chaineIntegrite: 'E7 B8 9F 94 59 77 9E 01 3C 33 C6 81 9E C7 19 4D',
    arPrefecture: '092-219200367-20250217-delib1-2025-DE',
    maire: 'Patrice LECLERC',
    votesPour: 35,
    votesContre: 0,
    votesAbstention: 3,
    typeVote: 'unanimite',
    detailsVote: {
      quorumTexte: "Quorum atteint (Art. L.2121-17 CGCT) — 26 présents, 11 représentés, 5 absents excusés",
      votantsTotal: 38,
      contreNoms: [],
      abstentionNoms: ["Laëtitia GHIRARDI", "Sinan KARUKUS", "Christelle NEDELEC (représentée par Sinan KARAKUS)"]
    },
    delegationArticle2: "Autorise Monsieur le Maire à procéder à des mouvements de crédits de chapitre à chapitre (hors personnel et concours aux associations) dans une limite de 7,5 % des dépenses réelles de chaque section à compter du 1er janvier 2025.",
    delaiRecours: "Recours pour excès de pouvoir (REP) auprès du Tribunal administratif de Cergy-Pontoise dans un délai de 2 mois à compter de sa publication.",
    montantTotalEquilibre: 238277172.33,
    sectionFonctionnementTotal: 171297167.00,
    sectionInvestissementTotal: 66980005.33,
    depensesFonctionnement: [
      { nature: 'ORDRE', chapitre: '023', libelle: "Virement à la section d'investissement", montantBS2026: 14727597.60, totalBS: 14727597.60 },
      { nature: 'ORDRE', chapitre: '042', libelle: "Opérations d'ordre de transfert entre sections", montantBS2026: 7000000.00, totalBS: 7000000.00 },
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: 41126918.97, totalBS: 41126918.97 },
      { nature: 'REEL', chapitre: '012', libelle: 'Charges de personnel et frais assimilés', montantBS2026: 91397205.00, totalBS: 91397205.00 },
      { nature: 'REEL', chapitre: '65', libelle: 'Autres charges de gestion courante', montantBS2026: 14803771.43, totalBS: 14803771.43 },
      { nature: 'REEL', chapitre: '66', libelle: 'Charges financières', montantBS2026: 1820474.00, totalBS: 1820474.00 },
      { nature: 'REEL', chapitre: '67', libelle: 'Charges spécifiques', montantBS2026: 151200.00, totalBS: 151200.00 },
      { nature: 'REEL', chapitre: '68', libelle: 'Dotations aux provisions et dépréciations', montantBS2026: 270000.00, totalBS: 270000.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '013', libelle: 'Atténuations de charges', montantBS2026: 900000.00, totalBS: 900000.00 },
      { nature: 'REEL', chapitre: '70', libelle: 'Produits des services, domaine et ventes diverses', montantBS2026: 10994071.00, totalBS: 10994071.00 },
      { nature: 'REEL', chapitre: '731', libelle: 'Fiscalité locale', montantBS2026: 57462313.00, totalBS: 57462313.00 },
      { nature: 'REEL', chapitre: '73', libelle: 'Impôts et taxes', montantBS2026: 66973327.00, totalBS: 66973327.00 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: 30380700.00, totalBS: 30380700.00 },
      { nature: 'REEL', chapitre: '75', libelle: 'Autres produits de gestion courante', montantBS2026: 4436756.00, totalBS: 4436756.00 },
      { nature: 'REEL', chapitre: '77', libelle: 'Produits spécifiques', montantBS2026: 150000.00, totalBS: 150000.00 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées (remboursement capital)', montantBS2026: 8428581.33, totalBS: 8428581.33 },
      { nature: 'REEL', chapitre: '204', libelle: "Subventions d'équipement versées", montantBS2026: 10596276.00, totalBS: 10596276.00 },
      { nature: 'REEL', chapitre: '20', libelle: 'Immobilisations incorporelles', montantBS2026: 3723490.00, totalBS: 3723490.00 },
      { nature: 'REEL', chapitre: '21', libelle: 'Immobilisations corporelles', montantBS2026: 24029165.00, totalBS: 24029165.00 },
      { nature: 'REEL', chapitre: '23', libelle: 'Immobilisations en cours', montantBS2026: 19422493.00, totalBS: 19422493.00 },
      { nature: 'REEL', chapitre: '27', libelle: 'Autres immobilisations financières', montantBS2026: 600000.00, totalBS: 600000.00 },
      { nature: 'REEL', chapitre: '4541101', libelle: "Travaux exécutés d'office", montantBS2026: 180000.00, totalBS: 180000.00 },
    ],
    recettesInvestissement: [
      { nature: 'ORDRE', chapitre: '021', libelle: 'Virement de la section de fonctionnement', montantBS2026: 14727597.60, totalBS: 14727597.60 },
      { nature: 'ORDRE', chapitre: '040', libelle: "Opérations d'ordre de transfert entre sections", montantBS2026: 7000000.00, totalBS: 7000000.00 },
      { nature: 'REEL', chapitre: '024', libelle: "Produits des cessions d'immobilisations", montantBS2026: 1226000.00, totalBS: 1226000.00 },
      { nature: 'REEL', chapitre: '10', libelle: 'Dotations, fonds divers et réserves', montantBS2026: 800000.00, totalBS: 800000.00 },
      { nature: 'REEL', chapitre: '13', libelle: "Subventions d'investissement", montantBS2026: 7533691.99, totalBS: 7533691.99 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées', montantBS2026: 35322715.74, totalBS: 35322715.74 },
      { nature: 'REEL', chapitre: '204', libelle: "Subventions d'équipement versées", montantBS2026: 190000.00, totalBS: 190000.00 },
      { nature: 'REEL', chapitre: '4541101', libelle: "Travaux exécutés d'office", montantBS2026: 180000.00, totalBS: 180000.00 },
    ],
    pointsClesJuridiques: [
      "Budget Primitif 2025 voté le 12 février 2025 équilibré à 238 277 172,33 €.",
      "Épargne brute remarquable de 21,73 M€ permettant un virement direct de 14,73 M€ (chapitre 023) à la section d'investissement.",
      "Charges de personnel (012) à 91,40 M€ pour un total de dépenses réelles de gestion de 149,57 M€.",
      "Autofinancement net après remboursement de la dette (8,43 M€) s'élevant à +13,30 M€.",
      "Adopté à l'unanimité (35 voix pour, 3 abstentions), télétransmis le 17/02/2025."
    ],
  },
  principal: {
    id: 'principal',
    numeroDelib: 'Délibération n°2026/S6/004',
    titre: 'Budget Supplémentaire de la Commune pour l’exercice 2026 & Reprise du CFU 2025',
    budgetType: 'principal',
    dateConseil: '23 septembre 2026 (convoqué le 17/09/2026)',
    dateTransmissionPrefecture: '29 septembre 2026 (signé les 25 et 28/09/2026)',
    chaineIntegrite: '43 40 2F 09 90 69 5E 5D 59 3A B7 50 3A 9A BB E5',
    arPrefecture: '092-219200367-20260925-2236-DE',
    maire: 'Patrice LECLERC',
    secretaireSeance: 'Tristan PEPIN',
    votesPour: 40,
    votesContre: 4,
    votesAbstention: 0,
    typeVote: 'majorite',
    detailsVote: {
      quorumTexte: "Quorum atteint (Art. L.2121-17 CGCT) — 39 présents, 5 représentés (Z. Zouaoui par C. Lafon, S. Rezk par I. Ndiaye, A. Labadie par D. Toumi, S. Blanc par V. Desmettre, F. Moreau par M. Binakdane), 1 absent excusé (Abdallah SEDIRA)",
      votantsTotal: 44,
      contreNoms: ["Guilhem PELLET", "Brice NKONDA", "Delphine PARMENTIER", "Laëtitia GHIRARDI"],
      abstentionNoms: []
    },
    delegationArticle2: "Art. 1 : Vote par chapitre en dépenses et en recettes • Art. 2 : Section de fonctionnement arrêtée à 1 790 209,00 € de mouvements nouveaux (reports 2025 nuls) • Art. 3 : Section d'investissement arrêtée à 25 499 598,92 € (mouvements nouveaux : 10 424 375,12 € en dépenses et 13 396 494,90 € en recettes ; RAR 2025 : 15 075 223,80 € en dépenses et 12 103 104,02 € en recettes) • Art. 4 : Virement de la section de fonctionnement à la section d'investissement inscrit pour 283 749,59 € (dépense chap. 023 / recette chap. 021).",
    delaiRecours: "Article 5 : Recours pour excès de pouvoir (REP) auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard l'Hautil – BP 30322 – 95207 Cergy-Pontoise) dans un délai de deux mois à compter de sa publication (29/09/2026 — Publiact n°1171016).",
    montantTotalEquilibre: 27289807.92,
    sectionFonctionnementTotal: 1790209.00,
    sectionInvestissementTotal: 25499598.92,
    cfu2025: {
      fonctionnementResultatCumule: 17399407.33,
      investissementResultatCumule: -13402616.24,
      restesARealiserDepenses: 15075223.80,
      restesARealiserRecettes: 12103104.02,
      besoinNetFinancement: 16374736.02,
      affectationCompte1068: 16399407.33,
      affectationLigneR002: 1000000.00,
      affectationLigneD001: 10430496.46,
    },
    depensesFonctionnement: [
      { nature: 'ORDRE', chapitre: '023', libelle: "Virement à la section d'investissement", montantBS2026: 283749.59, reports2025: 0, totalBS: 283749.59 },
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: 1063249.98, reports2025: 0, totalBS: 1063249.98 },
      { nature: 'REEL', chapitre: '65', libelle: 'Autres charges de gestion courante', montantBS2026: 243209.43, reports2025: 0, totalBS: 243209.43 },
      { nature: 'REEL', chapitre: '66', libelle: 'Charges financières (intérêts dette)', montantBS2026: 200000.00, reports2025: 0, totalBS: 200000.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '002', libelle: 'Résultat de fonctionnement reporté (R002)', montantBS2026: 1000000.00, reports2025: 0, totalBS: 1000000.00 },
      { nature: 'REEL', chapitre: '70', libelle: 'Produits des services, du domaine et ventes diverses', montantBS2026: -20000.00, reports2025: 0, totalBS: -20000.00 },
      { nature: 'REEL', chapitre: '73', libelle: 'Impôts et taxes', montantBS2026: -453396.00, reports2025: 0, totalBS: -453396.00 },
      { nature: 'REEL', chapitre: '731', libelle: 'Fiscalité locale', montantBS2026: 108257.00, reports2025: 0, totalBS: 108257.00 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: 885289.00, reports2025: 0, totalBS: 885289.00 },
      { nature: 'REEL', chapitre: '75', libelle: 'Autres produits de gestion courante', montantBS2026: 270059.00, reports2025: 0, totalBS: 270059.00 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '001', libelle: "Solde d'exécution de la section d'investissement (D001)", montantBS2026: 10430496.46, reports2025: 0, totalBS: 10430496.46 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées', montantBS2026: -77000.00, reports2025: 0, totalBS: -77000.00 },
      { nature: 'REEL', chapitre: '20', libelle: 'Immobilisations incorporelles', montantBS2026: -714000.00, reports2025: 1965898.77, totalBS: 1251898.77 },
      { nature: 'REEL', chapitre: '204', libelle: "Subventions d'équipement versées", montantBS2026: -318121.34, reports2025: 0, totalBS: -318121.34 },
      { nature: 'REEL', chapitre: '21', libelle: 'Immobilisations corporelles (équipements)', montantBS2026: -17500.00, reports2025: 7143922.35, totalBS: 7126422.35 },
      { nature: 'REEL', chapitre: '23', libelle: 'Immobilisations en cours (travaux pluriannuels)', montantBS2026: 0.00, reports2025: 5965402.68, totalBS: 5965402.68 },
      { nature: 'REEL', chapitre: '27', libelle: 'Autres immobilisations financières', montantBS2026: 1120500.00, reports2025: 0, totalBS: 1120500.00 },
    ],
    recettesInvestissement: [
      { nature: 'ORDRE', chapitre: '021', libelle: 'Virement de la section de fonctionnement (021)', montantBS2026: 283749.59, reports2025: 0, totalBS: 283749.59 },
      { nature: 'REEL', chapitre: '10', libelle: 'Dotations, fonds divers et réserves (Compte 1068)', montantBS2026: 16399407.33, reports2025: 0, totalBS: 16399407.33 },
      { nature: 'REEL', chapitre: '13', libelle: "Subventions d'investissement", montantBS2026: -1343744.00, reports2025: 4103104.02, totalBS: 2759360.02 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées', montantBS2026: -3063418.02, reports2025: 8000000.00, totalBS: 4936581.98 },
      { nature: 'REEL', chapitre: '27', libelle: 'Autres immobilisations financières', montantBS2026: 1120500.00, reports2025: 0, totalBS: 1120500.00 },
    ],
    pointsClesJuridiques: [
      "Conformité CGCT Art. L. 2121-12, L. 2121-17 et L. 1612-11 : Conseil municipal convoqué le 17/09/2026 et réuni le 23/09/2026 (39 présents, 5 représentés, 1 absent excusé ; adopté par 40 voix pour et 4 contre).",
      "Concordance exacte CFU 2025 / BS 2026 : résultat cumulé de fonctionnement (+17 399 407,33 €) affecté à hauteur de 16 399 407,33 € au compte 1068 et 1 000 000,00 € en report R002 ; reprise en D001 pour 10 430 496,46 € (le résultat cumulé d'investissement de -13 402 616,24 € intégrant l'écart net de RAR de -2 972 119,78 €).",
      "Équilibre de la section de fonctionnement (+1 790 209,00 €, reports nuls) : +1 506 459,41 € de dépenses réelles nouvelles (Chap. 011 : +1 063 249,98 €, Chap. 65 : +243 209,43 €, Chap. 66 : +200 000,00 € ; Chap. 012 inchangé à 0 €) et +283 749,59 € de virement d'autofinancement (Chap. 023).",
      "Désendettement et reprofilage de l'investissement (25 499 598,92 €) : réduction de -3 063 418,02 € de l'emprunt nouveau inscrit au Chap. 16 Recettes grâce à la capitalisation au compte 1068, baisse de -77 000,00 € sur l'annuité en capital (Chap. 16 Dépenses) et inscription d'une opération symétrique de 1 120 500,00 € au Chap. 27.",
      "Consolidation annuelle 2026 (BP + BS) : le budget global 2026 de la Ville s'établit à 277 957 913,22 € (169 940 944,30 € en fonctionnement et 108 016 968,92 € en investissement). Acte signé électroniquement les 25 et 28/09/2026 et télétransmis le 29/09/2026 (AR 092-219200367-20260925-2236-DE)."
    ],
  },
  restauration: {
    id: 'restauration',
    numeroDelib: 'Délibérations n°2026/S6/002 & n°2026/S6/005',
    titre: 'Budget Annexe Restauration du Personnel — CFU 2025 & BS 2026',
    budgetType: 'annexe_restauration',
    dateConseil: '23 septembre 2026',
    dateTransmissionPrefecture: '29 septembre 2026',
    chaineIntegrite: '05 1D BC 0E F9 F8 4E DE 38 44 45 CC 6B BF 2A F5',
    arPrefecture: '092-219200367-20260925-2441-DE',
    maire: 'Patrice LECLERC',
    votesPour: 44,
    votesContre: 0,
    typeVote: 'unanimite',
    montantTotalEquilibre: 36195.54,
    sectionFonctionnementTotal: 22000.00,
    sectionInvestissementTotal: 14195.54,
    cfu2025: {
      fonctionnementResultatCumule: 41526.07,
      investissementResultatCumule: -14195.54,
      restesARealiserDepenses: 0.00,
      restesARealiserRecettes: 0.00,
      besoinNetFinancement: 14195.54,
      affectationCompte1068: 14195.54,
      affectationLigneR002: 27330.53,
      affectationLigneD001: 14195.54,
    },
    depensesFonctionnement: [
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: 22000.00, reports2025: 0, totalBS: 22000.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '002', libelle: 'Résultat de fonctionnement reporté (R002)', montantBS2026: 27330.53, reports2025: 0, totalBS: 27330.53 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: -5330.53, reports2025: 0, totalBS: -5330.53 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '001', libelle: "Solde d'exécution d'investissement reporté (D001)", montantBS2026: 14195.54, reports2025: 0, totalBS: 14195.54 },
    ],
    recettesInvestissement: [
      { nature: 'REEL', chapitre: '10', libelle: 'Dotations, fonds divers et réserves (Compte 1068)', montantBS2026: 14195.54, reports2025: 0, totalBS: 14195.54 },
    ],
    pointsClesJuridiques: [
      "Budget annexe M57 dédié à la restauration des agents de la collectivité.",
      "Exécution 2025 : Recettes de 558 320,30 € contre 542 782,54 € de dépenses (excédent de gestion de +15 537,76 €).",
      "Résultat cumulé de fonctionnement : 41 526,07 € permettant d'apurer entièrement le déficit cumulé d'investissement (-14 195,54 €) via le compte 1068.",
      "Solde de report R002 maintenu à 27 330,53 €. Vote à l'unanimité (44 voix)."
    ],
  },
  cinema: {
    id: 'cinema',
    numeroDelib: 'Délibérations n°2026/S6/003 & n°2026/S6/006',
    titre: 'Budget Annexe Cinéma Jean Vigo — CFU 2025 & BS 2026',
    budgetType: 'annexe_cinema',
    dateConseil: '23 septembre 2026',
    dateTransmissionPrefecture: '29 septembre 2026',
    chaineIntegrite: '09 EE 84 72 B5 1C 66 9A B5 4A D4 D2 23 F4 0A 1B',
    arPrefecture: '092-219200367-20260925-2440-DE',
    maire: 'Patrice LECLERC',
    votesPour: 44,
    votesContre: 0,
    typeVote: 'unanimite',
    montantTotalEquilibre: 24582.22,
    sectionFonctionnementTotal: 6858.00,
    sectionInvestissementTotal: 17724.22,
    cfu2025: {
      fonctionnementResultatCumule: 25987.52,
      investissementResultatCumule: 17724.22,
      restesARealiserDepenses: 0.00,
      restesARealiserRecettes: 0.00,
      besoinNetFinancement: 0.00,
      affectationCompte1068: 0.00,
      affectationLigneR002: 25987.52,
      affectationLigneR001: 17724.22,
    },
    depensesFonctionnement: [
      { nature: 'REEL', chapitre: '012', libelle: 'Charges de personnel et frais assimilés', montantBS2026: 6858.00, reports2025: 0, totalBS: 6858.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '002', libelle: 'Résultat de fonctionnement reporté (R002)', montantBS2026: 25987.52, reports2025: 0, totalBS: 25987.52 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: -19129.52, reports2025: 0, totalBS: -19129.52 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '21', libelle: 'Immobilisations corporelles (matériel cinéma)', montantBS2026: 17724.22, reports2025: 0, totalBS: 17724.22 },
    ],
    recettesInvestissement: [
      { nature: 'REEL', chapitre: '001', libelle: "Solde d'exécution d'investissement reporté (R001 - excédent)", montantBS2026: 17724.22, reports2025: 0, totalBS: 17724.22 },
    ],
    pointsClesJuridiques: [
      "Budget annexe M57 du Cinéma municipal Jean Vigo.",
      "Situation équilibrée : 0 € de besoin net d'investissement (aucun prélèvement obligatoire au compte 1068).",
      "L'intégralité du résultat de fonctionnement (+25 987,52 €) est conservée en report R002.",
      "L'excédent d'investissement (+17 724,22 €) est reporté en R001 et affecté à l'achat d'immobilisations corporelles (chapitre 21).",
      "Adopté à l'unanimité (44 voix pour, 0 contre) le 23/09/2026."
    ],
  },
  dm1_2024: {
    id: 'dm1_2024',
    numeroDelib: 'Délibération n°2 du 18 décembre 2024',
    titre: 'Décision Modificative n°1 - Budget Primitif 2024 de la Commune (-17,34 M€)',
    budgetType: 'bp_2024' as any,
    dateConseil: '18 décembre 2024',
    dateTransmissionPrefecture: '24 décembre 2024',
    chaineIntegrite: '66 D4 0E 47 03 36 0A D0 3E FA 17 AC BE 1B D7 02',
    arPrefecture: '092-219200367-20241224-D-02-2024-DE',
    maire: 'Patrice LECLERC',
    votesPour: 37,
    votesContre: 0,
    votesAbstention: 2,
    typeVote: 'unanimite',
    detailsVote: {
      quorumTexte: "Conseil Municipal réuni le 18 décembre 2024 — 37 votants pour, 2 abstentions",
      votantsTotal: 39,
      contreNoms: [],
      abstentionNoms: ["Laëtitia GHIRARDI", "Karine CHALAH (représentée par Laëtitia GHIRARDI)"]
    },
    delegationArticle2: "Article 1 : Vote la Décision Modificative n°1 arrêtée en recettes et en dépenses à la somme de -17 341 690,30 € (-673 947,30 € en fonctionnement et -16 667 743,00 € en investissement).",
    delaiRecours: "Recours pour excès de pouvoir (REP) devant le Tribunal administratif de Cergy-Pontoise dans un délai de 2 mois à compter de la publication.",
    montantTotalEquilibre: 17341690.30,
    sectionFonctionnementTotal: 673947.30,
    sectionInvestissementTotal: 16667743.00,
    depensesFonctionnement: [
      { nature: 'ORDRE', chapitre: '023', libelle: "Virement à la section d'investissement", montantBS2026: 153885.24, totalBS: 153885.24 },
      { nature: 'REEL', chapitre: '68', libelle: 'Dotations aux provisions et dépréciations', montantBS2026: 179986.92, totalBS: 179986.92 },
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: -737706.46, totalBS: -737706.46 },
      { nature: 'REEL', chapitre: '012', libelle: 'Charges de personnel et frais assimilés', montantBS2026: -262650.00, totalBS: -262650.00 },
      { nature: 'REEL', chapitre: '65', libelle: 'Autres charges de gestion courante', montantBS2026: 117335.00, totalBS: 117335.00 },
      { nature: 'REEL', chapitre: '67', libelle: 'Charges spécifiques', montantBS2026: -124798.00, totalBS: -124798.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '70', libelle: 'Produits des services, du domaine et ventes diverses', montantBS2026: 65055.56, totalBS: 65055.56 },
      { nature: 'REEL', chapitre: '731', libelle: 'Fiscalité locale', montantBS2026: -735277.00, totalBS: -735277.00 },
      { nature: 'REEL', chapitre: '74', libelle: 'Dotations et participations', montantBS2026: -55143.00, totalBS: -55143.00 },
      { nature: 'REEL', chapitre: '75', libelle: 'Autres produits de gestion courante', montantBS2026: 51417.14, totalBS: 51417.14 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '20', libelle: 'Immobilisations incorporelles', montantBS2026: -1085203.00, totalBS: -1085203.00 },
      { nature: 'REEL', chapitre: '204', libelle: "Subventions d'équipement versées", montantBS2026: -6969096.00, totalBS: -6969096.00 },
      { nature: 'REEL', chapitre: '21', libelle: 'Immobilisations corporelles', montantBS2026: -3826407.00, totalBS: -3826407.00 },
      { nature: 'REEL', chapitre: '23', libelle: 'Immobilisations en cours', montantBS2026: -4459785.00, totalBS: -4459785.00 },
      { nature: 'REEL', chapitre: '26', libelle: 'Participations et créances rattachées', montantBS2026: -280000.00, totalBS: -280000.00 },
      { nature: 'REEL', chapitre: '45', libelle: "Travaux d'office pour compte de tiers", montantBS2026: -47252.00, totalBS: -47252.00 },
    ],
    recettesInvestissement: [
      { nature: 'ORDRE', chapitre: '021', libelle: 'Virement de la section de fonctionnement', montantBS2026: 153885.24, totalBS: 153885.24 },
      { nature: 'REEL', chapitre: '024', libelle: "Produits des cessions d'immobilisations", montantBS2026: 198000.00, totalBS: 198000.00 },
      { nature: 'REEL', chapitre: '10', libelle: 'Dotations, fonds divers et réserves', montantBS2026: 318938.00, totalBS: 318938.00 },
      { nature: 'REEL', chapitre: '13', libelle: "Subventions d'investissement", montantBS2026: 682085.24, totalBS: 682085.24 },
      { nature: 'REEL', chapitre: '16', libelle: 'Emprunts et dettes assimilées', montantBS2026: -17973399.48, totalBS: -17973399.48 },
      { nature: 'REEL', chapitre: '45', libelle: "Travaux d'office pour compte de tiers", montantBS2026: -47252.00, totalBS: -47252.00 },
    ],
    pointsClesJuridiques: [
      "Décision Modificative n°1 de l'exercice 2024 votée le 18 décembre 2024 s'équilibrant à -17 341 690,30 €.",
      "Ajustement majeur en investissement : annulation d'emprunt d'équilibre à hauteur de -17,97 M€ (Chap. 16 Recettes) traduisant l'amélioration de l'autofinancement propre et le recalage des chantiers pluriannuels.",
      "Section de fonctionnement ajustée de -673 947,30 € avec un recul de -737 706,46 € sur les charges générales (011) et de -262 650,00 € sur le personnel (012).",
      "Adoptée à l'unanimité (37 voix pour, 2 abstentions), télétransmise et publiée le 24/12/2024 (AR 092-219200367-20241224-D-02-2024-DE)."
    ]
  },
  cfu_2024_commune: {
    id: 'cfu_2024_commune',
    numeroDelib: 'Délibération n°4 du 25 juin 2025',
    titre: 'Affectation du résultat du Compte Financier Unique 2024 de la Commune',
    budgetType: 'cfu_2024' as any,
    dateConseil: '25 juin 2025',
    dateTransmissionPrefecture: '1 juillet 2025',
    chaineIntegrite: '55 82 66 17 54 1D B4 95 F3 2E 5E 44 72 21 88 4F',
    arPrefecture: '092-219200367-20250625-lmc100000015296-DE',
    maire: 'Patrice LECLERC',
    votesPour: 33,
    votesContre: 0,
    votesAbstention: 0,
    typeVote: 'unanimite',
    detailsVote: {
      quorumTexte: "Conseil Municipal du 25 juin 2025 — 33 votants pour (unanimité)",
      votantsTotal: 33,
      contreNoms: [],
      abstentionNoms: []
    },
    delegationArticle2: "Article 1 : Affecte le résultat cumulé de fonctionnement 2024 : 19 554 319,62 € au Compte 1068 (réserve d'investissement capitalisée), 1 000 000,00 € en report R002 et reprend le déficit d'investissement en D001 pour 14 468 331,86 €.",
    delaiRecours: "Recours pour excès de pouvoir (REP) auprès du Tribunal administratif de Cergy-Pontoise dans un délai de deux mois.",
    montantTotalEquilibre: 20554319.62,
    sectionFonctionnementTotal: 20554319.62,
    sectionInvestissementTotal: 13528718.89,
    cfu2025: {
      fonctionnementResultatCumule: 20554319.62,
      investissementResultatCumule: -6804647.04,
      restesARealiserDepenses: 14521195.93,
      restesARealiserRecettes: 7797124.08,
      besoinNetFinancement: 13528718.89,
      affectationCompte1068: 19554319.62,
      affectationLigneR002: 1000000.00,
      affectationLigneD001: 14468331.86,
    },
    depensesFonctionnement: [
      { nature: 'REEL', chapitre: '012', libelle: 'Charges de personnel (Exécution 2024)', montantBS2026: 88500000.00, totalBS: 88500000.00 },
      { nature: 'REEL', chapitre: '011', libelle: 'Charges à caractère général', montantBS2026: 39500000.00, totalBS: 39500000.00 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '73', libelle: 'Impôts et fiscalité locale 2024', montantBS2026: 120500000.00, totalBS: 120500000.00 },
      { nature: 'REEL', chapitre: '002', libelle: 'Résultat reporté R002', montantBS2026: 1000000.00, totalBS: 1000000.00 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '001', libelle: "Solde négatif d'investissement (D001)", montantBS2026: 14468331.86, totalBS: 14468331.86 },
      { nature: 'REEL', chapitre: '21', libelle: 'Travaux et chantiers réalisés', montantBS2026: 49090000.00, totalBS: 49090000.00 },
    ],
    recettesInvestissement: [
      { nature: 'REEL', chapitre: '10', libelle: 'Excédent capitalisé (Compte 1068)', montantBS2026: 19554319.62, totalBS: 19554319.62 },
    ],
    pointsClesJuridiques: [
      "Clôture du CFU 2024 : résultat excédentaire historique en fonctionnement de +20 554 319,62 €.",
      "Besoin net cumulé de financement de la section d'investissement : 13 528 718,89 € (-6,80 M€ de solde d'exécution + 6,72 M€ de RAR nets).",
      "Affectation vertueuse : 19,55 M€ capitalisés au Compte 1068 pour couvrir le besoin et autofinancer les chantiers, 1,00 M€ reporté en fonctionnement R002.",
      "Adoptée à l'unanimité (33 voix pour) le 25 juin 2025 (AR 092-219200367-20250625-lmc100000015296-DE)."
    ]
  },
  cfu_2024_cinema: {
    id: 'cfu_2024_cinema',
    numeroDelib: 'Délibération n°3 du 25 juin 2025',
    titre: 'Vote du Compte Financier Unique 2024 du Budget Annexe du Cinéma Jean Vigo',
    budgetType: 'annexe_cinema' as any,
    dateConseil: '25 juin 2025',
    dateTransmissionPrefecture: '1 juillet 2025',
    chaineIntegrite: 'E2 C4 6B 6F 9B F3 F8 3B 70 9E B9 09 80 81 18 B3',
    arPrefecture: '092-219200367-20250701-deliberation3-DE',
    maire: 'Patrice LECLERC',
    votesPour: 32,
    votesContre: 0,
    votesAbstention: 0,
    typeVote: 'unanimite',
    detailsVote: {
      quorumTexte: "Conseil Municipal du 25 juin 2025 — 32 votes pour (M. le Maire ne prend pas part au vote conformément à l'art. L. 2121-14 CGCT)",
      votantsTotal: 32,
      contreNoms: [],
      abstentionNoms: []
    },
    delegationArticle2: "Article 1 : Arrête le CFU 2024 du Cinéma Jean Vigo : résultat d'exercice à -26 650,55 €, résultat de clôture à +60 607,35 €, RAR dépenses à 1 536,42 € et résultat cumulé à +59 070,93 €.",
    delaiRecours: "Recours pour excès de pouvoir (REP) devant le TA de Cergy-Pontoise sous 2 mois.",
    montantTotalEquilibre: 772520.44,
    sectionFonctionnementTotal: 753262.11,
    sectionInvestissementTotal: 19258.33,
    cfu2025: {
      fonctionnementResultatCumule: 66191.50,
      investissementResultatCumule: -5584.15,
      restesARealiserDepenses: 1536.42,
      restesARealiserRecettes: 0.00,
      besoinNetFinancement: 7120.57,
      affectationCompte1068: 7120.57,
      affectationLigneR002: 59070.93,
    },
    depensesFonctionnement: [
      { nature: 'REEL', chapitre: '011', libelle: 'Charges courantes exploitation cinéma', montantBS2026: 753262.11, totalBS: 753262.11 },
    ],
    recettesFonctionnement: [
      { nature: 'REEL', chapitre: '70', libelle: 'Billetterie et recettes spectateurs', montantBS2026: 724300.28, totalBS: 724300.28 },
    ],
    depensesInvestissement: [
      { nature: 'REEL', chapitre: '21', libelle: 'Matériel et équipements de projection', montantBS2026: 19258.33, totalBS: 19258.33 },
    ],
    recettesInvestissement: [
      { nature: 'REEL', chapitre: '13', libelle: "Subventions d'investissement CNC / Région", montantBS2026: 21569.61, totalBS: 21569.61 },
    ],
    pointsClesJuridiques: [
      "CFU 2024 du Cinéma Jean Vigo arrêté à 745 869,89 € en titres émis et 772 520,44 € en mandats émis.",
      "Fonctionnement : 724 300,28 € de recettes et 753 262,11 € de dépenses (déficit d'exercice de -28 961,83 € amorti par les 95 153,33 € de résultat antérieur).",
      "Investissement : 21 569,61 € de recettes et 19 258,33 € de dépenses (excédent d'exercice de +2 311,28 €).",
      "Résultat de clôture globalement positif à +60 607,35 € et résultat cumulé net de +59 070,93 €.",
      "Adopté à l'unanimité (32 voix pour) le 25 juin 2025 sous la présidence de Mme Anne-Laure PEREZ (retrait de M. le Maire Patrice LECLERC)."
    ]
  },
};

export const PRESETS_COLLECTIVITES: Record<string, BudgetM57Input> = {
  gennevilliers_bp_2026: {
    collectiviteNom: 'Gennevilliers — BP 2026 Primitif (Délib. 2026/S1/001)',
    typeCollectivite: 'commune',
    population: 51200,
    exercice: 2026,
    base: 'prevision',
    recettesReellesFonctionnement: 168150735,
    depensesReellesFonctionnement: 154828246,
    remboursementCapitalDette: 9626700,
    encoursDetteFinExercice: 72400000,
    depensesPersonnel012: 96063865,
  },
  gennevilliers_bp_2025: {
    collectiviteNom: 'Gennevilliers — BP 2025 Primitif (Délib. 12/02/2025)',
    typeCollectivite: 'commune',
    population: 50200,
    exercice: 2025,
    base: 'prevision',
    recettesReellesFonctionnement: 171297167,
    depensesReellesFonctionnement: 149569569,
    remboursementCapitalDette: 8428581,
    encoursDetteFinExercice: 68500000,
    depensesPersonnel012: 91397205,
  },
  gennevilliers_principal_delib_2026: {
    collectiviteNom: 'Gennevilliers — Budget Consolidé 2026 (BP + BS Délib. 2026/S6/004)',
    typeCollectivite: 'commune',
    population: 51200,
    exercice: 2026,
    base: 'execution',
    recettesReellesFonctionnement: 169940944,
    depensesReellesFonctionnement: 156334706,
    remboursementCapitalDette: 9549700,
    encoursDetteFinExercice: 69336582,
    depensesPersonnel012: 96063865,
  },
  gennevilliers_cfu_2025: {
    collectiviteNom: 'Gennevilliers — CFU 2025 Exécution (Délib. 2026/S6/004)',
    typeCollectivite: 'commune',
    population: 50200,
    exercice: 2025,
    base: 'execution',
    recettesReellesFonctionnement: 138650000,
    depensesReellesFonctionnement: 121250592,
    remboursementCapitalDette: 7900000,
    encoursDetteFinExercice: 68100000,
    depensesPersonnel012: 67400000,
  },
  gennevilliers_restauration_2026: {
    collectiviteNom: 'Gennevilliers — Annexe Restauration (Délib. 2026/S6/005)',
    typeCollectivite: 'commune',
    population: 51200,
    exercice: 2026,
    base: 'execution',
    recettesReellesFonctionnement: 558320,
    depensesReellesFonctionnement: 542782,
    remboursementCapitalDette: 0,
    encoursDetteFinExercice: 0,
    depensesPersonnel012: 320000,
  },
  gennevilliers_cinema_2026: {
    collectiviteNom: 'Gennevilliers — Annexe Cinéma Vigo (Délib. 2026/S6/006)',
    typeCollectivite: 'commune',
    population: 51200,
    exercice: 2026,
    base: 'execution',
    recettesReellesFonctionnement: 689051,
    depensesReellesFonctionnement: 722135,
    remboursementCapitalDette: 0,
    encoursDetteFinExercice: 0,
    depensesPersonnel012: 410000,
  },
  gennevilliers_cfu_2024: {
    collectiviteNom: 'Gennevilliers — CFU 2024 Ville (Délib. n°4 du 25/06/2025)',
    typeCollectivite: 'commune',
    population: 49500,
    exercice: 2024,
    base: 'execution',
    recettesReellesFonctionnement: 170040000,
    depensesReellesFonctionnement: 148670000,
    remboursementCapitalDette: 10440000,
    encoursDetteFinExercice: 94600000,
    depensesPersonnel012: 88500000,
  },
  gennevilliers_dm1_2024: {
    collectiviteNom: 'Gennevilliers — DM1 2024 (Délib. n°2 du 18/12/2024)',
    typeCollectivite: 'commune',
    population: 49500,
    exercice: 2024,
    base: 'execution',
    recettesReellesFonctionnement: 169366053,
    depensesReellesFonctionnement: 147996053,
    remboursementCapitalDette: 10440000,
    encoursDetteFinExercice: 80417328,
    depensesPersonnel012: 88237350,
  },
  gennevilliers_cinema_2024: {
    collectiviteNom: 'Gennevilliers — CFU 2024 Cinéma Vigo (Délib. n°3 du 25/06/2025)',
    typeCollectivite: 'commune',
    population: 49500,
    exercice: 2024,
    base: 'execution',
    recettesReellesFonctionnement: 724300,
    depensesReellesFonctionnement: 753262,
    remboursementCapitalDette: 0,
    encoursDetteFinExercice: 0,
    depensesPersonnel012: 380000,
  },
  commune_moyenne_fpt: {
    collectiviteNom: 'Commune Moyenne FPT (25 000 hab)',
    typeCollectivite: 'commune',
    population: 25000,
    exercice: 2025,
    base: 'execution',
    recettesReellesFonctionnement: 32000000,
    depensesReellesFonctionnement: 27500000,
    remboursementCapitalDette: 2100000,
    encoursDetteFinExercice: 18500000,
    depensesPersonnel012: 15400000,
  },
  epci_intercommunalite: {
    collectiviteNom: 'Communauté d’Agglomération / Métropole',
    typeCollectivite: 'epci',
    population: 120000,
    exercice: 2025,
    base: 'execution',
    recettesReellesFonctionnement: 95000000,
    depensesReellesFonctionnement: 81000000,
    remboursementCapitalDette: 6500000,
    encoursDetteFinExercice: 74000000,
    depensesPersonnel012: 38000000,
  },
};

/**
 * Diagnostic du Taux d'Épargne Brute selon les normes DGCL / Cour des Comptes
 */
export function evaluerTauxEpargneBrute(taux: number | null): RatioStatus {
  if (taux === null) {
    return {
      niveau: 'critique',
      badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
      message: 'Recettes nulles ou négatives : taux non calculable.',
      recommandation: 'Vérifier la qualification des recettes réelles de fonctionnement.',
    };
  }

  if (taux >= 15) {
    return {
      niveau: 'excellent',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      message: 'Situation très saine (Taux ≥ 15%)',
      recommandation: 'Forte capacité d’autofinancement pour financer les investissements d’avenir et préserver les primes.',
    };
  } else if (taux >= 10) {
    return {
      niveau: 'bon',
      badgeColor: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
      message: 'Marge de sécurité confortable (10% à 15%)',
      recommandation: 'Niveau d’épargne satisfaisant, maintien de la trajectoire budgétaire recommandé.',
    };
  } else if (taux >= 7) {
    return {
      niveau: 'vigilance',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      message: 'Zone de vigilance (7% à 10%)',
      recommandation: 'Autofinancement restreint. Surveiller la dynamique des dépenses de gestion et les charges de personnel.',
    };
  } else {
    return {
      niveau: 'alerte',
      badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
      message: 'Fragilité financière marquée (< 7%)',
      recommandation: 'Risque d’épargne nette négative : la collectivité pourrait devoir emprunter pour payer sa dette.',
    };
  }
}

/**
 * Diagnostic de la Capacité de Désendettement selon les seuils d'alerte CRC
 */
export function evaluerCapaciteDesendettement(annees: number | null): RatioStatus {
  if (annees === null) {
    return {
      niveau: 'critique',
      badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
      message: 'Épargne brute nulle ou négative : insolvabilité technique.',
      recommandation: 'Plan d’urgence requis : rétablissement prioritaire de l’autofinancement brut.',
    };
  }

  if (annees < 6) {
    return {
      niveau: 'excellent',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      message: 'Endettement très faible (< 6 ans)',
      recommandation: 'Excellente solvabilité financière, marge d’emprunt disponible pour les projets prioritaires.',
    };
  } else if (annees <= 8) {
    return {
      niveau: 'bon',
      badgeColor: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
      message: 'Niveau d’endettement maîtrisé (6 à 8 ans)',
      recommandation: 'Zone standard de bonne gestion territoriale, conforme aux ratios des collectivités similaires.',
    };
  } else if (annees <= 10) {
    return {
      niveau: 'vigilance',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      message: 'Vigilance financière (8 à 10 ans)',
      recommandation: 'Approche du seuil de vigilance prudentielle de la DGCL. Éviter d’alourdir le programme d’emprunt.',
    };
  } else if (annees <= 12) {
    return {
      niveau: 'alerte',
      badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
      message: 'Seuil d’alerte CRC (10 à 12 ans)',
      recommandation: 'Seuil d’alerte des lois de programmation des finances publiques. Risque de rappel à l’ordre de la Chambre Régionale des Comptes.',
    };
  } else {
    return {
      niveau: 'critique',
      badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
      message: 'Seuil critique d’alerte dépassé (> 12 ans)',
      recommandation: 'Surendettement manifeste : risque d’inscription au Réseau d’Alerte des Finances Locales et de saisine préfectorale.',
    };
  }
}

/**
 * Calcul complet des indicateurs M57
 */
export function analyserBudgetM57(input: BudgetM57Input): BudgetM57Result {
  const rrf = Math.max(0, input.recettesReellesFonctionnement || 0);
  const drf = Math.max(0, input.depensesReellesFonctionnement || 0);
  const capital = Math.max(0, input.remboursementCapitalDette || 0);
  const dette = Math.max(0, input.encoursDetteFinExercice || 0);

  const epargneBrute = rrf - drf;
  const epargneNette = epargneBrute - capital;

  const tauxEpargneBrute = rrf > 0 ? Number(((epargneBrute / rrf) * 100).toFixed(2)) : null;
  const capaciteDesendettementAns = epargneBrute > 0 ? Number((dette / epargneBrute).toFixed(2)) : null;

  const poidsPersonnel = input.depensesPersonnel012 && drf > 0
    ? Number(((input.depensesPersonnel012 / drf) * 100).toFixed(2))
    : null;

  const diagEpargne = evaluerTauxEpargneBrute(tauxEpargneBrute);
  const diagDette = evaluerCapaciteDesendettement(capaciteDesendettementAns);

  // Synthèse globale
  const pointsVigilance: string[] = [];
  if (epargneNette < 0) {
    pointsVigilance.push('Épargne nette négative : l’épargne brute ne couvre pas le remboursement du capital de la dette.');
  }
  if (capaciteDesendettementAns !== null && capaciteDesendettementAns > 10) {
    pointsVigilance.push(`Délai de désendettement de ${capaciteDesendettementAns} ans supérieur au seuil prudentiel CRC de 10 ans.`);
  }
  if (poidsPersonnel !== null && poidsPersonnel > 65) {
    pointsVigilance.push(`Le chapitre 012 représente ${poidsPersonnel}% des dépenses de fonctionnement (rigidité structurelle élevée).`);
  }
  if (tauxEpargneBrute !== null && tauxEpargneBrute < 10) {
    pointsVigilance.push(`Taux d'épargne brute de ${tauxEpargneBrute}% inférieur au standard DGCL de 10%.`);
  }

  let statut: 'sain' | 'favorable' | 'sous_surveillance' | 'risque_tutelle' = 'sain';
  let titre = 'Situation financière saine et équilibrée';
  let description = 'La collectivité dégage une épargne brute suffisante pour couvrir ses annuités de dette et financer ses équipements.';

  if (epargneBrute <= 0 || (capaciteDesendettementAns !== null && capaciteDesendettementAns > 12)) {
    statut = 'risque_tutelle';
    titre = 'Situation budgétaire critique';
    description = 'Capacité d’autofinancement dégradée ou surendettement critique. Vigilance accrue lors des contrôles CRC.';
  } else if (capaciteDesendettementAns !== null && capaciteDesendettementAns >= 10) {
    statut = 'sous_surveillance';
    titre = 'Collectivité sous surveillance prudentielle';
    description = 'Les ratios approchent des seuils d’alerte de la Chambre Régionale des Comptes. Un freinage des dépenses est requis.';
  } else if ((tauxEpargneBrute !== null && tauxEpargneBrute < 12) || (capaciteDesendettementAns !== null && capaciteDesendettementAns > 8)) {
    statut = 'favorable';
    titre = 'Situation favorable avec points de vigilance';
    description = 'Équilibre financier maintenu mais marges de manœuvre réduites face à l’inflation et aux charges obligatoires.';
  }

  return {
    collectiviteNom: input.collectiviteNom,
    exercice: input.exercice,
    base: input.base,
    rrf,
    drf,
    capitalDette: capital,
    encoursDette: dette,
    epargneBrute,
    epargneNette,
    tauxEpargneBrute,
    capaciteDesendettementAns,
    poidsChargesPersonnelPct: poidsPersonnel,
    diagnosticEpargne: diagEpargne,
    diagnosticDesendettement: diagDette,
    diagnosticGlobal: {
      statut,
      titre,
      description,
      pointsVigilance,
    },
  };
}

/**
 * Générateur de Note d'Arbitrage à l'Autorité Territoriale (Enrichi avec Délibération BS 2026 n°2026/S6/004 & CFU 2025)
 */
export function genererNoteDecision(result: BudgetM57Result, options: { objet?: string; signataire?: string }): string {
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const objet = options.objet || `Arbitrage budgétaire M57, exécution du BS 2026 (Délib. n°2026/S6/004) et trajectoire financière ${result.exercice}`;
  const signataire = options.signataire || 'Direction Générale des Services / Direction des Affaires Financières';
  const plafondFongibiliteFonct = Math.round(result.drf * 0.075);
  const impactRifseep1Pct = Math.round((result.poidsChargesPersonnelPct ? (result.drf * result.poidsChargesPersonnelPct) / 100 : result.drf * 0.61) * 0.01);

  return `# Projet de note d'arbitrage à l'autorité territoriale

**Destinataire :** Monsieur Patrice LECLERC, Maire de Gennevilliers / Autorité territoriale
**Émetteur :** ${signataire}
**Date :** ${dateStr}
**Objet :** ${objet}
**Entité, compétence et période :** ${result.collectiviteNom} — Commune (51 200 hab.) — Budget principal M57 — Exercice ${result.exercice} (Base : ${result.base === 'prevision' ? 'Budget Primitif voté' : 'Exécution consolidée / CFU & BS'})
**Pièces de référence certifiées :**
- **Délibération n°2026/S1/001 du 4 février 2026** portant vote du Budget Primitif 2026 (\`250 668 105,30 €\`, télétransmise le 10/02/2026, AR \`092-219200367-20260209-deliberation1-DE\`)
- **Délibération n°2026/S6/004 du 23 septembre 2026** portant vote du Budget Supplémentaire 2026 (\`27 289 807,92 €\`, signée électroniquement les 25 et 28/09/2026 par M. Patrice LECLERC, Maire, et M. Tristan PEPIN, Secrétaire de séance ; télétransmise et publiée le 29/09/2026, AR \`092-219200367-20260925-2236-DE\`, empreinte \`43 40 2F 09 90 69 5E 5D 59 3A B7 50 3A 9A BB E5\`, Publiact n°\`1171016\`)
- **Compte Financier Unique (CFU) 2025** et délibération d'affectation du résultat 2025 du budget principal (+ budgets annexes Restauration \`n°2026/S6/005\` et Cinéma Jean Vigo \`n°2026/S6/006\`)
**Statut :** *Projet préparatoire à relire par la DGS et l'exécutif, sans signature ni transmission externe — Ne constitue pas un acte exécutoire.*

---

## 1. Situation Financière, Reprise du CFU 2025 et Équilibres M57 Consolidés

### 1.1. Indicateurs et ratios prudentiels du périmètre examiné (${result.collectiviteNom})

| Indicateur M57 | Valeur constatée | Référence DGCL / Seuil CRC | Diagnostic & Appréciation |
|---|---|---|---|
| **Recettes Réelles de Fonctionnement (RRF)** | **${result.rrf.toLocaleString('fr-FR')} €** | Chap. 013, 70, 73, 731, 74, 75, 77 (+ R002 si consolidé) | Ressources d'exploitation hors écritures d'ordre |
| **Dépenses Réelles de Fonctionnement (DRF)** | **${result.drf.toLocaleString('fr-FR')} €** | Chap. 011, 012, 65, 66, 67 | Plafond fongibilité 7,5 % : \`${plafondFongibiliteFonct.toLocaleString('fr-FR')} €\` |
| **dont Charges de Personnel (Chap. 012)** | **${result.poidsChargesPersonnelPct !== null ? result.poidsChargesPersonnelPct + ' % des DRF' : 'Non isolé'}** | Strate communale > 50 000 hab. : 58 % à 64 % | Stabilisé à \`96 063 865,00 €\` (\`0,00 €\` de mouvement au BS 2026) |
| **Épargne Brute (Autofinancement / CAF)** | **${result.epargneBrute.toLocaleString('fr-FR')} €** | Formule : RRF − DRF | **${result.diagnosticEpargne.message}** |
| **Taux d'Épargne Brute** | **${result.tauxEpargneBrute !== null ? result.tauxEpargneBrute + ' %' : 'N/A'}** | Seuil vigilance DGCL : 8-10 % / Cible : > 12 % | Niveau **${result.diagnosticEpargne.niveau.toUpperCase()}** |
| **Remboursement Capital Dette (Chap. 16)** | **${result.capitalDette.toLocaleString('fr-FR')} €** | Couverture obligatoire par l'épargne brute (L. 1612-4) | Ajusté de \`-77 000,00 €\` au BS 2026 (soit \`9 549 700,00 €\` consolidé) |
| **Épargne Nette (Autofinancement disponible)** | **${result.epargneNette.toLocaleString('fr-FR')} €** | Formule : Épargne Brute − Capital Dette | **${result.epargneNette >= 0 ? 'Équilibre réel assuré (Art. L. 1612-4 CGCT)' : 'ALERTE : Déficit d’autofinancement propre'}** |
| **Encours Total de la Dette au 31/12** | **${result.encoursDette.toLocaleString('fr-FR')} €** | Dette bancaire et assimilée (Chap. 16) | Réduction d'emprunt nouveau de \`-3 063 418,02 €\` au BS 2026 |
| **Capacité de Désendettement** | **${result.capaciteDesendettementAns !== null ? result.capaciteDesendettementAns + ' années' : 'Incalculable'}** | Vigilance : 8-10 ans • Alerte CRC : 10-12 ans | Niveau **${result.diagnosticDesendettement.niveau.toUpperCase()}** (${result.diagnosticDesendettement.message}) |

### 1.2. Analyse de l'intégration du Budget Supplémentaire 2026 (Délibération n°2026/S6/004 du 23/09/2026)

L'adoption du Budget Supplémentaire 2026 par le Conseil municipal du 23 septembre 2026 (40 voix pour, 4 voix contre) opère la jonction réglementaire entre la clôture du **Compte Financier Unique (CFU) 2025** et le **Budget Primitif 2026** :

1. **Mécanisme d'apurement intégral du besoin de financement 2025 (Art. L. 2311-5 CGCT) :**
   - Le CFU 2025 dégage un **excédent cumulé de fonctionnement de \`+17 399 407,33 €\`** face à un **résultat cumulé d'investissement de \`-13 402 616,24 €\`**, composé du solde d'exécution comptable repris en **D001 (\`10 430 496,46 €\`)** et du besoin net de financement des Restes à Réaliser (**\`2 972 119,78 €\`**, soit \`15 075 223,80 €\` de RAR Dépenses moins \`12 103 104,02 €\` de RAR Recettes).
   - L'affectation au **compte 1068 (\`16 399 407,33 €\`)** couvre 100 % du déficit d'exécution D001 (\`10 430 496,46 €\`) et l'intégralité du solde net des RAR (\`2 972 119,78 €\`), tout en dégageant un excédent de financement qui permet de **réduire le recours à l'emprunt inscrit en 2026 de \`-3 063 418,02 €\`** (Chapitre 16 Recettes).
   - Le reliquat de **\`1 000 000,00 €\`** est repris en **R002** (recette de fonctionnement reportée) pour sécuriser l'exécution 2026.

2. **Ajustements de la section de fonctionnement au BS 2026 (\`+1 790 209,00 €\`, reports 2025 nuls) :**
   - **En recettes (\`+1 790 209,00 €\`) :** outre le report R002 (\`+1 000 000,00 €\`), la Ville inscrit \`+885 289,00 €\` de dotations et participations (Chap. 74), \`+270 059,00 €\` d'autres produits de gestion courante (Chap. 75) et \`+108 257,00 €\` de fiscalité locale (Chap. 731), qui absorbent intégralement la moins-value sur le Chapitre 73 *Impôts et taxes* (\`-453 396,00 €\`) et l'ajustement du Chapitre 70 (\`-20 000,00 €\`).
   - **En dépenses (\`+1 790 209,00 €\`) :** abondement ciblé des charges à caractère général Chap. 011 (\`+1 063 249,98 €\`), des autres charges de gestion courante Chap. 65 (\`+243 209,43 €\`), des charges financières Chap. 66 (\`+200 000,00 €\` liés aux taux d'intérêt), et transfert d'un **virement complémentaire à la section d'investissement de \`+283 749,59 €\`** (Chap. 023 / Chap. 021). **Aucun crédit supplémentaire n'est demandé sur le Chapitre 012 (masse salariale maintenue à \`96 063 865,00 €\`)**.

3. **Consolidation budgétaire annuelle 2026 (BP Primitif + BS 2026) :**

| Section / Agrégat | BP 2026 (Délib. 2026/S1/001) | BS 2026 Nouveaux (2026/S6/004) | Reports RAR 2025 | Total Consolidé 2026 (BP + BS) |
|---|---|---|---|---|
| **Section de Fonctionnement** | \`168 150 735,30 €\` | \`+1 790 209,00 €\` | \`0,00 €\` | **\`169 940 944,30 €\`** |
| **Section d'Investissement** | \`82 517 370,00 €\` | \`+10 424 375,12 €\` (Dép.) / \`+13 396 494,90 €\` (Rec.) | \`15 075 223,80 €\` (Dép.) / \`12 103 104,02 €\` (Rec.) | **\`108 016 968,92 €\`** |
| **Total Général du Budget** | **\`250 668 105,30 €\`** | **\`+12 214 584,12 €\` (Dép. nouv.)** | **\`+15 075 223,80 €\` (RAR Dép.)** | **\`277 957 913,22 €\`** |
| *dont Virement 023 ➔ 021* | \`2 452 764,65 €\` | \`+283 749,59 €\` | \`0,00 €\` | **\`2 736 514,24 €\`** |
| *dont Chap. 011 (Charges générales)* | \`41 058 892,92 €\` | \`+1 063 249,98 €\` | \`0,00 €\` | **\`42 122 142,90 €\`** |
| *dont Chap. 012 (Masse salariale)* | \`96 063 865,00 €\` | \`0,00 €\` | \`0,00 €\` | **\`96 063 865,00 €\`** |
| *dont Chap. 66 (Intérêts dette)* | \`1 750 000,00 €\` | \`+200 000,00 €\` | \`0,00 €\` | **\`1 950 000,00 €\`** |
| *dont Chap. 16 Rec. (Emprunts)* | \`45 048 216,22 €\` | \`-3 063 418,02 €\` | \`+8 000 000,00 €\` | **\`49 984 798,20 €\`** |

---

## 2. Cadre Juridique et Réglementaire Applicable

- **Code général des collectivités territoriales (CGCT) :**
  - **Articles L. 2121-12 et L. 2121-17 :** Respect du délai de convocation de 5 jours francs (convocation du 17/09/2026 pour la séance du 23/09/2026), note explicative de synthèse jointe et vérification du quorum (39 conseillers présents sur 45 en exercice, 5 pouvoirs valides, 1 absent excusé).
  - **Article L. 1612-4 :** Obligation d'équilibre réel par section, évaluation sincère des recettes et des dépenses, et couverture intégrale du remboursement en capital des emprunts (\`9 549 700,00 €\` consolidé) par les ressources propres d'autofinancement.
  - **Articles L. 1612-11, L. 2311-5 et R. 2311-11 à R. 2311-12 :** Compétence exclusive de l'assemblée délibérante pour le vote du Budget Supplémentaire par chapitre, reprise obligatoire des résultats du CFU 2025, affectation prioritaire de l'excédent de fonctionnement à la couverture du besoin de financement d'investissement (compte 1068) et justification des restes à réaliser (RAR) par des engagements juridiques ou notifications de recettes antérieurs au 31/12/2025.
- **Instruction budgétaire et comptable M57 (millésime 2026) :**
  - **Fongibilité asymétrique des crédits :** En vertu de l'article 2 de la délibération n°2026/S1/001 du 4 février 2026, le Maire est autorisé à procéder à des virements de crédits de chapitre à chapitre au sein d'une même section dans la limite de **7,5 % des dépenses réelles de chaque section** (soit \`${plafondFongibiliteFonct.toLocaleString('fr-FR')} €\` en fonctionnement), **à l'exclusion des crédits relatifs aux dépenses de personnel (Chap. 012) et des subventions aux associations**. Toute décision de virement prise par le Maire doit être transmise au représentant de l'État et portée à la connaissance du Conseil municipal lors de la plus proche séance.

### Points de vigilance identifiés sur l'exercice :
${result.diagnosticGlobal.pointsVigilance.length > 0
  ? result.diagnosticGlobal.pointsVigilance.map(p => `- ⚠️ **${p}**`).join('\n')
  : '- ✅ **Conformité des grands équilibres :** L’épargne brute couvre intégralement l’annuité en capital de la dette et le délai de désendettement demeure inférieur au seuil d’alerte CRC de 10 ans.'}
- ⚠️ **Vigilance sur le rythme de liquidation des RAR d'investissement (\`15 075 223,80 €\`) :** L'importance des reports 2025 sur les chapitres 20 (\`1,97 M€\`), 21 (\`7,14 M€\`) et 23 (\`5,97 M€\`) impose un suivi serré des mandatements d'ici le 31/12/2026 pour éviter un taux d'annulation ou de glissement pluriannuel relevé en contrôle CRC.
- ⚠️ **Surveillance des frais financiers (Chapitre 66) :** L'abondement de \`+200 000,00 €\` (+11,4 % par rapport au BP 2026) traduit la sensibilité de l'encours à taux variable ; la réduction de \`-3,06 M€\` de l'emprunt nouveau au BS 2026 constitue une mesure d'atténuation opportune.

---

## 3. Options et Scénarios Soumis à l'Arbitrage de l'Autorité Territoriale

| Option d'arbitrage | Intérêt stratégique & de gestion | Incidence budgétaire documentée | Risques / Contraintes juridiques | Validation requise |
|---|---|---|---|---|
| **Option 1 (Recommandée) : Exécution prudentielle & Désendettement actif** | Sanctuarise la baisse d'emprunt votée au BS (\`-3,06 M€\`), sécurise l'autofinancement net (\`${result.epargneNette.toLocaleString('fr-FR')} €\`) et accélère l'apurement des RAR 2025 | Gel de précaution de 2 % sur les crédits non engagés du Chap. 011 au 15/11/2026 ; mobilisation prioritaire des \`12,10 M€\` de RAR Recettes | Nécessite un cadencement strict des bons de commande par les directions opérationnelles | Arbitrage DGS / Maire + Circulaire de clôture DAF |
| **Option 2 : Mobilisation de la fongibilité M57 ou ajustement RH de fin d'exercice (CIA / IFSE)** | Permet d'absorber d'éventuelles tensions énergétiques ou de revaloriser le régime indemnitaire (CIA / primes) sans dégrader l'équilibre global | Fongibilité disponible hors 012 : jusqu'à \`${plafondFongibiliteFonct.toLocaleString('fr-FR')} €\` • +1 % sur le Chap. 012 équivaut à \`+${impactRifseep1Pct.toLocaleString('fr-FR')} €\` | **Attention :** La fongibilité M57 exclut le Chap. 012 et les subventions (Chap. 65). Tout abondement du 012 exige une Décision Modificative (DM) en Conseil municipal | Délibération CM (si Chap. 012/asso) ou Décision du Maire (si fongibilité 011/66/67) |
| **Option 3 : Reprofilage du PPI & Accélération des chantiers (Chap. 21 & 23)** | Maximise le taux de réalisation des \`66,96 M€\` de crédits d'équipement consolidés (BP+BS) et optimise l'assiette éligible au FCTVA 2027 | Mandatement prioritaire des \`13,11 M€\` de RAR travaux (Chap. 21 + 23) et tirage conditionnel des \`8,00 M€\` d'emprunts reportés | Risque de tension sur la trésorerie de fin d'année si les subventions notifiées (\`4,10 M€\` de RAR Chap. 13) tardent à être encaissées | Revue conjointe DAF / Direction des Bâtiments & Travaux / SGC |

---

## 4. Proposition Opérationnelle & Circuit de Validation

### 4.1. Plan d'exécution proposé pour le 4e trimestre 2026
1. **Validation de l'Option 1** comme trajectoire centrale de fin d'exercice, assortie d'une **revue contradictoire des Restes à Réaliser (\`15,08 M€\` en dépenses / \`12,10 M€\` en recettes)** avant le 30 novembre 2026.
2. **Arrêté anticipé des engagements de fonctionnement (hors dépenses obligatoires et RH)** au **20 novembre 2026** afin de fiabiliser les rattachements de charges et produits (procédure M57 de clôture en vue du CFU 2026).
3. **Vérification de l'opération financière symétrique du Chapitre 27 (\`1 120 500,00 €\` en dépenses et en recettes au BS 2026)** avec le Service de Gestion Comptable (SGC) pour s'assurer de l'exacte concordance avec l'état de l'actif.

### 4.2. Circuit de validation et visas requis
- **Visas techniques préalables :** Direction des Affaires Financières (concordance budgétaire M57) • Direction des Ressources Humaines (suivi GVT et plafond Chap. 012 à \`96,06 M€\`) • Service Juridique / Commande Publique (marchés liés aux RAR).
- **Autorité compétente :** Monsieur Patrice LECLERC, Maire de Gennevilliers (pour décision d'arbitrage interne ou arrêté de fongibilité M57), ou Conseil Municipal (en cas de Décision Modificative n°2 avant le 31/12/2026).
- **Contrôle externe et publicité :** Transmission au contrôle de légalité (Préfecture des Hauts-de-Seine), publication réglementaire sur *Publiact* et notification au Comptable public assignataire (flux PESv2).

---

## 5. Points Ouverts et Pièces Complémentaires à Consolider

- [ ] **État détaillé des Restes à Réaliser 2025 par opération et marché** justifiant les \`15 075 223,80 €\` en dépenses et les \`12 103 104,02 €\` en recettes (dont les arrêtés attributifs de subventions du Chap. 13 pour \`4 103 104,02 €\` et les contrats de prêt correspondant aux \`8 000 000,00 €\` de RAR du Chap. 16).
- [ ] **Note justificative de l'opération croisée de \`1 120 500,00 €\` au Chapitre 27** (*Autres immobilisations financières* — p. 3 et 4 de la délibération n°2026/S6/004).
- [ ] **Point d'étape RH au 31 octobre 2026** confirmant l'atterrissage du Chapitre 012 dans la limite stricte des \`96 063 865,00 €\` votés au BP 2026.
`;
}

/**
 * Générateur de la Note d'Arbitrage à l'Autorité Territoriale — PRÉPARATION DU BUDGET PRIMITIF 2027
 * Base de départ : budget consolidé 2026 (BP 2026 + BS n°2026/S6/004) — les projections 2027 sont des HYPOTHÈSES DE CADRAGE
 * explicitement signalées comme telles et à valider par la DAF / DRH (aucune donnée 2027 n'est présentée comme un fait établi).
 */
export function genererNoteArbitrageBP2027(options: { objet?: string; signataire?: string }): string {
  const base = PRESETS_COLLECTIVITES.gennevilliers_principal_delib_2026;
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const objet = options.objet || "Orientations et arbitrages pour la préparation du Budget Primitif 2027 (cadrage budgétaire M57, trajectoire financière 2027 et lettre de cadrage aux directions)";
  const signataire = options.signataire || 'Direction Générale des Services / Direction des Affaires Financières';

  const fmt = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const fmtM = (n: number) => `${(n / 1_000_000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M€`;
  const fmtPct = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

  // ── Base de référence 2026 (consolidée BP + BS) ───────────────────────────
  const R002 = 1_000_000; // report de fonctionnement non reconductible (BS 2026)
  const rrf26 = base.recettesReellesFonctionnement;
  const drf26 = base.depensesReellesFonctionnement;
  const rrf26Retraite = rrf26 - R002;
  const chap012 = base.depensesPersonnel012 || 96_063_865;
  const chap011 = 42_122_142.9;
  const chap66 = 1_950_000;
  const capital = base.remboursementCapitalDette;
  const dette = base.encoursDetteFinExercice;
  const eb26 = rrf26 - drf26;
  const eb26Retraite = rrf26Retraite - drf26;
  const taux26 = (eb26 / rrf26) * 100;
  const taux26Retraite = (eb26Retraite / rrf26Retraite) * 100;

  // ── Hypothèses mécaniques 2027 (à valider) ────────────────────────────────
  const hypGVT = Math.round(chap012 * 0.012); // GVT / glissement (hyp. +1,2 % du chap. 012)
  const assietteCnracl = 50_000_000; // hyp. centrale (fourchette 40–60 M€)
  const hypCnracl = Math.round(assietteCnracl * 0.03); // +3 points de cotisation patronale CNRACL
  const hypCnraclBas = Math.round(40_000_000 * 0.03);
  const hypCnraclHaut = Math.round(60_000_000 * 0.03);
  const hyp011 = Math.round(chap011 * 0.015); // inflation / énergie sur le chap. 011 (hyp. +1,5 %)
  const mecaniqueTotal = hypGVT + hypCnracl + hyp011;
  const rrfGrowth = 0.01; // hyp. prudente +1,0 % sur les recettes réelles retraitées

  type Scenario = { code: string; nom: string; drf: number; rrf: number; eb: number; taux: number; en: number; capacite: number; effort: number };
  const rrf27 = rrf26Retraite * (1 + rrfGrowth);
  const drfS1 = drf26 + mecaniqueTotal;
  const drfS2 = drf26 * 1.015;
  const drfS3 = drf26 * 1.008;
  const mk = (code: string, nom: string, drf: number): Scenario => {
    const eb = rrf27 - drf;
    return {
      code,
      nom,
      drf,
      rrf: rrf27,
      eb,
      taux: (eb / rrf27) * 100,
      en: eb - capital,
      capacite: eb > 0 ? dette / eb : Infinity,
      effort: Math.max(0, drfS1 - drf),
    };
  };
  const sc1 = mk('A', 'Tendanciel (au fil de l’eau)', drfS1);
  const sc2 = mk('B', 'Cadrage maîtrisé (recommandé)', drfS2);
  const sc3 = mk('C', 'Maîtrise renforcée', drfS3);
  const planchetEB = rrf27 * 0.08; // taux d'épargne brute plancher de vigilance DGCL 8 %
  const ecartPlancherB = Math.max(0, planchetEB - sc2.eb);
  const capStr = (c: number) => (Number.isFinite(c) ? `${c.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ans` : 'incalculable');
  const capaciteSelonEmprunt = (ebRef: number, ajoutM: number) => (dette + ajoutM * 1_000_000) / ebRef;
  const statutCap = (c: number) => (c < 8 ? 'Zone de confort (< 8 ans)' : c < 10 ? 'Vigilance (8–10 ans)' : c < 12 ? 'Alerte CRC (10–12 ans)' : 'Critique (> 12 ans)');
  const effort012B = Math.max(0, sc2.effort - hyp011); // part de l'effort B à absorber sur le chap. 012 après gel du chap. 011
  const enveloppe012B = chap012 + hypGVT + hypCnracl - effort012B;
  const plafondFongibilite = Math.round(drf26 * 0.075);
  const unPctChap012 = Math.round(chap012 * 0.01);
  const unPctChap011 = Math.round(chap011 * 0.01);
  const unPctRrf = Math.round(rrf26Retraite * 0.01);

  return `# Projet de note d'arbitrage à l'autorité territoriale — Préparation du Budget Primitif 2027

**Destinataire :** Monsieur Patrice LECLERC, Maire de Gennevilliers / Autorité territoriale
**Émetteur :** ${signataire}
**Date :** ${dateStr}
**Objet :** ${objet}
**Entité, compétence et période :** Ville de Gennevilliers — Commune (51 200 hab.) — Budget principal M57 — Exercice **2027** (Budget Primitif) — Base de départ : budget consolidé 2026 (BP + BS)
**Pièces de référence :**
- Délibération n°2026/S1/001 du 4 février 2026 (Budget Primitif 2026 : ${fmt(250_668_105.3)})
- Délibération n°2026/S6/004 du 23 septembre 2026 (Budget Supplémentaire 2026 : ${fmt(27_289_807.92)} ; Budget consolidé 2026 : ${fmt(277_957_913.22)})
- Compte Financier Unique (CFU) 2025 et affectation du résultat 2025
**Statut :** *Projet préparatoire à relire par la DGS et l'exécutif, sans signature ni transmission externe — Ne constitue pas un acte exécutoire. Les chiffres 2027 sont des hypothèses de cadrage (signalées « hyp. ») à valider par la DAF et la DRH ; seuls les chiffres 2025-2026 sont issus des délibérations.*

---

## 1. Synthèse et décisions attendues de l'autorité territoriale

La préparation du BP 2027 s'ouvre dans un contexte d'**effet de ciseau** : des charges de personnel largement mécaniques (GVT, hausse de la cotisation patronale CNRACL) face à des recettes dont la dynamique reste incertaine (loi de finances 2027, revalorisation forfaitaire des bases). L'épargne brute consolidée 2026 s'établit à **${fmt(eb26)}** (${fmtPct(taux26)} des RRF), soit **${fmt(eb26Retraite)}** (${fmtPct(taux26Retraite)}) une fois retraité le report R002 de ${fmt(R002)} qui ne se reproduira pas en 2027.

**Décisions demandées à M. le Maire :**
1. **Valider le scénario de cadrage 2027** (recommandation : scénario B « Cadrage maîtrisé », évolution des dépenses réelles de fonctionnement plafonnée à **+1,5 %**, soit **${fmt(sc2.drf)}**).
2. **Fixer l'enveloppe du chapitre 012** et le périmètre des mesures RH nouvelles (CIA / IFSE, créations de postes, avancements) — chaque tranche de +1 % représente **${fmt(unPctChap012)}**.
3. **Arrêter la doctrine d'investissement et d'endettement** (plafond du PPI 2027, emprunt d'équilibre maximal, seuil de capacité de désendettement à ne pas dépasser).
4. **Autoriser l'envoi de la lettre de cadrage** aux directions (semaine du 16 novembre 2026) et le calendrier de préparation budgétaire (§ 8.2).
5. **Autoriser l'ouverture anticipée des crédits d'investissement** (art. L. 1612-1 CGCT) si le BP 2027 est voté après le 1er janvier 2027, comme en 2026.

---

## 2. Point de départ : situation financière de référence (budget consolidé 2026)

| Agrégat M57 | Budget consolidé 2026 (BP + BS) | Observation |
|---|---|---|
| **Recettes réelles de fonctionnement (RRF)** | **${fmt(rrf26)}** | dont ${fmt(R002)} de report R002 (non reconductible) → **${fmt(rrf26Retraite)}** retraitées |
| **Dépenses réelles de fonctionnement (DRF)** | **${fmt(drf26)}** | dont chap. 011 : ${fmt(chap011)} • chap. 012 : ${fmt(chap012)} • chap. 66 : ${fmt(chap66)} |
| **Épargne brute** | **${fmt(eb26)}** (${fmtPct(taux26)}) | **${fmt(eb26Retraite)}** (${fmtPct(taux26Retraite)}) retraitée du R002 — en limite basse / en deçà de la zone de vigilance DGCL (8–10 %) |
| **Remboursement du capital de la dette** | **${fmt(capital)}** | Couverture obligatoire par l'épargne brute (art. L. 1612-4 CGCT) |
| **Épargne nette** | **${fmt(eb26 - capital)}** | **${fmt(eb26Retraite - capital)}** retraitée du R002 |
| **Encours de dette au 31/12** | **${fmt(dette)}** | Capacité de désendettement : **${capStr(dette / eb26)}** (${capStr(dette / eb26Retraite)} retraitée) |
| **Poids du chap. 012 dans les DRF** | **${fmtPct((chap012 / drf26) * 100)}** | Rigidité structurelle : toute économie significative passe par la maîtrise du 012 |
| **Restes à réaliser 2025 repris (invest.)** | **${fmt(15_075_223.8)}** (dép.) / **${fmt(12_103_104.02)}** (rec.) | Dont ${fmt(8_000_000)} d'emprunts reportés — à liquider avant le CFU 2026 |

**Lecture :** la solvabilité n'est pas en cause (capacité de désendettement inférieure à 8 ans), mais la **marge d'autofinancement est étroite** : l'épargne nette retraitée (${fmt(eb26Retraite - capital)}) finance une part limitée du PPI. Le sujet du BP 2027 est donc le **taux d'épargne brute**, plus que le niveau d'endettement.

---

## 3. Contraintes et hypothèses structurantes pour 2027

| Facteur | Effet estimé sur 2027 | Nature | Statut / à valider |
|---|---|---|---|
| **Glissement-vieillesse-technicité (GVT)** | +${fmt(hypGVT)} (hyp. +1,2 % du chap. 012) | Dépense obligatoire | DRH : simulation avancements d'échelon / grade et promotions |
| **Cotisation patronale CNRACL** : trajectoire de +3 points par an (2025-2028), taux porté à **40,65 %** au 1er janvier 2027 | +${fmt(hypCnracl)} (hyp. assiette ${fmtM(assietteCnracl)} ; fourchette ${fmtM(hypCnraclBas)} à ${fmtM(hypCnraclHaut)} pour une assiette de 40 à 60 M€) | Dépense obligatoire | DRH : assiette CNRACL réelle 2026 |
| **Inflation / énergie (chap. 011)** | +${fmt(hyp011)} (hyp. +1,5 % du chap. 011) | Dépense semi-contrainte | Directions : marchés révisables, contrats énergie |
| **Protection sociale complémentaire (PSC)** | Montée en charge en année pleine (participation santé obligatoire depuis 2026, prévoyance depuis 2025) | Dépense obligatoire | DRH : taux d'adhésion constaté |
| **Recettes fiscales** : revalorisation forfaitaire des bases (indexée sur l'inflation constatée) | +${fmt(unPctRrf)} par point de RRF (hyp. prudente +1,0 % retenue) | Recette | Notification des bases (printemps 2027) — ajustable au BS |
| **Dotations / péréquation (DGF, DSU, FPIC) et dispositifs éventuels de contribution des collectivités à l'effort de redressement** | Non chiffré — **risque principal** | Recette | **À intégrer dès l'adoption définitive de la loi de finances 2027** |
| **Charges financières (chap. 66)** : ${fmt(chap66)} en 2026 | Sensibilité : +100 pb sur 10 M€ d'encours à taux variable = +100 000 € | Dépense | DAF : tableau d'amortissement, part variable de l'encours |
| **Élections professionnelles du 10 décembre 2026** | Installation des nouvelles instances en 2027 — conditionne le calendrier du dialogue social sur les mesures RH | Calendrier | DRH / DGS |

**Cumul des effets mécaniques identifiés (GVT + CNRACL + inflation 011) : +${fmt(mecaniqueTotal)}** avant toute mesure nouvelle, soit **+${fmtPct((mecaniqueTotal / drf26) * 100)}** de DRF.

---

## 4. Scénarios de cadrage soumis à l'arbitrage (hypothèses 2027)

Hypothèses communes : RRF 2027 = base 2026 retraitée du R002 + 1,0 % = **${fmt(rrf27)}** ; chap. 65 et 66 supposés stables dans le scénario tendanciel ; capital de la dette stabilisé à ${fmt(capital)} ; encours stable (emprunt nouveau = capital remboursé).

| | **A — Tendanciel** | **B — Cadrage maîtrisé (recommandé)** | **C — Maîtrise renforcée** |
|---|---|---|---|
| **Hypothèse sur les DRF** | Effets mécaniques seuls (+${fmtPct((mecaniqueTotal / drf26) * 100)}) | **+1,5 %** | +0,8 % |
| **DRF 2027** | ${fmt(sc1.drf)} | **${fmt(sc2.drf)}** | ${fmt(sc3.drf)} |
| **Effort d'économies à documenter** | ${fmt(sc1.effort)} | **${fmt(sc2.effort)}** | ${fmt(sc3.effort)} |
| **Épargne brute 2027** | ${fmt(sc1.eb)} | **${fmt(sc2.eb)}** | ${fmt(sc3.eb)} |
| **Taux d'épargne brute** | ${fmtPct(sc1.taux)} | **${fmtPct(sc2.taux)}** | ${fmtPct(sc3.taux)} |
| **Épargne nette** | ${fmt(sc1.en)} | **${fmt(sc2.en)}** | ${fmt(sc3.en)} |
| **Capacité de désendettement** | ${capStr(sc1.capacite)} | **${capStr(sc2.capacite)}** | ${capStr(sc3.capacite)} |
| **Intérêt / risque** | Aucun effort de gestion, mais érosion de l'épargne et de la capacité d'investissement | Absorbe les hausses obligatoires en contenant les autres postes ; **épargne nette positive** | Rétablit un taux d'épargne proche du plancher de vigilance ; exige des arbitrages difficiles sur le service rendu |
| **Validation requise** | — | Arbitrage Maire / DGS | Arbitrage Maire / DGS + dialogue de gestion renforcé |

**Sensibilités :** ±1 point de RRF = ±${fmt(unPctRrf)} d'épargne brute • ±1 % du chap. 012 = ±${fmt(unPctChap012)} • ±1 % du chap. 011 = ±${fmt(unPctChap011)}.

**Analyse :** le scénario **A** réduit l'épargne brute à ${fmt(sc1.eb)} (${fmtPct(sc1.taux)}) : l'épargne nette tombe à ${fmt(sc1.en)}. Le scénario **B** est le point d'équilibre recommandé : il couvre intégralement l'annuité en capital (épargne nette ${fmt(sc2.en)}) mais laisse le taux d'épargne à ${fmtPct(sc2.taux)}, **en dessous du plancher de vigilance de 8 %** (épargne brute plancher : ${fmt(planchetEB)}, soit un écart de ${fmt(ecartPlancherB)}). Il est donc proposé d'assortir B d'une **clause de revoyure** : si, à la notification des bases fiscales et des dotations (printemps 2027), le taux d'épargne projeté demeure inférieur à 8 %, un **plan complémentaire de ${fmt(ecartPlancherB)}** (recettes tarifaires, optimisation des subventions, report de dépenses d'équipement non engagées) serait activé au Budget Supplémentaire 2027.

---

## 5. Cadrage du fonctionnement par chapitre (proposition de lettre de cadrage)

| Chapitre | Base 2026 consolidée | Proposition de cadrage 2027 (scénario B) | Levier / condition |
|---|---|---|---|
| **011 — Charges à caractère général** | ${fmt(chap011)} | **Reconduction en valeur (0 %)** : l'inflation (+${fmt(hyp011)} en tendanciel) est absorbée par des économies de gestion ; **gel de précaution de 2 %** sur les crédits non engagés | Marchés pluriannuels, mutualisation des achats, revue des contrats |
| **012 — Charges de personnel** | ${fmt(chap012)} | Enveloppe fermée de **${fmt(enveloppe012B)}** = base 2026 + **GVT + CNRACL** (+${fmt(hypGVT + hypCnracl)} hyp.) − **${fmt(effort012B)}** d'effort de gestion des effectifs (vacances de postes, décalage de recrutements) ; **aucune création nette de poste** sans redéploiement ou recette dédiée ; mesures nouvelles (CIA / IFSE) soumises à arbitrage spécifique (§ 6) | Gestion prévisionnelle des effectifs, vacances de postes, remplacements |
| **65 — Autres charges de gestion courante** | Voir BP/BS 2026 | Subventions aux associations et participations : **reconduction en valeur**, revue ciblée par convention | **Hors fongibilité M57** : toute évolution relève du Conseil municipal |
| **66 — Charges financières** | ${fmt(chap66)} | Inscription prudente au regard des taux ; **ajustement possible par fongibilité** (hors 012 et subventions) dans la limite de 7,5 % des DRF, soit ${fmt(plafondFongibilite)} | DAF : renégociation / arbitrage taux fixe-variable |
| **Recettes (70, 73, 74, 75)** | ${fmt(rrf26Retraite)} (hors R002) | **+1,0 %** inscrit de façon prudente ; **revue des tarifs municipaux** et des participations familiales | Délibération tarifaire (Conseil municipal) |

---

## 6. Arbitrages politiques et RH à trancher (check-list de décision)

| Sujet | Enjeu financier documentable | Décision attendue |
|---|---|---|
| **Régime indemnitaire (IFSE / CIA)** | +1 % de la masse salariale = **${fmt(unPctChap012)}** ; intégrer le calendrier des élections professionnelles du 10 décembre 2026 | ☐ Maintien à enveloppe constante  ☐ Revalorisation ciblée (périmètre à définir)  ☐ Report après installation des instances |
| **Créations / transformations de postes** | À chiffrer par la DRH (coût en année pleine, charges patronales CNRACL à 40,65 %) | ☐ Aucune création nette  ☐ Créations compensées par redéploiement  ☐ Créations financées par recette dédiée |
| **Avancements et promotions** | Inclus dans le GVT (+${fmt(hypGVT)} hyp.) | ☐ Respect des ratios promus-promouvables en vigueur  ☐ Révision de la politique d'avancement |
| **Protection sociale complémentaire** | Effet année pleine à confirmer (adhésions) | ☐ Maintien du cadre actuel  ☐ Évolution du niveau de participation |
| **Subventions aux associations** | Hors fongibilité ; relève du Conseil municipal | ☐ Reconduction en valeur  ☐ Revue ciblée par convention |
| **Tarification des services municipaux** | +1 point de recettes tarifaires = à chiffrer par la DAF | ☐ Statu quo  ☐ Indexation  ☐ Révision ciblée |

---

## 7. Investissement, dette et cadrage du PPI

**Constats (budget consolidé 2026) :** crédits d'équipement consolidés de **66,96 M€** (chap. 20, 204, 21, 23) ; **restes à réaliser en dépenses de ${fmt(15_075_223.8)}** (dont ${fmt(13_109_325.03)} de travaux, chap. 21 + 23) ; **${fmt(4_103_104.02)}** de subventions notifiées non encore encaissées (chap. 13) ; **${fmt(8_000_000)}** d'emprunts reportés ; virement de la section de fonctionnement de ${fmt(2_736_514.24)}.

**Doctrine proposée pour le PPI 2027 :**
1. **Prioriser l'achèvement des opérations engagées** (RAR 2025 et opérations en cours) avant tout lancement nouveau ; maximiser le taux de réalisation 2026 pour fiabiliser le FCTVA 2027.
2. **Ne financer les opérations nouvelles qu'à hauteur de l'autofinancement disponible**, des subventions notifiées et du FCTVA, l'emprunt d'équilibre étant plafonné au capital remboursé (encours stable) sauf décision contraire.
3. **Programmer en AP/CP** les opérations pluriannuelles pour lisser l'impact sur l'épargne.

**Sensibilité de la capacité de désendettement à l'emprunt nouveau net** (épargne brute scénario B : ${fmt(sc2.eb)}) :

| Emprunt nouveau net additionnel | Encours projeté | Capacité de désendettement | Zone |
|---|---|---|---|
${[0, 5, 10, 15]
    .map((m) => `| +${m} M€ | ${fmtM(dette + m * 1_000_000)} | ${capStr(capaciteSelonEmprunt(sc2.eb, m))} | ${statutCap(capaciteSelonEmprunt(sc2.eb, m))} |`)
    .join('\n')}

**Recommandation :** fixer comme **garde-fou** une capacité de désendettement ≤ **8 ans** à l'issue du BP 2027 ; au-delà, tout nouvel emprunt doit faire l'objet d'un arbitrage spécifique.

---

## 8. Cadre juridique et calendrier de préparation

### 8.1. Cadre applicable
- **Article L. 2312-1 et D. 2312-3 CGCT :** débat d'orientations budgétaires (DOB) sur la base d'un rapport d'orientations budgétaires, dans les **dix semaines précédant l'examen du budget**, en délibération distincte ; pour une commune de plus de 10 000 habitants, le rapport comprend la structure et l'évolution des dépenses de personnel et des effectifs (temps de travail, rémunérations) et la structure et la gestion de la dette.
- **Article L. 2311-1-1 CGCT :** présentation des objectifs d'évolution des dépenses réelles de fonctionnement et du besoin de financement annuel.
- **Article L. 1612-1 CGCT :** en l'absence de vote du budget avant le 1er janvier, l'exécutif peut, sur autorisation du Conseil, engager et mandater des dépenses d'investissement dans la limite de **25 %** des crédits ouverts l'exercice précédent (hors remboursement de la dette).
- **Article L. 1612-2 CGCT :** date limite de vote du budget : **15 avril 2027**.
- **Article L. 1612-4 CGCT :** équilibre réel (sincérité des évaluations, couverture du capital de la dette par des ressources propres).
- **Instruction M57 et règlement budgétaire et financier :** vote par chapitre ; fongibilité asymétrique de 7,5 % des dépenses réelles de chaque section, **hors chap. 012 et subventions** (art. 2 de la délibération n°2026/S1/001 à reconduire pour 2027).
- **CFU 2026 :** à voter avant le **30 juin 2027** ; affectation du résultat et BS 2027 ensuite.

### 8.2. Rétroplanning proposé

| Échéance | Étape | Responsable |
|---|---|---|
| **Semaine du 16 novembre 2026** | Arbitrage de la présente note ; validation du scénario de cadrage | Maire / DGS |
| **20 novembre 2026** | Lettre de cadrage aux directions ; arrêté anticipé des engagements de fonctionnement 2026 | DGS / DAF |
| **23 novembre – 4 décembre 2026** | Remontée des demandes de crédits (fonctionnement) et fiches projet PPI | Directions |
| **7 – 11 décembre 2026** | Conférences budgétaires par direction | DGS / DAF / DRH |
| **10 décembre 2026** | Élections professionnelles (point de vigilance dialogue social) | DRH |
| **Décembre 2026** | Délibération d'autorisation d'engager 25 % des crédits d'investissement (L. 1612-1) | Conseil municipal |
| **Janvier 2027** | Arbitrages finaux ; rapport d'orientations budgétaires ; **DOB** | Maire / DGS / Conseil municipal |
| **Début février 2027** (réf. 2026 : 4 février) | **Vote du BP 2027** ; transmission au contrôle de légalité ; publication | Conseil municipal |
| **Avant le 15 avril 2027** | Date limite légale de vote du budget | — |
| **Avant le 30 juin 2027** | Vote du CFU 2026 ; affectation du résultat ; **BS 2027** (revoyure) | Conseil municipal |

---

## 9. Points ouverts et pièces complémentaires à consolider

- [ ] **Simulation DRH 2027 du chapitre 012** : GVT, assiette CNRACL réelle, effet PSC en année pleine, effectifs et vacances (remplace les hypothèses du § 3).
- [ ] **Tableau d'amortissement 2027** et répartition taux fixe / taux variable de l'encours (DAF) : capital et intérêts 2027 définitifs.
- [ ] **Loi de finances 2027** : DGF, DSU, FPIC, mécanismes éventuels de contribution des collectivités, revalorisation forfaitaire des bases — à intégrer dès adoption définitive.
- [ ] **État des RAR 2026 par opération** et projection du taux de réalisation d'investissement au 31/12/2026.
- [ ] **Évaluation du PPI 2027** (AP/CP, plan de financement, subventions notifiées) par la direction des bâtiments et travaux.
- [ ] **Rapport d'orientations budgétaires 2027** (structure des effectifs, dépenses de personnel, dette) pour le DOB.
- [ ] **Vérification par la DGS et le service juridique** de l'ensemble des références réglementaires avant diffusion.
`;
}

/**
 * Générateur du Rapport de Revue Publique Locale & Audit Interne M57 (Conforme au skill collectivites-territoriales & au BS 2026 n°2026/S6/004)
 */
export function genererRapportAuditM57(
  result: BudgetM57Result,
  piecesCRC: Array<{ id: string; domaine: string; titre: string; statut: 'recu' | 'manquant' | 'non_applicable' }>
): string {
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const piecesValidees = piecesCRC.filter(p => p.statut === 'recu').length;
  const piecesManquantesList = piecesCRC.filter(p => p.statut === 'manquant');
  const piecesNA = piecesCRC.filter(p => p.statut === 'non_applicable').length;
  const tauxCompletude = Math.round((piecesValidees / Math.max(1, piecesCRC.length - piecesNA)) * 100);

  return `# Projet de rapport de revue publique locale & d'audit interne M57

**Statut : Travail préparatoire de contrôle interne à vérifier — Ne constitue ni une certification de comptes, ni un contrôle budgétaire préfectoral, ni une lettre d'observations de la Chambre Régionale des Comptes (CRC).**

---

## 1. Mandat, Périmètre et Pièces Examinées

- **Entité et statut juridique :** Ville de Gennevilliers (Commune — Département des Hauts-de-Seine, 92 — 51 200 habitants), collectivité territoriale régie par le Code général des collectivités territoriales (CGCT).
- **Périmètre budgétaire, référentiel et période :** Budget principal de la Commune (et articulation avec les budgets annexes M57 *Restauration du personnel* et *Cinéma Jean Vigo*) • Instruction budgétaire et comptable **M57 (millésime 2026)** avec vote par chapitre • Exercices **2025 (clôture CFU)** et **2026 (BP Primitif & Budget Supplémentaire)** — Profil analysé : *${result.collectiviteNom}*.
- **Objet, destinataire et responsable de validation :** Revue documentaire de régularité budgétaire, d'équilibre réel (art. L. 1612-4 CGCT) et de piste d'audit M57, destinée à la Direction Générale des Services (DGS) et à la Direction des Affaires Financières (DAF), sous la responsabilité de validation de l'Ordonnateur.
- **Pièces officielles reçues, versions et dates d'examen (${dateStr}) :**
  1. **Délibération n°2026/S6/004 du 23 septembre 2026** (*Budget Supplémentaire de la Commune pour l'exercice 2026*, 4 pages, convoqué le 17/09/2026, 39 présents, 5 représentés, 1 absent excusé, adopté par 40 voix pour et 4 contre ; signé électroniquement le 25/09/2026 par M. Patrice LECLERC, Maire, et le 28/09/2026 par M. Tristan PEPIN, Secrétaire de séance ; télétransmis et publié le 29/09/2026 sous l'AR \`092-219200367-20260925-2236-DE\`, chaîne d'intégrité \`43 40 2F 09 90 69 5E 5D 59 3A B7 50 3A 9A BB E5\`, Publiact \`1171016\`).
  2. **Délibération n°2026/S1/001 du 4 février 2026** (*Budget Primitif 2026 de la Commune*, équilibré à \`250 668 105,30 €\`, télétransmis le 10/02/2026, AR \`092-219200367-20260209-deliberation1-DE\`).
  3. **Délibération du 12 février 2025** (*Budget Primitif 2025 de la Commune*, équilibré à \`238 277 172,33 €\`, AR \`092-219200367-20250217-delib1-2025-DE\`).
  4. **Délibérations annexes du 23 septembre 2026 :** Budget annexe *Restauration du personnel* (\`n°2026/S6/002\` & \`n°2026/S6/005\`, \`36 195,54 €\`, AR \`092-219200367-20260925-2441-DE\`) et Budget annexe *Cinéma Jean Vigo* (\`n°2026/S6/003\` & \`n°2026/S6/006\`, \`24 582,22 €\`, AR \`092-219200367-20260925-2440-DE\`).
- **Dossier de contrôle interne CRC :** **${piecesValidees} / ${piecesCRC.length} pièces réunies (${tauxCompletude} % des pièces applicables)** • **${piecesManquantesList.length} pièce(s) restant à produire** • ${piecesNA} pièce(s) non applicable(s).
- **Limites méthodologiques :** L'absence d'une pièce justificative au dossier est qualifiée de *point non vérifié à documenter*, et non d'irrégularité établie. Les contrôles portent sur les agrégats votés et télétransmis ; le rapprochement contradictoire avec la balance générale des comptes au 31/12 et l'état de l'actif du comptable public (SGC) relève des diligences de clôture.

---

## 2. Synthèse Exécutive & Contrôle de l'Équilibre Réel (Art. L. 1612-4 CGCT)

### 2.1. Faits établis et concordance mathématique des actes (CFU 2025 ➔ BS 2026)

| Contrôle réglementaire M57 / CGCT | Données vérifiées sur pièces (Délib. n°2026/S6/004) | Statut du contrôle |
|---|---|---|
| **1. Régularité formelle & Quorum (L. 2121-12 & L. 2121-17)** | Convocation le 17/09/2026 (5 jours francs respectés) • 39 présents / 45, 5 pouvoirs nominatifs, 44 suffrages exprimés (40 pour, 4 contre) | **VÉRIFIÉ SUR PIÈCE (Page 1/4)** |
| **2. Concordance de l'affectation du résultat 2025 (L. 2311-5)** | Excédent fonct. \`17 399 407,33 €\` = Affectation 1068 (\`16 399 407,33 €\`) + Report R002 (\`1 000 000,00 €\`) | **EXACT (Écart : 0,00 €)** |
| **3. Justification du solde d'investissement D001 & RAR** | Résultat cumulé invest. (\`-13 402 616,24 €\`) = D001 repris (\`-10 430 496,46 €\`) + Solde net RAR (\`-2 972 119,78 €\`) | **EXACT (Écart : 0,00 €)** |
| **4. Couverture du besoin de financement par le 1068** | Compte 1068 (\`16 399 407,33 €\`) ≥ Besoin total (\`10 430 496,46 € D001 + 2 972 119,78 € RAR net = 13 402 616,24 €\`) | **CONFORME (+2 996 791,09 € de surcouverture réduisant l'emprunt)** |
| **5. Équilibre de la section de fonctionnement BS 2026** | Dépenses nouvelles (\`1 790 209,00 €\`) = Recettes nouvelles (\`1 790 209,00 €\`) • Reports 2025 = \`0,00 €\` | **EXACT (Article 2 & Pages 2-3/4)** |
| **6. Équilibre de la section d'investissement BS 2026** | Total Dépenses (\`10 424 375,12 € nouv. + 15 075 223,80 € RAR\`) = Total Recettes (\`13 396 494,90 € nouv. + 12 103 104,02 € RAR\`) = \`25 499 598,92 €\` | **EXACT (Article 3 & Pages 3-4/4)** |
| **7. Parité des opérations d'ordre de section à section** | Chapitre 023 Dépenses fonct. (\`283 749,59 €\`) = Chapitre 021 Recettes invest. (\`283 749,59 €\`) | **EXACT (Article 4 & Pages 2 & 4/4)** |
| **8. Couverture de l'annuité en capital (L. 1612-4 CGCT)** | Épargne brute (\`${result.epargneBrute.toLocaleString('fr-FR')} €\`) > Capital dette (\`${result.capitalDette.toLocaleString('fr-FR')} €\`) ➔ Épargne nette : **\`${result.epargneNette.toLocaleString('fr-FR')} €\`** | **${result.epargneNette >= 0 ? 'CONFORME (Autofinancement positif)' : 'NON CONFORME (Épargne nette négative)'}** |

### 2.2. Synthèse des ratios prudentiels M57 (${result.collectiviteNom})
- **Taux d'Épargne Brute :** **${result.tauxEpargneBrute ?? 'N/A'} %** (*${result.diagnosticEpargne.message}*) — ${result.diagnosticEpargne.recommandation}
- **Capacité de Désendettement :** **${result.capaciteDesendettementAns ?? 'N/A'} ans** (*${result.diagnosticDesendettement.message}*) — ${result.diagnosticDesendettement.recommandation}
- **Poids des charges de personnel (Chap. 012 / DRF) :** **${result.poidsChargesPersonnelPct !== null ? result.poidsChargesPersonnelPct + ' %' : 'N/A'}** (Masse salariale maintenue sans dépassement au BS 2026).

---

## 3. Fiches d'Observation Normalisées (Méthodologie CRC / Contrôle Interne)

### Fiche d'observation n° OBS-2026-01 — Cycle Clôture CFU 2025 & Affectation du Résultat M57
- **Critère et source applicable :** Articles L. 1612-11, L. 2311-5 et R. 2311-11 du CGCT ; Instruction budgétaire et comptable M57 (Tome II, Titre 3, Chapitre 3 relatif à l'affectation du résultat).
- **Pièce / page et fait observé :** Délibération n°2026/S6/004 du 23/09/2026, page 1 (Considérants) et pages 3-4 (Tableaux annexes). Le CFU 2025 présente un résultat cumulé de fonctionnement de \`+17 399 407,33 €\` et un résultat cumulé d'investissement de \`-13 402 616,24 €\`, tandis que la ligne D001 reprend un déficit d'exécution de \`10 430 496,46 €\` et que le compte 1068 est doté de \`16 399 407,33 €\`.
- **Contrôle réalisé, résultat et limite :** Reconstitution de la chaîne comptable : l'écart de \`2 972 119,78 €\` entre le résultat cumulé d'investissement mentionné aux considérants (\`-13 402 616,24 €\`) et le solde d'exécution D001 inscrit au tableau des dépenses d'investissement (\`10 430 496,46 €\`) correspond au centime près au besoin net des Restes à Réaliser (\`15 075 223,80 € − 12 103 104,02 € = 2 972 119,78 €\`). En outre, la dotation au compte 1068 (\`16 399 407,33 €\`) correspond à la somme du résultat cumulé dégradé des RAR (\`13 402 616,24 € + 2 972 119,78 € = 16 374 736,02 €\`) majorée d'une marge de sécurité de \`+24 671,31 €\`.
- **Qualification :** **Point conforme — Régularité comptable établie** (avec recommandation de lisibilité rédactionnelle).
- **Conséquence possible :** Aucune anomalie d'équilibre ; toutefois, la formulation du considérant p. 1 gagnerait à distinguer explicitement le *solde d'exécution comptable hors RAR (\`-10 430 496,46 €\`)* et le *besoin de financement incluant les RAR* afin de faciliter la lecture citoyenne et le contrôle de légalité.
- **Recommandation proportionnée :** Dans les visas des futurs Budgets Supplémentaires, détailler systématiquement les 3 termes de l'équation M57 : *(1) Solde d'exécution D001/R001 + (2) Solde net des RAR = (3) Besoin de financement minimum à couvrir par le compte 1068*.

### Fiche d'observation n° OBS-2026-02 — Cycle Investissement & Justification des Restes à Réaliser (RAR 2025)
- **Critère et source applicable :** Articles L. 1612-11 et R. 2311-11 du CGCT ; doctrine constante des Chambres Régionales des Comptes sur la sincérité des états de restes à réaliser.
- **Pièce / page et fait observé :** Délibération n°2026/S6/004, Article 3 (p. 2) et tableaux d'investissement (p. 3-4). Les RAR 2025 repris au BS 2026 s'élèvent à **\`15 075 223,80 €\` en dépenses** (Chap. 20 : \`1 965 898,77 €\`, Chap. 21 : \`7 143 922,35 €\`, Chap. 23 : \`5 965 402,68 €\`) et à **\`12 103 104,02 €\` en recettes** (Chap. 13 *Subventions d'investissement* : \`4 103 104,02 €\`, Chap. 16 *Emprunts* : \`8 000 000,00 €\`).
- **Contrôle réalisé, résultat et limite :** Les RAR représentent 59,1 % du volume total de la section d'investissement du BS 2026 (\`25,50 M€\`). Parallèlement, le BS procède à des réductions de crédits nouveaux sur le Chap. 20 (\`-714 000,00 €\`), le Chap. 204 (\`-318 121,34 €\`), le Chap. 21 (\`-17 500,00 €\`) et le Chap. 13 (\`-1 343 744,00 €\`). L'état détaillé des engagements juridiques (marchés signés, bons de commande notifiés avant le 31/12/2025) et des contrats de prêt couvrant les \`8,00 M€\` de RAR au Chap. 16 n'est pas annexé à l'extrait de délibération.
- **Qualification :** **Point à documenter (contrôle interne de clôture)**.
- **Conséquence possible :** En l'absence de pièces justificatives probantes (actes d'engagement en dépenses, arrêtés de notification de subvention et contrats de prêt signés en recettes), le comptable public ou la CRC pourrait contester la sincérité du calcul du besoin de financement 2025.
- **Recommandation proportionnée :** Archiver au dossier du CFU 2025 / BS 2026 l'état certifié des RAR signé par l'ordonnateur, avec le numéro d'engagement comptable, le tiers, la date de notification de chaque subvention (\`4,10 M€\`) et la convention de financement correspondant aux \`8,00 M€\` du chapitre 16.

### Fiche d'observation n° OBS-2026-03 — Cycle Dette, Frais Financiers (Chap. 66) & Désendettement (Chap. 16)
- **Critère et source applicable :** Article L. 1612-4 du CGCT ; circulaire interministérielle relative à la gestion active de la dette locale et référentiel M57.
- **Pièce / page et fait observé :** Délibération n°2026/S6/004, pages 2, 3 et 4. Le BS 2026 inscrit **\`+200 000,00 €\`** de crédits supplémentaires au **Chapitre 66 (*Charges financières*)**, portant l'enveloppe 2026 de \`1 750 000,00 €\` (BP) à \`1 950 000,00 €\` (+11,43 %). Simultanément, l'inscription d'emprunt nouveau au **Chapitre 16 Recettes** est réduite de **\`-3 063 418,02 €\`** et l'amortissement du capital au **Chapitre 16 Dépenses** diminue de **\`-77 000,00 €\`**.
- **Contrôle réalisé, résultat et limite :** La réduction de \`-3,06 M€\` de l'emprunt d'équilibre annuel démontre que la forte mobilisation de l'excédent 2025 via le compte 1068 (\`16,40 M€\`) se substitue directement à de l'endettement bancaire nouveau, maintenant la capacité de désendettement à **${result.capaciteDesendettementAns ?? 'N/A'} ans** (en deçà du seuil prudentiel de 10 ans). En revanche, la hausse du chapitre 66 traduit l'effet taux sur la part révisable de l'encours.
- **Qualification :** **Bonne pratique de désendettement / Point de suivi sur le risque de taux**.
- **Conséquence possible :** Alourdissement de la charge d'intérêts en fonctionnement si les tirages des emprunts reportés (\`8,00 M€\` de RAR) interviennent à des conditions de taux élevées.
- **Recommandation proportionnée :** Adosser un tableau de suivi trimestriel de la dette distinguant part à taux fixe et part indexée (Euribor / Livret A), et différer au maximum le tirage effectif des lignes de crédit au vu de la trésorerie disponible.

### Fiche d'observation n° OBS-2026-04 — Cycle Fonctionnement, Fiscalité (Chap. 73/74) & Masse Salariale (Chap. 012)
- **Critère et source applicable :** Instruction M57 ; articles L. 714-4 et suivants du Code général de la fonction publique (CGFP) ; obligation légale des 1 607 heures annuelles.
- **Pièce / page et fait observé :** Délibération n°2026/S6/004, pages 2 et 3. En fonctionnement, la moins-value fiscale sur le **Chapitre 73 (*Impôts et taxes* : \`-453 396,00 €\`)** est compensée par la hausse du **Chapitre 74 (*Dotations et participations* : \`+885 289,00 €\`)**, du **Chapitre 75 (\`+270 059,00 €\`)** et du **Chapitre 731 (\`+108 257,00 €\`)**. En dépenses, le **Chapitre 011** augmente de **\`+1 063 249,98 €\`** (+2,59 % par rapport au BP) et le **Chapitre 65** de **\`+243 209,43 €\`**, tandis que le **Chapitre 012 (*Charges de personnel*)** ne fait l'objet d'aucun abondement au BS (\`0,00 €\`, enveloppe maintenue à \`96 063 865,00 €\`).
- **Contrôle réalisé, résultat et limite :** La stabilité du chapitre 012 au BS 2026 ramène mécaniquement le poids relatif de la masse salariale de **62,05 % des DRF au BP 2026** à **61,45 % des DRF consolidées après BS** (\`96 063 865 € / 156 334 705,58 €\`). Toutefois, la pièce \`rh_3\` (*Suivi des heures supplémentaires, temps de travail 1 607h et absences*) figure encore parmi les pièces à consolider dans la checklist d'audit.
- **Qualification :** **Écart documentaire mineur à compléter avant contrôle CRC**.
- **Conséquence possible :** Lors d'un examen de la gestion, la CRC contrôle systématiquement la corrélation entre l'évolution du chapitre 012 (+5,11 % entre le BP 2025 à \`91,40 M€\` et le BP 2026 à \`96,06 M€\`), le respect effectif des 1 607 heures travaillées et le cadre délibératif du RIFSEEP (IFSE + CIA).
- **Recommandation proportionnée :** Produire un état de rapprochement DRH/DAF entre le Rapport Social Unique (RSU), le tableau des effectifs budgétaires et l'exécution des heures supplémentaires à fin octobre 2026.

### Fiche d'observation n° OBS-2026-05 — Cycle Patrimoine, Opérations Financières (Chap. 27) & Contrôle Interne
- **Critère et source applicable :** Instruction M57 (comptabilité patrimoniale et rapprochement inventaire ordonnateur / état de l'actif du comptable public).
- **Pièce / page et fait observé :** Délibération n°2026/S6/004, pages 3 et 4. Le BS 2026 inscrit un mouvement nouveau strictement identique de **\`+1 120 500,00 €\`** en dépenses et en recettes au **Chapitre 27 (*Autres immobilisations financières*)**, qualifié de mouvement **RÉEL** dans les deux tableaux annexes. Par ailleurs, les pièces \`dette_2\` (*État de l'actif et inventaire M57*) et \`ctrl_1\` (*Cartographie des risques financiers*) sont signalées comme manquantes dans le suivi documentaire.
- **Contrôle réalisé, résultat et limite :** Une inscription équilibrée en dépenses et en recettes réelles au chapitre 27 correspond généralement à un remboursement et octroi simultané de prêt/avance, à une régularisation de dépôt/cautionnement ou à une écriture de reclassement de créance immobilisée.
- **Qualification :** **Point technique à documenter & Concordance inventaire/actif à finaliser**.
- **Conséquence possible :** Risque de rejet de mandatement/titre par le comptable public si la nature réelle ou d'ordre (chapitres 040/041) de l'opération au chapitre 27 n'est pas appuyée par une convention ou un certificat administratif ; observation récurrente des CRC sur les écarts entre l'inventaire physique de l'ordonnateur et l'état de l'actif de la trésorerie.
- **Recommandation proportionnée :** Joindre la fiche justificative de l'opération de \`1 120 500,00 €\` au chapitre 27 et planifier le certificat de concordance annuelle Inventaire / État de l'actif M57 avant la clôture de l'exercice 2026.

---

## 4. État des Pièces Manquantes au Dossier de Contrôle CRC

${piecesManquantesList.length > 0
  ? piecesManquantesList.map(p => `- ⚠️ **[${p.id.toUpperCase()}] ${p.domaine} :** ${p.titre} *(Statut : Point non vérifié — Pièce à réunir)*`).join('\n')
  : '- ✅ **Exhaustivité documentaire :** L’intégralité des pièces justificatives inscrites au référentiel de contrôle interne a été réunie et pointée.'}

---

## 5. Plan d'Action Contradictoire et Suivi des Recommandations

| Réf. Observation | Action corrective proposée | Service responsable | Échéance proposée | Preuve d'exécution attendue | État vérifié |
|---|---|---|---|---|---|
| **OBS-2026-01** | Formaliser dans la note de présentation M57 le tableau de passage entre résultat cumulé (\`-13,40 M€\`), D001 (\`-10,43 M€\`) et RAR nets (\`-2,97 M€\`) | Direction des Affaires Financières (DAF) | Prochain BP / BS | Annexe explicative d'affectation du résultat | **Réalisé dans l'outil** |
| **OBS-2026-02** | Annexer les états d'engagements juridiques des \`15,08 M€\` de RAR Dépenses et les justificatifs des \`12,10 M€\` de RAR Recettes (dont \`8,00 M€\` Chap. 16) | DAF / Services gestionnaires | 15 novembre 2026 | État des RAR signé + arrêtés de subventions Chap. 13 & contrats de prêt | **À documenter** |
| **OBS-2026-03** | Mettre en place un reporting mensuel des frais financiers (Chap. 66 réévalué à \`1,95 M€\`) et cadencer les tirages d'emprunt selon le plan de trésorerie | DAF / Cellule Dette & Trésorerie | Trimestriel | Tableau de bord de suivi des taux et de la trésorerie | **En cours** |
| **OBS-2026-04** | Finaliser le rapprochement RSU / Chapitre 012 (\`96,06 M€\`) et produire le bilan annuel du temps de travail effectif (1 607 heures) et des heures supplémentaires | Direction des Ressources Humaines (DRH) | 30 novembre 2026 | Note de rapprochement masse salariale + état 1 607h validé CST | **À documenter** |
| **OBS-2026-05** | Documenter l'opération symétrique de \`1 120 500,00 €\` au Chapitre 27 et arrêter le procès-verbal de concordance Inventaire Ordonnateur / État de l'Actif SGC | DAF / Patrimoine / Comptable public (SGC) | 31 décembre 2026 | Fiche justificative Chap. 27 + PV de rapprochement de l'actif M57 | **À documenter** |

---

## 6. Validation et Mentions de Responsabilité

- **Relecture métier et juridique attendue :** Directeur Général des Services (DGS), Directeur des Affaires Financières (DAF), Directeur des Ressources Humaines (DRH) et Conseiller aux Décideurs Locaux (CDL / SGC).
- **Points restant hors périmètre de la présente revue :** Audit des satellites de droit privé ou d'économie mixte (SEM, SPL, OPH, associations subventionnées au chapitre 65) et contrôle sur place des caisses des régies municipales.
- **Décision de l'autorité compétente :** Visa de Monsieur le Maire de Gennevilliers après procédure contradictoire interne avec les directions concernées.

*Rappel : Ce rapport préparatoire est généré à des fins d'audit interne et d'aide au pilotage M57. Il ne vaut ni certification des comptes, ni contrôle préfectoral de légalité ou budgétaire, ni observation de la Chambre Régionale des Comptes.*
`;
}

export interface ChapitreComparatifRow {
  chapitre: string;
  libelle: string;
  section: 'fonctionnement' | 'investissement';
  sens: 'depense' | 'recette';
  montant2025: number;
  montant2026: number;
  deltaEuros: number;
  deltaPct: number | null;
}

export function comparerBP2025et2026(): {
  depensesFonctionnement: ChapitreComparatifRow[];
  recettesFonctionnement: ChapitreComparatifRow[];
  depensesInvestissement: ChapitreComparatifRow[];
  recettesInvestissement: ChapitreComparatifRow[];
  totaux: {
    budgetTotal2025: number;
    budgetTotal2026: number;
    deltaBudgetTotal: number;
    deltaBudgetTotalPct: number;
    fonctTotal2025: number;
    fonctTotal2026: number;
    deltaFonctPct: number;
    investTotal2025: number;
    investTotal2026: number;
    deltaInvestPct: number;
    chargesPersonnel2025: number;
    chargesPersonnel2026: number;
    deltaPersonnelPct: number;
  };
} {
  const bp25 = DELIBERATIONS_GENNEVILLIERS_2026.bp_2025;
  const bp26 = DELIBERATIONS_GENNEVILLIERS_2026.bp_2026;

  const compareList = (
    list25: ChapitreMouvement[],
    list26: ChapitreMouvement[],
    section: 'fonctionnement' | 'investissement',
    sens: 'depense' | 'recette'
  ): ChapitreComparatifRow[] => {
    const map25 = new Map<string, ChapitreMouvement>();
    for (const item of list25) map25.set(item.chapitre, item);

    const map26 = new Map<string, ChapitreMouvement>();
    for (const item of list26) map26.set(item.chapitre, item);

    const allKeys = Array.from(new Set([...Array.from(map25.keys()), ...Array.from(map26.keys())]));

    return allKeys.map(chap => {
      const it25 = map25.get(chap);
      const it26 = map26.get(chap);
      const m25 = it25 ? (it25.totalBS ?? it25.montantBS2026) : 0;
      const m26 = it26 ? (it26.totalBS ?? it26.montantBS2026) : 0;
      const delta = m26 - m25;
      const pct = m25 > 0 ? (delta / m25) * 100 : null;
      return {
        chapitre: chap,
        libelle: it26?.libelle || it25?.libelle || `Chapitre ${chap}`,
        section,
        sens,
        montant2025: m25,
        montant2026: m26,
        deltaEuros: delta,
        deltaPct: pct !== null ? Math.round(pct * 100) / 100 : null,
      };
    });
  };

  const bTotal25 = bp25.montantTotalEquilibre;
  const bTotal26 = bp26.montantTotalEquilibre;
  const dTotal = bTotal26 - bTotal25;

  const p25 = bp25.depensesFonctionnement.find(c => c.chapitre === '012')?.montantBS2026 || 0;
  const p26 = bp26.depensesFonctionnement.find(c => c.chapitre === '012')?.montantBS2026 || 0;

  return {
    depensesFonctionnement: compareList(bp25.depensesFonctionnement, bp26.depensesFonctionnement, 'fonctionnement', 'depense'),
    recettesFonctionnement: compareList(bp25.recettesFonctionnement, bp26.recettesFonctionnement, 'fonctionnement', 'recette'),
    depensesInvestissement: compareList(bp25.depensesInvestissement, bp26.depensesInvestissement, 'investissement', 'depense'),
    recettesInvestissement: compareList(bp25.recettesInvestissement, bp26.recettesInvestissement, 'investissement', 'recette'),
    totaux: {
      budgetTotal2025: bTotal25,
      budgetTotal2026: bTotal26,
      deltaBudgetTotal: dTotal,
      deltaBudgetTotalPct: Math.round(((dTotal / bTotal25) * 100) * 100) / 100,
      fonctTotal2025: bp25.sectionFonctionnementTotal,
      fonctTotal2026: bp26.sectionFonctionnementTotal,
      deltaFonctPct: Math.round((((bp26.sectionFonctionnementTotal - bp25.sectionFonctionnementTotal) / bp25.sectionFonctionnementTotal) * 100) * 100) / 100,
      investTotal2025: bp25.sectionInvestissementTotal,
      investTotal2026: bp26.sectionInvestissementTotal,
      deltaInvestPct: Math.round((((bp26.sectionInvestissementTotal - bp25.sectionInvestissementTotal) / bp25.sectionInvestissementTotal) * 100) * 100) / 100,
      chargesPersonnel2025: p25,
      chargesPersonnel2026: p26,
      deltaPersonnelPct: Math.round((((p26 - p25) / p25) * 100) * 100) / 100,
    }
  };
}
