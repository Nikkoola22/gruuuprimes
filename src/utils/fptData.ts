export interface FptCadre {
  id: string;
  nom: string;
  decretNum: string;
  decretDate: string;
  grades: string[];
}

export const fptCadres: FptCadre[] = [
  {
    id: "adj-adm",
    nom: "Adjoints administratifs territoriaux",
    decretNum: "2006-1690",
    decretDate: "2006-12-22",
    grades: [
      "Adjoint administratif",
      "Adjoint administratif principal de 2e classe",
      "Adjoint administratif principal de 1re classe"
    ]
  },
  {
    id: "redacteurs",
    nom: "Rédacteurs territoriaux",
    decretNum: "2012-924",
    decretDate: "2012-07-30",
    grades: [
      "Rédacteur",
      "Rédacteur principal de 2e classe",
      "Rédacteur principal de 1re classe"
    ]
  },
  {
    id: "attaches",
    nom: "Attachés territoriaux",
    decretNum: "87-1099",
    decretDate: "1987-12-30",
    grades: [
      "Attaché",
      "Attaché principal",
      "Attaché hors classe",
      "Directeur territorial"
    ]
  },
  {
    id: "adj-tech",
    nom: "Adjoints techniques territoriaux",
    decretNum: "2006-1691",
    decretDate: "2006-12-22",
    grades: [
      "Adjoint technique",
      "Adjoint technique principal de 2e classe",
      "Adjoint technique principal de 1re classe"
    ]
  },
  {
    id: "agents-maitrise",
    nom: "Agents de maîtrise territoriaux",
    decretNum: "88-547",
    decretDate: "1988-05-06",
    grades: [
      "Agent de maîtrise",
      "Agent de maîtrise principal"
    ]
  },
  {
    id: "techniciens",
    nom: "Techniciens territoriaux",
    decretNum: "2010-1357",
    decretDate: "2010-11-09",
    grades: [
      "Technicien",
      "Technicien principal de 2e classe",
      "Technicien principal de 1re classe"
    ]
  },
  {
    id: "ingenieurs",
    nom: "Ingénieurs territoriaux",
    decretNum: "2016-201",
    decretDate: "2016-02-26",
    grades: [
      "Ingénieur",
      "Ingénieur principal",
      "Ingénieur hors classe"
    ]
  },
  {
    id: "adj-anim",
    nom: "Adjoints territoriaux d'animation",
    decretNum: "2006-1693",
    decretDate: "2006-12-22",
    grades: [
      "Adjoint d'animation",
      "Adjoint d'animation principal de 2e classe",
      "Adjoint d'animation principal de 1re classe"
    ]
  },
  {
    id: "animateurs",
    nom: "Animateurs territoriaux",
    decretNum: "2011-558",
    decretDate: "2011-05-23",
    grades: [
      "Animateur",
      "Animateur principal de 2e classe",
      "Animateur principal de 1re classe"
    ]
  },
  {
    id: "atsem",
    nom: "Agents territoriaux spécialisés des écoles maternelles (ATSEM)",
    decretNum: "92-850",
    decretDate: "1992-08-28",
    grades: [
      "ATSEM principal de 2e classe",
      "ATSEM principal de 1re classe"
    ]
  },
  {
    id: "aux-puericulture",
    nom: "Auxiliaires de puériculture territoriaux",
    decretNum: "2021-1880",
    decretDate: "2021-12-29",
    grades: [
      "Auxiliaire de puériculture de classe normale",
      "Auxiliaire de puériculture de classe supérieure"
    ]
  },
  {
    id: "eje",
    nom: "Éducateurs territoriaux de jeunes enfants",
    decretNum: "2017-1256",
    decretDate: "2017-08-09",
    grades: [
      "Éducateur de jeunes enfants",
      "Éducateur de jeunes enfants de classe exceptionnelle"
    ]
  },
  {
    id: "police-municipale",
    nom: "Agents de police municipale",
    decretNum: "2006-1391",
    decretDate: "2006-11-17",
    grades: [
      "Gardien-brigadier",
      "Brigadier-chef principal"
    ]
  },
  {
    id: "adj-patrimoine",
    nom: "Adjoints territoriaux du patrimoine",
    decretNum: "2006-1692",
    decretDate: "2006-12-22",
    grades: [
      "Adjoint du patrimoine",
      "Adjoint du patrimoine principal de 2e classe",
      "Adjoint du patrimoine principal de 1re classe"
    ]
  },
  {
    id: "assistants-socio-educatifs",
    nom: "Assistants territoriaux socio-éducatifs",
    decretNum: "2017-901",
    decretDate: "2017-05-09",
    grades: [
      "Assistant socio-éducatif",
      "Assistant socio-éducatif de classe exceptionnelle"
    ]
  },
  {
    id: "operateurs-aps",
    nom: "Opérateurs territoriaux des activités physiques et sportives",
    decretNum: "92-368",
    decretDate: "1992-04-01",
    grades: [
      "Opérateur des APS",
      "Opérateur des APS principal de 2e classe",
      "Opérateur des APS principal de 1re classe"
    ]
  },
  {
    id: "educateurs-aps",
    nom: "Éducateurs territoriaux des activités physiques et sportives",
    decretNum: "95-27",
    decretDate: "1995-01-10",
    grades: [
      "Éducateur des APS",
      "Éducateur des APS principal de 2e classe",
      "Éducateur des APS principal de 1re classe"
    ]
  },
  {
    id: "conseillers-aps",
    nom: "Conseillers territoriaux des activités physiques et sportives",
    decretNum: "92-364",
    decretDate: "1992-04-01",
    grades: [
      "Conseiller des APS",
      "Conseiller des APS principal"
    ]
  },
];

