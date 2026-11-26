/**
 * Moteur de simulation de la pension de retraite des agents publics territoriaux (Paramètres 2026)
 * - Volet 1 : Fonctionnaires affiliés à la CNRACL (>= 28h hebdo) + RAFP
 * - Volet 2 : Agents contractuels de droit public (Régime général CNAV/CARSAT + Ircantec)
 *
 * Références juridiques :
 * - Code général de la fonction publique (CGFP) & Code des pensions civiles et militaires de retraite (CPCMR)
 * - Décret n° 2003-1306 du 26 décembre 2003 (régime de retraite CNRACL)
 * - Décret n° 2004-569 du 18 juin 2004 (RAFP)
 * - Code de la sécurité sociale (art. L. 351-1 et s.) & Décret n° 70-1277 du 23 décembre 1970 (Ircantec)
 * - Loi de financement de la sécurité sociale (LFSS) pour 2026 (calendrier âge légal / trimestres)
 */

export const RETRAITE_CONSTANTS_2026 = {
  // Fonction publique (Point d'indice)
  VALEUR_POINT_INDICE_MENSUEL: 4.92278, // € brut/mois par point d'indice majoré
  VALEUR_POINT_INDICE_ANNUEL: 59.07336, // € brut/an
  IM_MINIMUM_FPT: 366,

  // Plafond de la Sécurité sociale 2026
  PASS_ANNUEL_2026: 48060,
  PASS_MENSUEL_2026: 4005,

  // RAFP 2026 (ERAFP)
  RAFP_PLAFOND_ASSIETTE_TIB: 0.20, // Primes prises en compte dans la limite de 20 % du TIB
  RAFP_TAUX_COTISATION_TOTAL: 0.10, // 5 % agent + 5 % employeur
  RAFP_VALEUR_ACQUISITION_2026: 1.4596, // €
  RAFP_VALEUR_SERVICE_2026: 0.05671, // € / an
  RAFP_SEUIL_RENTE_POINTS: 5125, // En dessous : versement en capital

  // Ircantec 2026
  IRCANTEC_VALEUR_SERVICE_2026: 0.56053, // € / an par point
  IRCANTEC_SALAIRE_REFERENCE_2026: 5.787, // € (prix d'achat du point)
  IRCANTEC_TAUX_THEORIQUE_TA: 0.056, // 2,24 % salarial + 3,36 % patronal (base calcul points <= 1 PASS)
  IRCANTEC_TAUX_THEORIQUE_TB: 0.156, // 5,56 % salarial + 10,04 % patronal (1 à 8 PASS)
  IRCANTEC_TAUX_APPEL_TA: 0.0711, // 2,84 % salarial + 4,27 % patronal (prélevé sur paie)
  IRCANTEC_TAUX_APPEL_TB: 0.1981, // 7,06 % salarial + 12,75 % patronal
  IRCANTEC_SEUIL_CAPITAL_POINTS: 300,

  // Minimum garanti CNRACL (indice majoré de référence art. L.17 CPCMR)
  IM_MINIMUM_GARANTI_REF: 232,
} as const;

export type TauxPrelevementsSociaux = 'normal_9_1' | 'median_7_4' | 'reduit_4_3' | 'exonere_0';

export const TAUX_PRELEVEMENTS_SOCIAUX: Record<
  TauxPrelevementsSociaux,
  { label: string; tauxBase: number; tauxComplementaire: number; description: string }
> = {
  normal_9_1: {
    label: 'Taux normal (9,1 %)',
    tauxBase: 0.091, // CSG 8,3% + CRDS 0,5% + CASA 0,3%
    tauxComplementaire: 0.101, // + 1% cotisation maladie sur complémentaire régime général (Ircantec : 9,1% en régime public / 10,1% selon régime ; on retient 9,1% CNRACL/RAFP et 10,1% Ircantec)
    description: 'CSG 8,3 % + CRDS 0,5 % + CASA 0,3 % (majorité des retraités)',
  },
  median_7_4: {
    label: 'Taux médian (7,4 %)',
    tauxBase: 0.074, // CSG 6,6% + CRDS 0,5% + CASA 0,3%
    tauxComplementaire: 0.074,
    description: 'CSG 6,6 % + CRDS 0,5 % + CASA 0,3 %',
  },
  reduit_4_3: {
    label: 'Taux réduit (4,3 %)',
    tauxBase: 0.043, // CSG 3,8% + CRDS 0,5% (exonéré CASA)
    tauxComplementaire: 0.043,
    description: 'CSG 3,8 % + CRDS 0,5 % (exonération de CASA)',
  },
  exonere_0: {
    label: 'Exonération totale (0 %)',
    tauxBase: 0,
    tauxComplementaire: 0,
    description: 'Exonération complète de CSG, CRDS et CASA (selon RFR)',
  },
};

export interface GenerationRules {
  anneeNaissance: number;
  ageLegalAnnees: number;
  ageLegalMois: number;
  ageLegalDecimal: number;
  ageAnnulationDecote: number;
  trimestresRequis: number;
  noteLfss?: string;
}

/**
 * Renvoie l'âge légal de départ, l'âge d'annulation de la décote et le nombre de trimestres requis
 * en intégrant les aménagements de la LFSS pour 2026 (suspension / décalage générations 1964-1968).
 */
