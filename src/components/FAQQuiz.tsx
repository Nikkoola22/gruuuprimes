import React, { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_LENGTH = 10;

// ─── Pool de questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: Question[] = [
    // Questions issues des fiches BIP
    {
      question: "Qu'est-ce qu'un agent contractuel de droit public ?",
      options: [
        "Un agent recruté par une entreprise privée",
        "Un agent non titulaire recruté par une collectivité ou un établissement public",
        "Un agent titulaire de la fonction publique",
        "Un agent en intérim dans le secteur privé",
      ],
      correctIndex: 1,
      explanation: "Un agent contractuel de droit public est recruté par une collectivité ou un établissement public, sans être titulaire.",
    },
    {
      question: "Quelle est la durée maximale d'un congé maladie ordinaire (CMO) ?",
      options: [
        "3 mois",
        "6 mois",
        "1 an",
        "3 ans",
      ],
      correctIndex: 2,
      explanation: "Le CMO peut durer jusqu'à 1 an : 3 mois à 90% du traitement puis 9 mois à demi-traitement.",
    },
    {
      question: "Qu'est-ce que la disponibilité dans la fonction publique ?",
      options: [
        "Une période d'attente avant une nouvelle affectation",
        "Une position hors cadres permettant à l'agent de cesser temporairement ses fonctions sans rémunération",
        "Un congé exceptionnel accordé par l'administration",
        "Une période de formation longue durée rémunérée",
      ],
      correctIndex: 1,
      explanation: "La disponibilité place l'agent hors de son administration d'origine : il cesse ses fonctions et n'est plus rémunéré pendant cette période.",
    },
      {
        question: "Qu'est-ce qu'un détachement dans la fonction publique ?",
        options: [
          "Un congé maladie de longue durée",
          "La possibilité pour un agent d'exercer temporairement dans une autre administration ou organisme",
          "Un départ définitif de la fonction publique",
          "Un congé pour formation professionnelle",
        ],
        correctIndex: 1,
        explanation: "Le détachement permet à un agent d'exercer temporairement dans une autre administration ou organisme tout en conservant ses droits à l'avancement.",
      },
    {
      question: "Qu'est-ce que la NBI (Nouvelle Bonification Indiciaire) ?",
      options: [
        "Une prime liée aux résultats individuels",
        "Des points d'indice supplémentaires attribués pour certaines fonctions particulières",
        "Une nouvelle grille de rémunération nationale",
        "Un bonus annuel exceptionnel",
      ],
      correctIndex: 1,
      explanation: "La NBI est un supplément de points d'indice attribué aux agents exerçant certaines fonctions comportant une responsabilité ou une technicité particulière.",
    },
    {
      question: "Qu'est-ce que le RIFSEEP ?",
      options: [
        "Un régime de retraite complémentaire",
        "Un régime indemnitaire tenant compte des fonctions, sujétions, expertise et engagement professionnel",
        "Une prime exceptionnelle annuelle",
        "Un dispositif de formation professionnelle",
      ],
      correctIndex: 1,
      explanation: "Le RIFSEEP est le régime indemnitaire principal dans la fonction publique territoriale depuis 2016.",
    },
    {
      question: "Qu'est-ce que le CIA dans le RIFSEEP ?",
      options: [
        "Complément Indemnitaire Annuel versé selon l'engagement professionnel et les résultats",
        "Commission d'Inspection Administrative",
        "Compte Individuel d'Activité",
        "Comité d'Intervention Administrative",
      ],
      correctIndex: 0,
      explanation: "Le CIA (Complément Indemnitaire Annuel) est la part variable du RIFSEEP, versée en fonction des résultats et de l'engagement professionnel de l'agent.",
    },
    {
      question: "Qu'est-ce qu'une promotion de grade dans la FPT ?",
      options: [
        "Un changement de corps ou de cadre d'emplois",
        "Une progression à l'intérieur du même cadre d'emplois selon l'ancienneté et la valeur professionnelle",
        "Une augmentation de salaire sans changement de grade",
        "Un simple changement de poste",
      ],
      correctIndex: 1,
      explanation: "La promotion de grade permet à un agent de progresser au sein de son cadre d'emplois, en fonction de son ancienneté et de sa valeur professionnelle reconnue.",
    },
    {
      question: "Qu'est-ce que la protection fonctionnelle ?",
      options: [
        "Une assurance professionnelle personnelle souscrite par l'agent",
        "La protection accordée par l'employeur à l'agent victime d'attaques dans l'exercice de ses fonctions",
        "Un dispositif de protection des données personnelles",
        "Un système de protection contre le licenciement abusif",
      ],
      correctIndex: 1,
      explanation: "La protection fonctionnelle est l'obligation pour l'employeur de protéger et défendre l'agent victime d'attaques, menaces ou poursuites dans l'exercice de ses fonctions.",
    },
    {
      question: "Qu'est-ce que le compte épargne-temps (CET) ?",
      options: [
        "Un compte bancaire dédié aux primes",
        "Un dispositif permettant d'épargner des jours de congés non pris pour les utiliser ultérieurement ou les monétiser",
        "Un compte de formation professionnelle",
        "Un système d'épargne retraite complémentaire",
      ],
      correctIndex: 1,
      explanation: "Le CET permet d'accumuler des jours de congés non pris (plafond 60 jours) pour les utiliser ultérieurement ou les monétiser.",
    },
    {
      question: "Qu'est-ce que le temps partiel thérapeutique ?",
      options: [
        "Un temps partiel choisi par l'agent pour convenance personnelle",
        "Un temps partiel accordé après maladie pour favoriser la reprise progressive du travail",
        "Un temps partiel imposé par l'employeur après une longue absence",
        "Un temps partiel lié à une formation longue durée",
      ],
      correctIndex: 1,
      explanation: "Le temps partiel thérapeutique est accordé après un congé maladie pour permettre une reprise progressive et sécurisée du travail.",
    },
    {
      question: "Qu'est-ce que le droit de retrait ?",
      options: [
        "Le droit de prendre sa retraite anticipée",
        "Le droit de quitter son poste en cas de danger grave et imminent pour sa vie ou sa santé",
        "Le droit de refuser une mutation",
        "Le droit de demander un congé sans solde",
      ],
      correctIndex: 1,
      explanation: "Le droit de retrait permet à un agent de quitter son poste s'il a un motif raisonnable de penser qu'il se trouve dans une situation de danger grave et imminent.",
    },
    {
      question: "Qu'est-ce que le conseil de discipline des agents contractuels ?",
      options: [
        "Un organe chargé d'attribuer des primes",
        "Un organe qui examine les situations disciplinaires et donne un avis sur les sanctions",
        "Un comité de recrutement",
        "Un service de gestion des congés",
      ],
      correctIndex: 1,
      explanation: "Le conseil de discipline examine les situations disciplinaires et donne un avis sur les sanctions à appliquer aux agents contractuels.",
    },
    {
      question: "Qu'est-ce que la mobilité dans la fonction publique territoriale ?",
      options: [
        "Le changement de poste au sein d'une même collectivité ou vers une autre collectivité",
        "Le passage du secteur public au secteur privé",
        "Un congé pour formation professionnelle",
        "Un détachement à l'étranger uniquement",
      ],
      correctIndex: 0,
      explanation: "La mobilité permet à un agent de changer de poste au sein de la même collectivité ou vers une autre, pour favoriser l'évolution professionnelle.",
    },
  {
    question: "Combien de jours de télétravail par semaine sont autorisés par défaut à Gennevilliers ?",
    options: [
      "1 jour par semaine",
      "2 jours par semaine",
      "3 jours par semaine",
      "4 jours par semaine",
    ],
    correctIndex: 1,
    explanation: "Le télétravail est autorisé jusqu'à 2 jours par semaine par défaut à Gennevilliers.",
  },
  {
    question: "Quel est le délai de prévenance pour annuler une journée de télétravail ?",
    options: [
      "24 heures",
      "48 heures",
      "72 heures",
      "1 semaine",
    ],
    correctIndex: 1,
    explanation: "Le délai de prévenance est de 48 heures pour annuler une journée de télétravail.",
  },
  {
    question: "Quelle est la durée légale annuelle du temps de travail dans la fonction publique ?",
    options: [
      "1 500 heures par an",
      "1 607 heures par an",
      "1 650 heures par an",
      "1 750 heures par an",
    ],
    correctIndex: 1,
    explanation: "La durée légale du temps de travail est de 1 607 heures par an, soit 35 heures par semaine.",
  },
  {
    question: "Combien de jours de congés annuels a-t-on droit à Gennevilliers sur 5 jours de travail par semaine ?",
    options: [
      "20 jours ouvrés",
      "22 jours ouvrés",
      "25 jours ouvrés",
      "28 jours ouvrés",
    ],
    correctIndex: 2,
    explanation: "Un agent travaillant 5 jours par semaine a droit à 25 jours ouvrés de congés annuels.",
  },
  {
    question: "Comment sont rémunérées les heures supplémentaires dans la fonction publique territoriale ?",
    options: [
      "Elles sont automatiquement payées en fin de mois",
      "Elles sont toujours récupérées en temps de repos uniquement",
      "Elles peuvent être indemnisées (IHTS) ou récupérées en repos si demandées par la hiérarchie",
      "Elles ne sont jamais rémunérées",
    ],
    correctIndex: 2,
    explanation: "Les heures supplémentaires peuvent être indemnisées via les IHTS ou compensées par du repos compensateur, à condition d'avoir été demandées par la hiérarchie.",
  },
  {
    question: "Quelle est la durée journalière de travail pour un agent à temps plein sur 5 jours ?",
    options: [
      "7 heures par jour",
      "7h12 par jour",
      "7h30 par jour",
      "8 heures par jour",
    ],
    correctIndex: 1,
    explanation: "Sur 5 jours, la durée journalière standard est de 7h12 (1607h / 52 semaines / 5 jours ≈ 7h12).",
  },
  {
    question: "Qu'est-ce que le COS (Comité des Œuvres Sociales) ?",
    options: [
      "Un syndicat professionnel",
      "Un organisme qui gère les activités sociales et culturelles des agents",
      "Un comité de sécurité au travail",
      "Une caisse de retraite complémentaire",
    ],
    correctIndex: 1,
    explanation: "Le COS gère les activités sociales et culturelles proposées aux agents (loisirs, vacances, culture, etc.).",
  },
  {
    question: "Qu'est-ce que le temps partiel dans la fonction publique ?",
    options: [
      "Un temps partiel uniquement imposé par l'employeur",
      "Le temps partiel peut être accordé de droit (naissance, adoption, handicap) ou sur autorisation selon les besoins du service",
      "Un temps partiel réservé aux agents de catégorie C",
      "Un temps partiel uniquement thérapeutique",
    ],
    correctIndex: 1,
    explanation: "Le temps partiel peut être de droit (pour élever un enfant, en cas de handicap) ou sur autorisation selon les nécessités de service.",
  },
  {
    question: "Quel est le délai pour contester une sanction disciplinaire devant le tribunal administratif ?",
    options: [
      "15 jours",
      "1 mois",
      "2 mois",
      "3 mois",
    ],
    correctIndex: 2,
    explanation: "L'agent dispose de 2 mois pour contester une sanction disciplinaire devant le tribunal administratif.",
  },
  {
    question: "Qu'est-ce que le CST (Comité Social Territorial) ?",
    options: [
      "Comité des Salaires et Traitements",
      "Instance de dialogue social remplaçant le CHSCT et le CT depuis 2023",
      "Conseil Supérieur du Travail",
      "Commission de Suivi des Titulaires",
    ],
    correctIndex: 1,
    explanation: "Le CST (Comité Social Territorial) est la nouvelle instance de dialogue social qui a fusionné le Comité Technique (CT) et le CHSCT depuis la réforme de 2023.",
  },
  {
    question: "Quelle est la durée du congé maternité pour un premier enfant ?",
    options: [
      "10 semaines",
      "14 semaines",
      "16 semaines",
      "26 semaines",
    ],
    correctIndex: 2,
    explanation: "Le congé maternité pour un premier enfant est de 16 semaines (6 semaines avant + 10 semaines après l'accouchement).",
  },
  {
    question: "Qu'est-ce que le CAP (Conseil d'Administration Paritaire) ?",
    options: [
      "Une instance composée de représentants de l'administration et des personnels qui examine les situations individuelles des agents",
      "Un comité de pilotage administratif permanent",
      "Une commission d'attribution des primes",
      "Un conseil d'administration des projets",
    ],
    correctIndex: 0,
    explanation: "Le CAP est une instance paritaire qui examine les situations individuelles des agents (avancements, mutations, sanctions, etc.).",
  },
  {
    question: "Combien de jours de congés pour événements familiaux lors d'un mariage ou PACS ?",
    options: [
      "1 jour",
      "3 jours",
      "5 jours",
      "7 jours",
    ],
    correctIndex: 2,
    explanation: "L'agent a droit à 5 jours de congés spéciaux lors de son propre mariage ou PACS.",
  },
  {
    question: "Quel est le nombre de jours de congés supplémentaires accordés pour fractionnement ?",
    options: [
      "1 ou 2 jours selon les conditions",
      "3 jours automatiquement",
      "5 jours maximum",
      "Aucun jour supplémentaire",
    ],
    correctIndex: 0,
    explanation: "Des jours supplémentaires (1 ou 2 jours) peuvent être accordés si l'agent prend une partie de ses congés en dehors de la période principale (1er mai – 31 octobre).",
  },
  {
    question: "Quelle est la durée maximale de télétravail hebdomadaire pour un agent à temps plein ?",
    options: [
      "2 jours par semaine",
      "3 jours par semaine",
      "4 jours par semaine",
      "5 jours par semaine",
    ],
    correctIndex: 1,
    explanation: "Le plafond réglementaire est de 3 jours de télétravail par semaine pour un agent à temps plein.",
  },
  {
    question: "Quelles sont les catégories hiérarchiques de la fonction publique territoriale ?",
    options: [
      "Catégorie A, B et C uniquement",
      "Catégorie A (cadres), B (techniciens/agents de maîtrise) et C (agents d'exécution)",
      "Catégorie 1, 2 et 3",
      "Catégorie junior, senior et expert",
    ],
    correctIndex: 1,
    explanation: "La FPT est organisée en trois catégories : A (cadres et dirigeants), B (techniciens et agents de maîtrise) et C (agents d'exécution).",
  },
  {
    question: "Qu'est-ce que le droit syndical dans la fonction publique ?",
    options: [
      "Le droit de grève uniquement",
      "Le droit de se syndiquer, participer à des réunions syndicales et bénéficier de décharges d'activité de service",
      "Le droit de négocier son salaire individuellement",
      "Le droit de refuser toute affectation",
    ],
    correctIndex: 1,
    explanation: "Le droit syndical comprend : se syndiquer, assister à des réunions, bénéficier de décharges d'activité et d'un local syndical.",
  },
  {
    question: "Quelle est la durée du stage pour un fonctionnaire stagiaire dans la FPT ?",
    options: [
      "3 mois",
      "6 mois",
      "1 an",
      "2 ans",
    ],
    correctIndex: 2,
    explanation: "La durée du stage est généralement d'1 an pour un fonctionnaire stagiaire dans la fonction publique territoriale avant titularisation.",
  },
  {
    question: "Combien de jours de congés spéciaux lors du décès d'un parent proche ?",
    options: [
      "1 jour",
      "2 jours",
      "3 jours",
      "5 jours",
    ],
    correctIndex: 2,
    explanation: "L'agent a droit à 3 jours de congés spéciaux lors du décès d'un parent proche (père, mère, conjoint, enfant).",
  },
  {
    question: "Qu'est-ce que le droit à la déconnexion ?",
    options: [
      "Le droit de ne pas avoir de téléphone professionnel",
      "Le droit de ne pas être contacté professionnellement en dehors des heures de travail",
      "Le droit de refuser l'accès à internet au travail",
      "Le droit de désactiver son badge professionnel",
    ],
    correctIndex: 1,
    explanation: "Le droit à la déconnexion est le droit pour l'agent de ne pas répondre aux sollicitations professionnelles en dehors de ses horaires de travail.",
  },
  {
    question: "Qu'est-ce que le télétravail flottant ?",
    options: [
      "Des jours de télétravail non fixes, choisis librement dans un crédit mensuel défini",
      "Du télétravail uniquement les jours fériés",
      "Du télétravail depuis l'étranger",
      "Du télétravail partagé entre deux agents sur un même poste",
    ],
    correctIndex: 0,
    explanation: "Le télétravail flottant consiste en des jours de télétravail non prédéterminés, piochés librement dans un crédit mensuel accordé.",
  },
  {
    question: "Qu'est-ce que l'entretien professionnel annuel ?",
    options: [
      "Un entretien médical obligatoire avec la médecine du travail",
      "Un entretien entre l'agent et son supérieur hiérarchique direct évaluant le travail et fixant les objectifs",
      "Un entretien de recrutement interne",
      "Un entretien syndical annuel obligatoire",
    ],
    correctIndex: 1,
    explanation: "L'entretien professionnel annuel est conduit par le N+1 ; il évalue la manière de servir, fait le bilan de l'année et fixe les objectifs de l'année suivante.",
  },
  {
    question: "Qu'est-ce que le congé de longue maladie (CLM) ?",
    options: [
      "Un congé de 6 mois maximum",
      "Un congé de 3 ans pour une affection grave (1 an plein traitement + 2 ans demi-traitement)",
      "Un congé équivalent au CMO mais sans limite de durée",
      "Un congé accordé uniquement pour accident du travail",
    ],
    correctIndex: 1,
    explanation: "Le CLM est accordé pour des affections graves : 1 an à plein traitement puis 2 ans à demi-traitement, soit 3 ans au total.",
  },
  {
    question: "Qu'est-ce que le régime de travail en cycle ?",
    options: [
      "Un travail uniquement de nuit en rotation hebdomadaire",
      "Une organisation du temps de travail sur une période de référence supérieure à la semaine",
      "Un travail alterné entre télétravail et présentiel",
      "Un système de rotation des postes entre collègues",
    ],
    correctIndex: 1,
    explanation: "Le cycle de travail est une organisation sur une période > à la semaine, permettant de moduler les horaires tout en respectant les 1607h annuelles.",
  },
  {
    question: "Qu'est-ce que le CNAS ?",
    options: [
      "Caisse Nationale d'Action Sociale — organisme proposant des prestations sociales et culturelles aux agents territoriaux",
      "Comité National d'Administration Syndicale",
      "Centre National d'Appui et de Soutien aux agents",
      "Commission Nationale d'Avancement et de Salaire",
    ],
    correctIndex: 0,
    explanation: "Le CNAS propose des prestations sociales, culturelles et de loisirs aux agents de la fonction publique territoriale.",
  },
  {
    question: "Quel est le délai de réponse de l'administration à une demande de télétravail ?",
    options: [
      "15 jours",
      "1 mois",
      "2 mois",
      "3 mois",
    ],
    correctIndex: 2,
    explanation: "L'administration dispose de 2 mois pour répondre à une demande de télétravail. Passé ce délai, le silence vaut acceptation.",
  },
  {
    question: "Combien de jours maximum peuvent être épargnés dans le CET par an ?",
    options: [
      "10 jours par an",
      "15 jours par an",
      "20 jours par an",
      "30 jours par an",
    ],
    correctIndex: 0,
    explanation: "Un agent peut épargner jusqu'à 10 jours par an dans son CET, dans la limite d'un plafond total de 60 jours.",
  },
  {
    question: "Qu'est-ce que le congé parental ?",
    options: [
      "Un congé de maternité prolongé rémunéré",
      "Un congé non rémunéré permettant d'élever son enfant jusqu'à ses 3 ans",
      "Un congé payé pour s'occuper d'un enfant malade",
      "Un congé accordé uniquement au père après la naissance",
    ],
    correctIndex: 1,
    explanation: "Le congé parental est non rémunéré ; il permet à l'agent de cesser temporairement de travailler pour élever son enfant jusqu'au 3e anniversaire de celui-ci.",
  },
  {
    question: "Combien d'heures de CPF (Compte Personnel de Formation) sont créditées par an pour un temps plein ?",
    options: [
      "10 heures par an",
      "20 heures par an",
      "24 heures par an",
      "50 heures par an",
    ],
    correctIndex: 1,
    explanation: "Le CPF est crédité de 20 heures par an pour un agent à temps plein, plafonné à 150 heures.",
  },
  {
    question: "Qu'est-ce que le PPCR (Parcours Professionnels, Carrières et Rémunérations) ?",
    options: [
      "Un programme de prévention contre les risques professionnels",
      "Une réforme restructurant les grilles indiciaires et les carrières dans la fonction publique depuis 2016",
      "Un plan de formation professionnelle continue",
      "Un protocole de protection et de conseil des représentants syndicaux",
    ],
    correctIndex: 1,
    explanation: "Le PPCR est une réforme mise en place depuis 2016 qui a revu les grilles indiciaires, la structure des carrières et les modalités d'avancement.",
  },
  {
    question: "Qu'est-ce qu'une grève et quelles en sont les modalités dans la FPT ?",
    options: [
      "Une absence injustifiée passible de sanction disciplinaire",
      "Une cessation collective du travail nécessitant un préavis de 5 jours francs déposé par un syndicat représentatif",
      "Un arrêt de travail individuel autorisé sans préavis",
      "Une manifestation extérieure sans impact sur la rémunération",
    ],
    correctIndex: 1,
    explanation: "La grève dans la FPT nécessite un préavis de 5 jours francs déposé par un syndicat représentatif. Chaque journée de grève entraîne une retenue de 1/30e du traitement mensuel.",
  },
  {
    question: "La suspension d'un agent constitue-t-elle une sanction disciplinaire ?",
    options: [
      "Oui, toujours",
      "Oui, mais seulement pour les fonctionnaires titulaires",
      "Non, c'est une mesure conservatoire prise dans l'intérêt du service",
      "Non, sauf si elle dure plus de 4 mois",
    ],
    correctIndex: 2,
    explanation: "La suspension n'est pas une sanction disciplinaire : c'est une mesure conservatoire destinée à écarter temporairement l'agent du service en cas de faute grave vraisemblable.",
  },
  {
    question: "Avant une suspension conservatoire, le conseil de discipline doit-il être consulté ?",
    options: [
      "Oui, obligatoirement",
      "Oui, sauf pour les agents contractuels",
      "Non, la suspension n'est pas soumise à la procédure disciplinaire",
      "Non, mais uniquement avec l'accord de l'agent",
    ],
    correctIndex: 2,
    explanation: "La suspension n'étant pas une sanction disciplinaire, elle n'impose pas la consultation préalable du conseil de discipline ni la communication obligatoire du dossier avant décision.",
  },
  {
    question: "Quel est le délai maximal pour régler définitivement la situation d'un agent suspendu lorsqu'une action disciplinaire est engagée ?",
    options: [
      "1 mois",
      "2 mois",
      "4 mois",
      "6 mois",
    ],
    correctIndex: 2,
    explanation: "Lorsque l'autorité prononce une suspension et engage l'action disciplinaire, la situation de l'agent doit être définitivement réglée dans un délai de 4 mois, faute de quoi il est rétabli dans ses fonctions.",
  },
  {
    question: "Après combien de temps un blâme peut-il être effacé automatiquement du dossier de l'agent s'il n'y a pas eu d'autre sanction ?",
    options: [
      "1 an",
      "2 ans",
      "3 ans",
      "5 ans",
    ],
    correctIndex: 2,
    explanation: "Le blâme peut être effacé automatiquement du dossier après 3 ans si aucune autre sanction n'a été prononcée pendant cette période.",
  },
  {
    question: "Dans quel cas un agent peut-il refuser un ordre hiérarchique sans s'exposer à une sanction disciplinaire ?",
    options: [
      "Quand l'ordre lui semble inutile",
      "Quand l'ordre est manifestement illégal et compromet gravement un intérêt public",
      "Quand l'ordre est donné oralement",
      "Quand l'ordre modifie ses horaires de travail",
    ],
    correctIndex: 1,
    explanation: "Un agent ne peut refuser d'obéir que si l'ordre est manifestement illégal et de nature à compromettre gravement un intérêt public. Les deux conditions sont cumulatives.",
  },
  {
    question: "Des publications Facebook publiques d'un agent peuvent-elles être utilisées dans une procédure disciplinaire ?",
    options: [
      "Non, jamais",
      "Oui, si elles sont publiquement accessibles et obtenues loyalement",
      "Oui, mais seulement avec l'accord écrit de l'agent",
      "Non, sauf en cas de faute pénale",
    ],
    correctIndex: 1,
    explanation: "Des publications publiquement accessibles peuvent être retenues comme preuve disciplinaire si elles n'ont pas été obtenues par un procédé déloyal ou intrusif.",
  },
  {
    question: "Une simple insuffisance professionnelle peut-elle justifier à elle seule une suspension conservatoire ?",
    options: [
      "Oui, si elle perturbe le service",
      "Oui, après un entretien professionnel",
      "Non, la suspension suppose des faits relevant d'une faute disciplinaire grave",
      "Non, sauf pour les agents stagiaires",
    ],
    correctIndex: 2,
    explanation: "Une suspension ne peut pas être fondée sur la seule insuffisance professionnelle. Elle suppose des faits présentant le caractère d'une faute disciplinaire grave et vraisemblable.",
  },
  {
    question: "Quel délai l'agent doit-il respecter pour transmettre son certificat médical en cas de congé de maladie ordinaire ?",
    options: [
      "24 heures",
      "48 heures",
      "72 heures",
      "8 jours",
    ],
    correctIndex: 1,
    explanation: "Pour être placé en congé de maladie ordinaire, l'agent doit transmettre son certificat médical à l'autorité territoriale dans un délai de 48 heures.",
  },
  {
    question: "En principe, quel délai de carence s'applique au congé de maladie ordinaire ?",
    options: [
      "Aucun délai de carence",
      "Un demi-jour",
      "1 jour",
      "3 jours",
    ],
    correctIndex: 2,
    explanation: "En principe, un délai de carence d'un jour s'applique au congé de maladie ordinaire, avec plusieurs exceptions prévues par les textes.",
  },
  {
    question: "Après les 3 premiers mois d'un congé de maladie ordinaire, quel niveau de traitement l'agent perçoit-il en principe ?",
    options: [
      "100 % du traitement",
      "90 % du traitement",
      "75 % du traitement",
      "50 % du traitement",
    ],
    correctIndex: 3,
    explanation: "Après les 3 premiers mois de CMO, l'agent passe en principe à demi-traitement pendant les 9 mois suivants, tout en conservant intégralement le supplément familial et l'indemnité de résidence.",
  },
  {
    question: "À partir de combien de mois consécutifs de congé de maladie ordinaire une visite de contrôle doit-elle avoir lieu au moins une fois ?",
    options: [
      "3 mois",
      "6 mois",
      "9 mois",
      "12 mois",
    ],
    correctIndex: 1,
    explanation: "Au-delà de 6 mois consécutifs de congé de maladie ordinaire, une visite de contrôle doit avoir lieu au moins une fois.",
  },
  {
    question: "Quelles affections ouvrent droit au congé de longue durée (CLD) ?",
    options: [
      "Toute maladie reconnue en ALD",
      "Tuberculose, maladie mentale, affection cancéreuse, poliomyélite et déficit immunitaire grave et acquis",
      "Uniquement les cancers et les maladies professionnelles",
      "Toute pathologie ayant entraîné un arrêt supérieur à 6 mois",
    ],
    correctIndex: 1,
    explanation: "Le CLD n'est ouvert qu'à cinq catégories d'affections : tuberculose, maladie mentale, affection cancéreuse, poliomyélite et déficit immunitaire grave et acquis.",
  },
  {
    question: "Les droits à congé de longue durée se reconstituent-ils après une reprise de fonctions pour la même affection ?",
    options: [
      "Oui, immédiatement",
      "Oui, après 1 an de reprise",
      "Non, les droits à CLD ne se reconstituent pas pour la même catégorie d'affection",
      "Non, sauf en cas de changement de collectivité",
    ],
    correctIndex: 2,
    explanation: "Les droits à CLD ne se reconstituent pas, même après une reprise de fonctions. Une fois épuisés pour une même catégorie d'affection, ils ne se rouvrent pas.",
  },
  {
    question: "Comment se compose le conseil médical en formation restreinte ?",
    options: [
      "3 médecins, 2 représentants de la collectivité et 2 représentants du personnel",
      "3 médecins titulaires uniquement, avec éventuellement des suppléants",
      "1 médecin, 1 élu et 1 représentant syndical",
      "2 médecins et 1 représentant du centre de gestion",
    ],
    correctIndex: 1,
    explanation: "En formation restreinte, le conseil médical est composé uniquement de trois médecins titulaires, avec un ou plusieurs suppléants.",
  },
  {
    question: "Quand un accident est-il présumé imputable au service ?",
    options: [
      "Dès qu'il survient pendant une pause déjeuner, quel que soit le lieu",
      "Lorsqu'il survient dans le temps et le lieu du service, dans l'exercice ou à l'occasion des fonctions, sans faute personnelle ni circonstance détachant l'accident du service",
      "Uniquement s'il entraîne une hospitalisation",
      "Seulement s'il est reconnu par un supérieur hiérarchique témoin des faits",
    ],
    correctIndex: 1,
    explanation: "L'accident est présumé imputable au service lorsqu'il survient dans le temps et le lieu du service, dans l'exercice ou à l'occasion des fonctions, sauf faute personnelle ou circonstance particulière détachant l'accident du service.",
  },
  {
    question: "Une cure thermale préventive peut-elle ouvrir droit à un congé de maladie ordinaire ?",
    options: [
      "Non, jamais",
      "Oui, uniquement si l'agent a plus de 10 ans d'ancienneté",
      "Oui, si l'absence de traitement en temps utile mettrait l'agent dans l'impossibilité d'exercer ses fonctions",
      "Oui, mais seulement pendant les congés annuels",
    ],
    correctIndex: 2,
    explanation: "Une cure thermale préventive peut justifier un congé de maladie ordinaire si la pathologie constatée mettrait l'agent dans l'impossibilité d'exercer ses fonctions sans ce traitement effectué en temps utile.",
  },
];

