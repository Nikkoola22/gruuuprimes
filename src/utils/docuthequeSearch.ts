import { GENNEVILLIERS_DOCUTHEQUE, DocuthequeItem } from '../data/gennevilliersDocutheque';
import { bipIndex, BipFicheIndex } from '../data/bip-index';

export interface RAGSearchResult {
  query: string;
  matchedDocuments: DocuthequeItem[];
  matchedBipFiches?: BipFicheIndex[];
  explanation: string;
  categoryHighlighted?: string;
  keyPoints?: string[];
  suggestedFollowUps?: string[];
}

// Normaliser le texte (suppression des accents, minuscules, ponctuation)
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Règles métier expertes & réponses synthétiques pour les grandes intentions RH
const EXPERT_INTENTIONS_KNOWLEDGE: Array<{
  triggers: string[];
  docIds: string[];
  title: string;
  explanation: string;
  keyPoints: string[];
  suggestedFollowUps: string[];
}> = [
  {
    triggers: [
      "temps partiel", "travailler a temps partiel", "80", "50", "90", "quotite", "mi temps",
      "demande de temps partiel", "passer a temps partiel", "temps partiel de droit", "temps partiel sur autorisation"
    ],
    docIds: ["temps-partiel-de-droit", "temps-partiel-autorisation", "temps-partiel-annualise", "temps-reglement-travail"],
    title: "Modalités du Temps Partiel à la Ville de Gennevilliers",
    explanation: "À Gennevilliers, vous pouvez bénéficier d'un temps partiel selon deux régimes distincts en fonction de votre situation personnelle :",
    keyPoints: [
      "🔹 Temps partiel de DROIT : Accordé obligatoirement (ne peut être refusé) à l'occasion d'une naissance ou adoption (jusqu'aux 3 ans de l'enfant), pour donner des soins à un conjoint/enfant handicapé ou suite à un accident.",
      "🔹 Temps partiel SUR AUTORISATION : Choisi pour convenances personnelles (50 %, 60 %, 70 %, 80 % ou 90 %), soumis à l'accord du chef de service selon les nécessités de service.",
      "🔹 Rémunération : Le 80 % est rémunéré à hauteur de 85,7 % du traitement brut et des primes (surcote avantageuse).",
      "🔹 Agents annualisés (écoles/animation) : Consulter la note spécifique pour le calcul des heures lissées sur l'année."
    ],
    suggestedFollowUps: ["Formulaire temps partiel de droit", "Formulaire temps partiel sur autorisation", "Note agents annualisés", "Congé parental"]
  },
  {
    triggers: [
      "accident de travail", "accident de trajet", "accident de service", "declarer un accident",
      "chute au travail", "blesse au travail", "citis", "certificat initial"
    ],
    docIds: ["sante-procedure-accident-travail", "sante-attestation-accident", "sante-rapport-accident-service", "sante-rapport-accident-trajet"],
    title: "Procédure de déclaration d'un Accident de Service ou de Trajet",
    explanation: "Tout accident survenu sur le lieu de travail ou sur le trajet domicile-travail doit impérativement faire l'objet d'une déclaration dans les délais statutaires :",
    keyPoints: [
      "⏱️ Délai impératif : La déclaration doit être transmise à la DRH dans les 48 heures suivant l'accident.",
      "📋 2 formulaires indispensables : L'attestation sur l'honneur rédigée par la victime + le rapport hiérarchique rédigé par votre responsable.",
      "🏥 Prise en charge intégrale : Fournir le certificat médical initial (volet 1 et 2) du médecin. Les soins et arrêts sont pris en charge à 100 % par la Ville sans jour de carence."
    ],
    suggestedFollowUps: ["Attestation sur l'honneur victime", "Rapport hiérarchique accident service", "Accident de trajet"]
  },
  {
    triggers: [
      "teletravail", "faire du teletravail", "jours de teletravail", "demander le teletravail",
      "ordinateur portable", "kit teletravail", "renouvellement teletravail", "travailler a la maison",
      "materiel teletravail", "indemnite teletravail", "allocation teletravail", "protocole teletravail"
    ],
    docIds: [
      "teletravail-demande-renouvellement-2026",
      "bip_teltra",
      "teltra",
      "teletravail-circulaire-2023",
      "teletravail-protocole",
      "teletravail-prevention-posture",
      "teletravail-procedure",
      "teletravail-aide-decision-agent",
      "teletravail-aide-decision-manager"
    ],
    title: "Dispositif Télétravail & Matériel à Gennevilliers — Protocole Municipal 2026",
    explanation: "Le dispositif municipal de télétravail à la Ville de Gennevilliers permet d'exercer ses missions à distance avec la mise à disposition complète d'un matériel informatique sécurisé :",
    keyPoints: [
      "💻 Formulaire Unique 2026 & Dotation Matériel : Document officiel à remplir pour une première demande ou un renouvellement, incluant la commande de votre pack bureautique (PC portable configuré DSI, écran additionnel, clavier, souris, station d'accueil et sacoche).",
      "📅 Rythme & Organisation : 1 à 2 jours par semaine (jours fixes ou flottants selon l'accord de service) pour préserver la cohésion d'équipe et la continuité du service public.",
      "💶 Allocation forfaitaire télétravail : Indemnisation financière versée sur votre fiche de paie pour couvrir les frais de domicile (électricité, internet, chauffage).",
      "🩺 Prévention santé & Ergonomie : Respect impératif des plages de disponibilité, droit à la déconnexion et bonnes pratiques posturales (kit ergonomique).",
      "⚖️ Circuit de validation : Transmission du formulaire avec avis motivé du responsable de service pour décision finale de la Direction des Ressources Humaines."
    ],
    suggestedFollowUps: [
      "Fiche demande & matériel 2026",
      "Circulaire évolution télétravail",
      "Protocole municipal télétravail",
      "Guide ergonomie & kit posture",
      "Fiche aide décision manager"
    ]
  },
  {
    triggers: [
      "forfait velo", "mobilite durable", "forfait mobilite", "covoiturage", "prime velo", "trottinette",
      "indemnite mobilite", "transport vert"
    ],
    docIds: ["remun-forfait-mobilite-formulaire", "remun-forfait-mobilite-circulaire", "remun-prise-en-charge-transport"],
    title: "Forfait Mobilités Durables (Vélo & Covoiturage)",
    explanation: "La Ville de Gennevilliers encourage les mobilités douces avec le versement du Forfait Mobilités Durables :",
    keyPoints: [
      "🚲 Éligibilité : Utilisation d'un vélo (mécanique ou électrique), trottinette ou covoiturage pour au moins 30 jours de trajet par an.",
      "💰 Montant : Jusqu'à 300 € par an (exonéré d'impôt et de cotisations).",
      "🚆 Cumul : Cumulable avec la prise en charge partielle des abonnements de transport en commun (Pass Navigo)."
    ],
    suggestedFollowUps: ["Formulaire forfait mobilités", "Circulaire barème vélo", "Remboursement Pass Navigo"]
  },
  {
    triggers: [
      "rifseep", "ifse", "cotation ifse", "attribution ifse", "revalorisation ifse", "prime ifse",
      "regime indemnitaire", "groupe de fonctions", "attribution rifseep et cotation ifse", "cotation et attribution ifse", "primes rifseep"
    ],
    docIds: ["remun-guide-rifseep-ifse", "bip_rifseep", "rifseep", "remun-bordereau-heures-sup", "remun-demande-sft"],
    title: "Régime Indemnitaire RIFSEEP & Cotation IFSE — Ville de Gennevilliers",
    explanation: "Le RIFSEEP (Régime Indemnitaire tenant compte des Fonctions, des Sujétions, de l'Expertise et de l'Engagement Professionnel) est le socle indemnitaire principal à la Ville de Gennevilliers :",
    keyPoints: [
      "🏛️ IFSE (Indemnité de Fonctions, de Sujétions et d'Expertise) : Part fixe mensuelle attribuée en fonction du groupe de fonctions auquel est rattaché le poste (responsabilité, technicité, sujétions).",
      "📈 Revalorisation obligatoire : Réexamen statutaire de la cotation au moins tous les 4 ans, ou lors d'un changement de fonctions, d'une mobilité ou d'un avancement de grade.",
      "🏆 Complément CIA : Part variable versée annuellement pour valoriser l'engagement et les résultats lors du CREP.",
      "⚠️ Distinction SFT : Le Supplément Familial de Traitement (SFT) est une prestation distincte liée aux enfants à charge et ne doit pas être confondu avec l'IFSE."
    ],
    suggestedFollowUps: ["Calculateur RIFSEEP (Primes)", "Calculateur CIA", "Guide RIFSEEP & Barème IFSE", "Demande SFT"]
  },
  {
    triggers: [
      "crep", "entretien professionnel", "evaluation", "notation", "recours crep", "guide evaluateur",
      "grille crep", "modele crep"
    ],
    docIds: ["crep-modele-2025", "crep-faq-2025", "crep-guide-evalues-2025", "crep-guide-evaluateurs-2025", "crep-demande-revision-2025"],
    title: "Campagne de l'Entretien Professionnel (CREP 2025)",
    explanation: "L'entretien professionnel annuel permet d'évaluer la valeur professionnelle, d'exprimer ses souhaits de formation et de fixer les objectifs :",
    keyPoints: [
      "📅 Convocation : Doit vous être remise au moins 8 jours francs avant la date de l'entretien.",
      "📝 Modèle officiel : Complété lors de l'échange, signé par le manager et visé par l'agent (qui peut y porter ses observations).",
      "⚖️ Recours : En cas de désaccord persistant, formulaire de demande de révision auprès de l'autorité territoriale puis saisine de la CAP."
    ],
    suggestedFollowUps: ["Modèle CREP officiel", "Guide de l'évalué", "Demande de révision / recours", "Guide évaluateur"]
  },
  {
    triggers: [
      "conges bonifies", "billet dom tom", "cimm", "guadeloupe", "martinique", "reunion", "guyane", "mayotte",
      "vacances dom tom"
    ],
    docIds: ["conges-bonifies-formulaire", "conges-bonifies-circulaire"],
    title: "Dispositif des Congés Bonifiés (Outre-Mer)",
    explanation: "Les agents originaires d'un département ou territoire d'Outre-mer justifiant du CIMM (Centre des Intérêts Matériels et Moraux) peuvent bénéficier d'une prise en charge :",
    keyPoints: [
      "✈️ Périodicité : Tous les 2 ans pour une durée maximale de 31 jours consécutifs de congés.",
      "📁 Dossier complet : Transmettre le formulaire complété accompagné des pièces justifiant des liens familiaux, patrimoniaux ou de naissance."
    ],
    suggestedFollowUps: ["Dossier congés bonifiés", "Circulaire conditions CIMM"]
  },
  {
    triggers: [
      "cet", "compte epargne temps", "verser rtt", "monetiser cet", "jours de conges cet", "fermeture cet"
    ],
    docIds: ["cet-guide-pratique", "cet-formulaire-ouverture-alimentation", "cet-demande-utilisation-conges"],
    title: "Compte Épargne Temps (CET)",
    explanation: "Le CET permet de capitaliser des jours de congés annuels et RTT non pris au 31 décembre :",
    keyPoints: [
      "📥 Alimentation : Campagne annuelle ouverte en fin d'année (formulaire d'ouverture/alimentation).",
      "🏖️ Utilisation : Prise sous forme de congés dès le 1er jour épargné.",
      "💶 Monétisation : Possibilité d'indemnisation financière ou de transfert sur le régime de retraite complémentaire RAFP au-delà de 15 jours épargnés (plafond à 60 jours)."
    ],
    suggestedFollowUps: ["Formulaire ouverture et alimentation CET", "Formulaire prise de congés CET", "Guide pratique CET"]
  },
  {
    triggers: [
      "enfant malade", "garde enfant", "maladie enfant", "presence parentale", "soigner enfant"
    ],
    docIds: ["temps-absence-garde-enfant", "conges-presence-parentale", "temps-partiel-de-droit"],
    title: "Absences pour Enfant Malade & Présence Parentale",
    explanation: "Plusieurs dispositifs vous permettent de vous absenter avec maintien de traitement pour vous occuper de votre enfant :",
    keyPoints: [
      "👶 Garde d'enfant malade : Contingent annuel d'autorisations d'absence rémunérées (6 à 12 jours par an selon situation de famille), sur présentation d'un certificat médical.",
      "🏥 Congé de présence parentale : En cas de maladie ou handicap grave nécessitant des soins contraignants et une présence soutenue.",
      "⏳ Temps partiel de droit : Possibilité de passer à 80 % ou 50 % de droit jusqu'aux 3 ans de l'enfant."
    ],
    suggestedFollowUps: ["Formulaire absence garde d'enfant", "Congé présence parentale", "Temps partiel de droit"]
  },
  {
    triggers: [
      "demission", "quitter la mairie", "partir de la collectivite", "mutation", "changer de mairie", "mobilite externe"
    ],
    docIds: ["demande-demission", "demande-mutation", "disponibilite-discretionnaire", "detachement-discretionnaire"],
    title: "Départ, Démission & Mobilité externe (Mutation)",
    explanation: "Si vous souhaitez quitter la Ville de Gennevilliers ou changer de collectivité, voici les démarches selon votre statut :",
    keyPoints: [
      "🏛️ Mutation externe : Préavis statutaire de 3 mois (pouvant être réduit d'un commun accord). Utiliser le formulaire officiel de mutation.",
      "🚪 Démission : Doit être notifiée par écrit et formellement acceptée par l'autorité territoriale pour produire ses effets.",
      "⏸️ Mise en disponibilité : Permet de mettre sa carrière entre parenthèses sans perdre la qualité de fonctionnaire."
    ],
    suggestedFollowUps: ["Formulaire demande de mutation", "Formulaire demande de démission", "Disponibilité discrétionnaire"]
  },
  {
    triggers: [
      "discipline", "sanction", "avertissement", "blame", "exclusion temporaire", "conseil de discipline", "faute"
    ],
    docIds: ["disciplinaire-procedure-2024", "disciplinaire-convocation-entretien", "disciplinaire-rapport-hierarchique-2024"],
    title: "Procédure Disciplinaire & Droits de la Défense",
    explanation: "La procédure disciplinaire à Gennevilliers garantit le strict respect du principe du contradictoire et des droits de la défense :",
    keyPoints: [
      "🛡️ Droits de l'agent : Information préalable, communication intégrale du dossier individuel, assistance par le défenseur ou syndicat de son choix.",
      "⚖️ Échelle des sanctions : 1er groupe (avertissement, blâme sans saisine du conseil) jusqu'au 4e groupe (révocation, exclusion définitive).",
      "🏛️ Conseil de discipline : Obligatoirement consulté pour toute sanction des groupes 2, 3 et 4."
    ],
    suggestedFollowUps: ["Procédure disciplinaire 2024", "Convocation entretien préalable", "Rapport hiérarchique"]
  }
];