export function getGenerationRules(
  anneeNaissance: number,
  categorieActive = false
): GenerationRules {
  // Durée d'assurance requise (en trimestres) selon LFSS 2026
  let trimestresRequis = 172;
  if (anneeNaissance <= 1960) trimestresRequis = 167;
  else if (anneeNaissance === 1961) trimestresRequis = 169;
  else if (anneeNaissance === 1962) trimestresRequis = 169;
  else if (anneeNaissance === 1963) trimestresRequis = 170;
  else if (anneeNaissance === 1964) trimestresRequis = 170; // LFSS 2026
  else if (anneeNaissance === 1965) trimestresRequis = 171; // LFSS 2026 (170 si janv.-mars)
  else trimestresRequis = 172; // 1966 et après

  // Catégorie active CNRACL (>= 17 ans de services actifs)
  if (categorieActive) {
    let ageAns = 59;
    let ageMois = 0;
    if (anneeNaissance <= 1965) {
      ageAns = 57;
      ageMois = 0;
    } else if (anneeNaissance === 1966) {
      ageAns = 57;
      ageMois = 3;
    } else if (anneeNaissance === 1967) {
      ageAns = 57;
      ageMois = 6;
    } else if (anneeNaissance === 1968) {
      ageAns = 57;
      ageMois = 9;
    } else if (anneeNaissance === 1969) {
      ageAns = 58;
      ageMois = 0;
    } else if (anneeNaissance === 1970) {
      ageAns = 58;
      ageMois = 3;
    } else if (anneeNaissance === 1971) {
      ageAns = 58;
      ageMois = 6;
    } else if (anneeNaissance === 1972) {
      ageAns = 58;
      ageMois = 9;
    } else {
      ageAns = 59;
      ageMois = 0;
    }
    return {
      anneeNaissance,
      ageLegalAnnees: ageAns,
      ageLegalMois: ageMois,
      ageLegalDecimal: ageAns + ageMois / 12,
      ageAnnulationDecote: 62,
      trimestresRequis,
      noteLfss: 'Catégorie active CNRACL (sous réserve de 17 ans de services actifs effectifs).',
    };
  }

  // Catégorie sédentaire & Contractuels (droit commun LFSS 2026)
  let ageAns = 64;
  let ageMois = 0;
  let noteLfss: string | undefined;

  if (anneeNaissance <= 1960) {
    ageAns = 62;
    ageMois = 0;
  } else if (anneeNaissance === 1961) {
    ageAns = 62;
    ageMois = 3;
  } else if (anneeNaissance === 1962) {
    ageAns = 62;
    ageMois = 6;
  } else if (anneeNaissance === 1963) {
    ageAns = 62;
    ageMois = 9;
  } else if (anneeNaissance === 1964) {
    ageAns = 62;
    ageMois = 9;
    noteLfss = 'Barème aménagé LFSS 2026 (62 ans et 9 mois, 170 trimestres).';
  } else if (anneeNaissance === 1965) {
    ageAns = 63;
    ageMois = 0;
    noteLfss = 'Barème aménagé LFSS 2026 (62 ans et 9 mois / 170 trim. si né entre janv. et mars 1965).';
  } else if (anneeNaissance === 1966) {
    ageAns = 63;
    ageMois = 3;
    noteLfss = 'Barème aménagé LFSS 2026 (63 ans et 3 mois, 172 trimestres).';
  } else if (anneeNaissance === 1967) {
    ageAns = 63;
    ageMois = 6;
    noteLfss = 'Barème aménagé LFSS 2026 (63 ans et 6 mois, 172 trimestres).';
  } else if (anneeNaissance === 1968) {
    ageAns = 63;
    ageMois = 9;
    noteLfss = 'Barème aménagé LFSS 2026 (63 ans et 9 mois, 172 trimestres).';
  } else {
    ageAns = 64;
    ageMois = 0;
  }

  return {
    anneeNaissance,
    ageLegalAnnees: ageAns,
    ageLegalMois: ageMois,
    ageLegalDecimal: ageAns + ageMois / 12,
    ageAnnulationDecote: 67,
    trimestresRequis,
    noteLfss,
  };
}

/**
 * Coefficient de majoration selon l'âge de liquidation pour la RAFP (barème ERAFP)
 */
export function getRafpAgeCoefficient(ageDepartAns: number): number {
  const ageEntier = Math.floor(ageDepartAns);
  if (ageEntier <= 62) return 1.0;
  if (ageEntier === 63) return 1.04;
  if (ageEntier === 64) return 1.08;
  if (ageEntier === 65) return 1.12;
  if (ageEntier === 66) return 1.17;
  return 1.22; // >= 67 ans
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTION AUTOMATIQUE DE L'INDICE MAJORÉ DES 6 DERNIERS MOIS (AVANCEMENT D'ÉCHELON)
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieFpt = 'C' | 'B' | 'A';
export type GrilleFptId =
  | 'auto'
  | 'C1'
  | 'C2'
  | 'C3'
  | 'AM_P'
  | 'B1'
  | 'B2'
  | 'B3'
  | 'A1'
  | 'A2';

export interface GrilleEchelonStep {
  echelon: number;
  im: number;
  dureeAnnees: number; // 0 = échelon terminal
}

export interface GrilleIndiciaireRef {
  id: Exclude<GrilleFptId, 'auto'>;
  categorie: CategorieFpt;
  label: string;
  shortLabel: string;
  gradeSuperieurId?: Exclude<GrilleFptId, 'auto'>;
  echelonMinPromotion?: number;
  echelons: GrilleEchelonStep[];
}

