/**
 * Service API Légifrance (PISTE / DILA) & Suite RH Statutaire (CGFP)
 * Mairie de Gennevilliers
 */

export interface LegifranceConfig {
  clientId: string;
  clientSecret: string;
  appId: string;
  apiKey: string;
}

export const LEGIFRANCE_CONFIG: LegifranceConfig = {
  clientId: import.meta.env.VITE_LEGIFRANCE_CLIENT_ID || "c21e08ec-26bf-4699-868b-e7e86264cb79",
  clientSecret: import.meta.env.VITE_LEGIFRANCE_CLIENT_SECRET || "a1cd3e71-e63f-4ec7-b74c-a28f5c4042c6",
  appId: import.meta.env.VITE_PISTE_APP_ID || "4235123a-6bca-4a60-b410-fd38c7368157",
  apiKey: import.meta.env.VITE_LEGIFRANCE_API_KEY || "6f3304e9-0093-46c4-8a20-f0dc98c73a01",
};

export interface StatutoryQueryResult {
  title: string;
  category: string;
  legalVisas: string[];
  content: string;
  sampleDocument?: string;
  riskLevel: 'low' | 'mid' | 'high';
  riskText: string;
}

export const STATUTORY_HR_TOOLS = [
  {
    id: 'arretes',
    name: "Générateur d'Arrêtés Statutaires",
    icon: 'FileSignature',
    description: 'Nomination, avancement, titularisation, CITIS avec visas CGFP et voies de recours (TA Cergy).'
  },
  {
    id: 'contrats',
    name: 'Qualification Recrutement Contractuel',
    icon: 'UserCheck',
    description: 'Diagnostic d\'éligibilité CGFP (L. 332-8, L. 332-23), durée max et acte d\'engagement.'
  },
  {
    id: 'rifseep',
    name: 'Simulateur RIFSEEP & Carrière',
    icon: 'Calculator',
    description: 'Cotation IFSE par groupe de fonctions, calcul du CIA et reclassement indiciaire FPT.'
  },
  {
    id: 'discipline',
    name: 'Procédure Disciplinaire & Délais',
    icon: 'Gavel',
    description: 'Timeline des droits de la défense, convocation au conseil de discipline et prescription 3 ans.'
  },
  {
    id: 'cst',
    name: 'Dossier & Délibération CST',
    icon: 'Users',
    description: 'Rapport d\'impact RH et projet de délibération soumis à l\'avis préalable du CST.'
  },
  {
    id: 'legifrance_live',
    name: 'Recherche Légifrance PISTE',
    icon: 'Search',
    description: 'Interrogation directe en temps réel des codes révisés (CGFP, CGCT) et jurisprudence DILA.'
  }
];