export function searchDocuthequeRAG(rawQuery: string): RAGSearchResult {
  const query = normalizeText(rawQuery);
  const queryTokens = query.split(' ').filter(t => t.length > 2);

  // 1. Détection prioritaire d'une intention experte
  let bestExpertMatch: typeof EXPERT_INTENTIONS_KNOWLEDGE[0] | null = null;
  let highestIntentScore = 0;

  for (const intent of EXPERT_INTENTIONS_KNOWLEDGE) {
    let score = 0;
    for (const trigger of intent.triggers) {
      const normTrigger = normalizeText(trigger);
      if (query === normTrigger || query.includes(normTrigger)) {
        score += 30;
      } else if (normTrigger.includes(query) && query.length >= 6) {
        score += 15;
      } else {
        const triggerTokens = normTrigger.split(' ').filter(t => t.length > 2);
        const matchingTokens = queryTokens.filter(t => triggerTokens.includes(t));
        if (matchingTokens.length >= 2 || (matchingTokens.length === 1 && triggerTokens.length === 1)) {
          score += matchingTokens.length * 5;
        }
      }
    }

    if (score > highestIntentScore && score >= 10) {
      highestIntentScore = score;
      bestExpertMatch = intent;
    }
  }

  // 2. Calcul du score de pertinence pour chaque document
  const scoredDocs: Array<{ doc: DocuthequeItem; score: number }> = GENNEVILLIERS_DOCUTHEQUE.map(doc => {
    let score = 0;
    const normTitle = normalizeText(doc.title);
    const normSummary = normalizeText(doc.summary);
    const normCat = normalizeText(doc.category);
    const normSubCat = normalizeText(doc.subCategory || '');
    const normKeywords = doc.keywords.map(normalizeText);
    const normIntentions = doc.intentions.map(normalizeText);

    // Bonus si le document est explicitement rattaché à l'intention experte
    if (bestExpertMatch && bestExpertMatch.docIds.includes(doc.id)) {
      const indexInIntent = bestExpertMatch.docIds.indexOf(doc.id);
      score += 100 - indexInIntent * 10;
    }

    // Match exact du titre
    if (normTitle.includes(query)) score += 50;

    // Match des intentions types de l'agent
    for (const intention of normIntentions) {
      if (query === intention || query.includes(intention)) {
        score += 40;
      } else {
        const intentTokens = intention.split(' ').filter(t => t.length > 2);
        const matched = queryTokens.filter(t => intentTokens.includes(t));
        if (matched.length >= 2 || (matched.length === 1 && intentTokens.length === 1)) {
          score += matched.length * 8;
        }
      }
    }

    // Match des mots-clés
    for (const kw of normKeywords) {
      if (queryTokens.includes(kw) || (kw.length >= 4 && query.includes(kw))) {
        score += 25;
      }
    }

    // Match dans le résumé et le titre mot à mot
    queryTokens.forEach(token => {
      if (normTitle.includes(token)) score += 10;
      if (normSummary.includes(token)) score += 6;
      if (normCat.includes(token)) score += 4;
      if (normSubCat.includes(token)) score += 5;
    });

    return { doc, score };
  });

  // Trier par score décroissant et filtrer les résultats pertinents
  scoredDocs.sort((a, b) => b.score - a.score);
  const matchedDocuments = scoredDocs
    .filter(item => item.score > 8)
    .slice(0, 8)
    .map(item => item.doc);

  // 2bis. Scoring des fiches BIP
  const scoredBip: Array<{ fiche: BipFicheIndex; score: number }> = bipIndex.map(fiche => {
    let score = 0;
    const normTitre = normalizeText(fiche.titre);
    const normContent = normalizeText((fiche.content || '').slice(0, 1500));
    const normChapitre = normalizeText(fiche.chapitre || '');
    const normSousPartie = normalizeText(fiche.sousPartie || '');
    const normMotsCles = fiche.motsCles.map(normalizeText);

    // Match exact du titre
    if (normTitre.includes(query)) score += 50;

    // Match des mots-clés BIP
    for (const mc of normMotsCles) {
      if (queryTokens.includes(mc) || (mc.length >= 4 && query.includes(mc))) {
        score += 20;
      }
    }

    // Match mot à mot dans titre, contenu, chapitre
    queryTokens.forEach(token => {
      if (normTitre.includes(token)) score += 12;
      if (normContent.includes(token)) score += 6;
      if (normChapitre.includes(token)) score += 4;
      if (normSousPartie.includes(token)) score += 5;
    });

    // Bonus si rattaché à l'intention experte (par code dans docIds)
    if (bestExpertMatch && bestExpertMatch.docIds.some(did => fiche.code === did || fiche.id === did)) {
      score += 80;
    }

    return { fiche, score };
  });

  scoredBip.sort((a, b) => b.score - a.score);
  const uniqueBipMap = new Map<string, BipFicheIndex>();
  for (const item of scoredBip) {
    if (item.score > 10 && !uniqueBipMap.has(item.fiche.code)) {
      uniqueBipMap.set(item.fiche.code, item.fiche);
    }
  }
  const matchedBipFiches = Array.from(uniqueBipMap.values()).slice(0, 4);

  // 3. Synthèse d'explication RAG
  let explanation = '';
  let keyPoints: string[] | undefined;
  let suggestedFollowUps: string[] | undefined;
  let categoryHighlighted: string | undefined;

  if (bestExpertMatch) {
    categoryHighlighted = bestExpertMatch.title;
    explanation = bestExpertMatch.explanation;
    keyPoints = bestExpertMatch.keyPoints;
    suggestedFollowUps = bestExpertMatch.suggestedFollowUps;
  } else if (matchedDocuments.length > 0 || matchedBipFiches.length > 0) {
    const parts: string[] = [];
    if (matchedDocuments.length > 0) {
      const topDoc = matchedDocuments[0];
      categoryHighlighted = topDoc.category;
      parts.push(`📄 ${matchedDocuments.length} document(s) interne(s) trouvé(s) dans la Docuthèque`);
      keyPoints = [
        `📄 Document principal : ${topDoc.title}`,
        `📌 Rubrique : ${topDoc.category}${topDoc.subCategory ? ' > ' + topDoc.subCategory : ''}`,
        `💡 Utilisation : ${topDoc.summary}`
      ];
    }
    if (matchedBipFiches.length > 0) {
      const topBip = matchedBipFiches[0];
      parts.push(`📚 ${matchedBipFiches.length} fiche(s) BIP juridique(s) associée(s)`);
      if (!categoryHighlighted) categoryHighlighted = topBip.chapitre || topBip.section;
      const bipPoints = [
        `📚 Fiche BIP principale : ${topBip.titre} (${topBip.code.toUpperCase()})`,
        `📌 Chapitre : ${topBip.chapitre || topBip.section}${topBip.sousPartie ? ' > ' + topBip.sousPartie : ''}`
      ];
      keyPoints = [...(keyPoints || []), ...bipPoints];
    }
    explanation = `Voici les résultats correspondant à votre demande « ${rawQuery} » : ${parts.join(' — ')}.`;
  } else {
    explanation = `Aucun document exact n'a été trouvé pour la requête « ${rawQuery} ». Vous pouvez reformuler avec des termes comme : temps partiel, accident de travail, congé maladie, forfait vélo, télétravail, CREP, congés bonifiés, CET ou retraite.`;
  }

  return {
    query: rawQuery,
    matchedDocuments,
    matchedBipFiches: matchedBipFiches.length > 0 ? matchedBipFiches : undefined,
    explanation,
    categoryHighlighted,
    keyPoints,
    suggestedFollowUps
  };
}