export const GRILLES_INDICIAIRES_FPT: Record<Exclude<GrilleFptId, 'auto'>, GrilleIndiciaireRef> = {
  C1: {
    id: 'C1',
    categorie: 'C',
    label: 'Échelle C1 — Adjoint administratif / technique / patrimoine / animation',
    shortLabel: 'Échelle C1 (max IM 387)',
    gradeSuperieurId: 'C2',
    echelonMinPromotion: 6,
    echelons: [
      { echelon: 1, im: 366, dureeAnnees: 1 },
      { echelon: 2, im: 367, dureeAnnees: 1 },
      { echelon: 3, im: 368, dureeAnnees: 1 },
      { echelon: 4, im: 369, dureeAnnees: 1 },
      { echelon: 5, im: 370, dureeAnnees: 1 },
      { echelon: 6, im: 371, dureeAnnees: 1 },
      { echelon: 7, im: 372, dureeAnnees: 3 },
      { echelon: 8, im: 373, dureeAnnees: 3 },
      { echelon: 9, im: 376, dureeAnnees: 3 },
      { echelon: 10, im: 377, dureeAnnees: 4 },
      { echelon: 11, im: 387, dureeAnnees: 0 },
    ],
  },
  C2: {
    id: 'C2',
    categorie: 'C',
    label: 'Échelle C2 — Adjoint principal de 2e classe / ATSEM principal 2e cl.',
    shortLabel: 'Échelle C2 (max IM 425)',
    gradeSuperieurId: 'C3',
    echelonMinPromotion: 7,
    echelons: [
      { echelon: 1, im: 367, dureeAnnees: 1 },
      { echelon: 2, im: 369, dureeAnnees: 1 },
      { echelon: 3, im: 370, dureeAnnees: 1 },
      { echelon: 4, im: 373, dureeAnnees: 1 },
      { echelon: 5, im: 374, dureeAnnees: 1 },
      { echelon: 6, im: 376, dureeAnnees: 1 },
      { echelon: 7, im: 377, dureeAnnees: 2 },
      { echelon: 8, im: 385, dureeAnnees: 2 },
      { echelon: 9, im: 397, dureeAnnees: 3 },
      { echelon: 10, im: 409, dureeAnnees: 3 },
      { echelon: 11, im: 417, dureeAnnees: 4 },
      { echelon: 12, im: 425, dureeAnnees: 0 },
    ],
  },
  C3: {
    id: 'C3',
    categorie: 'C',
    label: 'Échelle C3 — Adjoint principal de 1re classe / ATSEM principal 1re cl.',
    shortLabel: 'Échelle C3 (max IM 478)',
    echelons: [
      { echelon: 1, im: 373, dureeAnnees: 1 },
      { echelon: 2, im: 375, dureeAnnees: 1 },
      { echelon: 3, im: 376, dureeAnnees: 2 },
      { echelon: 4, im: 385, dureeAnnees: 2 },
      { echelon: 5, im: 398, dureeAnnees: 2 },
      { echelon: 6, im: 408, dureeAnnees: 2 },
      { echelon: 7, im: 420, dureeAnnees: 3 },
      { echelon: 8, im: 435, dureeAnnees: 3 },
      { echelon: 9, im: 455, dureeAnnees: 3 },
      { echelon: 10, im: 478, dureeAnnees: 0 },
    ],
  },
  AM_P: {
    id: 'AM_P',
    categorie: 'C',
    label: 'Agent de maîtrise principal / Brigadier-chef principal',
    shortLabel: 'Maîtrise Princ. (max IM 519)',
    echelons: [
      { echelon: 1, im: 377, dureeAnnees: 1 },
      { echelon: 2, im: 385, dureeAnnees: 2 },
      { echelon: 3, im: 398, dureeAnnees: 2 },
      { echelon: 4, im: 412, dureeAnnees: 2 },
      { echelon: 5, im: 427, dureeAnnees: 2 },
      { echelon: 6, im: 441, dureeAnnees: 3 },
      { echelon: 7, im: 461, dureeAnnees: 3 },
      { echelon: 8, im: 481, dureeAnnees: 3 },
      { echelon: 9, im: 498, dureeAnnees: 4 },
      { echelon: 10, im: 519, dureeAnnees: 0 },
    ],
  },
  B1: {
    id: 'B1',
    categorie: 'B',
    label: 'Catégorie B (NES B1) — Rédacteur / Technicien / Animateur / Éducateur',
    shortLabel: 'Grade B1 (max IM 508)',
    gradeSuperieurId: 'B2',
    echelonMinPromotion: 8,
    echelons: [
      { echelon: 1, im: 373, dureeAnnees: 1 },
      { echelon: 2, im: 374, dureeAnnees: 1 },
      { echelon: 3, im: 375, dureeAnnees: 1 },
      { echelon: 4, im: 376, dureeAnnees: 1 },
      { echelon: 5, im: 377, dureeAnnees: 2 },
      { echelon: 6, im: 386, dureeAnnees: 2 },
      { echelon: 7, im: 401, dureeAnnees: 2 },
      { echelon: 8, im: 420, dureeAnnees: 3 },
      { echelon: 9, im: 436, dureeAnnees: 3 },
      { echelon: 10, im: 446, dureeAnnees: 3 },
      { echelon: 11, im: 462, dureeAnnees: 3 },
      { echelon: 12, im: 482, dureeAnnees: 4 },
      { echelon: 13, im: 508, dureeAnnees: 0 },
    ],
  },
  B2: {
    id: 'B2',
    categorie: 'B',
    label: 'Catégorie B (NES B2) — Principal de 2e classe',
    shortLabel: 'Grade B2 (max IM 539)',
    gradeSuperieurId: 'B3',
    echelonMinPromotion: 7,
    echelons: [
      { echelon: 1, im: 376, dureeAnnees: 1 },
      { echelon: 2, im: 377, dureeAnnees: 1 },
      { echelon: 3, im: 384, dureeAnnees: 2 },
      { echelon: 4, im: 395, dureeAnnees: 2 },
      { echelon: 5, im: 406, dureeAnnees: 2 },
      { echelon: 6, im: 421, dureeAnnees: 2 },
      { echelon: 7, im: 441, dureeAnnees: 3 },
      { echelon: 8, im: 457, dureeAnnees: 3 },
      { echelon: 9, im: 466, dureeAnnees: 3 },
      { echelon: 10, im: 485, dureeAnnees: 3 },
      { echelon: 11, im: 509, dureeAnnees: 4 },
      { echelon: 12, im: 539, dureeAnnees: 0 },
    ],
  },
  B3: {
    id: 'B3',
    categorie: 'B',
    label: 'Catégorie B (NES B3) — Principal de 1re classe',
    shortLabel: 'Grade B3 (max IM 592)',
    echelons: [
      { echelon: 1, im: 397, dureeAnnees: 1 },
      { echelon: 2, im: 409, dureeAnnees: 2 },
      { echelon: 3, im: 424, dureeAnnees: 2 },
      { echelon: 4, im: 446, dureeAnnees: 2 },
      { echelon: 5, im: 470, dureeAnnees: 2 },
      { echelon: 6, im: 489, dureeAnnees: 3 },
      { echelon: 7, im: 513, dureeAnnees: 3 },
      { echelon: 8, im: 539, dureeAnnees: 3 },
      { echelon: 9, im: 556, dureeAnnees: 3 },
      { echelon: 10, im: 574, dureeAnnees: 3 },
      { echelon: 11, im: 592, dureeAnnees: 0 },
    ],
  },
  A1: {
    id: 'A1',
    categorie: 'A',
    label: 'Catégorie A — Attaché / Ingénieur / Conseiller socio-éducatif',
    shortLabel: 'Grade A1 (max IM 678)',
    gradeSuperieurId: 'A2',
    echelonMinPromotion: 7,
    echelons: [
      { echelon: 1, im: 395, dureeAnnees: 1.5 },
      { echelon: 2, im: 415, dureeAnnees: 2 },
      { echelon: 3, im: 435, dureeAnnees: 2 },
      { echelon: 4, im: 455, dureeAnnees: 2 },
      { echelon: 5, im: 485, dureeAnnees: 2.5 },
      { echelon: 6, im: 518, dureeAnnees: 3 },
      { echelon: 7, im: 550, dureeAnnees: 3 },
      { echelon: 8, im: 580, dureeAnnees: 3 },
      { echelon: 9, im: 610, dureeAnnees: 3 },
      { echelon: 10, im: 645, dureeAnnees: 4 },
      { echelon: 11, im: 678, dureeAnnees: 0 },
    ],
  },
  A2: {
    id: 'A2',
    categorie: 'A',
    label: 'Catégorie A — Attaché principal / Ingénieur principal',
    shortLabel: 'Grade A2 Principal (max IM 826)',
    echelons: [
      { echelon: 1, im: 505, dureeAnnees: 2 },
      { echelon: 2, im: 540, dureeAnnees: 2 },
      { echelon: 3, im: 580, dureeAnnees: 2 },
      { echelon: 4, im: 610, dureeAnnees: 2 },
      { echelon: 5, im: 655, dureeAnnees: 2 },
      { echelon: 6, im: 695, dureeAnnees: 2.5 },
      { echelon: 7, im: 735, dureeAnnees: 2.5 },
      { echelon: 8, im: 773, dureeAnnees: 3 },
      { echelon: 9, im: 811, dureeAnnees: 3 },
      { echelon: 10, im: 826, dureeAnnees: 0 },
    ],
  },
};

