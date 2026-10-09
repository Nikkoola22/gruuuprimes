/**
 * Registre des Modèles de Courriers et Demandes Administratives de l'Agent Territorial
 * Ville de Gennevilliers - Conforme au Code Général de la Fonction Publique (CGFP)
 */

export interface AgentProfile {
  nom: string;
  prenom: string;
  civilite: 'M.' | 'Mme';
  grade: string;
  direction: string;
  matricule?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  destinataireTitre: string;
  destinataireSousCouvert: string;
  destinataireAdresse: string;
}

export interface CourrierFieldDef {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
}

export interface CourrierTemplate {
  id: string;
  title: string;
  category: 'temps_travail' | 'famille_conges' | 'carriere_formation' | 'sante_securite' | 'departs_retraite';
  categoryLabel: string;
  icon: string;
  cgfpRef: string;
  summary: string;
  delaiRecommande?: string;
  modeEnvoiDefaut: 'Lettre remise en main propre contre décharge' | 'Lettre recommandée avec avis de réception (LRAR)' | 'Voie hiérarchique avec accusé de réception';
  piecesJointesDefaut: string[];
  fields: CourrierFieldDef[];
  generateBody: (agent: AgentProfile, values: Record<string, string>) => string;
}

export const DEFAULT_AGENT_PROFILE: AgentProfile = {
  nom: "GARNIER",
  prenom: "Atlas",
  civilite: "Mme",
  grade: "Adjoint Administratif Territorial Principal de 2e classe",
  direction: "Direction de l'Enfance et de la Petite Enfance",
  matricule: "10482",
  adresse: "12, rue Gabriel-Péri",
  codePostal: "92230",
  ville: "Gennevilliers",
  telephone: "06 12 34 56 78",
  email: "atlas.garnier@email.fr",
  destinataireTitre: "À l'attention de Monsieur Patrice LECLERC, Maire de la Ville de Gennevilliers",
  destinataireSousCouvert: "Sous couvert de Madame Soraya FONTAINE KESSAR, Directrice Générale des Services\nEt de Monsieur Pierric ANNOOT, Adjoint au Maire délégué aux Ressources Humaines",
  destinataireAdresse: "Hôtel de Ville — Direction des Ressources Humaines\n177, avenue Gabriel-Péri, 92230 Gennevilliers"
};

export const COURRIER_CATEGORIES = [
  { id: 'all', label: 'Tous les courriers', icon: '📬' },
  { id: 'temps_travail', label: 'Temps de travail & Organisation', icon: '⏰' },
  { id: 'famille_conges', label: 'Famille, Congés & Absences', icon: '👶' },
  { id: 'carriere_formation', label: 'Carrière, Formation & Mobilité', icon: '🚀' },
  { id: 'sante_securite', label: 'Santé, Poste & Protection', icon: '🩺' },
  { id: 'departs_retraite', label: 'Fin de Carrière & Départs', icon: '🚪' },
] as const;

