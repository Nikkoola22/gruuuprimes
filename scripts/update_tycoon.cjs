const fs = require('fs');

const path = '/Users/nikkoola/Downloads/gruuuprimes-main/src/components/TycoonCollectivite.tsx';
let content = fs.readFileSync(path, 'utf8');

const newEvents = `  {
    id: "greve_nationale",
    title: "Mouvement Social National",
    description: "Une grève nationale paralyse les transports. De nombreux agents ne peuvent pas venir travailler, perturbant fortement les services.",
    icon: AlertTriangle,
    actions: [
      { text: "Tolérance (Absence justifiée)", impact: { budget: 0, agents: +15, elus: -10, service: -20 } },
      { text: "Exiger des jours de congés", impact: { budget: +50, agents: -20, elus: +10, service: -10 } },
      { text: "Mettre en place des navettes privées", impact: { budget: -150, agents: +10, elus: +5, service: +15 } }
    ]
  },
  {
    id: "refonte_rifseep",
    title: "Refonte du RIFSEEP",
    description: "Le Maire veut revoir le régime indemnitaire au mérite. Les syndicats sont vent debout contre l'introduction du CIA.",
    icon: FileText,
    actions: [
      { text: "Passage en force (Vote au Conseil)", impact: { budget: -50, agents: -30, elus: +20, service: -10 } },
      { text: "Concertation longue (Ateliers)", impact: { budget: -20, agents: +10, elus: -15, service: 0 } },
      { text: "Reculer et maintenir l'ancien système", impact: { budget: 0, agents: +20, elus: -25, service: +5 } }
    ]
  },
  {
    id: "bad_buzz_presse",
    title: "Bad Buzz dans la Presse Locale",
    description: "Un article dénonce les conditions de travail au Centre Technique Municipal. Le Maire est furieux et exige des sanctions ou une communication.",
    icon: Newspaper,
    actions: [
      { text: "Sanctionner les agents identifiés", impact: { budget: 0, agents: -30, elus: +15, service: -10 } },
      { text: "Plan d'action Qualité de Vie", impact: { budget: -200, agents: +25, elus: -10, service: +15 } },
      { text: "Démenti officiel du Cabinet", impact: { budget: -50, agents: -15, elus: +20, service: 0 } }
    ]
  },
  {
    id: "nouveau_logiciel",
    title: "Déploiement du Nouveau Logiciel",
    description: "Le nouveau SIRH est en panne le jour de la clôture de la paie. Panique dans les services !",
    icon: Bug,
    actions: [
      { text: "Intervention du prestataire (Urgence)", impact: { budget: -150, agents: -5, elus: +5, service: +10 } },
      { text: "Saisie manuelle nocturne (Heures supp)", impact: { budget: -80, agents: -20, elus: +10, service: 0 } },
      { text: "Repousser la paie d'une semaine", impact: { budget: 0, agents: -35, elus: -20, service: -15 } }
    ]
  },
  {
    id: "fete_personnel",
    title: "Fête Annuelle du Personnel",
    description: "C'est l'heure de la fête du personnel. L'amicale réclame une subvention exceptionnelle pour inviter un groupe de musique.",
    icon: HeartHandshake,
    actions: [
      { text: "Accorder la super subvention", impact: { budget: -100, agents: +25, elus: -5, service: 0 } },
      { text: "Budget standard (Buffet froid)", impact: { budget: -30, agents: +5, elus: +5, service: 0 } },
      { text: "Annuler pour raisons budgétaires", impact: { budget: +50, agents: -30, elus: +15, service: -5 } }
    ]
  },
  {
    id: "harcelement",
    title: "Plainte pour Harcèlement",
    description: "Un agent accuse un cadre très apprécié du Maire de harcèlement moral. L'ambiance est délétère.",
    icon: Gavel,
    actions: [
      { text: "Enquête administrative externe", impact: { budget: -80, agents: +15, elus: -15, service: 0 } },
      { text: "Changer l'agent de service", impact: { budget: -20, agents: -20, elus: +10, service: -5 } },
      { text: "Médiation interne (Rapide)", impact: { budget: 0, agents: -5, elus: +5, service: 0 } }
    ]
  },
  {
    id: "elections_pro",
    title: "Élections Professionnelles (CST)",
    description: "La tension monte avec la campagne électorale syndicale. Les demandes de dispenses d'activité pleuvent.",
    icon: Users,
    actions: [
      { text: "Accorder plus d'heures syndicales", impact: { budget: -50, agents: +20, elus: -10, service: -15 } },
      { text: "Strict respect de la loi (Tensions)", impact: { budget: 0, agents: -15, elus: +15, service: +5 } },
      { text: "Débats organisés sur le temps de travail", impact: { budget: -20, agents: +10, elus: -5, service: -10 } }
    ]
  },
  {
    id: "inspection_travail",
    title: "Visite de l'Inspection du Travail",
    description: "Des manquements graves à la sécurité ont été constatés dans les ateliers municipaux (EPI manquants, machines vétustes).",
    icon: AlertTriangle,
    actions: [
      { text: "Achat massif d'EPI et rénovation", impact: { budget: -250, agents: +15, elus: -10, service: +10 } },
      { text: "Fermeture partielle de l'atelier", impact: { budget: 0, agents: -10, elus: -15, service: -25 } },
      { text: "Plan de conformité étalé sur 2 ans", impact: { budget: -80, agents: 0, elus: +5, service: -5 } }
    ]
  },
  {
    id: "fusion_services",
    title: "Fusion de Services",
    description: "Le DGS décide de fusionner le service Culture et le service Sport. Les équipes refusent de travailler ensemble.",
    icon: Briefcase,
    actions: [
      { text: "Séminaire de cohésion (Coûteux)", impact: { budget: -120, agents: +15, elus: -5, service: +10 } },
      { text: "Imposer la nouvelle hiérarchie", impact: { budget: 0, agents: -25, elus: +15, service: -10 } },
      { text: "Accorder des primes de réorganisation", impact: { budget: -150, agents: +20, elus: -10, service: +5 } }
    ]
  },
  {
    id: "prime_inflation",
    title: "Prime de Pouvoir d'Achat",
    description: "Avec l'inflation, les syndicats réclament le versement de la prime exceptionnelle de pouvoir d'achat.",
    icon: Landmark,
    actions: [
      { text: "Verser le montant maximum à tous", impact: { budget: -350, agents: +35, elus: -15, service: +5 } },
      { text: "Verser un montant modulé (Minima)", impact: { budget: -150, agents: +10, elus: +10, service: 0 } },
      { text: "Refuser (Pas d'obligation légale)", impact: { budget: 0, agents: -35, elus: +20, service: -5 } }
    ]
  },
  {
    id: "sobriete_energetique",
    title: "Plan de Sobriété Énergétique",
    description: "Chauffage baissé à 19°C dans les bureaux. Les agents viennent avec des plaids et se plaignent d'être malades.",
    icon: Droplets,
    actions: [
      { text: "Acheter des polaires logotées", impact: { budget: -60, agents: +15, elus: +10, service: 0 } },
      { text: "Tolérer les radiateurs d'appoint", impact: { budget: -40, agents: +20, elus: -15, service: 0 } },
      { text: "Rappel à l'ordre strict", impact: { budget: 0, agents: -20, elus: +5, service: -5 } }
    ]
  },
  {
    id: "jo_2024",
    title: "Préparation des Jeux Olympiques",
    description: "La ville accueille des épreuves. Les congés d'été sont interdits pour la police municipale et les techniques.",
    icon: Trophy,
    actions: [
      { text: "Prime JO très généreuse", impact: { budget: -300, agents: +25, elus: +10, service: +20 } },
      { text: "Compensation en repos (CET)", impact: { budget: -50, agents: -5, elus: +15, service: +10 } },
      { text: "Refuser toute compensation", impact: { budget: 0, agents: -40, elus: -20, service: -20 } }
    ]
  }
];`;

content = content.replace('  }\n];', '  },\n' + newEvents);

// Update logic to 24 months
content = content.replace('.slice(0, 12);', '.slice(0, 24);');
content = content.replace('if (month >= 12)', 'if (month >= 24)');
content = content.replace('Mois ${month} / 12', 'Mois ${month} / 24');
content = content.replace('Mois {month} / 12', 'Mois {month} / 24');
content = content.replace('[...Array(12)].map', '[...Array(24)].map');
content = content.replace('1 an (12 tours)', '2 ans (24 tours)');
content = content.replace('12 mois de gestion', '24 mois de gestion');

fs.writeFileSync(path, content);
console.log('Success');