import { CADRES_EMPLOIS } from "../data/gradesData";

// Dictionnaire de base pour les grilles indiciaires.
// Format: Record<Grade, Record<Echelon, { ib: string, im: string }>>
// Complété dynamiquement par les grilles complètes officielles de CADRES_EMPLOIS.
export const grillesIndiciaires: Record<string, Record<string, { ib: string, im: string }>> = {
  "Adjoint administratif": {
    "1er échelon": { ib: "367", im: "366" },
    "2ème échelon": { ib: "368", im: "367" },
    "3ème échelon": { ib: "370", im: "368" },
    "4ème échelon": { ib: "371", im: "369" },
    "5ème échelon": { ib: "374", im: "370" },
    "6ème échelon": { ib: "378", im: "371" },
    "7ème échelon": { ib: "381", im: "372" },
    "8ème échelon": { ib: "387", im: "373" },
    "9ème échelon": { ib: "401", im: "376" },
    "10ème échelon": { ib: "419", im: "377" },
    "11ème échelon": { ib: "432", im: "387" },
  },
  "Rédacteur": {
    "1er échelon": { ib: "389", im: "373" },
    "2ème échelon": { ib: "395", im: "374" },
    "3ème échelon": { ib: "397", im: "375" },
    "4ème échelon": { ib: "401", im: "376" },
    "5ème échelon": { ib: "415", im: "377" },
    "6ème échelon": { ib: "431", im: "386" },
    "7ème échelon": { ib: "452", im: "401" },
    "8ème échelon": { ib: "478", im: "420" },
    "9ème échelon": { ib: "500", im: "436" },
    "10ème échelon": { ib: "513", im: "446" },
    "11ème échelon": { ib: "538", im: "462" },
    "12ème échelon": { ib: "563", im: "482" },
    "13ème échelon": { ib: "597", im: "508" },
  },
  "Directeur territorial": {
    "1er échelon": { ib: "722", im: "603" },
    "2ème échelon": { ib: "759", im: "631" },
    "3ème échelon": { ib: "798", im: "661" },
    "4ème échelon": { ib: "857", im: "705" },
    "5ème échelon": { ib: "907", im: "744" },
    "6ème échelon": { ib: "968", im: "789" },
    "7ème échelon": { ib: "1020", im: "829" },
  }
};

// Échelons standards possibles (à adapter selon les grades, 13 est le max général)
export const echelonsList = [
  "1er échelon", "2ème échelon", "3ème échelon", "4ème échelon", "5ème échelon", 
  "6ème échelon", "7ème échelon", "8ème échelon", "9ème échelon", "10ème échelon", 
  "11ème échelon", "12ème échelon", "13ème échelon"
];

function normalizeGradeName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\bterritorial(e|s|es)?\b/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const getIndicesForGradeAndEchelon = (grade: string, echelon: string): { ib: string, im: string } | null => {
  if (!grade || !echelon) return null;

  // 1. Direct match dans grillesIndiciaires
  if (grillesIndiciaires[grade] && grillesIndiciaires[grade][echelon]) {
    return grillesIndiciaires[grade][echelon];
  }

  // 2. Extraction du numéro d'échelon ("1er échelon" -> 1, "2ème échelon" -> 2)
  const echNum = parseInt(echelon.replace(/\D/g, ''), 10);
  if (isNaN(echNum)) return null;

  const targetNorm = normalizeGradeName(grade);

  // 3. Recherche exacte normalisée dans CADRES_EMPLOIS
  for (const cadre of CADRES_EMPLOIS) {
    for (const g of cadre.grades) {
      if (normalizeGradeName(g.nom) === targetNorm) {
        const foundEch = g.echelons.find(e => e.numero === echNum);
        if (foundEch) {
          return {
            ib: String(foundEch.indiceBrut),
            im: String(foundEch.indiceMajore)
          };
        }
      }
    }
  }

  // 4. Recherche par préfixe ou inclusion dans CADRES_EMPLOIS
  for (const cadre of CADRES_EMPLOIS) {
    for (const g of cadre.grades) {
      const gNorm = normalizeGradeName(g.nom);
      if (gNorm.startsWith(targetNorm) || targetNorm.startsWith(gNorm) || gNorm.includes(targetNorm) || targetNorm.includes(gNorm)) {
        const foundEch = g.echelons.find(e => e.numero === echNum);
        if (foundEch) {
          return {
            ib: String(foundEch.indiceBrut),
            im: String(foundEch.indiceMajore)
          };
        }
      }
    }
  }

  return null;
};
