import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Building2, Users, Landmark, HeartHandshake,
  TrendingUp, TrendingDown, Play, AlertTriangle, Trophy,
  FileText, CheckCircle2, XCircle, RotateCcw, Briefcase, Gavel, Newspaper, Megaphone, Clock, Droplets, Bug, Sparkles, ShieldAlert
} from 'lucide-react';

interface TycoonProps {
  onClose: () => void;
}

interface Action {
  text: string;
  impact: {
    budget: number; // in k€
    agents: number; // in %
    elus: number;   // in %
    service: number;// in %
  };
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
  actions: Action[];
}const ALL_EVENTS: GameEvent[] = [
  {
    id: "police_municipale",
    title: "Crise Sécuritaire",
    description: "Le Maire exige le recrutement immédiat de 5 agents de Police Municipale suite à des incivilités, mais le budget n'était pas prévu.",
    icon: ShieldAlert,
    image: "/images/tycoon/tycoon_police.png",
    actions: [
      { text: "Recruter des contractuels (Rapide)", impact: { budget: -150, agents: -5, elus: +15, service: +10 } },
      { text: "Ouvrir un concours (Lent)", impact: { budget: -80, agents: +5, elus: -10, service: +5 } },
      { text: "Refuser (Pas de budget)", impact: { budget: 0, agents: 0, elus: -20, service: -15 } }
    ]
  },
  {
    id: "greve_cantine",
    title: "Préavis de Grève - Cantines",
    description: "Les agents des cantines scolaires menacent de faire grève si le RIFSEEP n'est pas réévalué. Les parents d'élèves font pression sur les élus.",
    icon: Users,
    image: "/images/tycoon/tycoon_strike.png",
    actions: [
      { text: "Augmenter le RIFSEEP (+200k€)", impact: { budget: -200, agents: +20, elus: +5, service: +15 } },
      { text: "Négocier une prime exceptionnelle", impact: { budget: -80, agents: +5, elus: 0, service: 0 } },
      { text: "Tenir bon face à la grève", impact: { budget: 0, agents: -20, elus: -10, service: -25 } }
    ]
  },
  {
    id: "pic_maladie",
    title: "Pic Hivernal d'Arrêts Maladie",
    description: "L'épidémie de grippe décime le service de l'État Civil. La file d'attente s'allonge et la qualité du service public s'effondre.",
    icon: HeartHandshake,
    image: "/images/tycoon/tycoon_health.png",
    actions: [
      { text: "Prestations intérimaires", impact: { budget: -100, agents: -5, elus: +5, service: +20 } },
      { text: "Heures supplémentaires pour les présents", impact: { budget: -60, agents: -15, elus: +5, service: +10 } },
      { text: "Fermer temporairement les annexes", impact: { budget: 0, agents: +5, elus: -15, service: -20 } }
    ]
  },
  {
    id: "reforme_retraite",
    title: "Vague de Départs à la Retraite",
    description: "Un service entier d'urbanisme voit ses cadres partir à la retraite d'un coup. La perte d'expertise est critique.",
    icon: Landmark,
    image: "/images/tycoon/tycoon_retirement.png",
    actions: [
      { text: "Plan de tuilage (Doublons sur 6 mois)", impact: { budget: -250, agents: +15, elus: +10, service: +15 } },
      { text: "Promotions internes accélérées", impact: { budget: -50, agents: +20, elus: -5, service: -10 } },
      { text: "Remplacer au fur et à mesure", impact: { budget: +50, agents: -15, elus: 0, service: -20 } }
    ]
  },
  {
    id: "informatique_hack",
    title: "Cyberattaque sur le SIRH",
    description: "Le logiciel de paie est paralysé par un ransomware. Les agents s'inquiètent pour leur salaire du mois.",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_hack.png",
    actions: [
      { text: "Payer la rançon (Illégal !)", impact: { budget: -300, agents: +10, elus: -30, service: +5 } },
      { text: "Cellule de crise RH avec heures supp'", impact: { budget: -120, agents: -10, elus: +10, service: 0 } },
      { text: "Paie forfaitaire en urgence", impact: { budget: 0, agents: -20, elus: -5, service: -10 } }
    ]
  },
  {
    id: "canicule",
    title: "Alerte Canicule",
    description: "Les températures explosent. Les syndicats demandent l'adaptation des horaires et l'installation de climatiseurs.",
    icon: Building2,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Achat de clims & horaires d'été", impact: { budget: -150, agents: +25, elus: +5, service: +5 } },
      { text: "Télétravail massif exceptionnel", impact: { budget: 0, agents: +15, elus: -10, service: -5 } },
      { text: "Distribution de bouteilles d'eau", impact: { budget: -10, agents: -20, elus: 0, service: 0 } }
    ]
  },
  {
    id: "elections",
    title: "Approche des Élections",
    description: "Les élections municipales ont lieu l'année prochaine. Le Maire exige que la satisfaction publique et la sienne soient au plus haut, coûte que coûte.",
    icon: Megaphone,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Gel des impôts & Titularisations massives", impact: { budget: -400, agents: +25, elus: +30, service: +10 } },
      { text: "Petites primes électoralistes", impact: { budget: -100, agents: +10, elus: +15, service: 0 } },
      { text: "Ignorer la pression politique", impact: { budget: +50, agents: -5, elus: -35, service: 0 } }
    ]
  },
  {
    id: "audit",
    title: "Audit de la Chambre Régionale des Comptes",
    description: "La Chambre Régionale pointe du doigt la masse salariale excessive de la commune. Vous devez trouver des économies.",
    icon: Gavel,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Non-renouvellement de 20 contractuels", impact: { budget: +300, agents: -25, elus: +10, service: -15 } },
      { text: "Gel du point d'indice (localement)", impact: { budget: +150, agents: -30, elus: +5, service: 0 } },
      { text: "Défendre le modèle social actuel", impact: { budget: 0, agents: +15, elus: -20, service: 0 } }
    ]
  },
  {
    id: "demissions",
    title: "Hémorragie des Talents",
    description: "Les ingénieurs du service informatique démissionnent un par un pour le secteur privé, attirés par de meilleurs salaires.",
    icon: Briefcase,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Aligner les salaires (Contrats de projet)", impact: { budget: -200, agents: +5, elus: -10, service: +20 } },
      { text: "Embaucher des profils juniors", impact: { budget: -50, agents: 0, elus: +5, service: -15 } },
      { text: "Externaliser le service (Presta)", impact: { budget: -250, agents: -15, elus: +10, service: +5 } }
    ]
  },
  {
    id: "nouveau_decret",
    title: "Nouveau Décret Gouvernemental",
    description: "L'État impose une nouvelle prime obligatoire (Ségur, etc.) pour une partie de vos agents. Ce n'était pas budgété.",
    icon: Newspaper,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Appliquer immédiatement (Emprunt)", impact: { budget: -250, agents: +25, elus: -10, service: 0 } },
      { text: "Lisser l'application sur 3 ans", impact: { budget: -80, agents: -10, elus: +5, service: 0 } },
      { text: "Attendre les recours juridiques", impact: { budget: 0, agents: -25, elus: -15, service: -5 } }
    ]
  },
  {
    id: "heures_supp",
    title: "Dépassement du Plafond d'Heures Supp",
    description: "Les agents de la voirie ont explosé leur quota d'heures supplémentaires à cause des récentes intempéries. Ils exigent d'être payés.",
    icon: Clock,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Payer toutes les heures majorées", impact: { budget: -180, agents: +20, elus: -5, service: +5 } },
      { text: "Placer en récupération obligatoire", impact: { budget: 0, agents: -10, elus: +5, service: -20 } },
      { text: "Refuser le paiement (Non autorisé)", impact: { budget: +50, agents: -35, elus: -10, service: -10 } }
    ]
  },
  {
    id: "visite_ministre",
    title: "Visite Ministérielle Surprise",
    description: "Un Ministre vient inaugurer la nouvelle crèche dans 48h. Le Maire veut que tout le personnel soit mobilisé pour que tout soit parfait.",
    icon: Trophy,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Mobilisation générale avec primes", impact: { budget: -100, agents: +10, elus: +25, service: +15 } },
      { text: "Réquisition sans contrepartie", impact: { budget: 0, agents: -25, elus: +20, service: +5 } },
      { text: "Maintenir l'organisation normale", impact: { budget: 0, agents: +5, elus: -30, service: -5 } }
    ]
  },
  {
    id: "punaises_lit",
    title: "Invasion de Punaises de Lit",
    description: "Les bureaux de l'Action Sociale sont infestés. Les agents exercent leur droit de retrait et le public ne peut plus être reçu.",
    icon: Bug,
    image: "/images/tycoon/tycoon_pest.png",
    actions: [
      { text: "Fermeture & Traitement d'urgence", impact: { budget: -120, agents: +15, elus: -5, service: -15 } },
      { text: "Reloger le service (Location modulaire)", impact: { budget: -200, agents: +10, elus: +5, service: +10 } },
      { text: "Ignorer (Demander aux agents de rester)", impact: { budget: 0, agents: -40, elus: -15, service: -30 } }
    ]
  },
  {
    id: "inondations",
    title: "Inondations dans les Écoles",
    description: "De violents orages ont inondé 3 écoles. Il faut nettoyer en urgence avant la rentrée scolaire de lundi !",
    icon: Droplets,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Appel à une société de nettoyage privée", impact: { budget: -250, agents: 0, elus: +15, service: +20 } },
      { text: "Mobiliser les agents techniques en week-end", impact: { budget: -80, agents: -20, elus: +10, service: +15 } },
      { text: "Repousser la rentrée scolaire", impact: { budget: 0, agents: +10, elus: -25, service: -30 } }
    ]
  },
  {
    id: "greve_nationale",
    title: "Mouvement Social National",
    description: "Une grève nationale paralyse les transports. De nombreux agents ne peuvent pas venir travailler, perturbant fortement les services.",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_strike.png",
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
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Passage en force (Vote au Conseil)", impact: { budget: -50, agents: -30, elus: +20, service: -10 } },
      { text: "Concertation longue (Ateliers)", impact: { budget: -20, agents: +10, elus: -15, service: 0 } },
      { text: "Reculer et maintenir l'ancien système", impact: { budget: 0, agents: +20, elus: -25, service: +5 } }
    ]
  },
  {
    id: "panne_chauffage",
    title: "Panne de Chauffage Écoles & Crèches",
    description: "En plein hiver, le système de chauffage central des écoles du Luth et des crèches s'effondre. Température : 12°C dans les classes !",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Intervention d'urgence & Radiateurs d'appoint", impact: { budget: -140, agents: +15, elus: +10, service: +10 } },
      { text: "Fermeture administrative 48h & Accueil dégradé", impact: { budget: -30, agents: +5, elus: -15, service: -25 } },
      { text: "Réquisition des agents techniques sans moyens", impact: { budget: 0, agents: -30, elus: -5, service: -10 } }
    ]
  },
  {
    id: "jo_passage",
    title: "Grand Événement Métropolitain",
    description: "Gennevilliers accueille une étape majeure du parcours sportif départemental. Sécurité, logistique et accueil du public nécessitent une mobilisation éclair.",
    icon: Trophy,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Plan de mobilisation générale et primes d'événement", impact: { budget: -180, agents: +15, elus: +25, service: +15 } },
      { text: "Partenariat associatif et bénévoles encadrés", impact: { budget: -60, agents: +5, elus: +10, service: +5 } },
      { text: "Service minimum par manque de budget", impact: { budget: 0, agents: -10, elus: -25, service: -20 } }
    ]
  },
  {
    id: "creche_petite_enfance",
    title: "Pénurie d'Auxiliaires de Puériculture",
    description: "Le secteur de la Petite Enfance peine à recruter. 3 sections de crèches risquent de fermer faute de personnel diplômé.",
    icon: HeartHandshake,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Revalorisation RIFSEEP filière Petite Enfance", impact: { budget: -160, agents: +25, elus: +15, service: +20 } },
      { text: "Recrutement d'intérimaires qualifiés", impact: { budget: -110, agents: -5, elus: +5, service: +10 } },
      { text: "Réduire les capacités d'accueil", impact: { budget: 0, agents: -15, elus: -25, service: -30 } }
    ]
  },
  {
    id: "amiante_mediatheque",
    title: "Diagnostic Amiante Positif",
    description: "Des traces d'amiante sont détectées lors de travaux à la Médiathèque. Le personnel et le public doivent être évacués en urgence.",
    icon: ShieldAlert,
    image: "/images/tycoon/tycoon_pest.png",
    actions: [
      { text: "Désamiantage immédiat & Relocalisation provisoire", impact: { budget: -220, agents: +15, elus: +5, service: +5 } },
      { text: "Fermeture prolongée & Médiathèque hors-les-murs", impact: { budget: -70, agents: +10, elus: -10, service: -15 } },
      { text: "Confinement partiel sans fermeture", impact: { budget: 0, agents: -35, elus: -20, service: -10 } }
    ]
  },
  {
    id: "budget_participatif",
    title: "Engouement du Budget Participatif",
    description: "Les habitants de Gennevilliers ont voté massivement pour des projets citoyens (jardins partagés, mobilier urbain). Mais la mise en œuvre surcharge les services techniques.",
    icon: Sparkles,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Renforcer les équipes techniques (Renforts 6 mois)", impact: { budget: -130, agents: +15, elus: +20, service: +20 } },
      { text: "Étalement des projets sur 2 ans", impact: { budget: -40, agents: +5, elus: -10, service: 0 } },
      { text: "Demander aux agents d'absorber la charge", impact: { budget: 0, agents: -25, elus: +10, service: -15 } }
    ]
  },
  {
    id: "flotte_electrique",
    title: "Transition Écologique de la Flotte",
    description: "La ZFE (Zone à Faibles Émissions) impose le renouvellement des véhicules municipaux thermiques par des véhicules électriques.",
    icon: Landmark,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Achat groupé de véhicules électriques & Bornes", impact: { budget: -280, agents: +10, elus: +20, service: +10 } },
      { text: "Passage au Car-sharing / Autopartage municipal", impact: { budget: -120, agents: -5, elus: +10, service: +5 } },
      { text: "Demander une dérogation exceptionnelle (Report)", impact: { budget: 0, agents: 0, elus: -15, service: -10 } }
    ]
  },
  {
    id: "manifestation_logement",
    title: "Tensions autour du Logement Social",
    description: "Des associations d'habitants occupent le parvis de la Mairie pour demander l'attribution accélérée de logements sociaux et la rénovation des résidences.",
    icon: Users,
    image: "/images/tycoon/tycoon_strike.png",
    actions: [
      { text: "Table ronde & Plan Urgence Réhabilitation", impact: { budget: -190, agents: +10, elus: +20, service: +15 } },
      { text: "Médiation sociale & Permanences renforcées", impact: { budget: -50, agents: -5, elus: +5, service: +5 } },
      { text: "Fermeture des guichets d'accueil du public", impact: { budget: 0, agents: -20, elus: -30, service: -25 } }
    ]
  },
  {
    id: "festival_culturel",
    title: "Festival des Cultures Urbaines",
    description: "La Ville prépare son grand festival annuel. L'équipe culturelle souhaite inviter des artistes renommés, mais le budget prévisionnel est dépassé.",
    icon: Sparkles,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Accorder la rallonge budgétaire", impact: { budget: -160, agents: +20, elus: +25, service: +15 } },
      { text: "Rechercher des mécènes & Sponsors privés", impact: { budget: -50, agents: +5, elus: +10, service: +10 } },
      { text: "Réduire le programme à la scène locale", impact: { budget: +30, agents: -10, elus: -15, service: -10 } }
    ]
  },
  {
    id: "audit_egalite_pro",
    title: "Index Égalité Professionnelle RH",
    description: "Un diagnostic RH révèle des écarts de rémunération et de promotion entre femmes et hommes au sein de la collectivité.",
    icon: FileText,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Plan d'action & Rattrapage salarial ciblé", impact: { budget: -150, agents: +30, elus: +15, service: +10 } },
      { text: "Formation obligatoire des managers aux discriminations", impact: { budget: -40, agents: +10, elus: +5, service: +5 } },
      { text: "Simple déclaration d'intention sans budget", impact: { budget: 0, agents: -25, elus: -20, service: 0 } }
    ]
  },
  {
    id: "pietonnisation_ecoles",
    title: "Sécurisation des Abords d'Écoles",
    description: "Des parents d'élèves réclament des rues aux écoles piétonnes et la présence d'ASVP aux heures de pointe pour éviter les accidents.",
    icon: ShieldAlert,
    image: "/images/tycoon/tycoon_police.png",
    actions: [
      { text: "Aménagements urbains définitifs & Agent dédié", impact: { budget: -170, agents: +10, elus: +20, service: +20 } },
      { text: "Recours aux volontaires du Service Civique", impact: { budget: -40, agents: +5, elus: +5, service: +10 } },
      { text: "Laisser la situation en l'état", impact: { budget: 0, agents: -15, elus: -25, service: -20 } }
    ]
  }
];

