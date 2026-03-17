/**
 * BIP File Categories Configuration
 * 
 * Maps BIP file categories with metadata for intelligent file identification.
 */

export interface BipFileCategory {
  id: string;
  label: string;
  directory: string;
  path?: string; // Optional path for file loading
  keywords: string[];
}

export const BIP_FILE_CATEGORIES: BipFileCategory[] = [
  {
    id: 'agents-contractuels',
    label: 'Agents Contractuels',
    directory: 'agents-contractuels',
    path: '/bip/output/bip-agents-contractuels.jsonl',
    keywords: ['agent', 'contractuel', 'contrat', 'recrutement', 'embauche', 'engagement']
  },
  {
    id: 'cadres-emplois',
    label: 'Cadres d\'Emplois',
    directory: 'cadres-emplois',
    path: '/bip/output/bip-cadres-emplois.jsonl',
    keywords: ['cadre', 'emplois', 'catégorie', 'grade', 'filière', 'administrateur', 'ingénieur']
  },
  {
    id: 'carriere',
    label: 'Carrière',
    directory: 'carriere',
    path: '/bip/output/bip-carriere.jsonl',
    keywords: ['carrière', 'promotion', 'mobilité', 'avancement', 'grade', 'détachement']
  },
  {
    id: 'conditions-travail',
    label: 'Conditions de Travail',
    directory: 'conditions-d-exercice-des-fonctions-et-duree-du-travail',
    path: '/bip/output/bip-conditions-travail.jsonl',
    keywords: ['travail', 'durée', 'horaires', 'temps', 'conditions', 'exercice', 'teletravail']
  },
  {
    id: 'conges-absences',
    label: 'Congés & Absences',
    directory: 'conges-et-absences',
    path: '/bip/output/bip-conges-absences.jsonl',
    keywords: ['congé', 'absence', 'congés', 'vacances', 'repos', 'autorisations', 'permissions']
  },
  {
    id: 'discipline',
    label: 'Discipline',
    directory: 'discipline2',
    path: '/bip/output/bip-discipline.jsonl',
    keywords: ['discipline', 'sanction', 'avertissement', 'blâme', 'révocation', 'licenciement', 'faute']
  },
  {
    id: 'indisponibilite',
    label: 'Indisponibilité & Sécurité Sociale',
    directory: 'indisponibilite-physique-et-securite-sociale',
    path: '/bip/output/bip-indisponibilite.jsonl',
    keywords: ['indisponibilité', 'maladie', 'santé', 'médecin', 'arrêt', 'sécurité', 'sociale']
  },
  {
    id: 'positions',
    label: 'Positions Statutaires',
    directory: 'positions',
    path: '/bip/output/bip-positions.jsonl',
    keywords: ['position', 'positions', 'détachement', 'detachement', 'disponibilité', 'congé parental', 'réintégration', 'integration', 'fin de détachement', 'statutaire']
  },
  {
    id: 'primes-indemnites',
    label: 'Primes & Indemnités',
    directory: 'liste-des-principales-primes-et-indemnites',
    path: '/bip/output/bip-primes-indemnites.jsonl',
    keywords: ['prime', 'primes', 'indemnité', 'indemnites', 'rifseep', 'ifse', 'cia', 'sujétions', 'sujetions', 'nbi']
  },
  {
    id: 'remuneration-cotisations',
    label: 'Rémunération & Cotisations',
    directory: 'remuneration-autres-avantages-financiers-cotisations',
    path: '/bip/output/bip-remuneration-cotisations.jsonl',
    keywords: ['rémunération', 'remuneration', 'traitement', 'cotisation', 'cotisations', 'sft', 'smic', 'csg', 'indemnité de résidence', 'logement de fonction']
  }
];

/**
 * JSONL files for legacy support (in case we still use those)
 */
export const BIP_JSONL_FILES = [
  '/bip/output/bip-agents-contractuels.jsonl',
  '/bip/output/bip-cadres-emplois.jsonl',
  '/bip/output/bip-carriere.jsonl',
  '/bip/output/bip-conditions-travail.jsonl',
  '/bip/output/bip-conges-absences.jsonl',
  '/bip/output/bip-discipline.jsonl',
  '/bip/output/bip-indisponibilite.jsonl',
  '/bip/output/bip-positions.jsonl',
  '/bip/output/bip-primes-indemnites.jsonl',
  '/bip/output/bip-remuneration-cotisations.jsonl'
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): BipFileCategory | undefined {
  return BIP_FILE_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Find categories by keyword matching
 */
export function findCategoriesByKeyword(keyword: string): BipFileCategory[] {
  const normalizedKeyword = keyword.toLowerCase();
  return BIP_FILE_CATEGORIES.filter(cat =>
    cat.keywords.some(kw => kw.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(kw.toLowerCase()))
  );
}
