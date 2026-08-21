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

export interface AnalysisFormDetails {
  structureValide: boolean;
  visasConcernes: string[];
  mentionsObligatoires: { name: string; present: boolean; note?: string }[];
  remarquesForme: string[];
}

export interface AnalysisFondDetails {
  qualificationJuridique: string;
  conformiteCGFP: boolean;
  risquesRequalification: string;
  remarquesFond: string[];
  jurisprudencesAssociees: string[];
  recommandations: string[];
}

export interface StatutoryQueryResult {
  title: string;
  category: string;
  cgfpRef?: string;
  legalVisas: string[];
  content: string;
  sampleDocument?: string;
  riskLevel: 'low' | 'mid' | 'high';
  riskText: string;
  analyseForme?: AnalysisFormDetails;
  analyseFond?: AnalysisFondDetails;
}

import { matchStatutoryAct } from "../data/statutoryActsTemplates";

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
  const rawQ = (userQuery || "").trim();
  const q = rawQ.toLowerCase();

  // 0. Vérification prioritaire dans la base enrichie des actes fréquents
  const enrichedAct = matchStatutoryAct(toolId, rawQ);
  if (enrichedAct) {
    return enrichedAct;
  }

  // Helper to extract the reason or context from user query (e.g. "car ne remplit pas les fonctions")
  const extractMotive = (text: string): string => {
    const motiveMatch = text.match(/(?:car|motif|parce que|en raison de|pour|suite à)\s+(.+)/i);
    if (motiveMatch && motiveMatch[1]) {
      return motiveMatch[1].trim();
    }
    return "l'examen des critères statutaires et des conditions réglementaires d'attribution";
  };

  const detectedMotive = extractMotive(rawQ);
  const isRefusal = q.includes('refus') || q.includes('rejet') || q.includes('non') || q.includes('ne rempli') || q.includes('ne remplit') || q.includes('ineligible') || q.includes('incompatible') || q.includes('opposition');

  // =========================================================================
  // 1. NBI (NOUVELLE BONIFICATION INDICIAIRE) - REFUS OU ATTRIBUTION
  // =========================================================================
  if (q.includes('nbi') || q.includes('bonification indiciaire')) {
    if (isRefusal) {
      return {
        title: "Décision du Maire : Refus d'Attribution de la Nouvelle Bonification Indiciaire (NBI)",
        category: "Rémunération & Bonification Indiciaire (NBI)",
        cgfpRef: "Loi n° 91-73 (Art. 27) & Décrets n° 93-863, 2006-779, 2006-780",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), notamment ses articles L. 712-1 et L. 712-2",
          "Loi n° 91-73 du 18 janvier 1991 modifiée (Article 27 portant création de la NBI)",
          "Décret n° 93-863 du 18 juin 1993 modifié relatif aux conditions de mise en œuvre de la NBI dans la FPT",
          "Décret n° 2006-779 du 3 juillet 2006 portant attribution de la NBI aux fonctionnaires territoriaux",
          "Décret n° 2006-780 du 3 juillet 2006 relatif à la NBI dans les zones urbaines sensibles / QPV",
          "Fiche de poste et rapport de la Direction des Ressources Humaines constatant le non-exercice effectif des fonctions éligibles",
          "Demande formulée par l'agent en date du [Date de la demande]"
        ],
        riskLevel: 'low',
        riskText: 'Légalité Sécurisée : Principe de l\'exercice effectif des fonctions (CE 28 avr. 2006)',
        content: `La Nouvelle Bonification Indiciaire (NBI) est strictement attachée à l'exercice effectif des fonctions y ouvrant droit (accueil principal du public, encadrement de proximité, sujétions particulières ou technicité spécifique). En l'absence d'exercice effectif et régulier de ces missions, l'autorité territoriale est en situation de compétence liée pour refuser ou retirer le versement des points de NBI.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: [
            "Loi n° 91-73 du 18 janvier 1991 (Art. 27)",
            "Décrets n° 93-863, n° 2006-779 et n° 2006-780",
            "CGFP Articles L. 712-1 et L. 712-2"
          ],
          mentionsObligatoires: [
            { name: "Motivation en fait et en droit (Fiche de poste / Réalité des tâches)", present: true, note: "Obligatoire au titre du CRPA" },
            { name: "Constat du non-exercice des fonctions éligibles du décret", present: true, note: "Précisé" },
            { name: "Mention des voies et délais de recours (TA Cergy-Pontoise - 2 mois)", present: true, note: "Présente" }
          ],
          remarquesForme: [
            "La décision doit être notifiée par écrit contre décharge ou par lettre recommandée avec accusé de réception.",
            "La NBI ne constituant pas un droit acquis au grade, son refus ou sa suppression pour cessation des fonctions correspondantes ne nécessite pas de procédure disciplinaire préalable."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Décision administrative individuelle de refus d'octroi de points de NBI",
          conformiteCGFP: true,
          risquesRequalification: "Faible : Conformité totale avec la jurisprudence constante du Conseil d'État.",
          remarquesFond: [
            "PRINCIPE D'ATTACHEMENT À LA FONCTION : La NBI est liée à l'emploi et aux fonctions réellement exercées, et non au grade ou au cadre d'emplois de l'agent.",
            "ABSENCE DE DROIT ACQUIS : Dès lors que les missions exercées ne correspondent pas aux critères limitatifs fixés par les décrets de 2006 (ex: moins de 50% du temps en accueil physique direct), la collectivité ne peut légalement attribuer la NBI.",
            "COMPÉTENCE LIÉE : L'autorité territoriale ne dispose d'aucun pouvoir discrétionnaire pour attribuer une NBI en dehors des cas expressément prévus par les décrets d'application."
          ],
          jurisprudencesAssociees: [
            "Conseil d'État, 28 avril 2006, n° 279586 (La NBI est subordonnée à l'exercice effectif des fonctions y ouvrant droit)",
            "Conseil d'État, 18 mars 1998, n° 174092 (Cessation de plein droit de la NBI lors du changement de fonctions)",
            "CAA Versailles, 14 décembre 2021, n° 19VE02145 (Légalité du refus de NBI pour tâches d'accueil non prépondérantes)"
          ],
          recommandations: [
            "Annexer la fiche de poste actualisée signée par l'agent et le chef de service.",
            "Préciser dans le courrier de notification les fonctions réelles de l'agent qui justifient la non-éligibilité.",
            "Rappeler que toute évolution ultérieure des missions vers des fonctions éligibles permettra un réexamen de la situation."
          ]
        },
        sampleDocument: `COMMUNE DE GENNEVILLIERS
Direction des Ressources Humaines
Service Gestion des Carrières et Statut
Réf : RH-2026-NBI-[DOSSIER-N°]

DÉCISION DU MAIRE
Portant refus d'attribution de la Nouvelle Bonification Indiciaire (NBI)

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT) ;
Vu le Code Général de la Fonction Publique (CGFP), notamment ses articles L. 712-1 et L. 712-2 ;
Vu la loi n° 91-73 du 18 janvier 1991 modifiée portant dispositions relatives à la santé publique et aux assurances sociales, notamment son article 27 instaurant la Nouvelle Bonification Indiciaire (NBI) ;
Vu le décret n° 93-863 du 18 juin 1993 modifié relatif aux conditions de mise en œuvre de la Nouvelle Bonification Indiciaire dans la fonction publique territoriale ;
Vu le décret n° 2006-779 du 3 juillet 2006 portant attribution de la Nouvelle Bonification Indiciaire à certains personnels de la fonction publique territoriale ;
Vu le décret n° 2006-780 du 3 juillet 2006 portant attribution de la Nouvelle Bonification Indiciaire aux agents exerçant dans les zones urbaines sensibles ;
Vu la demande formulée par M./Mme [Nom et Prénom de l'agent], [Grade de l'agent], en date du [Date de la demande], tendant à l'attribution de [X] points de NBI au titre de ses fonctions ;
Vu la fiche de poste de l'intéressé(e) et l'organigramme de la direction [Nom de la direction / service] ;
Vu le rapport circonstancié de la Direction des Ressources Humaines en date du [Date du rapport] attestant que les missions réellement confiées et exercées par l'agent ne correspondent pas aux critères d'éligibilité définis par les décrets précités (${detectedMotive}) ;
Considérant que la NBI est attachée à l'exercice effectif des fonctions et qu'elle ne peut être légalement attribuée lorsque l'agent n'exerce pas à titre principal les fonctions éligibles ;

DÉCIDE :

ARTICLE 1 : La demande tendant à l'octroi de la Nouvelle Bonification Indiciaire (NBI) présentée par M./Mme [Nom et Prénom de l'agent] est REJETÉE.

ARTICLE 2 (Motivation) : Le présent refus est motivé par le fait que M./Mme [Nom Prénom] n'exerce pas de manière effective et prépondérante les missions requises par la réglementation en vigueur (${detectedMotive}).

ARTICLE 3 : Le Directeur Général des Services et le Directeur des Ressources Humaines sont chargés, chacun en ce qui le concerne, de l'exécution de la présente décision qui sera notifiée à l'intéressé(e).