export interface ProjectionIndiceResult {
  ageActuel: number;
  anneeDepart: number;
  anneesRestantesTotales: number;
  anneesUtiles6Mois: number; // Temps d'avancement permettant de détenir l'échelon >= 6 mois avant le départ
  grilleDepart: GrilleIndiciaireRef;
  echelonDepart: number;
  imActuel: number;
  grilleFinale: GrilleIndiciaireRef;
  echelonFinal: number;
  imProjete6DerniersMois: number;
  gainPointsIm: number;
  gainBrutMensuel: number;
  avancementGradeApplique: boolean;
  horsGrille: boolean;
}

function detecterGrilleAuto(categorie: CategorieFpt, imActuel: number): Exclude<GrilleFptId, 'auto'> {
  if (categorie === 'C') {
    // Correspondances exactes prioritaires
    if (GRILLES_INDICIAIRES_FPT.C2.echelons.some((e) => e.im === imActuel) && imActuel >= 385) return 'C2';
    if (GRILLES_INDICIAIRES_FPT.C3.echelons.some((e) => e.im === imActuel) && imActuel >= 398) return 'C3';
    if (imActuel <= 375) return 'C1';
    if (imActuel <= 425) return 'C2';
    if (imActuel <= 478) return 'C3';
    return 'AM_P';
  }
  if (categorie === 'B') {
    if (GRILLES_INDICIAIRES_FPT.B2.echelons.some((e) => e.im === imActuel) && imActuel > 508) return 'B2';
    if (imActuel <= 508) return 'B1';
    if (imActuel <= 539) return 'B2';
    return 'B3';
  }
  // Catégorie A
  if (imActuel <= 678) return 'A1';
  return 'A2';
}

/**
 * Calcule automatiquement l'Indice Majoré détenu lors des 6 derniers mois avant l'âge de départ souhaité,
 * à partir de l'année de naissance, de la catégorie (C / B / A), de l'indice actuel et de l'âge de départ.
 */
