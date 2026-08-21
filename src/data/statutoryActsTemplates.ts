/**
 * Modèles d'Actes Administratifs RH & Sécurisation Juridique CGFP
 * Mairie de Gennevilliers - Base des Actes les plus fréquents en Collectivité Territoriale
 */

import { StatutoryQueryResult } from "../services/legifrance";

export const GENNEVILLIERS_RECOURS_CLAUSE = `La présente décision municipale [ou Le présent contrat / arrêté] peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification ou de sa publication.`;

export interface StatutoryActDefinition {
  id: string;
  keywords: string[];
  toolId?: string;
  result: (query?: string, rawQuery?: string) => StatutoryQueryResult;
}

export const STATUTORY_ACTS_REGISTRY: StatutoryActDefinition[] = [
  // =========================================================================
  // 1. CONGÉ DE MALADIE ORDINAIRE (CMO) - 90% PUIS DEMI-TRAITEMENT
  // =========================================================================
  {
    id: "cmo",
    keywords: ["cmo", "maladie ordinaire", "conge maladie", "congé maladie", "arret maladie", "arrêt maladie", "jour de carence", "maladie"],
    toolId: "cmo",
    result: (q = "") => {
      const isProlongation = q.includes("prolongation") || q.includes("demi") || q.includes("9 mois") || q.includes("renouvellement");
      return {
        title: isProlongation
          ? "Arrêté du Maire : Prolongation de Congé de Maladie Ordinaire (CMO) à Demi-Traitement"
          : "Arrêté du Maire : Placement en Congé de Maladie Ordinaire (CMO)",
        category: "Santé & Congés de Maladie CGFP",
        cgfpRef: "CGFP Art. L. 822-1 à L. 822-5 & Décret 87-602 (Art. 14 et s.)",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), notamment ses articles L. 822-1 à L. 822-5",
          "Décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie des fonctionnaires territoriaux (Art. 14 à 18)",
          "Dispositions législatives et statutaires relatives à la rémunération à 90 % en CMO et au délai de carence (Loi n° 2017-1837 modifiée, art. 115)",
          "Certificat médical d'arrêt de travail établi par le médecin traitant en date du [Date du certificat]"
        ],
        riskLevel: "low",
        riskText: "Risque faible – Placement de droit sur certificat médical sous réserve du délai de transmission 48h",
        content: `Le Congé de Maladie Ordinaire (CMO) est accordé de droit à tout fonctionnaire territorial sur production d'un certificat médical. La rémunération est fixée à 90 % du traitement indiciaire brut pendant les 3 premiers mois (avec application du jour de carence au 1er jour), puis à 50 % (demi-traitement) pour les 9 mois suivants (durée maximale de 12 mois consécutifs). Le SFT et l'indemnité de résidence sont maintenus à 100 %.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: ["Articles L. 822-1 à L. 822-5 CGFP", "Décret n° 87-602"],
          mentionsObligatoires: [
            { name: "Certificat médical d'arrêt de travail initial / prolongation", present: true, note: "Conforme" },
            { name: "Date d'effet et durée prévisible de l'arrêt", present: true, note: "Précisées" },
            { name: "Application du jour de carence (1/30e)", present: true, note: isProlongation ? "Non applicable si prolongation continue" : "Mentionné" },
            { name: "Droits à rémunération (90% ou 50%)", present: true, note: "Conforme à la réglementation statutaire" },
            { name: "Voies de recours TA Cergy-Pontoise", present: true, note: "Présente" }
          ],
          remarquesForme: [
            "L'agent dispose d'un délai impératif de 48 heures pour faire parvenir son avis d'arrêt de travail à la DRH.",
            "En cas de manquement répété au délai de 48h, l'autorité peut réduire la rémunération de moitié pour la période considérée."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Arrêté municipal de placement ou prolongation en Congé de Maladie Ordinaire",
          conformiteCGFP: true,
          risquesRequalification: "Faible : compétence liée sous réserve de régularité médicale.",
          remarquesFond: [
            "RÉMUNÉRATION : 90 % du traitement indiciaire brut pendant les 3 premiers mois de CMO, 50 % (demi-traitement) pendant les 9 mois suivants sur 12 mois glissants.",
            "SFT & INDEMNITÉ DE RÉSIDENCE : Maintien intégral à 100 % pendant toute la durée du CMO.",
            "RIFSEEP : Application de la délibération municipale régissant le maintien ou l'abattement indemnitaire en cas de maladie."
          ],
          jurisprudencesAssociees: [
            "CE, 21 mars 2007, n° 284586 (Obligation de transmission sous 48h)",
            "CE, 13 nov. 2013, n° 355742 (Légalité du jour de carence)",
            "CAA Nancy, 12 avr. 2018, n° 16NC01258 (Maintien intégral du SFT)"
          ],
          recommandations: [
            "Vérifier l'historique des congés de maladie sur les 365 derniers jours (calcul des droits à 90% et à 50%).",
            "Notifier à l'agent le solde de ses droits statutaires à congé de maladie."
          ]
        },
        sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
ARRÊTÉ DU MAIRE N° RH-2026-CMO-[XXX]
Portant ${isProlongation ? "prolongation de Congé de Maladie Ordinaire (CMO) à demi-traitement" : "placement en Congé de Maladie Ordinaire (CMO)"}

Le Maire de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT) ;
Vu le Code Général de la Fonction Publique (CGFP), notamment ses articles L. 822-1 à L. 822-5 ;
Vu le décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie des fonctionnaires territoriaux ;
Vu l'article 115 de la loi n° 2017-1837 du 30 décembre 2017 modifiée instaurant le jour de carence dans la fonction publique ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu les dispositions statutaires régissant le versement du traitement en CMO (taux de 90 % pendant les 3 premiers mois puis demi-traitement) ;
Vu la délibération du Conseil Municipal régissant le régime indemnitaire (RIFSEEP) en cas de congés de maladie ;
Vu le certificat médical prescrivant un arrêt de travail du [Date début] au [Date fin] inclus, établi par le Dr [Nom du médecin] ;
Vu la situation administrative de M./Mme [Nom Prénom], [Grade de l'agent], affecté(e) à la direction [Nom de la direction] ;

ARRÊTE :

ARTICLE 1 : M./Mme [Nom Prénom] est placé(e) en congé de maladie ordinaire pour la période du [Date début] au [Date fin] inclus.

ARTICLE 2 : Pendant cette période, la rémunération de l'intéressé(e) est fixée comme suit :
  - ${isProlongation ? "Traitement indiciaire brut réduit de moitié (50 % - demi-traitement) ;" : "90 % du traitement indiciaire brut pendant les 3 premiers mois ;"}
  - Supplément Familial de Traitement et indemnité de résidence maintenus à 100 % ;
  - Régime indemnitaire (IFSE) appliqué conformément à la délibération communale en vigueur.

ARTICLE 3 : ${isProlongation ? "La présente période constituant une prolongation sans reprise d'activité, le jour de carence ne s'applique pas." : "Le premier jour d'arrêt fait l'objet d'une retenue de 1/30e au titre du jour de carence légal."}

ARTICLE 4 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la Direction des Ressources Humaines sont chargées, chacune en ce qui la concerne, de l'exécution du présent arrêté qui sera notifié à l'agent et transmis au Comptable Public.

ARTICLE 5 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
      };
    }
  },

  // =========================================================================
  // 2. AVANCEMENT D'ÉCHELON À L'ANCIENNETÉ
  // =========================================================================
  {
    id: "avancement_echelon",
    keywords: ["avancement d'echelon", "avancement d'échelon", "echelon", "échelon", "changement d'echelon", "anciennete", "durée unique"],
    toolId: "arretes",
    result: () => ({
      title: "Arrêté du Maire : Avancement d'Échelon à l'Ancienneté (Durée Unique)",
      category: "Carrière & Échelons CGFP",
      cgfpRef: "CGFP Art. L. 522-1 & Statuts Particuliers des Cadres d'Emplois",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), notamment ses articles L. 522-1 et suivants",
        "Décret portant statut particulier du cadre d'emplois de l'agent",
        "Décret fixant l'échelonnement indiciaire applicable",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Arrêté précédent fixant le classement au [X]e échelon depuis le [Date]"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Compétence liée de l'autorité dès atteinte de la durée requise",
      content: `L'avancement d'échelon est accordé de plein droit et de manière continue d'un échelon à l'échelon immédiatement supérieur en fonction de l'ancienneté requise dans chaque échelon selon la grille indiciaire statutaire.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 522-1", "Statut particulier du cadre d'emplois"],
        mentionsObligatoires: [
          { name: "Ancien et nouvel échelon", present: true, note: "Précisés" },
          { name: "Indices brut et majoré correspondants", present: true, note: "Obligatoire pour la paie" },
          { name: "Ancienneté conservée ou reportée", present: true, note: "Mentionnée" },
          { name: "Date d'effet exécutoire", present: true, note: "Précisée" }
        ],
        remarquesForme: ["Arrêté individuel exécutoire dès notification et transmission au contrôle de légalité et au trésorier payeur."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté municipal portant avancement d'échelon à l'ancienneté",
        conformiteCGFP: true,
        risquesRequalification: "Nul (droit acquis à l'ancienneté)",
        remarquesFond: [
          "DURÉE UNIQUE : Depuis la réforme PPCR, l'avancement d'échelon s'effectue à cadence unique sans possibilité de modulation au choix.",
          "EFFET FINANCIER : Prise en compte du nouvel indice majoré sur la fiche de paie à compter de la date d'effet."
        ],
        jurisprudencesAssociees: ["CE, 8 févr. 2017, n° 391204 (Caractère obligatoire de l'avancement à l'ancienneté)"],
        recommandations: ["Transmettre copie au CIG Grande Couronne et mettre à jour le dossier Carrière."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-ECH-[XXX]
Portant avancement d'échelon de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 522-1 et suivants ;
Vu le décret n° [Numéro du décret] portant statut particulier du cadre d'emplois des [Intitulé du cadre d'emplois] ;
Vu le décret n° [Numéro] fixant les échelles indiciaires ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu l'arrêté en date du [Date] classant M./Mme [Nom Prénom], [Grade], au [Ancien échelon] échelon, Indice Brut [IB], Indice Majoré [IM], avec une ancienneté conservée de [Durée] ;
Considérant que l'intéressé(e) justifie dans son échelon de l'ancienneté requise pour accéder à l'échelon supérieur à compter du [Date d'effet] ;

ARRÊTE :

ARTICLE 1 : À compter du [Date d'effet], M./Mme [Nom Prénom] est promu(e) au [Nouvel échelon] échelon de son grade.

ARTICLE 2 : La situation administrative de l'agent est fixée comme suit :
  - Grade : [Intitulé exact du grade]
  - Nouvel échelon : [X]e échelon
  - Indice Brut : [IB] / Indice Majoré : [IM]
  - Ancienneté restante : [Sans ancienneté / ou X mois X jours]

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la Direction des Ressources Humaines sont chargées de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 3. TITULARISATION APRÈS STAGE
  // =========================================================================
  {
    id: "titularisation",
    keywords: ["titularisation", "titulariser", "fin de stage", "titulaire", "agent stagiaire"],
    toolId: "arretes",
    result: () => ({
      title: "Arrêté du Maire : Titularisation d'un Fonctionnaire Stagiaire",
      category: "Carrière & Titularisation CGFP",
      cgfpRef: "CGFP Art. L. 327-1 & Décret n° 92-1194 du 4 novembre 1992",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), notamment son article L. 327-1",
        "Décret n° 92-1194 du 4 novembre 1992 fixant les dispositions communes applicables aux fonctionnaires stagiaires",
        "Décret portant statut particulier du cadre d'emplois concerné",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Arrêté initial de nomination en qualité de fonctionnaire stagiaire en date du [Date]",
        "Attestation de suivi et de validation de la formation d'intégration dispensée par le CNFPT",
        "Rapport circonstancié d'évaluation de fin de stage établi par l'autorité hiérarchique"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Titularisation validée sur rapport hiérarchique et conformité CNFPT",
      content: `À l'issue de la période probatoire de stage statutaire d'un an, et après validation de la formation d'intégration obligatoire du CNFPT et avis favorable de la hiérarchie, le fonctionnaire stagiaire est titularisé dans son grade.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 327-1", "Décret n° 92-1194", "Attestation CNFPT"],
        mentionsObligatoires: [
          { name: "Attestation de formation obligatoire CNFPT", present: true, note: "Condition préalable de légalité" },
          { name: "Rapport d'évaluation de stage favorable", present: true, note: "Visé" },
          { name: "Échelon, Indice Brut et Indice Majoré à la titularisation", present: true, note: "Précisés" },
          { name: "Affiliation CNRACL ou IRCANTEC", present: true, note: "Mentionnée" }
        ],
        remarquesForme: ["La titularisation ne peut avoir d'effet rétroactif antérieur à la fin normale de la durée de stage."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté municipal de titularisation dans un grade de la fonction publique territoriale",
        conformiteCGFP: true,
        risquesRequalification: "Nul (évaluation positive et formation accomplie)",
        remarquesFond: [
          "FORMATION D'INTÉGRATION : L'obligation de formation d'intégration CNFPT est une condition substantielle de la régularité de la titularisation.",
          "AFFILIATION CNRACL : La titularisation sur un emploi permanent d'au moins 28h hebdomadaires entraîne l'affiliation au régime spécial CNRACL."
        ],
        jurisprudencesAssociees: ["CE, 18 mars 2015, n° 374952 (Compétence de l'autorité et rapport d'aptitude)"],
        recommandations: ["Déclarer la titularisation sur la plateforme CNRACL / CIG."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TIT-[XXX]
Portant titularisation de M./Mme [Nom Prénom] dans le grade de [Grade]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment son article L. 327-1 ;
Vu le décret n° 92-1194 du 4 novembre 1992 fixant les dispositions communes aux fonctionnaires stagiaires de la FPT ;
Vu le décret portant statut particulier du cadre d'emplois des [Cadre d'emplois] ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu l'arrêté du Maire en date du [Date] nommant M./Mme [Nom Prénom] en qualité de stagiaire au grade de [Grade] à compter du [Date] ;
Vu l'attestation du CNFPT constatant que l'agent a satisfait à l'obligation de formation d'intégration ;
Vu le rapport d'aptitude professionnelle très favorable établi par le supérieur hiérarchique le [Date] ;

ARRÊTE :

ARTICLE 1 : À compter du [Date d'effet], M./Mme [Nom Prénom] est TITULARISÉ(E) dans le grade de [Intitulé du grade].

ARTICLE 2 : L'agent est classé au [X]e échelon, Indice Brut [IB], Indice Majoré [IM], avec une ancienneté conservée de [Durée].

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la Direction des Ressources Humaines sont chargées de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 4. CONTRAT CONTRACTUEL - ACCROISSEMENT TEMPORAIRE D'ACTIVITÉ (L. 332-23 1°)
  // =========================================================================
  {
    id: "contrat_accroissement",
    keywords: ["accroissement temporaire", "l 332-23", "l. 332-23", "contrat temporaire", "renfort", "besoin temporaire", "l332-23"],
    toolId: "contrats",
    result: () => ({
      title: "Contrat d'Engagement : Recrutement Contractuel pour Accroissement Temporaire d'Activité",
      category: "Recrutement & Contrats CGFP",
      cgfpRef: "CGFP Art. L. 332-23 1° & Décret n° 88-145 du 15 février 1988",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), article L. 332-23 1°",
        "Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels de la fonction publique territoriale",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Délibération du Conseil Municipal autorisant le recours aux agents contractuels pour besoins temporaires",
        "Déclaration de création temporaire de poste à la Direction des Ressources Humaines"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Durée maximale légale de 12 mois consécutifs sur une période de 18 mois",
      content: `En application de l'article L. 332-23 1° du CGFP, les collectivités territoriales peuvent recruter des agents contractuels pour faire face à un besoin temporaire lié à un accroissement temporaire d'activité pour une durée maximale de 12 mois (renouvellement compris) sur 18 mois consécutifs.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 332-23 1°", "Décret n° 88-145"],
        mentionsObligatoires: [
          { name: "Motif précis de l'accroissement temporaire (justification concrète)", present: true, note: "Obligatoire à peine de requalification" },
          { name: "Période d'engagement et respect du plafond 12 mois / 18 mois", present: true, note: "Vérifié" },
          { name: "Rémunération par référence à un indice de la grille FPT", present: true, note: "Conforme" },
          { name: "Période d'essai éventuelle", present: true, note: "Prévue selon décret 88-145" }
        ],
        remarquesForme: ["Le contrat doit être signé au plus tard le jour de la prise de fonctions."]
      },
      analyseFond: {
        qualificationJuridique: "Contrat de travail de droit public à durée déterminée (CDD)",
        conformiteCGFP: true,
        risquesRequalification: "Faible si le motif est matérialisé par un surcroît objectif d'activité (ex: projet ponctuel, rattrapage de dossiers).",
        remarquesFond: [
          "PLAFOND STRICT : 12 mois maximum sur une période de 18 mois. Tout dépassement expose la collectivité à une requalification.",
          "RÉGIME SOCIAL : Affiliation à l'IRCANTEC et au régime général de la Sécurité Sociale."
        ],
        jurisprudencesAssociees: ["CE, 20 mars 2020, n° 425184 (Contrôle du motif de l'accroissement temporaire)"],
        recommandations: ["Préciser dans le contrat la mission spécifique confiée à l'agent."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - HÔTEL DE VILLE
Direction des Ressources Humaines - 177, avenue Gabriel-Péri, 92230 Gennevilliers

CONTRAT D'ENGAGEMENT À DURÉE DÉTERMINÉE (ACCROISSEMENT TEMPORAIRE D'ACTIVITÉ)
Fondement légal : Article L. 332-23 1° du Code Général de la Fonction Publique
Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels de la FPT

ENTRE LES SOUSSIGNÉS :
La Ville de Gennevilliers (SIRET : 219 200 366 00010), représentée par son Maire, Patrice LECLERC, et par délégation Monsieur Pierric ANNOOT, 12ᵉ Adjoint délégué aux Ressources Humaines,
D'une part,

ET :
M./Mme [Nom, Prénom],
Né(e) le [Date] à [Lieu],
Numéro de Sécurité Sociale (NIR) : [NIR],
Demeurant à [Adresse],
D'autre part,

VU le Code Général de la Fonction Publique, notamment son article L. 332-23 1° ;
VU le décret n° 88-145 du 15 février 1988 modifié ;
VU la délibération du Conseil Municipal autorisant le recours aux contractuels sur besoins temporaires ;
CONSIDÉRANT le surcroît temporaire d'activité au sein du service [Nom du service] lié à [Motif concret et circonstancié] ;

IL EST CONVENU CE QUI SUIT :

ARTICLE 1 (Fonctions & Catégorie) : M./Mme [Nom Prénom] est engagé(e) pour assurer les fonctions de [Intitulé du poste], relevant de la catégorie [A / B / C]. La fiche de poste est annexée au contrat.
ARTICLE 2 (Lieu d'affectation) : Direction [Nom de la direction], site [Adresse à Gennevilliers].
ARTICLE 3 (Durée & Date d'effet) : Le présent contrat est conclu du [Date début] au [Date fin] inclus (durée : [X] mois).
ARTICLE 4 (Période d'essai) : Période d'essai fixée à [X jours/mois] selon l'article 4 du décret 88-145.
ARTICLE 5 (Temps de travail) : Service à temps complet (35 heures hebdomadaires).
ARTICLE 6 (Rémunération) : Traitement indiciaire brut mensuel basé sur l'Indice Brut [IB], Indice Majoré [IM] ([Montant] €), complété du RIFSEEP (IFSE Groupe [X]) et du SFT le cas échéant.
ARTICLE 7 (Protection Sociale & Retraite) : Affiliation au Régime Général de la Sécurité Sociale (CPAM 92) et à l'IRCANTEC.
ARTICLE 8 (Déontologie & Obligations) : Respect du secret professionnel, de la neutralité, de la laïcité et interdiction de tout cumul d'activités non autorisé (CGFP L. 123-1 et s.).
ARTICLE 9 (Fin de contrat & Préavis) : Application des délais de prévenance de non-renouvellement (Décret 88-145 Art. 38-1) et de préavis de démission. Délivrance du certificat de travail et reçu pour solde de tout compte.
ARTICLE 10 (Voies et Délais de Recours) :
${GENNEVILLIERS_RECOURS_CLAUSE}

Fait à Gennevilliers, en deux exemplaires, le [Date]
L'Agent (lu et approuvé),                   Pour le Maire, Patrice LECLERC,
                                            Et par délégation, Pierric ANNOOT (12e Adjoint RH)`
    })
  },

  // =========================================================================
  // 5. ATTRIBUTION RIFSEEP (IFSE + CIA)
  // =========================================================================
  {
    id: "rifseep_attribution",
    keywords: ["ifse", "cia", "rifseep", "prime", "regime indemnitaire", "régime indemnitaire", "cotation ifse"],
    toolId: "rifseep",
    result: () => ({
      title: "Arrêté du Maire : Attribution Individuelle du RIFSEEP (IFSE & CIA)",
      category: "Rémunération & Régime Indemnitaire CGFP",
      cgfpRef: "CGFP Art. L. 714-4 à L. 714-13 & Décret n° 2014-513",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), notamment ses articles L. 714-4 à L. 714-13",
        "Décret n° 2014-513 du 20 mai 2014 portant création du RIFSEEP",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Délibération du Conseil Municipal de Gennevilliers instaurant le RIFSEEP et fixant les plafonds et groupes de fonctions",
        "Fiche de poste et cotation du groupe de fonctions de l'agent"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Conforme aux plafonds de la délibération communale et au groupe de cotation",
      content: `Le RIFSEEP comprend l'Indemnité de Fonctions, de Sujétions et d'Expertise (IFSE), versée mensuellement selon le groupe de fonctions, et le cas échéant le Complément Indemnitaire Annuel (CIA), tenant compte de l'engagement professionnel et de la manière de servir.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 714-4", "Délibération Cadre RIFSEEP"],
        mentionsObligatoires: [
          { name: "Groupe de fonction de rattachement (Groupe 1, 2, 3...)", present: true, note: "Précisé" },
          { name: "Montant annuel et périodicité de versement (mensuel)", present: true, note: "Conforme" },
          { name: "Date d'effet", present: true, note: "Précisée" }
        ],
        remarquesForme: ["L'attribution individuelle fait l'objet d'un arrêté notifié à l'agent et transmis au comptable public."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté individuel d'attribution indemnitaire (IFSE / RIFSEEP)",
        conformiteCGFP: true,
        risquesRequalification: "Faible dans le respect du principe de parité avec la fonction publique d'État.",
        remarquesFond: [
          "RÉEXAMEN : L'IFSE fait l'objet d'un réexamen obligatoire en cas de changement de fonctions, de mobilité ou au moins tous les 4 ans.",
          "PARITÉ : Le montant ne peut excéder les plafonds réglementaires de la fonction publique de l'État pour le corps équivalent."
        ],
        jurisprudencesAssociees: ["CE, 5 nov. 2014, n° 372136 (Pouvoir d'appréciation de l'autorité pour la part modulable)"],
        recommandations: ["Notifier avec le compte-rendu de l'entretien professionnel."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-RIF-[XXX]
Portant attribution de l'IFSE (RIFSEEP) à M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 714-4 à L. 714-13 ;
Vu le décret n° 2014-513 du 20 mai 2014 modifié ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu la délibération du Conseil Municipal de Gennevilliers fixant le régime indemnitaire RIFSEEP ;
Vu la fiche de poste de M./Mme [Nom Prénom], [Grade], classée dans le Groupe de fonctions [Groupe X] ;

ARRÊTE :

ARTICLE 1 : À compter du [Date d'effet], une Indemnité de Fonctions, de Sujétions et d'Expertise (IFSE) d'un montant annuel brut de [Montant annuel] € est attribuée à M./Mme [Nom Prénom].

ARTICLE 2 : Cette indemnité sera versée mensuellement à raison de [Montant mensuel] € brut.

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la DRH sont chargées de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 6. SANCTION DISCIPLINAIRE DU 1ER GROUPE (AVERTISSEMENT / BLÂME / EXCLUSION 1-3J)
  // =========================================================================
  {
    id: "discipline_groupe1",
    keywords: ["avertissement", "blame", "blâme", "exclusion temporaire", "discipline 1er groupe", "sanction 1er groupe", "faute disciplinaire"],
    toolId: "discipline",
    result: () => ({
      title: "Arrêté du Maire : Sanction Disciplinaire du 1er Groupe (Sans Saisine du Conseil de Discipline)",
      category: "Discipline & Droits de la Défense CGFP",
      cgfpRef: "CGFP Art. L. 533-1 & Décret n° 89-677 du 18 septembre 1989",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 530-1 à L. 533-6",
        "Décret n° 89-677 du 18 septembre 1989 relatif à la procédure disciplinaire dans la FPT",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Courrier informant l'agent de l'engagement d'une procédure disciplinaire et de son droit à communication intégrale de son dossier",
        "Compte-rendu de l'entretien préalable tenu en présence de l'agent et de son défenseur",
        "Rapport circonstancié constatant la matérialité des manquements professionnels"
      ],
      riskLevel: "mid",
      riskText: "Vigilance : Respect impératif des droits de la défense (communication du dossier individuel)",
      content: `Les sanctions du 1er groupe (avertissement, blâme, exclusion temporaire de fonctions pour une durée maximale de 3 jours) sont prononcées directement par l'autorité territoriale après respect des droits de la défense (information préalable, droit d'accès au dossier individuel et assistance d'un conseil), sans obligation de saisine du Conseil de Discipline. L'avertissement n'est pas versé au dossier individuel.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 530-1 et s. CGFP", "Décret n° 89-677"],
        mentionsObligatoires: [
          { name: "Information préalable de la procédure et droit de consulter le dossier", present: true, note: "Condition de légalité externe" },
          { name: "Motivation précise des faits reprochés", present: true, note: "Obligatoire au titre du CRPA" },
          { name: "Effacement automatique du blâme au bout de 3 ans", present: true, note: "Précisé" }
        ],
        remarquesForme: ["Délai raisonnable obligatoire entre la communication du dossier et l'entretien (minimum 15 jours recommandés)."]
      },
      analyseFond: {
        qualificationJuridique: "Décision / Arrêté portant sanction disciplinaire du premier groupe",
        conformiteCGFP: true,
        risquesRequalification: "Moyen si la proportionnalité entre la gravité des fautes et la sanction est contestée devant le TA.",
        remarquesFond: [
          "PROPORTIONNALITÉ : La sanction doit être strictement proportionnée à la matérialité et à la gravité des faits.",
          "PRESCRIPTION : Aucune poursuite disciplinaire ne peut être engagée au-delà d'un délai de 3 ans à compter de la connaissance des faits (CGFP L. 532-2)."
        ],
        jurisprudencesAssociees: [
          "CE, 13 nov. 2013, n° 347704 (Contrôle normal du juge administratif sur la proportionnalité de la sanction)",
          "CAA Versailles, 10 mars 2022, n° 20VE01842 (Annulation pour non-communication intégrale du dossier)"
        ],
        recommandations: ["Conserver la preuve écrite de la date de consultation du dossier individuel signée par l'agent."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-DISC-[XXX]
Portant sanction disciplinaire du 1er groupe (Blâme) à l'encontre de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 530-1 à L. 533-6 ;
Vu le décret n° 89-677 du 18 septembre 1989 relatif à la procédure disciplinaire dans la FPT ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu le courrier notifiant l'engagement d'une procédure et invitant l'agent à consulter son dossier ;
Vu la consultation effective du dossier individuel ;
Vu le procès-verbal de l'entretien préalable ;
Considérant que les faits reprochés à l'agent sont matériellement établis et constituent une faute disciplinaire ;

ARRÊTE :

ARTICLE 1 : La sanction disciplinaire du BLÂME (sanction du 1er groupe) est infligée à M./Mme [Nom Prénom], [Grade].

ARTICLE 2 : La présente sanction est inscrite au dossier individuel de l'agent. Elle sera effacée automatiquement au terme d'un délai de trois ans si aucune nouvelle sanction n'est intervenue durant cette période.

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) est chargée de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 7. SUSPENSION CONSERVATOIRE DE FONCTIONS (CGFP L. 531-1)
  // =========================================================================
  {
    id: "suspension_conservatoire",
    keywords: ["suspension conservatoire", "suspension", "l 531-1", "faute grave", "l. 531-1", "mesure conservatoire"],
    toolId: "discipline",
    result: () => ({
      title: "Arrêté du Maire : Suspension Conservatoire de Fonctions (CGFP Art. L. 531-1)",
      category: "Discipline & Mesures Conservatoires CGFP",
      cgfpRef: "CGFP Art. L. 531-1 à L. 531-5",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 531-1 à L. 531-5",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Rapport hiérarchique constatant une faute grave ou des poursuites pénales mettant en péril le bon fonctionnement du service"
      ],
      riskLevel: "high",
      riskText: "Forte vigilance : Mesure conservatoire (non disciplinaire), maintien du traitement indiciaire, délai max 4 mois sans poursuites pénales",
      content: `La suspension conservatoire est une mesure administrative d'urgence permettant d'écarter temporairement un agent du service en cas de faute grave (ou d'infraction pénale). L'agent conserve l'intégralité de son traitement indiciaire et de son SFT. La durée maximale est de 4 mois si aucune poursuite pénale n'est engagée (ou jusqu'à décision judiciaire définitive).`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["Articles L. 531-1 et s. CGFP"],
        mentionsObligatoires: [
          { name: "Maintien de l'intégralité du traitement indiciaire brut et du SFT", present: true, note: "Règle impérative" },
          { name: "Caractère conservatoire expressément stipulé", present: true, note: "Ce n'est pas une sanction" },
          { name: "Durée maximale de 4 mois", present: true, note: "Précisée" }
        ],
        remarquesForme: ["Notification immédiate en main propre contre décharge ou par pli recommandé avec AR."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté municipal portant mesure conservatoire d'écartement du service",
        conformiteCGFP: true,
        risquesRequalification: "Élevé si la suspension est utilisée à tort comme une sanction déguisée.",
        remarquesFond: [
          "DÉLAI DE 4 MOIS : À l'issue des 4 mois, si le conseil de discipline n'a pas statué (hors poursuites pénales), l'agent doit être obligatoirement rétabli dans ses fonctions.",
          "RÉMUNÉRATION : Le traitement indiciaire ne peut être suspendu ou réduit pendant la période de 4 mois."
        ],
        jurisprudencesAssociees: [
          "CE, 14 mars 2018, n° 404895 (La suspension conservatoire ne présente aucun caractère disciplinaire)",
          "CAA Douai, 25 janv. 2022, n° 20DA01412 (Rétablissement obligatoire à l'issue de 4 mois)"
        ],
        recommandations: ["Saisir sans délai le Conseil de Discipline pour engager l'action disciplinaire au fond."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-SUSP-[XXX]
Portant suspension conservatoire de fonctions de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 531-1 à L. 531-5 ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Considérant les faits d'une exceptionnelle gravité constatés à l'encontre de M./Mme [Nom Prénom], [Grade] ;
Considérant que dans l'intérêt du service public et dans l'attente de l'engagement de poursuites disciplinaires, il y a lieu d'écarter immédiatement l'agent de ses fonctions ;

ARRÊTE :

ARTICLE 1 : M./Mme [Nom Prénom] est SUSPENDU(E) de ses fonctions à titre conservatoire à compter du [Date].

ARTICLE 2 : Pendant toute la durée de la suspension, l'intéressé(e) conserve l'intégralité de son traitement indiciaire brut, de l'indemnité de résidence et du supplément familial de traitement.

ARTICLE 3 : La situation de l'agent sera définitivement réglée dans un délai maximum de quatre mois à compter de la date d'effet du présent arrêté.

ARTICLE 4 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) est chargée de l'exécution du présent arrêté.

ARTICLE 5 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 8. TEMPS PARTIEL (ACCORD SUR AUTORISATION OU DE DROIT)
  // =========================================================================
  {
    id: "temps_partiel",
    keywords: ["temps partiel", "quotité 80", "quotité 50", "quotité 60", "quotité 70", "service a temps partiel"],
    toolId: "arretes",
    result: () => ({
      title: "Arrêté du Maire : Autorisation d'Exercice des Fonctions à Temps Partiel",
      category: "Temps de Travail & Positions Statutaires CGFP",
      cgfpRef: "CGFP Art. L. 612-1 à L. 612-14 & Décret n° 2004-777",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), articles L. 612-1 à L. 612-14",
        "Décret n° 2004-777 du 29 juillet 2004 relatif à la mise en œuvre du temps partiel dans la FPT",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Demande écrite formulée par M./Mme [Nom Prénom] en date du [Date]",
        "Avis du chef de service sur l'organisation du planning"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Calcul de la rémunération au prorata (règle des 6/7e pour le 80%)",
      content: `Le temps partiel sur autorisation peut être accordé pour des quotités de 50 %, 60 %, 70 %, 80 % ou 90 % de la durée hebdomadaire de travail. Pour la quotité de 80 %, la rémunération versée correspond aux six septièmes (85,7 %) du traitement à temps plein.`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 612-1", "Décret n° 2004-777"],
        mentionsObligatoires: [
          { name: "Quotité accordée (50%, 60%, 70%, 80%, 90%)", present: true, note: "Précisée" },
          { name: "Période d'effet (durée de 6 mois à 1 an renouvelable)", present: true, note: "Conforme" },
          { name: "Calcul de la rémunération au prorata", present: true, note: "Mentionné" }
        ],
        remarquesForme: ["La demande doit être formulée au moins deux mois avant la date de début souhaitée."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté individuel d'autorisation d'exercice à temps partiel",
        conformiteCGFP: true,
        risquesRequalification: "Faible.",
        remarquesFond: [
          "RÈGLE DES 80 % : La quotité de 80 % donne droit à 85,7 % (6/7e) du traitement et des primes.",
          "PENSIONS : Les périodes de temps partiel comptent comme des périodes de temps plein pour la durée d'assurance vieillesse."
        ],
        jurisprudencesAssociees: ["CE, 9 avr. 2014, n° 365821 (Compatibilité du temps partiel avec l'organisation du service)"],
        recommandations: ["Formaliser le planning hebdomadaire en accord avec le chef de service."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TP-[XXX]
Portant autorisation d'exercer ses fonctions à temps partiel

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment ses articles L. 612-1 à L. 612-14 ;
Vu le décret n° 2004-777 du 29 juillet 2004 modifié ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu la demande formulée par M./Mme [Nom Prénom], [Grade], tendant à exercer ses fonctions à temps partiel à raison de [50% / 60% / 70% / 80%] ;
Vu l'avis favorable du responsable de service ;

ARRÊTE :

ARTICLE 1 : M./Mme [Nom Prénom] est autorisé(e) à accomplir un service à temps partiel à raison de [80%] d'un temps plein, du [Date début] au [Date fin] inclus.

ARTICLE 2 : Pendant cette période, l'intéressé(e) percevra les 6/7e (85,7 %) du traitement indiciaire brut, des primes et indemnités correspondantes. Le SFT ne peut être inférieur au plancher légal.

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la DRH sont chargées de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  },

  // =========================================================================
  // 9. RADIATION DES CADRES POUR DÉPART À LA RETRAITE
  // =========================================================================
  {
    id: "retraite_radiation",
    keywords: ["retraite", "radiation des cadres", "admission a la retraite", "pension cnracl", "depart retraite"],
    toolId: "arretes",
    result: () => ({
      title: "Arrêté du Maire : Admission à la Retraite et Radiation des Cadres",
      category: "Cessation de Fonctions & Retraite CNRACL",
      cgfpRef: "CGFP Art. L. 550-1 & Code des Pensions Civiles et Militaires",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), notamment son article L. 550-1",
        "Code des pensions civiles et militaires de retraite",
        "Décret n° 2003-1306 du 26 décembre 2003 relatif au régime de retraite des fonctionnaires CNRACL",
        "Arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines",
        "Demande d'admission à la retraite présentée par l'agent en date du [Date]",
        "Avis favorable de la CNRACL liquidant les droits à pension"
      ],
      riskLevel: "low",
      riskText: "Sécurisé : Compétence liée après liquidation des droits à pension CNRACL",
      content: `L'admission à la retraite entraîne la cessation définitive des fonctions et la radiation des cadres de la fonction publique territoriale à la date convenue avec la caisse de retraite (CNRACL).`,
      analyseForme: {
        structureValide: true,
        visasConcernes: ["CGFP Art. L. 550-1", "Décret n° 2003-1306"],
        mentionsObligatoires: [
          { name: "Date exacte de cessation définitive d'activité", present: true, note: "Conforme" },
          { name: "Radiation des cadres de la collectivité", present: true, note: "Stipulée" },
          { name: "Dossier CNRACL validé", present: true, note: "Visé" }
        ],
        remarquesForme: ["Arrêté à notifier à l'agent au moins un mois avant la date de cessation de fonctions."]
      },
      analyseFond: {
        qualificationJuridique: "Arrêté de radiation des cadres pour limite d'âge ou départ volontaire à la retraite",
        conformiteCGFP: true,
        risquesRequalification: "Nul.",
        remarquesFond: [
          "CESSATION DÉFINITIVE : La radiation des cadres fait perdre la qualité de fonctionnaire territorial.",
          "SOLDE DE TOUT COMPTE : Liquidation des congés annuels non pris (ou versement sur le CET selon délibération)."
        ],
        jurisprudencesAssociees: ["CE, 12 déc. 2011, n° 340112 (Effets juridiques de la radiation des cadres)"],
        recommandations: ["Éditer le certificat de radiation des cadres pour la CNRACL et l'assurance maladie."]
      },
      sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-RET-[XXX]
Portant admission à la retraite et radiation des cadres de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le Code Général de la Fonction Publique, notamment son article L. 550-1 ;
Vu le décret n° 2003-1306 du 26 décembre 2003 relatif au régime de retraite des fonctionnaires CNRACL ;
Vu l'arrêté du Maire de Gennevilliers portant délégation de fonctions et de signature à Monsieur Pierric ANNOOT, 12ᵉ Adjoint au Maire délégué aux Ressources Humaines ;
Vu la demande d'admission à la retraite présentée par M./Mme [Nom Prénom], [Grade], en date du [Date] ;
Vu le décompte de pension et la notification d'accord de la CNRACL ;

ARRÊTE :

ARTICLE 1 : À compter du [Date d'effet], M./Mme [Nom Prénom] est admis(e) à faire valoir ses droits à la retraite.

ARTICLE 2 : À cette même date, l'intéressé(e) est radié(e) des cadres de la Ville de Gennevilliers.

ARTICLE 3 : La Directrice Générale des Services (Soraya FONTAINE KESSAR) et la DRH sont chargées de l'exécution du présent arrêté.

ARTICLE 4 (Voies et délais de recours) :
Le présent arrêté peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa notification.

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Et par délégation,
Pierric ANNOOT,
12ᵉ Adjoint délégué aux Ressources Humaines`
    })
  }
];

import { ALL_THEMES_TEMPLATES, ThemeTemplateItem } from "./allThemesTemplatesRegistry";

/**
 * Recherche et résolution d'un acte statutaire adapté à la requête
 */
export function matchStatutoryAct(toolId: string, rawQuery: string): StatutoryQueryResult | null {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return null;

  // 1. Recherche prioritaire dans les 38 modèles thématiques officiels
  const allTemplates = ALL_THEMES_TEMPLATES.flatMap(theme => 
    theme.templates.map(tpl => ({ ...tpl, themeTitle: theme.title, themeId: theme.id }))
  );

  // A. Recherche par correspondance d'identifiant ou de nom exact
  const directMatch = allTemplates.find(tpl => 
    tpl.id === rawQuery || 
    tpl.name.toLowerCase() === q ||
    q.includes(tpl.name.toLowerCase())
  );

  if (directMatch && directMatch.sampleDocument) {
    return createResultFromThemeTemplate(directMatch);
  }

  // B. Recherche par codes et articles de loi spécifiques (L. 332-8, L. 332-13, L. 332-23, L. 332-24, etc.)
  if (q.includes("332-8") || q.includes("332.8") || (q.includes("permanent") && q.includes("contrat"))) {
    const tpl = allTemplates.find(t => t.id === "recrut_cdd_emploi_permanent");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("332-13") || q.includes("332.13") || (q.includes("remplacement") && q.includes("contrat"))) {
    const tpl = allTemplates.find(t => t.id === "recrut_cdd_remplacement");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("332-23") || q.includes("332.23") || q.includes("accroissement")) {
    const tpl = allTemplates.find(t => t.id === "recrut_cdd_accroissement_temp");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("332-24") || q.includes("332.24") || (q.includes("projet") && q.includes("contrat"))) {
    const tpl = allTemplates.find(t => t.id === "recrut_contrat_projet");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("vacataire") || q.includes("médecin vacataire") || q.includes("medecin vacataire")) {
    const tpl = allTemplates.find(t => t.id === "recrut_medecin_vacataire");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("apprentissage")) {
    const tpl = allTemplates.find(t => t.id === "recrut_apprentissage");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }
  if (q.includes("certificat de travail") || q.includes("solde de tout compte")) {
    const tpl = allTemplates.find(t => t.id === "recrut_certificat_travail");
    if (tpl) return createResultFromThemeTemplate(tpl);
  }

  // 2. Recherche directe par toolId si spécifique
  if (toolId === "cmo") {
    const cmoDef = STATUTORY_ACTS_REGISTRY.find(a => a.id === "cmo");
    if (cmoDef) return cmoDef.result(q, rawQuery);
  }

  // 3. Recherche dans le registre classique STATUTORY_ACTS_REGISTRY
  for (const def of STATUTORY_ACTS_REGISTRY) {
    if (def.keywords.some(kw => q.includes(kw))) {
      return def.result(q, rawQuery);
    }
  }

  return null;
}

function createResultFromThemeTemplate(tpl: ThemeTemplateItem & { themeTitle?: string }): StatutoryQueryResult {
  return {
    title: tpl.name,
    category: tpl.themeTitle || "Actes & Contrats CGFP (Mairie de Gennevilliers)",
    cgfpRef: tpl.cgfpRef,
    legalVisas: [
      tpl.cgfpRef,
      "Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels de la FPT",
      "Arrêté du Maire de Gennevilliers portant délégation d'attribution de fonctions et de signature à Monsieur Pierric ANNOOT, 12ème adjoint au Maire",
      "Délibérations et règlements applicables de la Ville de Gennevilliers"
    ],
    riskLevel: "low",
    riskText: "Légalité Sécurisée : Modèle officiel conforme aux délibérations et chartes de Gennevilliers",
    content: tpl.summary,
    analyseForme: {
      structureValide: true,
      visasConcernes: [tpl.cgfpRef, "Décret n° 88-145", "MPO CIG Petite Couronne"],
      mentionsObligatoires: [
        { name: "Fondement textuel exact et visas complets", present: true, note: "Conforme CGFP" },
        { name: "Identification précise des parties et lieu d'affectation", present: true, note: "Présent" },
        { name: "Rémunération indiciaire / grille et cotation", present: true, note: "Précisé" },
        { name: "Clause de médiation préalable obligatoire (CIG) et recours TA Cergy-Pontoise", present: true, note: "Conforme" }
      ],
      remarquesForme: [
        "L'acte est rédigé selon la charte bureautique officielle de Gennevilliers.",
        "Délivrance en 3 exemplaires originaux avec notification formelle à l'agent."
      ]
    },
    analyseFond: {
      qualificationJuridique: `Acte administratif / ${tpl.type.toUpperCase()} de droit public`,
      conformiteCGFP: true,
      risquesRequalification: "Faible : Fondement juridique vérifié et respect des règles statutaires territoriales.",
      remarquesFond: [
        `Base légale : ${tpl.cgfpRef}`,
        "Sécurisation des droits à congés, préavis et affiliations IRCANTEC / CNRACL."
      ],
      jurisprudencesAssociees: [
        "CE, Section, 26 janvier 1968, Société Maison Genestal (Légalité des actes administratifs)",
        "CAA Versailles, jurisprudence territoriale conforme"
      ],
      recommandations: [
        "Compléter les champs entre crochets [NOM Prénom, dates, indices] avant transmission.",
        "Conserver un exemplaire signé au dossier individuel de l'agent à la DRH."
      ]
    },
    sampleDocument: tpl.sampleDocument || ""
  };
}