export const COURRIERS_REGISTRY: CourrierTemplate[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TEMPS DE TRAVAIL & ORGANISATION
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "courrier_temps_partiel_autorisation",
    title: "Demande d'autorisation de travail à temps partiel",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "⏰",
    cgfpRef: "CGFP Art. L. 612-1 & Décret n° 2004-777",
    summary: "Demande d'exercice à temps partiel (50%, 60%, 70%, 80%) pour convenances personnelles sous réserve des nécessités de service.",
    delaiRecommande: "Au moins 2 mois avant la date de début souhaitée",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Proposition de planning de travail concerté avec le chef de service"],
    fields: [
      {
        id: "quotite",
        label: "Quotité de temps partiel sollicitée",
        type: "select",
        defaultValue: "80%",
        options: [
          { value: "80%", label: "80 % (28h/semaine - payé à 85,7% / 6/7èmes)" },
          { value: "70%", label: "70 % (24h30/semaine - payé à 70%)" },
          { value: "60%", label: "60 % (21h/semaine - payé à 60%)" },
          { value: "50%", label: "50 % (17h30/semaine - payé à 50%)" }
        ]
      },
      {
        id: "dateDebut",
        label: "Date de prise d'effet souhaitée",
        type: "date",
        defaultValue: "2026-09-01"
      },
      {
        id: "duree",
        label: "Durée demandée",
        type: "select",
        defaultValue: "1 an",
        options: [
          { value: "6 mois", label: "6 mois (renouvelable)" },
          { value: "1 an", label: "1 an (durée maximale d'une période)" }
        ]
      },
      {
        id: "organisationJours",
        label: "Organisation des jours de présence souhaitée",
        type: "text",
        defaultValue: "Travail les lundis, mardis, jeudis et vendredis (libération du mercredi)",
        placeholder: "Ex: Non travaillé le mercredi toute la journée"
      },
      {
        id: "motif",
        label: "Motifs ou précisions éventuelles",
        type: "textarea",
        defaultValue: "Pour convenances personnelles et afin de concilier au mieux mes obligations familiales et professionnelles.",
        placeholder: "Précisez vos motivations..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter par la présente votre bienveillance afin de m'accorder l'autorisation d'exercer mes fonctions à temps partiel, conformément aux dispositions des articles L. 612-1 et suivants du Code Général de la Fonction Publique et du décret n° 2004-777 du 29 juillet 2004.

Je souhaiterais bénéficier d'une quotité de travail fixée à ${v.quotite || "80%"}, pour une durée de ${v.duree || "1 an"}, prenant effet à compter du ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}.

Dans la mesure où les nécessités du service le permettent, je propose l'organisation hebdomadaire suivante : ${v.organisationJours || "libération du mercredi toute la journée"}.

${v.motif ? `Cette démarche est motivée par la raison suivante : ${v.motif}` : ""}

J'ai d'ores et déjà échangé avec mon supérieur hiérarchique direct sur la faisabilité technique de cette organisation au sein de l'équipe, afin de garantir la continuité sans faille du service public communal.

Je me tiens à votre entière disposition pour tout entretien complémentaire et vous remercie par avance de l'attention bienveillante que vous porterez à ma requête.

Je vous prie d'agréer, Monsieur le Maire, l'expression de ma considération très respectueuse.`
  },

  {
    id: "courrier_temps_partiel_droit",
    title: "Demande de temps partiel de droit (famille / soins)",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "🍼",
    cgfpRef: "CGFP Art. L. 612-2 & Décret n° 2004-777",
    summary: "Temps partiel accordé de plein droit suite à une naissance, une adoption ou pour donner des soins à un proche.",
    delaiRecommande: "Au moins 1 mois avant la date de prise d'effet",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Copie intégrale de l'acte de naissance ou certificat médical"],
    fields: [
      {
        id: "motifDroit",
        label: "Motif légal ouvrant droit",
        type: "select",
        defaultValue: "naissance",
        options: [
          { value: "naissance", label: "À l'occasion de la naissance d'un enfant (jusqu'à ses 3 ans)" },
          { value: "adoption", label: "À l'occasion de l'arrivée au foyer d'un enfant adopté" },
          { value: "soins_proche", label: "Pour donner des soins à un enfant, conjoint ou ascendant handicapé/malade" }
        ]
      },
      {
        id: "enfantInfos",
        label: "Nom, prénom et date de naissance de l'enfant / proche",
        type: "text",
        defaultValue: "Lucas DUPONT né le 15 janvier 2026",
        placeholder: "Ex: Enfant prénom NOM, né(e) le JJ/MM/AAAA"
      },
      {
        id: "quotite",
        label: "Quotité de service sollicitée",
        type: "select",
        defaultValue: "80%",
        options: [
          { value: "80%", label: "80 % (rémunéré à 85,7% - 6/7èmes)" },
          { value: "70%", label: "70 %" },
          { value: "60%", label: "60 %" },
          { value: "50%", label: "50 %" }
        ]
      },
      {
        id: "dateDebut",
        label: "Date de début souhaitée",
        type: "date",
        defaultValue: "2026-06-01"
      },
      {
        id: "duree",
        label: "Durée de la période",
        type: "select",
        defaultValue: "6 mois",
        options: [
          { value: "6 mois", label: "6 mois renouvelables" },
          { value: "1 an", label: "1 an" }
        ]
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Exerçant actuellement les fonctions de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous informer de ma volonté de bénéficier d'une autorisation de travail à temps partiel de droit, en application des dispositions de l'article L. 612-2 du Code Général de la Fonction Publique et de l'article 2 du décret n° 2004-777 du 29 juillet 2004.

Cette demande de plein droit est formulée au titre de : ${v.motifDroit === 'naissance' ? "l'élevage d'un enfant de moins de trois ans" : v.motifDroit === 'adoption' ? "l'adoption d'un enfant" : "l'assistance à un proche nécessitant des soins constants"}, concernant ${v.enfantInfos || "[Nom du proche/enfant]"}.

Je sollicite l'exercice de mes fonctions à raison d'une quotité de ${v.quotite || "80%"}, pour une durée de ${v.duree || "6 mois"}, à compter du ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}.

Vous trouverez sous ce pli les justificatifs d'état civil et administratifs établissant l'ouverture de ce droit.

Je vous remercie de bien vouloir me notifier votre arrêté constatant mon exercice à temps partiel et vous prie d'agréer, Monsieur le Maire, l'expression de mes salutations très respectueuses.`
  },

  {
    id: "courrier_teletravail_demande",
    title: "Demande d'autorisation d'exercice en télétravail",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "🏠",
    cgfpRef: "CGFP Art. L. 430-1 & Décret n° 2016-151",
    summary: "Demande initiale ou renouvellement de télétravail (1 à 2 jours par semaine) avec respect du cadre communal de Gennevilliers.",
    delaiRecommande: "Au moins 1 mois avant la date de début souhaitée",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Attestation de conformité des installations électriques et réseau", "Attestation d'assurance multirisque habitation"],
    fields: [
      {
        id: "typeDemande",
        label: "Type de demande",
        type: "select",
        defaultValue: "initiale",
        options: [
          { value: "initiale", label: "Première demande d'autorisation" },
          { value: "renouvellement", label: "Demande de renouvellement annuel" }
        ]
      },
      {
        id: "nbJours",
        label: "Rythme de télétravail souhaité",
        type: "select",
        defaultValue: "2 jours par semaine",
        options: [
          { value: "1 jour par semaine", label: "1 jour fixe par semaine" },
          { value: "2 jours par semaine", label: "2 jours fixes par semaine (maximum usuel)" },
          { value: "forfait_jours", label: "Forfait annuel de jours flottants" }
        ]
      },
      {
        id: "joursSouhaites",
        label: "Jours de télétravail proposés",
        type: "text",
        defaultValue: "Le mardi et le jeudi",
        placeholder: "Ex: Le jeudi"
      },
      {
        id: "lieuTeletravail",
        label: "Adresse du lieu d'exercice en télétravail",
        type: "text",
        defaultValue: "À mon domicile personnel",
        placeholder: "Ex: Mon domicile personnel ou tiers-lieu communal"
      },
      {
        id: "dateDebut",
        label: "Date de prise d'effet souhaitée",
        type: "date",
        defaultValue: "2026-05-01"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

En poste en qualité de ${agent.grade} à la ${agent.direction}, j'ai l'honneur de solliciter votre accord pour une autorisation ${v.typeDemande === 'renouvellement' ? "de renouvellement" : "d'exercice"} de mes missions en télétravail, conformément aux dispositions de l'article L. 430-1 du Code Général de la Fonction Publique, du décret n° 2016-151 du 11 février 2016 et du protocole d'accord communal relatif au télétravail de la Ville de Gennevilliers.

Je souhaite pouvoir télétravailler à raison de ${v.nbJours || "2 jours par semaine"}, positionnés de préférence ${v.joursSouhaites ? v.joursSouhaites.toLowerCase() : "le mardi et le jeudi"}, pour une durée d'un an à compter du ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}.

L'activité s'exercera ${v.lieuTeletravail ? v.lieuTeletravail.toLowerCase() : "à mon domicile"}. J'atteste sur l'honneur disposer d'un espace de travail calme, d'une connexion internet haut débit sécurisée et d'installations électriques conformes aux normes en vigueur.

Les tâches attachées à mon emploi comportent une part substantielle d'activités dématérialisables (rédaction, traitement de dossiers, instruction réglementaire) parfaitement compatibles avec le travail à distance, sans que cela n'altère le service aux usagers ni la présence minimale obligatoire de trois jours par semaine au sein de mon service d'affectation.

Je joins à ma demande les attestations requises et reste à votre disposition pour formaliser la convention individuelle de télétravail.

Je vous prie de recevoir, Monsieur le Maire, l'assurance de mon profond respect.`
  },

  {
    id: "courrier_reintegration_temps_plein",
    title: "Demande de réintégration à temps plein",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "🔄",
    cgfpRef: "CGFP Art. L. 612-8 & Décret n° 2004-777",
    summary: "Demande de reprise des fonctions à 100% à l'échéance de la période de temps partiel ou par anticipation.",
    delaiRecommande: "Au moins 2 mois avant la date d'effet souhaitée",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: [],
    fields: [
      {
        id: "typeReprise",
        label: "Type de reprise",
        type: "select",
        defaultValue: "echeance",
        options: [
          { value: "echeance", label: "Au terme normal de mon arrêté de temps partiel en cours" },
          { value: "anticipee", label: "Par anticipation avant le terme prévu (motif grave ou financier)" }
        ]
      },
      {
        id: "dateReprise",
        label: "Date de reprise à temps complet souhaitée",
        type: "date",
        defaultValue: "2026-09-01"
      },
      {
        id: "motifAnticipation",
        label: "Précisions ou motif en cas d'anticipation",
        type: "textarea",
        defaultValue: "Évolution de ma situation personnelle et budgétaire me permettant de réinvestir pleinement mon poste à 35 heures hebdomadaires.",
        placeholder: "Indiquez les circonstances justifiant la reprise..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Actuellement autorisé(e) à exercer mes fonctions à temps partiel au sein de la ${agent.direction}, j'ai l'honneur de vous informer de mon souhait de réintégrer mon poste à temps plein (100 % - 35 heures hebdomadaires), conformément à l'article L. 612-8 du Code Général de la Fonction Publique.

Cette reprise à temps complet interviendrait ${v.typeReprise === 'anticipee' ? "par anticipation" : "au terme normal de mon autorisation"}, avec effet au ${v.dateReprise ? new Date(v.dateReprise).toLocaleDateString('fr-FR') : "[Date]"}.

${v.motifAnticipation ? `À titre informatif, ce souhait est guidé par les éléments suivants : ${v.motifAnticipation}` : ""}

J'ai prévenu mon responsable de service afin que cette réintégration s'intègre harmonieusement dans le planning d'activité du pôle.

Je vous remercie de bien vouloir faire établir l'arrêté municipal correspondant et vous prie de croire, Monsieur le Maire, en mes sentiments les plus dévoués.`
  },

  {
    id: "courrier_cet_utilisation",
    title: "Demande d'utilisation / monétisation du Compte Épargne-Temps (CET)",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "💰",
    cgfpRef: "Décret n° 2004-878 & Décret n° 2018-1305",
    summary: "Option annuelle d'arbitrage des jours de CET accumulés au-delà de 15 jours : indemnisation financière, RAFP ou maintien.",
    delaiRecommande: "Avant le 31 janvier lors de la campagne annuelle de choix CET",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Relevé de situation officiel de mon compte épargne-temps"],
    fields: [
      {
        id: "soldeTotal",
        label: "Nombre total de jours inscrits sur mon CET au 31 décembre",
        type: "number",
        defaultValue: "25",
        placeholder: "Ex: 22"
      },
      {
        id: "nbJoursMonetises",
        label: "Nombre de jours dont je demande l'indemnisation financière (monétisation)",
        type: "number",
        defaultValue: "5",
        placeholder: "Ex: 5"
      },
      {
        id: "nbJoursRafp",
        label: "Nombre de jours à convertir en épargne retraite (RAFP - titulaires)",
        type: "number",
        defaultValue: "0",
        placeholder: "Ex: 0"
      },
      {
        id: "nbJoursMaintenus",
        label: "Nombre de jours maintenus sur le CET pour congés ultérieurs",
        type: "number",
        defaultValue: "20",
        placeholder: "Ex: 15"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} affecté(e) à la ${agent.direction}, je vous sollicite dans le cadre de la campagne d'exercice des options sur le Compte Épargne-Temps (CET), en application des dispositions du décret n° 2004-878 du 26 août 2004 modifié.

Au 31 décembre dernier, mon compte épargne-temps présentait un solde créditeur de ${v.soldeTotal || "25"} jours. Pour les jours excédant le seuil réglementaire de 15 jours, j'ai l'honneur de vous notifier mes choix d'arbitrage :

1° Prise en compte financière (monétisation forfaitaire brute selon le barème de ma catégorie) : ${v.nbJoursMonetises || "0"} jour(s) ;
2° Conversion en points de Retraite Additionnelle de la Fonction Publique (RAFP) : ${v.nbJoursRafp || "0"} jour(s) ;
3° Maintien sur mon compte pour prise ultérieure sous forme de congés : ${v.nbJoursMaintenus || "0"} jour(s).

Je joins à la présente copie de mon dernier relevé de CET validé par le service RH.

Je vous remercie par avance pour la prise en compte de ces options sur ma prochaine paie et vous adresse, Monsieur le Maire, mes respectueuses salutations.`
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FAMILLE, CONGÉS & ABSENCES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "courrier_conge_parental",
    title: "Demande de congé parental d'éducation",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "👶",
    cgfpRef: "CGFP Art. L. 515-1 à L. 515-9 & Décret n° 86-68",
    summary: "Position de congé non rémunéré accordée de plein droit pour élever son enfant jusqu'à ses 3 ans.",
    delaiRecommande: "Au moins 1 mois avant la date de début souhaitée",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Copie intégrale de l'acte de naissance de l'enfant"],
    fields: [
      {
        id: "enfantInfos",
        label: "Nom, prénom et date de naissance de l'enfant",
        type: "text",
        defaultValue: "Emma DUPONT, née le 10 avril 2026",
        placeholder: "Ex: Emma DUPONT, née le ..."
      },
      {
        id: "dateDebut",
        label: "Date de début du congé parental",
        type: "date",
        defaultValue: "2026-07-01"
      },
      {
        id: "dureePeriode",
        label: "Durée de la période sollicitée",
        type: "select",
        defaultValue: "6 mois",
        options: [
          { value: "6 mois", label: "6 mois (durée usuelle renouvelable)" },
          { value: "3 mois", label: "3 mois" },
          { value: "2 mois", label: "2 mois (durée minimale légale)" }
        ]
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Exerçant en qualité de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous demander mon placement en congé parental, conformément aux dispositions des articles L. 515-1 à L. 515-9 du Code Général de la Fonction Publique et du décret n° 86-68 du 13 janvier 1986 modifié.

Ce congé parental de droit est sollicité pour élever mon enfant, ${v.enfantInfos || "[Nom de l'enfant]"}, dont vous trouverez l'acte de naissance ci-joint.

Je souhaite que ce congé débute le ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}, pour une première période de ${v.dureePeriode || "6 mois"}, renouvelable dans la limite maximale des 3 ans de l'enfant.

Je note que durant cette période, bien que la rémunération cesse, je conserve mes droits à l'avancement d'échelon dans la limite de cinq ans sur l'ensemble de ma carrière, conformément aux règles statutaires.

Dans l'attente de la notification de votre arrêté, je vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_sft_attribution",
    title: "Demande d'attribution / révision du SFT",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "👨‍👩‍👧‍👦",
    cgfpRef: "CGFP Art. L. 712-8 & Décret n° 85-1148",
    summary: "Demande d'ouverture ou d'actualisation des droits au Supplément Familial de Traitement pour enfants à charge.",
    delaiRecommande: "Dès survenance de l'événement (naissance, scolarité)",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Copie du livret de famille à jour", "Attestation de non-perception du SFT par le conjoint", "Certificat de scolarité pour les plus de 16 ans"],
    fields: [
      {
        id: "nbEnfants",
        label: "Nombre d'enfants à charge effective",
        type: "select",
        defaultValue: "2",
        options: [
          { value: "1", label: "1 enfant" },
          { value: "2", label: "2 enfants" },
          { value: "3", label: "3 enfants" },
          { value: "4", label: "4 enfants ou plus" }
        ]
      },
      {
        id: "detailsEnfants",
        label: "Noms, prénoms et dates de naissance des enfants",
        type: "textarea",
        defaultValue: "1. Lucas DUPONT, né le 12/03/2018\n2. Emma DUPONT, née le 05/01/2026",
        placeholder: "Précisez pour chaque enfant..."
      },
      {
        id: "situationConjoint",
        label: "Situation professionnelle du conjoint / autre parent",
        type: "text",
        defaultValue: "Salarié dans le secteur privé - ne perçoit aucun SFT",
        placeholder: "Ex: Employé secteur privé / Agent public..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

En tant que ${agent.grade} affecté(e) à la ${agent.direction}, j'ai l'honneur de vous solliciter afin de bénéficier du versement du Supplément Familial de Traitement (SFT) au titre de mes enfants à charge, en vertu des articles L. 712-8 à L. 712-11 du Code Général de la Fonction Publique et du décret n° 85-1148 du 24 octobre 1985 modifié.

J'assume la charge effective et permanente de ${v.nbEnfants || "2"} enfant(s) au sens des prestations familiales de la Sécurité Sociale :
${v.detailsEnfants || "[Liste des enfants]"}

Mon conjoint (${v.situationConjoint || "secteur privé"}) ne perçoit aucun avantage similaire au titre de son activité professionnelle, tel qu'en atteste le document ci-joint de son employeur.

Je joins l'ensemble des justificatifs requis (livret de famille, attestation d'allocataire CAF) et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_asa_absence",
    title: "Demande d'Autorisation Spéciale d'Absence (ASA)",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "📋",
    cgfpRef: "CGFP Art. L. 622-1 & Règlement communal du temps de travail",
    summary: "Absence rémunérée pour événements familiaux (mariage/pacs, naissance, deuil, enfant malade).",
    delaiRecommande: "Au moins 8 jours à l'avance (ou sans délai pour événement imprévu)",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Pièce justificative officielle (certificat de mariage, acte de décès, certificat médical)"],
    fields: [
      {
        id: "motifAsa",
        label: "Motif de l'autorisation spéciale",
        type: "select",
        defaultValue: "mariage",
        options: [
          { value: "mariage", label: "Mariage ou conclusion d'un PACS (5 jours ouvrés)" },
          { value: "naissance", label: "Naissance ou adoption au foyer (3 jours ouvrables)" },
          { value: "enfant_malade", label: "Garde d'enfant malade de moins de 16 ans (certificat médical)" },
          { value: "deces_proche", label: "Décès d'un ascendant, descendant ou conjoint (3 à 5 jours)" },
          { value: "evenement_civique", label: "Obligation civique, assesseur ou juré d'assises" }
        ]
      },
      {
        id: "dateAbsence",
        label: "Période ou dates de l'absence sollicitée",
        type: "text",
        defaultValue: "Du lundi 15 juin au vendredi 19 juin 2026 inclus",
        placeholder: "Ex: Le vendredi 12 mars ou du ... au ..."
      },
      {
        id: "justificatifDescription",
        label: "Justificatif fourni",
        type: "text",
        defaultValue: "Certificat de publication des bans / Certificat médical",
        placeholder: "Ex: Certificat médical établi le ..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Agent territorial titulaire au sein de la ${agent.direction} en qualité de ${agent.grade}, j'ai l'honneur de vous demander de bien vouloir m'accorder une Autorisation Spéciale d'Absence (ASA) à l'occasion de l'événement suivant : ${v.motifAsa === 'mariage' ? "mon mariage / conclusion de PACS" : v.motifAsa === 'naissance' ? "la naissance de mon enfant" : v.motifAsa === 'enfant_malade' ? "la maladie de mon enfant à charge" : "un deuil familial"}, conformément aux dispositions statutaires et au protocole communal en vigueur.

Cette absence se déroulerait : ${v.dateAbsence || "[Dates d'absence]"}.

Vous trouverez sous ce pli le justificatif attestant de la réalité de cette situation (${v.justificatifDescription || "document justificatif"}). Mon supérieur hiérarchique a été prévenu afin d'adapter l'organisation de l'équipe pendant cette brève interruption.

En vous remerciant par avance pour votre accord, je vous prie de recevoir, Monsieur le Maire, l'expression de ma considération distinguée.`
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. CARRIÈRE, FORMATION & MOBILITÉ
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "courrier_cpf_formation",
    title: "Demande d'utilisation du CPF avec prise en charge",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "🎓",
    cgfpRef: "CGFP Art. L. 422-1 à L. 422-17 & Décret n° 2017-928",
    summary: "Mobilisation des heures acquises au titre du Compte Personnel de Formation pour financer une formation certifiante.",
    delaiRecommande: "Au moins 2 mois avant le démarrage de l'action de formation",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Devis pédagogique détaillé et programme certifié Qualiopi", "Extrait de compteur MonCompteFormation", "Projet professionnel argumenté"],
    fields: [
      {
        id: "intituleFormation",
        label: "Intitulé complet de la formation certifiante",
        type: "text",
        defaultValue: "Préparation au Concours Interne de Rédacteur Territorial / Certification Titre RNCP",
        placeholder: "Ex: Titre Professionnel, Diplôme universitaire..."
      },
      {
        id: "organisme",
        label: "Organisme de formation prestataire",
        type: "text",
        defaultValue: "Centre National de la Fonction Publique Territoriale (CNFPT) ou Organisme agréé",
        placeholder: "Ex: Greta, Université, Organisme..."
      },
      {
        id: "datesFormation",
        label: "Calendrier et volume d'heures",
        type: "text",
        defaultValue: "Du 15 septembre au 15 décembre 2026 (70 heures au total)",
        placeholder: "Ex: 70 heures réparties sur 3 mois"
      },
      {
        id: "heuresCpf",
        label: "Nombre d'heures CPF mobilisées",
        type: "number",
        defaultValue: "70",
        placeholder: "Ex: 50"
      },
      {
        id: "coutPriseEnCharge",
        label: "Coût pédagogique dont le financement est sollicité",
        type: "text",
        defaultValue: "1 450,00 € TTC",
        placeholder: "Ex: 1 200 € TTC"
      },
      {
        id: "projetPro",
        label: "Objectif professionnel poursuivi",
        type: "textarea",
        defaultValue: "Ce projet vise à renforcer mes compétences réglementaires et managériales en vue de me présenter aux prochaines épreuves du concours interne et d'évoluer vers des missions de catégorie B au sein de la collectivité.",
        placeholder: "Expliquez l'intérêt pour votre évolution..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Actuellement ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter votre accord pour mobiliser mon Compte Personnel de Formation (CPF) et obtenir la prise en charge financière des frais pédagogiques y afférents, en vertu des articles L. 422-1 et suivants du Code Général de la Fonction Publique et du décret n° 2017-928 du 6 mai 2017.

Mon projet porte sur la formation certifiante suivante :
- Intitulé : ${v.intituleFormation || "[Intitulé de la formation]"} ;
- Organisme : ${v.organisme || "[Nom de l'organisme]"} ;
- Période et volume : ${v.datesFormation || "[Dates et volume]"} ;
- Heures CPF sollicitées : ${v.heuresCpf || "70"} heures (mon compteur actuel affichant un solde suffisant) ;
- Financement pédagogique sollicité : ${v.coutPriseEnCharge || "Montant"} € TTC.

Intérêt professionnel :
${v.projetPro || "Cette action s'inscrit au cœur de mon projet d'évolution au sein de la fonction publique territoriale."}

Je sollicite que cette formation puisse se dérouler sur mon temps de service (ou hors temps de service) et joins sous ce pli le devis détaillé ainsi que le programme de l'organisme.

Je me tiens à la disposition de la Direction des Ressources Humaines pour étudier ce dossier et vous adresse, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_cfp_conge",
    title: "Demande de Congé de Formation Professionnelle (CFP)",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "📚",
    cgfpRef: "CGFP Art. L. 422-21 & Décret n° 2007-1845",
    summary: "Demande de congé d'une durée maximale de 3 ans pour projet personnel, avec indemnité forfaitaire à 85% pendant 1 an.",
    delaiRecommande: "Au moins 90 jours avant la date de début de la formation",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Attestation d'inscription ou d'admissibilité", "Programme pédagogique complet", "Engagement de servir sur l'honneur"],
    fields: [
      {
        id: "intituleFormation",
        label: "Diplôme ou formation préparée",
        type: "text",
        defaultValue: "Licence d'Administration Publique (LAP) ou Master Management Territorial",
        placeholder: "Ex: Diplôme d'État..."
      },
      {
        id: "organisme",
        label: "Établissement d'enseignement",
        type: "text",
        defaultValue: "Université / Institut d'Études Politiques",
        placeholder: "Ex: Université Paris-Nanterre"
      },
      {
        id: "dateDebut",
        label: "Date de début du congé",
        type: "date",
        defaultValue: "2026-10-01"
      },
      {
        id: "dureeMois",
        label: "Durée du congé sollicité (en mois)",
        type: "select",
        defaultValue: "10 mois",
        options: [
          { value: "6 mois", label: "6 mois" },
          { value: "10 mois", label: "10 mois (année universitaire)" },
          { value: "12 mois", label: "12 mois (durée indemnisée max à 85%)" }
        ]
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Justifiant de plus de trois années de services effectifs dans la fonction publique en qualité de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter l'octroi d'un Congé de Formation Professionnelle (CFP), en application des articles L. 422-21 et suivants du Code Général de la Fonction Publique et du décret n° 2007-1845 du 26 décembre 2007.

Ce congé est sollicité pour suivre la formation suivante :
- Intitulé : ${v.intituleFormation || "[Intitulé de la formation]"} ;
- Établissement : ${v.organisme || "[Organisme]"} ;
- Date de début : ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"} ;
- Durée sollicitée : ${v.dureeMois || "10 mois"}.

Pendant cette période, je sollicite le bénéfice de l'indemnité mensuelle forfaitaire égale à 85 % de mon traitement brut et de l'indemnité de résidence. Je souscris formellement par la présente l'engagement réglementaire de rester au service d'une collectivité publique pour une durée égale au triple de la période pendant laquelle j'aurai perçu cette indemnité.

Je joins les justificatifs d'admission et demeure à votre entière disposition.

Je vous prie de recevoir, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_disponibilite_convenances",
    title: "Demande de mise en disponibilité pour convenances personnelles",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "🧳",
    cgfpRef: "CGFP Art. L. 514-1 & Décret n° 86-68",
    summary: "Suspension temporaire d'activité et de salaire pour réaliser un projet personnel ou professionnel hors administration.",
    delaiRecommande: "Au moins 2 à 3 mois avant la date de départ",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: [],
    fields: [
      {
        id: "dateDebut",
        label: "Date de départ souhaitée",
        type: "date",
        defaultValue: "2026-09-01"
      },
      {
        id: "duree",
        label: "Durée de la période sollicitée",
        type: "select",
        defaultValue: "1 an",
        options: [
          { value: "6 mois", label: "6 mois" },
          { value: "1 an", label: "1 an (recommandé)" },
          { value: "2 ans", label: "2 ans" },
          { value: "3 ans", label: "3 ans" }
        ]
      },
      {
        id: "projetPro",
        label: "Motif ou projet envisagé",
        type: "textarea",
        defaultValue: "Pour convenances personnelles et afin de concrétiser un projet d'activité professionnelle / personnelle indépendant.",
        placeholder: "Précisez succinctement la nature de votre démarche..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Fonctionnaire titulaire du grade de ${agent.grade} affecté(e) à la ${agent.direction}, j'ai l'honneur de vous solliciter afin d'obtenir ma mise en disponibilité pour convenances personnelles, conformément aux dispositions des articles L. 514-1 et suivants du Code Général de la Fonction Publique et de l'article 21 du décret n° 86-68 du 13 janvier 1986.

Je souhaiterais que cette mise en disponibilité prenne effet le ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}, pour une période de ${v.duree || "1 an"}.

${v.projetPro ? `Cette demande est motivée par la raison suivante : ${v.projetPro}` : ""}

J'ai bien pris note qu'au cours de cette période, je cesserai de percevoir ma rémunération communale et que tout exercice d'une activité lucrative fera l'objet d'une déclaration préalable auprès de vos services au titre du contrôle déontologique (article L. 124-1 du CGFP). Je m'engage également à formuler ma demande de réintégration ou de renouvellement trois mois avant l'échéance du terme.

Je vous remercie de l'attention portée à ma démarche et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_recours_crep",
    title: "Recours gracieux sur le CREP (évaluation annuelle)",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "⚖️",
    cgfpRef: "Décret n° 2014-1526 Art. 6 (Délai strict de 15 jours)",
    summary: "Contestation formelle des appréciations littérales ou de la cotation des compétences portées au compte-rendu annuel.",
    delaiRecommande: "Délai impératif de 15 jours francs suivant la notification du CREP",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Copie intégrale du compte-rendu d'entretien professionnel notifié", "Pièces justificatives, bilans d'activité et courriels probants"],
    fields: [
      {
        id: "dateNotificationCrep",
        label: "Date de notification du CREP contesté",
        type: "date",
        defaultValue: "2026-03-20"
      },
      {
        id: "nomEvaluateur",
        label: "Nom et fonction de l'évaluateur direct (N+1)",
        type: "text",
        defaultValue: "Monsieur/Madame [NOM Prénom], Responsable de service",
        placeholder: "Ex: M. Martin, Chef de service"
      },
      {
        id: "griefs",
        label: "Éléments contestés (appréciation, cotation, objectifs)",
        type: "select",
        defaultValue: "appreciation_litterale",
        options: [
          { value: "appreciation_litterale", label: "L'appréciation générale littérale (Volet 6)" },
          { value: "notation_competences", label: "La cotation d'une ou plusieurs compétences (Volet 3)" },
          { value: "objectifs", label: "L'évaluation de l'atteinte des objectifs N-1 (Volet 2)" },
          { value: "ensemble", label: "L'ensemble de l'évaluation et de la manière de servir" }
        ]
      },
      {
        id: "arguments",
        label: "Exposé détaillé et factuel des arguments de contestation",
        type: "textarea",
        defaultValue: "L'appréciation portée ne reflète ni la réalité de mon investissement professionnel tout au long de l'année, ni l'atteinte intégrale des objectifs opérationnels qui m'avaient été confiés en dépit du sous-effectif persistant.",
        placeholder: "Détaillez point par point avec dates et faits tangibles..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Fonctionnaire territorial titulaire du grade de ${agent.grade} au sein de la ${agent.direction}, j'ai reçu notification le ${v.dateNotificationCrep ? new Date(v.dateNotificationCrep).toLocaleDateString('fr-FR') : "[Date]"} de mon compte-rendu d'entretien professionnel au titre de la campagne d'évaluation.

Par la présente, et dans le respect du délai légal de quinze (15) jours francs prescrit par l'article 6 du décret n° 2014-1526 du 16 décembre 2014, j'ai l'honneur d'exercer un recours gracieux auprès de votre haute autorité afin de solliciter la révision de mon compte-rendu d'évaluation.

Ma contestation porte tout particulièrement sur : ${v.griefs === 'appreciation_litterale' ? "l'appréciation générale littérale du supérieur hiérarchique" : v.griefs === 'notation_competences' ? "la cotation de certaines compétences professionnelles" : "les conclusions portées sur l'atteinte des objectifs"}.

Éléments et arguments à l'appui de ma demande :
${v.arguments || "Les mentions figurant au compte-rendu ne rendent pas compte de mon travail effectif et des résultats obtenus."}

Les pièces justificatives annexées (comptes-rendus d'activité, attestations) attestent de la réalité de mon engagement professionnel et contredisent l'appréciation litigieuse.

Au regard de ces éléments, je vous sollicite respectueusement afin qu'il vous plaise de procéder à la modification de mon CREP. Je vous rappelle qu'à défaut de réponse dans le délai de 15 jours ou en cas de rejet, je me réserve le droit de porter mon recours devant la Commission Administrative Paritaire (CAP) compétente au CIG Petite Couronne.

Je vous prie de croire, Monsieur le Maire, en l'assurance de ma considération respectueuse.`
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. SANTÉ, POSTE & PROTECTION DE L'AGENT
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "courrier_declaration_accident_service",
    title: "Déclaration d'accident de service ou de trajet (CITIS)",
    category: "sante_securite",
    categoryLabel: "Santé, Poste & Protection",
    icon: "🩹",
    cgfpRef: "CGFP Art. L. 822-6 à L. 822-17 & Décret n° 2019-301",
    summary: "Déclaration formelle d'un accident survenu pendant le service ou sur le trajet protégé domicile-travail pour prise en charge à 100%.",
    delaiRecommande: "Délai strict de 15 jours suivant la survenance de l'accident",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Certificat médical initial (volets 1 et 2)", "Formulaire de déclaration d'accident de service dûment complété", "Attestation écrite de témoins directs ou rapport hiérarchique"],
    fields: [
      {
        id: "typeAccident",
        label: "Nature de l'accident",
        type: "select",
        defaultValue: "service",
        options: [
          { value: "service", label: "Accident de service (survenu sur le lieu de travail)" },
          { value: "trajet", label: "Accident de trajet (entre domicile et lieu de travail)" },
          { value: "mission", label: "Accident survenu en mission extérieure commandée" }
        ]
      },
      {
        id: "dateHeure",
        label: "Date et heure précises de l'accident",
        type: "text",
        defaultValue: "Le 14 mai 2026 à 10h15",
        placeholder: "Ex: Le 12/04/2026 à 14h30"
      },
      {
        id: "lieuAccident",
        label: "Lieu précis de l'accident",
        type: "text",
        defaultValue: "Au sein des locaux communaux, escalier du bâtiment B, site Gabriel-Péri",
        placeholder: "Précisez l'adresse ou la pièce exacte..."
      },
      {
        id: "circonstances",
        label: "Description détaillée et circonstanciée des faits",
        type: "textarea",
        defaultValue: "Alors que j'effectuais la mission ordonnée par ma hiérarchie, j'ai fait une chute accidentelle en glissant sur le sol mouillé, provoquant une entorse sévère à la cheville droite.",
        placeholder: "Décrivez chronologiquement ce qui s'est passé..."
      },
      {
        id: "temoins",
        label: "Témoins éventuels (noms, prénoms et fonctions)",
        type: "text",
        defaultValue: "M. Martin (collègue de travail) et Mme Leroy (secrétaire)",
        placeholder: "Ex: Aucun témoin direct / ou M. Dupont"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Employé(e) en tant que ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous déclarer formellement l'accident ${v.typeAccident === 'trajet' ? "de trajet" : "de service"} dont j'ai été victime, conformément aux articles L. 822-6 et suivants du Code Général de la Fonction Publique et au décret n° 2019-301 du 10 avril 2019.

Circonstances précises de l'accident :
- Date et heure : ${v.dateHeure || "[Date et heure]"} ;
- Lieu : ${v.lieuAccident || "[Lieu exact]"} ;
- Témoins : ${v.temoins || "Aucun"} ;
- Déroulement des faits : ${v.circonstances || "[Exposé des faits]"}.

Vous trouverez ci-joint le certificat médical initial constatant les lésions subies ainsi que le formulaire réglementaire de déclaration.

Cet événement s'étant produit dans le cadre direct de mon activité de service public, je vous demande de bien vouloir reconnaître l'imputabilité au service de cet accident, me placer en position de Congé pour Invalidité Temporaire Imputable au Service (CITIS) et faire prendre en charge à 100 % l'ensemble de mes soins et honoraires médicaux sans avance de frais.

Je vous prie de recevoir, Monsieur le Maire, l'expression de ma considération distinguée.`
  },

  {
    id: "courrier_protection_fonctionnelle",
    title: "Demande d'octroi de la Protection Fonctionnelle",
    category: "sante_securite",
    categoryLabel: "Santé, Poste & Protection",
    icon: "🛡️",
    cgfpRef: "CGFP Art. L. 134-1 à L. 134-12",
    summary: "Protection et assistance juridique obligatoires dues par la collectivité en cas d'agression, menaces, outrages ou poursuites.",
    delaiRecommande: "Sans délai après la survenance des faits",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Récépissé de dépôt de plainte pénale", "Rapport circonstancié d'incident", "Captures d'écran, courriels menaçants ou témoignages écrits"],
    fields: [
      {
        id: "natureFaits",
        label: "Nature des agissements subis",
        type: "select",
        defaultValue: "menaces_insultes",
        options: [
          { value: "menaces_insultes", label: "Menaces verbales, outrages ou insultes proférées par un usager" },
          { value: "violences_physiques", label: "Violences physiques ou agression corporelle sur le lieu de service" },
          { value: "diffamation_reseaux", label: "Diffamation publique, calomnie ou cyberharcèlement sur les réseaux" },
          { value: "poursuites_penales", label: "Mise en cause pénale pour des faits non détachables du service" }
        ]
      },
      {
        id: "dateLieuFaits",
        label: "Date et lieu des faits",
        type: "text",
        defaultValue: "Le 18 avril 2026 à l'accueil du public de l'Hôtel de Ville",
        placeholder: "Ex: Le 02/05/2026 vers 11h..."
      },
      {
        id: "descriptionFaits",
        label: "Description circonstanciée des faits et conséquences",
        type: "textarea",
        defaultValue: "Dans l'exercice de mes fonctions d'accueil, un administré s'est montré particulièrement agressif et a proféré des menaces directes de violences à mon encontre devant plusieurs collègues et usagers.",
        placeholder: "Décrivez les propos tenus, les gestes et l'impact..."
      },
      {
        id: "plainteInfos",
        label: "Dépôt de plainte",
        type: "text",
        defaultValue: "Plainte déposée le jour même au Commissariat de Police de Gennevilliers",
        placeholder: "Ex: Plainte déposée le ... au commissariat"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

En fonction en qualité de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter formellement le bénéfice de la Protection Fonctionnelle, conformément aux dispositions impératives des articles L. 134-1 à L. 134-12 du Code Général de la Fonction Publique.

Dans le cadre strict de l'exercice de mes fonctions au service de la collectivité, j'ai été victime d'agissements intolérables :
- Date et lieu : ${v.dateLieuFaits || "[Date et lieu]"} ;
- Nature des faits : ${v.natureFaits === 'violences_physiques' ? "agression et violences physiques" : v.natureFaits === 'diffamation_reseaux' ? "diffamation publique et propos calomnieux" : "menaces graves et outrages répétés"} ;
- Description : ${v.descriptionFaits || "[Exposé des faits]"}.

Une plainte a été déposée auprès des autorités judiciaires compétentes (${v.plainteInfos || "dépôt de plainte"}), dont vous trouverez le récépissé ci-annexé.

Aux termes de l'article L. 134-5 du CGFP, la collectivité publique est tenue de protéger les agents publics contre les atteintes volontaires à l'intégrité de leur personne, les violences, les menaces ou les injures dont ils sont l'objet dans l'exercice de leurs fonctions et de réparer le préjudice qui en résulte.

À ce titre, je vous demande de bien vouloir m'octroyer cette protection, d'assurer la prise en charge des frais d'avocat et de procédure indispensables à la défense de mes intérêts et à la constitution de partie civile, et de mettre en œuvre toute mesure de sécurité adaptée.

Confiant(e) dans l'attention que vous portez à la sécurité des agents territoriaux de Gennevilliers, je vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FIN DE CARRIÈRE & DÉPARTS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "courrier_rupture_conventionnelle",
    title: "Demande d'ouverture d'une rupture conventionnelle (NON AUTORISÉ À GENNEVILLIERS)",
    category: "departs_retraite",
    categoryLabel: "Fin de Carrière & Départs",
    icon: "🤝",
    cgfpRef: "CGFP Art. L. 552-1 & Décret n° 2019-1593",
    summary: "Demande d'engagement de la procédure de rupture conventionnelle avec convocation à un entretien préalable. (ATTENTION : NON AUTORISÉ À GENNEVILLIERS)",
    delaiRecommande: "Au moins 10 jours francs avant la date proposée pour l'entretien",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: [],
    fields: [
      {
        id: "dateEntretienProposee",
        label: "Date proposée pour le premier entretien",
        type: "date",
        defaultValue: "2026-06-15"
      },
      {
        id: "dateDepartEnvisagee",
        label: "Date de cessation de fonctions envisagée",
        type: "date",
        defaultValue: "2026-10-31"
      },
      {
        id: "conseillerSyndical",
        label: "Assistance envisagée lors de l'entretien",
        type: "select",
        defaultValue: "oui",
        options: [
          { value: "oui", label: "Je me ferai assister par un conseiller désigné par une organisation syndicale" },
          { value: "non", label: "Je me présenterai seul(e)" }
        ]
      },
      {
        id: "projetMotivation",
        label: "Motifs ou perspectives professionnelles",
        type: "textarea",
        defaultValue: "Dans le cadre d'une reconversion professionnelle mûrement réfléchie vers le secteur privé / création d'entreprise.",
        placeholder: "Précisez succinctement le contexte de votre démarche..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter l'ouverture d'une procédure de rupture conventionnelle, conformément aux dispositions des articles L. 552-1 et suivants du Code Général de la Fonction Publique et du décret n° 2019-1593 du 31 décembre 2019.

Cette démarche s'inscrit dans le cadre d'un nouveau projet de vie professionnelle (${v.projetMotivation || "reconversion"}). J'envisagerais une date effective de fin de fonctions au ${v.dateDepartEnvisagee ? new Date(v.dateDepartEnvisagee).toLocaleDateString('fr-FR') : "[Date envisagée]"}.

En application de l'article 3 du décret susvisé, je vous propose que notre premier entretien préalable se tienne le ${v.dateEntretienProposee ? new Date(v.dateEntretienProposee).toLocaleDateString('fr-FR') : "[Date proposée]"}, soit après l'expiration du délai légal de dix jours francs suivant la réception de cette lettre.

Conformément à la réglementation, je vous informe que ${v.conseillerSyndical === 'oui' ? "je souhaite être assisté(e) au cours de cet entretien par un conseiller syndical représentatif" : "je me présenterai individuellement"}.

Cet entretien permettra d'échanger sur les conditions de cette rupture, et en particulier sur le montant de l'indemnité spécifique de rupture conventionnelle (ISRC) calculée selon le barème légal.

Je vous remercie de l'accueil réservé à ma requête et vous prie d'agréer, Monsieur le Maire, l'expression de ma considération très respectueuse.`
  },

  {
    id: "courrier_demande_retraite_cnracl",
    title: "Demande de départ à la retraite CNRACL et radiation",
    category: "departs_retraite",
    categoryLabel: "Fin de Carrière & Départs",
    icon: "🏖️",
    cgfpRef: "CGFP Art. L. 550-1 & Décret n° 2003-1306",
    summary: "Demande d'admission à la retraite pour ancienneté d'âge et de services et liquidation de la pension.",
    delaiRecommande: "Au moins 6 mois avant la date de départ souhaitée",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Relevé de carrière CNRACL / CNAV", "Copie de la pièce d'identité et livret de famille"],
    fields: [
      {
        id: "dateDepart",
        label: "Date de départ à la retraite souhaitée",
        type: "date",
        defaultValue: "2026-12-01"
      },
      {
        id: "regimePensions",
        label: "Régime de retraite principal",
        type: "select",
        defaultValue: "CNRACL",
        options: [
          { value: "CNRACL", label: "CNRACL (Fonctionnaire titulaire permanent)" },
          { value: "IRCANTEC", label: "IRCANTEC / Régime Général (Agent contractuel)" }
        ]
      },
      {
        id: "matriculeRetraite",
        label: "Numéro d'affiliation retraite ou NIR",
        type: "text",
        defaultValue: "CNRACL N° 92230-00123",
        placeholder: "Ex: Matricule CNRACL ou Sécurité Sociale"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Fonctionnaire titulaire au grade de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous informer de ma volonté de faire valoir mes droits à la retraite pour ancienneté d'âge et de services, conformément aux articles L. 550-1 et L. 556-1 du Code Général de la Fonction Publique et au décret n° 2003-1306 du 26 décembre 2003.

Remplissant les conditions d'âge légal et de trimestres requis, je sollicite mon admission à la retraite et ma radiation des cadres de la Ville de Gennevilliers à compter du ${v.dateDepart ? new Date(v.dateDepart).toLocaleDateString('fr-FR') : "[Date de départ, 1er du mois]"}.

Mon numéro d'affiliation retraite est le suivant : ${v.matriculeRetraite || agent.matricule || "[Numéro]"}.

Je vous remercie de bien vouloir faire instruire mon dossier de liquidation de pension auprès de la ${v.regimePensions || "CNRACL"} et de m'adresser en temps utile les arrêtés et attestations de cessation de paiement nécessaires. Je veillerai à solder l'intégralité de mes congés annuels et reliquats de temps avant cette date.

En vous remerciant pour ces années passées au service des Gennevilloises et des Gennevillois, je vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_demission_volontaire",
    title: "Lettre de démission volontaire de la collectivité",
    category: "departs_retraite",
    categoryLabel: "Fin de Carrière & Départs",
    icon: "✉️",
    cgfpRef: "CGFP Art. L. 551-1 & Décret n° 88-145 (si contractuel)",
    summary: "Notification formelle, claire et non équivoque de la volonté de quitter la fonction publique.",
    delaiRecommande: "Au moins 1 à 3 mois avant selon le statut et préavis applicable",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: [],
    fields: [
      {
        id: "dateDepart",
        label: "Date de départ effectif souhaitée",
        type: "date",
        defaultValue: "2026-08-31"
      },
      {
        id: "motifOptionnel",
        label: "Motif succinct (optionnel)",
        type: "textarea",
        defaultValue: "Pour des motifs personnels et afin d'exercer de nouvelles fonctions dans une autre structure.",
        placeholder: "Précisez si vous le désirez..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Actuellement ${agent.grade} affecté(e) à la ${agent.direction}, j'ai l'honneur de vous notifier par la présente ma décision formelle et irrévocable de démissionner de mes fonctions au sein de la Ville de Gennevilliers, conformément aux dispositions de l'article L. 551-1 du Code Général de la Fonction Publique.

Dans le respect du délai de préavis d'usage, je souhaite que cette démission prenne effet et que ma radiation des cadres soit prononcée à la date du ${v.dateDepart ? new Date(v.dateDepart).toLocaleDateString('fr-FR') : "[Date de fin]"}.

${v.motifOptionnel ? `À titre personnel, j'ajoute que cette démarche intervient : ${v.motifOptionnel}` : ""}

Je vous saurais gré de bien vouloir m'accuser réception de la présente lettre et de me faire parvenir l'arrêté d'acceptation de démission ainsi que mon certificat de travail et mon solde de tout compte.

Je vous prie de recevoir, Monsieur le Maire, l'expression de ma considération distinguée.`
  },

  {
    id: "courrier_cumul_activite",
    title: "Demande d'autorisation de cumul d'activités à titre accessoire",
    category: "temps_travail",
    categoryLabel: "Temps de travail & Organisation",
    icon: "💼",
    cgfpRef: "CGFP Art. L. 123-1 à L. 123-8 & Décret n° 2020-69",
    summary: "Demande préalable d'autorisation d'exercer une activité lucrative accessoire compatible avec les fonctions principales.",
    delaiRecommande: "Au moins 1 mois avant le début de l'activité accessoire",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Descriptif précis de la mission ou projet de contrat", "Attestation de l'organisme d'accueil ou déclaration d'auto-entrepreneur"],
    fields: [
      {
        id: "natureActivite",
        label: "Nature de l'activité accessoire sollicitée",
        type: "select",
        defaultValue: "enseignement_formation",
        options: [
          { value: "enseignement_formation", label: "Enseignement, formation ou jurys de concours" },
          { value: "expertise_consultance", label: "Activité d'expertise, de conseil ou technique" },
          { value: "activite_artistique", label: "Activité à caractère artistique, littéraire ou scientifique" },
          { value: "services_personne", label: "Services à la personne ou vente de biens fabriqués personnellement" },
          { value: "interet_general", label: "Activité d'intérêt général auprès d'une association ou personne publique" }
        ]
      },
      {
        id: "employeurSecondaire",
        label: "Organisme ou employeur pour le compte duquel l'activité est exercée",
        type: "text",
        defaultValue: "Centre National de la Fonction Publique Territoriale (CNFPT) / Organisme de formation",
        placeholder: "Ex: Université Paris-Nanterre, Association sportive..."
      },
      {
        id: "volumeHoraire",
        label: "Volume horaire et périodicité prévus",
        type: "text",
        defaultValue: "Environ 4 heures par mois, exercées exclusivement en soirée ou le samedi",
        placeholder: "Ex: 2 heures par semaine en dehors des heures de service"
      },
      {
        id: "dateDebutFin",
        label: "Période d'exercice de l'activité accessoire",
        type: "text",
        defaultValue: "Du 1er octobre 2026 au 30 juin 2027",
        placeholder: "Ex: Année scolaire 2026-2027"
      },
      {
        id: "remuneration",
        label: "Modalité de rémunération envisagée",
        type: "text",
        defaultValue: "Rémunération horaire sous forme de vacations ou honoraires",
        placeholder: "Ex: Vacations horaires, droits d'auteur, bénévolat défrayé"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de solliciter votre autorisation bienveillante afin d'exercer une activité lucrative accessoire, conformément aux dispositions des articles L. 123-1 à L. 123-8 du Code Général de la Fonction Publique et du décret n° 2020-69 du 30 janvier 2020 relatif aux contrôles déontologiques.

Caractéristiques de l'activité accessoire envisagée :
- Nature de l'activité : ${v.natureActivite === 'enseignement_formation' ? "Enseignement et formation" : v.natureActivite === 'expertise_consultance' ? "Expertise et conseil" : v.natureActivite === 'activite_artistique' ? "Activité artistique ou littéraire" : "Activité accessoire autorisée"} ;
- Organisme d'accueil : ${v.employeurSecondaire || "[Nom de l'organisme]"} ;
- Période : ${v.dateDebutFin || "[Période]"} ;
- Volume prévisionnel : ${v.volumeHoraire || "[Volume horaire]"} ;
- Conditions financières : ${v.remuneration || "Rémunération accessoire"}.

J'atteste sur l'honneur que cette activité sera exercée exclusivement en dehors de mes heures de service au sein de la Ville de Gennevilliers et qu'elle ne portera en aucune manière atteinte au fonctionnement normal, à l'indépendance ni à la neutralité du service public communal. Elle ne me place pas non plus en situation d'incompatibilité déontologique ou de prise illégale d'intérêts.

Vous trouverez sous ce pli les justificatifs décrivant la teneur exacte des missions confiées.

Je vous remercie par avance de l'autorisation qu'il vous plaira de m'accorder et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_grossesse_amenagement",
    title: "Déclaration de grossesse et demande d'aménagement horaire",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "🤰",
    cgfpRef: "CGFP Art. L. 622-1 & Circulaire FP4 n° 1864 du 9 août 1995",
    summary: "Déclaration officielle de grossesse et demande de dispense de travail journalier d'une heure dès le 3e mois.",
    delaiRecommande: "Dès confirmation médicale au cours du 3e mois de grossesse",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Certificat médical attestant de l'état de grossesse et de la date présumée d'accouchement"],
    fields: [
      {
        id: "dateAccouchement",
        label: "Date présumée d'accouchement",
        type: "date",
        defaultValue: "2026-11-20"
      },
      {
        id: "modaliteHeure",
        label: "Modalité souhaitée pour la réduction d'1h par jour",
        type: "select",
        defaultValue: "fin_journee",
        options: [
          { value: "fin_journee", label: "Départ anticipé d'1 heure en fin de journée de travail" },
          { value: "debut_journee", label: "Arrivée différée d'1 heure le matin" },
          { value: "pause_meridienne", label: "Allongement d'1 heure de la pause méridienne" }
        ]
      },
      {
        id: "amenagementPoste",
        label: "Souhait éventuel d'adaptation des conditions physiques de travail",
        type: "textarea",
        defaultValue: "Limitation des stations debout prolongées et port de charges lourdes.",
        placeholder: "Précisez vos besoins éventuels..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Fonctionnaire en poste en tant que ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous déclarer formellement mon état de grossesse, attesté par le certificat médical de mon praticien traitant ci-annexé, constatant une date présumée d'accouchement au ${v.dateAccouchement ? new Date(v.dateAccouchement).toLocaleDateString('fr-FR') : "[Date présumée]"}.

Entrant dans mon troisième mois de grossesse, je sollicite le bénéfice de l'autorisation d'absence accordée aux agentes enceintes pour réduire leur durée journalière de travail d'une heure au maximum, sans retenue de traitement, conformément aux dispositions de la circulaire FP4 n° 1864 du 9 août 1995 et aux usages statutaires de la collectivité.

En accord avec l'organisation de mon équipe, je souhaiterais que cette heure de franchise s'applique de la manière suivante : ${v.modaliteHeure === 'fin_journee' ? "par un départ anticipé d'une heure en fin de journée" : v.modaliteHeure === 'debut_journee' ? "par une arrivée différée d'une heure le matin" : "par un aménagement de pause"}.

${v.amenagementPoste ? `Par ailleurs, compte tenu de mon état, je sollicite l'adaptation ponctuelle de mes conditions matérielles de travail suivante : ${v.amenagementPoste}` : ""}

Je vous transmettrai dans les meilleurs délais les dates exactes de mon congé maternité légal et vous prie d'agréer, Monsieur le Maire, mes sincères et respectueuses salutations.`
  },

  {
    id: "courrier_conge_proche_aidant",
    title: "Demande de congé de proche aidant",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "🤝",
    cgfpRef: "CGFP Art. L. 634-1 à L. 634-4 & Décret n° 2020-1557",
    summary: "Congé non rémunéré mais indemnisable (AJPA CAF) pour assister un proche en situation de handicap lourd ou de perte d'autonomie.",
    delaiRecommande: "Au moins 1 mois avant la date de début souhaitée (ou sans délai si urgence)",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Attestation justifiant du lien familial ou de proximité avec la personne aidée", "Notification MDPH (taux >= 80%) ou décision APA (GIR 1 à 3)", "Déclaration sur l'honneur de non-bénéfice antérieur au-delà du plafond légal"],
    fields: [
      {
        id: "procheInfos",
        label: "Identité et lien de parenté avec la personne aidée",
        type: "text",
        defaultValue: "Mon père, M. Jacques DUPONT, né le 12/04/1945",
        placeholder: "Ex: Conjoint, ascendant, descendant..."
      },
      {
        id: "justifAutonomie",
        label: "Niveau d'incapacité ou de perte d'autonomie",
        type: "select",
        defaultValue: "apa_gir",
        options: [
          { value: "apa_gir", label: "Bénéficiaire de l'APA classé en GIR 1, 2 ou 3" },
          { value: "mdph_80", label: "Taux d'incapacité permanente fixé à au moins 80 % (MDPH)" },
          { value: "majoration_tierce", label: "Bénéficiaire d'une majoration pour tierce personne (MTP/PCH)" }
        ]
      },
      {
        id: "dateDebut",
        label: "Date de prise d'effet du congé",
        type: "date",
        defaultValue: "2026-06-01"
      },
      {
        id: "dureePeriode",
        label: "Durée de la période sollicitée",
        type: "select",
        defaultValue: "3 mois",
        options: [
          { value: "1 mois", label: "1 mois" },
          { value: "3 mois", label: "3 mois (renouvelable dans la limite de 1 an sur la carrière)" },
          { value: "fractionne", label: "Prise fractionnée par journées" },
          { value: "temps_partiel", label: "Transformation en activité à temps partiel" }
        ]
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

En poste en tant que ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous demander mon placement en congé de proche aidant, en application des articles L. 634-1 à L. 634-4 du Code Général de la Fonction Publique et du décret n° 2020-1557 du 8 décembre 2020.

Ce congé est sollicité pour apporter un soutien indispensable à ${v.procheInfos || "un membre de ma famille proche"}, dont la situation de perte d'autonomie ou de handicap est établie par la décision ci-jointe (${v.justifAutonomie === 'apa_gir' ? "GIR 1 à 3" : "taux d'incapacité >= 80%"}).

Je souhaite bénéficier de ce congé pour une durée de ${v.dureePeriode || "3 mois"}, à compter du ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}.

Ce congé me permettra d'engager les démarches d'accompagnement auprès des organismes compétents et de percevoir l'Allocation Journalière du Proche Aidant (AJPA) versée par la Caisse d'Allocations Familiales.

Je vous remercie par avance pour la formalisation de votre accord et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_don_jours",
    title: "Don de jours de congés / CET à un collègue",
    category: "famille_conges",
    categoryLabel: "Famille, Congés & Absences",
    icon: "🎁",
    cgfpRef: "CGFP Art. L. 621-4 & Décret n° 2015-580",
    summary: "Renonciation anonyme et bénévole à des jours de RTT ou de CET au profit d'un agent dont un enfant est gravement malade ou qui est aidant.",
    delaiRecommande: "Sans délai lors des campagnes de solidarité",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Relevé de solde de jours de RTT / CET"],
    fields: [
      {
        id: "natureJours",
        label: "Nature des jours cédés",
        type: "select",
        defaultValue: "rtt",
        options: [
          { value: "rtt", label: "Jours de réduction du temps de travail (RTT non pris)" },
          { value: "cet", label: "Jours épargnés sur mon Compte Épargne-Temps (CET)" },
          { value: "conges_annuels", label: "Jours de congés annuels (hors quota obligatoire des 20 jours)" }
        ]
      },
      {
        id: "nbJoursDonnes",
        label: "Nombre de jours cédés",
        type: "number",
        defaultValue: "3",
        placeholder: "Ex: 2"
      },
      {
        id: "beneficiaireContexte",
        label: "Destinataire du don",
        type: "text",
        defaultValue: "Au bénéfice de l'appel à solidarité en cours pour un agent de la collectivité",
        placeholder: "Ex: Appel à don communal / Agent parent d'enfant malade"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Agent territorial au grade de ${agent.grade} à la ${agent.direction}, je vous informe par la présente de ma volonté expresse et désintéressée de faire don de jours de repos, en vertu de l'article L. 621-4 du Code Général de la Fonction Publique et du décret n° 2015-580 du 28 mai 2015.

Je renonce ainsi à ${v.nbJoursDonnes || "3"} jour(s) de repos au titre de mes ${v.natureJours === 'cet' ? "jours stockés sur mon Compte Épargne-Temps" : v.natureJours === 'rtt' ? "jours de RTT acquis" : "jours de congés annuels disponibles"}.

Ce don est consenti de manière anonyme et sans aucune contrepartie financière, ${v.beneficiaireContexte || "au profit de la campagne d'entraide pour un agent territorial confronté à la maladie grave d'un enfant ou d'un proche"}.

Je joins à ma présente déclaration l'état à jour de mes compteurs et vous remercie de bien vouloir faire opérer le prélèvement correspondant par les services des ressources humaines.

Je vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_mobilite_interne",
    title: "Candidature à une mobilité interne / changement d'affectation",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "🔄",
    cgfpRef: "CGFP Art. L. 512-19 & Lignes Directrices de Gestion (LDG)",
    summary: "Candidature formelle à un poste vacant au sein des services municipaux de la Ville de Gennevilliers.",
    delaiRecommande: "Dans le respect de la date limite de candidature fixée dans l'offre",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Curriculum Vitae actualisé", "Fiche de poste visée", "Dernier compte-rendu d'évaluation (CREP)"],
    fields: [
      {
        id: "intitulePoste",
        label: "Poste vacant visé et référence de l'offre",
        type: "text",
        defaultValue: "Gestionnaire Ressources Humaines / Carrière (Réf. MOB-2026-04)",
        placeholder: "Ex: Chargé de projet, Responsable pôle..."
      },
      {
        id: "directionVisee",
        label: "Direction / Service d'accueil souhaité",
        type: "text",
        defaultValue: "Direction des Ressources Humaines - Service Emploi et Compétences",
        placeholder: "Ex: Direction de la Culture, DGS..."
      },
      {
        id: "atoutsCandidature",
        label: "Motivations clés et compétences transférables",
        type: "textarea",
        defaultValue: "Fort(e) de mes compétences acquises en matière de gestion administrative, d'instruction statutaire et de rigueur procédurale, je souhaite mettre mon savoir-faire au service d'un nouveau collectif et dynamiser mon parcours professionnel communal.",
        placeholder: "Expliquez la cohérence avec vos compétences..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade}, actuellement en poste au sein de la ${agent.direction}, j'ai l'honneur de vous présenter ma candidature formelle au poste de ${v.intitulePoste || "[Intitulé du poste]"}, ouvert à la mobilité interne au sein de la ${v.directionVisee || "collectivité"}.

Après plusieurs années au cours desquelles j'ai développé une solide expertise de nos procédures communales et un sens affirmé du service public, je souhaite aujourd'hui donner une impulsion nouvelle à ma carrière au sein de la Ville de Gennevilliers.

${v.atoutsCandidature || "Ce poste correspond parfaitement à mes aspirations professionnelles et à mes aptitudes techniques."}

J'ai informé mon responsable de service de cette démarche constructive. Vous trouverez ci-joint mon curriculum vitae ainsi que la copie de mon dernier compte-rendu d'entretien professionnel.

Je reste à votre entière disposition pour un entretien de recrutement approfondi avec la direction d'accueil et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_reintegration_disponibilite",
    title: "Demande de réintégration après disponibilité",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "🏢",
    cgfpRef: "CGFP Art. L. 514-6 & Décret n° 86-68 Art. 26",
    summary: "Demande de reprise d'activité à l'expiration de la disponibilité avec respect impératif du préavis statutaire de 3 mois.",
    delaiRecommande: "Au moins 3 mois francs avant l'échéance de l'arrêté de disponibilité",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Certificat médical d'aptitude délivré par un médecin agréé", "Curriculum vitae mis à jour"],
    fields: [
      {
        id: "dateFinDispo",
        label: "Date de fin de la disponibilité en cours",
        type: "date",
        defaultValue: "2026-08-31"
      },
      {
        id: "dateSouhaiteeReintegration",
        label: "Date de réintégration souhaitée",
        type: "date",
        defaultValue: "2026-09-01"
      },
      {
        id: "voeuxAffectation",
        label: "Souhaits d'affectation ou orientations professionnelles",
        type: "textarea",
        defaultValue: "Je souhaite réintégrer un emploi correspondant à mon grade au sein des services administratifs, juridiques ou éducatifs de la commune.",
        placeholder: "Précisez vos souhaits d'affectation..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Fonctionnaire territorial titulaire du grade de ${agent.grade}, actuellement placé(e) en position de disponibilité pour convenances personnelles expirant le ${v.dateFinDispo ? new Date(v.dateFinDispo).toLocaleDateString('fr-FR') : "[Date de fin]"}, j'ai l'honneur de solliciter par la présente ma réintégration au sein des effectifs de la Ville de Gennevilliers.

Conformément aux dispositions de l'article L. 514-6 du Code Général de la Fonction Publique et de l'article 26 du décret n° 86-68 du 13 janvier 1986, je formule cette demande plus de trois mois avant le terme fixé, afin de permettre à vos services d'identifier un poste vacant correspondant à mon grade pour une reprise d'activité fixée au ${v.dateSouhaiteeReintegration ? new Date(v.dateSouhaiteeReintegration).toLocaleDateString('fr-FR') : "[Date de réintégration]"}.

${v.voeuxAffectation ? `À titre indicatif, mes souhaits d'affectation s'orientent vers : ${v.voeuxAffectation}` : ""}

Je me tiens à la disposition de la Direction des Ressources Humaines pour passer la visite médicale d'aptitude obligatoire auprès du médecin agréé et pour convenir des modalités pratiques de ma reprise de fonctions.

Je vous prie de recevoir, Monsieur le Maire, l'expression de ma haute considération.`
  },

  {
    id: "courrier_disponibilite_enfant",
    title: "Demande de disponibilité de droit pour élever un enfant de moins de 12 ans",
    category: "carriere_formation",
    categoryLabel: "Carrière, Formation & Mobilité",
    icon: "🪁",
    cgfpRef: "CGFP Art. L. 514-1 & Décret n° 86-68 Art. 24",
    summary: "Disponibilité accordée de plein droit pour élever son enfant jusqu'à ses 12 ans révolus.",
    delaiRecommande: "Au moins 2 mois avant la date de début souhaitée",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Copie intégrale de l'acte de naissance de l'enfant", "Copie du livret de famille à jour"],
    fields: [
      {
        id: "enfantInfos",
        label: "Prénom, nom et date de naissance de l'enfant",
        type: "text",
        defaultValue: "Gabriel DUPONT, né le 22 mai 2020 (âgé de 6 ans)",
        placeholder: "Ex: Enfant prénom NOM, né le JJ/MM/AAAA"
      },
      {
        id: "dateDebut",
        label: "Date de départ en disponibilité",
        type: "date",
        defaultValue: "2026-09-01"
      },
      {
        id: "duree",
        label: "Durée sollicitée",
        type: "select",
        defaultValue: "1 an",
        options: [
          { value: "1 an", label: "1 an (renouvelable)" },
          { value: "2 ans", label: "2 ans" },
          { value: "3 ans", label: "3 ans (durée maximale d'une période)" }
        ]
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} au sein de la ${agent.direction}, j'ai l'honneur de vous demander mon placement en disponibilité de droit pour élever un enfant de moins de douze ans, en application des articles L. 514-1 du Code Général de la Fonction Publique et 24 du décret n° 86-68 du 13 janvier 1986 modifié.

Cette mise en disponibilité de plein droit est demandée pour m'occuper de mon enfant : ${v.enfantInfos || "[Nom de l'enfant]"}, dont l'acte d'état civil est joint aux présentes.

Je souhaite que cette position prenne effet le ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}, pour une période de ${v.duree || "1 an"}, renouvelable tant que l'enfant n'aura pas atteint son douzième anniversaire.

Je note que cette période suspendra ma rémunération mais que, sous réserve de remplir les conditions réglementaires d'exercice d'une éventuelle activité accessoire ou de conservation de droits, je pourrai conserver le bénéfice de mes droits à l'avancement d'échelon dans la limite maximale de cinq années.

Je vous remercie de bien vouloir me notifier l'arrêté municipal correspondant et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_tpt_temps_therapeutique",
    title: "Demande d'autorisation de Temps Partiel Thérapeutique (TPT)",
    category: "sante_securite",
    categoryLabel: "Santé, Poste & Protection",
    icon: "🩺",
    cgfpRef: "CGFP Art. L. 823-1 à L. 823-6 & Décret n° 2021-1462",
    summary: "Reprise d'activité progressive après maladie avec maintien intégral du traitement indiciaire brut et du SFT.",
    delaiRecommande: "Au moins 15 jours avant la date de reprise souhaitée",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Prescription médicale du médecin traitant précisant quotité et durée", "Accord du médecin agréé ou du conseil médical si requis"],
    fields: [
      {
        id: "quotite",
        label: "Quotité de travail thérapeutique prescrite",
        type: "select",
        defaultValue: "50%",
        options: [
          { value: "50%", label: "50 % (reprise à mi-temps)" },
          { value: "60%", label: "60 %" },
          { value: "70%", label: "70 %" },
          { value: "80%", label: "80 %" },
          { value: "90%", label: "90 %" }
        ]
      },
      {
        id: "dateDebut",
        label: "Date de début du temps partiel thérapeutique",
        type: "date",
        defaultValue: "2026-05-01"
      },
      {
        id: "dureeMois",
        label: "Durée prescrite",
        type: "select",
        defaultValue: "3 mois",
        options: [
          { value: "1 mois", label: "1 mois (renouvelable)" },
          { value: "2 mois", label: "2 mois" },
          { value: "3 mois", label: "3 mois (période standard, max 1 an par affection)" }
        ]
      },
      {
        id: "propositionPlanning",
        label: "Proposition de répartition des heures",
        type: "text",
        defaultValue: "Travail tous les matins de 9h à 12h30",
        placeholder: "Ex: Les matins ou 2,5 jours par semaine"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Actuellement ${agent.grade} affecté(e) à la ${agent.direction}, j'ai l'honneur de solliciter votre accord pour bénéficier d'une période de Temps Partiel Thérapeutique (TPT), en application des articles L. 823-1 à L. 823-6 du Code Général de la Fonction Publique et du décret n° 2021-1462 du 8 novembre 2021.

Sur prescription expresse de mon médecin traitant dont vous trouverez l'ordonnance ci-jointe, cette reprise d'activité progressive est de nature à favoriser l'amélioration de mon état de santé et ma réadaptation professionnelle.

Je vous sollicite pour une quotité fixée à ${v.quotite || "50%"}, pour une durée de ${v.dureeMois || "3 mois"}, à effet du ${v.dateDebut ? new Date(v.dateDebut).toLocaleDateString('fr-FR') : "[Date]"}.

Concernant l'organisation de mes plages de présence, je propose la répartition suivante : ${v.propositionPlanning || "travail en matinée"}.

Pendant cette période, conformément à la réglementation, je percevrai l'intégralité de mon traitement indiciaire, du supplément familial de traitement et de l'indemnité de résidence.

Je me tiens à la disposition de la médecine du travail pour tout examen préalable et vous prie d'agréer, Monsieur le Maire, l'expression de ma considération distinguée.`
  },

  {
    id: "courrier_amenagement_poste",
    title: "Demande d'aménagement de poste de travail ou matériel ergonomique",
    category: "sante_securite",
    categoryLabel: "Santé, Poste & Protection",
    icon: "💺",
    cgfpRef: "CGFP Art. L. 812-1 & Code du travail Art. L. 4121-1",
    summary: "Demande d'adaptation ergonomique de l'espace de travail suite à des préconisations médicales ou RQTH.",
    delaiRecommande: "Dès réception des recommandations de la médecine préventive",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: ["Fiche de visite et préconisations du médecin du travail", "Attestation RQTH (Reconnaissance Qualité Travailleur Handicapé) le cas échéant"],
    fields: [
      {
        id: "typeEquipement",
        label: "Équipements ou aménagements sollicités",
        type: "textarea",
        defaultValue: "Siège de bureau ergonomique à maintien lombaire renforcé, repose-pieds réglable et souris verticale ergonomique.",
        placeholder: "Détaillez le matériel préconisé par le médecin..."
      },
      {
        id: "dateVisiteMedecin",
        label: "Date de la visite auprès du médecin de prévention",
        type: "date",
        defaultValue: "2026-03-15"
      },
      {
        id: "impactSante",
        label: "Objectif médical de l'aménagement",
        type: "textarea",
        defaultValue: "Soulager les troubles musculosquelettiques (TMS) récurrents au rachis lombaire et permettre la tenue du poste dans des conditions conformes à ma santé.",
        placeholder: "Ex: Prévention des douleurs cervicales..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Exerçant les fonctions de ${agent.grade} à la ${agent.direction}, je me permets de vous solliciter afin de solliciter la mise en œuvre d'aménagements ergonomiques sur mon poste de travail, conformément à l'obligation générale de sécurité et de protection de la santé physique des agents incombant à l'autorité territoriale (article L. 812-1 du Code Général de la Fonction Publique).

À la suite de ma visite auprès du médecin de prévention en date du ${v.dateVisiteMedecin ? new Date(v.dateVisiteMedecin).toLocaleDateString('fr-FR') : "[Date de la visite]"}, celui-ci a formellement préconisé l'adaptation matérielle de mon poste :
${v.typeEquipement || "Aménagements ergonomiques recommandés"}.

${v.impactSante ? `Ces adaptations sont indispensables pour : ${v.impactSante}` : ""}

Vous trouverez ci-annexée la fiche médicale de préconisations établie par le service de santé au travail.

Je vous remercie par avance de l'attention que vous porterez à cette demande et reste à la disposition du service Santé et Sécurité au Travail (SST) pour tester le matériel adapté.

Je vous prie de recevoir, Monsieur le Maire, mes respectueuses salutations.`
  },

  {
    id: "courrier_visite_medecine_travail",
    title: "Demande de visite médicale auprès de la médecine préventive",
    category: "sante_securite",
    categoryLabel: "Santé, Poste & Protection",
    icon: "🏥",
    cgfpRef: "Décret n° 85-603 Art. 14 à 24 (Hygiène et sécurité FPT)",
    summary: "Demande de consultation auprès du médecin de prévention pour des motifs de santé en lien avec le poste.",
    delaiRecommande: "Dès que l'état de santé le justifie",
    modeEnvoiDefaut: "Voie hiérarchique avec accusé de réception",
    piecesJointesDefaut: [],
    fields: [
      {
        id: "motifVisite",
        label: "Motif de la demande de rendez-vous",
        type: "select",
        defaultValue: "adaptation_poste",
        options: [
          { value: "adaptation_poste", label: "Demande d'adaptation ou d'étude ergonomique du poste de travail" },
          { value: "probleme_sante", label: "Difficultés de santé physiques ou psychologiques en lien avec le service" },
          { value: "visite_reprise", label: "Visite de pré-reprise / reprise après un arrêt maladie prolongé" },
          { value: "exposition_risques", label: "Exposition à des risques professionnels spécifiques ou pénibilité" }
        ]
      },
      {
        id: "precisionsMotif",
        label: "Précisions complémentaires (sans divulgation de secret médical)",
        type: "textarea",
        defaultValue: "Apparition de douleurs physiques récurrentes limitant l'exécution de certaines tâches quotidiennes, nécessitant un avis médical spécialisé sur la compatibilité avec mon poste.",
        placeholder: "Décrivez succinctement la gêne ressentie..."
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Agent au sein de la ${agent.direction} en qualité de ${agent.grade}, j'ai l'honneur de vous demander de bien vouloir organiser une visite médicale auprès du service de médecine préventive communal, conformément aux articles 14 à 24 du décret n° 85-603 du 10 juin 1985 modifié relatif à l'hygiène, à la sécurité et à la médecine préventive dans la fonction publique territoriale.

Cette consultation est sollicitée pour le motif suivant : ${v.motifVisite === 'adaptation_poste' ? "l'adaptation de mes conditions de poste" : v.motifVisite === 'visite_reprise' ? "une visite de reprise ou pré-reprise d'activité" : "des difficultés de santé en lien direct avec le travail"}.

${v.precisionsMotif ? `Éléments de contexte : ${v.precisionsMotif}` : ""}

Cette démarche vise à préserver mon capital santé tout en assurant l'exercice optimal de mes missions de service public.

Je vous remercie de bien vouloir transmettre cette demande au service compétent et vous prie d'agréer, Monsieur le Maire, l'expression de mes respectueuses salutations.`
  },

  {
    id: "courrier_retraite_progressive",
    title: "Demande d'admission à la Retraite Progressive",
    category: "departs_retraite",
    categoryLabel: "Fin de Carrière & Départs",
    icon: "⏳",
    cgfpRef: "CGFP Art. L. 612-14 & Décret n° 2023-751 (Loi Retraites 2023)",
    summary: "Demande d'exercice à temps partiel avec perception concomitante d'une fraction de pension de retraite.",
    delaiRecommande: "Au moins 6 mois avant la date de prise d'effet souhaitée",
    modeEnvoiDefaut: "Lettre recommandée avec avis de réception (LRAR)",
    piecesJointesDefaut: ["Relevé de carrière tous régimes attestant d'au moins 150 trimestres validés", "Formulaire officiel de demande de temps partiel annexé"],
    fields: [
      {
        id: "datePriseEffet",
        label: "Date de prise d'effet de la retraite progressive",
        type: "date",
        defaultValue: "2026-10-01"
      },
      {
        id: "quotiteTempsPartiel",
        label: "Quotité de travail à temps partiel choisie",
        type: "select",
        defaultValue: "60%",
        options: [
          { value: "50%", label: "50 % (retraite servie à hauteur de 50%)" },
          { value: "60%", label: "60 % (retraite servie à hauteur de 40%)" },
          { value: "70%", label: "70 % (retraite servie à hauteur de 30%)" },
          { value: "80%", label: "80 % (retraite servie à hauteur de 20%)" }
        ]
      },
      {
        id: "trimestresValides",
        label: "Nombre total de trimestres validés (minimum 150 requis)",
        type: "number",
        defaultValue: "162",
        placeholder: "Ex: 154"
      }
    ],
    generateBody: (agent, v) => `Monsieur le Maire,

Titulaire du grade de ${agent.grade} affecté(e) à la ${agent.direction}, j'ai l'honneur de vous solliciter afin de bénéficier du dispositif de Retraite Progressive, conformément à l'article L. 612-14 du Code Général de la Fonction Publique et au décret n° 2023-751 du 10 août 2023.

Remplissant les deux conditions légales cumulatives requises, à savoir :
- Avoir atteint l'âge d'ouverture du droit à retraite diminué de deux ans ;
- Justifier d'une durée d'assurance tous régimes confondus d'au moins 150 trimestres (mon relevé ci-joint en attestant ${v.trimestresValides || "150"}).

Je sollicite concomitamment :
1° Une autorisation d'exercice de mes fonctions à temps partiel à raison d'une quotité de ${v.quotiteTempsPartiel || "60%"} ;
2° La transmission de mon dossier à la CNRACL afin de liquider et percevoir la fraction de pension correspondante.

Je souhaite que cette organisation prenne effet à la date du ${v.datePriseEffet ? new Date(v.datePriseEffet).toLocaleDateString('fr-FR') : "[Date d'effet, 1er du mois]"}.

Je vous remercie de bien vouloir faire instruire ma demande avec la plus haute diligence et vous prie d'agréer, Monsieur le Maire, mes respectueuses salutations.`
  }
];

/**
 * Génère le texte brut complet d'un courrier administratif prêt à l'impression
 */
export function generateFullCourrierText(template: CourrierTemplate, agent: AgentProfile, values: Record<string, string>): string {
  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const civiliteAgent = agent.civilite || "Mme";
  const bodyText = template.generateBody(agent, values);

  const modeEnvoi = values._modeEnvoi || template.modeEnvoiDefaut;
  const pjList = template.piecesJointesDefaut.length > 0
    ? `\n\nPJ : ${template.piecesJointesDefaut.join(' ; ')}`
    : "";

  return `${civiliteAgent} ${agent.prenom} ${agent.nom}
${agent.grade}
${agent.direction}${agent.matricule ? `\nMatricule : ${agent.matricule}` : ""}
${agent.adresse}
${agent.codePostal} ${agent.ville}
Tél. : ${agent.telephone} • Courriel : ${agent.email}

                                              ${agent.destinataireTitre}
                                              ${agent.destinataireSousCouvert.split('\n').join('\n                                              ')}
                                              ${agent.destinataireAdresse.split('\n').join('\n                                              ')}

Fait à Gennevilliers, le ${todayFormatted}

Mode d'envoi : ${modeEnvoi}

OBJET : ${template.title}
RÉF. JURIDIQUES : ${template.cgfpRef}

${bodyText}


${agent.prenom} ${agent.nom}
(Signature)
${pjList}`;
}