const TycoonCollectivite: React.FC<TycoonProps> = ({ onClose }) => {
  // Game State
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover" | "victory">("menu");

  // Gauges
  const [budget, setBudget] = useState(1000); // k€
  const [agentsSat, setAgentsSat] = useState(60); // %
  const [elusSat, setElusSat] = useState(60); // %
  const [servicePub, setServicePub] = useState(70); // %

  const [month, setMonth] = useState(1);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventPool, setEventPool] = useState<GameEvent[]>([]);
  const [log, setLog] = useState<{ month: number, text: string, type: "good" | "bad" | "neutral" }[]>([]);
  const [failReason, setFailReason] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState === "playing" && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [currentEvent, gameState]);

  const initGame = () => {
    setBudget(1000);
    setAgentsSat(60);
    setElusSat(60);
    setServicePub(70);
    setMonth(1);
    setLog([]);

    let pool: GameEvent[] = [];
    while (pool.length < 24) {
      const shuffled = [...ALL_EVENTS].sort(() => Math.random() - 0.5);
      pool = [...pool, ...shuffled];
    }
    pool = pool.slice(0, 24);
    setEventPool(pool);
    setCurrentEvent(pool[0]);

    setGameState("playing");
  };

  // Réduction de 10% des conséquences des actions pour faciliter le jeu (1.5 -> 1.35)
  const IMPACT_MULTIPLIER = 1.35;

  const handleAction = (action: Action) => {
    const multipliedBudget = Math.round(action.impact.budget * IMPACT_MULTIPLIER);
    const multipliedAgents = Math.round(action.impact.agents * IMPACT_MULTIPLIER);
    const multipliedElus = Math.round(action.impact.elus * IMPACT_MULTIPLIER);
    const multipliedService = Math.round(action.impact.service * IMPACT_MULTIPLIER);

    const newBudget = budget + multipliedBudget;
    const newAgents = Math.min(100, Math.max(0, agentsSat + multipliedAgents));
    const newElus = Math.min(100, Math.max(0, elusSat + multipliedElus));
    const newService = Math.min(100, Math.max(0, servicePub + multipliedService));

    setBudget(newBudget);
    setAgentsSat(newAgents);
    setElusSat(newElus);
    setServicePub(newService);

    // Logging
    const impactText = `Mois ${month} : Action choisie - "${action.text}"`;
    const logType = (multipliedAgents > 0 || multipliedService > 0) ? "good" : (multipliedAgents < 0 || multipliedService < 0) ? "bad" : "neutral";
    setLog(prev => [{ month, text: impactText, type: logType }, ...prev]);

    // Check Game Over Conditions
    if (newBudget < 0) {
      setFailReason("Mise sous tutelle de la préfecture (Budget épuisé).");
      setGameState("gameover");
      return;
    }
    if (newAgents <= 0) {
      setFailReason("Grève générale illimitée. Le service RH est assiégé par les agents.");
      setGameState("gameover");
      return;
    }
    if (newElus <= 0) {
      setFailReason("Désaveu politique total du Conseil Municipal. Vous êtes révoqué(e) de vos fonctions.");
      setGameState("gameover");
      return;
    }
    if (newService <= 0) {
      setFailReason("Rupture totale du service public. Les administrés manifestent sous les fenêtres de la Mairie.");
      setGameState("gameover");
      return;
    }

    // Next Month
    if (month >= 24) {
      setGameState("victory");
    } else {
      const nextM = month + 1;
      setMonth(nextM);
      if (nextM === 13) {
        setBudget(b => b + 500);
        setLog(prev => [{ month: 12, text: "🎁 Dotation Globale de Fonctionnement Annuelle : +500 k€ injectés dans le budget !", type: "good" }, ...prev]);
      }
      setCurrentEvent(eventPool[month]);
    }
  };

  const GaugeCard = ({ title, value, icon: Icon, colorClass, borderGlow, type }: { title: string, value: number, icon: any, colorClass: string, borderGlow: string, type: "currency" | "percent" }) => {
    const isCritical = type === "percent" ? value <= 20 : value <= 200;

    const getStatusBadge = () => {
      if (type === "percent") {
        if (value >= 75) return { label: "EXCELLENT 🌟", bg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" };
        if (value >= 40) return { label: "ÉQUILIBRÉ ⚖️", bg: "bg-blue-500/20 border-blue-500/40 text-blue-300" };
        if (value > 20) return { label: "ATTENTION ⚠️", bg: "bg-amber-500/20 border-amber-500/40 text-amber-300" };
        return { label: "CRITIQUE 🚨", bg: "bg-rose-500/30 border-rose-500/60 text-rose-300 animate-pulse" };
      } else {
        if (value >= 600) return { label: "ROBUSTE 💰", bg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" };
        if (value >= 250) return { label: "STABLE 📊", bg: "bg-blue-500/20 border-blue-500/40 text-blue-300" };
        if (value > 0) return { label: "TENDU ⚠️", bg: "bg-amber-500/20 border-amber-500/40 text-amber-300" };
        return { label: "FAILLITE 🚨", bg: "bg-rose-500/30 border-rose-500/60 text-rose-300 animate-pulse" };
      }
    };

    const status = getStatusBadge();

    return (
      <div className={`bg-slate-900/80 backdrop-blur-xl border-2 ${isCritical ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse' : `border-slate-800 ${borderGlow}`} rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl transition-all duration-300`}>
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
          </div>

          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${status.bg}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-baseline justify-between w-full mb-2">
          <span className={`text-3xl font-black tracking-tight ${colorClass}`}>
            {value}{type === "percent" ? "%" : " k€"}
          </span>
        </div>

        {type === "percent" && (
          <div className="w-full bg-slate-950/90 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full ${value > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : value > 20 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'} transition-all duration-700 ease-out`}
              style={{ width: `${value}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative z-30 isolate min-h-screen flex flex-col pt-4 sm:pt-6 pb-8 bg-slate-950 font-sans text-slate-100 select-none">

      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[160px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full px-4 flex flex-col h-full">

        {/* Header Bar */}
        <div className="w-full flex justify-between items-center mb-6 z-20 flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-full font-bold transition-all text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" /> Quitter
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                Gennevilliers City
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 font-mono tracking-widest uppercase">
                Ma Collectivité • Directrice Générale des Services
              </p>
            </div>
          </div>

          <div className="px-5 py-2 bg-slate-900/90 border border-amber-500/30 rounded-full font-mono font-black text-amber-400 text-xs sm:text-sm shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            {gameState === "playing" ? `MOIS ${month} / 24` : "BILAN MANDAT"}
          </div>
        </div>

        {/* Menu Screen */}
        {gameState === "menu" && (
          <div className="flex-1 flex items-center justify-center min-h-[65vh]">
            <div className="bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-500/30 p-8 sm:p-12 rounded-3xl text-center max-w-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] animate-fade-in relative overflow-hidden">
              <div className="w-24 h-24 bg-amber-500/20 border border-amber-400/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.4)] transform -rotate-3 hover:rotate-0 transition-transform">
                <Landmark className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              </div>

              <span className="inline-block bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs uppercase px-4 py-1.5 rounded-full font-bold mb-4">
                SIMULATION DE GESTION MUNICIPALE 🏛️
              </span>

              <h2 className="text-3xl sm:text-5xl font-black mb-4 text-white uppercase tracking-tight">
                Prenez les commandes de la Ville
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mb-8 font-medium leading-relaxed max-w-xl mx-auto">
                Vous disposez de <strong>24 mois (2 ans)</strong> pour équilibrer les finances publiques, apaiser les revendications syndicales, satisfaire l'équipe municipale et maintenir la continuité du service public !
              </p>

              <button
                onClick={initGame}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-full text-base sm:text-lg shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" /> Prendre ses fonctions
              </button>
            </div>
          </div>
        )}

        {/* End Screens */}
        {(gameState === "gameover" || gameState === "victory") && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <div className={`bg-slate-900/90 backdrop-blur-2xl border-2 ${gameState === 'victory' ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]'} p-8 sm:p-12 rounded-3xl text-center max-w-xl shadow-2xl animate-fade-in`}>
              {gameState === "victory" ? (
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
              ) : (
                <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-4" />
              )}

              <h2 className="text-3xl sm:text-4xl font-black mb-2 uppercase tracking-wide">
                {gameState === "victory" ? "Année Clôturée avec Succès !" : "Révocation de Poste !"}
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mb-6 font-medium">
                {gameState === "victory" ? "Félicitations ! Vous avez traversé 24 mois de crise RH, de négociations et d'arbitrages statutaires en conservant la confiance de tous !" : failReason}
              </p>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-8 text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center border-b border-slate-800 pb-2 font-mono">
                  Bilan Officiel du Mandat
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`p-3 rounded-xl border ${budget <= 0 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Budget Restant</span>
                    <span className={`font-black text-xl ${budget <= 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}`}>{budget} k€</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${agentsSat <= 0 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Agents</span>
                    <span className={`font-black text-xl ${agentsSat <= 0 ? 'text-rose-400 font-mono' : 'text-blue-400 font-mono'}`}>{agentsSat}%</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${elusSat <= 0 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Élus</span>
                    <span className={`font-black text-xl ${elusSat <= 0 ? 'text-rose-400 font-mono' : 'text-purple-400 font-mono'}`}>{elusSat}%</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${servicePub <= 0 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Service Public</span>
                    <span className={`font-black text-xl ${servicePub <= 0 ? 'text-rose-400 font-mono' : 'text-rose-400 font-mono'}`}>{servicePub}%</span>
                  </div>
                </div>

                {gameState === "gameover" && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-300 text-xs leading-relaxed">
                    <span className="font-bold block mb-1">🔴 Motif de la décision :</span>
                    {failReason}
                  </div>
                )}
              </div>

              <button
                onClick={initGame}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full shadow-xl transition-all flex items-center gap-2 mx-auto uppercase text-xs tracking-wider"
              >
                <RotateCcw className="w-4 h-4" /> Solliciter un nouveau mandat
              </button>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === "playing" && currentEvent && (
          <div className="flex flex-col gap-6 w-full animate-fade-in">

            {/* Top Timeline Progression Bar */}
            <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-3xl shadow-lg">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest px-1 font-mono">
                <span>Prise de poste</span>
                <span className="text-amber-400 font-black">Mois {month} / 24</span>
                <span>Bilan Annuel</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner flex">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 border-r border-slate-950 last:border-0 transition-all duration-500 ${i < month ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-transparent'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-col lg:flex-row items-start gap-6">

              {/* Event Card */}
              <div className="flex-[2] bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full">
                <div className="relative z-10">

                  {/* Event Title Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-mono">Dossier Arbitrage RH</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{currentEvent.title}</h2>
                    </div>
                  </div>

                  {/* Event Banner Image */}
                  {currentEvent.image && (
                    <div className="w-full h-48 sm:h-56 mb-6 rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
                      <img
                        src={currentEvent.image}
                        alt={currentEvent.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-xs font-bold text-amber-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/30">
                        <span>🏛️ Ville de Gennevilliers</span>
                        <span>Mois {month}</span>
                      </div>
                    </div>
                  )}

                  {/* Event Description */}
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-inner">
                    {currentEvent.description}
                  </p>

                  {/* Actions List */}
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 font-mono">Options de Décision</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {currentEvent.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action)}
                        className="group flex flex-col justify-between w-full p-4 sm:p-5 bg-slate-950/90 hover:bg-slate-800/90 border-2 border-slate-800 hover:border-amber-400/60 rounded-2xl transition-all text-left shadow-lg relative overflow-hidden active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                          <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-xs shadow-inner">
                            {idx + 1}
                          </div>
                          <span className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                            {action.text}
                          </span>
                        </div>

                        {/* Impact Badges */}
                        {(() => {
                          const multBudget = Math.round(action.impact.budget * IMPACT_MULTIPLIER);
                          const multAgents = Math.round(action.impact.agents * IMPACT_MULTIPLIER);
                          const multElus = Math.round(action.impact.elus * IMPACT_MULTIPLIER);
                          const multService = Math.round(action.impact.service * IMPACT_MULTIPLIER);

                          return (
                            <div className="flex flex-wrap gap-2 text-xs font-bold relative z-10 w-full bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                              {multBudget !== 0 && (
                                <div className={`flex-1 min-w-[85px] flex justify-center items-center px-2.5 py-1 rounded-lg border ${multBudget > 0 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'}`}>
                                  {multBudget > 0 ? '+' : ''}{multBudget}k€
                                </div>
                              )}
                              {multAgents !== 0 && (
                                <div className={`flex-1 min-w-[85px] flex justify-center items-center px-2.5 py-1 rounded-lg border ${multAgents > 0 ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'} flex items-center gap-1`}>
                                  {multAgents > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  <span>Agents</span>
                                </div>
                              )}
                              {multElus !== 0 && (
                                <div className={`flex-1 min-w-[85px] flex justify-center items-center px-2.5 py-1 rounded-lg border ${multElus > 0 ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'} flex items-center gap-1`}>
                                  {multElus > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  <span>Élus</span>
                                </div>
                              )}
                              {multService !== 0 && (
                                <div className={`flex-1 min-w-[85px] flex justify-center items-center px-2.5 py-1 rounded-lg border ${multService > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'} flex items-center gap-1`}>
                                  {multService > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  <span>Service</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Gauges */}
              <div className="flex-1 flex flex-col gap-3.5 w-full lg:sticky lg:top-20">
                <GaugeCard title="Budget Restant" value={budget} icon={Landmark} colorClass="text-emerald-400" borderGlow="shadow-[0_0_20px_rgba(16,185,129,0.15)]" type="currency" />
                <GaugeCard title="Agents municipaux" value={agentsSat} icon={Users} colorClass="text-blue-400" borderGlow="shadow-[0_0_20px_rgba(59,130,246,0.15)]" type="percent" />
                <GaugeCard title="Conseil Municipal" value={elusSat} icon={Building2} colorClass="text-purple-400" borderGlow="shadow-[0_0_20px_rgba(168,85,247,0.15)]" type="percent" />
                <GaugeCard title="Qualité du Service" value={servicePub} icon={HeartHandshake} colorClass="text-amber-400" borderGlow="shadow-[0_0_20px_rgba(245,158,11,0.15)]" type="percent" />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TycoonCollectivite;