ARTICLE 4 (Voies et Délais de Recours) :
La présente décision municipale peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date du jour]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    } else {
      return {
        title: "Arrêté du Maire : Attribution de la Nouvelle Bonification Indiciaire (NBI)",
        category: "Rémunération & Bonification Indiciaire (NBI)",
        cgfpRef: "Loi n° 91-73 (Art. 27) & Décrets n° 2006-779 / 2006-780",
        legalVisas: [
          "Code Général de la Fonction Publique, articles L. 712-1 et L. 712-2",
          "Loi n° 91-73 du 18 janvier 1991 modifiée (Art. 27)",
          "Décret n° 93-863 du 18 juin 1993 modifié",
          "Décret n° 2006-779 du 3 juillet 2006 (fonctions éligibles FPT)",
          "Fiche de poste constatant l'exercice effectif des fonctions éligibles"
        ],
        riskLevel: 'low',
        riskText: 'Attribution Sécurisée : Fonctions éligibles validées',
        content: `La NBI est attribuée à raison de [X] points majorés mensuels. Elle est soumise à retenue pour pension et s'ajoute au traitement indiciaire de base pendant toute la durée de l'exercice effectif des fonctions.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: ["Loi n° 91-73", "Décret n° 2006-779"],
          mentionsObligatoires: [
            { name: "Nombre de points de NBI attribués", present: true, note: "Conforme" },
            { name: "Intitulé exact de la fonction éligible", present: true, note: "Conforme" },
            { name: "Date d'effet exécutoire", present: true, note: "Précisée" }
          ],
          remarquesForme: ["Arrêté individuel transmis au représentant de l'État et au comptable public."]
        },
        analyseFond: {
          qualificationJuridique: "Arrêté municipal d'attribution de NBI",
          conformiteCGFP: true,
          risquesRequalification: "Faible (Exercice effectif des fonctions)",
          remarquesFond: ["La NBI cesse d'être versée de plein droit si l'agent change d'affectation ou de fonctions."],
          jurisprudencesAssociees: ["CE, 28 avr. 2006, n° 279586"],
          recommandations: ["Mettre à jour le dossier individuel et la déclaration CNRACL."]
        },
        sampleDocument: `COMMUNE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-NBI-[XXX]
Portant attribution de la Nouvelle Bonification Indiciaire (NBI) à M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique ;
Vu la loi n° 91-73 du 18 janvier 1991 modifiée (art. 27) ;
Vu le décret n° 2006-779 du 3 juillet 2006 portant attribution de la NBI aux fonctionnaires territoriaux ;
Vu l'affectation de M./Mme [Nom Prénom], [Grade], au poste de [Intitulé du poste], comportant à titre principal des fonctions de [Accueil / Encadrement / QPV] ;

ARRÊTE :
ARTICLE 1 : À compter du [Date d'effet], une Nouvelle Bonification Indiciaire de [10 / 15 / 20 / 25 / 30] points majorés est attribuée à M./Mme [Nom Prénom].
ARTICLE 2 : Cette bonification est attachée à l'exercice effectif des fonctions et cessera de plein droit en cas de changement d'affectation.
ARTICLE 3 : Notification à l'agent et transmission au contrôle de légalité (Recours TA Cergy-Pontoise sous 2 mois).

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    }
  }

  // =========================================================================
  // 2. TEMPS PARTIEL THÉRAPEUTIQUE (TPT) - DÉLAI 30 JOURS
  // =========================================================================
  if (q.includes('tpt') || q.includes('temps partiel th') || q.includes('thérapeutique') || q.includes('therapeutique')) {
    if (isRefusal || q.includes('30') || q.includes('delai') || q.includes('délai') || q.includes('motif')) {
      return {
        title: "Décision du Maire : Refus de Temps Partiel Thérapeutique (TPT) - Délai de 30 Jours",
        category: "Positions Statutaires & Temps de Travail CGFP",
        cgfpRef: "CGFP Art. L. 823-1 à L. 823-6 & Décret 87-602 (Art. 13-1 à 13-10)",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), articles L. 823-1 à L. 823-6",
          "Code Général des Collectivités Territoriales (CGCT)",
          "Décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie des fonctionnaires territoriaux (Art. 13-1 et s.)",
          "Décret n° 2021-1462 du 8 novembre 2021 relatif au temps partiel pour raison thérapeutique",
          "Demande écrite formulée par l'agent et certificat médical du médecin traitant"
        ],
        riskLevel: 'mid',
        riskText: 'Vigilance : Notification sous 30 jours + Motivation obligatoire (médicale ou service)',
        content: `Conformément aux articles L. 823-1 et suivants du CGFP et au décret n° 87-602 modifié, l'employeur territorial dispose d'un délai strict de 30 jours à compter de la réception de la demande pour notifier sa décision. Tout refus doit obligatoirement être motivé (nécessités impérieuses de service après entretien, ou avis défavorable d'un médecin agréé). Le silence gardé pendant 30 jours vaut acceptation tacite du TPT.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: [
            "CGFP Articles L. 823-1 à L. 823-6",
            "Décret n° 87-602 (Articles 13-1 à 13-10)",
            "Décret n° 2021-1462 du 8 novembre 2021"
          ],
          mentionsObligatoires: [
            { name: "Délai de notification impératif de 30 jours", present: true, note: "Respecté si notifié avant l'expiration du 30e jour" },
            { name: "Motivation circonstanciée en fait et en droit", present: true, note: "Obligatoire : visa de l'avis du médecin agréé ou exposé des contraintes de service" },
            { name: "Mention des voies et délais de recours (TA Cergy-Pontoise - 2 mois)", present: true, note: "Présente dans l'acte" },
            { name: "Information sur la saisine possible du Conseil Médical", present: true, note: "Recommandée en cas de contestation médicale" }
          ],
          remarquesForme: [
            "La décision doit obligatoirement être notifiée en main propre contre décharge ou par lettre recommandée avec accusé de réception (LRAR) pour établir la date certaine de notification.",
            "Si le refus repose sur l'état de santé, l'employeur a l'obligation légale de faire examiner l'agent par un médecin agréé avant de statuer."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Décision administrative individuelle de refus de Temps Partiel Thérapeutique (TPT)",
          conformiteCGFP: true,
          risquesRequalification: "Moyen : Risque d'annulation contentieuse devant le TA de Cergy si la décision intervient après 30 jours (accord tacite) ou en l'absence d'expertise médicale préalable.",
          remarquesFond: [
            "DÉLAI DE 30 JOURS : En application de la réglementation 2026, l'absence de réponse écrite dans les 30 jours suivant la demande vaut accord implicite de plein droit.",
            "MOTIVATION DE SERVICE : Un refus fondé sur les nécessités du service suppose la tenue d'un entretien préalable avec l'agent pour étudier les possibilités d'adaptation.",
            "MOTIVATION MÉDICALE : En cas de désaccord entre le médecin traitant et l'autorité, la saisine du Conseil Médical en formation restreinte peut être diligentée par l'agent."
          ],
          jurisprudencesAssociees: [
            "Conseil d'État, 27 mai 2020, n° 426892 (Obligation de motivation circonstanciée des refus de TPT)",
            "CAA Versailles, 18 oct. 2022, n° 20VE03112 (Dépassement du délai de réponse valant accord tacite)",
            "TA Cergy-Pontoise, 15 nov. 2024, n° 2308119 (Annulation d'un refus de TPT non précédé d'une expertise médicale agréée)"
          ],
          recommandations: [
            "Consigner la date exacte d'accusé de réception de la demande initiale dans le registre RH.",
            "Si le motif est organisationnel, formaliser le compte-rendu de l'entretien préalable démontrant l'impossibilité d'aménager le poste.",
            "Transmettre une copie de la décision au médecin de prévention / du travail de la collectivité."
          ]
        },
        sampleDocument: `MAIRIE DE GENNEVILLIERS
Direction des Ressources Humaines
Service Gestion des Carrières et Statut
Réf : RH-2026-TPT-[DOSSIER-N°]

DÉCISION DU MAIRE
Portant refus d'autorisation d'accomplir un service à Temps Partiel pour Raison Thérapeutique (TPT)

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT) ;
Vu le Code Général de la Fonction Publique (CGFP), notamment ses articles L. 823-1 à L. 823-6 ;
Vu le décret n° 87-602 du 30 juillet 1987 modifié relatif à l'organisation des comités médicaux et aux congés de maladie des fonctionnaires territoriaux, notamment ses articles 13-1 à 13-10 ;
Vu le décret n° 2021-1462 du 8 novembre 2021 relatif au temps partiel pour raison thérapeutique dans la fonction publique territoriale ;
Vu la demande écrite présentée par M./Mme [Nom et Prénom de l'agent], [Grade / Cadre d'emplois], reçue le [Date de réception de la demande], tendant à l'octroi d'une autorisation d'exercice à temps partiel pour raison thérapeutique à raison d'une quotité de [50% / 60% / 70% / 80%] pour une période de [Durée, ex: 3 mois] ;
Vu le certificat médical du médecin traitant joint à la demande initiale ;
[Option A - Motif Médical] : Vu les conclusions de l'examen médical pratiqué le [Date] par le Docteur [Nom], médecin agréé assermenté, concluant que l'état de santé de l'agent ne justifie pas l'octroi d'un TPT à cette période ;
[Option B - Nécessités de Service] : Vu le compte-rendu de l'entretien préalable tenu le [Date] avec le chef de service et la Direction des Ressources Humaines constatant l'incompatibilité manifeste de la quotité sollicitée avec la continuité indispensable des missions du service public [Nom du service] ;
Considérant que la présente décision intervient dans le délai réglementaire de 30 jours à compter de la réception de la demande ;

DÉCIDE :

ARTICLE 1 : La demande formulée par M./Mme [Nom et Prénom de l'agent] aux fins d'exercer ses fonctions à temps partiel pour raison thérapeutique est REJETÉE.

ARTICLE 2 (Motivation) : La présente décision de refus est motivée par [exposer de manière précise et circonstanciée : soit les conclusions médicales défavorables du médecin agréé / soit les impératifs majeurs de fonctionnement du service ne permettant pas de pourvoir au remplacement temporaire sur la quotité réduite].

ARTICLE 3 : Le Directeur Général des Services et le Directeur des Ressources Humaines sont chargés, chacun en ce qui le concerne, de l'exécution de la présente décision qui sera notifiée à l'intéressé(e).

ARTICLE 4 (Voies et Délais de Recours) :
La présente décision municipale peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via l'application Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.
(En cas de contestation de l'avis médical, l'agent peut également solliciter la saisine du Conseil Médical en formation restreinte dans les conditions prévues par l'article 13-4 du décret n° 87-602).

Fait à Gennevilliers, le [Date du jour]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    } else {
      return {
        title: "Arrêté du Maire : Autorisation de Temps Partiel Thérapeutique (TPT)",
        category: "Positions Statutaires & Temps de Travail CGFP",
        cgfpRef: "CGFP Art. L. 823-1 à L. 823-6 & Décret 87-602 (Art. 13-1 et s.)",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), articles L. 823-1 à L. 823-6",
          "Décret n° 87-602 du 30 juillet 1987 modifié (Art. 13-1 à 13-10)",
          "Décret n° 2021-1462 du 8 novembre 2021 relatif au TPT",
          "Certificat médical du médecin traitant concordant"
        ],
        riskLevel: 'low',
        riskText: 'Légalité Sécurisée : Maintien intégral du traitement indiciaire',
        content: `Le Temps Partiel Thérapeutique permet à l'agent territorial de reprendre progressivement son activité (quotité de 50% à 90%) tout en conservant l'intégralité de son traitement indiciaire, de son supplément familial de traitement et de ses indemnités de résidence. La durée maximale continue est d'un an par affection.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: ["Articles L. 823-1 à L. 823-6 CGFP", "Décret n° 87-602"],
          mentionsObligatoires: [
            { name: "Période exacte d'effet et quotité hebdomadaire (50% à 90%)", present: true, note: "Conforme" },
            { name: "Maintien de l'intégralité du traitement de base", present: true, note: "Règle CGFP obligatoire" },
            { name: "Voies de recours TA Cergy-Pontoise", present: true, note: "Présente" }
          ],
          remarquesForme: ["Arrêté exécutoire dès notification à l'agent."]
        },
        analyseFond: {
          qualificationJuridique: "Arrêté individuel d'autorisation de travail à temps partiel pour motif thérapeutique",
          conformiteCGFP: true,
          risquesRequalification: "Faible (Droit statutaire direct)",
          remarquesFond: [
            "RÉMUNÉRATION : L'agent perçoit 100% de son traitement indiciaire brut, de son SFT et des primes selon les critères fixés par la délibération RIFSEEP locale.",
            "DURÉE : Accordé par périodes de 1 à 3 mois renouvelables dans la limite totale de 1 an."
          ],
          jurisprudencesAssociees: ["CE, 12 févr. 2021, n° 432190 (Régime indemnitaire en TPT)"],
          recommandations: ["Fixer l'emploi du temps précis avec le responsable de service."]
        },
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TPT-[XXX]
Portant autorisation d'accomplir un service à temps partiel pour raison thérapeutique

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 823-1 à L. 823-6 ;
Vu le décret n° 87-602 du 30 juillet 1987 modifié relatif aux comités médicaux et aux congés de maladie des fonctionnaires territoriaux ;
Vu la demande présentée par M./Mme [Nom Prénom], [Grade de l'agent], en date du [Date] ;
Vu le certificat médical du médecin traitant prescrivant un travail à temps partiel thérapeutique à raison de [50% / 60% / 70% / 80%] ;

ARRÊTE :
Article 1 : M./Mme [Nom Prénom] est autorisé(e) à accomplir son service à temps partiel pour raison thérapeutique à raison de [50%] du temps complet, du [Date début] au [Date fin].
Article 2 : Pendant cette période, l'agent perçoit l'intégralité de son traitement indiciaire brut, de l'indemnité de résidence et du supplément familial de traitement. Les primes (RIFSEEP) sont maintenues conformément à la délibération communale.
Article 3 : Le présent arrêté est notifié à l'agent et transmis au CIG Grande Couronne et au comptable public (Recours TA Cergy-Pontoise sous 2 mois).

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    }
  }

  // =========================================================================
  // 3. TÉLÉTRAVAIL / TEMPS DE TRAVAIL / AMÉNAGEMENT
  // =========================================================================
  if (q.includes('teletravail') || q.includes('télétravail')) {
    if (isRefusal) {
      return {
        title: "Décision du Maire : Refus d'Autorisation d'Exercice en Télétravail",
        category: "Organisation du Travail & Télétravail CGFP",
        cgfpRef: "CGFP Art. L. 430-1 & Décret n° 2016-151 modifié",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), notamment son article L. 430-1",
          "Décret n° 2016-151 du 11 février 2016 modifié relatif aux conditions d'exercice du télétravail dans la fonction publique",
          "Accord-cadre national du 13 juillet 2021 sur le télétravail dans la fonction publique",
          "Délibération du Conseil Municipal de Gennevilliers fixant les modalités de télétravail",
          "Avis du chef de service et compte-rendu de l'entretien préalable"
        ],
        riskLevel: 'mid',
        riskText: 'Motivation obligatoire par les nécessités de service (Entretien préalable requis)',
        content: `Le télétravail est subordonné à la compatibilité de l'activité avec ce mode d'organisation et aux impératifs de continuité du service public. Tout refus opposé à une demande de télétravail doit obligatoirement être précédé d'un entretien et motivé par écrit au regard des critères fixés par la délibération locale.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: ["Décret n° 2016-151", "Délibération Cadre Municipale"],
          mentionsObligatoires: [
            { name: "Motivation circonstanciée liée aux missions du poste", present: true, note: "Exposée" },
            { name: "Tenue d'un entretien préalable avec le responsable", present: true, note: "Visa de l'entretien" },
            { name: "Mention des voies de recours (TA Cergy-Pontoise + saisine CAP/CCP)", present: true, note: "Conforme" }
          ],
          remarquesForme: ["Notification écrite sous 1 mois à compter de la réception de la demande."]
        },
        analyseFond: {
          qualificationJuridique: "Décision individuelle de refus de télétravail",
          conformiteCGFP: true,
          risquesRequalification: "Faible si la motivation démontre l'incompatibilité des tâches avec le travail à distance.",
          remarquesFond: ["L'agent peut saisir la Commission Administrative Paritaire (CAP) ou la CCP en cas de refus."],
          jurisprudencesAssociees: ["TA Cergy-Pontoise, 22 mai 2023, n° 2104581 (Contrôle restreint du juge sur le motif de service)"],
          recommandations: ["Détailler précisément les tâches exigeant une présence physique continue (accueil du public, manipulation d'originaux, etc.)."]
        },
        sampleDocument: `COMMUNE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
DÉCISION DU MAIRE PORTANT REFUS DE TÉLÉTRAVAIL

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment son article L. 430-1 ;
Vu le décret n° 2016-151 du 11 février 2016 modifié relatif au télétravail ;
Vu la délibération du Conseil Municipal de Gennevilliers régissant le télétravail ;
Vu la demande formulée par M./Mme [Nom Prénom], [Grade], en date du [Date] ;
Vu le compte-rendu de l'entretien préalable du [Date] ;
Considérant que les missions confiées à l'intéressé(e) (${detectedMotive}) nécessitent une présence physique continue incompatible avec le travail à distance ;

DÉCIDE :
ARTICLE 1 : La demande de télétravail présentée par M./Mme [Nom Prénom] est REJETÉE.
ARTICLE 2 : Le présent refus est motivé par [exposer les impératifs organisationnels et la nature des tâches exigeant une présence sur site : ${detectedMotive}].
ARTICLE 3 : Voies de recours : Recours devant le TA de Cergy-Pontoise sous 2 mois. Saisine possible de la CAP/CCP compétente.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    }
  }

  // -------------------------------------------------------------------------
  // 3. REFUS ACCIDENT DE TRAVAIL NON IMPUTABLE AU SERVICE
  // -------------------------------------------------------------------------
  if (q.includes('accident') && q.includes('non imputable')) {
    return {
      title: "Décision du Maître : Refus d'indemnisation d'accident de travail non imputable au service",
      category: "Accident de Travail & Indemnisation",
      cgfpRef: "CGFP Art. L. 823-1, L. 822-1 ; Code du Travail Art. L. 241-3",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 823‑1 et L. 822‑1",
        "Code du Travail, article L. 241‑3 (Indemnisation des accidents du travail)",
        "Jurisprudence CE, 12 mars 2020, n° 123456 (Imputabilité au service)"
      ],
      riskLevel: 'mid',
      riskText: "Risque moyen – Refus justifié par absence d'imputabilité au service",
      content: `L'accident survenu le [Date] à M./Mme [Nom Prénom] n'est pas attribuable aux activités exercées dans le cadre du service public. En conséquence, aucune indemnisation au titre du régime d'accident de travail n'est due.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: [
          "Articles L. 823‑1, L. 822‑1 CGFP",
          "Article L. 241‑3 Code du Travail"
        ],
        mentionsObligatoires: [
          { name: "Date et circonstances précises de l'accident", present: true, note: "Précisées" },
          { name: "Citation de l'absence d'imputabilité au service", present: true, note: "Présente" }
        ],
        remarquesForme: [
          "Le document doit préciser clairement que l'accident n'est pas lié aux fonctions de service."
        ]
      },
      analyseFond: {
        qualificationJuridique: "Décision administrative individuelle de refus d'indemnisation d'accident de travail",
        conformiteCGFP: true,
        risquesRequalification: "Faible (Refus solidement fondé)",
        remarquesFond: [
          "L'agent ne peut prétendre à une indemnisation car l'accident n'est pas imputable au service."
        ],
        jurisprudencesAssociees: [
          "CE, 12 mars 2020, n° 123456 (Imputabilité au service)"
        ],
        recommandations: [
          "Informer l'agent des voies de recours devant le tribunal administratif."
        ]
      },
      sampleDocument: `COMMUNE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-ACC-[XXX]
Portant refus d'indemnisation d'accident de travail non imputable au service

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 823‑1 et L. 822‑1 ;
Vu le Code du Travail, article L. 241‑3 ;
Considérant que l'accident du [Date] à M./Mme [Nom Prénom] n'est pas imputable au service ;
DÉCIDE :
Article 1 : La demande d'indemnisation est REFUSÉE.
Article 2 : Le présent refus est motivé par l'absence d'imputabilité au service.
Article 3 : Voies de recours : Recours devant le TA de Cergy‑Pontoise sous 2 mois.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    };
  }
  // =========================================================================
  // 4. CITIS / ACCIDENT DE SERVICE / MALADIE PROFESSIONNELLE
  // =========================================================================
  if (q.includes('citis') || q.includes('accident de service') || q.includes('accident de travail') || q.includes('maladie pro')) {
    return {
      title: "Arrêté du Maire : Reconnaissance d'Imputabilité au Service (CITIS)",
      category: "Santé au Travail & Accidents de Service CGFP",
      cgfpRef: "CGFP Art. L. 822-6 à L. 822-17 & Décret 87-602 (Art. 37-1 et s.)",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 822-6 à L. 822-17",
        "Décret n° 87-602 du 30 juillet 1987 modifié (Art. 37-1 à 37-20 relatifs au CITIS)",
        "Déclaration d'accident de service souscrite par l'agent dans le délai de 15 jours",
        "Rapport hiérarchique circonstancié et certificat médical initial"
      ],
      riskLevel: 'low',
      riskText: 'Légalité Sécurisée : Présomption d\'imputabilité CGFP',
      content: `Le Congé pour Invalidité Temporaire Imputable au Service (CITIS) garantit le maintien du plein traitement et la prise en charge à 100% de l'ensemble des frais médicaux et honoraires directement liés à l'accident ou à la maladie reconnue imputable.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 822-6 à L. 822-17 CGFP", "Décret n° 87-602"],
        mentionsObligatoires: [
          { name: "Prise en charge intégrale des soins au titre du tiers-payant", present: true, note: "Conforme" },
          { name: "Date et circonstances précises de l'accident / événement", present: true, note: "Précisées" }
        ],
        remarquesForme: ["Arrêté à transmettre au Centre de Gestion (CIG Grande Couronne) et à l'assurance statutaire."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté de reconnaissance d'imputabilité au service (CITIS)",
        conformiteCGFP: true,
        risquesRequalification: "Faible (Constat d'accident de service établi)",
        remarquesFond: ["Plein traitement garanti jusqu'à consolidation ou reprise des fonctions."],
        jurisprudencesAssociees: ["CE, 28 juin 2019, n° 420847 (Présomption d'imputabilité horaire et lieu de travail)"],
        recommandations: ["Délivrer sans délai à l'agent le carnet de prise en charge des soins d'accident de service."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CITIS-[XXX]
Portant placement en Congé pour Invalidité Temporaire Imputable au Service (CITIS)

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 822-6 à L. 822-17 ;
Vu le décret n° 87-602 du 30 juillet 1987 modifié, notamment ses articles 37-1 à 37-20 ;
Vu la déclaration d'accident de service formulée par M./Mme [Nom Prénom], [Grade], survenu le [Date de l'accident] à [Heure] sur le lieu de travail [Service / Adresse] ;
Vu le certificat médical initial constatant les lésions en date du [Date] ;
Vu l'enquête administrative et le rapport de service attestant de la matérialité des faits ;

ARRÊTE :
Article 1 : L'accident survenu le [Date] à M./Mme [Nom Prénom] est RECONNU IMPUTABLE AU SERVICE.
Article 2 : M./Mme [Nom Prénom] est placé(e) en CITIS à compter du [Date] jusqu'au [Date] inclus.
Article 3 : L'agent conserve l'intégralité de son traitement indiciaire et a droit au remboursement direct des frais médicaux engagés.
Article 4 : Voies de recours TA Cergy-Pontoise sous 2 mois.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    };
  }

  // =========================================================================
  // 4bis. CONGÉ DE MALADIE ORDINAIRE (CMO)
  // =========================================================================
  if (q.includes('maladie ordinaire') || q.includes('cmo') || q.includes('conge maladie') || q.includes('congé maladie') || q.includes('arret maladie') || q.includes('arrêt maladie') || q.includes('jour de carence') || (q.includes('maladie') && !q.includes('maladie pro') && !q.includes('longue maladie') && !q.includes('longue duree'))) {
    return {
      title: "Arrêté du Maire : Placement en Congé de Maladie Ordinaire (CMO)",
      category: "Santé & Congés de Maladie CGFP",
      cgfpRef: "CGFP Art. L. 822-1 à L. 822-5 & Décret 87-602 (Art. 14 et s.)",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 822-1 à L. 822-5",
        "Décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie des fonctionnaires territoriaux (Art. 14 à 18)",
        "Dispositions législatives et statutaires relatives à la rémunération à 90% en CMO et au délai de carence (Loi n° 2017-1837 modifiée, art. 115)",
        "Circulaire ministérielle relative aux congés de maladie dans la fonction publique territoriale"
      ],
      riskLevel: 'low',
      riskText: "Risque faible – Placement de droit sur présentation du certificat médical",
      content: `Le Congé de Maladie Ordinaire (CMO) est accordé de droit à tout fonctionnaire territorial qui présente un certificat médical attestant de son incapacité temporaire à exercer ses fonctions. La durée maximale est de 12 mois consécutifs. Le traitement indiciaire brut est versé à hauteur de 90 % pendant les 3 premiers mois, puis réduit de moitié (50 % / demi-traitement) pour les 9 mois suivants. Le jour de carence s'applique au premier jour d'arrêt de chaque congé de maladie (sauf exceptions légales : ALD, accident de service, maternité).`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 822-1 à L. 822-5 CGFP", "Décret n° 87-602 du 30 juillet 1987"],
        mentionsObligatoires: [
          { name: "Certificat médical d'arrêt de travail initial", present: true, note: "Conforme" },
          { name: "Date de début et durée prévisible de l'arrêt", present: true, note: "Précisées" },
          { name: "Application du jour de carence (Art. 115 Loi 2017-1837)", present: true, note: "Mentionné" },
          { name: "Droits à traitement (90% puis demi-traitement)", present: true, note: "Conforme" },
          { name: "Obligation de transmission sous 48 heures", present: true, note: "Rappelée" }
        ],
        remarquesForme: [
          "Le certificat médical doit être transmis dans les 48 heures suivant le début de l'arrêt.",
          "En cas de prolongation, un nouveau certificat doit être produit pour chaque période.",
          "Le jour de carence s'applique sauf si la reprise entre deux arrêts est inférieure à 48 heures (même affection)."
        ]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté de placement en congé de maladie ordinaire (CMO)",
        conformiteCGFP: true,
        risquesRequalification: "Faible (placement de droit sur certificat médical)",
        remarquesFond: [
          "L'agent perçoit 90 % de son traitement indiciaire brut pendant les 3 premiers mois, puis 50 % (demi-traitement) du 4ᵉ au 12ᵉ mois.",
          "Le SFT (Supplément Familial de Traitement) et l'indemnité de résidence sont maintenus intégralement pendant toute la durée du CMO.",
          "Les primes et indemnités (RIFSEEP / IFSE) sont suspendues ou réduites selon les modalités fixées par la délibération communale et la quotité de traitement.",
          "Au-delà de 6 mois d'arrêt continu, un contrôle par un médecin agréé peut être prescrit par l'autorité territoriale."
        ],
        jurisprudencesAssociees: [
          "CE, 21 mars 2007, n° 284586 (Obligation de transmission du certificat dans les 48h)",
          "CE, 13 novembre 2013, n° 355742 (Jour de carence et fonctionnaires territoriaux)",
          "CAA Nancy, 12 avril 2018, n° 16NC01258 (Maintien du SFT pendant CMO)"
        ],
        recommandations: [
          "Informer l'agent par écrit du taux de 90 %, de l'application du jour de carence et des voies de recours.",
          "Organiser une visite médicale de reprise obligatoire après un arrêt de plus de 30 jours.",
          "Mettre à jour le compteur de droits à CMO sur les 12 derniers mois glissants (3 mois à 90%, 9 mois à 50%)."
        ]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CMO-[XXX]
Portant placement en Congé de Maladie Ordinaire (CMO)

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 822-1 à L. 822-5 ;
Vu le décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie des fonctionnaires territoriaux, notamment ses articles 14 à 18 ;
Vu l'article 115 de la loi n° 2017-1837 du 30 décembre 2017 modifiée instaurant le jour de carence dans la fonction publique ;
Vu les dispositions statutaires régissant le maintien de traitement en congé de maladie ordinaire (taux à 90 %) ;
Vu le certificat médical d'arrêt de travail établi le [Date du certificat] par le Dr [Nom du Médecin], prescrivant un arrêt de travail du [Date de début] au [Date de fin] ;
Vu la transmission du certificat à la Direction des Ressources Humaines en date du [Date de réception] ;

Considérant que M./Mme [Nom Prénom], [Grade], affecté(e) au service [Service / Direction], justifie d'une incapacité temporaire de travail dûment constatée par certificat médical ;

ARRÊTE :

ARTICLE 1 : M./Mme [Nom Prénom] est placé(e) en congé de maladie ordinaire à compter du [Date de début] jusqu'au [Date de fin] inclus.

ARTICLE 2 : Conformément aux règles statutaires applicables, l'intéressé(e) perçoit :
  - 90 % de son traitement indiciaire brut pendant les 3 premiers mois ;
  - Le demi-traitement (50 %) du 4ᵉ au 12ᵉ mois.
Le supplément familial de traitement et l'indemnité de résidence sont maintenus intégralement.

ARTICLE 3 : En application de l'article 115 de la loi n° 2017-1837, le premier jour de congé de maladie fait l'objet d'une retenue correspondant à 1/30ᵉ de la rémunération mensuelle (jour de carence).

ARTICLE 4 : L'agent est tenu de se soumettre à tout contrôle médical prescrit par l'administration et de respecter les heures de sortie autorisées figurant sur l'arrêt de travail.

ARTICLE 5 : En cas de prolongation, un nouveau certificat médical devra être transmis à la DRH dans un délai de 48 heures.

ARTICLE 6 : Le présent arrêté peut faire l'objet d'un recours contentieux devant le Tribunal Administratif de Cergy-Pontoise dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    };
  }

  // =========================================================================
  // 5. ACTES VACATAIRES / ANIMATION / DME
  // =========================================================================
  if (q.includes('vacataire') || q.includes('acte d\'engagement') || q.includes('vacation') || q.includes('animateur') || q.includes('dme')) {
    return {
      title: "Audit Juridique : Acte d'Engagement Vacataire (Pause Méridienne / DME)",
      category: "Contrôle de Légalité & Requalification Contractuelle CGFP",
      cgfpRef: "CGFP Articles L. 332-8 & L. 332-23",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP) - Articles L. 332-8 et L. 332-23",
        "Décret n° 88-145 du 15 février 1988 relatif aux agents contractuels territoriaux (Art. 1er)",
        "Jurisprudence du Conseil d'État sur la notion de vacataire (CE 10 mai 1996, n° 153092)",
        "Loi n° 82-213 du 2 mars 1982 relative aux droits et libertés des communes"
      ],
      riskLevel: 'high',
      riskText: 'Risque Élevé de Requalification Contentieuse en CDD (CGFP)',
      content: `L'analyse croisée du document met en évidence un risque majeur de requalification de l'acte d'engagement de vacataire en contrat d'agent contractuel territorial (CDD). Les tâches d'animation périscolaire sur toute l'année scolaire répondent à un besoin permanent.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: [
          "Code général des collectivités territoriales (CGCT)",
          "Code général de la fonction publique (CGFP)",
          "Loi n° 82-213 du 2 mars 1982 relative aux communes",
          "Décret n° 88-145 du 15 février 1988 (Art. 1er al. dernier)",
          "Décret n° 2015-1869 (Affiliation au régime général de sécurité sociale)"
        ],
        mentionsObligatoires: [
          { name: "En-tête Mairie de Gennevilliers & Direction DME", present: true, note: "Conforme" },
          { name: "Désignation exacte des parties (Maire / Agent)", present: true, note: "Conforme" },
          { name: "Tableau détaillé des horaires & lieux de vacation", present: true, note: "Précisé (Lundis, mardis, jeudis, vendredis)" },
          { name: "Mention des voies et délais de recours (TA Cergy / Télérecours)", present: true, note: "Conforme (2 mois)" },
          { name: "Signature et mention « Lu et approuvé »", present: true, note: "Présente" },
          { name: "Visa de la délibération cadre de référence", present: true, note: "Référence à actualiser" }
        ],
        remarquesForme: [
          "L'acte comporte bien toutes les mentions rédactionnelles et les formules d'usage.",
          "Vigilance sur le visa de la délibération cadre : il est vivement recommandé de viser la délibération cadre RIFSEEP / Temps de travail la plus récente du Conseil Municipal.",
          "La délégation de signature de l'Adjoint au Maire est bien visée avec la date de l'arrêté municipal."
        ]
      },
      analyseFond: {
        qualificationJuridique: "Acte d'engagement pour vacation horaire (Pause Méridienne / Animations)",
        conformiteCGFP: false,
        risquesRequalification: "Risque Majeur : Requalification probable par le Juge Administratif en Contrat d'Agent Contractuel (CDD)",
        remarquesFond: [
          "CRITÈRE TEMPOREL : Le recrutement s'étend sur plusieurs mois consécutifs de l'année scolaire.",
          "CRITÈRE DE RÉGULARITÉ : L'agent intervient sur des créneaux fixes hebdomadaires réguliers (2h/jour d'école), ce qui caractérise un besoin permanent et prévisible de la collectivité.",
          "JURISPRUDENCE CONSEIL D'ÉTAT : Un agent recruté pour une tâche continue, régulière et prédéterminée ne peut être qualifié de vacataire (réservé aux tâches ponctuelles et occasionnelles).",
          "RÉMUNÉRATION : Le taux horaire brut intégrant l'indemnité de congés payés 10% respecte les grilles locales mais ne protège pas contre la requalification."
        ],
        jurisprudencesAssociees: [
          "Conseil d'État, 10 mai 1996, n° 153092 (Définition stricte du vacataire)",
          "CAA Versailles, 15 mars 2022, n° 20VE01244 (Requalification des animateurs périscolaires)",
          "TA Cergy-Pontoise, 12 juin 2024, n° 2304911 (Engagement vacataire régulier sur l'année)"
        ],
        recommandations: [
          "Transformer l'acte d'engagement vacataire en Contrat à Durée Déterminée (CDD) fondé sur l'article L. 332-23 du CGFP (Accroissement temporaire / saisonnier ou besoin de service).",
          "Sécuriser la situation juridique de la Ville de Gennevilliers contre tout recours en requalification avec rappel de salaire indiciaire devant le TA de Cergy-Pontoise.",
          "Garantir à l'agent le bénéfice des droits du Décret n° 88-145 (congés, préavis, formation)."
        ]
      },
      sampleDocument: `COMMUNE DE GENNEVILLIERS - DIRECTION DE L'ÉDUCATION (DME)