export function projeterIndice6DerniersMois(params: {
  anneeNaissance: number;
  categorie: CategorieFpt;
  grilleId?: GrilleFptId;
  imActuel: number;
  ageDepartAnnees: number;
  ageDepartMois: number;
  inclureAvancementGrade?: boolean;
  anneeReference?: number;
}): ProjectionIndiceResult {
  const anneeRef = params.anneeReference ?? new Date().getFullYear();
  const imSaisi = Math.max(RETRAITE_CONSTANTS_2026.IM_MINIMUM_FPT, Math.round(params.imActuel || 366));
  const ageActuel = Math.max(18, anneeRef - params.anneeNaissance);
  const ageDepartDecimal = params.ageDepartAnnees + (params.ageDepartMois || 0) / 12;
  const anneesRestantesTotales = Math.max(0, ageDepartDecimal - ageActuel);
  // Pour compter dans le calcul CNRACL, l'indice doit être détenu au moins 6 mois (0,5 an) avant le départ
  const anneesUtiles6Mois = Math.max(0, anneesRestantesTotales - 0.5);
  const anneeDepart = Math.round(params.anneeNaissance + ageDepartDecimal);

  const resolvedId =
    !params.grilleId || params.grilleId === 'auto'
      ? detecterGrilleAuto(params.categorie, imSaisi)
      : params.grilleId;

  let grilleCourante = GRILLES_INDICIAIRES_FPT[resolvedId];
  // Sécurité si l'utilisateur change de catégorie alors qu'une grille d'une autre catégorie était sélectionnée
  if (grilleCourante.categorie !== params.categorie) {
    grilleCourante = GRILLES_INDICIAIRES_FPT[detecterGrilleAuto(params.categorie, imSaisi)];
  }

  const grilleDepart = grilleCourante;
  const maxImGrille = grilleCourante.echelons[grilleCourante.echelons.length - 1].im;

  // Si l'IM actuel dépasse déjà le sommet de la grille (ex: hors classe / emploi fonctionnel)
  if (imSaisi > maxImGrille && !grilleCourante.gradeSuperieurId) {
    return {
      ageActuel,
      anneeDepart,
      anneesRestantesTotales,
      anneesUtiles6Mois,
      grilleDepart,
      echelonDepart: grilleCourante.echelons[grilleCourante.echelons.length - 1].echelon,
      imActuel: imSaisi,
      grilleFinale: grilleCourante,
      echelonFinal: grilleCourante.echelons[grilleCourante.echelons.length - 1].echelon,
      imProjete6DerniersMois: imSaisi,
      gainPointsIm: 0,
      gainBrutMensuel: 0,
      avancementGradeApplique: false,
      horsGrille: true,
    };
  }

  // Trouver l'échelon actuel correspondant (exact ou immédiatement inférieur)
  let idxEchelon = 0;
  for (let i = 0; i < grilleCourante.echelons.length; i++) {
    if (grilleCourante.echelons[i].im <= imSaisi) {
      idxEchelon = i;
    } else {
      break;
    }
  }
  const echelonDepart = grilleCourante.echelons[idxEchelon].echelon;

  // Simulation pas à pas jusqu'à (départ - 6 mois)
  // On suppose en moyenne que l'agent a déjà accompli la moitié de son échelon en cours (hypothèse neutre standard)
  let tempsRestant = anneesUtiles6Mois;
  let avancementGradeApplique = false;
  let premierEchelon = true;

  while (tempsRestant > 0) {
    const step = grilleCourante.echelons[idxEchelon];

    // Option avancement au grade supérieur (1 seul saut de grade au cours de la projection si activé)
    if (
      params.inclureAvancementGrade &&
      !avancementGradeApplique &&
      grilleCourante.gradeSuperieurId &&
      grilleCourante.echelonMinPromotion &&
      step.echelon >= grilleCourante.echelonMinPromotion &&
      tempsRestant >= 1.5
    ) {
      const nextGrille = GRILLES_INDICIAIRES_FPT[grilleCourante.gradeSuperieurId];
      // Reclassement à l'échelon comportant un indice égal ou immédiatement supérieur
      let newIdx = nextGrille.echelons.findIndex((e) => e.im >= step.im);
      if (newIdx === -1) newIdx = nextGrille.echelons.length - 1;
      grilleCourante = nextGrille;
      idxEchelon = newIdx;
      avancementGradeApplique = true;
      premierEchelon = false;
      continue;
    }

    // Échelon terminal atteint
    if (step.dureeAnnees <= 0 || idxEchelon >= grilleCourante.echelons.length - 1) {
      break;
    }

    const dureeRequise = premierEchelon ? step.dureeAnnees * 0.5 : step.dureeAnnees;
    if (tempsRestant >= dureeRequise) {
      tempsRestant -= dureeRequise;
      idxEchelon += 1;
      premierEchelon = false;
    } else {
      break;
    }
  }

  const finalStep = grilleCourante.echelons[idxEchelon];
  // Garantie : l'indice projeté ne peut jamais être inférieur à l'indice déjà détenu aujourd'hui
  const imProjete6DerniersMois = Math.max(imSaisi, finalStep.im);
  const gainPointsIm = imProjete6DerniersMois - imSaisi;
  const gainBrutMensuel = gainPointsIm * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL;

  return {
    ageActuel,
    anneeDepart,
    anneesRestantesTotales,
    anneesUtiles6Mois,
    grilleDepart,
    echelonDepart,
    imActuel: imSaisi,
    grilleFinale: grilleCourante,
    echelonFinal: finalStep.echelon,
    imProjete6DerniersMois,
    gainPointsIm,
    gainBrutMensuel,
    avancementGradeApplique,
    horsGrille: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOLET 1 : FONCTIONNAIRE TERRITORIAL (CNRACL + RAFP)
// ─────────────────────────────────────────────────────────────────────────────

export interface FonctionnaireRetraiteInput {
  anneeNaissance: number;
  categorieService: 'sedentaire' | 'active';
  ageDepartAnnees: number;
  ageDepartMois: number;
  indiceMajore: number; // Détenu depuis au moins 6 mois
  pointsNbi: number;
  anneesPerceptionNbi: number;
  trimestresCnracl: number; // Services et bonifications liquidables CNRACL
  trimestresAutresRegimes: number; // Privé, Ircantec, enfants hors CNRACL... (pour le taux plein tous régimes)
  nbEnfantsEleves: number; // Élevés >= 9 ans avant 16 ans (majoration >= 3 enfants)
  modeRafp: 'estimer' | 'points';
  primesMensuellesBrutes: number; // IFSE + CIA lissé + primes soumises à RAFP
  anneesCotiseesRafp: number; // Depuis 2005 max
  pointsRafpSaisis: number;
  prelevementsSociaux: TauxPrelevementsSociaux;
}

export interface FonctionnaireRetraiteResult {
  rules: GenerationRules;
  ageDepartDecimal: number;
  avantAgeLegal: boolean;
  tibMensuelRef: number;
  trimestresTousRegimes: number;
  tauxLiquidationBrutPct: number; // max 75% (hors décote/surcote)
  trimestresDecote: number;
  trimestresSurcote: number;
  coeffDecoteSurcote: number; // ex: 0.95 ou 1.05
  tauxLiquidationEffectifPct: number;
  pensionBaseHorsMgMensuelle: number;
  minimumGarantiEligible: boolean;
  minimumGarantiApplique: boolean;
  montantMinimumGarantiMensuel: number;
  pensionCnraclHorsOptionsMensuelle: number;
  supplementNbiMensuel: number;
  majorationEnfantsMensuelle: number;
  pensionCnraclTotaleBruteMensuelle: number;
  pointsRafpRetenus: number;
  coeffAgeRafp: number;
  rafpEnRente: boolean;
  rafpRenteBruteMensuelle: number;
  rafpCapitalBrutUnique: number;
  totalBrutMensuel: number;
  totalNetMensuelAvantIr: number;
  totalBrutAnnuel: number;
  tauxRemplacementBrutPct: number; // par rapport à (TIB + NBI + Primes)
}

export function simulerRetraiteFonctionnaire(
  input: FonctionnaireRetraiteInput
): FonctionnaireRetraiteResult {
  const rules = getGenerationRules(
    input.anneeNaissance,
    input.categorieService === 'active'
  );

  const ageDepartDecimal = input.ageDepartAnnees + (input.ageDepartMois || 0) / 12;
  const avantAgeLegal = ageDepartDecimal + 0.001 < rules.ageLegalDecimal;

  const im = Math.max(RETRAITE_CONSTANTS_2026.IM_MINIMUM_FPT, Math.round(input.indiceMajore || 366));
  const tibMensuelRef = im * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL;

  const trimCnracl = Math.max(0, Math.round(input.trimestresCnracl || 0));
  const trimAutres = Math.max(0, Math.round(input.trimestresAutresRegimes || 0));
  const trimestresTousRegimes = trimCnracl + trimAutres;

  // Taux de liquidation de base : 75 % * (trimestres CNRACL / trimestres requis), plafonné à 75 %
  const ratioCnracl = Math.min(1, trimCnracl / rules.trimestresRequis);
  const tauxLiquidationBrutPct = 75 * ratioCnracl;

  // Décote / Surcote
  let trimestresDecote = 0;
  let trimestresSurcote = 0;

  if (trimestresTousRegimes < rules.trimestresRequis && ageDepartDecimal < rules.ageAnnulationDecote) {
    const trimManquantsDuree = rules.trimestresRequis - trimestresTousRegimes;
    const trimManquantsAge = Math.max(
      0,
      Math.ceil((rules.ageAnnulationDecote - ageDepartDecimal) * 4 - 1e-6)
    );
    trimestresDecote = Math.min(20, Math.min(trimManquantsDuree, trimManquantsAge));
  } else if (trimestresTousRegimes > rules.trimestresRequis && ageDepartDecimal > rules.ageLegalDecimal) {
    const trimAuDelaDuree = trimestresTousRegimes - rules.trimestresRequis;
    const trimAuDelaAge = Math.max(
      0,
      Math.floor((ageDepartDecimal - rules.ageLegalDecimal) * 4 + 1e-6)
    );
    trimestresSurcote = Math.min(trimAuDelaDuree, trimAuDelaAge);
  }

  const coeffDecoteSurcote =
    trimestresDecote > 0
      ? 1 - 0.0125 * trimestresDecote
      : trimestresSurcote > 0
      ? 1 + 0.0125 * trimestresSurcote
      : 1;

  const tauxLiquidationEffectifPct = tauxLiquidationBrutPct * coeffDecoteSurcote;
  const pensionBaseHorsMgMensuelle = tibMensuelRef * (tauxLiquidationEffectifPct / 100);

  // Minimum garanti CNRACL (applicable uniquement sans décote : taux plein par durée ou âge d'annulation)
  const minimumGarantiEligible =
    trimestresDecote === 0 &&
    (trimestresTousRegimes >= rules.trimestresRequis || ageDepartDecimal >= rules.ageAnnulationDecote) &&
    trimCnracl > 0;

  const anneesServicesCnracl = trimCnracl / 4;
  const baseImMg = RETRAITE_CONSTANTS_2026.IM_MINIMUM_GARANTI_REF * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL;
  let tauxMg = 0;
  if (anneesServicesCnracl < 15) {
    tauxMg = (anneesServicesCnracl / (rules.trimestresRequis / 4)) * 1.0;
  } else {
    const ans15a30 = Math.min(15, Math.max(0, anneesServicesCnracl - 15));
    const ans30a40 = Math.min(10, Math.max(0, anneesServicesCnracl - 30));
    tauxMg = Math.min(1.0, 0.575 + ans15a30 * 0.025 + ans30a40 * 0.005);
  }
  // Proratisation inter-régimes lorsque l'agent a des trimestres dans d'autres régimes
  const prorataTousRegimes =
    trimestresTousRegimes > 0 ? Math.min(1, trimCnracl / Math.max(trimCnracl, trimestresTousRegimes)) : 1;
  const montantMinimumGarantiMensuel = minimumGarantiEligible
    ? baseImMg * tauxMg * (trimAutres > 0 ? Math.max(ratioCnracl, prorataTousRegimes) : 1)
    : 0;

  const minimumGarantiApplique =
    minimumGarantiEligible && montantMinimumGarantiMensuel > pensionBaseHorsMgMensuelle;

  const pensionCnraclHorsOptionsMensuelle = minimumGarantiApplique
    ? montantMinimumGarantiMensuel
    : pensionBaseHorsMgMensuelle;

  // Supplément de pension au titre de la NBI (si perçue)
  let supplementNbiMensuel = 0;
  if (input.pointsNbi > 0 && input.anneesPerceptionNbi > 0) {
    const trimNbi = Math.min(trimCnracl, Math.round(input.anneesPerceptionNbi * 4));
    const valeurNbiMensuelle = input.pointsNbi * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL;
    supplementNbiMensuel =
      valeurNbiMensuelle * 0.75 * (trimNbi / rules.trimestresRequis) * coeffDecoteSurcote;
  }

  // Majoration pour enfants (>= 3 enfants : +10 % pour 3 enfants, +5 % par enfant au-delà)
  let tauxMajEnfants = 0;
  if (input.nbEnfantsEleves >= 3) {
    tauxMajEnfants = 0.10 + (input.nbEnfantsEleves - 3) * 0.05;
  }
  const baseAvantMaj = pensionCnraclHorsOptionsMensuelle + supplementNbiMensuel;
  const majorationEnfantsBrute = baseAvantMaj * tauxMajEnfants;
  // Plafond légal : pension + majoration enfants ne peut excéder le TIB de référence
  const plafondTib = tibMensuelRef + input.pointsNbi * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL;
  const majorationEnfantsMensuelle =
    tauxMajEnfants > 0 ? Math.max(0, Math.min(majorationEnfantsBrute, plafondTib - baseAvantMaj)) : 0;

  const pensionCnraclTotaleBruteMensuelle = baseAvantMaj + majorationEnfantsMensuelle;

  // RAFP (Retraite Additionnelle de la Fonction Publique)
  let pointsRafpRetenus = 0;
  if (input.modeRafp === 'points') {
    pointsRafpRetenus = Math.max(0, Math.round(input.pointsRafpSaisis || 0));
  } else {
    const tibAnnuel = tibMensuelRef * 12;
    const primesAnnuelles = Math.max(0, input.primesMensuellesBrutes || 0) * 12;
    const assietteRafpAnnuelle = Math.min(
      primesAnnuelles,
      tibAnnuel * RETRAITE_CONSTANTS_2026.RAFP_PLAFOND_ASSIETTE_TIB
    );
    const cotisationRafpAnnuelle =
      assietteRafpAnnuelle * RETRAITE_CONSTANTS_2026.RAFP_TAUX_COTISATION_TOTAL;
    const pointsParAn = cotisationRafpAnnuelle / RETRAITE_CONSTANTS_2026.RAFP_VALEUR_ACQUISITION_2026;
    const anneesRafp = Math.max(0, Math.min(45, input.anneesCotiseesRafp || 0));
    pointsRafpRetenus = Math.round(pointsParAn * anneesRafp);
  }

  const coeffAgeRafp = getRafpAgeCoefficient(ageDepartDecimal);
  const rafpEnRente = pointsRafpRetenus >= RETRAITE_CONSTANTS_2026.RAFP_SEUIL_RENTE_POINTS;

  let rafpRenteBruteMensuelle = 0;
  let rafpCapitalBrutUnique = 0;

  if (rafpEnRente) {
    rafpRenteBruteMensuelle =
      (pointsRafpRetenus * coeffAgeRafp * RETRAITE_CONSTANTS_2026.RAFP_VALEUR_SERVICE_2026) / 12;
  } else if (pointsRafpRetenus > 0) {
    // Formule simplifiée de conversion en capital ERAFP (points * valeur de service * coeff viager ~25,5 selon âge)
    rafpCapitalBrutUnique =
      pointsRafpRetenus * coeffAgeRafp * RETRAITE_CONSTANTS_2026.RAFP_VALEUR_SERVICE_2026 * 25.5;
  }

  const totalBrutMensuel = pensionCnraclTotaleBruteMensuelle + rafpRenteBruteMensuelle;
  const tauxPs = TAUX_PRELEVEMENTS_SOCIAUX[input.prelevementsSociaux].tauxBase;
  const totalNetMensuelAvantIr = totalBrutMensuel * (1 - tauxPs);
  const totalBrutAnnuel = totalBrutMensuel * 12;

  const remunerationActiviteRef =
    tibMensuelRef +
    input.pointsNbi * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL +
    Math.max(0, input.primesMensuellesBrutes || 0);
  const tauxRemplacementBrutPct =
    remunerationActiviteRef > 0 ? (totalBrutMensuel / remunerationActiviteRef) * 100 : 0;

  return {
    rules,
    ageDepartDecimal,
    avantAgeLegal,
    tibMensuelRef,
    trimestresTousRegimes,
    tauxLiquidationBrutPct,
    trimestresDecote,
    trimestresSurcote,
    coeffDecoteSurcote,
    tauxLiquidationEffectifPct,
    pensionBaseHorsMgMensuelle,
    minimumGarantiEligible,
    minimumGarantiApplique,
    montantMinimumGarantiMensuel,
    pensionCnraclHorsOptionsMensuelle,
    supplementNbiMensuel,
    majorationEnfantsMensuelle,
    pensionCnraclTotaleBruteMensuelle,
    pointsRafpRetenus,
    coeffAgeRafp,
    rafpEnRente,
    rafpRenteBruteMensuelle,
    rafpCapitalBrutUnique,
    totalBrutMensuel,
    totalNetMensuelAvantIr,
    totalBrutAnnuel,
    tauxRemplacementBrutPct,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOLET 2 : AGENT CONTRACTUEL DE DROIT PUBLIC (RÉGIME GÉNÉRAL CNAV + IRCANTEC)
// ─────────────────────────────────────────────────────────────────────────────

export interface ContractuelRetraiteInput {
  anneeNaissance: number;
  ageDepartAnnees: number;
  ageDepartMois: number;
  salaireBrutMensuelActuel: number; // Traitement + primes brutes actuelles
  modeSam: 'auto' | 'manuel';
  samAnnuelManuel: number; // Salaire Annuel Moyen des 25 meilleures années (plafonné PASS)
  trimestresRegimeGeneral: number; // Trimestres cotisés/validés au régime général (public contractuel + privé)
  trimestresAutresRegimes: number; // Éventuels trimestres CNRACL/MSA/indépendant pour le taux plein
  nbEnfantsEleves: number;
  modeIrcantec: 'estimer' | 'points';
  anneesContractuelPublic: number; // Durée cotisée à l'Ircantec
  pointsIrcantecSaisis: number;
  renteAgircArrcoMensuelle: number; // Optionnel si carrière mixte secteur privé
  prelevementsSociaux: TauxPrelevementsSociaux;
}

export interface ContractuelRetraiteResult {
  rules: GenerationRules;
  ageDepartDecimal: number;
  avantAgeLegal: boolean;
  samRetenuAnnuel: number;
  trimestresTousRegimes: number;
  trimestresDecote: number;
  trimestresSurcote: number;
  tauxCnavPct: number; // entre 37,5 % et 50 %
  coeffSurcoteCnav: number;
  prorataRegimeGeneral: number; // min(1, trimRG / trimRequis)
  pensionCnavHorsEnfantsMensuelle: number;
  majorationEnfantsCnavMensuelle: number;
  pensionCnavTotaleBruteMensuelle: number;
  pointsIrcantecBase: number;
  pointsIrcantecApresModulation: number;
  ircantecEnCapital: boolean;
  ircantecRenteBruteMensuelle: number;
  ircantecCapitalBrutUnique: number;
  renteAgircArrcoMensuelle: number;
  totalBrutMensuel: number;
  totalNetMensuelAvantIr: number;
  totalBrutAnnuel: number;
  tauxRemplacementBrutPct: number;
}

export function simulerRetraiteContractuel(
  input: ContractuelRetraiteInput
): ContractuelRetraiteResult {
  const rules = getGenerationRules(input.anneeNaissance, false);
  const ageDepartDecimal = input.ageDepartAnnees + (input.ageDepartMois || 0) / 12;
  const avantAgeLegal = ageDepartDecimal + 0.001 < rules.ageLegalDecimal;

  const brutMensuel = Math.max(0, input.salaireBrutMensuelActuel || 0);
  const brutAnnuel = brutMensuel * 12;

  // SAM (25 meilleures années, chaque année étant plafonnée au PASS ; en estimation auto on retient ~92 % du brut actuel plafonné PASS pour refléter la progression de carrière)
  const samAutoEstime = Math.min(
    RETRAITE_CONSTANTS_2026.PASS_ANNUEL_2026,
    brutAnnuel * 0.92
  );
  const samRetenuAnnuel =
    input.modeSam === 'manuel'
      ? Math.min(RETRAITE_CONSTANTS_2026.PASS_ANNUEL_2026, Math.max(0, input.samAnnuelManuel || 0))
      : samAutoEstime;

  const trimRG = Math.max(0, Math.round(input.trimestresRegimeGeneral || 0));
  const trimAutres = Math.max(0, Math.round(input.trimestresAutresRegimes || 0));
  const trimestresTousRegimes = trimRG + trimAutres;

  // Décote / Surcote CNAV
  let trimestresDecote = 0;
  let trimestresSurcote = 0;

  if (trimestresTousRegimes < rules.trimestresRequis && ageDepartDecimal < rules.ageAnnulationDecote) {
    const trimManquantsDuree = rules.trimestresRequis - trimestresTousRegimes;
    const trimManquantsAge = Math.max(
      0,
      Math.ceil((rules.ageAnnulationDecote - ageDepartDecimal) * 4 - 1e-6)
    );
    trimestresDecote = Math.min(20, Math.min(trimManquantsDuree, trimManquantsAge));
  } else if (trimestresTousRegimes > rules.trimestresRequis && ageDepartDecimal > rules.ageLegalDecimal) {
    const trimAuDelaDuree = trimestresTousRegimes - rules.trimestresRequis;
    const trimAuDelaAge = Math.max(
      0,
      Math.floor((ageDepartDecimal - rules.ageLegalDecimal) * 4 + 1e-6)
    );
    trimestresSurcote = Math.min(trimAuDelaDuree, trimAuDelaAge);
  }

  // Taux CNAV : 50 % au taux plein, minoré de 0,625 pt par trimestre de décote (plancher 37,5 %)
  const tauxCnavPct = Math.max(37.5, 50 - trimestresDecote * 0.625);
  const coeffSurcoteCnav = 1 + trimestresSurcote * 0.0125;
  const prorataRegimeGeneral = Math.min(1, trimRG / rules.trimestresRequis);

  const pensionCnavAnnuelleHorsEnfants =
    samRetenuAnnuel * (tauxCnavPct / 100) * prorataRegimeGeneral * coeffSurcoteCnav;
  const pensionCnavHorsEnfantsMensuelle = pensionCnavAnnuelleHorsEnfants / 12;

  // Majoration CNAV pour 3 enfants ou plus : +10 %
  const majorationEnfantsCnavMensuelle =
    input.nbEnfantsEleves >= 3 ? pensionCnavHorsEnfantsMensuelle * 0.10 : 0;
  const pensionCnavTotaleBruteMensuelle =
    pensionCnavHorsEnfantsMensuelle + majorationEnfantsCnavMensuelle;

  // Retraite complémentaire IRCANTEC
  let pointsIrcantecBase = 0;
  if (input.modeIrcantec === 'points') {
    pointsIrcantecBase = Math.max(0, Math.round(input.pointsIrcantecSaisis || 0));
  } else {
    const trancheA = Math.min(brutAnnuel, RETRAITE_CONSTANTS_2026.PASS_ANNUEL_2026);
    const trancheB = Math.max(
      0,
      Math.min(brutAnnuel, RETRAITE_CONSTANTS_2026.PASS_ANNUEL_2026 * 8) -
        RETRAITE_CONSTANTS_2026.PASS_ANNUEL_2026
    );
    const cotisationTheoriqueAnnuelle =
      trancheA * RETRAITE_CONSTANTS_2026.IRCANTEC_TAUX_THEORIQUE_TA +
      trancheB * RETRAITE_CONSTANTS_2026.IRCANTEC_TAUX_THEORIQUE_TB;
    // Facteur 0,94 pour lisser l'évolution salariale sur la durée de carrière contractuelle
    const pointsAnnuelsMoyens =
      (cotisationTheoriqueAnnuelle * 0.94) / RETRAITE_CONSTANTS_2026.IRCANTEC_SALAIRE_REFERENCE_2026;
    const anneesPub = Math.max(0, Math.min(45, input.anneesContractuelPublic || 0));
    pointsIrcantecBase = Math.round(pointsAnnuelsMoyens * anneesPub);
  }

  // Minoration / majoration Ircantec (barème Ircantec : -1 %/trimestre pour les 12 premiers, -1,25 % au-delà ; surcote +0,75 %/trimestre au-delà de l'âge légal et du taux plein)
  let coeffModulationIrcantec = 1;
  if (trimestresDecote > 0) {
    const t1 = Math.min(12, trimestresDecote);
    const t2 = Math.max(0, trimestresDecote - 12);
    coeffModulationIrcantec = Math.max(0.78, 1 - t1 * 0.01 - t2 * 0.0125);
  } else if (trimestresSurcote > 0) {
    coeffModulationIrcantec = 1 + trimestresSurcote * 0.0075;
  }

  // Majoration familiale Ircantec (>= 3 enfants : 10% pour 3, 15% pour 4, 20% pour 5, 25% pour 6, 30% pour >=7)
  let tauxMajFamIrcantec = 0;
  if (input.nbEnfantsEleves === 3) tauxMajFamIrcantec = 0.10;
  else if (input.nbEnfantsEleves === 4) tauxMajFamIrcantec = 0.15;
  else if (input.nbEnfantsEleves === 5) tauxMajFamIrcantec = 0.20;
  else if (input.nbEnfantsEleves === 6) tauxMajFamIrcantec = 0.25;
  else if (input.nbEnfantsEleves >= 7) tauxMajFamIrcantec = 0.30;

  const pointsIrcantecApresModulation = Math.round(
    pointsIrcantecBase * coeffModulationIrcantec * (1 + tauxMajFamIrcantec)
  );

  const ircantecEnCapital =
    pointsIrcantecApresModulation > 0 &&
    pointsIrcantecApresModulation < RETRAITE_CONSTANTS_2026.IRCANTEC_SEUIL_CAPITAL_POINTS;

  let ircantecRenteBruteMensuelle = 0;
  let ircantecCapitalBrutUnique = 0;

  if (ircantecEnCapital) {
    ircantecCapitalBrutUnique =
      pointsIrcantecApresModulation * RETRAITE_CONSTANTS_2026.IRCANTEC_SALAIRE_REFERENCE_2026;
  } else {
    ircantecRenteBruteMensuelle =
      (pointsIrcantecApresModulation * RETRAITE_CONSTANTS_2026.IRCANTEC_VALEUR_SERVICE_2026) / 12;
  }

  const renteAgircArrcoMensuelle = Math.max(0, input.renteAgircArrcoMensuelle || 0);

  const totalBrutMensuel =
    pensionCnavTotaleBruteMensuelle + ircantecRenteBruteMensuelle + renteAgircArrcoMensuelle;

  const psInfo = TAUX_PRELEVEMENTS_SOCIAUX[input.prelevementsSociaux];
  const netCnav = pensionCnavTotaleBruteMensuelle * (1 - psInfo.tauxBase);
  const netCompl = (ircantecRenteBruteMensuelle + renteAgircArrcoMensuelle) * (1 - psInfo.tauxComplementaire);
  const totalNetMensuelAvantIr = netCnav + netCompl;
  const totalBrutAnnuel = totalBrutMensuel * 12;

  const tauxRemplacementBrutPct =
    brutMensuel > 0 ? (totalBrutMensuel / brutMensuel) * 100 : 0;

  return {
    rules,
    ageDepartDecimal,
    avantAgeLegal,
    samRetenuAnnuel,
    trimestresTousRegimes,
    trimestresDecote,
    trimestresSurcote,
    tauxCnavPct,
    coeffSurcoteCnav,
    prorataRegimeGeneral,
    pensionCnavHorsEnfantsMensuelle,
    majorationEnfantsCnavMensuelle,
    pensionCnavTotaleBruteMensuelle,
    pointsIrcantecBase,
    pointsIrcantecApresModulation,
    ircantecEnCapital,
    ircantecRenteBruteMensuelle,
    ircantecCapitalBrutUnique,
    renteAgircArrcoMensuelle,
    totalBrutMensuel,
    totalNetMensuelAvantIr,
    totalBrutAnnuel,
    tauxRemplacementBrutPct,
  };
}
