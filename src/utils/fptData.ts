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
  }
];

// Dictionnaire de base pour les grilles indiciaires.
// Format: Record<Grade, Record<Echelon, { ib: string, im: string }>>
// À compléter et mettre à jour avec les valeurs réelles.
export const grillesIndiciaires: Record<string, Record<string, { ib: string, im: string }>> = {
  "Adjoint administratif": {
    "1er échelon": { ib: "367", im: "361" },
    "2ème échelon": { ib: "368", im: "362" },
    "3ème échelon": { ib: "370", im: "363" },
    "4ème échelon": { ib: "371", im: "364" },
    "5ème échelon": { ib: "374", im: "365" },
    "6ème échelon": { ib: "378", im: "366" },
    "7ème échelon": { ib: "381", im: "368" },
    "8ème échelon": { ib: "387", im: "370" },
    "9ème échelon": { ib: "397", im: "373" },
    "10ème échelon": { ib: "413", im: "375" },
    "11ème échelon": { ib: "430", im: "380" },
  },
  "Rédacteur": {
    "1er échelon": { ib: "372", im: "365" },
    "2ème échelon": { ib: "379", im: "367" },
    "3ème échelon": { ib: "388", im: "370" },
    "4ème échelon": { ib: "397", im: "373" },
    "5ème échelon": { ib: "415", im: "376" },
    "6ème échelon": { ib: "431", im: "381" },
    "7ème échelon": { ib: "452", im: "396" },
    "8ème échelon": { ib: "478", im: "415" },
    "9ème échelon": { ib: "500", im: "431" },
    "10ème échelon": { ib: "513", im: "441" },
    "11ème échelon": { ib: "538", im: "457" },
    "12ème échelon": { ib: "563", im: "477" },
    "13ème échelon": { ib: "597", im: "503" },
  }
};

// Échelons standards possibles (à adapter selon les grades, 13 est le max général)
export const echelonsList = [
  "1er échelon", "2ème échelon", "3ème échelon", "4ème échelon", "5ème échelon", 
  "6ème échelon", "7ème échelon", "8ème échelon", "9ème échelon", "10ème échelon", 
  "11ème échelon", "12ème échelon", "13ème échelon"
];

export const getIndicesForGradeAndEchelon = (grade: string, echelon: string): { ib: string, im: string } | null => {
  if (grillesIndiciaires[grade] && grillesIndiciaires[grade][echelon]) {
    return grillesIndiciaires[grade][echelon];
  }
  return null; // Retourne null si non trouvé dans la base de données
};