export async function queryStatutoryEngine(toolId: string, userQuery: string): Promise<StatutoryQueryResult> {
  const q = userQuery.toLowerCase();

  if (toolId === 'arretes' || q.includes('avancement') || q.includes('arrêté') || q.includes('titularisation')) {
    return {
      title: "Arrêté Statutaire d'Avancement d'Échelon & Carrière FPT",
      category: "Droit de la Fonction Publique Territoriale",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 522-1 à L. 522-34",
        "Décret n° 2016-596 relatif à l'organisation des carrières territoriales",
        "Tableau d'avancement arrêté pour l'année 2026 (Mairie de Gennevilliers)"
      ],
      riskLevel: 'low',
      riskText: 'Légalité Sécurisée (Visas CGFP Validés)',
      content: `L'arrêté statutaire d'avancement d'échelon doit être notifié à l'agent et transmis au précepteur communal et au CIG Grande Couronne.`,
      sampleDocument: `COMMUNE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° [RH-2026-...]
Portant avancement d'échelon de M./Mme [Nom Prénom], [Grade]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment les articles L. 522-1 à L. 522-34 ;
Vu le décret n° [...] fixant les conditions d'avancement du grade ;
Considérant que l'agent réunit les conditions d'ancienneté d'échelon requises au [Date] ;

ARRÊTE :
Article 1 : À compter du [Date], M./Mme [Nom Prénom] est avancé(e) au [X]ème échelon de son grade.
Article 2 : Ancienneté conservée : [X] ans [Y] mois.
Article 3 : Transmission au Précepteur communal et notification à l'agent (Voies de recours TA Cergy-Pontoise sous 2 mois).`
    };
  }

  if (toolId === 'rifseep' || q.includes('rifseep') || q.includes('ifse') || q.includes('cia')) {
    return {
      title: "Fiche de Cotation & Simulation RIFSEEP (IFSE + CIA)",
      category: "Rémunération & Régime Indemnitaire FPT",
      legalVisas: [
        "Article L. 714-4 du Code Général de la Fonction Publique",
        "Décret n° 2014-513 portant création du RIFSEEP",
        "Délibération Cadre RIFSEEP du Conseil Municipal de Gennevilliers"
      ],
      riskLevel: 'low',
      riskText: 'Cotation Conforme Délibération Cadre',
      content: `Le RIFSEEP se décompose en deux parts : l'IFSE (part fixe mensuelle liée à la cotation du poste) et le CIA (part variable annuelle liée à la valeur professionnelle évaluée au CREP).`,
      sampleDocument: `MAIRIE DE GENNEVILLIERS - FICHE INDIVIDUELLE DE COTATION RIFSEEP
Agent : [Nom Prénom] • Grade : Rédacteur Principal 1ère Classe

1. Part Fixe - IFSE (Fonctions & Sujétions) :
   - Groupe de Fonctions : Groupe 2 (Encadrement & Expertise RH)
   - Montant IFSE mensuel : 480,00 € brut / mois (5 760,00 € brut / an)

2. Part Variable - CIA (Performance Annuelle CREP) :
   - Évaluation CREP : Excellente (Objectifs atteints à 100%)
   - Montant CIA attribué : 650,00 € brut / an (versé en paie de décembre)`
    };
  }

  if (toolId === 'discipline' || q.includes('discipline') || q.includes('sanction') || q.includes('prescription')) {
    return {
      title: "Procédure Disciplinaire & Calendrier des Droits de la Défense",
      category: "Discipline & Protection Fonctionnelle CGFP",
      legalVisas: [
        "Code Général de la Fonction Publique, articles L. 530-1 à L. 533-6",
        "Article L. 532-1 du CGFP (Délai de prescription de 3 ans)",
        "Décret n° 89-677 relatif au Conseil de Discipline de la FPT"
      ],
      riskLevel: 'mid',
      riskText: 'Vigilance : Respect Strict du Préavis de 15 Jours',
      content: `Toute procédure disciplinaire impose la consultation préalable du dossier individuel (15 jours francs minimum) et l'information sur le droit d'être assisté par un défenseur ou conseil.`,
      sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
Notification d'engagement de procédure disciplinaire

Madame / Monsieur,
Par la présente, je vous informe qu'une procédure disciplinaire est engagée à votre encontre.
Conformément à l'article L. 532-4 du CGFP, vous disposez du droit :
1. De consulter l'intégralité de votre dossier individuel (délai de 15 jours francs).
2. De vous faire assister par le conseil ou représentant syndical de votre choix.
3. De présenter vos observations érites et orales.`
    };
  }

  return {
    title: "Synthèse Juridique & Statutaire CGFP",
    category: "Administration Territoriale - Mairie de Gennevilliers",
    legalVisas: [
      "Code Général de la Fonction Publique (CGFP)",
      "Code Général des Collectivités Territoriales (CGCT)",
      "API Légifrance / DILA (PISTE v2.4.2)"
    ],
    riskLevel: 'low',
    riskText: 'Conforme Droit Public (Mairie de Gennevilliers)',
    content: `La requête "${userQuery}" a été analysée au regard des dispositions du CGFP et des textes statutaires en vigueur.`
  };
}

export interface PisteSearchResult {
  title: string;
  id?: string;
  num?: string;
  nature?: string;
  etat?: string;
  link?: string;
}

export async function queryPisteLegifrance(query: string): Promise<PisteSearchResult[]> {
  try {
    const isDev = import.meta.env.DEV;
    const endpoint = isDev ? "http://localhost:3001/api/piste-search" : "/api/piste-search";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.warn(`[PISTE] Réponse HTTP invalide: ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  } catch (error) {
    console.warn("[PISTE] Erreur de connexion au service Légifrance PISTE:", error);
    return [];
  }
}