// ─── Tirage aléatoire de N questions uniques ──────────────────────────────────
function getRandomQuestions(pool: Question[], count = QUIZ_LENGTH): Question[] {
  const uniqueQuestions: Question[] = [];
  const seenQuestions = new Set<string>();

  for (const item of pool) {
    const key = item.question.trim().toLowerCase();
    if (seenQuestions.has(key)) continue;
    seenQuestions.add(key);
    uniqueQuestions.push(item);
  }

  const shuffled = [...uniqueQuestions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ─── Composant FAQQuiz ────────────────────────────────────────────────────────
const FAQQuiz: React.FC = () => {
  const quizTopRef = useRef<HTMLDivElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>(() =>
    getRandomQuestions(ALL_QUESTIONS, QUIZ_LENGTH)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_LENGTH).fill(null));

  const current = questions[currentIndex];

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedOption(index);
      setAnswered(true);
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
      if (index === current.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, answers, currentIndex, current]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setQuestions(getRandomQuestions(ALL_QUESTIONS, QUIZ_LENGTH));
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setAnswers(Array(QUIZ_LENGTH).fill(null));

    window.setTimeout(() => {
      quizTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  // ── Écran résultats ──────────────────────────────────────────────────────────
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const medal = percentage >= 80 ? "🏆" : percentage >= 60 ? "👍" : "📚";

    return (
      <div ref={quizTopRef} className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{medal}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Quiz terminé !</h2>
          <p className="text-4xl font-extrabold text-red-600 my-2">
            {score} / {questions.length}
          </p>
          <p className="text-gray-500">{percentage}% de bonnes réponses</p>
        </div>

        <div className="space-y-3 mb-6">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border-l-4 text-sm ${
                  isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="font-semibold mb-1">{q.question}</div>
                {isCorrect ? (
                  <p className="text-green-700 text-xs">
                    ✓ Bonne réponse : {q.options[q.correctIndex]}
                  </p>
                ) : (
                  <>
                    <p className="text-red-600 text-xs">
                      ✗ Votre réponse : {userAnswer !== null ? q.options[userAnswer] : "Sans réponse"}
                    </p>
                    <p className="text-green-700 text-xs">
                      ✓ Bonne réponse : {q.options[q.correctIndex]}
                    </p>
                  </>
                )}
                <div className="text-gray-500 text-xs mt-1">{q.explanation}</div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
        >
          {`🔄 Nouveau quiz (${QUIZ_LENGTH} questions aléatoires)`}
        </button>
      </div>
    );
  }

  // ── Écran question ───────────────────────────────────────────────────────────
  return (
    <div ref={quizTopRef} className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-sm font-bold text-red-600">
          Score : {score}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-5">
        {current.question}
      </h3>

      <div className="space-y-3 mb-6">
        {current.options.map((option, i) => {
          let style =
            "w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 cursor-pointer ";
          if (!answered) {
            style += "border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-700";
          } else if (i === current.correctIndex) {
            style += "border-green-500 bg-green-50 text-green-800";
          } else if (i === selectedOption) {
            style += "border-red-500 bg-red-50 text-red-800";
          } else {
            style += "border-gray-200 text-gray-400 cursor-default";
          }

          return (
            <button
              key={i}
              className={style}
              onClick={() => handleSelect(i)}
              disabled={answered && i !== current.correctIndex && i !== selectedOption}
            >
              <span className="mr-2 font-bold text-gray-400">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`p-4 rounded-xl mb-4 text-sm ${
            selectedOption === current.correctIndex
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-orange-50 border border-orange-200 text-orange-800"
          }`}
        >
          <p className="font-bold mb-1">
            {selectedOption === current.correctIndex
              ? "✅ Bonne réponse !"
              : "❌ Mauvaise réponse"}
          </p>
          <p>{current.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
        >
          {currentIndex + 1 < questions.length
            ? "Question suivante →"
            : "Voir les résultats 🏁"}
        </button>
      )}
    </div>
  );
};

export default FAQQuiz;