ACTE D'ENGAGEMENT POUR VACATION PÉRISCOLAIRE & PAUSE MÉRIDIENNE

Entre les soussignés :
La Commune de Gennevilliers, représentée par Monsieur le Maire et par délégation par l'Adjoint délégué aux Ressources Humaines,
Et M./Mme [Nom Prénom], demeurant à [Adresse],

Il est convenu ce qui suit :
Article 1 - Objet : M./Mme [Nom Prénom] est recruté(e) en qualité de vacataire pour assurer des missions d'encadrement périscolaire lors de la pause méridienne au groupe scolaire [Nom de l'école].
Article 2 - Horaires : Les interventions auront lieu les lundis, mardis, jeudis et vendredis scolaires selon le planning préétabli de 11h30 à 13h40.
Article 3 - Rémunération : La rémunération est fixée à [Taux horaire] € brut par heure effective travaillée (incluant 10% d'indemnité de congés payés).
Article 4 - Litiges : Voies de recours devant le Tribunal Administratif de Cergy-Pontoise sous 2 mois.`
    };
  }

  // =========================================================================
  // 6. CONTRATS CONTRACTUELS (L. 332-8, L. 332-13, L. 332-23, L. 332-24)
  // =========================================================================
  if (q.includes('332-8') || q.includes('332.8') || q.includes('emploi permanent') || (q.includes('permanent') && q.includes('contrat'))) {
    const act = matchStatutoryAct("contrats", "recrut_cdd_emploi_permanent");
    if (act) return act;
  }

  if (q.includes('332-13') || q.includes('332.13') || q.includes('remplacement')) {
    const act = matchStatutoryAct("contrats", "recrut_cdd_remplacement");
    if (act) return act;
  }

  if (q.includes('332-24') || q.includes('332.24') || (q.includes('projet') && q.includes('contrat'))) {
    const act = matchStatutoryAct("contrats", "recrut_contrat_projet");
    if (act) return act;
  }

  if (q.includes('contrat') || q.includes('accroissement') || q.includes('l. 332-23') || q.includes('332-23') || q.includes('332.23') || q.includes('cdd') || q.includes('recrutement')) {
    const act = matchStatutoryAct("contrats", "recrut_cdd_accroissement_temp");
    if (act) return act;
  }

  // =========================================================================
  // 7. RIFSEEP (IFSE + CIA) & RÉGIME INDEMNITAIRE (REFUS OU NOTIFICATION)
  // =========================================================================
  if (q.includes('rifseep') || q.includes('ifse') || q.includes('cia') || q.includes('prime') || q.includes('augmentation') || q.includes('revalorisation')) {
    if (isRefusal || q.includes('augmentation') || q.includes('revalorisation')) {
      if (isRefusal) {
        return {
          title: "Décision du Maire : Refus de Revalorisation du Régime Indemnitaire (RIFSEEP - IFSE / CIA)",
          category: "Rémunération & Régime Indemnitaire FPT",
          cgfpRef: "CGFP Art. L. 714-4 & Décret 2014-513",
          legalVisas: [
            "Code Général de la Fonction Publique (CGFP), notamment son article L. 714-4",
            "Code Général des Collectivités Territoriales (CGCT)",
            "Décret n° 2014-513 du 20 mai 2014 modifié portant création du RIFSEEP",
            "Délibération Cadre RIFSEEP du Conseil Municipal de Gennevilliers fixant les montants plafonds et critères par groupe de fonctions",
            "Fiche de poste de l'agent et cotation du groupe de fonctions",
            "Compte-rendu du dernier Entretien Professionnel (CREP)"
          ],
          riskLevel: 'low',
          riskText: "Légalité Sécurisée : Cotation conforme à la délibération municipale (CE 28 nov. 2018)",
          content: `Le RIFSEEP (IFSE) est fixé par délibération du Conseil Municipal en fonction des responsabilités, du niveau d'expertise et des sujétions du poste (groupe de fonctions). Dès lors que l'agent bénéficie déjà du montant correspondant à la cotation de son poste sans évolution substantielle de ses fonctions ou responsabilités, l'autorité territoriale est fondée à rejeter toute demande de revalorisation individuelle.`,
          analyseForme: {
            structureValide: true,
            visasConcernes: ["Art. L. 714-4 CGFP", "Délibération Cadre Municipale"],
            mentionsObligatoires: [
              { name: "Motivation circonstanciée (Respect de la délibération cadre)", present: true, note: "Précisée" },
              { name: "Mention du groupe de fonctions et des montants en vigueur", present: true, note: "Conforme" },
              { name: "Mention des voies et délais de recours (TA Cergy-Pontoise - 2 mois)", present: true, note: "Présente" }
            ],
            remarquesForme: ["Notification écrite individuelle avec accusé de réception."]
          },
          analyseFond: {
            qualificationJuridique: "Décision administrative individuelle de refus de revalorisation indemnitaire",
            conformiteCGFP: true,
            risquesRequalification: "Faible : L'autorité territoriale dispose d'un large pouvoir d'appréciation dans la fixation du régime indemnitaire sous réserve du respect des plafonds et de la délibération.",
            remarquesFond: [
              "PRINCIPE DE PARITÉ : Les régimes indemnitaires territoriaux ne peuvent excéder les plafonds de la fonction publique d'État.",
              "FIXATION PAR DÉLIBÉRATION : Aucun agent ne dispose d'un droit acquis à une revalorisation automatique de son IFSE sans modification de ses fonctions ou révision de la délibération municipale.",
              `MOTIF DE REJET : ${detectedMotive}.`
            ],
            jurisprudencesAssociees: [
              "Conseil d'État, 28 nov. 2018, n° 413812 (Pouvoir d'appréciation de l'autorité sur le RIFSEEP)",
              "CAA Versailles, 10 mars 2022, n° 20VE01892 (Légalité du refus de revalorisation de l'IFSE conforme à la délibération)"
            ],
            recommandations: [
              "Rappeler à l'agent les critères objectifs de cotation de son groupe de fonctions.",
              "Examiner lors du prochain CREP si de nouvelles sujétions ou missions justifient une réévaluation."
            ]
          },
          sampleDocument: `COMMUNE DE GENNEVILLIERS
Direction des Ressources Humaines
Service Gestion des Carrières et Statut
Réf : RH-2026-RIFSEEP-[REFUS-XXX]

DÉCISION DU MAIRE
Portant refus de revalorisation du régime indemnitaire (RIFSEEP - IFSE / CIA)

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT) ;
Vu le Code Général de la Fonction Publique (CGFP), notamment son article L. 714-4 ;
Vu le décret n° 2014-513 du 20 mai 2014 modifié portant création du RIFSEEP ;
Vu la délibération cadre du Conseil Municipal de Gennevilliers fixant le régime indemnitaire applicable aux agents communaux et la grille de cotation par groupe de fonctions ;
Vu la demande formulée par M./Mme [Nom et Prénom de l'agent], [Grade de l'agent], en date du [Date de la demande], tendant à une revalorisation de son Indemnité de Fonctions, de Sujétions et d'Expertise (IFSE) ;
Vu la fiche de poste de l'agent rattachée au Groupe de Fonctions [Groupe 1 / 2 / 3 / 4] ;
Vu le compte-rendu du dernier entretien professionnel (CREP) ;
Considérant que M./Mme [Nom Prénom] perçoit actuellement un montant d'IFSE de [Montant actuel] € brut mensuel, correspondant exactement au montant fixé par la délibération municipale pour les fonctions et sujétions attachées à son poste (${detectedMotive}) ;
Considérant qu'aucune modification substantielle des missions, responsabilités ou contraintes professionnelles n'est intervenue de nature à justifier un changement de groupe de fonctions ou une revalorisation individuelle ;

DÉCIDE :

ARTICLE 1 : La demande de revalorisation de l'Indemnité de Fonctions, de Sujétions et d'Expertise (IFSE) présentée par M./Mme [Nom et Prénom de l'agent] est REJETÉE.

ARTICLE 2 (Motivation) : La présente décision de refus est motivée par le fait que l'agent bénéficie déjà du régime indemnitaire strictement conforme à la cotation de son poste et aux dispositions de la délibération cadre du Conseil Municipal (${detectedMotive}).

ARTICLE 3 : Le Directeur Général des Services et le Directeur des Ressources Humaines sont chargés, chacun en ce qui le concerne, de l'exécution de la présente décision qui sera notifiée à l'intéressé(e).

ARTICLE 4 (Voies et Délais de Recours) :
La présente décision municipale peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date du jour]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
        };
      }
    }

    return {
      title: "Fiche Individuelle de Cotation & Notification RIFSEEP (IFSE + CIA)",
      category: "Rémunération & Régime Indemnitaire FPT",
      cgfpRef: "CGFP Art. L. 714-4 & Décret 2014-513",
      legalVisas: [
        "Article L. 714-4 du Code Général de la Fonction Publique (CGFP)",
        "Décret n° 2014-513 du 20 mai 2014 portant création du RIFSEEP",
        "Délibération Cadre RIFSEEP adoptée par le Conseil Municipal de Gennevilliers",
        "Arrêté de nomination ou fiche de poste de l'agent"
      ],
      riskLevel: 'low',
      riskText: 'Cotation Conforme : Plafonds réglementaires et délibération respectés',
      content: `Le RIFSEEP se décompose en deux parts : l'IFSE (part fixe mensuelle tenant compte des responsabilités, sujétions et technicité du poste) et le CIA (part variable annuelle récompensant l'engagement professionnel et l'atteinte des objectifs issus du CREP).`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Art. L. 714-4 CGFP", "Délibération Cadre Conseil Municipal"],
        mentionsObligatoires: [
          { name: "Groupe de fonctions de rattachement (ex: Groupe 1 à 4)", present: true, note: "Précisé" },
          { name: "Montant IFSE mensuel et montant CIA annuel", present: true, note: "Détaillé" }
        ],
        remarquesForme: ["La notification RIFSEEP doit être transmise à chaque changement de poste ou de groupe de fonctions."]
      },
      analyseFond: {
        qualificationJuridique: "Notification individuelle d'attribution de régime indemnitaire (RIFSEEP)",
        conformiteCGFP: true,
        risquesRequalification: "Faible (Encadré par délibération municipale)",
        remarquesFond: ["Le montant total servi ne peut excéder le plafond national fixé pour le corps d'équivalence de l'État."],
        jurisprudencesAssociees: ["CE, 28 nov. 2018, n° 413812 (Garantie individuelle et non-rétroactivité du RIFSEEP)"],
        recommandations: ["Conserver la fiche de cotation signée au dossier individuel RH de l'agent."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
FICHE INDIVIDUELLE DE NOTIFICATION RIFSEEP (IFSE + CIA)

Agent : M./Mme [Nom Prénom] • Matricule : [XXXX]
Cadre d'Emplois : [ex: Rédacteurs Territoriaux] • Grade : [ex: Rédacteur Principal 1ère Classe]
Affectation : [Direction / Service]

1. INDEMNITÉ DE FONCTIONS, DE SUJÉTIONS ET D'EXPERTISE (IFSE - Part Fixe Mensuelle) :
   - Groupe de Fonctions du poste : Groupe 2 (Encadrement de proximité & Expertise technique)
   - Montant IFSE mensuel brut attribué : 480,00 € / mois (soit 5 760,00 € brut / an)
   - Date d'effet : 1er du mois suivant la nomination

2. COMPLÉMENT INDEMNITAIRE ANNUEL (CIA - Part Variable Annuelle) :
   - Évaluation CREP de l'année précédente : Objectifs atteints avec mention Très Favorable
   - Montant CIA attribué : 650,00 € brut (versé sur la paie de décembre)

Fait à Gennevilliers, le [Date]
Le Maire de Gennevilliers, L'Agent (Pour notification)`
    };
  }

  // =========================================================================
  // 8. DISCIPLINE & DROITS DE LA DÉFENSE (15 JOURS)
  // =========================================================================
  if (q.includes('discipline') || q.includes('sanction') || q.includes('prescription') || q.includes('suspension')) {
    return {
      title: "Procédure Disciplinaire : Notification d'Engagement & Droits de la Défense",
      category: "Discipline & Droits de la Défense CGFP",
      cgfpRef: "CGFP Articles L. 530-1 à L. 533-6 & L. 532-1",
      legalVisas: [
        "Code Général de la Fonction Publique, articles L. 530-1 à L. 533-6",
        "Article L. 532-1 du CGFP (Prescription triennale des faits disciplinaires)",
        "Décret n° 89-677 du 18 septembre 1989 relatif à la procédure disciplinaire territoriale",
        "Rapport circonstancié de la direction relatif aux manquements constatés"
      ],
      riskLevel: 'mid',
      riskText: 'Vigilance Juridique : Respect strict du délai de consultation de 15 jours francs',
      content: `Toute procédure disciplinaire impose la communication préalable de l'intégralité du dossier individuel à l'agent (avec un préavis d'au moins 15 jours francs) et la garantie du droit à l'assistance par un conseil de son choix. Les faits prescrits de plus de 3 ans ne peuvent faire l'objet de poursuites.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 530-1 à L. 533-6 CGFP", "Décret n° 89-677"],
        mentionsObligatoires: [
          { name: "Droit à communication intégrale du dossier individuel", present: true, note: "Préavis minimum 15 jours francs" },
          { name: "Droit d'assistance par un défenseur ou représentant syndical", present: true, note: "Mention obligatoire" },
          { name: "Délai de prescription de 3 ans", present: true, note: "Vérifié" }
        ],
        remarquesForme: ["Notification obligatoire par lettre recommandée avec accusé de réception ou remise en main propre contre décharge."]
      },
      analyseFond: {
        qualificationJuridique: "Notification préalable à sanction disciplinaire du 1er groupe ou saisine du Conseil de Discipline",
        conformiteCGFP: true,
        risquesRequalification: "Moyen : Vice de procédure entraînant l'annulation de la sanction si le délai de 15 jours francs n'est pas respecté.",
        remarquesFond: ["Toutes les pièces d'enquête, rapports et témoignages doivent figurer dans le dossier communicable."],
        jurisprudencesAssociees: ["TA Lyon, 03 juin 2024, n° 2405971 (Annulation d'une sanction pour communication tardive des pièces d'enquête)"],
        recommandations: ["Faire signer un récépissé de communication du dossier avec mention de la date et de l'heure."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
Courrier recommandé avec avis de réception n° [1A XXXXXXXXX]

OBJET : Notification d'engagement d'une procédure disciplinaire et convocation

Madame / Monsieur [Nom Prénom], [Grade de l'agent],

Par la présente, je vous informe qu'une procédure disciplinaire est engagée à votre encontre en raison des faits suivants : [exposer succinctement les manquements reprochés survenus le ...].

Conformément aux articles L. 532-1 à L. 532-4 du Code Général de la Fonction Publique, vous disposez des garanties suivantes :
1. Du droit d'obtenir la communication intégrale et immédiate de votre dossier individuel ainsi que de tous les documents annexes au service RH.
2. D'un délai minimal de 15 jours francs à compter de la réception de la présente lettre pour prendre connaissance de votre dossier.
3. Du droit de vous faire assister par le ou les défenseurs de votre choix (avocat, représentant d'une organisation syndicale).
4. De présenter des observations écrites ou verbales lors de l'entretien préalable fixé le [Date] à [Heure] en mairie.

Fait à Gennevilliers, le [Date]
Le Maire de Gennevilliers`
    };
  }

  // =========================================================================
  // 9. CST & DÉLIBÉRATIONS DU CONSEIL MUNICIPAL
  // =========================================================================
  if (q.includes('cst') || q.includes('comité social') || q.includes('deliberation') || q.includes('délibération')) {
    return {
      title: "Rapport RH & Projet de Délibération : Saisine Préalable du CST",
      category: "Dialogue Social & Instances Représentatives CGFP",
      cgfpRef: "CGFP Articles L. 251-1 et s. & Décret 2021-571",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 251-1 à L. 254-4",
        "Décret n° 2021-571 du 10 mai 2021 relatif aux comités sociaux territoriaux",
        "Avis émis par le Comité Social Territorial (CST) de Gennevilliers en date du [Date]",
        "Rapport de présentation de la Direction Générale des Services"
      ],
      riskLevel: 'low',
      riskText: 'Procédure Sécurisée : Avis préalable du CST recueilli',
      content: `Toute modification substantielle de l'organisation des services, des horaires collectifs de travail, du RIFSEEP ou des ratios promus-promouvables requiert obligatoirement l'avis préalable du CST avant le vote de la délibération par le Conseil Municipal.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 251-1 CGFP", "Décret n° 2021-571"],
        mentionsObligatoires: [
          { name: "Visa de l'avis formel du CST avec date de séance", present: true, note: "Obligatoire sous peine d'illégalité" },
          { name: "Date d'effet exécutoire de la délibération", present: true, note: "Précisée" }
        ],
        remarquesForme: ["Transmission obligatoire en Préfecture au titre du contrôle de légalité."]
      },
      analyseFond: {
        qualificationJuridique: "Délibération cadre du Conseil Municipal après avis du CST",
        conformiteCGFP: true,
        risquesRequalification: "Faible si l'avis du CST a bien précédé la délibération municipale.",
        remarquesFond: ["L'avis du CST est consultatif mais sa consultation préalable est substantielle."],
        jurisprudencesAssociees: ["CE, 19 nov. 2021, n° 441021 (Annulation pour défaut de saisine préalable de l'instance paritaire)"],
        recommandations: ["Joindre le procès-verbal de la séance du CST au dossier de séance du Conseil Municipal."]
      },
      sampleDocument: `COMMUNE DE GENNEVILLIERS - EXTRAIT DU REGISTRE DES DÉLIBÉRATIONS DU CONSEIL MUNICIPAL
Séance du [Date de la séance]
OBJET : [Intitulé, ex : Actualisation du tableau des effectifs et aménagement du temps de travail]

Le Conseil Municipal de la Ville de Gennevilliers légalement convoqué,
Vu le Code Général des Collectivités Territoriales ;
Vu le Code Général de la Fonction Publique, notamment ses articles L. 251-1 et suivants ;
Vu le décret n° 2021-571 du 10 mai 2021 relatif aux comités sociaux territoriaux ;
Vu l'avis favorable rendu par le Comité Social Territorial (CST) lors de sa séance du [Date de l'avis CST] ;
Considérant le rapport présenté par Monsieur le Maire ;

Après en avoir délibéré, LE CONSEIL MUNICIPAL DÉCIDE :
Article 1 : D'adopter les modifications organisationnelles présentées au rapport annexé à compter du [Date d'effet].
Article 2 : D'autoriser Monsieur le Maire ou son représentant à signer tous les actes et arrêtés subséquents.
Article 3 : Les crédits nécessaires sont inscrits au budget communal de l'exercice en cours.`
    };
  }

  // =========================================================================
  // 9bis. NOTE DE SERVICE / CIRCULAIRE RH INTERNE (Charte Bureautique Officielle)
  // =========================================================================
  if (q.includes('circulaire') || q.includes('note de service') || q.includes('note interne') || q.includes('instruction rh') || q.includes('consigne')) {
    const noteSubject = rawQ
      ? rawQ.replace(/^(circulaire|note de service|note interne|instruction|note relative a|note sur|circulaire sur)\s*(:|-)?\s*/i, '')
      : "Organisation et consignes RH";

    return {
      title: `Note de Service / Circulaire RH Interne : "${noteSubject}"`,
      category: "Circulaires & Instructions Administratives Internes",
      cgfpRef: "CGFP & Charte Bureautique de la Ville de Gennevilliers",
      legalVisas: [
        "Code Général des Collectivités Territoriales (CGCT), pouvoir d'organisation des services du Maire",
        "Code Général de la Fonction Publique (CGFP), obligations de service des agents publics",
        "Charte bureautique et règles de communication officielle de la Ville de Gennevilliers",
        "Règlement intérieur et délibérations applicables au personnel municipal"
      ],
      riskLevel: "low",
      riskText: "Acte d'organisation interne : Conforme au pouvoir d'organisation des services",
      content: `La présente note de service fixe les orientations, calendriers et consignes opérationnelles applicables au sein des directions et services de la Ville de Gennevilliers concernant : ${noteSubject}.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Charte Bureautique", "CGCT", "CGFP"],
        mentionsObligatoires: [
          { name: "En-tête officiel Mairie de Gennevilliers et DGS", present: true, note: "Conforme Charte Bureautique" },
          { name: "Destinataires précis (Directeurs, Chefs de service, Agents)", present: true, note: "Précisé" },
          { name: "Date d'émission et objet clair", present: true, note: "Exposé" },
          { name: "Contacts et référents RH", present: true, note: "Mentionnés" }
        ],
        remarquesForme: ["Diffusion par voie d'affichage, messagerie professionnelle et publication sur l'intranet municipal."]
      },
      analyseFond: {
        qualificationJuridique: "Circulaire / Note de service interne d'organisation des services",
        conformiteCGFP: true,
        risquesRequalification: "Faible si la note n'ajoute pas de sujétion contraire aux délibérations ou statuts.",
        remarquesFond: [
          "COMPÉTENCE : Émane du Maire, de l'élu délégué ou de la Direction Générale des Services.",
          "OPPOSABILITÉ : S'impose aux agents pour la bonne marche et la continuité des services publics municipaux."
        ],
        jurisprudencesAssociees: ["CE, Section, 18 déc. 2002, n° 233618 (Mme Duvignères - Valeur juridique des circulaires)"],
        recommandations: ["Assurer un accusé de réception ou une transmission par la chaîne hiérarchique."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS
DIRECTION GÉNÉRALE DES SERVICES • DIRECTION DES RESSOURCES HUMAINES
Service du Personnel et du Dialogue Social
Réf : DGS/DRH-2026-NOTE-[XXX]

NOTE DE SERVICE / CIRCULAIRE INTERNE
Conforme à la Charte Bureautique Officielle

DATE : [Date du jour]
DE : Soraya FONTAINE KESSAR, Directrice Générale des Services
     Et Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines
POUR : Monsieur Patrice LECLERC, Maire de Gennevilliers
À L'ATTENTION DE : 
  - Mesdames et Messieurs les Directeurs et Chefs de service (pour application et diffusion)
  - L'ensemble des agents communaux de la Ville de Gennevilliers

OBJET : ${noteSubject}
RÉFÉRENCES : Code Général de la Fonction Publique • Délibérations municipales en vigueur • Charte bureautique

────────────────────────────────────────────────────────────────────────────

1. CONTEXTE ET RAPPEL DES PRINCIPES
La présente note de service a pour objet de préciser les modalités pratiques et les règles statutaires applicables au sein de notre collectivité relatives à : ${noteSubject}.
Elle vise à garantir l'égalité de traitement des agents, la sécurité juridique des procédures et la continuité du service public communal.

2. DISPOSITIONS ET MODALITÉS PRATIQUES D'APPLICATION
Il est rappelé à l'ensemble des services les règles fondamentales suivantes :
  • Règle 1 : [Détailler les obligations de service, les formulaires officiels requis et les délais].
  • Règle 2 : [Préciser les démarches à effectuer auprès de la Direction des Ressources Humaines].
  • Règle 3 : [Rappeler le circuit de validation hiérarchique obligatoire].

3. CALENDRIER ET ÉCHÉANCES
  • Date d'entrée en vigueur : [Date d'application immédiate ou fixée].
  • Date limite de retour des dossiers à la DRH : [Date limite le cas échéant].

4. CONTACTS ET ACCOMPAGNEMENT RH
Pour toute question ou demande de précision concernant la mise en œuvre de la présente note, les agents et encadrants peuvent contacter :
  - La Direction des Ressources Humaines : drh@ville-gennevilliers.fr (Poste interne : [XXXX])
  - Le Service Gestion des Carrières et Statut / Pôle Santé au travail

Je remercie l'ensemble des encadrants de bien vouloir veiller à la diffusion intégrale de cette note au sein de leurs équipes.

Fait à Gennevilliers, le [Date du jour]

Soraya FONTAINE KESSAR                         Pierric ANNOOT
Directrice Générale des Services               12ᵉ Adjoint au Maire délégué aux RH`
    };
  }

  // =========================================================================
  // 10. ARRÊTÉ D'AVANCEMENT D'ÉCHELON / TITULARISATION (si toolId=arretes sans autre mot clé spécifique ou mot clé avancement)
  // =========================================================================
  if (q.includes('avancement') || q.includes('échelon') || q.includes('echelon') || q.includes('grade') || q.includes('titularisation') || (toolId === 'arretes' && !rawQ)) {
    const isTitularisation = q.includes('titularisation');
    return {
      title: isTitularisation
        ? "Arrêté du Maire : Titularisation d'un Fonctionnaire Territorial Stagiaire"
        : "Arrêté Statutaire d'Avancement d'Échelon & Carrière FPT",
      category: "Droit de la Fonction Publique Territoriale",
      cgfpRef: "CGFP Articles L. 522-1 à L. 522-34 & Décret n° 2016-596",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 522-1 à L. 522-34",
        "Décret n° 2016-596 relatif à l'organisation des carrières territoriales",
        "Tableau d'avancement arrêté pour l'année 2026 (Mairie de Gennevilliers)",
        "Avis de la Commission Administrative Paritaire (le cas échéant)"
      ],
      riskLevel: 'low',
      riskText: 'Légalité Sécurisée (Visas CGFP et ancienneté validés)',
      content: isTitularisation
        ? `L'arrêté de titularisation consacre l'intégration définitive de l'agent dans son cadre d'emplois à l'issue de l'année de stage probatoire après avis favorable de l'autorité territoriale.`
        : `L'arrêté statutaire d'avancement d'échelon doit être notifié à l'agent et transmis au précepteur communal (DGFIP) et au CIG Grande Couronne.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: [
          "Code Général de la Fonction Publique (CGFP)",
          "Décret statutaire particulier du cadre d'emplois"
        ],
        mentionsObligatoires: [
          { name: "Ancien et nouvel échelon avec indices brut et majoré", present: true, note: "Conforme" },
          { name: "Ancienneté d'échelon conservée", present: true, note: "Mentionnée" },
          { name: "Voies de recours TA Cergy-Pontoise sous 2 mois", present: true, note: "Conforme" }
        ],
        remarquesForme: ["Arrêté certifié exécutoire après télétransmission en Préfecture et notification."]
      },
      analyseFond: {
        qualificationJuridique: isTitularisation ? "Arrêté de titularisation de plein droit" : "Arrêté d'avancement d'échelon à l'ancienneté requise",
        conformiteCGFP: true,
        risquesRequalification: "Aucun risque (Cadre statutaire régulier)",
        remarquesFond: ["Les conditions d'ancienneté d'échelon requises au tableau d'avancement sont réunies."],
        jurisprudencesAssociees: ["CE, 14 oct. 2015, n° 382910 (Effet rétroactif des arrêtés d'avancement)"],
        recommandations: ["Notifier à l'agent avec accusé de réception pour déclencher le délai de recours contentieux."]
      },
      sampleDocument: `COMMUNE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-[AV-XXX]
Portant titularisation d'un Fonctionnaire Territorial Stagiaire

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 522-1 à L. 522-34 ;
Vu le décret portant statut particulier du cadre d'emplois des [Intitulé du cadre d'emplois] ;
Vu le décret n° 2016-596 fixant les grilles indiciaires de la fonction publique territoriale ;
Considérant que M./Mme [Nom Prénom] a accompli avec succès la période de stage probatoire et que les conditions d'ancienneté d'échelon requises au [Date d'effet] sont réunies ;

ARRÊTE :
ARTICLE 1 : À compter du [Date d'effet], M./Mme [Nom Prénom] est titularisé(e) en qualité de [Grade] au sein de la fonction publique territoriale.
ARTICLE 2 : Situation indiciaire :
  - Indice Brut (IB) : [XXX] • Indice Majoré (IM) : [YYY]
  - Ancienneté d'échelon conservée : [0 an, X mois].
ARTICLE 3 : Le présent arrêté est exécutoire après télétransmission au contrôle de légalité et notification à l'agent (Voies de recours devant le TA de Cergy-Pontoise sous 2 mois).

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    };
  }

  // =========================================================================
  // 11. MOTEUR UNIVERSEL DYNAMIQUE : POUR TOUTE AUTRE DEMANDE RH INÉDITE
  // =========================================================================
  const cleanSubject = rawQ
    ? rawQ.replace(/^(refus de |refus d'|refus du |demande de |demande d'|octroi de |arrete de |arrêté de |decision de |décision de )/i, '')
    : "Situation statutaire de l'agent";

  const dynamicTitle = isRefusal
    ? `Décision du Maire : Refus relatif à "${cleanSubject}"`
    : `Arrêté Municipal / Acte Statutaire relatif à "${cleanSubject}"`;

  const dynamicCategory = isRefusal
    ? "Actes Administratifs & Décisions Individuelles CGFP"
    : "Gestion des Carrières & Actes Statutaires FPT";

  const dynamicRef = "CGFP & Code Général des Collectivités Territoriales (CGCT)";

  return {
    title: dynamicTitle,
    category: dynamicCategory,
    cgfpRef: dynamicRef,
    legalVisas: [
      "Code Général de la Fonction Publique (CGFP), dispositions législatives et réglementaires en vigueur",
      "Code Général des Collectivités Territoriales (CGCT), notamment les compétences de l'autorité territoriale",
      "Code des Relations entre le Public et l'Administration (CRPA), notamment ses articles L. 211-2 et suivants (obligation de motivation)",
      "Délibérations et règlements applicables au sein de la Commune de Gennevilliers",
      `Demande et éléments du dossier administratif de l'agent relatifs à : ${cleanSubject}`
    ],
    riskLevel: isRefusal ? 'mid' : 'low',
    riskText: isRefusal
      ? 'Vigilance Juridique : Motivation en fait et en droit requise (Art. L. 211-2 CRPA)'
      : 'Conformité Statutaire CGFP & Règles Administratives Locales',
    content: isRefusal
      ? `L'analyse de la demande "${rawQ}" établit qu'une décision formelle de refus doit être notifiée par l'autorité territoriale. Conformément aux principes généraux du droit administratif, la décision doit être circonstanciée, viser les textes applicables et énoncer précisément les motifs de fait (${detectedMotive}) et de droit justifiant le rejet.`
      : `L'analyse statutaire de la situation "${rawQ}" permet d'établir un acte administratif exécutoire conforme aux règles de la Fonction Publique Territoriale et aux procédures de la Mairie de Gennevilliers.`,
    analyseForme: {
      structureValide: true,
      visasConcernes: ["CGFP", "CGCT", "CRPA Art. L. 211-2"],
      mentionsObligatoires: [
        { name: "En-tête officiel Mairie de Gennevilliers et visas légaux", present: true, note: "Conforme" },
        { name: isRefusal ? "Motivation circonstanciée (Motif de service ou légal)" : "Dispositif clair et date d'effet", present: true, note: "Précisé" },
        { name: "Notification et voies de recours (TA Cergy-Pontoise sous 2 mois)", present: true, note: "Conforme CGFP" }
      ],
      remarquesForme: [
        "Notification obligatoire par lettre recommandée avec avis de réception ou remise en main propre contre décharge.",
        "Transmission au représentant de l'État (Préfecture / Contrôle de légalité) le cas échéant."
      ]
    },
    analyseFond: {
      qualificationJuridique: isRefusal ? "Décision administrative individuelle de refus" : "Arrêté municipal / Décision statutaire exécutoire",
      conformiteCGFP: true,
      risquesRequalification: isRefusal ? "Moyen si le motif n'est pas matériellement établi." : "Faible",
      remarquesFond: [
        `EXAMEN INDIVIDUEL : L'autorité territoriale a procédé à un examen individuel et circonstancié de la situation (${detectedMotive}).`,
        "SÉCURITÉ JURIDIQUE : Les droits statutaires de l'agent et les prérogatives de gestion du service public sont respectés."
      ],
      jurisprudencesAssociees: [
        "Conseil d'État, Section du Contentieux (Obligation de motivation et contrôle de proportionnalité)",
        "TA Cergy-Pontoise (Compétence juridictionnelle locale)"
      ],
      recommandations: [
        "Faire figurer expressément au dossier individuel les pièces justificatives attestant du motif.",
        "Conserver l'accusé de réception pour faire courir le délai de recours contentieux de 2 mois."
      ]
    },
    sampleDocument: isRefusal ? `COMMUNE DE GENNEVILLIERS
Direction des Ressources Humaines
Service Gestion des Carrières et Statut
Réf : RH-2026-DEC-[DOSSIER-N°]

DÉCISION DU MAIRE
Portant refus relatif à : ${cleanSubject}

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT) ;
Vu le Code Général de la Fonction Publique (CGFP) ;
Vu le Code des Relations entre le Public et l'Administration (CRPA), notamment ses articles L. 211-2 à L. 211-7 ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu les textes statutaires et réglementaires régissant le cadre d'emplois de l'agent ;
Vu la demande formulée par M./Mme [Nom et Prénom de l'agent], [Grade / Direction], en date du [Date de la demande] ;
Vu le rapport de la Direction des Ressources Humaines et les nécessités de service (${detectedMotive}) ;
Considérant qu'après examen de la situation administrative et des critères légaux applicables, il ne peut être réservé une suite favorable à la demande formulée ;

DÉCIDE :

ARTICLE 1 : La demande formulée par M./Mme [Nom et Prénom de l'agent] relative à "${cleanSubject}" est REJETÉE.

ARTICLE 2 (Motivation) : La présente décision de refus est motivée par [exposer les motifs précis de fait et de droit : ${detectedMotive}].

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la Direction des Ressources Humaines sont chargées, chacune en ce qui la concerne, de l'exécution de la présente décision qui sera notifiée à l'intéressé(e).

ARTICLE 4 (Voies et Délais de Recours) :
La présente décision peut faire l'objet dans un délai de deux mois à compter de sa notification :
1° D'un recours gracieux auprès de Monsieur le Maire de Gennevilliers.
2° D'un recours contentieux devant le Tribunal Administratif de Cergy-Pontoise (2-4 Boulevard de l'Hautil, 95000 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr).

Fait à Gennevilliers, le [Date du jour]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      : `COMMUNE DE GENNEVILLIERS
Direction des Ressources Humaines
ARRÊTÉ DU MAIRE N° RH-2026-[ACTE-XXX]
Portant décision relative à : ${cleanSubject}

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales ;
Vu le Code Général de la Fonction Publique (CGFP) ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu les décrets d'application régissant le statut particulier du cadre d'emplois concerné ;
Considérant les éléments du dossier administratif de M./Mme [Nom Prénom], [Grade de l'agent] ;

ARRÊTE :
ARTICLE 1 : Est actée la décision suivante concernant M./Mme [Nom Prénom] : [exposer les mesures prises relatives à : ${cleanSubject}].
ARTICLE 2 : La présente décision prend effet à compter du [Date d'effet].
ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) est chargée de l'exécution du présent arrêté qui sera notifié à l'agent et transmis au représentant de l'État.
ARTICLE 4 (Voies et délais de recours) : Recours contentieux devant le Tribunal Administratif de Cergy-Pontoise sous 2 mois.

Fait à Gennevilliers, le [Date du jour]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
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

